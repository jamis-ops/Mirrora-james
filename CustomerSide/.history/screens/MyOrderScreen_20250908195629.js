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
    const [activeTab, setActiveTab] = useState('Pending');  // Default tab to show Pending orders

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
                where('userId', '==', userId),  // Get orders for the current user
                orderBy('createdAt', 'desc')    // Order by creation date (newest first)
            );

            // Real-time listener to fetch orders as they are added/updated
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const fetchedOrders = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),  // Get all data from the order document
                }));
                setOrders(fetchedOrders); // Update orders in state
                setIsLoading(false); // Stop loading when data is fetched
            });

            return unsubscribe;  // Return unsubscribe to clean up the listener when the component unmounts
        };

        fetchOrders(); // Fetch orders when component mounts
    }, []);  // Empty dependency array means this effect runs only once (on mount)

    const handleTabChange = (tab) => {
        setActiveTab(tab);  // Change active tab to filter orders
    };

    const handleCancelOrder = (orderId) => {
        // Logic to cancel the order (this could update the Firestore document's status)
    };

    if (isLoading) {
        return <ActivityIndicator size="large" color="#A68B69" />;
    }

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={30} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Orders</Text>
                <View style={styles.profileIconContainer}>
                    <Ionicons name="person-circle" size={40} color="#fff" />
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                {['Pending', 'Shipped', 'To Receive', 'Completed', 'Cancelled'].map((status) => (
                    <TouchableOpacity
                        key={status}
                        style={[styles.tab, activeTab === status && styles.activeTab]}
                        onPress={() => handleTabChange(status)}
                    >
                        <Text style={styles.tabText}>{status}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Order List */}
            {orders.filter(order => order.status === activeTab).map((order, index) => (
                <View key={index} style={styles.orderCard}>
                    <View style={styles.orderHeader}>
                        <Text style={styles.orderId}>Order ID: {order.id}</Text>
                        <Text style={[styles.statusText, { color: order.status === 'Pending' ? '#ff9800' : '#4caf50' }]}>
                            {order.status}
                        </Text>
                    </View>
                    {order.items.map((item, idx) => (
                        <View key={idx} style={styles.orderItem}>
                            <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
                            <Text style={styles.itemName}>{item.name} x{item.quantity}</Text>
                        </View>
                    ))}
                    <Text style={styles.totalText}>Total: ₱ {order.total}</Text>
                    <TouchableOpacity onPress={() => handleCancelOrder(order.id)} style={styles.cancelButton}>
                        <Text style={styles.cancelButtonText}>Cancel Order</Text>
                    </TouchableOpacity>
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    // Add your styles here (same as previously provided)
});

export default MyOrderScreen;
