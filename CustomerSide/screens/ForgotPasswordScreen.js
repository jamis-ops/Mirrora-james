import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Platform, ActivityIndicator, Modal } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useFonts as useMontserrat, Montserrat_400Regular, Montserrat_600SemiBold } from "@expo-google-fonts/montserrat";

// --- Firebase Imports ---
import { auth } from '../Backend/firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';

export default function ForgotPasswordScreen() {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const [montserratLoaded] = useMontserrat({ Montserrat_400Regular, Montserrat_600SemiBold });

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    const handleSendPasswordReset = async () => {
        if (!email.trim()) {
            Alert.alert("Input Required", "Please enter your email address to continue.");
            return;
        }
        if (!validateEmail(email)) {
            Alert.alert("Invalid Email", "Please enter a valid email address.");
            return;
        }

        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setModalVisible(true);
        } catch (error) {
            console.error("Password reset error:", error);
            let errorMessage = "An error occurred. Please try again later.";
            if (error.code === 'auth/user-not-found') {
                errorMessage = "The email address you entered is not registered. Please check the address or create a new account.";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "The email address you entered is invalid. Please try again.";
            } else {
                errorMessage = error.message;
            }
            Alert.alert("Error", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!montserratLoaded) {
        return null;
    }

    const SuccessModal = () => (
        <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
                setModalVisible(!modalVisible);
                navigation.goBack();
            }}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Icon name="check-circle-outline" size={70} color="#fff" />
                    <Text style={styles.modalTitle}>Reset Link Sent!</Text>
                    <Text style={styles.modalText}>
                        If this email is registered, we've sent a reset link to {email}. Check your spam folder just in case.
                    </Text>
                    <TouchableOpacity
                        style={styles.modalButton}
                        onPress={() => {
                            setModalVisible(!modalVisible);
                            navigation.goBack();
                        }}
                    >
                        <Text style={styles.modalButtonText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.contentContainer}>
                {/* Header with back button */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="chevron-left" size={30} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Forgot Password</Text>
                </View>

                {/* Verification icon */}
                <View style={styles.iconContainer}>
                    <Icon name="email-check-outline" size={100} color="#A68B69" />
                </View>

                {/* Main text and instructions */}
                <View style={styles.textContainer}>
                    <Text style={styles.mainText}>Please Verify Your Email Address</Text>
                    <Text style={styles.subText}>
                        We sent a verification to your registered email. Please verify your email.
                    </Text>
                </View>

                {/* Email input field */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Enter email</Text>
                    <View style={styles.textInputWrapper}>
                        <Icon name="email-outline" size={20} color="#777" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter address"
                            placeholderTextColor="#777"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>
                </View>

                {/* Send button */}
                <TouchableOpacity
                    style={styles.sendButton}
                    onPress={handleSendPasswordReset}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.sendButtonText}>Send</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>

            <SuccessModal />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3EFE9',
    },
    contentContainer: {
        flexGrow: 1,
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 40,
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        left: 0,
        zIndex: 1,
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 20,
        color: '#000',
    },
    iconContainer: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#EBE3D5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 5,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    mainText: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 24,
        color: '#000',
        textAlign: 'center',
        marginBottom: 10,
    },
    subText: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 14,
        color: '#777',
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 20,
    },
    inputContainer: {
        width: '100%',
        marginBottom: 30,
    },
    label: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 16,
        color: '#000',
        marginBottom: 8,
    },
    textInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3EFE9',
        borderRadius: 10,
        height: 50,
        paddingHorizontal: 15,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: '100%',
        fontFamily: 'Montserrat_400Regular',
        fontSize: 16,
        color: '#000',
    },
    sendButton: {
        width: '100%',
        backgroundColor: '#A68B69',
        paddingVertical: 15,
        alignItems: 'center',
        borderRadius: 25,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 5,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    sendButtonText: {
        color: '#fff',
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 18,
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
        backgroundColor: '#A68B69',
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
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 22,
        color: '#fff',
    },
    modalText: {
        marginBottom: 20,
        textAlign: 'center',
        fontFamily: 'Montserrat_400Regular',
        fontSize: 14,
        color: '#fff',
        lineHeight: 20,
    },
    modalButton: {
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        elevation: 2,
    },
    modalButtonText: {
        color: '#A68B69',
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 16,
    },
});
