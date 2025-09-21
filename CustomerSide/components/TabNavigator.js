// navigation/TabNavigator.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Screens
import HomeScreen from "../screens/HomeScreen";
import CategoryScreen from "../screens/CategoryScreen";
import WishlistScreen from "../screens/WishlistScreen";
import CartScreen from "../screens/CartScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const insets = useSafeAreaInsets(); // For safe area on devices with notches

  // Optional: Log tab navigation changes for debugging
  const onTabStateChange = (state) => {
    if (state && state.routes && state.routes.length > 0) {
      const currentTab = state.routes[state.index];
      console.log("Tab Changed:", currentTab.name);
    }
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") iconName = focused ? "home" : "home-outline";
          else if (route.name === "Categories") iconName = focused ? "contrast" : "contrast-outline";
          else if (route.name === "Wishlist") iconName = focused ? "heart" : "heart-outline";
          else if (route.name === "Cart") iconName = focused ? "cart" : "cart-outline";
          else if (route.name === "Profile") iconName = focused ? "person" : "person-outline";

          return <Ionicons name={iconName} size={26} color={color} />;
        },
        tabBarActiveTintColor: "#A68B69",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 5,
          backgroundColor: "#fff",
        },
      })}
      onStateChange={onTabStateChange} // Optional debugging
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Categories" component={CategoryScreen} />
      <Tab.Screen name="Wishlist" component={WishlistScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}