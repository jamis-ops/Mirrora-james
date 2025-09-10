import React, { useState } from 'react'; 
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native'; 
import { useNavigation } from "@react-navigation/native"; 
import Icon from "react-native-vector-icons/MaterialCommunityIcons"; 
import { useFonts as useLeagueSpartan, LeagueSpartan_700Bold } from "@expo-google-fonts/league-spartan"; 
import { useFonts as useMontserrat, Montserrat_400Regular, Montserrat_600SemiBold } from "@expo-google-fonts/montserrat"; 
import { db, auth } from '../Backend/firebaseConfig'; // Import Firebase Firestore and Auth
import { collection, addDoc, Timestamp } from 'firebase/firestore'; // Firestore functions

export default function CheckoutScreen() { 
    const navigation = useNavigation(); 
    const [leagueSpartanLoaded] = useLeagueSpartan({ LeagueSpartan_700Bold }); 
    const [montserratLoaded] = useMontserrat({ Montserrat_400Regular, Montserrat_600SemiBold }); 
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('bankTransfer'); 
    const [cartItems, setCartItems] = useState([ 
        { 
            id: '1', 
            name: 'Floor Standing Mirror', 
            size: "60.2\" x 51.2\"", 
            price: 2000, 
            quantity: 1, 
            image: require('../assets/mirror4.png') 
        }, 
    ]); 

    if (!leagueSpartanLoaded || !montserratLoaded) { 
        return null; 
    } 

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0); 
    const deliveryFee = 0; 
    const total = subtotal + deliveryFee; 

    // Function to handle placing the order and saving to Firestore
    const handlePlaceOrder = async () => {
        // Get userId dynamically from Firebase Authentication
        const user = auth.currentUser;
        const userId = user ? user.uid : null;

        if (!userId) {
            console.log("User is not authenticated");
            return; // If no user is logged in, don't proceed with order placement
        }

        try {
            const orderData = {
                userId: userId,  // Store user ID dynamically
                items: cartItems, // Array of items in the order
                total: total, // Total cost
                status: 'Pending',  // Initial status of the order
                createdAt: Timestamp.fromDate(new Date()),  // Timestamp for order creation
            };
            
            // Save the order data to Firestore in the 'orders' collection
            const docRef = await addDoc(collection(db, 'orders'), orderData);
            console.log("Order placed with ID: ", docRef.id);

            // Navigate to Order Confirmation Screen
            navigation.navigate('OrderConfirmationScreen');
        } catch (e) {
            console.error("Error adding document: ", e);
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
                            <Image source={item.image} style={styles.checkoutItemImage} />
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
                    <Text style={styles.sectionTitle}>Address</Text> 
                    <View style={styles.addressContainer}> 
                        <Text style={styles.addressText}>123 Tonying Street, Mactan Proper, Lapu-Lapu City</Text> 
                        <TouchableOpacity> 
                            <Icon name="pencil-outline" size={20} color="#888" /> 
                        </TouchableOpacity> 
                    </View> 
                </View> 
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
    // Add your styles here
});
