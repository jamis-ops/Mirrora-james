import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { db, auth } from '../Backend/firebaseConfig';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const MyOrderScreen = () => {
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('Pending');

    useEffect(() => {
        const fetchOrders = () => {
            const user = auth.currentUser;
            if (!user) {
                setIsLoading(false);
                return;
            }

            const userId = user.uid; // Get logged-in user's ID
            const q = query(
                collection(db, 'orders'),
                where('userId', '==', userId), // Get orders for the current user
                orderBy('createdAt', 'desc')   // Sort by creation date (newest first)
            );

            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const fetchedOrders = querySnapshot.docs.map(doc => doc.data());
                setOrders(fetchedOrders);  // Set orders data
                setIsLoading(false);
            });

            return unsubscribe; // Cleanup listener when component unmounts
        };

        fetchOrders();
    }, [activeTab]); // Re-fetch when activeTab changes

    if (isLoading) {
        return <ActivityIndicator size="large" color="#A68B69" />;
    }

    return (
        <ScrollView>
            {orders.map((order, index) => (
                <View key={index} style={styles.orderCard}>
                    <Text style={styles.statusText}>{order.status}</Text>
                    {order.items.map((item, idx) => (
                        <View key={idx} style={styles.orderItem}>
                            <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
                            <Text>{item.name} x{item.quantity}</Text>
                            <Text>₱ {item.price}</Text>
                        </View>
                    ))}
                    <Text>Total: ₱ {order.total}</Text>
                    <TouchableOpacity onPress={() => handleCancelOrder(order.id)} style={styles.cancelButton}>
                        <Text>Cancel Order</Text>
                    </TouchableOpacity>
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    orderCard: {
        padding: 15,
        backgroundColor: '#fff',
        marginBottom: 10,
        borderRadius: 10,
    },
    statusText: {
        fontWeight: 'bold',
        marginBottom: 10,
    },
    orderItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    productImage: {
        width: 50,
        height: 50,
        marginRight: 10,
    },
    cancelButton: {
        backgroundColor: '#f2f2f2',
        padding: 10,
        marginTop: 10,
        alignItems: 'center',
    },
});

export default MyOrderScreen;
