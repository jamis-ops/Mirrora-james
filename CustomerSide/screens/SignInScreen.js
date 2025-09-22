import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  Alert, 
  Modal, 
  ActivityIndicator 
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";

// --- Firebase Imports ---
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
// CORRECTED PATH: Point to the backend folder
import { auth } from '../Backend/firebaseConfig'; 

// Import Montserrat and League Spartan
import { useFonts as useMontserrat, Montserrat_400Regular, Montserrat_700Bold } from "@expo-google-fonts/montserrat";
import { useFonts as useLeagueSpartan, LeagueSpartan_700Bold } from "@expo-google-fonts/league-spartan";

export default function SignInScreen() {
  const [currentScreen, setCurrentScreen] = useState('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState(null);
  const navigation = useNavigation();

  const [montserratLoaded] = useMontserrat({ Montserrat_400Regular, Montserrat_700Bold });
  const [leagueSpartanLoaded] = useLeagueSpartan({ LeagueSpartan_700Bold });

  if (!montserratLoaded || !leagueSpartanLoaded) {
    return null; 
  }

  // Custom modal component for all messages (success, warning, error)
  const MessageModal = ({ title, message, icon, iconColor, onClose }) => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={true}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Icon name={icon} size={70} color={iconColor} />
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalText}>{message}</Text>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={onClose}
          >
            <Text style={styles.modalButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const handleSignIn = async () => {
    setIsLoading(true);

    if (!email || !password) {
      setModalMessage({
        title: 'Missing Fields',
        message: 'Please enter both your email and password to sign in.',
        icon: 'alert-circle-outline',
        iconColor: '#FFC107',
      });
      setIsLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Navigate to Home and pass the signed-in state
      navigation.navigate('Home', { isSignedIn: true });
    } catch (error) {
      setModalMessage({
        title: 'Sign In Failed',
        message: 'The email or password you entered is incorrect. Please try again.',
        icon: 'close-circle',
        iconColor: '#A68B69',
      });
      console.error("Firebase sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setIsLoading(true);

    if (!email) {
      setModalMessage({
        title: 'Missing Email',
        message: 'Please enter your email address to reset your password.',
        icon: 'alert-circle-outline',
        iconColor: '#FFC107',
      });
      setIsLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setModalMessage({
        title: 'Email Sent!',
        message: 'A password reset link has been sent to your email. Please check your spam folder.',
        icon: 'check-circle-outline',
        iconColor: '#7a5c3d',
      });
    } catch (error) {
      setModalMessage({
        title: 'Error',
        message: 'Failed to send password reset email. Please check the email address and try again.',
        icon: 'close-circle',
        iconColor: '#A68B69',
      });
      console.error("Firebase password reset error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSignInScreen = () => (
    <View style={styles.container}>
      <Image source={require("../assets/header.png")} style={styles.topImage} />
      <Text style={styles.title}>Sign In</Text>
      <Text style={styles.subtitle}>Hi! Welcome back, you've been missed</Text>
      <View style={[
        styles.inputContainer,
        focusedInput === 'email' && styles.focusedInputContainer
      ]}>
        <Icon name="email-outline" size={20} color="#A1866F" style={styles.icon} />
        <TextInput
          style={styles.inputField}
          placeholder="example@gmail.com"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          onFocus={() => setFocusedInput('email')}
          onBlur={() => setFocusedInput(null)}
        />
      </View>
      <View style={[
        styles.inputContainer,
        focusedInput === 'password' && styles.focusedInputContainer
      ]}>
        <Icon name="lock-outline" size={20} color="#A1866F" style={styles.icon} />
        <TextInput
          style={styles.inputField}
          placeholder="Password"
          secureTextEntry={!passwordVisible}
          value={password}
          onChangeText={setPassword}
          onFocus={() => setFocusedInput('password')}
          onBlur={() => setFocusedInput(null)}
        />
        <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
          <Icon
            name={passwordVisible ? "eye-outline" : "eye-off-outline"}
            size={22}
            color="#A1866F"
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => setCurrentScreen('forgotPassword')}>
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.signInButton}
        onPress={handleSignIn}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.signInText}>Sign In</Text>
        )}
      </TouchableOpacity>
      <Text style={[styles.signupText, { color: "black" }]}>
        Don't have an account?{" "}
        <Text
          style={[styles.signupLink, { textDecorationLine: "underline" }]}
          onPress={() => navigation.navigate("CreateAccount")}
        >
          Sign Up
        </Text>
      </Text>
    </View>
  );

  const renderForgotPasswordScreen = () => (
    <View style={styles.forgotPasswordContainer}>
      {/* Header with back button */}
      <View style={styles.forgotPasswordHeader}>
        <TouchableOpacity onPress={() => setCurrentScreen('signIn')} style={styles.backButton}>
          <Icon name="chevron-left" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.forgotPasswordHeaderTitle}>Forgot Password</Text>
      </View>

      {/* Main content */}
      <View style={styles.forgotPasswordContent}>
        {/* Email icon container */}
        <View style={styles.emailIconContainer}>
          <View style={styles.emailIconCircle}>
            <Icon name="email-outline" size={60} color="#666" />
          </View>
        </View>

        {/* Title and subtitle */}
        <Text style={styles.forgotPasswordTitle}>Please Verify Your Email Address</Text>
        <Text style={styles.forgotPasswordSubtitle}>
          We will send a verification link to your email address{'\n'}
          to reset your password. Please verify your email.
        </Text>

        {/* Email input */}
        <View style={styles.forgotPasswordInputSection}>
          <Text style={styles.forgotPasswordInputLabel}>Enter email</Text>
          <View style={[
            styles.forgotPasswordInputContainer,
            focusedInput === 'email' && styles.forgotPasswordFocusedInput
          ]}>
            <Icon name="email-outline" size={20} color="#999" style={styles.forgotPasswordInputIcon} />
            <TextInput
              style={styles.forgotPasswordInputField}
              placeholder="Enter address"
              placeholderTextColor="#999"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              onFocus={() => setFocusedInput('email')}
              onBlur={() => setFocusedInput(null)}
            />
          </View>
        </View>

        {/* Send button */}
        <TouchableOpacity
          style={styles.forgotPasswordSendButton}
          onPress={handlePasswordReset}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.forgotPasswordSendText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {currentScreen === 'signIn' ? renderSignInScreen() : renderForgotPasswordScreen()}
      {modalMessage && (
        <MessageModal
          title={modalMessage.title}
          message={modalMessage.message}
          icon={modalMessage.icon}
          iconColor={modalMessage.iconColor}
          onClose={() => setModalMessage(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  topImage: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
  },
  title: {
    fontSize: 30,
    fontFamily: "LeagueSpartan_700Bold",
    marginTop: -80,
  },
  subtitle: {
    fontSize: 15,
    color: "gray",
    fontFamily: "Montserrat_400Regular",
    marginBottom: 30,
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "85%",
    height: 50,
    backgroundColor: "#F5F5F5", 
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15, 
    borderWidth: 1.5,
    borderColor: "#F5F5F5",
  },
  focusedInputContainer: {
    borderColor: "#A68B69",
  },
  icon: {
    marginRight: 10,
  },
  inputField: {
    flex: 1,
    fontFamily: "Montserrat_400Regular",
  },
  forgotText: {
    alignSelf: "flex-end",
    marginLeft: 200,
    color: "#7a5c3d",
    marginBottom: 20,
    textDecorationLine: "underline",
    fontFamily: "Montserrat_400Regular",
  },
  signInButton: {
    width: "85%",
    height: 50,
    backgroundColor: "#A68B69",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 10,
  },
  signInText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Montserrat_700Bold",
  },
  signupText: {
    fontFamily: "Montserrat_400Regular",
  },
  signupLink: {
    color: "#7a5c3d",
    fontFamily: "Montserrat_700Bold",
  },
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
    fontFamily: 'Montserrat_700Bold',
    fontSize: 16,
  },

  // New Forgot Password Screen Styles
  forgotPasswordContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  forgotPasswordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  forgotPasswordHeaderTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat_700Bold',
    color: '#000',
    flex: 1,
    textAlign: 'center',
    marginRight: 43,
  },
  forgotPasswordContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  emailIconContainer: {
    marginBottom: 40,
  },
  emailIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  forgotPasswordTitle: {
    fontSize: 24,
    fontFamily: 'LeagueSpartan_700Bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 15,
  },
  forgotPasswordSubtitle: {
    fontSize: 13,
    fontFamily: 'Montserrat_400Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 40,
  },
  forgotPasswordInputSection: {
    width: '100%',
    marginBottom: 40,
  },
  forgotPasswordInputLabel: {
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
    color: '#333',
    marginBottom: 8,
  },
  forgotPasswordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  forgotPasswordFocusedInput: {
    borderColor: '#A68B69',
  },
  forgotPasswordInputIcon: {
    marginRight: 10,
  },
  forgotPasswordInputField: {
    flex: 1,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 16,
    color: '#000',
  },
  forgotPasswordSendButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#A68B69',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  forgotPasswordSendText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Montserrat_700Bold',
  },
});