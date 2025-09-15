// src/pages/CategoryScreen.jsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Firebase
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../Backend/firebaseConfig";

const { width } = Dimensions.get("window");

export default function CategoryScreen() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "categories"),
      (querySnapshot) => {
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("🔥 Categories updated:", data);
        setCategories(data);
        setLoading(false);
      },
      (error) => {
        console.error("❌ Error listening to categories:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const renderCategory = ({ item, index }) => {
    // Determine if this item should span two columns (every 5th item)
    const isLargeItem = (index + 1) % 5 === 0;
    
    return (
      <TouchableOpacity
        style={[
          styles.categoryCard,
          isLargeItem ? styles.largeCategoryCard : styles.smallCategoryCard
        ]}
        onPress={() =>
          navigation.navigate("ProductListScreen", {
            categoryId: item.id,
            categoryName: item.name,
          })
        }
      >
        {item.imageUrl ? (
          <Image 
            source={{ uri: item.imageUrl }} 
            style={[
              styles.categoryImage,
              isLargeItem ? styles.largeCategoryImage : styles.smallCategoryImage
            ]} 
          />
        ) : (
          <View style={[
            styles.categoryImage,
            styles.placeholder,
            isLargeItem ? styles.largeCategoryImage : styles.smallCategoryImage
          ]}>
            <Icon name="image-outline" size={40} color="#999" />
          </View>
        )}
        <View style={styles.categoryOverlay}>
          <Text style={styles.categoryName}>{item.name}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  if (categories.length === 0) {
    return (
      <View style={styles.center}>
        <Icon name="tag-outline" size={60} color="#ccc" />
        <Text style={styles.emptyText}>No categories found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="chevron-left" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Category</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Category Grid */}
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={renderCategory}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  gridContainer: {
    padding: 16,
  },
  row: {
    justifyContent: "space-around",
    marginBottom: 16,
  },
  centerRow: {
    justifyContent: "center",
  },
  categoryCard: {
    width: (width - 50) / 2, // Account for padding and gap
    height: 210,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryImage: {
    width: "100%",
    height: 165,
    resizeMode: "cover",
  },
  placeholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  categoryOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "left",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    color: "#999",
    textAlign: "center",
  },
});