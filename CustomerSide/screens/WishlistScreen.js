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

// Fonts
import {
  useFonts,
  LeagueSpartan_700Bold,
} from "@expo-google-fonts/league-spartan";
import {
  Montserrat_400Regular,
  Montserrat_600SemiBold,
} from "@expo-google-fonts/montserrat";

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

// Empty State Component
const EmptyWishlistState = ({ navigation }) => (
  <View style={styles.emptyStateContainer}>
    <View style={styles.emptyIconContainer}>
      <Ionicons name="heart-outline" size={80} color="#E0D3C7" />
      <View style={styles.sparkleContainer}>
        <Icon
          name="star-four-points"
          size={16}
          color="#A68B69"
          style={[styles.sparkle, styles.sparkle1]}
        />
        <Icon
          name="star-four-points"
          size={12}
          color="#D4B996"
          style={[styles.sparkle, styles.sparkle2]}
        />
        <Icon
          name="star-four-points"
          size={14}
          color="#A68B69"
          style={[styles.sparkle, styles.sparkle3]}
        />
      </View>
    </View>

    <Text style={styles.emptyTitle}>Your Wishlist Awaits</Text>
    <Text style={styles.emptySubtitle}>
      Save items you love and never lose track of your favorites
    </Text>

    <TouchableOpacity
      style={styles.exploreButton}
      onPress={() => navigation.navigate("Home")}
    >
      <Icon name="compass-outline" size={20} color="#FFF" />
      <Text style={styles.exploreButtonText}>Start Exploring</Text>
    </TouchableOpacity>

    <View style={styles.tipsContainer}>
      <View style={styles.tipItem}>
        <Icon name="heart" size={16} color="#A68B69" />
        <Text style={styles.tipText}>Tap the heart icon on any product</Text>
      </View>
    </View>
  </View>
);

export default function WishlistScreen() {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ⭐ FIXED: Combined font loading into a single hook for cleaner code
  const [fontsLoaded] = useFonts({
    LeagueSpartan_700Bold,
    Montserrat_400Regular,
    Montserrat_600SemiBold,
  });

  // ⭐ FIXED: The database path to match ProductScreen.js
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    // ⭐ CORRECTED PATH: Listen to "users/{userId}/wishlist"
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

  // ⭐ FIXED: The database path to match ProductScreen.js
  const removeFromWishlist = async (itemId) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      // ⭐ CORRECTED PATH: Use "users/{userId}/wishlist/{itemId}" for deletion
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

  // Add wishlist item to cart (your original code, which is correct)
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

    const itemRef = doc(db, "carts", user.uid, "items", product.id);

    try {
      const snap = await getDoc(itemRef);
      if (snap.exists()) {
        await updateDoc(itemRef, { quantity: increment(1) });

        Toast.show({
          type: "info",
          text1: "🛒 Cart Updated",
          text2: `${product.name} quantity increased.`,
          position: "top",
        });
      } else {
        await setDoc(itemRef, {
          productId: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
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

  if (!fontsLoaded) return null;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A68B69" />
        <Text style={styles.loadingText}>Loading Wishlist...</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate("ProductScreen", { product: item })}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
        <View style={styles.gradientOverlay} />
        <TouchableOpacity
          style={styles.wishlistHeartIcon}
          onPress={() => removeFromWishlist(item.id)}
          activeOpacity={0.8}
        >
          <View style={styles.heartBackground}>
            <Ionicons name="heart" size={20} color="#FF6B6B" />
          </View>
        </TouchableOpacity>
        <View style={styles.premiumBadge}>
          <Icon name="star" size={12} color="#FFD700" />
          <Text style={styles.badgeText}>Loved</Text>
        </View>
      </View>
      <View style={styles.productContent}>
        <View style={styles.productHeader}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <View style={styles.priceContainer}>
            <Text style={styles.currencySymbol}>₱</Text>
            <Text style={styles.productPrice}>{item.price}</Text>
          </View>
        </View>
        <View style={styles.actionRow}>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>4.7</Text>
          </View>
          <TouchableOpacity
            style={styles.addToCartBtn}
            onPress={() => addToCart(item)}
            activeOpacity={0.8}
          >
            <Icon name="cart-plus" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.cornerDecoration} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconButton}
        >
          <Icon name="chevron-left" size={32} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wishlist</Text>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate("Cart")}
        >
          <Icon name="cart-outline" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={renderItem}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => <EmptyWishlistState navigation={navigation} />}
        columnWrapperStyle={items.length > 0 ? styles.row : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#FFF",
  },
  headerTitle: {
    fontFamily: "LeagueSpartan_700Bold",
    fontSize: 22,
    color: "#000",
  },
  iconButton: { padding: 5 },
  flatListContent: {
    paddingHorizontal: 12,
    paddingTop: 15,
    paddingBottom: 20,
  },
  row: {
    justifyContent: "space-between",
    marginHorizontal: 3,
  },
  productCard: {
    width: (width - 36) / 2,
    height: 280,
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
    overflow: "hidden",
    position: "relative",
  },
  imageContainer: {
    height: 160,
    position: "relative",
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  wishlistHeartIcon: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
  },
  heartBackground: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  premiumBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  badgeText: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 10,
    color: "#333",
    marginLeft: 3,
  },
  productContent: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  productHeader: {
    marginBottom: 8,
  },
  productName: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 13,
    color: "#2C3E50",
    lineHeight: 18,
    marginBottom: 6,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  currencySymbol: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 12,
    color: "#A68B69",
    marginRight: 2,
  },
  productPrice: {
    fontFamily: "LeagueSpartan_700Bold",
    fontSize: 16,
    color: "#A68B69",
    fontWeight: "700",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FFE082",
  },
  ratingText: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 11,
    color: "#F57F17",
    marginLeft: 3,
  },
  addToCartBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#A68B69",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#A68B69",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  cornerDecoration: {
    position: "absolute",
    bottom: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E8F4FD",
    opacity: 0.6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  loadingText: {
    marginTop: 10,
    fontFamily: "Montserrat_400Regular",
    color: "#666",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIconContainer: { position: "relative", marginBottom: 30 },
  sparkleContainer: {
    position: "absolute",
    width: 120,
    height: 120,
    top: -20,
    left: -20,
  },
  sparkle: { position: "absolute" },
  sparkle1: { top: 15, right: 10 },
  sparkle2: { bottom: 25, left: 15 },
  sparkle3: { top: 35, left: 5 },
  emptyTitle: {
    fontFamily: "LeagueSpartan_700Bold",
    fontSize: 24,
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  emptySubtitle: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  exploreButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#A68B69",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 40,
    shadowColor: "#A68B69",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  exploreButtonText: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 16,
    color: "#FFF",
    marginLeft: 8,
  },
  tipsContainer: { alignItems: "flex-start" },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  tipText: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 14,
    color: "#666",
    marginLeft: 10,
  },
});