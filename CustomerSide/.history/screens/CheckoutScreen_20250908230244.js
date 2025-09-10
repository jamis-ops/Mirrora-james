import React, { useState } from 'react'; 
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, Alert } from 'react-native'; 
import { useNavigation } from "@react-navigation/native"; 
import Icon from "react-native-vector-icons/MaterialCommunityIcons"; 
import { db, auth } from '../Backend/firebaseConfig'; 
import { collection, addDoc, Timestamp } from 'firebase/firestore'; 

export default function CheckoutScreen() { 
    const navigation = useNavigation(); 
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('bankTransfer');
    const [cartItems, setCartItems] = useState([ 
        { 
            id: '1', 
            name: 'Floor Standing Mirror', 
            size: "60.2\" x 51.2\"", 
            price: 2000, 
            quantity: 1, 
            imageUrl: 'https://res.cloudinary.com/dqwthfhya/image/upload/v1756954464/irreg3_pfal4b.png' // Changed to imageUrl to match Firebase
        }, 
    ]); 

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0); 
    const deliveryFee = 0; 
    const total = subtotal + deliveryFee;

    const handlePlaceOrder = async () => {
        try {
            // Check if user is authenticated
            const user = auth.currentUser;
            console.log("Current user:", user);
            
            if (!user) {
                Alert.alert("Authentication Error", "Please log in to place an order");
                return;
            }

            const userId = user.uid;
            console.log("User ID:", userId);

            // Prepare order data with proper field names
            const orderData = {
                userID: userId,  // This field is crucial for fetching orders
                items: cartItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    size: item.size || '',
                    price: item.price,
                    quantity: item.quantity,
                    imageUrl: item.imageUrl // Use imageUrl to match Firebase structure
                })), 
                total: total,
                status: 'Pending', 
                createdAt: Timestamp.fromDate(new Date()),
                paymentMethod: selectedPaymentMethod
            };
            
            console.log("Saving order data:", orderData);
            
            const docRef = await addDoc(collection(db, 'orders'), orderData);
            console.log("Order placed with ID: ", docRef.id);

            Alert.alert(
                "Order Placed", 
                "Your order has been placed successfully!",
                [
                    {
                        text: "OK", 
                        onPress: () => navigation.navigate('OrderConfirmationScreen')
                    }
                ]
            );
        } catch (e) {
            console.error("Error adding document: ", e);
            Alert.alert("Error", "Failed to place order. Please try again.");
        }
    };

    return ( 
        <View style={styles.container}> 
            <View style={styles.header}> 
                <TouchableOpacity onPress={() => navigation.goBack()}> 
                    <Icon name="chevron-left" size={28} color="#000" /> 
                </TouchableOpacity> 
                <Text style={styles.headerTitle}>Check out</Text> 
                <View style={{ width: 28 }} /> 
            </View> 
            <ScrollView style={styles.content}> 
                <FlatList 
                    data={cartItems} 
                    keyExtractor={item => item.id} 
                    renderItem={({ item }) => (
                        <View style={styles.checkoutItemContainer}>
                            <Image 
                                source={{ uri: item.imageUrl }} 
                                style={styles.checkoutItemImage} 
                                defaultSource={require('../assets/placeholder.png')}
                            />
                            <View style={styles.checkoutItemDetails}>
                                <Text style={styles.checkoutItemName}>{item.name}</Text>
                                <Text style={styles.checkoutItemSize}>Size: {item.size}</Text>
                                <Text style={styles.checkoutItemPrice}>₱ {item.price.toLocaleString()}</Text>
                            </View>
                            <Text style={styles.checkoutItemQuantity}>x{item.quantity}</Text>
                        </View>
                    )}
                    scrollEnabled={false} 
                /> 
                <View style={styles.sectionContainer}> 
                    <Text style={styles.sectionTitle}>Order Summary</Text> 
                    <View style={styles.summaryRow}> 
                        <Text style={styles.summaryLabel}>Subtotal:</Text> 
                        <Text style={styles.summaryValue}>₱ {subtotal.toLocaleString()}</Text> 
                    </View> 
                    <View style={styles.summaryRow}> 
                        <Text style={styles.summaryLabel}>Delivery Fee:</Text> 
                        <Text style={styles.summaryValue}>Free</Text> 
                    </View> 
                    <View style={styles.summaryRow}> 
                        <Text style={styles.summaryLabel}>Total:</Text> 
                        <Text style={styles.summaryValue}>₱ {total.toLocaleString()}</Text> 
                    </View> 
                </View> 
                <View style={styles.sectionContainer}> 
                    <Text style={styles.sectionTitle}>Payment Method</Text> 
                    <View style={styles.paymentMethodOption}> 
                        <TouchableOpacity style={styles.radioButton} onPress={() => setSelectedPaymentMethod('bankTransfer')} > 
                            {selectedPaymentMethod === 'bankTransfer' && <View style={styles.radioButtonInner} />} 
                        </TouchableOpacity> 
                        <View style={styles.paymentDetails}> 
                            <Text style={styles.paymentLabel}>Bank Transfer</Text> 
                            <Text style={styles.paymentInfo}>50% down payment is required upon placing the order</Text> 
                        </View> 
                    </View> 
                </View> 
            </ScrollView> 
            <View style={styles.bottomBar}> 
                <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder}> 
                    <Text style={styles.placeOrderButtonText}>Place Order</Text> 
                </TouchableOpacity> 
            </View> 
        </View> 
    ); 
} 

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    checkoutItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    checkoutItemImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: '#f0f0f0',
    },
    checkoutItemDetails: {
        flex: 1,
    },
    checkoutItemName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 4,
    },
    checkoutItemSize: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    checkoutItemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#A68B69',
    },
    checkoutItemQuantity: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    sectionContainer: {
        marginTop: 20,
        padding: 16,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 16,
        color: '#666',
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    paymentMethodOption: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#A68B69',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    radioButtonInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#A68B69',
    },
    paymentDetails: {
        flex: 1,
    },
    paymentLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 4,
    },
    paymentInfo: {
        fontSize: 14,
        color: '#666',
    },
    bottomBar: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        backgroundColor: '#fff',
    },
    placeOrderButton: {
        backgroundColor: '#A68B69',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    placeOrderButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});