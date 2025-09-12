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
const itemWidth = (width - 45) / 2; // Account for padding and gap

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

    // Correct path: match consistent structure
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

  // Fixed: Add to cart functionality
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

    // Fixed: Use consistent path structure
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
        <Text style={styles.loadingText}>Loading your wishlist...</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={[styles.productCard, { width: itemWidth }]}>
      {/* Enhanced Image Container */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
        
        {/* Subtle overlay for better icon visibility */}
        <View style={styles.imageOverlay} />
        
        {/* Heart icon for removing from wishlist */}
        <TouchableOpacity
          style={styles.wishlistHeartIcon}
          onPress={() => removeFromWishlist(item.id)}
        >
          <Ionicons name="heart" size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      {/* Enhanced Product Info */}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productPrice}>₱ {item.price}</Text>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.cartButton} onPress={() => addToCart(item)}>
            <Icon name="cart-plus" size={16} color="#A68B69" />
            <Text style={styles.cartButtonText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyStateIcon}>
        <Ionicons name="heart-outline" size={64} color="#E0E0E0" />
      </View>
      <Text style={styles.emptyStateTitle}>Your wishlist is empty</Text>
      <Text style={styles.emptyStateSubtitle}>
        Save items you love by tapping the heart icon
      </Text>
      <TouchableOpacity 
        style={styles.browseCatalogButton}
        onPress={() => navigation.navigate("HomeScreen")}
      >
        <Text style={styles.browseCatalogText}>Browse Catalog</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Enhanced Header with Solid Background */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Icon name="chevron-left" size={28} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>My Wishlist</Text>

          {/* Fixed: Navigate to CartScreen */}
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => navigation.navigate("CartScreen")}
          >
            <Icon name="cart-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Items Count */}
      {items.length > 0 && (
        <View style={styles.itemsCountContainer}>
          <Text style={styles.itemsCountText}>
            {items.length} {items.length === 1 ? 'item' : 'items'} saved
          </Text>
        </View>
      )}

      {/* List */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.flatListContent,
          items.length === 0 && styles.flatListContentEmpty
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        columnWrapperStyle={items.length > 0 ? styles.row : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#FAFAFA" 
  },
  headerContainer: {
    backgroundColor: "#A68B69",
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontFamily: "LeagueSpartan_700Bold",
    fontSize: 24,
    color: "#fff",
  },
  headerButton: { 
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  itemsCountContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  itemsCountText: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 14,
    color: "#666",
  },
  flatListContent: { 
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  flatListContentEmpty: {
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-between',
  },
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  productImage: { 
    width: "100%", 
    height: "100%", 
    resizeMode: "cover" 
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  wishlistHeartIcon: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productInfo: {
    padding: 16,
  },
  productName: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 15,
    color: "#1A1A1A",
    marginBottom: 6,
    lineHeight: 20,
  },
  productPrice: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 16,
    color: "#A68B69",
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cartButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(166, 139, 105, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(166, 139, 105, 0.3)",
    flex: 1,
    justifyContent: "center",
  },
  cartButtonText: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 12,
    color: "#A68B69",
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  loadingText: {
    marginTop: 16,
    fontFamily: "Montserrat_400Regular",
    fontSize: 16,
    color: "#666",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontFamily: "LeagueSpartan_700Bold",
    fontSize: 24,
    color: "#1A1A1A",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyStateSubtitle: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  browseCatalogButton: {
    backgroundColor: "#A68B69",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: "#A68B69",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  browseCatalogText: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
  },
});