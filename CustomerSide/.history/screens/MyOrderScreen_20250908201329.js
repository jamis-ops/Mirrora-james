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

            // Real-time listener to update state when orders are added/changed
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const fetchedOrders = querySnapshot.docs.map(doc => {
                    const orderData = doc.data();

                    return {
                        id: doc.id,
                        // Convert Firestore Timestamps to JavaScript Date objects
                        createdAt: orderData.createdAt ? orderData.createdAt.toDate() : null,  // Convert createdAt Timestamp to Date
                        addedAt: orderData.addedAt ? orderData.addedAt.toDate() : null,  // Convert addedAt Timestamp to Date
                        items: orderData.items,  // Ensure items is an array of objects
                        status: orderData.status,
                        total: orderData.total,
                        userId: orderData.userId,
                    };
                });

                console.log("Fetched Orders: ", fetchedOrders);  // Debugging - check the formatted orders
                setOrders(fetchedOrders); // Update state with the fetched orders
                setIsLoading(false); // Stop loading once data is fetched
            });

            return unsubscribe; // Return unsubscribe function to clean up listener when component unmounts
        };

        fetchOrders(); // Fetch orders when the component mounts
    }, []); // Empty dependency array, so this effect runs only once when the component mounts

    const handleTabChange = (tab) => {
        setActiveTab(tab);  // Change active tab to filter orders
    };

    const handleCancelOrder = (orderId) => {
        console.log(`Canceling order: ${orderId}`); // Debugging
        // Logic to cancel the order (e.g., updating Firestore status)
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

            {/* Tabs Section */}
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
                    {/* Render Order Items */}
                    {order.items.map((item, idx) => (
                        <View key={idx} style={styles.orderItem}>
                            <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
                            <Text style={styles.itemName}>{item.name} x{item.quantity}</Text>
                            <Text style={styles.itemPrice}>₱ {item.price.toLocaleString()}</Text>
                        </View>
                    ))}
                    <Text style={styles.totalText}>Total: ₱ {order.total.toLocaleString()}</Text>
                    <TouchableOpacity onPress={() => handleCancelOrder(order.id)} style={styles.cancelButton}>
                        <Text style={styles.cancelButtonText}>Cancel Order</Text>
                    </TouchableOpacity>
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#A68B69',
        paddingVertical: 20,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#d3d3d3',
    },
    backButton: {
        padding: 10,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 1,
    },
    profileIconContainer: {
        width: 40,
        height: 40,
    },
    tabs: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10,
    },
    tab: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#e0e0e0',
        borderRadius: 20,
    },
    activeTab: {
        backgroundColor: '#A68B69',
    },
    tabText: {
        color: '#000',
        fontWeight: 'bold',
    },
    orderCard: {
        backgroundColor: '#fff',
        marginBottom: 15,
        padding: 15,
        borderRadius: 10,
        elevation: 5,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    orderId: {
        fontWeight: 'bold',
    },
    statusText: {
        fontWeight: 'bold',
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
    itemName: {
        fontSize: 16,
        flex: 1,
    },
    itemPrice: {
        fontSize: 14,
        color: '#888',
    },
    totalText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    cancelButton: {
        backgroundColor: '#ff5722',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default MyOrderScreen;
