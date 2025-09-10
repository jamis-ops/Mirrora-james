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
            <Text>Order ID: {order.id}</Text>
            <Text>Status: {order.status}</Text>
            <Text>Total: ₱ {Number(order.total).toLocaleString()}</Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  orderCard: { padding: 15, marginBottom: 15, backgroundColor: '#fff', borderRadius: 10 },
  noOrdersText: { textAlign: 'center', fontSize: 18, color: '#888' },
});

export default MyOrderScreen;
