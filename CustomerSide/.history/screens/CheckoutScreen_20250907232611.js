import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { db, auth } from '../Backend/firebaseConfig';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import Toast from 'react-native-toast-message';

export default function CheckoutScreen() {
    const navigation = useNavigation();
    const [placingOrder, setPlacingOrder] = useState(false);
    const [selectedPaymentMethod] = useState('bankTransfer');
    
    // This cartItems is a temporary mock.
    const [cartItems] = useState([
        { 
            id: 'IrregProduct2', 
            name: 'Floor Standing Mirror',
            size: "60.2\" x 51.2\"", 
            price: 2220,
            quantity: 1, 
            imageUrl: "https://via.placeholder.com/150"
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
            userId: user.uid,
            // Extract the singular item details to match the MyOrderScreen
            itemName: cartItems[0].name,
            itemSize: cartItems[0].size, // <-- FIX: Added this line
            itemImageUrl: cartItems[0].imageUrl,
            itemQuantity: cartItems[0].quantity, // <-- FIX: Added this line
            totalPayment: total,
            address: '123 Tonying Street, Mactan Proper, Lapu-Lapu City',
            paymentMethod: selectedPaymentMethod,
            status: 'Pending',
            createdAt: serverTimestamp(),
        };

        try {
            const docRef = await addDoc(collection(db, 'orders'), orderData);
            Toast.show({
                type: 'success',
                text1: 'Order Placed!',
                text2: 'Redirecting to order confirmation...',
            });
            navigation.navigate('OrderConfirmationScreen', { orderId: docRef.id });
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
            <Toast />
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