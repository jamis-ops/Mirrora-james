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
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
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
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  // Load fonts
  const [leagueSpartanLoaded] = useLeagueSpartan({ LeagueSpartan_700Bold });
  const [montserratLoaded] = useMontserrat({
    Montserrat_400Regular,
    Montserrat_600SemiBold,
  });

  // ✅ Check if the item is already in the wishlist when the screen loads
  useEffect(() => {
    const checkWishlistStatus = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const docRef = doc(db, "wishlists", user.uid, "items", product.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setIsWishlisted(true);
      } else {
        setIsWishlisted(false);
      }
    };

    checkWishlistStatus();
  }, [product.id]);

  // ✅ Fetch reviews for this product
  useEffect(() => {
    const fetchReviews = () => {
      const q = query(
        collection(db, 'reviews'),
        where('productInfo.id', '==', product.id),
        where('isVisible', '==', true),
        orderBy('date', 'desc')
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const reviewList = [];
          let totalRating = 0;
          
          snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.isVisible) {
              reviewList.push({
                id: doc.id,
                userName: data.userName || 'Anonymous',
                rating: data.rating || 0,
                comment: data.comment || '',
                date: data.date?.toDate() || new Date(),
                avatar: data.avatar || 'US'
              });
              totalRating += data.rating || 0;
            }
          });

          setReviews(reviewList);
          setTotalReviews(reviewList.length);
          setAverageRating(reviewList.length > 0 ? (totalRating / reviewList.length).toFixed(1) : 0);
          setLoadingReviews(false);
        },
        (error) => {
          console.error("Error fetching reviews:", error);
          setLoadingReviews(false);
        }
      );

      return unsubscribe;
    };

    const unsubscribe = fetchReviews();
    return () => unsubscribe();
  }, [product.id]);

  // ✅ Add product to cart in Firestore
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
      } else {
        // Add new product to cart
        await setDoc(cartRef, {
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          description: product.description || "",
          dimensions: product.dimensions || "",
          weight: product.weight || "",
          quantity: 1,
          createdAt: new Date(),
        });
      }

      Toast.show({
        type: "success",
        text1: "Added to Cart",
        text2: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
      console.error("❌ Error adding to cart:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to add item. Please try again.",
      });
    }
  };

  // ✅ Wishlist toggle handler
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

    const newWishlistedStatus = !isWishlisted;
    setIsWishlisted(newWishlistedStatus);

    if (newWishlistedStatus) {
      await addToWishlist(product);
    } else {
      try {
        await deleteDoc(doc(db, "wishlists", user.uid, "items", product.id));
        Toast.show({
          type: "info",
          text1: "Removed from Wishlist",
          text2: "The item has been removed from your list.",
        });
      } catch (error) {
        console.error("Error removing from wishlist:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to remove item. Please try again.",
        });
        setIsWishlisted(true);
      }
    }
  };

  // Handle Customize button press
  const handleCustomizePress = () => {
    navigation.navigate("CustomizationScreen", { product });
  };

  // Handle Write Review button press
  const handleWriteReview = () => {
    if (!auth.currentUser) {
      Toast.show({
        type: "error",
        text1: "Login Required",
        text2: "Please sign in to write a review.",
      });
      return;
    }
    navigation.navigate("ReviewScreen", { 
      productInfo: product 
    });
  };

  // Handle View All Reviews press
  const handleViewAllReviews = () => {
    navigation.navigate("ProductReviewsScreen", { 
      product,
      reviews,
      averageRating,
      totalReviews
    });
  };

  // Render stars for rating
  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Text
        key={index}
        style={[
          styles.star,
          { 
            color: index < rating ? '#FFD700' : '#E6E6E6',
            fontSize: 16
          }
        ]}
      >
        ★
      </Text>
    ));
  };

  // Format date
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!leagueSpartanLoaded || !montserratLoaded) {
    return null;
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

          {/* Rating Summary */}
          <View style={styles.ratingSummary}>
            <View style={styles.ratingStars}>
              {renderStars(Math.round(averageRating))}
              <Text style={styles.ratingText}>
                {averageRating} ({totalReviews} reviews)
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.writeReviewButton}
              onPress={handleWriteReview}
            >
           
            </TouchableOpacity>
          </View>

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
              {product.dimensions || "60.2” x 51.2”"}
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

          {/* Reviews Section */}
          <View style={styles.reviewsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Customer Reviews</Text>
              {totalReviews > 0 && (
                <TouchableOpacity onPress={handleViewAllReviews}>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              )}
            </View>

            {loadingReviews ? (
              <ActivityIndicator size="small" color="#A68B69" style={styles.loadingReviews} />
            ) : reviews.length === 0 ? (
              <View style={styles.noReviews}>
                <Icon name="comment-outline" size={40} color="#ccc" />
                <Text style={styles.noReviewsText}>No reviews yet</Text>
                <Text style={styles.noReviewsSubtext}>Be the first to review this product!</Text>
              </View>
            ) : (
              <>
                {reviews.slice(0, 3).map((review) => (
                  <View key={review.id} style={styles.reviewItem}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewerInfo}>
                        <View style={styles.avatar}>
                          <Text style={styles.avatarText}>{review.avatar}</Text>
                        </View>
                        <View>
                          <Text style={styles.reviewerName}>{review.userName}</Text>
                          <Text style={styles.reviewDate}>{formatDate(review.date)}</Text>
                        </View>
                      </View>
                      <View style={styles.reviewRating}>
                        {renderStars(review.rating)}
                      </View>
                    </View>
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                  </View>
                ))}
                {reviews.length > 3 && (
                  <TouchableOpacity 
                    style={styles.viewAllReviewsButton}
                    onPress={handleViewAllReviews}
                  >
                    <Text style={styles.viewAllReviewsText}>
                      View All {reviews.length} Reviews
                    </Text>
                    <Icon name="chevron-right" size={20} color="#A68B69" />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleWishlistToggle}
        >
          <Ionicons
            name={isWishlisted ? "heart" : "heart-outline"}
            size={28}
            color={isWishlisted ? "red" : "#A68B69"}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={handleAddToCart}
        >
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF7EC" },
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
  productName: { 
    fontFamily: "LeagueSpartan_700Bold", 
    fontSize: 24,
    marginBottom: 5,
  },
  productPrice: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 18,
    color: "#000",
    marginBottom: 15,
  },
  ratingSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  ratingStars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  writeReviewButton: {
    backgroundColor: '#F3EFE9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  writeReviewText: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 12,
    color: "#A68B69",
  },
  customizeLink: { marginBottom: 15 },
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
    marginBottom: 15,
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
  reviewsSection: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontFamily: "LeagueSpartan_700Bold",
    fontSize: 18,
    color: "#000",
  },
  viewAllText: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 14,
    color: "#A68B69",
  },
  loadingReviews: {
    marginVertical: 20,
  },
  noReviews: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    marginVertical: 10,
  },
  noReviewsText: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    marginBottom: 5,
  },
  noReviewsSubtext: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 14,
    color: "#999",
    textAlign: 'center',
  },
  reviewItem: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#A68B69',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#fff',
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 14,
  },
  reviewerName: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 14,
    color: "#000",
  },
  reviewDate: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 12,
    color: "#666",
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  viewAllReviewsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3EFE9',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  viewAllReviewsText: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 14,
    color: "#A68B69",
    marginRight: 5,
  },
  star: {
    marginRight: 2,
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