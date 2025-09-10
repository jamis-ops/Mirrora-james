import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    ScrollView, 
    ImageBackground, 
    Modal, 
    ActivityIndicator 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CheckBox from 'expo-checkbox';

// --- Firebase Imports ---
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
// Make sure this path is correct for your project
import { auth } from '../Backend/firebaseConfig'; 

// Font imports
import { useFonts as useLeagueSpartan, LeagueSpartan_700Bold } from "@expo-google-fonts/league-spartan";
import { useFonts as useMontserrat, Montserrat_400Regular, Montserrat_600SemiBold, Montserrat_700Bold } from "@expo-google-fonts/montserrat";

export default function CreateAccountScreen({ navigation }) {
    // --- State for inputs ---
    const [firstName, setFirstName] = useState('');
    const [middleInitial, setMiddleInitial] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [address, setAddress] = useState('');

    // --- State for UI/Modals ---
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [isChecked, setChecked] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalTitle, setModalTitle] = useState('');
    const [modalIcon, setModalIcon] = useState('information-outline');
    const [modalIconColor, setModalIconColor] = useState('#2196F3');
    const [isLoading, setIsLoading] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);

    // New state to hold password validation messages
    const [passwordValidationErrors, setPasswordValidationErrors] = useState([]);

    const [leagueSpartanLoaded] = useLeagueSpartan({ LeagueSpartan_700Bold });
    const [montserratLoaded] = useMontserrat({ Montserrat_400Regular, Montserrat_600SemiBold, Montserrat_700Bold });

    if (!leagueSpartanLoaded || !montserratLoaded) {
        return null;
    }

    // Custom modal component for all messages (success, warning, error)
    const MessageModal = () => (
        <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
                setModalVisible(false);
            }}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Icon name={modalIcon} size={70} color={modalIconColor} />
                    <Text style={styles.modalTitle}>{modalTitle}</Text>
                    <Text style={styles.modalText}>{modalMessage}</Text>
                    <TouchableOpacity
                        style={styles.modalButton}
                        onPress={() => {
                            setModalVisible(false);
                            if (modalIcon === 'check-circle-outline') {
                                navigation.navigate('SignIn');
                            }
                        }}
                    >
                        <Text style={styles.modalButtonText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    // --- Updated Password Validation Logic ---
    const validatePassword = (password) => {
        const errors = [];
        
        // Check for at least 12 characters
        if (password.length < 12) {
            errors.push('Must be at least 12 characters long.');
        }

        // Check for an uppercase and a lowercase letter
        if (!/(?=.*[a-z])(?=.*[A-Z])/.test(password)) {
            errors.push('Must contain both uppercase and lowercase letters.');
        }
        
        // Check for a number
        if (!/\d/.test(password)) {
            errors.push('Must contain at least one number.');
        }

        return errors;
    };
    
    const handlePasswordChange = (text) => {
        setPassword(text);
        const errors = validatePassword(text);
        setPasswordValidationErrors(errors);
    };

    // --- Handle Account Creation ---
    const handleCreateAccount = async () => {
        setIsLoading(true);
        const fullName = `${firstName}${middleInitial ? ' ' + middleInitial : ''} ${lastName}`;

        // Basic Validation
        if (!firstName || !lastName || !email || !password || !confirmPassword || !phoneNumber || !address) {
            setModalTitle('Missing Fields');
            setModalMessage('Please fill out all required fields.');
            setModalIcon('alert-circle-outline');
            setModalIconColor('#FFC107');
            setModalVisible(true);
            setIsLoading(false);
            return;
        }
        
        if (password !== confirmPassword) {
            setModalTitle('Password Mismatch');
            setModalMessage('The passwords do not match.');
            setModalIcon('alert-circle-outline');
            setModalIconColor('#FFC107');
            setModalVisible(true);
            setIsLoading(false);
            return;
        }

        const validationErrorsOnSubmit = validatePassword(password);
        if (validationErrorsOnSubmit.length > 0) {
            setModalTitle('Password Requirements Not Met');
            setModalMessage(validationErrorsOnSubmit.join('\n- '));
            setModalIcon('alert-circle-outline');
            setModalIconColor('#FFC107');
            setModalVisible(true);
            setIsLoading(false);
            return;
        }

        if (!isChecked) {
            setModalTitle('Terms & Conditions');
            setModalMessage('You must agree to the Terms & Conditions.');
            setModalIcon('alert-circle-outline');
            setModalIconColor('#FFC107');
            setModalVisible(true);
            setIsLoading(false);
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            await updateProfile(userCredential.user, {
                displayName: fullName,
            });

            setModalTitle('Registration Complete!');
            setModalMessage('Your account has been successfully created.');
            setModalIcon('check-circle-outline');
            setModalIconColor('#66BB6A');
            setModalVisible(true);

        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                setModalTitle('Account Creation Failed');
                setModalMessage('This email already exists.');
                setModalIcon('close-circle-outline');
                setModalIconColor('#F44336');
                setModalVisible(true);
            } else if (error.code === 'auth/invalid-email') {
                setModalTitle('Invalid Email');
                setModalMessage('Please enter a valid email address.');
                setModalIcon('close-circle-outline');
                setModalIconColor('#F44336');
                setModalVisible(true);
            } else {
                setModalTitle('Signup Failed');
                setModalMessage('An unexpected error occurred. Please try again.');
                setModalIcon('close-circle-outline');
                setModalIconColor('#F44336');
                setModalVisible(true);
            }
            console.error("Firebase signup error:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <ImageBackground
                source={require("../assets/header.png")}
                style={styles.headerBg}
                resizeMode="cover"
            >
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Fill your information below</Text>
            </ImageBackground>

            <View style={styles.formContainer}>
                <View style={styles.nameInputRow}>
                    <View style={[styles.inputContainer, focusedInput === 'firstName' && styles.focusedInputContainer, styles.firstNameInput]}>
                        <Icon name="account-outline" size={20} color="#A1866F" style={styles.icon} />
                        <TextInput 
                            placeholder="First Name *" 
                            style={styles.textInput} 
                            value={firstName} 
                            onChangeText={setFirstName} 
                            onFocus={() => setFocusedInput('firstName')}
                            onBlur={() => setFocusedInput(null)}
                        />
                    </View>
                    <View style={[styles.inputContainer, focusedInput === 'middleInitial' && styles.focusedInputContainer, styles.middleInitialInput]}>
                        <TextInput 
                            placeholder="MI" 
                            style={styles.textInput} 
                            value={middleInitial} 
                            onChangeText={setMiddleInitial} 
                            onFocus={() => setFocusedInput('middleInitial')}
                            onBlur={() => setFocusedInput(null)}
                            maxLength={1}
                        />
                    </View>
                    <View style={[styles.inputContainer, focusedInput === 'lastName' && styles.focusedInputContainer, styles.lastNameInput]}>
                        <TextInput 
                            placeholder="Last Name *" 
                            style={styles.textInput} 
                            value={lastName} 
                            onChangeText={setLastName} 
                            onFocus={() => setFocusedInput('lastName')}
                            onBlur={() => setFocusedInput(null)}
                        />
                    </View>
                </View>
                
                <View style={[styles.inputContainer, focusedInput === 'phoneNumber' && styles.focusedInputContainer]}>
                    <Icon name="phone-outline" size={20} color="#A1866F" style={styles.icon} />
                    <TextInput 
                        placeholder="Phone Number *" 
                        style={styles.textInput} 
                        value={phoneNumber} 
                        onChangeText={setPhoneNumber} 
                        keyboardType="phone-pad"
                        onFocus={() => setFocusedInput('phoneNumber')}
                        onBlur={() => setFocusedInput(null)}
                        maxLength={11}
                    />
                </View>
                
                <View style={[styles.inputContainer, focusedInput === 'address' && styles.focusedInputContainer]}>
                    <Icon name="map-marker-outline" size={20} color="#A1866F" style={styles.icon} />
                    <TextInput 
                        placeholder="Address *" 
                        style={styles.textInput} 
                        value={address} 
                        onChangeText={setAddress} 
                        onFocus={() => setFocusedInput('address')}
                        onBlur={() => setFocusedInput(null)}
                    />
                </View>

                <View style={[styles.inputContainer, focusedInput === 'email' && styles.focusedInputContainer]}>
                    <Icon name="email-outline" size={20} color="#A1866F" style={styles.icon} />
                    <TextInput 
                        placeholder="Email *" 
                        style={styles.textInput} 
                        keyboardType="email-address" 
                        value={email} 
                        onChangeText={setEmail} 
                        autoCapitalize="none" 
                        onFocus={() => setFocusedInput('email')}
                        onBlur={() => setFocusedInput(null)}
                    />
                </View>

                <View style={[styles.inputContainer, focusedInput === 'password' && styles.focusedInputContainer]}>
                    <Icon name="lock-outline" size={20} color="#A1866F" style={styles.icon} />
                    <TextInput
                        placeholder="Password *"
                        secureTextEntry={!passwordVisible}
                        style={styles.textInput}
                        value={password}
                        onChangeText={handlePasswordChange}
                        onFocus={() => setFocusedInput('password')}
                        onBlur={() => setFocusedInput(null)}
                    />
                    <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                        <Icon name={passwordVisible ? 'eye-outline' : 'eye-off-outline'} size={20} color="#A1866F" />
                    </TouchableOpacity>
                </View>

                {/* Password validation feedback section */}
                {password.length > 0 && focusedInput === 'password' && (
                    <View style={styles.passwordHintContainer}>
                        {passwordValidationErrors.map((error, index) => (
                            <View key={index} style={styles.passwordHintItem}>
                                <Icon 
                                    name={error.includes('at least') ? 'close-circle' : 'check-circle'} 
                                    size={14} 
                                    color={error.includes('at least') ? 'red' : 'green'} 
                                    style={styles.passwordHintIcon} 
                                />
                                <Text style={styles.passwordHintText}>{error}</Text>
                            </View>
                        ))}
                    </View>
                )}
                
                <View style={[styles.inputContainer, focusedInput === 'confirmPassword' && styles.focusedInputContainer]}>
                    <Icon name="lock-check-outline" size={20} color="#A1866F" style={styles.icon} />
                    <TextInput
                        placeholder="Confirm Password *"
                        secureTextEntry={!confirmPasswordVisible}
                        style={styles.textInput}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        onFocus={() => setFocusedInput('confirmPassword')}
                        onBlur={() => setFocusedInput(null)}
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
                    <Text style={styles.agreeWithText}>
                        Agree with{' '}
                        <Text style={styles.termsAndConditionText}>Terms & Condition</Text>
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleCreateAccount}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Sign Up</Text>
                    )}
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
                    <Text style={styles.link}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                        <Text style={styles.signInLink}>Sign In</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <MessageModal />
        </ScrollView>
    );
}

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
        paddingTop: 5,
        paddingBottom: 20,
    },
    nameInputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        height: 50,
        borderWidth: 1.5, 
        borderColor: "#F5F5F5",
        backgroundColor: "#F5F5F5",
        borderRadius: 8,
        paddingHorizontal: 10,
        marginTop: 8,
    },
    firstNameInput: {
        flex: 1,
        marginRight: 8,
    },
    middleInitialInput: {
        width: 50,
        marginRight: 8,
        justifyContent: 'center',
        paddingHorizontal: 0,
    },
    lastNameInput: {
        flex: 1,
    },
    focusedInputContainer: {
        borderColor: '#A68B69',
    },
    icon: {
        marginRight: 8,
    },
    textInput: {
        flex: 1,
        paddingVertical: 10,
        fontFamily: 'Montserrat_400Regular',
    },
    passwordHintContainer: {
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        padding: 10,
        marginTop: 5,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    passwordHintItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    passwordHintIcon: {
        marginRight: 5,
    },
    passwordHintText: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 12,
        color: '#555',
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