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

// --- Imports for Dropdown and Date Picker ---
import DateTimePickerModal from 'react-native-modal-datetime-picker';

// --- Firebase Imports ---
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from "firebase/firestore";
// Make sure this path is correct for your project
import { auth, db } from '../Backend/firebaseConfig';

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
    const [birthDate, setBirthDate] = useState('');
    const [gender, setGender] = useState('');

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

    // New states for interactive components
    const [showGenderDropdown, setShowGenderDropdown] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    // New state for multi-step form
    const [currentStep, setCurrentStep] = useState(0);

    // New state to hold password validation messages
    const [passwordValidationErrors, setPasswordValidationErrors] = useState([]);

    // New state for Terms and Conditions modal
    const [termsModalVisible, setTermsModalVisible] = useState(false);

    const [leagueSpartanLoaded] = useLeagueSpartan({ LeagueSpartan_700Bold });
    const [montserratLoaded] = useMontserrat({ Montserrat_400Regular, Montserrat_600SemiBold, Montserrat_700Bold });

    if (!leagueSpartanLoaded || !montserratLoaded) {
        return null;
    }

    // Terms and Conditions content
    const termsContent = [
        { title: "1. Introduction and Acceptance", text: "Welcome to Mirrora Philippines! These Terms and Conditions govern your use of our e-commerce website and your purchase of products from us. By using our site or placing an order, you agree to be bound by these terms. If you do not accept these terms, please do not use our website." },
        { title: "2. Products and Services", text: "Product Descriptions: We strive for accuracy in all product descriptions, including materials, dimensions, and finishes. However, please note that slight variations in color and texture may occur due to natural materials and monitor settings. Mirrora Philippines reserves the right to modify product specifications and prices at any time without prior notice.\n\nFor custom-made products, the design and specifications will be finalized and approved by the client before production begins. A detailed invoice and a design mock-up will be provided for your review. Any changes requested after final approval may result in additional charges and delays." },
        { title: "3. Pricing and Payment", text: " All prices listed are in Philippine Pesos (PHP) and are inclusive of Value-Added Tax (VAT), unless otherwise stated. Prices do not include delivery and installation fees, which will be calculated and added at checkout.\n\nWe require a 50% down payment for all custom orders before production begins. The remaining 50% must be paid upon delivery or before installation. For pre-designed, ready-to-ship items, full payment is required at the time of purchase.\n\n For a smoother transaction, we require a 50% down payment via bank transfer. The remaining 50% will be collected in cash upon delivery of your order.. Details for these methods will be provided during the checkout process." },
        { title: "4. Order Processing and Fulfillment", text: "Order Confirmation: An order is considered confirmed only after we have received the required payment and sent you a confirmation email. This email will include your order number, a summary of your items, and an estimated lead time.\n\n Our typical lead time for custom glass and mirror products is 10 to 15 business days from the date of down payment. This may vary based on the complexity and volume of the order. We will inform you of any potential delays." },
        { title: "5. Delivery and Installation", text: " We provide delivery and installation services within Cebu and selected provincial areas. Delivery fees are calculated based on your location and the size of the items.\n\n It is your responsibility to ensure that the delivery address and contact information are accurate. You or a designated representative must be present to receive the items.\n\n For installations, please ensure the site is prepared and accessible. Any unforeseen site conditions that require additional work, such as dismantling existing structures or extra materials, may incur additional charges.\n\n You must inspect all items upon delivery. If you find any damage, scratches, or manufacturing defects, you must report them immediately to our delivery personnel and note them on the delivery receipt. We will not be responsible for damages reported after our personnel have left the delivery site." },
        { title: "6. Returns and Refunds", text: " If a product is verified as damaged upon delivery, we will replace it at no additional cost or issue a full refund, at our discretion.\n\n All sales of custom-made products are final. We cannot accept returns or provide refunds for these items unless they are defective or damaged during delivery, as per the inspection clause above.\n\n If you wish to cancel a custom order after the down payment has been made but before production has started, a 25% cancellation fee of the total project cost will be charged to cover design and administrative work. Once production has started, no cancellations will be accepted and the down payment will be forfeited." },
        { title: "7. Warranties and Guarantees", text: " We provide a one-year warranty on our installation workmanship against defects. This warranty does not cover damages caused by misuse, improper cleaning, accidental breakage, or natural wear and tear.\n\n We guarantee that our products are made from high-quality materials as specified. The warranty on the glass and mirror itself covers manufacturing defects and is valid for one year from the date of purchase." },
        { title: "8. Intellectual Property", text: "All designs, logos, images, and content on our website are the exclusive property of Mirrora Philippines. Any unauthorized use, reproduction, or distribution is strictly prohibited and subject to legal action." },
        { title: "9. Governing Law", text: "These Terms and Conditions are governed by the laws of the Republic of the Philippines. Any disputes will be resolved through amicable negotiation. If a resolution cannot be reached, the dispute will be submitted to the exclusive jurisdiction of the courts of Cebu City." },
        { title: "10. Contact Us", text: "For any inquiries regarding these terms, please contact our customer service team through the contact details provided on our application." }
    ];

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
                                navigation.navigate('VerifyEmail', { email });
                            }
                        }}
                    >
                        <Text style={styles.modalButtonText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    // Terms and Conditions Modal
    const TermsModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={termsModalVisible}
            onRequestClose={() => setTermsModalVisible(false)}
        >
            <View style={styles.termsModalOverlay}>
                <View style={styles.termsModalContainer}>
                    <View style={styles.termsModalHeader}>
                        <Text style={styles.termsModalTitle}>Terms and Conditions</Text>
                        <TouchableOpacity 
                            onPress={() => setTermsModalVisible(false)}
                            style={styles.termsModalCloseButton}
                        >
                            <Icon name="close" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>
                    
                    <ScrollView style={styles.termsModalContent}>
                        {termsContent.map((section, index) => (
                            <View key={index} style={styles.termsSection}>
                                <Text style={styles.termsSectionTitle}>{section.title}</Text>
                                <Text style={styles.termsSectionText}>{section.text}</Text>
                            </View>
                        ))}
                    </ScrollView>
                    
                    <TouchableOpacity 
                        style={styles.termsModalAgreeButton}
                        onPress={() => {
                            setTermsModalVisible(false);
                            setChecked(true);
                        }}
                    >
                        <Text style={styles.termsModalAgreeButtonText}>I Agree</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    // --- New Gender Dropdown Modal ---
    const GenderDropdownModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={showGenderDropdown}
            onRequestClose={() => setShowGenderDropdown(false)}
        >
            <TouchableOpacity
                style={styles.dropdownOverlay}
                activeOpacity={1}
                onPressOut={() => setShowGenderDropdown(false)}
            >
                <View style={styles.dropdownContainer}>
                    <Text style={styles.dropdownTitle}>Select Gender</Text>
                    {['Male', 'Female', 'Prefer not to say'].map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={styles.dropdownOption}
                            onPress={() => {
                                setGender(option);
                                setShowGenderDropdown(false);
                            }}
                        >
                            <Text style={styles.dropdownOptionText}>{option}</Text>
                            {gender === option && <Icon name="check" size={20} color="#A68B69" />}
                        </TouchableOpacity>
                    ))}
                </View>
            </TouchableOpacity>
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

    const handleDateConfirm = (date) => {
        const formattedDate = date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
        });
        setBirthDate(formattedDate);
        setSelectedDate(date);
        setShowDatePicker(false);
    };

    const handleDateCancel = () => {
        setShowDatePicker(false);
    };

    // Step validation
    const validateCurrentStep = () => {
        switch (currentStep) {
            case 0:
                if (!firstName || !lastName || !gender || !birthDate) {
                    setModalTitle('Missing Fields');
                    setModalMessage('Please fill out all required fields.');
                    setModalIcon('alert-circle-outline');
                    setModalIconColor('#FFC107');
                    setModalVisible(true);
                    return false;
                }
                break;
            case 1:
                if (!email || !phoneNumber || !address) {
                    setModalTitle('Missing Fields');
                    setModalMessage('Please fill out all required fields.');
                    setModalIcon('alert-circle-outline');
                    setModalIconColor('#FFC107');
                    setModalVisible(true);
                    return false;
                }
                if (!email.toLowerCase().endsWith("@gmail.com")) {
                    setModalTitle('Invalid Email');
                    setModalMessage('Email must end with @gmail.com');
                    setModalIcon('close-circle-outline');
                    setModalIconColor('#F44336');
                    setModalVisible(true);
                    return false;
                }
                break;
            case 2:
                if (!password || !confirmPassword) {
                    setModalTitle('Missing Fields');
                    setModalMessage('Please fill out all required fields.');
                    setModalIcon('alert-circle-outline');
                    setModalIconColor('#FFC107');
                    setModalVisible(true);
                    return false;
                }
                if (password !== confirmPassword) {
                    setModalTitle('Password Mismatch');
                    setModalMessage('The passwords do not match.');
                    setModalIcon('alert-circle-outline');
                    setModalIconColor('#FFC107');
                    setModalVisible(true);
                    return false;
                }
                const validationErrors = validatePassword(password);
                if (validationErrors.length > 0) {
                    setModalTitle('Password Requirements Not Met');
                    setModalMessage(validationErrors.join('\n- '));
                    setModalIcon('alert-circle-outline');
                    setModalIconColor('#FFC107');
                    setModalVisible(true);
                    return false;
                }
                if (!isChecked) {
                    setModalTitle('Terms & Conditions');
                    setModalMessage('You must agree to the Terms & Conditions.');
                    setModalIcon('alert-circle-outline');
                    setModalIconColor('#FFC107');
                    setModalVisible(true);
                    return false;
                }
                break;
        }
        return true;
    };

    const handleNext = () => {
        if (validateCurrentStep()) {
            if (currentStep < 2) {
                setCurrentStep(currentStep + 1);
            } else {
                handleCreateAccount();
            }
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    // --- Handle Account Creation ---
    const handleCreateAccount = async () => {
    setIsLoading(true);
    const fullName = `${firstName}${middleInitial ? ' ' + middleInitial : ''} ${lastName}`;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        await updateProfile(userCredential.user, { displayName: fullName });

        await setDoc(doc(db, "user", userCredential.user.uid), {
            uid: userCredential.user.uid,
            firstName,
            middleInitial,
            lastName,
            fullName,
            email,
            phoneNumber,
            address,
            birthDate,
            gender,
            createdAt: new Date(),
            verified: false, // optional: track email verification
            }); 

        // Send email verification
        await sendEmailVerification(userCredential.user);

        // Show success modal before navigating
        setModalTitle('Account Created');
        setModalMessage(`We sent a verification email to ${userCredential.user.email}. Please check your inbox.`);
        setModalIcon('check-circle-outline');
        setModalIconColor('#4CAF50');
        setModalVisible(true);

        // After pressing OK in modal, go to VerifyEmail screen
        // (already handled in your modal button: navigation.navigate('SignIn'))
        // Update it to:
        // navigation.navigate('VerifyEmail', { email: userCredential.user.email });

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
        } else if (error.code === 'auth/weak-password') {
            setModalTitle('Weak Password');
            setModalMessage('Password is too weak. Please use a stronger one.');
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

    // Step indicators
    const StepIndicator = () => (
        <View style={styles.stepIndicatorContainer}>
            {[0, 1, 2].map((step, index) => (
                <View
                    key={index}
                    style={[
                        styles.stepDot,
                        currentStep === step ? styles.activeDot : styles.inactiveDot
                    ]}
                />
            ))}
        </View>
    );

    // Render different steps
    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return (
                    <>
                        <Text style={styles.stepTitle}>Basic Information</Text>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>First Name *</Text>
                            <TextInput
                                placeholder="First Name"
                                style={[styles.textInput, focusedInput === 'firstName' && styles.focusedInput]}
                                value={firstName}
                                onChangeText={setFirstName}
                                onFocus={() => setFocusedInput('firstName')}
                                onBlur={() => setFocusedInput(null)}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Last Name *</Text>
                            <TextInput
                                placeholder="Last Name"
                                style={[styles.textInput, focusedInput === 'lastName' && styles.focusedInput]}
                                value={lastName}
                                onChangeText={setLastName}
                                onFocus={() => setFocusedInput('lastName')}
                                onBlur={() => setFocusedInput(null)}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>MI</Text>
                            <TextInput
                                placeholder="MI"
                                style={[styles.textInput, focusedInput === 'middleInitial' && styles.focusedInput]}
                                value={middleInitial}
                                onChangeText={setMiddleInitial}
                                onFocus={() => setFocusedInput('middleInitial')}
                                onBlur={() => setFocusedInput(null)}
                                maxLength={1}
                            />
                        </View>

                        {/* --- Gender Dropdown --- */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Gender *</Text>
                            <TouchableOpacity
                                style={[styles.textInput, styles.dropdownInput, focusedInput === 'gender' && styles.focusedInput]}
                                onPress={() => {
                                    setShowGenderDropdown(true);
                                    setFocusedInput('gender');
                                }}
                            >
                                <Text style={[styles.dropdownText, gender === '' && styles.placeholderText]}>
                                    {gender || "Select Gender"}
                                </Text>
                                <Icon name="chevron-down" size={20} color="#A1866F" />
                            </TouchableOpacity>
                        </View>

                        {/* --- Birth Date Calendar Picker --- */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Birth Date *</Text>
                            <TouchableOpacity
                                style={[styles.textInput, styles.dropdownInput, focusedInput === 'birthDate' && styles.focusedInput]}
                                onPress={() => {
                                    setShowDatePicker(true);
                                    setFocusedInput('birthDate');
                                }}
                            >
                                <Text style={[styles.dropdownText, !birthDate && styles.placeholderText]}>
                                    {birthDate || "MM/DD/YYYY"}
                                </Text>
                                <Icon name="calendar-month" size={20} color="#A1866F" />
                            </TouchableOpacity>
                        </View>
                    </>
                );
            case 1:
                return (
                    <>
                        <Text style={styles.stepTitle}>Contact & Address</Text>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Email Address *</Text>
                            <TextInput
                                placeholder="Email Address"
                                style={[styles.textInput, focusedInput === 'email' && styles.focusedInput]}
                                keyboardType="email-address"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                onFocus={() => setFocusedInput('email')}
                                onBlur={() => setFocusedInput(null)}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Phone Number *</Text>
                            <TextInput
                                placeholder="Phone Number"
                                style={[styles.textInput, focusedInput === 'phoneNumber' && styles.focusedInput]}
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                keyboardType="phone-pad"
                                onFocus={() => setFocusedInput('phoneNumber')}
                                onBlur={() => setFocusedInput(null)}
                                maxLength={11}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Address *</Text>
                            <TextInput
                                placeholder="Address"
                                style={[styles.textInput, focusedInput === 'address' && styles.focusedInput]}
                                value={address}
                                onChangeText={setAddress}
                                onFocus={() => setFocusedInput('address')}
                                onBlur={() => setFocusedInput(null)}
                                multiline={true}
                            />
                        </View>
                    </>
                );
            case 2:
                return (
                    <>
                        <Text style={styles.stepTitle}>Password</Text>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Create Password *</Text>
                            <View style={styles.passwordInputContainer}>
                                <TextInput
                                    placeholder="Create Password"
                                    secureTextEntry={!passwordVisible}
                                    style={[styles.passwordInput, focusedInput === 'password' && styles.focusedInput]}
                                    value={password}
                                    onChangeText={handlePasswordChange}
                                    onFocus={() => setFocusedInput('password')}
                                    onBlur={() => setFocusedInput(null)}
                                />
                                <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={styles.eyeIcon}>
                                    <Icon name={passwordVisible ? 'eye-outline' : 'eye-off-outline'} size={20} color="#A1866F" />
                                </TouchableOpacity>
                            </View>
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

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Confirm Password *</Text>
                            <View style={styles.passwordInputContainer}>
                                <TextInput
                                    placeholder="Confirm Password"
                                    secureTextEntry={!confirmPasswordVisible}
                                    style={[styles.passwordInput, focusedInput === 'confirmPassword' && styles.focusedInput]}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    onFocus={() => setFocusedInput('confirmPassword')}
                                    onBlur={() => setFocusedInput(null)}
                                />
                                <TouchableOpacity onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)} style={styles.eyeIcon}>
                                    <Icon name={confirmPasswordVisible ? 'eye-outline' : 'eye-off-outline'} size={20} color="#A1866F" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.checkboxContainer}>
                            <CheckBox
                                value={isChecked}
                                onValueChange={setChecked}
                                color={isChecked ? '#A1866F' : undefined}
                            />
                            <Text style={styles.agreeWithText}>
                                By creating an account, you agree to the{' '}
                                <Text 
                                    style={styles.termsAndConditionText}
                                    onPress={() => setTermsModalVisible(true)}
                                >
                                    Terms & Conditions
                                </Text>
                            </Text>
                        </View>
                    </>
                );
        }
    };

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require("../assets/bg.png")}
                style={styles.headerBg}
                resizeMode="cover"
            >
                <View style={styles.formCard}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Fill your information below</Text>

                    <ScrollView
                        style={styles.scrollContainer}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.formContent}
                    >
                        {renderStep()}
                    </ScrollView>

                    <StepIndicator />

                    <View style={styles.buttonContainer}>
                        {currentStep > 0 && (
                            <TouchableOpacity
                                style={[styles.button, styles.secondaryButton]}
                                onPress={handlePrevious}
                                disabled={isLoading}
                            >
                                <Text style={[styles.buttonText, styles.secondaryButtonText]}>Back</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[styles.button, styles.primaryButton, currentStep === 0 && { width: '100%' }]}
                            onPress={handleNext}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>
                                    {currentStep === 2 ? 'Sign Up' : 'Next'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {currentStep === 2 && (
                        <View style={styles.signInLinkContainer}>
                            <Text style={styles.link}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                                <Text style={styles.signInLink}>Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ImageBackground>
            <MessageModal />
            <TermsModal />
            <GenderDropdownModal />
            <DateTimePickerModal
                isVisible={showDatePicker}
                mode="date"
                onConfirm={handleDateConfirm}
                onCancel={handleDateCancel}
                date={selectedDate}
                maximumDate={new Date()}
                display="default"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    headerBg: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    formCard: {
        backgroundColor: '#F2E1CB',
        borderRadius: 25,
        paddingHorizontal: 30,
        paddingVertical: 35,
        width: '100%',
        maxWidth: 400,
        minHeight: 520,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    title: {
        fontSize: 28,
        fontFamily: 'LeagueSpartan_700Bold',
        color: '#000',
        textAlign: 'center',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: 'Montserrat_400Regular',
        color: "#666",
        textAlign: 'center',
        marginBottom: 25,
    },
    scrollContainer: {
        flex: 1,
        maxHeight: 280,
    },
    formContent: {
        paddingBottom: 10,
    },
    stepTitle: {
        fontSize: 16,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'left',
    },
    inputContainer: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 12,
        fontFamily: 'Montserrat_400Regular',
        color: '#666',
        marginBottom: 8,
        marginLeft: 2,
    },
    textInput: {
        height: 48,
        borderWidth: 1,
        borderColor: "#E5E5E5",
        backgroundColor: "#FAFAFA",
        borderRadius: 12,
        paddingHorizontal: 15,
        fontFamily: 'Montserrat_400Regular',
        fontSize: 14,
    },
    focusedInput: {
        borderColor: '#A68B69',
        backgroundColor: '#fff',
    },
    // New styles for dropdown
    dropdownInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dropdownText: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 14,
        color: '#333',
    },
    placeholderText: {
        color: '#999',
    },
    // Gender Dropdown Modal Styles
    dropdownOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropdownContainer: {
        backgroundColor: '#fff',
        borderRadius: 15,
        paddingVertical: 20,
        paddingHorizontal: 15,
        width: '80%',
        maxWidth: 300,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    dropdownTitle: {
        fontSize: 18,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 20,
    },
    dropdownOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    dropdownOptionText: {
        fontSize: 16,
        fontFamily: 'Montserrat_400Regular',
        color: '#333',
    },
    passwordInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        borderWidth: 1,
        borderColor: "#E5E5E5",
        backgroundColor: "#FAFAFA",
        borderRadius: 12,
        paddingHorizontal: 15,
    },
    passwordInput: {
        flex: 1,
        fontFamily: 'Montserrat_400Regular',
        fontSize: 14,
    },
    eyeIcon: {
        padding: 5,
    },
    passwordHintContainer: {
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        padding: 10,
        marginTop: 5,
        marginBottom: 10,
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
        fontSize: 11,
        color: '#555',
    },
    stepIndicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20,
    },
    stepDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: '#A68B69',
    },
    inactiveDot: {
        backgroundColor: '#E0E0E0',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 15,
        marginBottom: 10,
    },
    agreeWithText: {
        color: '#666',
        fontSize: 12,
        fontFamily: 'Montserrat_400Regular',
        paddingLeft: 10,
        flex: 1,
        lineHeight: 16,
    },
    termsAndConditionText: {
        color: '#A68B69',
        fontFamily: 'Montserrat_400Regular',
        textDecorationLine: "underline"
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 20,
    },
    button: {
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
        flex: 1,
    },
    primaryButton: {
        backgroundColor: '#A68B69',
        marginLeft: 10,
    },
    secondaryButton: {
        backgroundColor: '#fff',
        borderColor: '#A68B69',
        borderWidth: 1,
        marginRight: 10,
    },
    secondaryButtonText: {
        color: '#A68B69',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Montserrat_600SemiBold',
    },
    signInLinkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 15
    },
    link: {
        fontFamily: 'Montserrat_400Regular',
        color: '#666',
        fontSize: 12,
    },
    signInLink: {
        color: '#A68B69',
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 12,
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
    // Terms and Conditions Modal Styles
    termsModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    termsModalContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        width: '100%',
        maxWidth: 500,
        maxHeight: '80%',
        overflow: 'hidden',
    },
    termsModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    termsModalTitle: {
        fontSize: 20,
        fontFamily: 'Montserrat_700Bold',
        color: '#000',
    },
    termsModalCloseButton: {
        padding: 5,
    },
    termsModalContent: {
        padding: 20,
        maxHeight: '70%',
    },
    termsSection: {
        marginBottom: 20,
    },
    termsSectionTitle: {
        fontSize: 16,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#A68B69',
        marginBottom: 10,
    },
    termsSectionText: {
        fontSize: 14,
        fontFamily: 'Montserrat_400Regular',
        color: '#555',
        lineHeight: 20,
    },
    termsModalAgreeButton: {
        backgroundColor: '#A68B69',
        padding: 15,
        alignItems: 'center',
        margin: 20,
        borderRadius: 10,
    },
    termsModalAgreeButtonText: {
        color: '#fff',
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 16,
    },
});