import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, ImageBackground, FlatList, Dimensions, Platform } from 'react-native';
import { useNavigation } from "@react-navigation/native";
// Using MaterialCommunityIcons for consistent styling with your other screens
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

// Import the new BottomNavigationBar component
import BottomNavigationBar from '../components/BottomNavigationBar';

// ✅ Font imports
import { useFonts as useLeagueSpartan, LeagueSpartan_700Bold } from "@expo-google-fonts/league-spartan";
import { useFonts as useMontserrat, Montserrat_400Regular, Montserrat_600SemiBold } from "@expo-google-fonts/montserrat";

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    const navigation = useNavigation();

    // ✅ Banner scroll state
    const [activeBanner, setActiveBanner] = useState(0);
    
    // ✅ Load fonts
    const [leagueSpartanLoaded] = useLeagueSpartan({
        LeagueSpartan_700Bold,
    });

    const [montserratLoaded] = useMontserrat({
        Montserrat_400Regular,
        Montserrat_600SemiBold
    });

    if (!leagueSpartanLoaded || !montserratLoaded) {
        return null; // Wait for fonts to load
    }


    // Placeholder data for products
    const popularProducts = [
        { id: '1', name: 'Floor Standing Mirror', price: '₱ 2,000', image: require('../assets/mirror4.png')},
        { id: '2', name: 'Floor Standing Mirror', price: '₱ 2,000', image: require('../assets/mirror4.png')},
        { id: '3', name: 'Floor Standing Mirror', price: '₱ 2,000', image: require('../assets/mirror4.png')},
        { id: '4', name: 'Floor Standing Mirror', price: '₱ 2,000', image: require('../assets/mirror4.png')},
    ];
    
    // Placeholder images - you should replace these with your actual assets
    const banners = [
        require('../assets/banner.png'),
        require('../assets/banner.png'),
        require('../assets/banner.png'),
    ];
    
    const renderHeader = () => (
        <>
            {/* Header Section */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mirrora Philippines</Text>
                {/* Updated onPress to navigate to MessageScreen */}
                <TouchableOpacity onPress={() => navigation.navigate('MessageScreen')}>
                    <Icon name="chat-processing" size={24} color="#A68B69" />
                </TouchableOpacity>
            </View>

            {/* Search Bar Section */}
            <View style={styles.searchContainer}>
                <View style={styles.searchInputWrapper}>
                    <Icon name="magnify" size={20} color="#777" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search here..."
                        placeholderTextColor="#777"
                    />
                </View>
                <TouchableOpacity style={styles.filterButton}>
                    <Icon name="tune" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            {/* ✅ Scrollable Banners */}
            <FlatList
                data={banners}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                onScroll={(event) => {
                    const index = Math.round(
                        event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width
                    );
                    setActiveBanner(index);
                }}
                style={styles.bannerList}
                renderItem={({ item }) => (
                    <ImageBackground
                        source={item}
                        style={styles.banner}
                        imageStyle={styles.bannerImageStyle}
                    >
                        <View style={styles.bannerContent}>
                            <Text style={styles.bannerText}>Design Your Perfect Mirror Today</Text>
                            <Text style={styles.bannerSubtext}>Crafted Just for You!</Text>
                            <TouchableOpacity style={styles.customizeButton}>
                                <Text style={styles.customizeButtonText}>Customize Now</Text>
                            </TouchableOpacity>
                        </View>
                    </ImageBackground>
                )}
            />

            {/* ✅ Dots */}
            <View style={styles.bannerDotsContainer}>
                {banners.map((_, index) => (
                    <View
                        key={index}
                        style={[styles.dot, activeBanner === index && styles.activeDot]}
                    />
                ))}
            </View>

            {/* Most Popular Section Header */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>All</Text>
                <TouchableOpacity onPress={() => navigation.navigate('CategoryScreen', { category: 'Most Popular' })}>
                    <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
            </View>
        </>
    );

    return (
        <View style={styles.container}>
            {/* Use FlatList as the main scrollable container */}
            <FlatList
                data={popularProducts}
                keyExtractor={item => item.id}
                numColumns={2}
                columnWrapperStyle={styles.productRow}
                ListHeaderComponent={renderHeader}
                renderItem={({ item }) => (
                    <TouchableOpacity 
                        style={styles.productCard} 
                        onPress={() => navigation.navigate('ProductScreen', { product: item })}
                    >
                        <View style={styles.productImageContainer}>
                            <Image source={item.image} style={styles.productImage} />
                            <TouchableOpacity style={styles.heartIcon}>
                                <Icon name="heart-outline" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.productInfo}>
                            <Text style={styles.productName}>{item.name}</Text>
                            <View style={styles.priceAndButton}>
                                <Text style={styles.productPrice}>{item.price}</Text>
                                <TouchableOpacity style={styles.addToCartButton}>
                                    <Icon name="plus" size={16} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />

            {/* Render the new BottomNavigationBar component and pass the navigation prop */}
            <BottomNavigationBar navigation={navigation} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // Change the background color to the desired color
        backgroundColor: '#F9F9F9',
    },
    scrollContent: {
        paddingBottom: 80, // Add padding for bottom nav
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
    },
    headerTitle: {
        fontFamily: 'LeagueSpartan_700Bold',
        fontSize: 22,
        color: '#000',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 20,
    },
    searchInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: 10,
        paddingHorizontal: 15,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: 40,
        fontFamily: 'Montserrat_400Regular',
    },
    filterButton: {
        backgroundColor: 'transparent', // Made the background transparent
        padding: 8,
        borderRadius: 10,
        marginLeft: 10,
    },
    bannerList: {
        // New style for FlatList to control padding
        marginTop: 20,
        paddingHorizontal: 20,
    },
    banner: {
        width: 320, // Set a fixed width for each banner item
        height: 150,
        marginRight: 15,
        borderRadius: 15,
        overflow: 'hidden',
        justifyContent: 'center',
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    bannerContent: {
        width: '60%',
        padding: 15,
    },
    bannerText: {
        fontFamily: 'LeagueSpartan_700Bold',
        fontSize: 18,
        color: '#000',
    },
    bannerSubtext: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 12,
        color: '#000',
        marginTop: 5,
    },
    customizeButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginTop: 10,
        alignSelf: 'flex-start',
    },
    customizeButtonText: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 12,
        color: '#A68B69',
    },
    bannerDotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#D9D9D9',
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: '#A68B69',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 25,
        marginBottom: 10,
    },
    sectionTitle: {
        fontFamily: 'LeagueSpartan_700Bold',
        fontSize: 20,
        color: '#000',
    },
    seeAllText: {
        fontFamily: 'Montserrat_400Regular',
        color: '#A68B69',
    },
    productRow: {
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        marginBottom: 10,
    },
    productCard: {
        width: '47%',
        backgroundColor: '#F9F9F9',
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    productImageContainer: {
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    heartIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 15,
        padding: 5,
    },
    productInfo: {
        padding: 10,
    },
    productName: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 14,
    },
    priceAndButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    productPrice: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 14,
        color: '#A68B69',
    },
    addToCartButton: {
        backgroundColor: '#A68B69',
        padding: 8,
        borderRadius: 20,
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 60,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    navItem: {
        alignItems: 'center',
    },
    navText: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 10,
        color: '#A68B69',
    },
});