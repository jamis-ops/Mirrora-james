import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from './navigation/StackNavigator';
import TabNavigator from "./components/TabNavigator";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function App() {
  return (
   <SafeAreaProvider>
      <NavigationContainer>
        <StackNavigator />  {/* StackNavigator now wraps TabNavigator */}
      </NavigationContainer>
    </SafeAreaProvider>
  )
}