import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFonts as useLeagueSpartan, LeagueSpartan_700Bold } from "@expo-google-fonts/league-spartan";
import { useFonts as useMontserrat, Montserrat_400Regular, Montserrat_600SemiBold } from "@expo-google-fonts/montserrat";

import { db } from '../Backend/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export default function OrderConfirmationScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { orderId } = route.params || {};

    const [leagueSpartanLoaded] = useLeagueSpartan({ LeagueSpartan_700Bold });
    const [montserratLoaded] = useMontserrat({ Montserrat_400Regular, Montserrat_600SemiBold });

    const [loadingOrder, setLoadingOrder] = useState(true);
    const [order, setOrder] = useState(null);

    useEffect(() => {
        const loadOrder = async () => {
            if (!orderId) {
                setOrder(null);
                setLoadingOrder(false);
                return;
            }

            try {
                setLoadingOrder(true);
                const snap = await getDoc(doc(db, 'orders', orderId));
                if (snap.exists()) {
                    setOrder({ id: snap.id, ...snap.data() });
                } else {
                    setOrder(null);
                }
            } catch (err) {
                console.error('Failed to fetch order:', err);
                setOrder(null);
            } finally {
                setLoadingOrder(false);
            }
        };

        loadOrder();
    }, [orderId]);

    if (!leagueSpartanLoaded || !montserratLoaded || loadingOrder) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#A68B69" />
            </View>
        );
    }
    
    // Use the fetched order data directly
    const itemsList = order?.itemName ? [{ name: order.itemName, quantity: order.itemQuantity }] : [];
    const total = order?.totalPayment || 0;
    const address = order?.address || 'N/A';
    const payment = order?.paymentMethod || 'N/A';

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="chevron-left" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order Confirmation</Text>
                <View style={{ width: 28 }} />
            </View>

            <View style={styles.content}>
                <Ionicons name="checkmark-circle" size={100} color="#4CD964" />
                <Text style={styles.orderConfirmedText}>Order Confirmed!</Text>

                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Order Summary</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('MyOrderScreen')}>
                            <Text style={styles.orderDetailsLink}>Order Details</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Item Ordered:</Text>
                        <Text style={styles.summaryValue}>
                            {itemsList.length > 0 ? `${itemsList[0].name} x${itemsList[0].quantity}` : '—'}
                        </Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total:</Text>
                        <Text style={styles.summaryValue}>₱ {Number(total).toLocaleString()}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Delivery Address:</Text>
                        <Text style={styles.summaryValue}>{address}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Payment Method:</Text>
                        <Text style={styles.summaryValue}>{payment}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.bottomBar}>
                <TouchableOpacity style={styles.continueButton} onPress={() => navigation.navigate('MyOrderScreen')}>
                    <Text style={styles.continueButtonText}>View Orders</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF7EC' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
    headerTitle: { fontFamily: 'LeagueSpartan_700Bold', fontSize: 22, color: '#000' },
    content: { flex: 1, alignItems: 'center', paddingTop: 40, paddingHorizontal: 20 },
    orderConfirmedText: { fontFamily: 'Montserrat_600SemiBold', fontSize: 22, color: '#000', marginTop: 20, marginBottom: 30 },
    sectionContainer: { width: '100%', backgroundColor: '#fff', borderRadius: 15, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    sectionTitle: { fontFamily: 'Montserrat_600SemiBold', fontSize: 18, color: '#000' },
    orderDetailsLink: { fontFamily: 'Montserrat_400Regular', fontSize: 14, color: '#A68B69' },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    summaryLabel: { fontFamily: 'Montserrat_400Regular', fontSize: 14, color: '#666' },
    summaryValue: { fontFamily: 'Montserrat_600SemiBold', fontSize: 14, color: '#000' },
    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 10 },
    continueButton: { backgroundColor: '#A68B69', borderRadius: 25, paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
    continueButtonText: { fontFamily: 'Montserrat_600SemiBold', fontSize: 16, color: '#fff' },
});