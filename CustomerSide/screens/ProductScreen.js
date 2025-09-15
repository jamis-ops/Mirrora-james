// screens/ProductScreen.js
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import Toast from "react-native-toast-message";

// Firebase imports
import {
    getDoc,
    doc,
    deleteDoc,
    setDoc,
    updateDoc,
    increment,
} from "firebase/firestore";
import { auth, db } from "../Backend/firebaseConfig";

// Font imports from your HomeScreen
import {
    useFonts as useLeagueSpartan,
    LeagueSpartan_700Bold,
} from "@expo-google-fonts/league-spartan";
import {
    useFonts as useMontserrat,
    Montserrat_400Regular,
    Montserrat_600SemiBold,
} from "@expo-google-fonts/montserrat";

export default function ProductScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { product, addToWishlist } = route.params;

    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isInCart, setIsInCart] = useState(false);

    // Load fonts
    const [leagueSpartanLoaded] = useLeagueSpartan({ LeagueSpartan_700Bold });
    const [montserratLoaded] = useMontserrat({
        Montserrat_400Regular,
        Montserrat_600SemiBold,
    });

    // Check if the item is already in the wishlist and cart when the screen loads
    useEffect(() => {
        const checkStatus = async () => {
            const user = auth.currentUser;
            if (!user) return;

            try {
                // Check wishlist status
                const wishlistRef = doc(db, "wishlists", user.uid, "items", product.id);
                const wishlistSnap = await getDoc(wishlistRef);
                setIsWishlisted(wishlistSnap.exists());

                // Check cart status
                const cartRef = doc(db, "carts", user.uid, "items", product.id);
                const cartSnap = await getDoc(cartRef);
                setIsInCart(cartSnap.exists());
            } catch (error) {
                console.error("Error checking status:", error);
            }
        };

        checkStatus();
    }, [product.id]);

    // Add product to cart in Firestore
    const handleAddToCart = async () => {
        const user = auth.currentUser;
        if (!user) {
            Toast.show({
                type: "error",
                text1: "Login Required",
                text2: "Please sign in to add items to your cart.",
            });
            return;
        }

        try {
            const cartRef = doc(db, "carts", user.uid, "items", product.id);
            const cartSnap = await getDoc(cartRef);

            if (cartSnap.exists()) {
                // If product already in cart → increment quantity
                await updateDoc(cartRef, {
                    quantity: increment(1),
                });
                Toast.show({
                    type: "info",
                    text1: "Cart Updated",
                    text2: `${product.name} quantity increased.`,
                });
            } else {
                // Add new product to cart
                await setDoc(cartRef, {
                    name: product.name,
                    price: product.price,
                    imageUrl: product.imageUrl,
                    description: product.description || "",
                    quantity: 1,
                    createdAt: new Date(),
                });
                Toast.show({
                    type: "success",
                    text1: "Added to Cart",
                    text2: `${product.name} has been added to your cart.`,
                });
            }
            // Update cart state
            setIsInCart(true);
        } catch (error) {
            console.error("❌ Error adding to cart:", error);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to add item. Please try again.",
            });
        }
    };

    // Wishlist toggle handler
    const handleWishlistToggle = async () => {
        const user = auth.currentUser;
        if (!user) {
            Toast.show({
                type: "error",
                text1: "Login Required",
                text2: "Please sign in to manage your wishlist.",
            });
            return;
        }

        try {
            if (!isWishlisted) {
                // Add to wishlist
                const wishlistRef = doc(db, "users", user.uid, "wishlist", product.id);
                await setDoc(wishlistRef, {
                    name: product.name,
                    price: product.price,
                    imageUrl: product.imageUrl,
                    description: product.description || "",
                    createdAt: new Date(),
                });
                
                setIsWishlisted(true);
                Toast.show({
                    type: "success",
                    text1: "Added to Wishlist",
                    text2: `${product.name} added to your wishlist.`,
                });
            } else {
                // Remove from wishlist
                const wishlistRef = doc(db, "wishlists", user.uid, "items", product.id);
                await deleteDoc(wishlistRef);
                
                setIsWishlisted(false);
                Toast.show({
                    type: "info",
                    text1: "Removed from Wishlist",
                    text2: `${product.name} removed from your wishlist.`,
                });
            }
        } catch (error) {
            console.error("❌ Error toggling wishlist:", error);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to update wishlist. Please try again.",
            });
        }
    };

    // Handle Customize button press
    const handleCustomizePress = () => {
        navigation.navigate("CustomizationScreen", { product });
    };

    if (!leagueSpartanLoaded || !montserratLoaded) {
        return <ActivityIndicator size="large" color="#A68B69" style={styles.loading} />;
    }

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Product Image container with the back button */}
                <View style={styles.imageContainer}>
                    <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backButton}
                        >
                            <Icon name="chevron-left" size={30} color="#000" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Product Details Section */}
                <View style={styles.detailsContainer}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productPrice}>₱ {product.price}</Text>

                    {/* Customization link */}
                    <TouchableOpacity style={styles.customizeLink} onPress={handleCustomizePress}>
                        <Text style={styles.customizeText}>Customize</Text>
                    </TouchableOpacity>

                    {/* Description */}
                    <Text style={styles.productDescription}>
                        {product.description ||
                            "Floor standing mirrors are not only convenient for you to appreciate your whole body, but also can decorate your space."}
                    </Text>

                    <View style={styles.divider} />

                    {/* Dimensions */}
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Measures (H/W):</Text>
                        <Text style={styles.infoValue}>
                            {product.dimensions || '60.2" x 51.2"'}
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    {/* Weight */}
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Weight</Text>
                        <Text style={styles.infoValue}>
                            {product.weight || "20.2 pound"}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={handleWishlistToggle}
                >
                    {/* Heart icon - Red when in wishlist, gray when not */}
                    <Ionicons
                        name={isWishlisted ? "heart" : "heart-outline"}
                        size={28}
                        color={isWishlisted ? "#FF6B6B" : "#666"}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.addToCartButton}
                    onPress={handleAddToCart}
                >
                    <Text style={styles.addToCartText}>
                        {isInCart ? "In Cart" : "Add to Cart"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFF7EC" },
    loading: { flex: 1, justifyContent: "center", alignItems: "center" },
    imageContainer: { position: "relative" },
    header: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingTop: 50,
    },
    backButton: { padding: 5 },
    productImage: { width: "100%", height: 450, resizeMode: "cover" },
    detailsContainer: { paddingHorizontal: 20, paddingVertical: 15 },
    productName: { fontFamily: "LeagueSpartan_700Bold", fontSize: 24 },
    productPrice: {
        fontFamily: "Montserrat_400Regular",
        fontSize: 18,
        color: "#000",
        marginTop: 5,
    },
    customizeLink: { marginTop: 2, marginBottom: 15 },
    customizeText: {
        fontFamily: "Montserrat_600SemiBold",
        fontSize: 12,
        color: "#A68B69",
        textDecorationLine: "underline",
    },
    productDescription: {
        fontFamily: "Montserrat_400Regular",
        fontSize: 14,
        color: "#555",
        lineHeight: 20,
        marginTop: 5,
    },
    divider: {
        borderBottomColor: "#E0E0E0",
        borderBottomWidth: StyleSheet.hairlineWidth,
        marginVertical: 15,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 5,
    },
    infoLabel: {
        fontFamily: "Montserrat_400Regular",
        fontSize: 14,
        color: "#555",
    },
    infoValue: {
        fontFamily: "Montserrat_600SemiBold",
        fontSize: 14,
        color: "#000",
    },
    bottomBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
    },
    favoriteButton: {
        width: 50,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 25,
        borderWidth: 1,
        borderColor: "#ccc",
    },
    addToCartButton: {
        flex: 1,
        backgroundColor: "#A68B69",
        height: 50,
        borderRadius: 25,
        marginLeft: 15,
        justifyContent: "center",
        alignItems: "center",
    },
    addToCartText: {
        fontFamily: "Montserrat_600SemiBold",
        fontSize: 16,
        color: "#fff",
    },
});