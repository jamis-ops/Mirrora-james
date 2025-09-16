import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useFonts as useLeagueSpartan, LeagueSpartan_700Bold } from "@expo-google-fonts/league-spartan";
import { useFonts as useMontserrat, Montserrat_400Regular, Montserrat_600SemiBold } from "@expo-google-fonts/montserrat";

// Firebase
import { auth, db } from "../Backend/firebaseConfig";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
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

    // FIXED: Pass the selected items and total amount directly to CheckoutScreen
    navigation.navigate("CheckoutScreen", { 
      selectedItems: selectedItems,
      totalAmount: totalAmount 
    });
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

        <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/80' }} style={styles.cartItemImage} />

        <View style={styles.cartItemDetails}>
          <Text style={styles.cartItemName}>{item.name}</Text>
          <Text style={styles.cartItemSize}>{item.size || 'Standard'}</Text>
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

  // Enhanced Empty Cart Component
  const EmptyCartComponent = () => (
    <View style={styles.emptyCartContainer}>
      <View style={styles.emptyCartIconContainer}>
        <View style={styles.cartIconBackground}>
          <Icon name="cart-outline" size={60} color="#A68B69" />
        </View>
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        <View style={styles.decorativeCircle3} />
      </View>
      
      <Text style={styles.emptyCartTitle}>Your Cart is Empty</Text>
      <Text style={styles.emptyCartSubtitle}>
        Looks like you haven't added{'\n'}anything to your cart yet
      </Text>
      
      <View style={styles.emptyCartSuggestions}>
        <TouchableOpacity
          style={styles.suggestionItem}
          onPress={() => navigation.navigate('Wishlist')}
        >
          <Icon name="heart" size={16} color="#FF6B6B" />
          <Text style={styles.suggestionText}>Check your wishlist</Text>
        </TouchableOpacity>
        <View style={styles.suggestionItem}>
          <Icon name="star" size={16} color="#FFD93D" />
          <Text style={styles.suggestionText}>Browse featured items</Text>
        </View>
        <View style={styles.suggestionItem}>
          <Icon name="fire" size={16} color="#FF8C42" />
          <Text style={styles.suggestionText}>Explore trending products</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.startShoppingButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.startShoppingButtonText}>Start Shopping</Text>
        <Icon name="arrow-right" size={18} color="#fff" style={{ marginLeft: 8 }} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.browseButton}
        onPress={() => navigation.navigate('Categories')}
      >
        <Text style={styles.browseButtonText}>Browse Categories</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A68B69" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cart</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Wishlist')}>
          <Icon name="heart-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        renderItem={renderCartItem}
        contentContainerStyle={styles.cartList}
        ListEmptyComponent={EmptyCartComponent}
      />

      {/* Bottom bar - only show when cart has items */}
      {cartItems.length > 0 && (
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
      )}
    </View>
  );
}

// Add the missing styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 20,
    color: '#000',
  },
  cartList: {
    paddingTop: 10,
    flexGrow: 1,
  },
  cartItemContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 5,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  checkboxContainer: {
    marginRight: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedCheckbox: {
    backgroundColor: '#A68B69',
    borderColor: '#A68B69',
  },
  cartItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  cartItemDetails: {
    flex: 1,
  },
  cartItemName: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 16,
    color: '#000',
  },
  cartItemSize: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  cartItemPrice: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 16,
    color: '#A68B69',
    marginTop: 5,
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 16,
    marginHorizontal: 15,
    minWidth: 20,
    textAlign: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  selectAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectAllText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 16,
    marginLeft: 8,
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalAmountText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 18,
    color: '#A68B69',
    marginRight: 15,
  },
  checkoutButton: {
    backgroundColor: '#A68B69',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
  },
  disabledButton: {
    backgroundColor: '#CCC',
  },
  checkoutButtonText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 16,
    color: '#fff',
  },
  // Empty cart styles
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyCartIconContainer: {
    position: 'relative',
    marginBottom: 30,
  },
  cartIconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(166, 139, 105, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(166, 139, 105, 0.3)',
    top: -10,
    right: 10,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: 'rgba(166, 139, 105, 0.4)',
    bottom: 10,
    left: -5,
  },
  decorativeCircle3: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(166, 139, 105, 0.2)',
    top: 20,
    left: -10,
  },
  emptyCartTitle: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 24,
    color: '#333',
    marginBottom: 10,
  },
  emptyCartSubtitle: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  emptyCartSuggestions: {
    alignItems: 'center',
    marginBottom: 40,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  suggestionText: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  startShoppingButton: {
    flexDirection: 'row',
    backgroundColor: '#A68B69',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  startShoppingButtonText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 16,
    color: '#fff',
  },
  browseButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  browseButtonText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 16,
    color: '#A68B69',
  },
});