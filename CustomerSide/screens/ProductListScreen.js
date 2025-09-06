import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useFonts as useLeagueSpartan, LeagueSpartan_700Bold } from "@expo-google-fonts/league-spartan";
import { useFonts as useMontserrat, Montserrat_400Regular, Montserrat_600SemiBold } from "@expo-google-fonts/montserrat";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Dummy data for all products, organized by category
const allProducts = {
  'Irregular Mirror': [
    { id: '1', name: 'Wavy Irregular Mirror', price: '₱ 2,500', image: require('../assets/irregular_1.png') },
    { id: '2', name: 'Pebble Mirror', price: '₱ 2,800', image: require('../assets/irregular_2.png') },
    { id: '3', name: 'Cloud Mirror', price: '₱ 2,600', image: require('../assets/irregular_2.png') },
    { id: '4', name: 'Organic Frameless', price: '₱ 3,200', image: require('../assets/irregular_2.png') },
    { id: '5', name: 'Fluid Accent Mirror', price: '₱ 2,900', image: require('../assets/irregular_2.png') },
  ],
  'Capsule Mirror': [
    { id: '1', name: 'Classic Oval Mirror', price: '₱ 2,000', image: require('../assets/capsule_1.png') },
    { id: '2', name: 'Slimline Capsule', price: '₱ 2,100', image: require('../assets/capsule_2.png') },
    { id: '3', name: 'Full-Length Oval', price: '₱ 3,500', image: require('../assets/Category/capsule_3.png') },
    { id: '4', name: 'Capsule with Lights', price: '₱ 2,900', image: require('../assets/capsule_2.png') },
    { id: '5', name: 'Modern Black Frame', price: '₱ 2,200', image: require('../assets/capsule_2.png') },
  ],
  'Grid Mirror': [
    { id: '1', name: 'Black Metal Grid', price: '₱ 3,000', image: require('../assets/grid_1.png') },
    { id: '2', name: 'Window Pane Mirror', price: '₱ 3,200', image: require('../assets/Category/grid.png') },
    { id: '3', name: 'Circular Grid', price: '₱ 3,100', image: require('../assets/Category/grid.png') },
    { id: '4', name: 'Arch Grid Mirror', price: '₱ 3,500', image: require('../assets/Category/grid.png') },
    { id: '5', name: 'Gold Frame Grid', price: '₱ 3,300', image: require('../assets/Category/grid.png') },
  ],
  'Arch Mirror': [
    { id: '1', name: 'Slim Arch Mirror', price: '₱ 2,800', image: require('../assets/arch_1.png') },
    { id: '2', name: 'Full-Length Arch', price: '₱ 3,800', image: require('../assets/arch_2.png') },
    { id: '3', name: 'Arched Gold Frame', price: '₱ 3,100', image: require('../assets/arch_2.png') },
    { id: '4', name: 'Thin Arch Mirror', price: '₱ 2,700', image: require('../assets/arch_2.png') },
    { id: '5', name: 'Matte Black Arch', price: '₱ 2,900', image: require('../assets/arch_2.png') },
  ],
  'Round Mirror': [
    { id: '1', name: 'Aluminum Frame', price: '₱ 2,000', image: require('../assets/WelcomeScreen/mirror1.png') },
    { id: '2', name: 'LED Mirror with Aluminum Frame', price: '₱ 2,000', image: require('../assets/WelcomeScreen/mirror2.png') },
    { id: '3', name: 'Rafflesia Accent Mirror', price: '₱ 2,000', image: require('../assets/WelcomeScreen/mirror3.png') },
    { id: '4', name: 'Wood Frame', price: '₱ 2,000', image: require('../assets/mirror4.png') },
    { id: '5', name: 'Frameless with LED', price: '₱ 2,000', image: require('../assets/WelcomeScreen/mirror2.png') },
    { id: '6', name: 'Rattan in Sunrays', price: '₱ 2,000', image: require('../assets/WelcomeScreen/mirror2.png') },
    { id: '7', name: 'Grecian Wood Frame', price: '₱ 2,000', image: require('../assets/WelcomeScreen/mirror2.png') },
    { id: '8', name: 'Backlight', price: '₱ 2,000', image: require('../assets/WelcomeScreen/mirror2.png') },
    { id: '9', name: 'Akay Accent Mirror', price: '₱ 2,000', image: require('../assets/WelcomeScreen/mirror2.png') },
  ],
};

const { width } = Dimensions.get('window');

export default function ProductListScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { categoryName } = route.params;

  // Load fonts
  const [leagueSpartanLoaded] = useLeagueSpartan({ LeagueSpartan_700Bold });
  const [montserratLoaded] = useMontserrat({ Montserrat_400Regular, Montserrat_600SemiBold });
  
  const insets = useSafeAreaInsets();

  if (!leagueSpartanLoaded || !montserratLoaded) {
    return null; // Wait for fonts to load
  }

  // Filter products based on the category name
  const productsToDisplay = allProducts[categoryName] || [];

  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate('ProductScreen', { product: item })}
    >
      <View style={styles.imageWrapper}>
        <Image source={item.image} style={styles.itemImage} />
        <TouchableOpacity style={styles.wishlistIcon}>
          <Ionicons name="heart-outline" size={24} color="#A68B69" />
        </TouchableOpacity>
      </View>
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>{item.price}</Text>
        <TouchableOpacity style={styles.addToCartButton}>
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-left" size={30} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>{categoryName}</Text>
        <TouchableOpacity style={styles.wishlistIconHeader}>
          <Ionicons name="heart-outline" size={26} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Product List */}
      <FlatList
        data={productsToDisplay}
        renderItem={renderProductItem}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7EC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 24,
    color: '#000',
  },
  wishlistIconHeader: {
    padding: 5,
  },
  listContainer: {
    paddingTop: 15,
    paddingHorizontal: 10,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  itemContainer: {
    width: (Dimensions.get('window').width - 45) / 2,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
    marginHorizontal: 5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  imageWrapper: {
    position: 'relative',
    height: 180,
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  wishlistIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 5,
  },
  itemDetails: {
    padding: 10,
    backgroundColor: '#F9F7EF',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  itemName: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 14,
    color: '#000',
  },
  itemPrice: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 16,
    color: '#A68B69',
    marginTop: 5,
    marginBottom: 5,
  },
  addToCartButton: {
    backgroundColor: '#BF9E7B',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  addToCartText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 12,
    color: '#fff',
  },
});