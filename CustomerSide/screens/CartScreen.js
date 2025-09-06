import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useFonts as useLeagueSpartan, LeagueSpartan_700Bold } from "@expo-google-fonts/league-spartan";
import { useFonts as useMontserrat, Montserrat_400Regular, Montserrat_600SemiBold } from "@expo-google-fonts/montserrat";
import BottomNavigationBar from '../components/BottomNavigationBar';

export default function CartScreen() {
    const navigation = useNavigation();

    // 
    const [leagueSpartanLoaded] = useLeagueSpartan({
        LeagueSpartan_700Bold,
    });

    const [montserratLoaded] = useMontserrat({
        Montserrat_400Regular,
        Montserrat_600SemiBold
    });

    // Move the useState hook here, before the conditional return
    const [cartItems, setCartItems] = useState([
        { id: '1', name: 'Floor Standing Mirror', size: "60.2\" x 51.2\"", price: 2000, quantity: 1, image: require('../assets/mirror4.png'), isSelected: true },
        { id: '2', name: 'Floor Standing Mirror', size: "60.2\" x 51.2\"", price: 2000, quantity: 1, image: require('../assets/mirror4.png'), isSelected: false },
        { id: '3', name: 'Floor Standing Mirror', size: "60.2\" x 51.2\"", price: 2000, quantity: 1, image: require('../assets/mirror4.png'), isSelected: false },
        { id: '4', name: 'Floor Standing Mirror', size: "60.2\" x 51.2\"", price: 2000, quantity: 1, image: require('../assets/mirror4.png'), isSelected: false },
        { id: '5', name: 'Floor Standing Mirror', size: "60.2\" x 51.2\"", price: 2000, quantity: 1, image: require('../assets/mirror4.png'), isSelected: false },
    ]);
    
    // The conditional return is now safe because all hooks have been called
    if (!leagueSpartanLoaded || !montserratLoaded) {
        return null; 
    }

    // ... rest of your component logic
    const handleSelectAll = () => {
        const allSelected = cartItems.every(item => item.isSelected);
        const newCartItems = cartItems.map(item => ({ ...item, isSelected: !allSelected }));
        setCartItems(newCartItems);
    };

    const handleItemSelect = (id) => {
        const newCartItems = cartItems.map(item =>
            item.id === id ? { ...item, isSelected: !item.isSelected } : item
        );
        setCartItems(newCartItems);
    };

    const handleQuantityChange = (id, change) => {
        const newCartItems = cartItems.map(item => {
            if (item.id === id) {
                const newQuantity = item.quantity + change;
                if (newQuantity >= 1) {
                    return { ...item, quantity: newQuantity };
                }
            }
            return item;
        });
        setCartItems(newCartItems);
    };

    const handleRemoveItem = (id) => {
        const newCartItems = cartItems.filter(item => item.id !== id);
        setCartItems(newCartItems);
    };

    const selectedItems = cartItems.filter(item => item.isSelected);
    const totalAmount = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const renderCartItem = ({ item }) => (
        <View style={styles.cartItemContainer}>
            <TouchableOpacity onPress={() => handleItemSelect(item.id)} style={styles.checkboxContainer}>
                <View style={[styles.checkbox, item.isSelected && styles.checkedCheckbox]}>
                    {item.isSelected && <Icon name="check" size={16} color="#fff" />}
                </View>
            </TouchableOpacity>
            <Image source={item.image} style={styles.cartItemImage} />
            <View style={styles.cartItemDetails}>
                <Text style={styles.cartItemName}>{item.name}</Text>
                <Text style={styles.cartItemSize}>{item.size}</Text>
                <Text style={styles.cartItemPrice}>₱ {item.price.toLocaleString()}</Text>
            </View>
            <View style={styles.quantityContainer}>
                <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
                    <Icon name="trash-can-outline" size={20} color="#666" style={styles.trashIcon} />
                </TouchableOpacity>
                <View style={styles.quantityControl}>
                    <TouchableOpacity onPress={() => handleQuantityChange(item.id, -1)} style={styles.quantityButton}>
                        <Icon name="minus" size={16} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity onPress={() => handleQuantityChange(item.id, 1)} style={styles.quantityButton}>
                        <Icon name="plus" size={16} color="#000" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

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

            {/* Cart Items List */}
            <FlatList
                data={cartItems}
                keyExtractor={item => item.id}
                renderItem={renderCartItem}
                contentContainerStyle={styles.cartList}
            />

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
                <TouchableOpacity onPress={handleSelectAll} style={styles.selectAllContainer}>
                    <View style={[styles.checkbox, cartItems.every(item => item.isSelected) && styles.checkedCheckbox]}>
                        {cartItems.every(item => item.isSelected) && <Icon name="check" size={16} color="#fff" />}
                    </View>
                    <Text style={styles.selectAllText}>All</Text>
                </TouchableOpacity>

                <View style={styles.totalContainer}>
                    <Text style={styles.totalAmountText}>₱ {totalAmount.toLocaleString()}</Text>
                    <TouchableOpacity 
                        style={[styles.checkoutButton, selectedItems.length === 0 && styles.disabledButton]}
                        disabled={selectedItems.length === 0}
                        onPress={() => navigation.navigate('CheckoutScreen', { items: selectedItems })}
                    >
                        <Text style={styles.checkoutButtonText}>
                            Check Out ({selectedItems.length})
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <BottomNavigationBar navigation={navigation} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
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
    cartList: {
        paddingTop: 10,
        paddingHorizontal: 20,
        paddingBottom: 100, // Add padding for the bottom bar
    },
    cartItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    checkboxContainer: {
        paddingRight: 10,
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
        borderColor: '#A68B69',
    },
    cartItemImage: {
        width: 80,
        height: 80,
        borderRadius: 10,
        marginRight: 15,
        resizeMode: 'contain',
    },
    cartItemDetails: {
        flex: 1,
    },
    cartItemName: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 16,
        color: '#000',
    },
    cartItemSize: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 12,
        color: '#777',
        marginTop: 5,
    },
    cartItemPrice: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 16,
        color: '#A68B69',
        marginTop: 5,
    },
    quantityContainer: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 80,
    },
    trashIcon: {
        marginBottom: 10,
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 15,
        overflow: 'hidden',
    },
    quantityButton: {
        padding: 8,
    },
    quantityText: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 14,
        paddingHorizontal: 10,
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 10,
    },
    selectAllContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    selectAllText: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 14,
        color: '#000',
        marginLeft: 8,
    },
    totalContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    totalAmountText: {
        fontFamily: 'LeagueSpartan_700Bold',
        fontSize: 18,
        color: '#000',
        marginRight: 15,
    },
    checkoutButton: {
        backgroundColor: '#A68B69',
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 25,
    },
    checkoutButtonText: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 14,
        color: '#fff',
    },
    disabledButton: {
        backgroundColor: '#D9D9D9',
    },
});