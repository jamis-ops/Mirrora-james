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
  query,
  where,
  onSnapshot,
  orderBy,
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

// ★ NEW: local placeholder (adjust path if needed)
const PLACEHOLDER = require("../assets/placeholder.png");

// ★ NEW: helper that guarantees a valid Image source or returns null
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

export default function HomeScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [activeBanner, setActiveBanner] = useState(0);
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [tempClicked, setTempClicked] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0); // NEW: Track unread messages

  // Load fonts
  const [leagueSpartanLoaded] = useLeagueSpartan({
    LeagueSpartan_700Bold,
  });
  const [montserratLoaded] = useMontserrat({
    Montserrat_400Regular,
    Montserrat_600SemiBold,
  });

  // NEW: Listen for new support messages
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Listen for support chats where the user is a participant
    const supportChatsQuery = query(
      collection(db, "supportChats"),
      where("participants", "array-contains", user.uid),
      orderBy("lastUpdated", "desc")
    );

    const unsubscribe = onSnapshot(supportChatsQuery, (snapshot) => {
      let count = 0;
      
      snapshot.forEach((doc) => {
        const chatData = doc.data();
        // Check if the user has unread messages in this chat
        if (chatData.lastRead && chatData.lastRead[user.uid]) {
          const lastRead = chatData.lastRead[user.uid].toDate();
          const lastMessageTime = chatData.lastUpdated.toDate();
          
          if (lastMessageTime > lastRead) {
            count++;
          }
        } else if (chatData.lastUpdated) {
          // If user has never read this chat, count it as unread
          count++;
        }
      });
      
      setUnreadCount(count);
    }, (error) => {
      console.error("Error listening for support chats:", error);
    });

    return () => unsubscribe();
  }, [isFocused]);

  // Fetch banners
  useEffect(() => {
    const fetchData = async () => {
      try {
        const bannerSnapshot = await getDocs(collection(db, "banners"));
        const bannerList = bannerSnapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setBanners(bannerList);
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
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []); // ✅ Removed selectedCategory from dependency array

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
          title: product.name,
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
          text1: "💖 Added to Wishlist",
          text2: `${product.name} has been added!`,
          position: "top",
        });
      } else {
        Toast.show({
          type: "info",
          text1: "Already in Wishlist",
          text2: `${product.name} is already saved.`,
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
      const itemRef = doc(db, "users", user.uid, "cart", product.id);
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
          productId: product.id,
          title: product.name || "",
          price: product.price || 0,
          imageUrl: product.imageUrl || "",
          quantity: qty,
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
              {/* NEW: Notification badge */}
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
            <TouchableOpacity style={styles.filterButton}>
              <Icon name="tune" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {/* BANNERS */}
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
                <ImageBackground
                  source={bannerSrc}
                  style={styles.banner}
                  imageStyle={styles.bannerImageStyle}
                  resizeMode="cover"
                >
                  <View style={styles.bannerContent}>
                    <Text style={styles.bannerText}>Design Your Perfect</Text>
                    <Text style={[styles.bannerText, { color: "#fff" }]}>
                      Mirror Today
                    </Text>
                    <Text style={[styles.bannerSubtext, { color: "#fff" }]}>
                      Crafted Just for You!
                    </Text>
                    <TouchableOpacity style={styles.customizeButton}>
                      <Text style={styles.customizeButtonText}>
                        Customize Now
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ImageBackground>
              );
            }}
          />
          <View style={styles.bannerDotsContainer}>
            {banners.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, activeBanner === index && styles.activeDot]}
              />
            ))}
          </View>

          {/* PRODUCTS */}
          <View style={styles.sectionHeader}>
            {/* ✅ Replaced the dropdown button with a simple Text component */}
            <Text style={styles.sectionTitle}>Popular</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("CategoryScreen", {
                  category: "Most Popular",
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
          ) : (
            <FlatList
              data={products}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.productRow}
              renderItem={({ item }) => {
                const isTempClicked = tempClicked[item.id];
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
                          <Icon name="plus" size={16} color="#fff" />
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
    position: "relative", // NEW: For positioning the badge
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "red",
    borderRadius: 10,
    minWidth: 18,
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
  bannerText: { fontFamily: "LeagueSpartan_700Bold", fontSize: 18, color: "#000" },
  bannerSubtext: { fontFamily: "Montserrat_400Regular", fontSize: 12, marginTop: 5, color: "#000" },
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
  bannerDotsContainer: { flexDirection: "row", justifyContent: "center", marginTop: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#D9D9D9", marginHorizontal: 4 },
  activeDot: { backgroundColor: "#A68B69" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 25,
    marginBottom: 10,
  },
  sectionTitle: { fontFamily: "LeagueSpartan_700Bold", fontSize: 20, color: "#000" },
  seeAllText: { fontFamily: "Montserrat_400Regular", color: "#A68B69" },
  productRow: { justifyContent: "space-between", paddingHorizontal: 15, marginBottom: 10 },
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
  dropdownOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 },
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
  dropdownText: { fontFamily: "Montserrat_400Regular", fontSize: 16 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", height: 300 },
  loadingText: { marginTop: 10, fontFamily: "Montserrat_400Regular", color: "#A68B69" },
});