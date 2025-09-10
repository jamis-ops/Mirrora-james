import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { db } from "../firebase"; // <-- this is correct now
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function PlaceOrderScreen() {
  const navigation = useNavigation();

  const handlePlaceOrder = async () => {
    try {
      // Example order — later replace with real cart data
      await addDoc(collection(db, "orders"), {
        items: [{ name: "Sample Product", qty: 1, price: 100 }],
        status: "pending",
        createdAt: serverTimestamp(),
      });

      // Go to confirmation screen after placing order
      navigation.navigate("OrderConfirmationScreen");
    } catch (error) {
      console.error("❌ Error placing order:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Place Your Order</Text>
      <Button title="Confirm Order" onPress={handlePlaceOrder} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
});
