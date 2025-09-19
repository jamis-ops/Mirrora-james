import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  ScrollView,
  FlatList,
  Image 
} from 'react-native';
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFonts as useLeagueSpartan, LeagueSpartan_700Bold } from "@expo-google-fonts/league-spartan";
import { useFonts as useMontserrat, Montserrat_400Regular, Montserrat_600SemiBold } from "@expo-google-fonts/montserrat";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../Backend/firebaseConfig';

export default function OrderConfirmationScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { orderId, orderData } = route.params;

    const [order, setOrder] = useState(orderData || null);
    const [loading, setLoading] = useState(!orderData);

    const [leagueSpartanLoaded] = useLeagueSpartan({ LeagueSpartan_700Bold });
    const [montserratLoaded] = useMontserrat({ Montserrat_400Regular, Montserrat_600SemiBold });

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId || orderData) {
                setLoading(false);
                return;
            }

            try {
                const docRef = doc(db, "orders", orderId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setOrder({ id: docSnap.id, ...docSnap.data() });
                } else {
                    Alert.alert("Error", "Order not found.");
                }
            } catch (err) {
                console.error("Failed to fetch order:", err);
                Alert.alert("Error", "Failed to load order details.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, orderData]);

    if (!leagueSpartanLoaded || !montserratLoaded) {
        return null;
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#A68B69" />
            </View>
        );
    }

    if (!order) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Order details could not be loaded.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="chevron-left" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order Confirmation</Text>
                <View style={{ width: 28 }} />
            </View>
            
            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    <Ionicons name="checkmark-circle" size={100} color="#4CD964" />
                    <Text style={styles.orderConfirmedText}>Order Confirmed!</Text>
                    
                    {/* Order Summary Section */}
                    <View style={styles.sectionContainer}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Order Summary</Text>
                        </View>
                        
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Order ID:</Text>
                            <Text style={styles.summaryValue}>#{orderId.slice(-8).toUpperCase()}</Text>
                        </View>
                        
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Items Ordered:</Text>
                            <Text style={styles.summaryValue}>{order.items.length} item(s)</Text>
                        </View>
                        
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Total Amount:</Text>
                            <Text style={styles.summaryValue}>₱ {Number(order.total).toLocaleString()}</Text>
                        </View>
                        
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Down Payment (50%):</Text>
                            <Text style={styles.summaryValue}>₱ {Number(order.downPayment).toLocaleString()}</Text>
                        </View>
                        
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Payment Method:</Text>
                            <Text style={styles.summaryValue}>{order.paymentMethod}</Text>
                        </View>
                        
                        {order.bankDetails && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Bank Account:</Text>
                                <Text style={styles.summaryValue}>{order.bankDetails.fullName}</Text>
                            </View>
                        )}
                        
                        {order.referenceNumber && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Reference No:</Text>
                                <Text style={styles.summaryValue}>{order.referenceNumber}</Text>
                            </View>
                        )}
                    </View>
                    
                    {/* Delivery Address Section */}
                    <View style={styles.sectionContainer}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Delivery Address</Text>
                        </View>
                        
                        {order.deliveryAddress ? (
                            <View style={styles.addressContainer}>
                                <View style={styles.addressRow}>
                                    <Icon name="account" size={20} color="#A68B69" style={styles.addressIcon} />
                                    <Text style={styles.addressText}>{order.deliveryAddress.fullName}</Text>
                                </View>
                                
                                {order.userEmail && (
                                    <View style={styles.addressRow}>
                                        <Icon name="email" size={20} color="#A68B69" style={styles.addressIcon} />
                                        <Text style={styles.addressText}>{order.userEmail}</Text>
                                    </View>
                                )}
                                
                                <View style={styles.addressRow}>
                                    <Icon name="phone" size={20} color="#A68B69" style={styles.addressIcon} />
                                    <Text style={styles.addressText}>{order.deliveryAddress.phoneNumber}</Text>
                                </View>
                                
                                <View style={styles.addressRow}>
                                    <Icon name="map-marker" size={20} color="#A68B69" style={styles.addressIcon} />
                                    <View>
                                        <Text style={styles.addressText}>{order.deliveryAddress.completeAddress}</Text>
                                        <Text style={styles.addressSubtext}>
                                            {order.deliveryAddress.landmark && `${order.deliveryAddress.landmark} • `}
                                            {order.deliveryAddress.postalCode}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ) : (
                            <Text style={styles.noAddressText}>No address information available</Text>
                        )}
                    </View>
                    
                    {/* Order Items Section */}
                    <View style={styles.sectionContainer}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Order Items</Text>
                            <Text style={styles.itemsCount}>({order.items.length})</Text>
                        </View>
                        
                        {order.items && order.items.length > 0 ? (
                            order.items.map((item, index) => (
                                <View key={index} style={styles.orderItem}>
                                    <Image
                                        source={{ uri: item.imageUrl }}
                                        style={styles.itemImage}
                                        defaultSource={require('../assets/cute.jpeg')}
                                    />
                                    <View style={styles.itemDetails}>
                                        <Text style={styles.itemName}>{item.name}</Text>
                                        <Text style={styles.itemSize}>Size: {item.size}</Text>
                                        <Text style={styles.itemPrice}>₱ {Number(item.price).toLocaleString()}</Text>
                                    </View>
                                    <View style={styles.quantityContainer}>
                                        <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.noItemsText}>No items in this order</Text>
                        )}
                    </View>
                </View>
            </ScrollView>
            
            <View style={styles.bottomBar}>
                <TouchableOpacity style={styles.continueButton} onPress={() => navigation.navigate('Home')}>
                    <Text style={styles.continueButtonText}>Continue Shopping</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    loadingContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    container: {
        flex: 1,
        backgroundColor: '#FFF7EC',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontFamily: 'LeagueSpartan_700Bold',
        fontSize: 22,
        color: '#000',
    },
    scrollContent: {
        flex: 1,
    },
    content: {
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 100,
        paddingHorizontal: 20,
    },
    orderConfirmedText: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 22,
        color: '#000',
        marginTop: 10,
        marginBottom: 20,
    },
    sectionContainer: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 10,
    },
    sectionTitle: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 18,
        color: '#000',
    },
    itemsCount: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 14,
        color: '#666',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    summaryLabel: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 14,
        color: '#666',
    },
    summaryValue: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 14,
        color: '#000',
    },
    addressContainer: {
        marginTop: 10,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    addressIcon: {
        marginRight: 10,
        marginTop: 2,
    },
    addressText: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    addressSubtext: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    noAddressText: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginVertical: 10,
    },
    orderItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: 12,
        marginRight: 16,
        backgroundColor: '#f5f5f5',
    },
    itemDetails: {
        flex: 1,
    },
    itemName: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 16,
        color: '#333',
        marginBottom: 4,
    },
    itemSize: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 14,
        color: '#888',
        marginBottom: 6,
    },
    itemPrice: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 16,
        color: '#A68B69',
    },
    quantityContainer: {
        backgroundColor: 'rgba(166, 139, 105, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    itemQuantity: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 14,
        color: '#A68B69',
    },
    noItemsText: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginVertical: 10,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 10,
    },
    continueButton: {
        backgroundColor: '#A68B69',
        borderRadius: 25,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    continueButtonText: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 16,
        color: '#fff',
    },
    errorText: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 50,
    },
});