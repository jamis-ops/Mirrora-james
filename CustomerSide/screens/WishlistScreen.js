// screens/WishlistScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import Toast from "react-native-toast-message";
import { useFonts as useLeagueSpartan, LeagueSpartan_700Bold } from "@expo-google-fonts/league-spartan";
import { useFonts as useMontserrat, Montserrat_400Regular, Montserrat_600SemiBold } from "@expo-google-fonts/montserrat";

// Firebase
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { auth, db } from "../Backend/firebaseConfig";

const { width } = Dimensions.get("window");

export default function WishlistScreen() {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [leagueSpartanLoaded] = useLeagueSpartan({ LeagueSpartan_700Bold });
  const [montserratLoaded] = useMontserrat({ Montserrat_400Regular, Montserrat_600SemiBold });

  useEffect(() => {
  const user = auth.currentUser;
  if (!user) {
    setLoading(false);
    return;
  }

  // Correct path: match HomeScreen
  const q = collection(db, "users", user.uid, "wishlist");

  const unsub = onSnapshot(
    q,
    (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    },
    (err) => {
      console.error("Wishlist onSnapshot error:", err);
      setLoading(false);
    }
  );

  return () => unsub();
}, []);


  const removeFromWishlist = async (itemId) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "wishlist", itemId));

      Toast.show({
        type: "info",
        text1: "Removed from Wishlist",
        text2: "The item has been removed from your list.",
        position: "top",
      });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to remove item. Please try again.",
        position: "top",
      });
    }
  };

  // === New: addToCart for wishlist items ===
  const addToCart = async (product) => {
    const user = auth.currentUser;
    if (!user) {
      Toast.show({
        type: "info",
        text1: "Please sign in",
        text2: "You need to sign in to add items to your cart.",
        position: "top",
      });
      return;
    }

    const itemRef = doc(db, "carts", user.uid, "items", product.productId || product.id);

    try {
      const snap = await getDoc(itemRef);
      if (snap.exists()) {
        // increment quantity
        await updateDoc(itemRef, { quantity: increment(1) });

        Toast.show({
          type: "info",
          text1: "🛒 Cart Updated",
          text2: `${product.name} quantity increased.`,
          position: "top",
        });
      } else {
        // create new cart item
        await setDoc(itemRef, {
          productId: product.productId || product.id,
          name: product.name || "",
          price: product.price || 0,
          imageUrl: product.imageUrl || "",
          quantity: 1,
          addedAt: serverTimestamp(),
        });

        Toast.show({
          type: "success",
          text1: "🛒 Added to Cart",
          text2: `${product.name} is now in your cart.`,
          position: "top",
        });
      }
    } catch (err) {
      console.error("addToCart error:", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to update cart. Try again later.",
        position: "top",
      });
    }
  };

  if (!leagueSpartanLoaded || !montserratLoaded) return null;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A68B69" />
        <Text style={styles.loadingText}>Loading Wishlist...</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.productCard}>
      <Image source={{ uri: item.imageUrl }} style={styles.productImage} />

      {/* Permanent heart (remove) */}
      <TouchableOpacity
        style={styles.wishlistHeartIcon}
        onPress={() => removeFromWishlist(item.id)}
      >
        <Ionicons name="heart" size={24} color="red" />
      </TouchableOpacity>

      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>₱ {item.price}</Text>

        <View style={{ flexDirection: "row", marginTop: 8, alignItems: "center", justifyContent: "space-between" }}>
          {/* Add to Cart button (small) */}
          <TouchableOpacity style={styles.cartIconContainer} onPress={() => addToCart(item)}>
            <Icon name="cart-plus" size={18} color="#000" />
          </TouchableOpacity>

          {/* Optional: a "View" or "Customize" button could go here */}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Icon name="chevron-left" size={32} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Wishlist</Text>

        {/* Header cart icon now navigates to CartScreen */}
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("CartScreen")}>
          <Icon name="cart-outline" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={renderItem}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <Text style={{ textAlign: "center", marginTop: 20, fontFamily: "Montserrat_400Regular" }}>
            Your wishlist is empty
          </Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9F9" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontFamily: "LeagueSpartan_700Bold",
    fontSize: 22,
    color: "#000",
  },
  iconButton: { padding: 5 },
  flatListContent: { paddingHorizontal: 15, paddingTop: 10 },
  productCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    margin: 7,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  productImage: { width: "100%", height: 180, resizeMode: "cover" },
  wishlistHeartIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 20,
    padding: 5,
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 14,
    color: "#000",
  },
  productPrice: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 14,
    color: "#000",
    marginTop: 5,
    marginBottom: 5,
  },
  cartIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontFamily: "Montserrat_400Regular",
  },
});
