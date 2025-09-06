import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Import screens
import SplashScreen from "../screens/SplashScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
import SignInScreen from "../screens/SignInScreen";
import CreateAccountScreen from '../screens/CreateAccountScreen';
import CompleteProfileScreen from "../screens/CompleteProfileScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen"; 
import HomeScreen from '../screens/HomeScreen';
import ProductScreen from '../screens/ProductScreen';
import WishlistScreen from "../screens/WishlistScreen";
import MessageScreen from '../screens/MessageScreen';
import CategoryScreen from "../screens/CategoryScreen";
import CartScreen from "../screens/CartScreen";
import ProfileScreen from "../screens/ProfileScreen"; 
import HelpAndSupportScreen from "../screens/HelpAndSupportScreen"; 
import CustomizationScreen from "../screens/CustomizationScreen";
import ProductListScreen from '../screens/ProductListScreen';
import ChatbotScreen from "../screens/ChatbotScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
import OrderConfirmationScreen from "../screens/OrderConfirmationScreen";
import MyOrderScreen from "../screens/MyOrderScreen";
import SettingScreen from "../screens/SettingScreen";

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
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
      <Stack.Screen name="OrderConfirmationScreen" component={OrderConfirmationScreen} />
      <Stack.Screen name="MyOrderScreen" component={MyOrderScreen} />
      <Stack.Screen name="SettingScreen" component={SettingScreen} />
    </Stack.Navigator>
  );
}
