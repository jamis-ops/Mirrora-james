// screens/ProductScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import Toast from "react-native-toast-message";

// Firebase imports
import {
  getDoc,
  doc,
  setDoc,
  updateDoc,
  increment,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../Backend/firebaseConfig";

// Font imports
import {
  useFonts,
  LeagueSpartan_700Bold,
} from "@expo-google-fonts/league-spartan";
import {
  Montserrat_400Regular,
  Montserrat_600SemiBold,
} from "@expo-google-fonts/montserrat";

const { width } = Dimensions.get("window");

export default function ProductScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { product } = route.params;

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Load all fonts at once
  const [fontsLoaded] = useFonts({
    LeagueSpartan_700Bold,
    Montserrat_400Regular,
    Montserrat_600SemiBold,
  });

  // Check if the item is already in the wishlist on component mount
  useEffect(() => {
    const checkWishlistStatus = async () => {
      const user = auth.currentUser;
      if (!user) {
        return;
      }
      try {
        const docRef = doc(db, "users", user.uid, "wishlist", product.id);
        const docSnap = await getDoc(docRef);
        setIsWishlisted(docSnap.exists());
      } catch (error) {
        console.error("Error checking wishlist status:", error);
      }
    };
    checkWishlistStatus();
  }, [product.id]);

  // Handle adding to cart - FIXED
  const handleAddToCart = async () => {
    const user = auth.currentUser;
    if (!user) {
      Toast.show({
        type: "error",
        text1: "Login Required",
        text2: "Please sign in to add items to your cart.",
        position: "top",
      });
      return;
    }

    try {
      const cartRef = doc(db, "carts", user.uid, "items", product.id);
      const cartSnap = await getDoc(cartRef);

      if (cartSnap.exists()) {
        await updateDoc(cartRef, {
          quantity: increment(1),
        });
        Toast.show({
          type: "info",
          text1: "Cart Updated",
          text2: `${product.name} quantity increased.`,
          position: "top",
        });
      } else {
        await setDoc(cartRef, {
          productId: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          description: product.description || "",
          quantity: 1,
          addedAt: serverTimestamp(),
        });
        Toast.show({
          type: "success",
          text1: "Added to Cart",
          text2: `${product.name} has been added to your cart.`,
          position: "top",
        });
      }
    } catch (error) {
      console.error("❌ Error adding to cart:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to add item. Please try again.",
        position: "top",
      });
    }
  };

  // Fixed: handle toggling the wishlist status
  const handleWishlistToggle = async () => {
    const user = auth.currentUser;
    if (!user) {
      Toast.show({
        type: "error",
        text1: "Login Required",
        text2: "Please sign in to manage your wishlist.",
        position: "top",
      });
      return;
    }

    try {
      const wishlistRef = doc(db, "users", user.uid, "wishlist", product.id);
      if (isWishlisted) {
        await deleteDoc(wishlistRef);
        setIsWishlisted(false);
        Toast.show({
          type: "info",
          text1: "Removed from Wishlist",
          text2: "The item has been removed from your list.",
          position: "top",
        });
      } else {
        // FIXED: Explicitly check for 'price' and set a default if it's missing to prevent Firebase errors.
        const productData = {
          ...product,
          price: product.price || 0, // Ensure price is a number, not undefined
          addedAt: serverTimestamp(),
        };
        await setDoc(wishlistRef, productData);
        setIsWishlisted(true);
        Toast.show({
          type: "success",
          text1: "Added to Wishlist",
          text2: `${product.name} has been added to your wishlist.`,
          position: "top",
        });
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to update wishlist. Please try again.",
        position: "top",
      });
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Enhanced Image Container with Overlay */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: product.imageUrl }} 
            style={styles.productImage}
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Dark overlay for better header visibility */}
          <View style={styles.darkOverlay} />
          
          {/* Enhanced Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
              <Icon name="chevron-left" size={28} color="#fff" />
            </TouchableOpacity>
            
            {/* FIXED: Navigate to WishlistScreen */}
            <TouchableOpacity onPress={() => navigation.navigate("WishlistScreen")} style={styles.headerButton}>
              <Ionicons name="heart-outline" size={26} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Floating wishlist button */}
          <TouchableOpacity style={styles.floatingWishlistButton} onPress={handleWishlistToggle}>
            <Ionicons
              name={isWishlisted ? "heart" : "heart-outline"}
              size={24}
              color={isWishlisted ? "#FF6B6B" : "#666"}
            />
          </TouchableOpacity>
        </View>

        {/* Enhanced Details Container */}
        <View style={styles.detailsContainer}>
          <View style={styles.titleSection}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productPrice}>₱ {product.price}</Text>
          </View>

          <TouchableOpacity style={styles.customizeButton}>
            <Icon name="palette-outline" size={16} color="#A68B69" />
            <Text style={styles.customizeText}>Customize</Text>
          </TouchableOpacity>

          <View style={styles.descriptionCard}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.productDescription}>
              {product.description ||
                "Floor standing mirrors are not only convenient for you to appreciate your whole body, but also can decorate your space."}
            </Text>
          </View>

          {/* Enhanced Info Cards */}
          <View style={styles.infoCardsContainer}>
            <View style={styles.infoCard}>
              <Icon name="ruler" size={20} color="#A68B69" />
              <Text style={styles.infoLabel}>Dimensions</Text>
              <Text style={styles.infoValue}>
                {product.dimensions || '60.2" x 51.2"'}
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Icon name="weight" size={20} color="#A68B69" />
              <Text style={styles.infoLabel}>Weight</Text>
              <Text style={styles.infoValue}>
                {product.weight || "20.2 lbs"}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Enhanced Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.favoriteButton} onPress={handleWishlistToggle}>
          <Ionicons
            name={isWishlisted ? "heart" : "heart-outline"}
            size={26}
            color={isWishlisted ? "#FF6B6B" : "#A68B69"}
          />
        </TouchableOpacity>
        
        {/* FIXED: Navigate to CartScreen */}
        <TouchableOpacity style={styles.addToCartButton} onPress={() => navigation.navigate("CartScreen")}>
          <Icon name="cart-plus" size={20} color="#fff" style={styles.cartIcon} />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#FAFAFA" 
  },
  imageContainer: { 
    position: "relative",
    height: 460,
  },
  darkOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 1,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    zIndex: 2,
  },
  headerButton: { 
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  floatingWishlistButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.95)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  productImage: { 
    width: "100%", 
    height: "100%", 
    resizeMode: "cover" 
  },
  detailsContainer: { 
    paddingHorizontal: 24, 
    paddingTop: 24,
    paddingBottom: 20,
  },
  titleSection: {
    marginBottom: 16,
  },
  productName: { 
    fontFamily: "LeagueSpartan_700Bold", 
    fontSize: 28,
    color: "#1A1A1A",
    marginBottom: 8,
  },
  productPrice: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 24,
    color: "#A68B69",
  },
  customizeButton: { 
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(166, 139, 105, 0.1)",
    borderRadius: 20,
    marginBottom: 24,
  },
  customizeText: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 14,
    color: "#A68B69",
    marginLeft: 6,
  },
  descriptionCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 16,
    color: "#1A1A1A",
    marginBottom: 12,
  },
  productDescription: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
  },
  infoCardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  infoLabel: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 12,
    color: "#666",
    marginTop: 8,
    marginBottom: 4,
  },
  infoValue: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 14,
    color: "#1A1A1A",
    textAlign: "center",
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  favoriteButton: {
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 28,
    backgroundColor: "#F8F8F8",
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  addToCartButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#A68B69",
    height: 56,
    borderRadius: 28,
    marginLeft: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#A68B69",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cartIcon: {
    marginRight: 8,
  },
  addToCartText: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 16,
    color: "#fff",
  },
});