import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { db, auth } from '../Backend/firebaseConfig';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const MyOrderScreen = () => {
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    // The initial active tab is set to the first status in the new list
    const [activeTab, setActiveTab] = useState('pending');

    useEffect(() => {
        const fetchOrders = () => {
            const user = auth.currentUser;
            if (!user) {
                console.log("No user authenticated");
                setIsLoading(false);
                Alert.alert("Authentication Error", "Please log in to view your orders");
                return;
            }

            const userId = user.uid;
            console.log("Fetching orders for user:", userId);

            // This query fetches ALL orders for the user in real-time
            const q = query(
                collection(db, 'orders'),
                where('userID', '==', userId),
                orderBy('createdAt', 'desc')
            );

            // onSnapshot sets up a real-time listener
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                console.log("Query snapshot size:", querySnapshot.size);

                if (querySnapshot.empty) {
                    console.log("No orders found for this user");
                    setOrders([]);
                    setIsLoading(false);
                    return;
                }

                const fetchedOrders = querySnapshot.docs.map(doc => {
                    const orderData = doc.data();
                    console.log("Order data:", orderData);

                    return {
                        id: doc.id,
                        createdAt: orderData.createdAt ? orderData.createdAt.toDate() : null,
                        items: orderData.items || [],
                        // This is the key fix: converting the status to lowercase to avoid case-sensitivity issues
                        status: orderData.status ? orderData.status.toLowerCase() : 'unknown',
                        total: orderData.total || 0,
                        userId: orderData.userID,
                        paymentMethod: orderData.paymentMethod || 'Not specified'
                    };
                });

                console.log("Fetched Orders: ", fetchedOrders);
                setOrders(fetchedOrders);
                setIsLoading(false);
            }, (error) => {
                console.error("Error fetching orders:", error);
                setIsLoading(false);
                Alert.alert("Error", "Failed to fetch orders. Please try again.");
                return; // Add this line to prevent further processing on error
            });

            return unsubscribe;
        };

        const unsubscribe = fetchOrders();
        
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, []);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const handleCancelOrder = async (orderId) => {
        try {
            Alert.alert(
                "Cancel Order",
                "Are you sure you want to cancel this order?",
                [
                    {
                        text: "No",
                        style: "cancel"
                    },
                    {
                        text: "Yes",
                        onPress: async () => {
                            const orderRef = doc(db, 'orders', orderId);
                            await updateDoc(orderRef, {
                                status: 'cancelled'
                            });
                            console.log(`Order ${orderId} cancelled successfully`);
                        }
                    }
                ]
            );
        } catch (error) {
            console.error("Error cancelling order:", error);
            Alert.alert("Error", "Failed to cancel order. Please try again.");
        }
    };
    
    // Function to handle deleting a cancelled order
    const handleDeleteOrder = async (orderId) => {
        try {
            Alert.alert(
                "Delete Order",
                "This action is permanent. Are you sure you want to remove this order from your list?",
                [
                    {
                        text: "Cancel",
                        style: "cancel"
                    },
                    {
                        text: "Delete",
                        onPress: async () => {
                            const orderRef = doc(db, 'orders', orderId);
                            await deleteDoc(orderRef);
                            console.log(`Order ${orderId} deleted successfully`);
                        }
                    }
                ]
            );
        } catch (error) {
            console.error("Error deleting order:", error);
            Alert.alert("Error", "Failed to delete order. Please try again.");
        }
    };
    
    // New function to handle the review button press
    const handleReview = (orderId, item) => {
        navigation.navigate('ReviewScreen', { orderId, item });
    };

    const formatDate = (date) => {
        if (!date) return 'Unknown date';
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#ff9800';
            case 'confirmed': return '#2196f3';
            case 'processing': return '#9c27b0';
            case 'shipped': return '#4caf50';
            case 'delivered': return '#4caf50';
            case 'cancelled': return '#f44336';
            default: return '#757575';
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#A68B69" />
                <Text style={styles.loadingText}>Loading orders...</Text>
            </View>
        );
    }

    // This is the line that filters the orders based on the active tab
    const filteredOrders = orders.filter(order => order.status === activeTab);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={30} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Orders</Text>
                <View style={styles.profileIconContainer}>
                    <Ionicons name="person-circle" size={40} color="#fff" />
                </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
                <View style={styles.tabs}>
                    {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                        <TouchableOpacity
                            key={status}
                            style={[styles.tab, activeTab === status && styles.activeTab]}
                            onPress={() => handleTabChange(status)}
                        >
                            <Text style={[styles.tabText, activeTab === status && styles.activeTabText]}>
                                {/* Capitalize the first letter for display */}
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Conditional rendering for displaying orders or a message */}
            {filteredOrders.length === 0 ? (
                <View style={styles.noOrdersContainer}>
                    <Ionicons name="document-text-outline" size={80} color="#ccc" />
                    <Text style={styles.noOrdersText}>No {activeTab.toLowerCase()} orders</Text>
                    <Text style={styles.noOrdersSubtext}>You don't have any {activeTab.toLowerCase()} orders yet.</Text>
                </View>
            ) : (
                filteredOrders.map((order) => (
                    <View key={order.id} style={styles.orderCard}>
                        <View style={styles.orderHeader}>
                            <View style={styles.orderHeaderLeft}>
                                <Text style={styles.orderId}>Order #{order.id.substring(0, 8)}</Text>
                                <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                            </View>
                            <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                                {/* Capitalize the first letter for display */}
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Text>
                        </View>
                        
                        {order.items && Array.isArray(order.items) && order.items.map((item, idx) => (
                            <View key={idx} style={styles.orderItem}>
                                <Image 
                                    source={{ uri: item.imageUrl }} 
                                    style={styles.productImage}
                                    defaultSource={require('../assets/placeholder.png')}
                                />
                                <View style={styles.itemDetails}>
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    {item.size && <Text style={styles.itemSize}>Size: {item.size}</Text>}
                                    <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                                </View>
                                <Text style={styles.itemPrice}>₱{item.price.toLocaleString()}</Text>
                            </View>
                        ))}
                        
                        <View style={styles.orderFooter}>
                            <View style={styles.totalContainer}>
                                <Text style={styles.totalLabel}>Amount Paid (50%):</Text>
                                <Text style={styles.totalText}>₱{(order.total * 0.5).toLocaleString()}</Text>
                            </View>
                            
                            {/* Conditional rendering for buttons */}
                            {order.status === 'pending' && (
                                <TouchableOpacity 
                                    onPress={() => handleCancelOrder(order.id)} 
                                    style={styles.cancelButton}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel Order</Text>
                                </TouchableOpacity>
                            )}
                            
                            {/* New button for writing a review */}
                            {order.status === 'delivered' && (
                                <TouchableOpacity 
                                    onPress={() => handleReview(order.id, order.items[0])} 
                                    style={styles.reviewButton}
                                >
                                    <Text style={styles.reviewButtonText}>Write a Review</Text>
                                </TouchableOpacity>
                            )}

                            {/* New button to delete cancelled orders */}
                            {order.status === 'cancelled' && (
                                <TouchableOpacity 
                                    onPress={() => handleDeleteOrder(order.id)} 
                                    style={[styles.cancelButton, styles.deleteButton]}
                                >
                                    <Text style={styles.cancelButtonText}>Remove Order</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                ))
            )}
        </ScrollView>
    );
};

// The styles remain the same
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#A68B69',
        paddingVertical: 20,
        paddingHorizontal: 15,
        paddingTop: 50, // Account for status bar
    },
    backButton: {
        padding: 5,
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabsContainer: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#e0e0e0',
        borderRadius: 20,
        marginRight: 10,
        minWidth: 80,
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: '#A68B69',
    },
    tabText: {
        color: '#666',
        fontWeight: '600',
        fontSize: 13,
    },
    activeTabText: {
        color: '#fff',
    },
    orderCard: {
        backgroundColor: '#fff',
        marginHorizontal: 15,
        marginBottom: 15,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        overflow: 'hidden',
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    orderHeaderLeft: {
        flex: 1,
    },
    orderId: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
        marginBottom: 2,
    },
    orderDate: {
        fontSize: 12,
        color: '#999',
    },
    statusText: {
        fontWeight: 'bold',
        fontSize: 14,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        overflow: 'hidden',
    },
    orderItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f8f8f8',
    },
    productImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: '#f0f0f0',
    },
    itemDetails: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 4,
    },
    itemSize: {
        fontSize: 13,
        color: '#666',
        marginBottom: 2,
    },
    itemQuantity: {
        fontSize: 13,
        color: '#666',
    },
    itemPrice: {
        fontSize: 16,
        color: '#A68B69',
        fontWeight: 'bold',
    },
    orderFooter: {
        padding: 15,
        backgroundColor: '#fafafa',
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    totalLabel: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    totalText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#A68B69',
    },
    cancelButton: {
        backgroundColor: '#ff5722',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    deleteButton: {
        backgroundColor: '#d32f2f', // A darker red for deletion
        marginTop: 10,
    },
    reviewButton: {
        backgroundColor: '#A68B69',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    reviewButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    noOrdersContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 60,
    },
    noOrdersText: {
        fontSize: 20,
        color: '#999',
        textAlign: 'center',
        marginTop: 20,
        fontWeight: '500',
    },
    noOrdersSubtext: {
        fontSize: 16,
        color: '#ccc',
        textAlign: 'center',
        marginTop: 8,
    },
});

export default MyOrderScreen;