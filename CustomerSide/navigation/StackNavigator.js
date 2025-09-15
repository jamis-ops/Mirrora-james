import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Toast, { BaseToast } from "react-native-toast-message";
import { StyleSheet, Platform, StatusBar } from "react-native";

// Import screens
import SplashScreen from "../screens/SplashScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
import SignInScreen from "../screens/SignInScreen";
import CreateAccountScreen from "../screens/CreateAccountScreen";
import CompleteProfileScreen from "../screens/CompleteProfileScreen";
import ProductScreen from "../screens/ProductScreen";
import MessageScreen from "../screens/MessageScreen";
import ChatScreen from "../screens/ChatScreen"; // New chat screen
import HelpAndSupportScreen from "../screens/HelpAndSupportScreen";
import CustomizationScreen from "../screens/CustomizationScreen";
import ProductListScreen from "../screens/ProductListScreen";
import ChatbotScreen from "../screens/ChatbotScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
import OrderConfirmationScreen from "../screens/OrderConfirmationScreen";
import MyOrderScreen from "../screens/MyOrderScreen";
import SettingScreen from "../screens/SettingScreen";
import VerifyEmailScreen from "../screens/VerifyEmailScreen";

// Import TabNavigator
import TabNavigator from "../components/TabNavigator";
import ReviewScreen from "../screens/ReviewScreen";

const Stack = createNativeStackNavigator();

// Toast config with Mirrora colors
const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={[styles.toastContainer, { borderLeftColor: "#A67B5B" }]}
      text1Style={styles.toastTitle}
      text2Style={styles.toastMessage}
    />
  ),
  error: (props) => (
    <BaseToast
      {...props}
      style={[styles.toastContainer, { borderLeftColor: "#DC2626" }]}
      text1Style={styles.toastTitle}
      text2Style={styles.toastMessage}
    />
  ),
  info: (props) => (
    <BaseToast
      {...props}
      style={[styles.toastContainer, { borderLeftColor: "#8B5E3C" }]}
      text1Style={styles.toastTitle}
      text2Style={styles.toastMessage}
    />
  ),
};

export default function StackNavigator() {
  return (
    <>
      <Stack.Navigator 
        initialRouteName="Splash" 
        screenOptions={{ headerShown: false }}
      >
        {/* Authentication Screens */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
        <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
        <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />

        {/* Main App Screens */}
        <Stack.Screen name="Home" component={TabNavigator} />
        
        {/* Product Related Screens */}
        <Stack.Screen name="ProductScreen" component={ProductScreen} />
        <Stack.Screen name="ProductListScreen" component={ProductListScreen} />
        <Stack.Screen name="CustomizationScreen" component={CustomizationScreen} />
        
        {/* Order Related Screens */}
        <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />
        <Stack.Screen name="OrderConfirmationScreen" component={OrderConfirmationScreen} />
        <Stack.Screen name="MyOrderScreen" component={MyOrderScreen} />
        <Stack.Screen name="ReviewScreen" component={ReviewScreen} />
        
        {/* Message/Chat Related Screens */}
        <Stack.Screen name="MessageScreen" component={MessageScreen} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} />
        <Stack.Screen name="ChatbotScreen" component={ChatbotScreen} />
        
        {/* Other Screens */}
        <Stack.Screen name="HelpAndSupportScreen" component={HelpAndSupportScreen} />
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

// Toast styles with Mirrora theme
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
    color: "#2C1810",
  },
  toastMessage: {
    fontSize: 13,
    color: "#6B7280",
  },
});