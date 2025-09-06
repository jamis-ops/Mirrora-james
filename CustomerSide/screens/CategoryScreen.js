import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useFonts as useLeagueSpartan, LeagueSpartan_700Bold } from "@expo-google-fonts/league-spartan";
import { useFonts as useMontserrat, Montserrat_400Regular, Montserrat_600SemiBold } from "@expo-google-fonts/montserrat";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

/**
 * The BottomNavigationBar component.
 */
const BottomNavigationBar = ({ navigation }) => {
  const route = useRoute();

  const navItems = [
    { name: 'home', icon: 'home-outline', activeIcon: 'home', screen: 'Home' },
    { name: 'categories', icon: 'contrast-outline', activeIcon: 'contrast', screen: 'CategoryScreen' },
    { name: 'wishlist', icon: 'heart-outline', activeIcon: 'heart', screen: 'Wishlist' },
    { name: 'cart', icon: 'cart-outline', activeIcon: 'cart', screen: 'CartScreen' },
    { name: 'account', icon: 'person-outline', activeIcon: 'person', screen: 'ProfileScreen' },
  ];

  const insets = useSafeAreaInsets();

  const handlePress = (item) => {
    if (item.screen && navigation) {
      navigation.navigate(item.screen);
    }
  };

  return (
    <View style={[styles.bottomNav, { paddingBottom: insets.bottom }]}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.name}
          style={styles.navItem}
          onPress={() => handlePress(item)}
        >
          <Ionicons
            name={route.name === item.screen ? item.activeIcon : item.icon}
            size={26}
            color={route.name === item.screen ? '#A68B69' : 'gray'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

/**
 * The Category screen component.
 */
export default function CategoryScreen() {
  const navigation = useNavigation();

  // State to hold the fetched categories
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [leagueSpartanLoaded] = useLeagueSpartan({
    LeagueSpartan_700Bold,
  });

  const [montserratLoaded] = useMontserrat({
    Montserrat_400Regular,
    Montserrat_600SemiBold
  });

  // Fetch data from the API when the component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('YOUR_API_ENDPOINT_HERE'); // <-- REPLACE THIS WITH YOUR BACKEND API URL
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError('Failed to load categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (!leagueSpartanLoaded || !montserratLoaded) {
    return null;
  }
  
  // Render loading indicator or error message based on state
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#A68B69" />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-left" size={30} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Category</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Grid of category items */}
      <FlatList
        data={categories} // Use the fetched categories
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => {
          const isSelected = selectedCategory === item.id;
          return (
            <TouchableOpacity 
              style={[
                styles.itemContainer,
                isSelected && styles.selectedItemContainer,
              ]}
              onPress={() => {
                setSelectedCategory(item.id);
                navigation.navigate('ProductListScreen', { categoryName: item.name });
              }}
            >
              {/* NOTE: If your API returns a URL, you will need to change 'source' to:
                  source={{ uri: item.imageUrl }}
                  If the images are local assets, you will have to map the API name to the local require statement
              */}
              <Image source={item.image} style={styles.itemImage} />
              {isSelected && (
                <View style={styles.itemOverlay}>
                  <View style={styles.selectedItemCircle}>
                    <Text style={styles.selectedItemText}>{item.name}</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />

      {/* Bottom Navigation Bar */}
      <BottomNavigationBar navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 30,
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
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  itemContainer: {
    width: (width - 45) / 2,
    height: 250,
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    position: 'relative',
  },
  selectedItemContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  itemOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  selectedItemCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedItemText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
});