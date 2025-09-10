import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { db, auth } from '../Backend/firebaseConfig'; // Import Firestore and Auth
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'; // Firestore functions
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const MyOrderScreen = () => {
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('Pending'); // Active tab state for filtering orders

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
                where('userId', '==', userId), // Filter orders by userId
                orderBy('createdAt', 'desc')   // Order by creation date (newest first)
            );

            // Real-time listener
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const fetchedOrders = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setOrders(fetchedOrders); // Update the orders state
                setIsLoading(false); // Stop loading state
            });

            return unsubscribe;
        };

        fetchOrders(); // Fetch orders when component mounts
    }, []); // Empty dependency array ensures this runs only once on mount

    const handleTabChange = (tab) => {
        setActiveTab(tab); // Change active tab when clicked
    };

    const handleCancelOrder = (orderId) => {
        // Implement cancel order logic here (optional)
    };

    if (isLoading) {
        return <ActivityIndicator size="large" color="#A68B69" />;
    }

    return (
        <ScrollView style={styles.container}>
            {/* Header Section */}
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
    // Your styles here (same as previously provided)
});

export default MyOrderScreen;
