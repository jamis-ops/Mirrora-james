import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useFonts as useLeagueSpartan, LeagueSpartan_700Bold } from "@expo-google-fonts/league-spartan";
import { useFonts as useMontserrat, Montserrat_400Regular, Montserrat_600SemiBold } from "@expo-google-fonts/montserrat";
import BottomNavigationBar from '../components/BottomNavigationBar';

// Firebase
import { auth, db } from "../Backend/firebaseConfig";
import {
    collection,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc,
    writeBatch,
    serverTimestamp,
    setDoc,
} from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";

export default function CartScreen() {
    const navigation = useNavigation();
    const [leagueSpartanLoaded] = useLeagueSpartan({ LeagueSpartan_700Bold });
    const [montserratLoaded] = useMontserrat({ Montserrat_400Regular, Montserrat_600SemiBold });

    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMap, setSelectedMap] = useState({});
    const currentUserRef = useRef(null);

    // Ensure user exists (anonymous fallback)
    const ensureUser = async () => {
        if (auth.currentUser) return auth.currentUser;
        try {
            const cred = await signInAnonymously(auth);
            return cred.user;
        } catch (err) {
            console.error("Anonymous sign-in failed:", err);
            return null;
        }
    };

    useEffect(() => {
        let unsub = null;
        (async () => {
            const user = await ensureUser();
            currentUserRef.current = user;
            if (!user) {
                setLoading(false);
                setCartItems([]);
                return;
            }

            // **FIXED:** Corrected Firestore path to match the writing location in HomeScreen.js
            const itemsRef = collection(db, "users", user.uid, "cart");

            unsub = onSnapshot(itemsRef, (snap) => {
                const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                setCartItems(data);

                // initialize selectedMap for new items if not present (default true)
                setSelectedMap((prev) => {
                    const next = { ...prev };
                    data.forEach((it) => {
                        if (next[it.id] === undefined) next[it.id] = true;
                    });
                    return next;
                });

                setLoading(false);
            }, (err) => {
                console.error("Cart onSnapshot error:", err);
                setLoading(false);
            });
        })();

        return () => {
            if (unsub) unsub();
        };
    }, []);

    if (!leagueSpartanLoaded || !montserratLoaded) return null;

    const toggleSelect = (id) => {
        setSelectedMap((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleSelectAll = () => {
        const all = cartItems.every(it => selectedMap[it.id]);
        const next = {};
        cartItems.forEach(it => {
            next[it.id] = !all;
        });
        setSelectedMap(next);
    };

    // FIXED: Enhanced incrementQuantity function to properly preserve product name and all data
    const incrementQuantity = async (itemId, delta) => {
        const user = currentUserRef.current;
        if (!user) return;
        
        try {
            const item = cartItems.find(i => i.id === itemId);
            if (!item) {
                console.error("Item not found in cartItems");
                return;
            }

            const newQty = Math.max(1, (item?.quantity || 1) + delta);
            const itemDoc = doc(db, "users", user.uid, "cart", itemId);
            
            // IMPORTANT: Explicitly preserve all product fields including name
            const updatedItemData = {
                name: item.name || item.productName || 'Product Name', // Ensure name is preserved
                price: item.price || 0,
                imageUrl: item.imageUrl || '',
                size: item.size || '',
                category: item.category || '',
                description: item.description || '',
                // Include any other fields that might exist
                ...item, // Spread all existing data first
                quantity: newQty, // Override quantity with new value
                updatedAt: serverTimestamp() // Track when it was last updated
            };
            
            // Remove the 'id' field from the data being written to Firestore
            delete updatedItemData.id;
            
            console.log('Updating item with data:', updatedItemData); // Debug log
            
            await updateDoc(itemDoc, updatedItemData);
            
        } catch (err) {
            console.error("incrementQuantity error:", err);
            Alert.alert("Error", "Could not update quantity. Please try again.");
        }
    };

    const removeItem = async (itemId) => {
        const user = currentUserRef.current;
        if (!user) return;
        
        Alert.alert(
            "Remove Item",
            "Are you sure you want to remove this item from your cart?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, "users", user.uid, "cart", itemId));
                            setSelectedMap((prev) => {
                                const next = { ...prev };
                                delete next[itemId];
                                return next;
                            });
                        } catch (err) {
                            console.error("removeItem error:", err);
                            Alert.alert("Error", "Could not remove item. Please try again.");
                        }
                    }
                }
            ]
        );
    };

    const selectedItems = cartItems.filter(it => selectedMap[it.id]);
    const totalAmount = selectedItems.reduce((s, it) => s + (Number(it.price || 0) * Number(it.quantity || 0)), 0);

    const handleCheckout = () => {
        if (selectedItems.length === 0) {
            Alert.alert("No items selected", "Please select items to checkout");
            return;
        }

        // Navigate to CheckoutScreen and pass selected items
        navigation.navigate("CheckoutScreen", { selectedItems, totalAmount });
    };

    const renderCartItem = ({ item }) => {
        const isSelected = !!selectedMap[item.id];
        
        // Enhanced name display with multiple fallback options
        const displayName = item.name || item.productName || item.title || 'Product Name';
        
        return (
            <View style={styles.cartItemContainer}>
                <TouchableOpacity onPress={() => toggleSelect(item.id)} style={styles.checkboxContainer}>
                    <View style={[styles.checkbox, isSelected && styles.checkedCheckbox]}>
                        {isSelected && <Icon name="check" size={16} color="#fff" />}
                    </View>
                </TouchableOpacity>

                <Image 
                    source={{ uri: item.imageUrl }} 
                    style={styles.cartItemImage}
                    defaultSource={require('../assets/cute.jpeg')} // Fallback image
                />
                
                <View style={styles.cartItemDetails}>
                    <Text style={styles.cartItemName} numberOfLines={2}>
                        {displayName}
                    </Text>
                    
                    {item.size && (
                        <Text style={styles.cartItemSize}>Size: {item.size}</Text>
                    )}
                    
                    <Text style={styles.cartItemPrice}>
                        ₱ {Number(item.price || 0).toLocaleString()}
                    </Text>

                    <View style={styles.quantityAndRemoveContainer}>
                        <View style={styles.quantityContainer}>
                            <TouchableOpacity 
                                onPress={() => incrementQuantity(item.id, -1)} 
                                style={styles.quantityButton}
                                disabled={item.quantity <= 1}
                            >
                                <Icon 
                                    name="minus" 
                                    size={16} 
                                    color={item.quantity <= 1 ? "#ccc" : "#000"} 
                                />
                            </TouchableOpacity>
                            
                            <Text style={styles.quantityText}>
                                {item.quantity || 1}
                            </Text>
                            
                            <TouchableOpacity 
                                onPress={() => incrementQuantity(item.id, 1)} 
                                style={styles.quantityButton}
                            >
                                <Icon name="plus" size={16} color="#000" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity 
                            onPress={() => removeItem(item.id)} 
                            style={styles.removeButton}
                        >
                            <Icon name="trash-can-outline" size={20} color="#ff4444" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#A68B69" />
                <Text style={styles.loadingText}>Loading your cart...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="chevron-left" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Cart</Text>
                <TouchableOpacity>
                    <Icon name="heart-outline" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={cartItems}
                keyExtractor={(item) => item.id}
                renderItem={renderCartItem}
                contentContainerStyle={styles.cartList}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => (
                    <View style={styles.emptyCartContainer}>
                        <Icon name="cart-outline" size={80} color="#ccc" />
                        <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
                        <Text style={styles.emptyCartSubtitle}>Add some items to get started</Text>
                        <TouchableOpacity 
                            style={styles.continueShopping}
                            onPress={() => navigation.navigate('HomeScreen')}
                        >
                            <Text style={styles.continueShoppingText}>Continue Shopping</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />

            {/* Bottom Bar */}
            {cartItems.length > 0 && (
                <View style={styles.bottomBar}>
                    <TouchableOpacity onPress={handleSelectAll} style={styles.selectAllContainer}>
                        <View style={[
                            styles.checkbox, 
                            cartItems.length > 0 && 
                            cartItems.every(item => selectedMap[item.id]) && 
                            styles.checkedCheckbox
                        ]}>
                            {cartItems.length > 0 && 
                             cartItems.every(item => selectedMap[item.id]) && 
                             <Icon name="check" size={16} color="#fff" />}
                        </View>
                        <Text style={styles.selectAllText}>All</Text>
                    </TouchableOpacity>

                    <View style={styles.totalContainer}>
                        <View style={styles.totalInfo}>
                            <Text style={styles.totalLabel}>Total:</Text>
                            <Text style={styles.totalAmountText}>₱ {totalAmount.toLocaleString()}</Text>
                        </View>
                        <TouchableOpacity
                            style={[
                                styles.checkoutButton, 
                                selectedItems.length === 0 && styles.disabledButton
                            ]}
                            disabled={selectedItems.length === 0}
                            onPress={handleCheckout}
                        >
                            <Text style={styles.checkoutButtonText}>
                                Check Out ({selectedItems.length})
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <BottomNavigationBar navigation={navigation} />
        </View>
    );
}

const styles = StyleSheet.create({
    loadingContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#F9F9F9'
    },
    loadingText: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 16,
        color: '#666',
        marginTop: 16
    },
    container: { 
        flex: 1, 
        backgroundColor: '#F9F9F9' 
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
        color: '#000' 
    },
    cartList: { 
        paddingTop: 10, 
        paddingHorizontal: 20, 
        paddingBottom: 140 
    },
    cartItemContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    checkboxContainer: { 
        paddingRight: 12,
        paddingTop: 4
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#D9D9D9',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    checkedCheckbox: { 
        backgroundColor: '#A68B69', 
        borderColor: '#A68B69' 
    },
    cartItemImage: { 
        width: 80, 
        height: 80, 
        borderRadius: 12, 
        marginRight: 15, 
        resizeMode: 'cover',
        backgroundColor: '#f5f5f5'
    },
    cartItemDetails: { 
        flex: 1 
    },
    cartItemName: { 
        fontFamily: 'Montserrat_600SemiBold', 
        fontSize: 16, 
        color: '#000',
        marginBottom: 4
    },
    cartItemSize: { 
        fontFamily: 'Montserrat_400Regular', 
        fontSize: 13, 
        color: '#777',
        marginBottom: 4
    },
    cartItemPrice: { 
        fontFamily: 'Montserrat_600SemiBold', 
        fontSize: 16, 
        color: '#A68B69', 
        marginBottom: 12
    },
    quantityAndRemoveContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        paddingHorizontal: 4
    },
    quantityButton: { 
        padding: 8,
        borderRadius: 6
    },
    quantityText: { 
        paddingHorizontal: 16, 
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 16,
        minWidth: 40,
        textAlign: 'center'
    },
    removeButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 68, 68, 0.1)'
    },
    emptyCartContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20
    },
    emptyCartTitle: {
        fontFamily: 'LeagueSpartan_700Bold',
        fontSize: 24,
        color: '#333',
        marginTop: 20,
        marginBottom: 8
    },
    emptyCartSubtitle: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30
    },
    continueShopping: {
        backgroundColor: '#A68B69',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 25
    },
    continueShoppingText: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 16,
        color: '#fff'
    },
    bottomBar: {
        position: 'absolute',
        bottom: 60,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    selectAllContainer: { 
        flexDirection: 'row', 
        alignItems: 'center' 
    },
    selectAllText: { 
        fontFamily: 'Montserrat_400Regular', 
        fontSize: 14, 
        color: '#000', 
        marginLeft: 8 
    },
    totalContainer: { 
        flexDirection: 'row', 
        alignItems: 'center',
        gap: 16
    },
    totalInfo: {
        alignItems: 'flex-end'
    },
    totalLabel: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 12,
        color: '#666'
    },
    totalAmountText: { 
        fontFamily: 'LeagueSpartan_700Bold', 
        fontSize: 18, 
        color: '#A68B69'
    },
    checkoutButton: { 
        backgroundColor: '#A68B69', 
        borderRadius: 25, 
        paddingVertical: 12, 
        paddingHorizontal: 25 
    },
    checkoutButtonText: { 
        fontFamily: 'Montserrat_600SemiBold', 
        fontSize: 14, 
        color: '#fff' 
    },
    disabledButton: { 
        backgroundColor: '#D9D9D9' 
    },
});