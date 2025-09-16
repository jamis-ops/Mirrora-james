import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    Image, 
    FlatList, 
    Alert,
    Animated,
    Modal,
    Dimensions,
    Platform,
    StatusBar,
    TextInput
} from 'react-native';
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { db, auth } from '../Backend/firebaseConfig';
import { collection, addDoc, Timestamp, writeBatch, doc, getDocs } from 'firebase/firestore';
import { useFonts as useLeagueSpartan, LeagueSpartan_700Bold } from "@expo-google-fonts/league-spartan";
import { useFonts as useMontserrat, Montserrat_400Regular, Montserrat_600SemiBold } from "@expo-google-fonts/montserrat";
import { FontAwesome5 } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function CheckoutScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { selectedItems, totalAmount } = route.params;

    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('bankTransfer');
    const [cartItems, setCartItems] = useState([]);
    const [subtotal, setSubtotal] = useState(0);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [showBankModal, setShowBankModal] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState({
        id: 1,
        label: 'Home Address',
        address: '123 Tonying Street, San Pedro, Laguna, PH',
        icon: 'home-outline'
    });
    const [selectedBank, setSelectedBank] = useState(null);
    const [referenceNumber, setReferenceNumber] = useState('');
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    useEffect(() => {
    const fetchCart = async () => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            const snapshot = await getDocs(collection(db, "carts", user.uid, "items"));
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            setCartItems(items);
            setSubtotal(
                items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0)
            );
        } catch (error) {
            console.error("Error fetching cart: ", error);
        }
    };

    // Case 1: When navigating with selectedItems + totalAmount (from params)
    if (selectedItems && totalAmount) {
        setCartItems(selectedItems);
        setSubtotal(totalAmount);
    } else {
        // Case 2: Fallback to fetching directly from Firestore
        fetchCart();
    }

    // Animations
    Animated.parallel([
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
        }),
    ]).start();

    // Generate initial reference number
    generateReferenceNumber();
}, [selectedItems, totalAmount]);
    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;

    const [leagueSpartanLoaded] = useLeagueSpartan({ LeagueSpartan_700Bold });
    const [montserratLoaded] = useMontserrat({ Montserrat_400Regular, Montserrat_600SemiBold });

    // Sample addresses
    const addresses = [
        { id: 1, label: 'Home Address', address: '123 Tonying Street, San Pedro, Laguna, PH', icon: 'home-outline' },
        { id: 2, label: 'Work Address', address: '456 Business Ave, Makati, Metro Manila, PH', icon: 'office-building-outline' },
        { id: 3, label: 'Other Address', address: '789 Alternative St, Quezon City, Metro Manila, PH', icon: 'map-marker-outline' }
    ];

    // Bank options
    const bankOptions = [
        { id: 1, name: 'BPI', fullName: 'Bank of the Philippine Islands', accountNumber: '1234-5678-90', color: '#E31837' },
        { id: 2, name: 'BDO', fullName: 'Banco de Oro', accountNumber: '0987-6543-21', color: '#003087' },
        { id: 3, name: 'Metrobank', fullName: 'Metropolitan Bank', accountNumber: '5678-1234-09', color: '#FF6B00' },
        { id: 4, name: 'GCash', fullName: 'GCash Mobile Wallet', accountNumber: '09171234567', color: '#007DFE' }
    ];

    useEffect(() => {
        if (selectedItems && totalAmount) {
            setCartItems(selectedItems);
            setSubtotal(totalAmount);
        }
        
        // Simple entrance animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();

        // Generate initial reference number
        generateReferenceNumber();
    }, [selectedItems, totalAmount]);

    const generateReferenceNumber = () => {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substr(2, 5).toUpperCase();
        setReferenceNumber(`REF${timestamp.slice(-6)}${random}`);
    };

    if (!leagueSpartanLoaded || !montserratLoaded) return null;

    const deliveryFee = 0;
    const total = subtotal + deliveryFee;
    const downPayment = total * 0.50;

    const animateButton = () => {
        Animated.sequence([
            Animated.timing(buttonScale, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(buttonScale, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handlePlaceOrder = async () => {
        if (!selectedBank) {
            Alert.alert("Payment Method Required", "Please select a bank account for payment.");
            return;
        }
        if (!selectedBank) {
            Alert.alert("Payment Method Required", "Please select a bank account for payment.");
            return;
        }

        if (!referenceNumber.trim()) {
            Alert.alert("Reference Number Required", "Please enter the reference number from your payment.");
            return;
        }


        animateButton();
        setIsPlacingOrder(true);

        try {
            const user = auth.currentUser;
            if (!user) {
                Alert.alert("Authentication Error", "Please log in to place an order.");
                setIsPlacingOrder(false);
                return;
            }

            const userId = user.uid;

            const orderData = {
                userID: userId,
                items: cartItems.map(item => ({
                    id: item.id || '',
                    name: item.name || 'Unnamed Item',
                    size: item.size || '',
                    price: Number(item.price) || 0,
                    quantity: Number(item.quantity) || 0,
                    imageUrl: item.imageUrl || null
                })),
                total: total,
                downPayment: downPayment,
                remainingPayment: total - downPayment,
                status: 'Pending',
                createdAt: Timestamp.fromDate(new Date()),
                paymentMethod: selectedPaymentMethod,
                bankDetails: selectedBank,
                referenceNumber: referenceNumber,
                deliveryAddress: selectedAddress,
            };
            
            if (orderData.items.some(item => item.price === 0 || item.quantity === 0)) {
                throw new Error("Invalid item data: price or quantity cannot be zero.");
            }

            const docRef = await addDoc(collection(db, 'orders'), orderData);

            const batch = writeBatch(db);
            cartItems.forEach(item => {
                const itemRef = doc(db, "users", userId, "cart", item.id);
                batch.delete(itemRef);
            });
            await batch.commit();

            Alert.alert(
                "Order Placed Successfully! 🎉",
                `Your order has been placed with reference number: ${referenceNumber}\n\nPlease transfer ₱${downPayment.toLocaleString()} to the selected bank account.`,
                [
                    {
                        text: "View Order",
                        onPress: () => navigation.navigate('OrderConfirmationScreen', { orderId: docRef.id })
                    }
                ]
            );
        } catch (e) {
            console.error("Error adding document: ", e);
            Alert.alert("Error", `Failed to place order. ${e.message}`);
        } finally {
            setIsPlacingOrder(false);
        }
    };

    const AddressModal = () => (
        <Modal
            visible={showAddressModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowAddressModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select Address</Text>
                        <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                            <Icon name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>
                    
                    {addresses.map((address) => (
                        <TouchableOpacity
                            key={address.id}
                            style={[
                                styles.addressOption,
                                selectedAddress.id === address.id && styles.selectedAddressOption
                            ]}
                            onPress={() => {
                                setSelectedAddress(address);
                                setShowAddressModal(false);
                            }}
                        >
                            <Icon name={address.icon} size={24} color="#A68B69" />
                            <View style={styles.addressDetails}>
                                <Text style={styles.addressLabel}>{address.label}</Text>
                                <Text style={styles.addressText}>{address.address}</Text>
                            </View>
                            {selectedAddress.id === address.id && (
                                <Icon name="check-circle" size={24} color="#A68B69" />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </Modal>
    );

    const BankModal = () => (
        <Modal
            visible={showBankModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowBankModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select Bank Account</Text>
                        <TouchableOpacity onPress={() => setShowBankModal(false)}>
                            <Icon name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>
                    
                    {bankOptions.map((bank) => (
                        <TouchableOpacity
                            key={bank.id}
                            style={[
                                styles.bankOption,
                                selectedBank?.id === bank.id && styles.selectedBankOption
                            ]}
                            onPress={() => {
                                setSelectedBank(bank);
                                setShowBankModal(false);
                            }}
                        >
                            <View style={[styles.bankIcon, { backgroundColor: bank.color }]}>
                                <Text style={styles.bankIconText}>{bank.name}</Text>
                            </View>
                            <View style={styles.bankDetails}>
                                <Text style={styles.bankName}>{bank.fullName}</Text>
                                <Text style={styles.bankAccount}>Account: {bank.accountNumber}</Text>
                            </View>
                            {selectedBank?.id === bank.id && (
                                <Icon name="check-circle" size={24} color="#A68B69" />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </Modal>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="chevron-left" size={28} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Checkout</Text>
                <View style={styles.headerRight} />
            </View>

            <Animated.ScrollView 
                style={[styles.content, { 
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Delivery Information Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardTitleContainer}>
                            <Icon name="truck-delivery" size={24} color="#A68B69" />
                            <Text style={styles.cardTitle}>Delivery Information</Text>
                        </View>
                        <TouchableOpacity 
                            style={styles.editButton}
                            onPress={() => setShowAddressModal(true)}
                        >
                            <Text style={styles.editButtonText}>Change</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.deliveryInfo}>
                        <View style={styles.infoRow}>
                            <Icon name={selectedAddress.icon} size={20} color="#A68B69" />
                            <View style={styles.infoDetails}>
                                <Text style={styles.infoLabel}>{selectedAddress.label}</Text>
                                <Text style={styles.infoValue}>{selectedAddress.address}</Text>
                            </View>
                        </View>
                        <View style={styles.infoRow}>
                            <Icon name="clock-outline" size={20} color="#A68B69" />
                            <View style={styles.infoDetails}>
                                <Text style={styles.infoLabel}>Estimated Delivery</Text>
                                <Text style={styles.infoValue}>10:00 - 10:30 (Today)</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Order Items Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardTitleContainer}>
                            <Icon name="shopping" size={24} color="#A68B69" />
                            <Text style={styles.cardTitle}>Order Items ({cartItems.length})</Text>
                        </View>
                    </View>
                    
                    <FlatList
                        data={cartItems}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.checkoutItemContainer}>
                                <Image
                                    source={{ uri: item.imageUrl }}
                                    style={styles.checkoutItemImage}
                                    defaultSource={require('../assets/cute.jpeg')}
                                />
                                <View style={styles.checkoutItemDetails}>
                                    <Text style={styles.checkoutItemName}>{item.name}</Text>
                                    <Text style={styles.checkoutItemSize}>Size: {item.size}</Text>
                                    <Text style={styles.checkoutItemPrice}>₱ {Number(item.price).toLocaleString()}</Text>
                                </View>
                                <View style={styles.quantityContainer}>
                                    <Text style={styles.checkoutItemQuantity}>x{Number(item.quantity)}</Text>
                                </View>
                            </View>
                        )}
                        scrollEnabled={false}
                    />
                </View>

                {/* Payment & Summary Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardTitleContainer}>
                            <Icon name="credit-card" size={24} color="#A68B69" />
                            <Text style={styles.cardTitle}>Payment & Summary</Text>
                        </View>
                    </View>
                    
                    {/* Bank Transfer Option */}
                    <TouchableOpacity 
                        style={styles.paymentMethodContainer}
                        onPress={() => setShowBankModal(true)}
                    >
                        <View style={styles.paymentMethodHeader}>
                            <FontAwesome5 name="university" size={20} color="#A68B69" />
                            <View style={styles.paymentMethodDetails}>
                                <Text style={styles.paymentMethodLabel}>Bank Transfer</Text>
                                <Text style={styles.paymentMethodSubtext}>
                                    {selectedBank ? selectedBank.fullName : 'Select bank account'}
                                </Text>
                            </View>
                            <Icon name="chevron-right" size={20} color="#A68B69" />
                        </View>
                    </TouchableOpacity>

                    {selectedBank && (
                        <View style={styles.selectedBankInfo}>
                            <Text style={styles.selectedBankTitle}>Selected Account:</Text>
                            <View style={styles.selectedBankDetails}>
                                <View style={[styles.smallBankIcon, { backgroundColor: selectedBank.color }]}>
                                    <Text style={styles.smallBankIconText}>{selectedBank.name}</Text>
                                </View>
                                <View>
                                    <Text style={styles.selectedBankName}>{selectedBank.fullName}</Text>
                                    <Text style={styles.selectedBankAccount}>Account: {selectedBank.accountNumber}</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Reference Number */}
                    <View style={styles.referenceContainer}>
                    <Text style={styles.referenceLabel}>Reference Number</Text>
                    <TextInput
                        style={styles.referenceInput}
                        placeholder="Enter reference number after payment"
                        placeholderTextColor="#999"
                        value={referenceNumber}
                        onChangeText={setReferenceNumber}
                    />
                </View>


                    <View style={styles.divider} />

                    {/* Order Summary */}
                    <View style={styles.summarySection}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>₱ {subtotal.toLocaleString()}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Delivery Fee</Text>
                            <Text style={[styles.summaryValue, styles.freeText]}>Free</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryHighlight}>Down Payment (50%)</Text>
                            <Text style={styles.summaryHighlightValue}>₱ {downPayment.toLocaleString()}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, styles.totalLabel]}>Total Amount</Text>
                            <Text style={[styles.summaryValue, styles.totalValue]}>₱ {total.toLocaleString()}</Text>
                        </View>
                        <View style={styles.paymentNoteContainer}>
                            <Text style={styles.paymentNote}>
                                💡 Pay 50% now, remaining 50% on delivery
                            </Text>
                        </View>
                    </View>
                </View>

            </Animated.ScrollView>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
                <View style={styles.bottomContent}>
                    <View style={styles.totalContainer}>
                        <Text style={styles.payNowLabel}>Pay Now</Text>
                        <Text style={styles.payNowAmount}>₱ {downPayment.toLocaleString()}</Text>
                    </View>
                    <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                        <TouchableOpacity 
                            style={[
                                styles.placeOrderButton,
                                (!selectedBank || isPlacingOrder) && styles.disabledButton
                            ]}
                            onPress={handlePlaceOrder}
                            disabled={!selectedBank || isPlacingOrder}
                        >
                            <Text style={styles.placeOrderButtonText}>
                                {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </View>

            <AddressModal />
            <BankModal />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
        paddingBottom: 15,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(166, 139, 105, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontFamily: 'LeagueSpartan_700Bold',
        fontSize: 24,
        color: '#333',
    },
    headerRight: {
        width: 40,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    cardTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardTitle: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 18,
        color: '#333',
        marginLeft: 12,
    },
    editButton: {
        backgroundColor: 'rgba(166, 139, 105, 0.15)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 16,
    },
    editButtonText: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 12,
        color: '#A68B69',
    },
    deliveryInfo: {
        gap: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
    },
    infoDetails: {
        flex: 1,
    },
    infoLabel: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 16,
        color: '#333',
        marginBottom: 4,
    },
    infoValue: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    checkoutItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    checkoutItemImage: {
        width: 60,
        height: 60,
        borderRadius: 12,
        marginRight: 16,
        backgroundColor: '#f5f5f5',
    },
    checkoutItemDetails: {
        flex: 1,
    },
    checkoutItemName: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 16,
        color: '#333',
        marginBottom: 4,
    },
    checkoutItemSize: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 14,
        color: '#888',
        marginBottom: 6,
    },
    checkoutItemPrice: {
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
    checkoutItemQuantity: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 14,
        color: '#A68B69',
    },
    paymentMethodContainer: {
        marginBottom: 16,
    },
    paymentMethodHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(166, 139, 105, 0.05)',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(166, 139, 105, 0.2)',
    },
    paymentMethodDetails: {
        flex: 1,
        marginLeft: 16,
    },
    paymentMethodLabel: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 16,
        color: '#333',
        marginBottom: 4,
    },
    paymentMethodSubtext: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 14,
        color: '#666',
    },
    selectedBankInfo: {
        backgroundColor: 'rgba(166, 139, 105, 0.08)',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    selectedBankTitle: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 14,
        color: '#A68B69',
        marginBottom: 12,
    },
    selectedBankDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    selectedBankName: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 15,
        color: '#333',
    },
    selectedBankAccount: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 13,
        color: '#666',
    },
    referenceContainer: {
        marginBottom: 16,
    },
    referenceLabel: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    referenceNumberContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(166, 139, 105, 0.1)',
        padding: 12,
        borderRadius: 8,
    },
    referenceNumber: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 16,
        color: '#A68B69',
        letterSpacing: 1,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.1)',
        marginVertical: 16,
    },
    summarySection: {
        gap: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryLabel: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 16,
        color: '#666',
    },
    summaryValue: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 16,
        color: '#333',
    },
    freeText: {
        color: '#4CAF50',
    },
    summaryHighlight: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 16,
        color: '#A68B69',
    },
    summaryHighlightValue: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 16,
        color: '#A68B69',
    },
    totalLabel: {
        fontFamily: 'LeagueSpartan_700Bold',
        fontSize: 18,
        color: '#333',
    },
    totalValue: {
        fontFamily: 'LeagueSpartan_700Bold',
        fontSize: 18,
        color: '#A68B69',
    },
    paymentNoteContainer: {
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    paymentNote: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 13,
        color: '#2E7D32',
        textAlign: 'center',
    },
    bottomBar: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
    },
    bottomContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
    },
    totalContainer: {
        flex: 1,
    },
    payNowLabel: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    payNowAmount: {
        fontFamily: 'LeagueSpartan_700Bold',
        fontSize: 20,
        color: '#A68B69',
    },
    placeOrderButton: {
        backgroundColor: '#A68B69',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        minWidth: 120,
        alignItems: 'center',
        shadowColor: '#A68B69',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    disabledButton: {
        backgroundColor: '#ccc',
        shadowOpacity: 0.1,
        elevation: 2,
    },
    placeOrderButtonText: {
        fontFamily: 'Montserrat_600SemiBold',
        color: '#fff',
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        maxHeight: height * 0.7,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    modalTitle: {
        fontFamily: 'LeagueSpartan_700Bold',
        fontSize: 20,
        color: '#333',
    },
    addressOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedAddressOption: {
        backgroundColor: 'rgba(166, 139, 105, 0.1)',
        borderColor: 'rgba(166, 139, 105, 0.3)',
    },
    addressDetails: {
        flex: 1,
        marginLeft: 16,
    },
    addressLabel: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 16,
        color: '#333',
        marginBottom: 4,
    },
    addressText: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    bankOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedBankOption: {
        backgroundColor: 'rgba(166, 139, 105, 0.1)',
        borderColor: 'rgba(166, 139, 105, 0.3)',
    },
    bankIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    bankIconText: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 12,
        color: '#fff',
    },
    smallBankIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    smallBankIconText: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 10,
        color: '#fff',
    },
    bankDetails: {
        flex: 1,
    },
    bankName: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 16,
        color: '#333',
        marginBottom: 4,
    },
    bankAccount: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 14,
        color: '#666',
    },
    modalScrollView: {
        maxHeight: height * 0.5,
    },
    addressOptionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    addressActions: {
        flexDirection: 'row',
        marginLeft: 8,
        gap: 8,
    },
    addressActionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(166, 139, 105, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteButton: {
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
    },
    addAddressButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: 'rgba(166, 139, 105, 0.1)',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'rgba(166, 139, 105, 0.3)',
        borderStyle: 'dashed',
        marginTop: 16,
        gap: 12,
    },
    addAddressText: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 16,
        color: '#A68B69',
    },
    formContainer: {
        maxHeight: height * 0.4,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
    },
    textInput: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: 'rgba(166, 139, 105, 0.3)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
    },
    multilineInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    saveAddressButton: {
        backgroundColor: '#A68B69',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    saveAddressText: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 16,
        color: '#fff',
    },
    referenceInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginTop: 8,
    color: '#333',
},

});