// MyAddressScreen.js
import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    ScrollView, 
    Platform,
    Modal,
    TextInput,
    SafeAreaView,
} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useFonts as useMontserrat, Montserrat_400Regular, Montserrat_600SemiBold } from "@expo-google-fonts/montserrat";
import { useFonts as useLeagueSpartan, LeagueSpartan_700Bold } from "@expo-google-fonts/league-spartan";

export default function MyAddressScreen() {
    const navigation = useNavigation();
    const [addresses, setAddresses] = useState([]);
    const [showAddAddressModal, setShowAddAddressModal] = useState(false);

    // State for form inputs inside the modal
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [completeAddress, setCompleteAddress] = useState('');
    const [landmark, setLandmark] = useState('');
    const [postalCode, setPostalCode] = useState('');

    const [montserratLoaded] = useMontserrat({ Montserrat_400Regular, Montserrat_600SemiBold });
    const [leagueSpartanLoaded] = useLeagueSpartan({ LeagueSpartan_700Bold });

    if (!montserratLoaded || !leagueSpartanLoaded) {
        return null;
    }

    const handleSaveAddress = () => {
        // Here you would implement the logic to save the address
        console.log("Saving Address:", {
            fullName,
            phoneNumber,
            completeAddress,
            landmark,
            postalCode
        });
        // Close the modal and reset form state
        setShowAddAddressModal(false);
        setFullName('');
        setPhoneNumber('');
        setCompleteAddress('');
        setLandmark('');
        setPostalCode('');
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="chevron-left" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Address</Text>
                <View style={{ width: 28 }} />
            </View>

            {/* Content based on whether addresses exist */}
            {addresses.length === 0 ? (
                // Empty state UI
                <View style={styles.emptyContainer}>
                    <Icon name="map-marker-off-outline" size={80} color="#D3D3D3" style={styles.emptyIcon} />
                    <Text style={styles.emptyTitle}>No delivery address is added</Text>
                    <Text style={styles.emptyText}>
                        Please make sure to add your delivery address to ensure your order is shipped to the correct location.
                    </Text>
                    <TouchableOpacity 
                        style={styles.addButton}
                        onPress={() => setShowAddAddressModal(true)}
                    >
                        <Text style={styles.addButtonText}>Add Deliver Address</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                // This section would display the list of addresses
                <ScrollView contentContainerStyle={styles.listContainer}>
                    {/* Map through addresses here to display them */}
                </ScrollView>
            )}

            {/* Full Screen Modal for adding a new address */}
            <Modal
                animationType="slide"
                transparent={false}
                visible={showAddAddressModal}
                onRequestClose={() => setShowAddAddressModal(false)}
            >
                <SafeAreaView style={styles.modalContainer}>
                    {/* Modal Header with Brown Background */}
                    <View style={styles.modalHeader}>
                        <TouchableOpacity 
                            onPress={() => setShowAddAddressModal(false)}
                            style={styles.backButton}
                        >
                            <Icon name="chevron-left" size={28} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.modalHeaderTitle}>Add Address</Text>
                        <View style={{ width: 28 }} />
                    </View>
                    
                    {/* Modal Content with White Background */}
                    <View style={styles.modalContent}>
                        <ScrollView 
                            style={styles.formScrollView}
                            contentContainerStyle={styles.formScrollContent}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Form Fields */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Full Name*</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder=""
                                    value={fullName}
                                    onChangeText={setFullName}
                                    placeholderTextColor="#999"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Phone Number*</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder=""
                                    keyboardType="phone-pad"
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    placeholderTextColor="#999"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Complete Address*</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder=""
                                    value={completeAddress}
                                    onChangeText={setCompleteAddress}
                                    placeholderTextColor="#999"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Landmark*</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder=""
                                    value={landmark}
                                    onChangeText={setLandmark}
                                    placeholderTextColor="#999"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Postal Code*</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder=""
                                    keyboardType="number-pad"
                                    value={postalCode}
                                    onChangeText={setPostalCode}
                                    placeholderTextColor="#999"
                                />
                            </View>
                        </ScrollView>

                        {/* Save Button */}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.saveButton} onPress={handleSaveAddress}>
                                <Text style={styles.saveButtonText}>Add new address</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </Modal>
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
        paddingTop: Platform.OS === 'android' ? 50 : 60,
        paddingBottom: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 22,
        color: '#000',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    emptyIcon: {
        color: '#A68B69', 
        marginBottom: 20,
    },
    emptyTitle: {
        fontFamily: 'LeagueSpartan_700Bold',
        fontSize: 20,
        color: '#000',
        marginBottom: 10,
    },
    emptyText: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 16,
        color: '#777',
        textAlign: 'center',
        marginBottom: 30,
    },
    addButton: {
        width: "100%",
        height: 50,
        backgroundColor: "#A68B69",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 10,
    },
    addButtonText: {
        color: '#fff',
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 18,
    },
    listContainer: {
        padding: 20,
    },
    // --- Updated Modal Styles to Match Design ---
    modalContainer: {
        flex: 1,
        backgroundColor: '#A68B69',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 50 : 0,
        paddingBottom: 15,
        backgroundColor: '#A68B69',
    },
    backButton: {
        width: 28,
        alignItems: 'flex-start',
    },
    modalHeaderTitle: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 18,
        color: '#fff',
        flex: 1,
        textAlign: 'center',
    },
    modalContent: {
        flex: 1,
        backgroundColor: '#fff',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        paddingTop: 30,
    },
    formScrollView: {
        flex: 1,
        paddingHorizontal: 30,
    },
    formScrollContent: {
        paddingBottom: 20,
    },
    inputContainer: {
        marginBottom: 30,
    },
    inputLabel: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 16,
        color: '#999',
        marginBottom: 8,
    },
    input: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 16,
        color: '#000',
        paddingVertical: 12,
        paddingHorizontal: 0,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    buttonContainer: {
        paddingHorizontal: 30,
        paddingVertical: 20,
        paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    },
    saveButton: {
        width: "100%",
        height: 50,
        backgroundColor: "#A68B69",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    saveButtonText: {
        color: '#fff',
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 16,
    },
});