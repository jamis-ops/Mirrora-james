import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { db, auth } from '../Backend/firebaseConfig'; // Firebase imports
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const MyOrderScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = () => {
      const user = auth.currentUser;
      if (!user) {
        setIsLoading(false);
        return;
      }

      console.log("Fetching orders for user:", user.uid);

      const q = query(
        collection(db, 'orders'),
        where('userId', '==', user.uid), // Fetch orders by logged-in user
        orderBy('createdAt', 'desc') // Order by creation date (newest first)
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedOrders = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(fetchedOrders);
        setIsLoading(false);
        console.log('Fetched Orders:', fetchedOrders);
      }, (error) => {
        console.error('Error fetching orders:', error);
        setIsLoading(false);
      });

      return unsubscribe;
    };

    fetchOrders();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A68B69" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {orders.length === 0 ? (
        <Text style={styles.noOrdersText}>You haven't placed any orders yet.</Text>
      ) : (
        orders.map((order) => (
          <TouchableOpacity
            key={order.id}
            style={styles.orderCard}
            onPress={() => navigation.navigate('OrderConfirmationScreen', { orderId: order.id })}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.orderTitle}>Order ID: {order.id}</Text>
              <Text style={[styles.orderStatus, { color: order.status === 'Pending' ? '#FF9F00' : '#4CAF50' }]}>
                {order.status}
              </Text>
            </View>
            <Text style={styles.orderDetails}>Size: {order.size}</Text>
            <Text style={styles.orderDetails}>Total Payment: ₱ {Number(order.totalPayment).toLocaleString()}</Text>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {/* Handle Cancel Order */}}
            >
              <Text style={styles.cancelButtonText}>Cancel Order</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  orderCard: {
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  orderTitle: { fontWeight: 'bold', fontSize: 16 },
  orderStatus: { fontSize: 14, fontWeight: 'bold' },
  orderDetails: { fontSize: 14, marginVertical: 5 },
  noOrdersText: { textAlign: 'center', fontSize: 18, color: '#888' },
  cancelButton: {
    marginTop: 10,
    backgroundColor: '#FF6F61',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: { color: '#fff', fontWeight: 'bold' },
});

export default MyOrderScreen;
