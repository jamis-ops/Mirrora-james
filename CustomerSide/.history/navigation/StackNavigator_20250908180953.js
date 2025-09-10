import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Toast, { BaseToast } from "react-native-toast-message";
import { StyleSheet, Platform, StatusBar } from "react-native";

// Import screens (adjust paths if your project structure differs)
import SplashScreen from "../screens/SplashScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
import SignInScreen from "../screens/SignInScreen";
import CreateAccountScreen from "../screens/CreateAccountScreen";
import CompleteProfileScreen from "../screens/CompleteProfileScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import HomeScreen from "../screens/HomeScreen";
import ProductScreen from "../screens/ProductScreen";
import WishlistScreen from "../screens/WishlistScreen";
import MessageScreen from "../screens/MessageScreen";
import CategoryScreen from "../screens/CategoryScreen";
import CartScreen from "../screens/CartScreen";
import ProfileScreen from "../screens/ProfileScreen";
import HelpAndSupportScreen from "../screens/HelpAndSupportScreen";
import CustomizationScreen from "../screens/CustomizationScreen";
import ProductListScreen from "../screens/ProductListScreen";
import ChatbotScreen from "../screens/ChatbotScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
import OrderConfirmationScreen from "../screens/OrderConfirmationScreen";
import MyOrderScreen from "../screens/MyOrderScreen";
import SettingScreen from "../screens/SettingScreen";

const Stack = createNativeStackNavigator();

// Toast styles
const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={[styles.toastContainer, { borderLeftColor: "#4CAF50" }]}
      text1Style={styles.toastTitle}
      text2Style={styles.toastMessage}
    />
  ),
  error: (props) => (
    <BaseToast
      {...props}
      style={[styles.toastContainer, { borderLeftColor: "#F44336" }]}
      text1Style={styles.toastTitle}
      text2Style={styles.toastMessage}
    />
  ),
  info: (props) => (
    <BaseToast
      {...props}
      style={[styles.toastContainer, { borderLeftColor: "#2196F3" }]}
      text1Style={styles.toastTitle}
      text2Style={styles.toastMessage}
    />
  ),
};

export default function StackNavigator() {
  return (
    <>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
        <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ProductScreen" component={ProductScreen} />
        <Stack.Screen name="Wishlist" component={WishlistScreen} />
        <Stack.Screen name="MessageScreen" component={MessageScreen} />
        <Stack.Screen name="CategoryScreen" component={CategoryScreen} />
        <Stack.Screen name="CartScreen" component={CartScreen} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="HelpAndSupportScreen" component={HelpAndSupportScreen} />
        <Stack.Screen name="CustomizationScreen" component={CustomizationScreen} />
        <Stack.Screen name="ProductListScreen" component={ProductListScreen} />
        <Stack.Screen name="ChatbotScreen" component={ChatbotScreen} />
        <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />
        {/* Removed PlaceOrderScreen since it's deleted */}
        <Stack.Screen name="OrderConfirmationScreen" component={OrderConfirmationScreen} />
        <Stack.Screen name="MyOrderScreen" component={MyOrderScreen} />
        <Stack.Screen name="SettingScreen" component={SettingScreen} />
      </Stack.Navigator>
      <Toast
        config={toastConfig}
        position="top"
        topOffset={Platform.OS === "android" ? StatusBar.currentHeight + 10 : 50}
        visibilityTime={2500}
      />
    </>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    borderLeftWidth: 6,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    marginHorizontal: 16,
  },
  toastTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111",
  },
  toastMessage: {
    fontSize: 13,
    color: "#444",
  },
});
