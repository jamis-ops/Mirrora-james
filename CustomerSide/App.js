import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from './navigation/StackNavigator';
import TabNavigator from "./components/TabNavigator";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ChatProvider } from './context/ChatContext'; // Adjust path if needed

export default function App() {
  return (
   <SafeAreaProvider>
      <NavigationContainer>
        <ChatProvider>
          <StackNavigator />  {/* StackNavigator now wraps TabNavigator */}
        </ChatProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}