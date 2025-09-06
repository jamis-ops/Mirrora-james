import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, ScrollView, Platform, Modal, Pressable, Alert, ActivityIndicator } from 'react-native';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { useFonts as useLeagueSpartan, LeagueSpartan_700Bold } from "@expo-google-fonts/league-spartan";
import { useFonts as useMontserrat, Montserrat_400Regular, Montserrat_600SemiBold } from "@expo-google-fonts/montserrat";

// --- Firebase Imports ---
import { auth, db } from '../Backend/firebaseConfig';
import { updateProfile, signInWithCustomToken } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function CompleteProfileScreen() {
    const navigation = useNavigation();
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [gender, setGender] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    // --- State for Backend Operations ---
    const [loading, setLoading] = useState(true); // For initial data fetch
    const [saving, setSaving] = useState(false);  // For when the user clicks save

    const [leagueSpartanLoaded] = useLeagueSpartan({ LeagueSpartan_700Bold, });
    const [montserratLoaded] = useMontserrat({ Montserrat_400Regular, Montserrat_600SemiBold });

    // --- Fetch Existing Profile Data ---
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Attempt to sign in with the custom token if it exists
                if (typeof __initial_auth_token !== 'undefined' && !auth.currentUser) {
                    await signInWithCustomToken(auth, __initial_auth_token);
                }

                const currentUser = auth.currentUser;
                if (currentUser) {
                    const userDocRef = doc(db, "users", currentUser.uid);
                    const docSnap = await getDoc(userDocRef);

                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        setName(userData.name || currentUser.displayName || '');
                        setPhoneNumber(userData.phoneNumber || '');
                        setGender(userData.gender || '');
                    } else {
                        setName(currentUser.displayName || '');
                    }
                }
            } catch (error) {
                console.error("Failed to fetch user data:", error);
                Alert.alert("Error", "Could not load profile data. Please check your connection or try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // --- Save Profile Data ---
    const handleSaveProfile = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        if (!name.trim()) {
            Alert.alert("Validation Error", "Please enter your full name.");
            return;
        }

        setSaving(true);
        try {
            await updateProfile(currentUser, { displayName: name });
            const userDocRef = doc(db, "users", currentUser.uid);
            await setDoc(userDocRef, {
                name: name,
                phoneNumber: phoneNumber,
                gender: gender,
                email: currentUser.email
            }, { merge: true });

            Alert.alert("Success", "Your profile has been updated.");
            navigation.goBack();
        } catch (error) {
            console.error("Profile update error:", error);
            Alert.alert("Error", "Could not update your profile.");
        } finally {
            setSaving(false);
        }
    };

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

    const GenderModal = () => {
        const genders = ['Female', 'Male', 'Other'];
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(!modalVisible)}
            >
                <Pressable style={styles.centeredView} onPress={() => setModalVisible(false)}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Select Gender</Text>
                        {genders.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.genderOption}
                                onPress={() => {
                                    setGender(item);
                                    setModalVisible(false);
                                }}
                            >
                                <Text style={styles.genderOptionText}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Pressable>
            </Modal>
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.contentContainer}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Complete Your Profile</Text>
                    <Text style={styles.headerSubtitle}>
                        Don't worry, only you can see your personal data. No one else will be able to see it.
                    </Text>
                </View>

                {/* Profile Picture Section */}
                <View style={styles.profileImageContainer}>
                    <Icon name="account" size={80} color="#A68B69" />
                    <TouchableOpacity style={styles.editIcon}>
                        <Icon name="pencil" size={16} color="#000" />
                    </TouchableOpacity>
                </View>

                {/* Form Inputs */}
                <View style={styles.formSection}>
                    {/* Name Input */}
                    <Text style={styles.label}>Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="John Doe"
                        placeholderTextColor="#999"
                        value={name}
                        onChangeText={setName}
                    />

                    {/* Phone Number Input */}
                    <Text style={styles.label}>Phone Number</Text>
                    <View style={styles.phoneInputContainer}>
                        <View style={styles.countryCodeContainer}>
                            <Text style={styles.countryCodeText}>+63</Text>
                            <Icon name="chevron-down" size={16} color="#999" />
                        </View>
                        <TextInput
                            style={styles.phoneInput}
                            placeholder="Enter Phone Number"
                            placeholderTextColor="#999"
                            keyboardType="phone-pad"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                        />
                    </View>

                    {/* Gender Dropdown */}
                    <Text style={styles.label}>Gender</Text>
                    <TouchableOpacity style={styles.dropdownContainer} onPress={() => setModalVisible(true)}>
                        <Text style={[styles.dropdownValue, !gender && styles.placeholderText]}>
                            {gender || 'Select'}
                        </Text>
                        <Icon name="chevron-down" size={20} color="#999" />
                    </TouchableOpacity>
                </View>

                {/* Complete Profile Button */}
                <TouchableOpacity style={styles.completeButton} onPress={handleSaveProfile} disabled={saving}>
                    {saving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.completeButtonText}>Complete Profile</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>

            {/* Gender Selection Modal */}
            <GenderModal />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F2EC',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F2EC',
    },
    contentContainer: {
        flexGrow: 1,
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 35,
        paddingHorizontal: 5,
    },
    headerTitle: {
        fontFamily: 'LeagueSpartan_700Bold',
        fontSize: 32,
        color: '#2C2C2C',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 38,
    },
    headerSubtitle: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 15,
        color: '#888',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 10,
    },
    profileImageContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#E8E2D7',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 50,
        position: 'relative',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    editIcon: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    formSection: {
        width: '100%',
        marginBottom: 40,
    },
    label: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 16,
        color: '#2C2C2C',
        marginBottom: 5,
        marginLeft: 4,
    },
    input: {
        width: '100%',
        height: 45,
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 20,
        marginBottom: 24,
        fontFamily: 'Montserrat_400Regular',
        fontSize: 16,
        color: '#2C2C2C',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    phoneInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 24,
        height: 45,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    countryCodeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderRightWidth: 1,
        borderRightColor: '#E5E5E5',
        height: '100%',
        justifyContent: 'center',
        minWidth: 80,
    },
    countryCodeText: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 16,
        marginRight: 6,
        color: '#2C2C2C',
    },
    phoneInput: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 16,
        fontFamily: 'Montserrat_400Regular',
        fontSize: 16,
        color: '#2C2C2C',
    },
    dropdownContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 20,
        height: 45,
        justifyContent: 'space-between',
        marginBottom: 24,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    dropdownValue: {
        flex: 1,
        fontFamily: 'Montserrat_400Regular',
        fontSize: 16,
        color: '#2C2C2C',
    },
    placeholderText: {
        color: '#999',
    },
    completeButton: {
        width: '100%',
        backgroundColor: '#A68B69',
        paddingVertical: 18,
        alignItems: 'center',
        borderRadius: 28,
        marginTop: -25,
        ...Platform.select({
            ios: {
                shadowColor: '#A68B69',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    completeButtonText: {
        color: '#fff',
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 18,
        letterSpacing: 0.5,
    },
    // Modal styles
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '80%',
    },
    modalTitle: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 20,
        marginBottom: 15,
        textAlign: 'center',    
    },
    genderOption: {
        padding: 10,
        width: '100%',
        alignItems: 'center',
    },
    genderOptionText: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 16,
    },
});