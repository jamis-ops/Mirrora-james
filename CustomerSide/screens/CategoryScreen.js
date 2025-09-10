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
import { collection, getDocs } from "firebase/firestore";
import { db } from "../Backend/firebaseConfig";

const { width } = Dimensions.get("window");

export default function CategoryScreen() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "categories"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("🔥 Categories fetched:", data);
        setCategories(data);
      } catch (error) {
        console.error("❌ Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Loading categories...</Text>
      </View>
    );
  }

  if (categories.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No categories found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ✅ Custom Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="chevron-left" size={30} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Category</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* ✅ Category List */}
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.itemContainer}
            onPress={() =>
              navigation.navigate("ProductListScreen", {
                categoryId: item.id, // pass doc.id
                categoryName: item.name, // pass name for title
              })
            }
          >
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
            ) : (
              <View style={[styles.itemImage, styles.placeholder]}>
                <Text>No Image</Text>
              </View>
            )}
            <Text style={styles.itemName}>{item.name}</Text>
          </TouchableOpacity>
        )}
        numColumns={2}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: "#f9f9f9",
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#000" },
  list: { padding: 10 },
  itemContainer: {
    flex: 1,
    margin: 10,
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    alignItems: "center",
    padding: 15,
  },
  itemImage: {
    width: width / 2 - 60,
    height: width / 2 - 60,
    borderRadius: 10,
    marginBottom: 10,
  },
  placeholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ddd",
  },
  itemName: { fontSize: 16, fontWeight: "600", textAlign: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
