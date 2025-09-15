// screens/ProductListScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import Toast from "react-native-toast-message";
import {
  useFonts as useLeagueSpartan,
  LeagueSpartan_700Bold,
} from "@expo-google-fonts/league-spartan";
import {
  useFonts as useMontserrat,
  Montserrat_400Regular,
  Montserrat_600SemiBold,
} from "@expo-google-fonts/montserrat";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Firebase
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../Backend/firebaseConfig";

const { width } = Dimensions.get("window");

export default function ProductListScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { categoryId, categoryName } = route.params ?? {};

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tempClicked, setTempClicked] = useState({});
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'

  const [leagueSpartanLoaded] = useLeagueSpartan({ LeagueSpartan_700Bold });
  const [montserratLoaded] = useMontserrat({
    Montserrat_400Regular,
    Montserrat_600SemiBold,
  });

  const insets = useSafeAreaInsets();

  // Fetch products
  useEffect(() => {
    if (!categoryId) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "products"),
      where("categoryId", "==", categoryId)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setProducts(data);
        setLoading(false);
      },
      (err) => {
        console.error("products onSnapshot error:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [categoryId]);

  // Add to Wishlist
  const addToWishlist = async (product) => {
    const user = auth.currentUser;
    if (!user) {
      Toast.show({
        type: "info",
        text1: "Please sign in",
        text2: "You need to sign in to use wishlist.",
        position: "top",
      });
      return;
    }

    const docRef = doc(db, "users", user.uid, "wishlist", product.id);
    
    try {
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        await setDoc(docRef, {
          productId: product.id,
          name: product.name,
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
          text2: `${product.name} has been saved.`,
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
    } catch (err) {
      console.error("addToWishlist error:", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not update wishlist.",
        position: "top",
      });
    }
  };

  // Add to Cart
  const addToCart = async (product) => {
    const user = auth.currentUser;
    if (!user) {
      Toast.show({
        type: "info",
        text1: "Please sign in",
        text2: "You need to sign in to add to cart.",
        position: "top",
      });
      return;
    }

    const cartItemRef = doc(db, "carts", user.uid, "items", product.id);

    try {
      const snap = await getDoc(cartItemRef);
      if (snap.exists()) {
        await updateDoc(cartItemRef, { quantity: increment(1) });
        Toast.show({
          type: "info",
          text1: "🛒 Cart Updated",
          text2: `${product.name} quantity increased.`,
          position: "top",
        });
      } else {
        await setDoc(cartItemRef, {
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
          text2: `${product.name} has been added.`,
          position: "top",
        });
      }
    } catch (err) {
      console.error("addToCart error:", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not add to cart.",
        position: "top",
      });
    }
  };

  // Fonts loading
  if (!leagueSpartanLoaded || !montserratLoaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#A68B69" />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#A68B69" />
        <Text>Loading products...</Text>
      </View>
    );
  }

  // Render Grid item
  const renderGridItem = ({ item }) => {
    const isTempClicked = tempClicked[item.id];

    return (
      <View style={styles.itemContainer}>
        <TouchableOpacity
          style={styles.imageWrapper}
          onPress={() =>
            navigation.navigate("ProductScreen", {
              product: item,
              addToCart,
              addToWishlist,
            })
          }
        >
          <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
          <TouchableOpacity
            style={styles.wishlistIcon}
            onPress={() => addToWishlist(item)}
          >
            <Ionicons
              name={isTempClicked ? "heart" : "heart-outline"}
              size={24}
              color={isTempClicked ? "red" : "#A68B69"}
            />
          </TouchableOpacity>
        </TouchableOpacity>

        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{item.name}</Text>
          <View style={styles.priceCartRow}>
            <Text style={styles.itemPrice}>₱ {item.price}</Text>
            <TouchableOpacity
              style={styles.addToCartIconButton}
              onPress={() =>
                navigation.navigate("ProductScreen", {
                  product: item,
                  addToCart,
                  addToWishlist,
                })
              }
            >
              <Icon name="cart-plus" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Render List item
  const renderListItem = ({ item }) => {
    const isTempClicked = tempClicked[item.id];

    return (
      <TouchableOpacity
        style={styles.listItemContainer}
        onPress={() =>
          navigation.navigate("ProductScreen", {
            product: item,
            addToCart,
            addToWishlist,
          })
        }
      >
        <View style={styles.listImageWrapper}>
          <Image source={{ uri: item.imageUrl }} style={styles.listItemImage} />
          <TouchableOpacity
            style={styles.listWishlistIcon}
            onPress={() => addToWishlist(item)}
          >
            <Ionicons
              name={isTempClicked ? "heart" : "heart-outline"}
              size={20}
              color={isTempClicked ? "red" : "#A68B69"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.listItemDetails}>
          <Text style={styles.listItemName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.listItemPrice}>₱ {item.price}</Text>
        </View>

        <TouchableOpacity
          style={styles.listAddToCartButton}
          onPress={() =>
            navigation.navigate("ProductScreen", {
              product: item,
              addToCart,
              addToWishlist,
            })
          }
        >
          <Icon name="cart-plus" size={22} color="#fff" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="chevron-left" size={30} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>{categoryName ?? "Products"}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.viewModeButton}
            onPress={() =>
              setViewMode(viewMode === "grid" ? "list" : "grid")
            }
          >
            <Icon
              name={viewMode === "grid" ? "format-list-bulleted" : "view-grid"}
              size={24}
              color="#A68B69"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.wishlistIconHeader}
            onPress={() => navigation.navigate("Wishlist")}
          >
            <Ionicons name="heart-outline" size={26} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={products}
        renderItem={viewMode === "grid" ? renderGridItem : renderListItem}
        keyExtractor={(item) => item.id}
        numColumns={viewMode === "grid" ? 2 : 1}
        key={viewMode}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={viewMode === "grid" ? styles.row : null}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9F9" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: { padding: 5 },
  title: {
    fontFamily: "LeagueSpartan_700Bold",
    fontSize: 24,
    color: "#000",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 10,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  viewModeButton: {
    padding: 5,
    borderRadius: 8,
    backgroundColor: "rgba(166, 139, 105, 0.1)",
  },
  wishlistIconHeader: { padding: 5, zIndex: 1 }, // ✅ ensures press works
  listContainer: { paddingTop: 15, paddingHorizontal: 10 },
  row: { justifyContent: "space-between", marginBottom: 10 },

  // Grid View
  itemContainer: {
    width: (width - 40) / 2,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 20,
    marginHorizontal: 5,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  imageWrapper: { position: "relative", height: 180 },
  itemImage: { width: "100%", height: "100%", resizeMode: "cover" },
  wishlistIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 20,
    padding: 5,
  },
  itemDetails: {
    padding: 10,
    backgroundColor: "#F9F7EF",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  itemName: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 14,
    color: "#000",
    marginBottom: 8,
  },
  priceCartRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemPrice: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 16,
    color: "#A68B69",
    flex: 1,
  },
  addToCartIconButton: {
    backgroundColor: "#A68B69",
    borderRadius: 20,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },

  // List View
  listItemContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    marginHorizontal: 5,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    alignItems: "center",
    padding: 10,
  },
  listImageWrapper: {
    position: "relative",
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
  },
  listItemImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  listWishlistIcon: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 15,
    padding: 3,
  },
  listItemDetails: {
    flex: 1,
    marginLeft: 15,
    marginRight: 10,
  },
  listItemName: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 14,
    color: "#000",
    marginBottom: 5,
  },
  listItemPrice: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 16,
    color: "#A68B69",
  },
  listAddToCartButton: {
    backgroundColor: "#A68B69",
    borderRadius: 25,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});