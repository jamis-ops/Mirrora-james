import React, { useState, useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StyleSheet, Platform, StatusBar, View, TouchableOpacity } from "react-native";
import Toast, { BaseToast } from "react-native-toast-message";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../Backend/firebaseConfig";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

// Import screens
import SplashScreen from "../screens/SplashScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
import SignInScreen from "../screens/SignInScreen";
import CreateAccountScreen from "../screens/CreateAccountScreen";
import CompleteProfileScreen from "../screens/CompleteProfileScreen";
import ProductScreen from "../screens/ProductScreen";
import MessageScreen from "../screens/MessageScreen";
import ChatScreen from "../screens/ChatScreen";
import HelpAndSupportScreen from "../screens/HelpAndSupportScreen";
import CustomizationScreen from "../screens/CustomizationScreen";
import ProductListScreen from "../screens/ProductListScreen";
import ChatbotScreen from "../screens/ChatbotScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
import OrderConfirmationScreen from "../screens/OrderConfirmationScreen";
import MyOrderScreen from "../screens/MyOrderScreen";
import SettingScreen from "../screens/SettingScreen";
import VerifyEmailScreen from "../screens/VerifyEmailScreen";
import CustomOrderCheckoutScreen from "../screens/CustomOrderCheckoutScreen";
import ReviewScreen from "../screens/ReviewScreen";
import CartScreen from "../screens/CartScreen";
import TabNavigator from "../components/TabNavigator";
import FloatingChatbot from "../components/FloatingChatbot";
import AboutUsScreen from "../screens/AboutUsScreen";
import MyAddressScreen from "../screens/MyAddressScreen";

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
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentRouteName, setCurrentRouteName] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth State Changed:", {
        user: !!currentUser,
        uid: currentUser?.uid || "No UID",
        email: currentUser?.email || "No email",
      });
      setUser(currentUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Function to handle navigation state changes
  const onNavigationStateChange = (state) => {
    if (state && state.routes && state.routes.length > 0) {
      const currentRoute = state.routes[state.index];
      let routeName = currentRoute.name;

      if (currentRoute.state && currentRoute.state.routes && currentRoute.state.routes.length > 0) {
        const nestedRoute = currentRoute.state.routes[currentRoute.state.index];
        routeName = nestedRoute.name;
      }

      setCurrentRouteName(routeName);

      console.log("Navigation State Changed:", {
        topLevelRoute: currentRoute.name,
        currentRouteName: routeName,
        isNested: !!currentRoute.state,
      });
    } else {
      console.log("Navigation State Changed: No valid state");
    }
  };

  const hiddenScreens = [
    "Splash",
    "Onboarding",
    "Welcome",
    "SignIn",
    "CreateAccount",
    "CompleteProfile",
    "VerifyEmail",
    "MessageScreen",
    "ChatScreen",
    "ChatbotScreen",
  ];

  const shouldShowFloatingChatbot = !isLoading && !hiddenScreens.includes(currentRouteName);

  if (isLoading) {
    console.log("Rendering null due to isLoading=true");
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={({ navigation }) => ({
          headerStyle: {
            backgroundColor: '#A67B5B',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontFamily: 'LeagueSpartan_700Bold',
            fontSize: 20,
          },
          headerShadowVisible: true,
          headerBackVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Icon name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        })}
      >
        {/* Authentication Screens */}
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CreateAccount" component={CreateAccountScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} options={{ headerShown: false }} />
        <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} options={{ headerShown: false }} />

        {/* Main App Screens */}
        <Stack.Screen name="Home" component={TabNavigator} options={{ headerShown: false }} />

        {/* Product Related Screens */}
        <Stack.Screen
          name="ProductScreen"
          component={ProductScreen}
          options={{ title: 'Product Details' }}
        />
        <Stack.Screen
          name="ProductListScreen"
          component={ProductListScreen}
          options={({ route }) => ({
            title: route.params?.category || '',
          })}
        />
        <Stack.Screen
          name="CustomizationScreen"
          component={CustomizationScreen}
          options={{ title: 'Customize Your Mirror' }}
        />

        {/* Order Related Screens */}
        <Stack.Screen
          name="CheckoutScreen"
          component={CheckoutScreen}
          options={{ headerShown: false }} // Removed header
        />
        <Stack.Screen
          name="OrderConfirmationScreen"
          component={OrderConfirmationScreen}
          options={{ headerShown: false }} 
        />
        <Stack.Screen
          name="MyOrderScreen"
          component={MyOrderScreen}
          options={{ title: 'My Orders', headerShown: false }}
        />
        <Stack.Screen
          name="ReviewScreen"
          component={ReviewScreen}
          options={{ title: 'Write a Review' }}
        />

        {/* Message/Chat Related Screens */}
        <Stack.Screen
          name="MessageScreen"
          component={MessageScreen}
          options={{
            title: 'Messages',
            headerLeft: null,
            headerStyle: {
              backgroundColor: '#A67B5B',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 4,
            },
          }}
        />
        <Stack.Screen
          name="ChatScreen"
          component={ChatScreen}
          options={{
            title: 'Mirrora Support',
            headerLeft: null,
            headerStyle: {
              backgroundColor: '#A67B5B',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 6,
            },
          }}
        />
        <Stack.Screen
          name="ChatbotScreen"
          component={ChatbotScreen}
          options={{ title: 'Chatbot Assistant' }}
        />
        <Stack.Screen
          name="CustomOrderCheckoutScreen"
          component={CustomOrderCheckoutScreen}
          options={{ title: 'Custom Order Checkout' }}
        />

        {/* Other Screens */}
        <Stack.Screen
          name="HelpAndSupportScreen"
          component={HelpAndSupportScreen}
          options={{ title: 'Help & Support' }}
        />
        <Stack.Screen
          name="SettingScreen"
          component={SettingScreen}
          options={{ title: 'Settings', headerShown: false }}
        />
        <Stack.Screen
          name="AboutUsScreen"
          component={AboutUsScreen}
          options={{ title: 'AboutUsScreen', headerShown: false }}
        />
        <Stack.Screen
          name="MyAddressScreen"
          component={MyAddressScreen}
          options={{ title: 'My Address', headerShown: false }}
        />
        <Stack.Screen
          name="CartScreen"
          component={CartScreen}
          options={{ headerShown: false }} // Removed header
        />
      </Stack.Navigator>

      {/* Floating Chatbot */}
      {shouldShowFloatingChatbot && <FloatingChatbot />}

      <Toast
        config={toastConfig}
        position="top"
        topOffset={Platform.OS === "android" ? StatusBar.currentHeight + 10 : 50}
        visibilityTime={2500}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    padding: 10,
    borderRadius: 12,
  },
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
    fontFamily: 'Montserrat_600SemiBold',
  },
  toastMessage: {
    fontSize: 13,
    color: "#6B7280",
    fontFamily: 'Montserrat_400Regular',
  },
});