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

    const handleCancelOrder = (orderId) => {
        // Logic to cancel order
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
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Pending' && styles.activeTab]}
                    onPress={() => setActiveTab('Pending')}
                >
                    <Text style={styles.tabText}>Pending</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Shipped' && styles.activeTab]}
                    onPress={() => setActiveTab('Shipped')}
                >
                    <Text style={styles.tabText}>Shipped</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'To Receive' && styles.activeTab]}
                    onPress={() => setActiveTab('To Receive')}
                >
                    <Text style={styles.tabText}>To Receive</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Completed' && styles.activeTab]}
                    onPress={() => setActiveTab('Completed')}
                >
                    <Text style={styles.tabText}>Completed</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Cancelled' && styles.activeTab]}
                    onPress={() => setActiveTab('Cancelled')}
                >
                    <Text style={styles.tabText}>Cancelled</Text>
                </TouchableOpacity>
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
