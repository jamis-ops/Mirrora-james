import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
  FlatList,
  Dimensions,
  ScrollView,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Toast from "react-native-toast-message";

// Firebase
import {
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
} from "firebase/firestore";
import { auth, db } from "../Backend/firebaseConfig";

// Fonts
import {
  useFonts as useLeagueSpartan,
  LeagueSpartan_700Bold,
} from "@expo-google-fonts/league-spartan";
import {
  useFonts as useMontserrat,
  Montserrat_400Regular,
  Montserrat_600SemiBold,
} from "@expo-google-fonts/montserrat";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// Local placeholder image
const PLACEHOLDER = require("../assets/placeholder.png");

// Helper for safe images
const safeImageSource = (src) => {
  if (typeof src === "number") return src;
  if (src && typeof src === "object" && typeof src.uri === "string" && src.uri.trim() !== "") {
    return src;
  }
  if (typeof src === "string" && src.trim() !== "") {
    return { uri: src.trim() };
  }
  return null;
};

// Categories
const CATEGORIES = [
 
];

// Dropdown component
const CategoriesDropdown = ({ isVisible, onClose, onSelectCategory }) => {
  if (!isVisible) return null;

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.dropdownOverlay}>
        <View style={styles.dropdownContainer}>
          {CATEGORIES.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={styles.dropdownItem}
              onPress={() => {
                onSelectCategory(category);
                onClose();
              }}
            >
              <Text style={styles.dropdownText}>{category}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default function HomeScreen() {
  const navigation = useNavigation();

  const [activeBanner, setActiveBanner] = useState(0);
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Most Popular");
  const [isLoading, setIsLoading] = useState(true);
  const [bannersLoading, setBannersLoading] = useState(true);

  // Fonts
  const [leagueSpartanLoaded] = useLeagueSpartan({ LeagueSpartan_700Bold });
  const [montserratLoaded] = useMontserrat({
    Montserrat_400Regular,
    Montserrat_600SemiBold,
  });

  // Fetch banners with real-time listener
  useEffect(() => {
    setBannersLoading(true);
    
    const unsubscribe = onSnapshot(
      query(collection(db, "banners")),
      (snapshot) => {
        const bannerList = snapshot.docs
          .map((d) => ({
            id: d.id,
            ...d.data(),
          }))
          .filter(banner => banner.active !== false); // Filter out inactive banners
          
        console.log("Banners retrieved:", bannerList); // Debug log
        setBanners(bannerList);
        setBannersLoading(false);
      },
      (error) => {
        console.error("Error fetching banners:", error);
        setBannersLoading(false);
      }
    );

    // Clean up the listener when component unmounts
    return () => unsubscribe();
  }, []);

  // Fetch products based on selected category
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        let productList = [];
        
        if (selectedCategory === "Most Popular") {
          // Fetch most popular products based on order count
          const ordersRef = collection(db, "orders");
          const ordersSnapshot = await getDocs(ordersRef);
          
          // Count product orders
          const productOrderCount = {};
          
          ordersSnapshot.forEach((orderDoc) => {
            const orderData = orderDoc.data();
            if (orderData.items && Array.isArray(orderData.items)) {
              orderData.items.forEach((item) => {
                if (item.productId) {
                  productOrderCount[item.productId] = (productOrderCount[item.productId] || 0) + (item.quantity || 1);
                }
              });
            }
          });
          
          // Get all products
          const productsRef = collection(db, "products");
          const productsSnapshot = await getDocs(productsRef);
          
          // Map products with their order counts
          productList = productsSnapshot.docs.map((d) => {
            const productData = d.data();
            return {
              id: d.id,
              ...productData,
              orderCount: productOrderCount[d.id] || 0
            };
          });
          
          // Sort by order count (descending)
          productList.sort((a, b) => b.orderCount - a.orderCount);
          
          // Limit to top 20 most popular products
          productList = productList.slice(0, 20);
        } else {
          // Regular category filter
          const productsRef = collection(db, "products");
          const q = query(productsRef, where("category", "==", selectedCategory));
          const productSnapshot = await getDocs(q);
          productList = productSnapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));
        }
        
        setProducts(productList);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory]);

  // Add to wishlist
  const addToWishlist = async (product) => {
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

    const ref = doc(db, "users", user.uid, "wishlist", product.id);

    try {
      const existing = await getDoc(ref);
      if (!existing.exists()) {
        await setDoc(ref, {
          productId: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          addedAt: serverTimestamp(),
        });

        Toast.show({
          type: "success",
          text1: "💖 Added to Wishlist",
          text2: "Tap to view your wishlist.",
          position: "top",
          onPress: () => navigation.navigate("Wishlist"),
        });

      } else {
        Toast.show({
          type: "info",
          text1: "Already in Wishlist",
          text2: `${product.name} is already saved.`,
          position: "top",
          onPress: () => navigation.navigate("Wishlist"),
        });
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      Toast.show({
        type: "error",
        text1: "Wishlist Error",
        text2: "Something went wrong.",
        position: "top",
      });
    }
  };

  // Add to cart
  const addToCart = async (product, qty = 1) => {
    try {
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

      const itemRef = doc(db, "carts", user.uid, "items", product.id);
      const snap = await getDoc(itemRef);

      if (snap.exists()) {
        await updateDoc(itemRef, {
          quantity: (snap.data().quantity || 1) + qty,
          updatedAt: serverTimestamp(),
        });
        Toast.show({
          type: "info",
          text1: "🛒 Cart Updated",
          text2: `${product.name} quantity increased.`,
          position: "top",
        });
      } else {
        await setDoc(itemRef, {
          name: product.name || "",
          price: product.price || 0,
          imageUrl: product.imageUrl || "",
          description: product.description || "",
          quantity: qty,
          createdAt: serverTimestamp(),
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
        text1: "Cart Error",
        text2: "Something went wrong while updating cart.",
        position: "top",
      });
    }
  };

  const handleBannerPress = (banner) => {
    if (banner.link) {
      // Handle different types of links
      if (banner.link === '/customization' || banner.link === 'CustomizationScreen') {
        // Navigate to CustomizationScreen
        navigation.navigate('CustomizationScreen');
      } else if (banner.link.startsWith('/')) {
        // Internal navigation for other routes
        const routeName = banner.link.substring(1); 
        if (routeName) {
          navigation.navigate(routeName);
        }
      } else if (banner.link.startsWith('http')) {
        // External URL - you might want to use a WebView here
        console.log("Opening external URL:", banner.link);
        // For now, just log it. You can implement WebView navigation later.
      } else if (banner.link === 'other' && banner.customLink) {
        // Handle custom links from admin
        if (banner.customLink.startsWith('/')) {
          const routeName = banner.customLink.substring(1);
          navigation.navigate(routeName);
        } else if (banner.customLink.startsWith('http')) {
          console.log("Opening external URL:", banner.customLink);
        }
      }
    } else {
      // Default action if no link is specified
      navigation.navigate('CustomizationScreen');
    }
  };

  // Fonts not loaded
  if (!leagueSpartanLoaded || !montserratLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#A68B69" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        <ScrollView>
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Mirrora Philippines</Text>
          </View>
          <View style={styles.searchContainer}>
            <View style={styles.searchInputWrapper}>
              <Icon
                name="magnify"
                size={20}
                color="#777"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search here..."
                placeholderTextColor="#777"
              />
            </View>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => navigation.navigate("MessageScreen")}
            >
              <Icon name="chat-processing" size={30} color="#A68B69" />
            </TouchableOpacity>
          </View>

          {/* BANNERS */}
          {bannersLoading ? (
            <View style={styles.bannerLoadingContainer}>
              <ActivityIndicator size="large" color="#A68B69" />
              <Text style={styles.loadingText}>Loading banners...</Text>
            </View>
          ) : banners.length > 0 ? (
            <>
              <FlatList
                data={banners}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                onScroll={(event) => {
                  const index = Math.round(
                    event.nativeEvent.contentOffset.x /
                    event.nativeEvent.layoutMeasurement.width
                  );
                  setActiveBanner(index);
                }}
                style={styles.bannerList}
                renderItem={({ item }) => {
                  const bannerSrc = safeImageSource(item?.imageUrl) || PLACEHOLDER;
                  return (
                    <TouchableOpacity
                      onPress={() => handleBannerPress(item)}
                      activeOpacity={0.9}
                    >
                      <ImageBackground
                        source={bannerSrc}
                        style={styles.banner}
                        imageStyle={styles.bannerImageStyle}
                        resizeMode="cover"
                      >
                        <View style={styles.bannerContent}>
                          <Text style={styles.bannerText}>{item.title || "Design Your Perfect"}</Text>
                          <Text style={[styles.bannerText, { color: "#fff" }]}>
                            {item.subtitle || "Mirror Today"}
                          </Text>
                          <Text style={[styles.bannerSubtext, { color: "#fff" }]}>
                            {item.description || "Crafted Just for You!"}
                          </Text>
                          <TouchableOpacity 
                            style={styles.customizeButton}
                            onPress={() => handleBannerPress(item)}
                          >
                            <Text style={styles.customizeButtonText}>
                              {item.buttonText || "Customize Now"}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </ImageBackground>
                    </TouchableOpacity>
                  );
                }}
              />
              <View style={styles.bannerDotsContainer}>
                {banners.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      activeBanner === index && styles.activeDot,
                    ]}
                  />
                ))}
              </View>
            </>
          ) : (
            <View style={styles.noBannersContainer}>
              <Text style={styles.noBannersText}>No banners available</Text>
            </View>
          )}

          {/* CATEGORY SELECTOR */}
          <View style={styles.categorySelector}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category && styles.categoryButtonActive,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      selectedCategory === category && styles.categoryButtonTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* PRODUCTS */}
          <View style={styles.sectionHeader}>
            <View style={styles.categoryDropdownButton}>
              <Text style={styles.sectionTitle}>{selectedCategory}</Text>
            </View>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#A68B69" />
              <Text style={styles.loadingText}>Loading products...</Text>
            </View>
          ) : products.length > 0 ? (
            <FlatList
              data={products}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.productRow}
              renderItem={({ item }) => {
                const productSrc = safeImageSource(item?.imageUrl) || PLACEHOLDER;

                return (
                  <TouchableOpacity
                    style={styles.productCard}
                    onPress={() =>
                      navigation.navigate("ProductScreen", {
                        product: item,
                        addToCart: addToCart,
                        addToWishlist: addToWishlist,
                      })
                    }
                  >
                    <View style={styles.productImageContainer}>
                      <Image
                        source={productSrc}
                        style={styles.productImage}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        style={styles.heartIcon}
                        onPress={() => addToWishlist(item)}
                      >
                        <Icon
                          name="heart-outline"
                          size={20}
                          color="#fff"
                        />
                      </TouchableOpacity>
                      {selectedCategory === "Most Popular" && item.orderCount > 0 && (
                        <View style={styles.popularBadge}>
                          <Text style={styles.popularBadgeText}>
                            {item.orderCount} sold
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                      <View style={styles.priceAndButton}>
                        <Text style={styles.productPrice}>₱ {item.price}</Text>
                        <TouchableOpacity
                          style={styles.addToCartButton}
                          onPress={async () => {
                            await addToCart(item);
                            navigation.navigate("Cart");
                          }}
                        >
                          <Icon name="plus" size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.noProductsContainer}>
              <Text style={styles.noProductsText}>
                {selectedCategory === "Most Popular" 
                  ? "No popular products yet" 
                  : `No products found in ${selectedCategory} category`}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Dropdown */}
        <CategoriesDropdown
          isVisible={isDropdownVisible}
          onClose={() => setDropdownVisible(false)}
          onSelectCategory={setSelectedCategory}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9F9" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  headerTitle: {
    fontFamily: "LeagueSpartan_700Bold",
    fontSize: 22,
    color: "#000",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 20,
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 40, fontFamily: "Montserrat_400Regular" },
  filterButton: { padding: 8, borderRadius: 10, marginLeft: 10 },
  bannerList: { marginTop: 20, paddingHorizontal: 20 },
  banner: {
    width: 320,
    height: 150,
    marginRight: 15,
    borderRadius: 15,
    overflow: "hidden",
    justifyContent: "center",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  bannerContent: { width: "60%", padding: 10 },
  bannerText: {
    fontFamily: "LeagueSpartan_700Bold",
    fontSize: 18,
    color: "#000",
  },
  bannerSubtext: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 12,
    marginTop: 5,
    color: "#000",
  },
  customizeButton: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginTop: 10,
    alignSelf: "flex-start",
  },
  customizeButtonText: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 12,
    color: "#A68B69",
  },
  bannerDotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D9D9D9",
    marginHorizontal: 4,
  },
  activeDot: { backgroundColor: "#A68B69" },
  categorySelector: {
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    marginHorizontal: 5,
  },
  categoryButtonActive: {
    backgroundColor: "#A68B69",
  },
  categoryButtonText: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 14,
    color: "#777",
  },
  categoryButtonTextActive: {
    color: "#fff",
    fontFamily: "Montserrat_600SemiBold",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  categoryDropdownButton: { flexDirection: "row", alignItems: "center" },
  sectionTitle: {
    fontFamily: "LeagueSpartan_700Bold",
    fontSize: 20,
    color: "#000",
  },
  seeAllText: { fontFamily: "Montserrat_400Regular", color: "#A68B69" },
  productRow: {
    justifyContent: "space-between",
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  productCard: {
    width: "47%",
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  productImageContainer: { position: "relative" },
  productImage: { width: "100%", height: 200, resizeMode: "cover" },
  heartIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 15,
    padding: 5,
  },
  popularBadge: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "#A68B69",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  popularBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Montserrat_600SemiBold",
  },
  productInfo: { padding: 10 },
  productName: { 
    fontFamily: "Montserrat_600SemiBold", 
    fontSize: 14,
    marginBottom: 5,
  },
  priceAndButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productPrice: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 14,
    color: "#A68B69",
  },
  addToCartButton: { backgroundColor: "#A68B69", padding: 8, borderRadius: 20 },
  dropdownOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  dropdownContainer: {
    position: "absolute",
    top: 250,
    left: 20,
    width: 150,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    paddingVertical: 5,
  },
  dropdownItem: { padding: 10 },
  dropdownText: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 14,
    color: "#000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    height: 200,
  },
  bannerLoadingContainer: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 20,
  },
  loadingText: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 14,
    color: "#777",
    marginTop: 10,
  },
  noBannersContainer: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 20,
    backgroundColor: "#F3F4F6",
    borderRadius: 15,
    marginHorizontal: 20,
  },
  noBannersText: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 14,
    color: "#777",
  },
  noProductsContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  noProductsText: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 14,
    color: "#777",
    textAlign: "center",
  },
}); 