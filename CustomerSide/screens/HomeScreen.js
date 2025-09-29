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
  ActivityIndicator,
  Platform,
  Modal,
} from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
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
import { useChat } from '../Context/ChatContext';
import FloatingChatbot from '../components/FloatingChatbot';

const { width } = Dimensions.get("window");

// Local placeholder (adjust path if needed)
const PLACEHOLDER = require("../assets/placeholder.png");

// Helper that guarantees a valid Image source or returns null
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

export default function HomeScreen({ route }) {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const { unreadCount } = useChat();

  const [activeBanner, setActiveBanner] = useState(0);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [tempClicked, setTempClicked] = useState({});
  const [tempCartAdded, setTempCartAdded] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);
  
  // Filter states
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Predefined mirror categories
  const categories = ["All", "Arch", "Capsules", "Grid", "Irregular", "Round"];

  // Get the isSignedIn parameter from route
  useEffect(() => {
    if (route.params?.isSignedIn) {
      setIsSignedIn(true);
    }
  }, [route.params?.isSignedIn]);

  // Also check Firebase auth state for persistent login
  useEffect(() => {
    const checkAuthState = () => {
      const user = auth.currentUser;
      setIsSignedIn(!!user);
    };

    checkAuthState();
  }, []);

  // Load fonts
  const [leagueSpartanLoaded] = useLeagueSpartan({
    LeagueSpartan_700Bold,
  });
  const [montserratLoaded] = useMontserrat({
    Montserrat_400Regular,
    Montserrat_600SemiBold,
  });

  // Fetch banners - only active banners, limited to 3
  useEffect(() => {
    const fetchData = async () => {
      try {
        const bannerSnapshot = await getDocs(collection(db, "banners"));
        const bannerList = bannerSnapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        
        // Filter only active banners and limit to 3
        const activeBanners = bannerList
          .filter(banner => banner.active !== false)
          .slice(0, 3);
        
        setBanners(activeBanners);
      } catch (error) {
        console.error("Error fetching banners:", error);
      }
    };
    fetchData();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const productsRef = collection(db, "products");
        const productSnapshot = await getDocs(productsRef);
        const productList = productSnapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        
        setProducts(productList);
        setFilteredProducts(productList);
        
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [isFocused]);

  // Filter products based on selected category
  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => product.category === selectedCategory);
      setFilteredProducts(filtered);
    }
  }, [selectedCategory, products]);

  // Handle banner click - FIXED NAVIGATION ISSUES
  const handleBannerPress = (banner) => {
    if (banner.link) {
      // Handle different link types
      switch (banner.link) {
        case '/CustomizationScreen':
        case '/customization': // Handle both uppercase and lowercase
          navigation.navigate("CustomizationScreen");
          break;
        case '/products':
          navigation.navigate("ProductListScreen");
          break;
        case '/cart':
          navigation.navigate("CartScreen");
          break;
        case '/':
          // Scroll to top or refresh home screen
          break;
        default:
          // Handle custom URLs or other screens
          if (banner.link.startsWith('/')) {
            // If it's a route path, navigate to it
            const routeName = banner.link.substring(1); // Remove the leading slash
            
            // Map common route names to actual screen names
            const routeMap = {
              'customization': 'CustomizationScreen',
              'products': 'ProductListScreen',
              'cart': 'CartScreen',
              'messages': 'MessageScreen',
              'orders': 'MyOrderScreen',
              'settings': 'SettingScreen',
            };
            
            const actualScreenName = routeMap[routeName] || routeName;
            
            // Check if the screen exists before navigating
            if (routeMap[routeName] || routeName === 'CustomizationScreen') {
              navigation.navigate(actualScreenName);
            } else {
              // Fallback to CustomizationScreen for unknown routes
              console.log("Unknown route, falling back to CustomizationScreen:", routeName);
              navigation.navigate("CustomizationScreen");
            }
          } else {
            // If it's a full URL, you might want to handle it differently
            console.log("External URL:", banner.link);
            // Default fallback to CustomizationScreen
            navigation.navigate("CustomizationScreen");
          }
          break;
      }
    } else {
      // Default behavior - navigate to CustomizationScreen
      navigation.navigate("CustomizationScreen");
    }
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowFilterDropdown(false);
    Toast.show({
      type: "success",
      text1: "Filter Applied",
      text2: category === "All" ? "Showing all mirrors" : `Showing ${category} mirrors`,
      position: "top",
    });
  };

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
          title: product.name || product.title || "Unnamed Product",
          price: product.price,
          imageUrl: product.imageUrl,
          addedAt: serverTimestamp(),
        });
        setTempClicked((prev) => ({ ...prev, [product.id]: true }));
        setTimeout(() => {
          setTempClicked((prev) => ({ ...prev, [product.id]: false }));
        }, 1000);
        Toast.show({
          type: "success",
          text1: "Added to Wishlist",
          text2: `${product.name || product.title || "Unnamed Product"} has been added!`,
          position: "top",
        });
      } else {
        Toast.show({
          type: "info",
          text1: "Already in Wishlist",
          text2: `${product.name || product.title || "Unnamed Product"} is already saved.`,
          position: "top",
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
        setTempCartAdded((prev) => ({ ...prev, [product.id]: true }));
        setTimeout(() => {
          setTempCartAdded((prev) => ({ ...prev, [product.id]: false }));
        }, 1000);
        Toast.show({
          type: "info",
          text1: "Cart Updated",
          text2: `${product.name || product.title || "Unnamed Product"} quantity increased.`,
          position: "top",
        });
      } else {
        await setDoc(itemRef, {
          productId: product.id,
          title: product.name || product.title || "Unnamed Product",
          price: product.price || 0,
          imageUrl: product.imageUrl || "",
          description: product.description || "",
          dimensions: product.dimensions || "",
          weight: product.weight || "",
          quantity: qty,
          addedAt: serverTimestamp(),
        });
        setTempCartAdded((prev) => ({ ...prev, [product.id]: true }));
        setTimeout(() => {
          setTempCartAdded((prev) => ({ ...prev, [product.id]: false }));
        }, 1000);
        Toast.show({
          type: "success",
          text1: "Added to Cart",
          text2: `${product.name || product.title || "Unnamed Product"} is now in your cart.`,
          position: "top",
        });
      }
      // Navigate to CartScreen
      navigation.navigate("CartScreen");
    } catch (err) {
      console.error("addToCart error:", err);
      Toast.show({
        type: "error",
        text1: "Cart Error",
        text2: "Failed to update cart. Try again later.",
        position: "top",
      });
    }
  };

  if (!leagueSpartanLoaded || !montserratLoaded) {
    return (
      <View
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
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
            <TouchableOpacity
              onPress={() => navigation.navigate("MessageScreen")}
              style={styles.messageIconContainer}
            >
              <Icon name="chat-processing" size={24} color="#A68B69" />
              {/* Notification badge */}
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
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
              style={[styles.filterButton, selectedCategory !== "All" && styles.activeFilterButton]}
              onPress={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              <Icon name="tune" size={24} color={selectedCategory !== "All" ? "#fff" : "#000"} />
              {selectedCategory !== "All" && <View style={styles.filterDot} />}
            </TouchableOpacity>
          </View>

          {/* FILTER DROPDOWN */}
          {showFilterDropdown && (
            <View style={styles.dropdownContainer}>
              <View style={styles.dropdown}>
                {categories.map((category, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dropdownItem,
                      selectedCategory === category && styles.selectedDropdownItem,
                      index === categories.length - 1 && styles.lastDropdownItem
                    ]}
                    onPress={() => handleCategorySelect(category)}
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        selectedCategory === category && styles.selectedDropdownText
                      ]}
                    >
                      {category}
                    </Text>
                    {selectedCategory === category && (
                      <Icon name="check" size={18} color="#A68B69" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Current Filter Indicator */}
          {selectedCategory !== "All" && (
            <View style={styles.currentFilterContainer}>
              <Text style={styles.currentFilterText}>Showing: {selectedCategory}</Text>
              <TouchableOpacity
                onPress={() => setSelectedCategory("All")}
                style={styles.clearFilterButton}
              >
                <Icon name="close-circle" size={16} color="#A68B69" />
                <Text style={styles.clearFilterText}>Clear</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* BANNERS SECTION WITH CUSTOMIZABLE COLORS */}
          {banners.length > 0 && (
            <View style={styles.bannerSection}>
              <Text style={styles.bannerSectionTitle}>Featured</Text>
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
                contentContainerStyle={styles.bannerContentContainer}
                renderItem={({ item }) => {
                  const bannerSrc = safeImageSource(item?.imageUrl) || PLACEHOLDER;
                  
                  // Use custom colors from Firebase or fallback to defaults
                  const titleColor = item.titleColor || "#FFFFFF";
                  const subtitleColor = item.subtitleColor || "#FFFFFF";
                  const buttonColor = item.buttonColor || "#A68B69";
                  const buttonTextColor = item.buttonTextColor || "#FFFFFF";
                  const textPosition = item.textPosition || "left";
                  
                  // Determine text alignment based on position
                  const textAlign = textPosition === "center" ? "center" : 
                                  textPosition === "right" ? "right" : "left";
                  
                  const contentAlignment = textPosition === "center" ? "center" : 
                                         textPosition === "right" ? "flex-end" : "flex-start";

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
                        {/* Banner Overlay Content with Custom Colors */}
                        <View style={[styles.bannerContent, { alignItems: contentAlignment }]}>
                          {/* Title Section */}
                          {item.title && (
                            <View style={styles.bannerTitleContainer}>
                              <Text style={[styles.bannerTitle, { color: titleColor, textAlign }]}>
                                {item.title}
                              </Text>
                            </View>
                          )}
                          
                          {/* Subtitle Section */}
                          {item.subtitle && (
                            <View style={styles.bannerSubtitleContainer}>
                              <Text style={[styles.bannerSubtitle, { color: subtitleColor, textAlign }]}>
                                {item.subtitle}
                              </Text>
                            </View>
                          )}
                          
                          {/* CTA Button */}
                          <TouchableOpacity 
                            style={[styles.bannerCtaButton, { backgroundColor: buttonColor }]}
                            onPress={() => handleBannerPress(item)}
                          >
                            <Text style={[styles.bannerCtaButtonText, { color: buttonTextColor }]}>
                              {item.ctaText || "Customize Me"}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </ImageBackground>
                    </TouchableOpacity>
                  );
                }}
              />
              {/* Banner Dots - Only show if there's more than 1 banner */}
              {banners.length > 1 && (
                <View style={styles.bannerDotsContainer}>
                  {banners.map((_, index) => (
                    <View
                      key={index}
                      style={[styles.dot, activeBanner === index && styles.activeDot]}
                    />
                  ))}
                </View>
              )}
            </View>
          )}

          {/* PRODUCTS */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === "All" ? "Popular" : selectedCategory}
            </Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("ProductListScreen", {
                  category: selectedCategory === "All" ? "Most Popular" : selectedCategory,
                })
              }
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#A68B69" />
              <Text style={styles.loadingText}>Loading products...</Text>
            </View>
          ) : filteredProducts.length === 0 ? (
            <View style={styles.noProductsContainer}>
              <Icon name="package-variant" size={50} color="#ccc" />
              <Text style={styles.noProductsText}>No products found in this category</Text>
              <TouchableOpacity
                onPress={() => setSelectedCategory("All")}
                style={styles.showAllButton}
              >
                <Text style={styles.showAllButtonText}>Show All Products</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={filteredProducts.slice(0, 10)}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.productRow}
              renderItem={({ item }) => {
                const isTempClicked = tempClicked[item.id];
                const isTempAdded = tempCartAdded[item.id];
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
                          name={isTempClicked ? "heart" : "heart-outline"}
                          size={20}
                          color={isTempClicked ? "red" : "#fff"}
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{item.name}</Text>
                      <View style={styles.priceAndButton}>
                        <Text style={styles.productPrice}>₱ {item.price}</Text>
                        <TouchableOpacity
                          style={styles.addToCartButton}
                          onPress={() => addToCart(item)}
                        >
                          <Icon name={isTempAdded ? "check" : "plus"} size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
              scrollEnabled={false}
            />
          )}
        </ScrollView>
        
        <FloatingChatbot isSignedIn={isSignedIn} />

        {/* Overlay to close dropdown when clicking outside */}
        {showFilterDropdown && (
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => setShowFilterDropdown(false)}
          />
        )}
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
    paddingTop: 50,
  },
  headerTitle: {
    fontFamily: "LeagueSpartan_700Bold",
    fontSize: 22,
    color: "#000",
  },
  messageIconContainer: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "red",
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
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
  filterButton: { 
    padding: 8, 
    borderRadius: 10, 
    marginLeft: 10,
    position: "relative",
  },
  activeFilterButton: {
    backgroundColor: "#A68B69",
  },
  filterDot: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  currentFilterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 10,
    paddingVertical: 8,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 20,
    borderRadius: 8,
  },
  currentFilterText: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 12,
    color: "#666",
  },
  clearFilterButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  clearFilterText: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 12,
    color: "#A68B69",
    marginLeft: 4,
  },
  // Banner Styles - UPDATED WITH CUSTOMIZABLE OPTIONS
  bannerSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  bannerSectionTitle: {
    fontFamily: "LeagueSpartan_700Bold",
    fontSize: 20,
    color: "#000",
    marginBottom: 15,
  },
  bannerList: {
    borderRadius: 20,
  },
  bannerContentContainer: {
    paddingRight: 15,
  },
  banner: {
    width: width - 40,
    height: 200,
    marginRight: 15,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  bannerImageStyle: {
    borderRadius: 20,
  },
  bannerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  bannerTitleContainer: {
    marginBottom: 8,
  },
  bannerTitle: {
    fontFamily: "LeagueSpartan_700Bold",
    fontSize: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    lineHeight: 28,
  },
  bannerSubtitleContainer: {
    marginBottom: 20,
    maxWidth: '80%',
  },
  bannerSubtitle: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    lineHeight: 18,
  },
  bannerCtaButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  bannerCtaButtonText: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  bannerDotsContainer: { 
    flexDirection: "row", 
    justifyContent: "center", 
    marginTop: 15,
    marginBottom: 5,
  },
  dot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    backgroundColor: "#D9D9D9", 
    marginHorizontal: 4 
  },
  activeDot: { 
    backgroundColor: "#A68B69",
    width: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 25,
    marginBottom: 10,
  },
  sectionTitle: { 
    fontFamily: "LeagueSpartan_700Bold", 
    fontSize: 20, 
    color: "#000" 
  },
  seeAllText: { 
    fontFamily: "Montserrat_400Regular", 
    color: "#A68B69" 
  },
  productRow: { 
    justifyContent: "space-between", 
    paddingHorizontal: 15, 
    marginBottom: 10 
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
  productInfo: { padding: 10 },
  productName: { fontFamily: "Montserrat_600SemiBold", fontSize: 14 },
  priceAndButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  productPrice: { fontFamily: "Montserrat_600SemiBold", fontSize: 14, color: "#A68B69" },
  addToCartButton: { backgroundColor: "#A68B69", padding: 8, borderRadius: 20 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", height: 300 },
  loadingText: { marginTop: 10, fontFamily: "Montserrat_400Regular", color: "#A68B69" },
  noProductsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 300,
  },
  noProductsText: {
    fontFamily: "Montserrat_400Regular",
    color: "#999",
    marginTop: 10,
    textAlign: "center",
  },
  showAllButton: {
    backgroundColor: "#A68B69",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 15,
  },
  showAllButtonText: {
    fontFamily: "Montserrat_600SemiBold",
    color: "#fff",
    fontSize: 14,
  },
  // Modal Styles
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
  },
  dropdownContainer: {
    paddingHorizontal: 20,
    marginTop: 5,
    zIndex: 1000,
  },
  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  lastDropdownItem: {
    borderBottomWidth: 0,
  },
  selectedDropdownItem: {
    backgroundColor: "#f8f8f8",
  },
  dropdownText: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 15,
    color: "#333",
  },
  selectedDropdownText: {
    fontFamily: "Montserrat_600SemiBold",
    color: "#A68B69",
  },
});