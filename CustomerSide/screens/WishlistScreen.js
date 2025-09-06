import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Dimensions, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFonts as useLeagueSpartan, LeagueSpartan_700Bold } from "@expo-google-fonts/league-spartan";
import { useFonts as useMontserrat, Montserrat_400Regular, Montserrat_600SemiBold } from "@expo-google-fonts/montserrat";

const { width } = Dimensions.get('window');

// Placeholder data for your wishlist items
const wishlistItems = [
    { id: '1', name: 'Floor Standing Mirror', price: '₱ 2,000', image: require('../assets/mirror4.png'), category: 'Today' },
    { id: '2', name: 'Floor Standing Mirror', price: '₱ 2,000', image: require('../assets/mirror4.png'), category: 'Today' },
    { id: '3', name: 'Floor Standing Mirror', price: '₱ 2,000', image: require('../assets/mirror4.png'), category: 'Yesterday' },
    { id: '4', name: 'Floor Standing Mirror', price: '₱ 2,000', image: require('../assets/mirror4.png'), category: 'Yesterday' },
    { id: '5', name: 'Floor Standing Mirror', price: '₱ 2,000', image: require('../assets/mirror4.png'), category: 'Yesterday' },
    { id: '6', name: 'Floor Standing Mirror', price: '₱ 2,000', image: require('../assets/mirror4.png'), category: 'Yesterday' },
];

export default function WishlistScreen() {
    const navigation = useNavigation();
    
    // Load fonts
    const [leagueSpartanLoaded] = useLeagueSpartan({ LeagueSpartan_700Bold });
    const [montserratLoaded] = useMontserrat({ Montserrat_400Regular, Montserrat_600SemiBold });
    
    if (!leagueSpartanLoaded || !montserratLoaded) {
        return null;
    }

    const renderItem = ({ item, index }) => {
        const isLeft = index % 2 === 0;
        return (
            <View style={[styles.productCard, isLeft ? styles.leftCard : styles.rightCard]}>
                <Image source={item.image} style={styles.productImage} />
                <View style={styles.productInfo}>
                    <Text style={styles.productPrice}>{item.price}</Text>
                    <TouchableOpacity style={styles.cartIconContainer}>
                        <Icon name="cart-plus" size={20} color="#000" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    // Change this line:
                    onPress={() => navigation.navigate('Home')} 
                    style={styles.iconButton}
                >
                    <Icon name="chevron-left" size={30} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Wishlist</Text>
                <TouchableOpacity style={styles.iconButton}>
                    <Icon name="cart-outline" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={wishlistItems.filter(item => item.category === 'Today')}
                keyExtractor={item => item.id}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                renderItem={renderItem}
                ListHeaderComponent={() => (
                    <Text style={styles.sectionTitle}>Today</Text>
                )}
                ListFooterComponent={() => (
                    <>
                        <Text style={styles.sectionTitle}>Yesterday</Text>
                        <FlatList
                            data={wishlistItems.filter(item => item.category === 'Yesterday')}
                            keyExtractor={item => item.id}
                            numColumns={2}
                            showsVerticalScrollIndicator={false}
                            renderItem={renderItem}
                            contentContainerStyle={styles.innerFlatListContent}
                            columnWrapperStyle={styles.innerRow}
                        />
                    </>
                )}
                contentContainerStyle={styles.flatListContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // The only change is here
        backgroundColor: '#F9F9F9',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: 50,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontFamily: 'LeagueSpartan_700Bold',
        fontSize: 20,
        color: '#000',
    },
    iconButton: {
        padding: 5,
    },
    sectionTitle: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 16,
        color: '#000',
        marginTop: 20,
        marginBottom: 10,
        marginLeft: 15,
    },
    flatListContent: {
        paddingHorizontal: 15,
    },
    productCard: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    leftCard: {
        marginRight: 7.5,
    },
    rightCard: {
        marginLeft: 7.5,
    },
    productImage: {
        width: '100%',
        height: 180,
        resizeMode: 'cover',
    },
    productInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
    },
    productPrice: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 14,
        color: '#000',
    },
    cartIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
},
});