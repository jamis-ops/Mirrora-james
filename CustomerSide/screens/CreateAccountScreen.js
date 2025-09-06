import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ImageBackground, Alert, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CheckBox from 'expo-checkbox';

// --- Firebase Imports ---
// ✅ Import updateProfile to save the user's name
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../Backend/firebaseConfig'; // Make sure this path is correct

// Font imports
import { useFonts as useLeagueSpartan, LeagueSpartan_700Bold } from "@expo-google-fonts/league-spartan";
import { useFonts as useMontserrat, Montserrat_400Regular, Montserrat_600SemiBold, Montserrat_700Bold } from "@expo-google-fonts/montserrat";

export default function CreateAccountScreen({ navigation }) {
    // --- State for inputs ---
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');

    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [isChecked, setChecked] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const [leagueSpartanLoaded] = useLeagueSpartan({ LeagueSpartan_700Bold });
    const [montserratLoaded] = useMontserrat({ Montserrat_400Regular, Montserrat_600SemiBold, Montserrat_700Bold });

    if (!leagueSpartanLoaded || !montserratLoaded) {
        return null;
    }

    // --- Handle Account Creation ---
    const handleCreateAccount = async () => {
        // Basic Validation
        if (!fullName || !email || !password || !confirmPassword) {
            Alert.alert('Missing Fields', 'Please fill out all fields.');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Password Mismatch', 'The passwords do not match.');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Weak Password', 'Password should be at least 6 characters.');
            return;
        }
        if (!isChecked) {
            Alert.alert('Terms & Conditions', 'You must agree to the Terms & Conditions.');
            return;
        }

        try {
            // 1. Create user with Firebase
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // 2. ✅ Update their profile with the full name
            await updateProfile(userCredential.user, {
                displayName: fullName
            });

            setModalVisible(true);

        } catch (error) {
            // Handle Firebase errors with user-friendly messages
            if (error.code === 'auth/email-already-in-use') {
                Alert.alert('Account Creation Failed', 'This email already exists.');
            } else if (error.code === 'auth/invalid-email') {
                Alert.alert('Invalid Email', 'Please enter a valid email address.');
            } else {
                Alert.alert('Signup Failed', 'An unexpected error occurred. Please try again.');
            }
            console.error("Firebase signup error:", error);
        }
    };
    
    const SuccessModal = () => (
        <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
                setModalVisible(false);
                navigation.navigate('SignIn');
            }}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Icon name="check-circle-outline" size={70} color="#66BB6A" />
                    <Text style={styles.modalTitle}>Registration Complete!</Text>
                    <Text style={styles.modalText}>
                        Your account has been successfully created.
                    </Text>
                    <TouchableOpacity
                        style={styles.modalButton}
                        onPress={() => {
                            setModalVisible(false);
                            navigation.navigate('SignIn');
                        }}
                    >
                        <Text style={styles.modalButtonText}>Go to Login</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <ImageBackground
                source={require("../assets/header-bg.png")}
                style={styles.headerBg}
                resizeMode="cover"
            >
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Fill your information below</Text>
            </ImageBackground>

            <View style={styles.formContainer}>

                <View style={styles.inputContainer}>
                    <Icon name="account-outline" size={20} color="#A1866F" style={styles.icon} />
                    <TextInput placeholder="Full Name" style={styles.textInput} value={fullName} onChangeText={setFullName} />
                </View>

                <View style={styles.inputContainer}>
                    <Icon name="email-outline" size={20} color="#A1866F" style={styles.icon} />
                    <TextInput placeholder="Email" style={styles.textInput} keyboardType="email-address" value={email} onChangeText={setEmail} autoCapitalize="none" />
                </View>

                <View style={styles.inputContainer}>
                    <Icon name="lock-outline" size={20} color="#A1866F" style={styles.icon} />
                    <TextInput
                        placeholder="Password"
                        secureTextEntry={!passwordVisible}
                        style={styles.textInput}
                        value={password}
                        onChangeText={setPassword}
                    />
                    <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                        <Icon name={passwordVisible ? 'eye-outline' : 'eye-off-outline'} size={20} color="#A1866F" />
                    </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                    <Icon name="lock-check-outline" size={20} color="#A1866F" style={styles.icon} />
                    <TextInput
                        placeholder="Confirm Password"
                        secureTextEntry={!confirmPasswordVisible}
                        style={styles.textInput}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />
                    <TouchableOpacity onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}>
                        <Icon name={confirmPasswordVisible ? 'eye-outline' : 'eye-off-outline'} size={20} color="#A1866F" />
                    </TouchableOpacity>
                </View>

                <View style={styles.checkboxContainer}>
                    <CheckBox
                        value={isChecked}
                        onValueChange={setChecked}
                        color={isChecked ? '#A1866F' : undefined}
                    />
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.agreeWithText}>Agree with </Text>
                        <Text style={styles.termsAndConditionText}>Terms & Condition</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleCreateAccount}
                >
                    <Text style={styles.buttonText}>Sign Up</Text>
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
                    <Text style={styles.link}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                        <Text style={styles.signInLink}>Sign In</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <SuccessModal />
        </ScrollView>
    );
}

// Keep your existing styles
const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#fff',
    },
    headerBg: {
        width: "100%",
        height: 280,
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 25,
    },
    title: {
        fontSize: 28,
        fontFamily: 'LeagueSpartan_700Bold',
        color: '#000',
    },
    subtitle: {
        fontSize: 15,
        fontFamily: 'Montserrat_400Regular',
        color: "gray",
        marginTop: 5,
    },
    formContainer: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#727272",
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginTop: 15,
    },
    icon: {
        marginRight: 8,
    },
    textInput: {
        flex: 1,
        paddingVertical: 10,
        fontFamily: 'Montserrat_400Regular',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 15,
    },
    agreeWithText: {
        color: '#000',
        fontSize: 14,
        fontFamily: 'Montserrat_400Regular',
        paddingLeft: 10,
    },
    termsAndConditionText: {
        color: '#A68B69',
        fontFamily: 'Montserrat_400Regular',
        textDecorationLine: "underline"
    },
    button: {
        backgroundColor: '#A68B69',
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: 'center',
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'Montserrat_600SemiBold',
    },
    link: {
        fontFamily: 'Montserrat_400Regular',
        color: 'black',
    },
    signInLink: {
        color: '#7a5c3d',
        fontFamily: 'Montserrat_700Bold',
        textDecorationLine: 'underline',
    },
    // Modal Styles
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        width: 300,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        marginTop: 15,
        marginBottom: 15,
        textAlign: 'center',
        fontFamily: 'Montserrat_700Bold',
        fontSize: 22,
        color: '#000',
    },
    modalText: {
        marginBottom: 20,
        textAlign: 'center',
        fontFamily: 'Montserrat_400Regular',
        fontSize: 14,
        color: '#777',
        lineHeight: 20,
    },
    modalButton: {
        backgroundColor: '#A68B69',
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 20,
        elevation: 2,
    },
    modalButtonText: {
        color: '#fff',
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 16,
    },
});
