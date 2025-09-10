import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { db, auth } from '../Backend/firebaseConfig';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// A component for the custom tab bar
const OrderStatusTabs = ({ activeTab, onTabPress }) => {
    const tabs = ['Pending', 'Shipped', 'To Receive', 'Completed', 'Cancelled'];
    return (
        <View style={tabStyles.container}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[tabStyles.tab, activeTab === tab && tabStyles.activeTab]}
                        onPress={() => onTabPress(tab)}
                    >
                        <Text style={[tabStyles.tabText, activeTab === tab && tabStyles.activeTabText]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const tabStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        paddingHorizontal: 10,
    },
    tab: {
        paddingVertical: 15,
        paddingHorizontal: 10,
        marginHorizontal: 5,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#A68B69',
    },
    tabText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#888',
    },
    activeTabText: {
        color: '#A68B69',
    },
});

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

            console.log("Fetching orders for user:", user.uid, " and status: ", activeTab);

            const q = query(
                collection(db, 'orders'),
                where('userId', '==', user.uid),
                where('status', '==', activeTab),
                orderBy('createdAt', 'desc')
            );

            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const fetchedOrders = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    const createdAt = data.createdAt ? data.createdAt.toDate() : new Date();
                    return {
                        id: doc.id,
                        ...data,
                        createdAt: createdAt,
                    };
                });
                setOrders(fetchedOrders);
                setIsLoading(false);
                console.log('Fetched Orders:', fetchedOrders);
            }, (error) => {
                console.error('Error fetching orders:', error);
                setIsLoading(false);
            });

            return unsubscribe;
        };

        setIsLoading(true);
        fetchOrders();
    }, [activeTab]);

    const handleCancelOrder = (orderId) => {
        alert(`Cancel order ${orderId}`);
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#A68B69" />
            </View>
        );
    }

    return (
        <View style={styles.fullScreenContainer}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
                    <Ionicons name="chevron-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Orders</Text>
                <TouchableOpacity onPress={() => {/* Handle chat logic */}} style={styles.headerIcon}>
                    <Ionicons name="chatbubble-outline" size={24} color="black" />
                </TouchableOpacity>
            </View>

            <OrderStatusTabs activeTab={activeTab} onTabPress={setActiveTab} />

            <ScrollView style={styles.container}>
                {orders.length === 0 ? (
                    <Text style={styles.noOrdersText}>You haven't placed any orders yet.</Text>
                ) : (
                    orders.map((order) => (
                        <View key={order.id} style={styles.orderCard}>
                            <View style={styles.cardHeader}>
                                <View style={styles.userInfo}>
                                    <View style={styles.userAvatar}></View>
                                    <Text style={styles.userName}>John</Text>
                                </View>
                                <Text style={styles.statusText}>{order.status}</Text>
                            </View>

                            <View style={styles.orderBody}>
                                <Image source={{ uri: order.itemImageUrl }} style={styles.productImage} />
                                <View style={styles.productDetails}>
                                    <View style={styles.productTitleRow}>
                                        <Text style={styles.productTitle}>{order.itemName}</Text>
                                        <Text style={styles.itemQuantity}>x{order.itemQuantity}</Text>
                                    </View>
                                    <Text style={styles.productSize}>Size: {order.itemSize}</Text>
                                    <Text style={styles.orderDate}>{order.createdAt.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                                    <View style={styles.paymentInfo}>
                                        <Text style={styles.paymentText}>Total Payment:</Text>
                                        <Text style={styles.paymentAmount}>₱ {Number(order.totalPayment).toLocaleString('en-US')}</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.cardFooter}>
                                <Text style={styles.orderId}>Order ID: {order.id}</Text>
                                {order.status === 'Pending' && (
                                    <TouchableOpacity
                                        style={styles.cancelButton}
                                        onPress={() => handleCancelOrder(order.id)}
                                    >
                                        <Text style={styles.cancelButtonText}>Cancel Order</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    fullScreenContainer: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E0E0E0', paddingTop: 50 },
    headerIcon: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
    container: { flex: 1, padding: 15 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
    orderCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#E0E0E0', marginBottom: 10 },
    userInfo: { flexDirection: 'row', alignItems: 'center' },
    userAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#D9D9D9', marginRight: 8 },
    userName: { fontSize: 14, color: '#333', fontWeight: '500' },
    statusText: { fontSize: 14, fontWeight: 'bold', color: '#A68B69' },
    orderBody: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    productImage: { width: 80, height: 100, borderRadius: 8, marginRight: 15, resizeMode: 'cover' },
    productDetails: { flex: 1, justifyContent: 'center' },
    productTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    productTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    itemQuantity: { fontSize: 14, color: '#555', fontWeight: 'bold' },
    productSize: { fontSize: 12, color: '#888', marginTop: 4 },
    orderDate: { fontSize: 12, color: '#888', marginTop: 4 },
    paymentInfo: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'flex-end', marginTop: 10 },
    paymentText: { fontSize: 12, color: '#555', marginRight: 4 },
    paymentAmount: { fontSize: 16, fontWeight: 'bold', color: '#000' },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
    orderId: { fontSize: 12, color: '#888' },
    cancelButton: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, backgroundColor: '#D9D9D9', marginLeft: 'auto' },
    cancelButtonText: { fontSize: 12, fontWeight: 'bold', color: '#A3A3A3' },
    noOrdersText: { textAlign: 'center', fontSize: 16, color: '#888', marginTop: 50 },
});

export default MyOrderScreen;