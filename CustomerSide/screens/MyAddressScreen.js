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
    Alert,
    ActivityIndicator
} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useFonts as useMontserrat, Montserrat_400Regular, Montserrat_600SemiBold } from "@expo-google-fonts/montserrat";
import { useFonts as useLeagueSpartan, LeagueSpartan_700Bold } from "@expo-google-fonts/league-spartan";

// Firebase imports
import { auth, db } from '../Backend/firebaseConfig';
import { doc, setDoc, getDoc, collection, onSnapshot, deleteDoc } from 'firebase/firestore';

export default function MyAddressScreen() {
    const navigation = useNavigation();
    const [addresses, setAddresses] = useState([]);
    const [showAddAddressModal, setShowAddAddressModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // State for form inputs inside the modal
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [completeAddress, setCompleteAddress] = useState('');
    const [landmark, setLandmark] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [editingAddressId, setEditingAddressId] = useState(null);

    const [montserratLoaded] = useMontserrat({ Montserrat_400Regular, Montserrat_600SemiBold });
    const [leagueSpartanLoaded] = useLeagueSpartan({ LeagueSpartan_700Bold });

    // Fetch addresses from Firestore
    useEffect(() => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const addressesRef = collection(db, 'users', currentUser.uid, 'addresses');
        
        const unsubscribe = onSnapshot(addressesRef, 
            (snapshot) => {
                const addressesData = [];
                snapshot.forEach((doc) => {
                    addressesData.push({ id: doc.id, ...doc.data() });
                });
                setAddresses(addressesData);
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching addresses:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    // Handle phone number input with validation
    const handlePhoneNumberChange = (text) => {
        const cleanedText = text.replace(/[^0-9]/g, '');
        if (cleanedText.length <= 11) {
            setPhoneNumber(cleanedText);
        }
    };

    // Handle postal code input with validation
    const handlePostalCodeChange = (text) => {
        const cleanedText = text.replace(/[^0-9]/g, '');
        setPostalCode(cleanedText);
    };

    // Reset form fields
    const resetForm = () => {
        setFullName('');
        setPhoneNumber('');
        setCompleteAddress('');
        setLandmark('');
        setPostalCode('');
        setEditingAddressId(null);
    };

    // Edit address
    const handleEditAddress = (address) => {
        setFullName(address.fullName);
        setPhoneNumber(address.phoneNumber);
        setCompleteAddress(address.completeAddress);
        setLandmark(address.landmark);
        setPostalCode(address.postalCode);
        setEditingAddressId(address.id);
        setShowAddAddressModal(true);
    };

    // Delete address
    const handleDeleteAddress = async (addressId) => {
        Alert.alert(
            "Delete Address",
            "Are you sure you want to delete this address?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                { 
                    text: "Delete", 
                    onPress: async () => {
                        try {
                            const currentUser = auth.currentUser;
                            if (!currentUser) return;
                            
                            await deleteDoc(doc(db, 'users', currentUser.uid, 'addresses', addressId));
                            Alert.alert("Success", "Address deleted successfully");
                        } catch (error) {
                            console.error("Error deleting address:", error);
                            Alert.alert("Error", "Failed to delete address");
                        }
                    }
                }
            ]
        );
    };

    // Save address to Firestore
    const handleSaveAddress = async () => {
        // Validation
        if (!fullName.trim()) {
            Alert.alert("Validation Error", "Please enter your full name.");
            return;
        }
        if (!phoneNumber || phoneNumber.length !== 11) {
            Alert.alert("Validation Error", "Please enter a valid 11-digit phone number.");
            return;
        }
        if (!completeAddress.trim()) {
            Alert.alert("Validation Error", "Please enter your complete address.");
            return;
        }
        if (!landmark.trim()) {
            Alert.alert("Validation Error", "Please enter a landmark.");
            return;
        }
        if (!postalCode.trim()) {
            Alert.alert("Validation Error", "Please enter your postal code.");
            return;
        }

        setSaving(true);
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                Alert.alert("Error", "You must be logged in to save addresses");
                return;
            }

            const addressData = {
                fullName,
                phoneNumber,
                completeAddress,
                landmark,
                postalCode,
                createdAt: new Date(),
                isDefault: addresses.length === 0 // Set as default if it's the first address
            };

            if (editingAddressId) {
                // Update existing address
                await setDoc(doc(db, 'users', currentUser.uid, 'addresses', editingAddressId), addressData);
                Alert.alert("Success", "Address updated successfully");
            } else {
                // Add new address
                const newAddressRef = doc(collection(db, 'users', currentUser.uid, 'addresses'));
                await setDoc(newAddressRef, addressData);
                Alert.alert("Success", "Address added successfully");
            }

            // Close modal and reset form
            setShowAddAddressModal(false);
            resetForm();
        } catch (error) {
            console.error("Error saving address:", error);
            Alert.alert("Error", "Failed to save address");
        } finally {
            setSaving(false);
        }
    };

    // Set default address
    const handleSetDefaultAddress = async (addressId) => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) return;

            // First, remove default status from all addresses
            const updatePromises = addresses.map(async (address) => {
                await setDoc(doc(db, 'users', currentUser.uid, 'addresses', address.id), {
                    ...address,
                    isDefault: address.id === addressId
                }, { merge: true });
            });

            await Promise.all(updatePromises);
            Alert.alert("Success", "Default address updated");
        } catch (error) {
            console.error("Error setting default address:", error);
            Alert.alert("Error", "Failed to set default address");
        }
    };

    if (!montserratLoaded || !leagueSpartanLoaded) {
        return null;
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#A68B69" />
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
                        <Text style={styles.addButtonText}>Add Delivery Address</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                // Display the list of addresses
                <ScrollView contentContainerStyle={styles.listContainer}>
                    {addresses.map((address) => (
                        <View key={address.id} style={styles.addressCard}>
                            <View style={styles.addressHeader}>
                                <Text style={styles.addressName}>{address.fullName}</Text>
                                {address.isDefault && (
                                    <View style={styles.defaultBadge}>
                                        <Text style={styles.defaultBadgeText}>Default</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.addressText}>{address.completeAddress}</Text>
                            <Text style={styles.addressText}>Landmark: {address.landmark}</Text>
                            <Text style={styles.addressText}>Postal Code: {address.postalCode}</Text>
                            <Text style={styles.addressText}>Phone: {address.phoneNumber}</Text>
                            
                            <View style={styles.addressActions}>
                                <TouchableOpacity 
                                    style={styles.actionButton}
                                    onPress={() => handleEditAddress(address)}
                                >
                                    <Icon name="pencil" size={18} color="#A68B69" />
                                    <Text style={styles.actionButtonText}>Edit</Text>
                                </TouchableOpacity>
                                
                                {!address.isDefault && (
                                    <TouchableOpacity 
                                        style={styles.actionButton}
                                        onPress={() => handleSetDefaultAddress(address.id)}
                                    >
                                        <Icon name="star-outline" size={18} color="#A68B69" />
                                        <Text style={styles.actionButtonText}>Set Default</Text>
                                    </TouchableOpacity>
                                )}
                                
                                <TouchableOpacity 
                                    style={styles.actionButton}
                                    onPress={() => handleDeleteAddress(address.id)}
                                >
                                    <Icon name="delete-outline" size={18} color="#FF3B30" />
                                    <Text style={[styles.actionButtonText, { color: '#FF3B30' }]}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                    
                    <TouchableOpacity 
                        style={styles.addAnotherButton}
                        onPress={() => setShowAddAddressModal(true)}
                    >
                        <Icon name="plus" size={20} color="#A68B69" />
                        <Text style={styles.addAnotherButtonText}>Add Another Address</Text>
                    </TouchableOpacity>
                </ScrollView>
            )}

            {/* Full Screen Modal for adding/editing address */}
            <Modal
                animationType="slide"
                transparent={false}
                visible={showAddAddressModal}
                onRequestClose={() => {
                    setShowAddAddressModal(false);
                    resetForm();
                }}
            >
                <SafeAreaView style={styles.modalContainer}>
                    {/* Modal Header with Brown Background */}
                    <View style={styles.modalHeader}>
                        <TouchableOpacity 
                            onPress={() => {
                                setShowAddAddressModal(false);
                                resetForm();
                            }}
                            style={styles.backButton}
                        >
                            <Icon name="chevron-left" size={28} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.modalHeaderTitle}>
                            {editingAddressId ? 'Edit Address' : 'Add Address'}
                        </Text>
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
                                    placeholder="Enter your full name"
                                    value={fullName}
                                    onChangeText={setFullName}
                                    placeholderTextColor="#999"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Phone Number*</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter 11-digit phone number"
                                    keyboardType="phone-pad"
                                    value={phoneNumber}
                                    onChangeText={handlePhoneNumberChange}
                                    placeholderTextColor="#999"
                                    maxLength={11}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Complete Address*</Text>
                                <TextInput
                                    style={[styles.input, { height: 80 }]}
                                    placeholder="Enter your complete address"
                                    value={completeAddress}
                                    onChangeText={setCompleteAddress}
                                    placeholderTextColor="#999"
                                    multiline={true}
                                    textAlignVertical="top"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Landmark*</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter a nearby landmark"
                                    value={landmark}
                                    onChangeText={setLandmark}
                                    placeholderTextColor="#999"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Postal Code*</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter postal code"
                                    keyboardType="number-pad"
                                    value={postalCode}
                                    onChangeText={handlePostalCodeChange}
                                    placeholderTextColor="#999"
                                    maxLength={6}
                                />
                            </View>
                        </ScrollView>

                        {/* Save Button */}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity 
                                style={styles.saveButton} 
                                onPress={handleSaveAddress}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.saveButtonText}>
                                        {editingAddressId ? 'Update Address' : 'Add New Address'}
                                    </Text>
                                )}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    addressCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    addressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    addressName: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 16,
        color: '#000',
    },
    defaultBadge: {
        backgroundColor: '#A68B69',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    defaultBadgeText: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 12,
        color: '#fff',
    },
    addressText: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    addressActions: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: 12,
        flexWrap: 'wrap',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
        marginBottom: 8,
    },
    actionButtonText: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 14,
        color: '#A68B69',
        marginLeft: 4,
    },
    addAnotherButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 25,
        padding: 16,
        marginTop: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    addAnotherButtonText: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 16,
        color: '#A68B69',
        marginLeft: 8,
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