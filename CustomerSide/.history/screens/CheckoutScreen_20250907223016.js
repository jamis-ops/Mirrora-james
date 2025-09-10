import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { db, auth } from '../Backend/firebaseConfig'; // Firebase imports
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'; // Firestore imports
import Toast from 'react-native-toast-message';

export default function CheckoutScreen() {
  const navigation = useNavigation();
  const [placingOrder, setPlacingOrder] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('bankTransfer');
  
  const [cartItems, setCartItems] = useState([
    { 
      id: 'IrregProduct2', 
      name: 'LED Mirror with Aluminum Frame', 
      size: "60.2\" x 51.2\"", 
      price: 1499, 
      quantity: 1, 
      imageUrl: "https://res.cloudinary.com/dqwthfhya/image/upload/v1756954465/irreg2_qbhx1w.png" 
    },
  ]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

  const handleProceedToPlaceOrder = async () => {
    setPlacingOrder(true);
    const user = auth.currentUser;

    if (!user) {
      Toast.show({
        type: 'error',
        text1: 'Authentication Error',
        text2: 'Please sign in to place an order.',
      });
      setPlacingOrder(false);
      return;
    }

    const orderData = {
      userId: user.uid, // User ID of the logged-in user
      items: cartItems.map(item => ({
        addedAt: serverTimestamp(),
        id: item.id,
        imageUrl: item.imageUrl,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        status: 'pending', // The order status
        total: item.price * item.quantity,
      })),
      total: total,
      address: '123 Tonying Street, Mactan Proper, Lapu-Lapu City', // Example address
      paymentMethod: selectedPaymentMethod,
      status: 'Pending',
      createdAt: serverTimestamp(),
    };

    try {
      // Add the order to Firestore
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      Toast.show({
        type: 'success',
        text1: 'Order Placed!',
        text2: 'Redirecting to order confirmation...',
      });
      navigation.navigate('OrderConfirmationScreen', { orderId: docRef.id }); // Navigate to OrderConfirmationScreen with the order ID
    } catch (error) {
      console.error('Error placing order:', error);
      Toast.show({
        type: 'error',
        text1: 'Order Failed',
        text2: 'Could not place your order. Please try again.',
      });
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList 
        data={cartItems}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text>{item.name} x{item.quantity}</Text>
            <Text>₱ {Number(item.price).toLocaleString()}</Text>
          </View>
        )}
        scrollEnabled={false}
      />

      <Text style={styles.total}>Total: ₱ {total.toLocaleString()}</Text>

      <TouchableOpacity
        style={styles.placeOrderButton}
        onPress={handleProceedToPlaceOrder}
        disabled={placingOrder}
      >
        {placingOrder ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.placeOrderButtonText}>Proceed to Place Order</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF7EC', padding: 20 },
  itemContainer: { padding: 10, backgroundColor: '#fff', marginBottom: 10, borderRadius: 10 },
  total: { fontSize: 20, fontWeight: 'bold', marginTop: 20 },
  placeOrderButton: { backgroundColor: '#A68B69', padding: 15, borderRadius: 10, marginTop: 30 },
  placeOrderButtonText: { fontSize: 16, color: '#fff', textAlign: 'center' },
});
