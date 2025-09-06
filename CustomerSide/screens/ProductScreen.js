import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Font imports from your HomeScreen
import { useFonts as useLeagueSpartan, LeagueSpartan_700Bold } from "@expo-google-fonts/league-spartan";
import { useFonts as useMontserrat, Montserrat_400Regular, Montserrat_600SemiBold } from "@expo-google-fonts/montserrat";

export default function ProductScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { product } = route.params;

    // Load fonts
    const [leagueSpartanLoaded] = useLeagueSpartan({ LeagueSpartan_700Bold });
    const [montserratLoaded] = useMontserrat({ Montserrat_400Regular, Montserrat_600SemiBold });

    if (!leagueSpartanLoaded || !montserratLoaded) {
        return null; // Wait for fonts to load
    }

    return (
        <View style={styles.container}>
            {/* Product Image container with the back button */}
            <View style={styles.imageContainer}>
                {/* Dynamically display the product image */}
                <Image source={product.image} style={styles.productImage} />
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="chevron-left" size={30} color="#000" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Product Details Section inside a ScrollView */}
            <ScrollView showsVerticalScrollIndicator={false} style={styles.detailsScrollView}>
                <View style={styles.detailsContainer}>
                    {/* Dynamically display the product name */}
                    <Text style={styles.productName}>{product.name}</Text>
                    {/* Dynamically display the product price */}
                    <Text style={styles.productPrice}>{product.price}</Text>

                    {/* Customization link */}
                    <TouchableOpacity style={styles.customizeLink} onPress={() => navigation.navigate('CustomizationScreen', { product: product })}>
                        <Text style={styles.customizeText}>Customize</Text>
                    </TouchableOpacity>

                    {/* Description */}
                    <Text style={styles.productDescription}>Floor standing mirrors are not only convenient for you to appreciate your whole body, but also can decorate your space</Text>
                    
                    {/* Line after description */}
                    <View style={styles.divider} />

                    {/* Details like Dimensions and Weight */}
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Measures (H/W):</Text>
                        <Text style={styles.infoValue}>60.2” x 51.2”</Text>
                    </View>

                    {/* Line after measures */}
                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Weight</Text>
                        <Text style={styles.infoValue}>20.2 pound</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={styles.bottomBar}>
                <TouchableOpacity style={styles.favoriteButton}>
                    <Icon name="heart-outline" size={28} color="#A68B69" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.addToCartButton}>
                    <Text style={styles.addToCartText}>Add to Cart</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF7EC',
    },
    imageContainer: {
        position: 'relative',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: 50,
    },
    backButton: {
        padding: 5,
    },
    productImage: {
        width: '100%',
        height: 450,
        resizeMode: 'cover',
    },
    detailsScrollView: {
        flex: 1,
    },
    detailsContainer: {
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    productName: {
        fontFamily: 'LeagueSpartan_700Bold',
        fontSize: 24,
    },
    productPrice: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 18,
        color: '#000',
        marginTop: 5,
    },
    customizeLink: {
        marginTop: 2,
        marginBottom: 15,
    },
    customizeText: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 12,
        color: '#A68B69',
        textDecorationLine: 'underline',
    },
    productDescription: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
        marginTop: 5,
    },
    divider: {
        borderBottomColor: '#E0E0E0',
        borderBottomWidth: StyleSheet.hairlineWidth,
        marginVertical: 15,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 5,
    },
    infoLabel: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 14,
        color: '#555',
    },
    infoValue: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 14,
        color: '#000',
    },
    bottomBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    favoriteButton: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    addToCartButton: {
        flex: 1,
        backgroundColor: '#A68B69',
        height: 50,
        borderRadius: 25,
        marginLeft: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addToCartText: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 16,
        color: '#fff',
    },
});