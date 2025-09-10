import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useFonts as useLeagueSpartan, LeagueSpartan_700Bold } from "@expo-google-fonts/league-spartan";
import { useFonts as useMontserrat, Montserrat_400Regular, Montserrat_600SemiBold } from "@expo-google-fonts/montserrat";
import BottomNavigationBar from '../components/BottomNavigationBar';

// Firebase
import { auth, db } from "../Backend/firebaseConfig";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";

export default function CartScreen() {
  const navigation = useNavigation();
  const [leagueSpartanLoaded] = useLeagueSpartan({ LeagueSpartan_700Bold });
  const [montserratLoaded] = useMontserrat({ Montserrat_400Regular, Montserrat_600SemiBold });

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMap, setSelectedMap] = useState({});
  const currentUserRef = useRef(null);

  // Ensure user exists (anonymous fallback)
  const ensureUser = async () => {
    if (auth.currentUser) return auth.currentUser;
    try {
      const cred = await signInAnonymously(auth);
      return cred.user;
    } catch (err) {
      console.error("Anonymous sign-in failed:", err);
      return null;
    }
  };

  useEffect(() => {
    let unsub = null;
    (async () => {
      const user = await ensureUser();
      currentUserRef.current = user;
      if (!user) {
        setLoading(false);
        setCartItems([]);
        return;
      }

      const itemsRef = collection(db, "carts", user.uid, "items");
      unsub = onSnapshot(itemsRef, (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setCartItems(data);

        // initialize selectedMap for new items if not present (default true)
        setSelectedMap((prev) => {
          const next = { ...prev };
          data.forEach((it) => {
            if (next[it.id] === undefined) next[it.id] = true;
          });
          return next;
        });

        setLoading(false);
      }, (err) => {
        console.error("Cart onSnapshot error:", err);
        setLoading(false);
      });
    })();

    return () => {
      if (unsub) unsub();
    };
  }, []);

  if (!leagueSpartanLoaded || !montserratLoaded) return null;

  const toggleSelect = (id) => {
    setSelectedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectAll = () => {
    const all = cartItems.every(it => selectedMap[it.id]);
    const next = {};
    cartItems.forEach(it => {
      next[it.id] = !all;
    });
    setSelectedMap(next);
  };

  const incrementQuantity = async (itemId, delta) => {
    const user = currentUserRef.current;
    if (!user) return;
    try {
      const itemDoc = doc(db, "carts", user.uid, "items", itemId);
      const item = cartItems.find(i => i.id === itemId);
      const newQty = Math.max(1, (item?.quantity || 1) + delta);
      await updateDoc(itemDoc, { quantity: newQty });
    } catch (err) {
      console.error("incrementQuantity error:", err);
      Alert.alert("Error", "Could not update quantity");
    }
  };

  const removeItem = async (itemId) => {
    const user = currentUserRef.current;
    if (!user) return;
    try {
      await deleteDoc(doc(db, "carts", user.uid, "items", itemId));
      setSelectedMap((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
    } catch (err) {
      console.error("removeItem error:", err);
      Alert.alert("Error", "Could not remove item");
    }
  };

  const selectedItems = cartItems.filter(it => selectedMap[it.id]);
  const totalAmount = selectedItems.reduce((s, it) => s + (Number(it.price || 0) * Number(it.quantity || 0)), 0);

  const handleCheckout = async () => {
    const user = currentUserRef.current;
    if (!user) {
      Alert.alert("Sign in required", "Please sign in to checkout");
      return;
    }
    if (selectedItems.length === 0) {
      Alert.alert("No items selected", "Please select items to checkout");
      return;
    }

    try {
      // create order under orders/{uid}/orders/{orderId}
      const ordersCollection = collection(db, "orders", user.uid, "orders");
      const orderRef = collection(db, "orders"); // root collection
await setDoc(doc(orderRef), {
    items: selectedItems,
    total: totalAmount,
    status: "Pending",
    createdAt: serverTimestamp(),
    userID: user.uid,  // important!
});

      // delete only selected items from cart using batch
      const batch = writeBatch(db);
      selectedItems.forEach((it) => {
        const itemRef = doc(db, "carts", user.uid, "items", it.id);
        batch.delete(itemRef);
      });
      await batch.commit();

      Alert.alert("Order placed", "Your order has been created.");
      navigation.navigate("OrderConfirmationScreen", { orderId: orderRef.id });
    } catch (err) {
      console.error("checkout error:", err);
      Alert.alert("Error", "Could not complete checkout");
    }
  };

  const renderCartItem = ({ item }) => {
    const isSelected = !!selectedMap[item.id];
    return (
      <View style={styles.cartItemContainer}>
        <TouchableOpacity onPress={() => toggleSelect(item.id)} style={styles.checkboxContainer}>
          <View style={[styles.checkbox, isSelected && styles.checkedCheckbox]}>
            {isSelected && <Icon name="check" size={16} color="#fff" />}
          </View>
        </TouchableOpacity>

        <Image source={{ uri: item.imageUrl }} style={styles.cartItemImage} />
        <View style={styles.cartItemDetails}>
          <Text style={styles.cartItemName}>{item.name}</Text>
          <Text style={styles.cartItemSize}>{/* optional size */}</Text>
          <Text style={styles.cartItemPrice}>₱ {Number(item.price).toLocaleString()}</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <TouchableOpacity onPress={() => incrementQuantity(item.id, -1)} style={styles.quantityButton}>
              <Icon name="minus" size={16} color="#000" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{item.quantity || 1}</Text>
            <TouchableOpacity onPress={() => incrementQuantity(item.id, 1)} style={styles.quantityButton}>
              <Icon name="plus" size={16} color="#000" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => removeItem(item.id)} style={{ marginLeft: 12 }}>
              <Icon name="trash-can-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A68B69" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cart</Text>
        <TouchableOpacity>
          <Icon name="heart-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        renderItem={renderCartItem}
        contentContainerStyle={styles.cartList}
        ListEmptyComponent={() => (
          <View style={{ padding: 20 }}>
            <Text style={{ textAlign: 'center' }}>Your cart is empty</Text>
          </View>
        )}
      />

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={handleSelectAll} style={styles.selectAllContainer}>
          <View style={[styles.checkbox, cartItems.length > 0 && cartItems.every(item => selectedMap[item.id]) && styles.checkedCheckbox]}>
            {cartItems.length > 0 && cartItems.every(item => selectedMap[item.id]) && <Icon name="check" size={16} color="#fff" />}
          </View>
          <Text style={styles.selectAllText}>All</Text>
        </TouchableOpacity>

        <View style={styles.totalContainer}>
          <Text style={styles.totalAmountText}>₱ {totalAmount.toLocaleString()}</Text>
          <TouchableOpacity
            style={[styles.checkoutButton, selectedItems.length === 0 && styles.disabledButton]}
            disabled={selectedItems.length === 0}
            onPress={handleCheckout}
          >
            <Text style={styles.checkoutButtonText}>
              Check Out ({selectedItems.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <BottomNavigationBar navigation={navigation} />
    </View>
  );
}

/* Reuse your earlier styles naming/values */
const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: { fontFamily: 'LeagueSpartan_700Bold', fontSize: 22, color: '#000' },
  cartList: { paddingTop: 10, paddingHorizontal: 20, paddingBottom: 120 },
  cartItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  checkboxContainer: { paddingRight: 10 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkedCheckbox: { backgroundColor: '#A68B69', borderColor: '#A68B69' },
  cartItemImage: { width: 80, height: 80, borderRadius: 10, marginRight: 15, resizeMode: 'cover' },
  cartItemDetails: { flex: 1 },
  cartItemName: { fontFamily: 'Montserrat_600SemiBold', fontSize: 16, color: '#000' },
  cartItemSize: { fontFamily: 'Montserrat_400Regular', fontSize: 12, color: '#777' },
  cartItemPrice: { fontFamily: 'Montserrat_600SemiBold', fontSize: 16, color: '#A68B69', marginTop: 5 },
  quantityButton: { padding: 8 },
  quantityText: { paddingHorizontal: 12, fontFamily: 'Montserrat_600SemiBold' },
  bottomBar: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    elevation: 10,
  },
  selectAllContainer: { flexDirection: 'row', alignItems: 'center' },
  selectAllText: { fontFamily: 'Montserrat_400Regular', fontSize: 14, color: '#000', marginLeft: 8 },
  totalContainer: { flexDirection: 'row', alignItems: 'center' },
  totalAmountText: { fontFamily: 'LeagueSpartan_700Bold', fontSize: 18, color: '#000', marginRight: 15 },
  checkoutButton: { backgroundColor: '#A68B69', borderRadius: 25, paddingVertical: 12, paddingHorizontal: 25 },
  checkoutButtonText: { fontFamily: 'Montserrat_600SemiBold', fontSize: 14, color: '#fff' },
  disabledButton: { backgroundColor: '#D9D9D9' },
});
