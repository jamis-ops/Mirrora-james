import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";

// --- Firebase Imports ---
import { signInWithEmailAndPassword } from 'firebase/auth';
// ✅ CORRECTED PATH: Point to the backend folder
import { auth } from '../Backend/firebaseConfig'; 

// ✅ Import Montserrat and League Spartan
import { useFonts as useMontserrat, Montserrat_400Regular, Montserrat_700Bold } from "@expo-google-fonts/montserrat";
import { useFonts as useLeagueSpartan, LeagueSpartan_700Bold } from "@expo-google-fonts/league-spartan";

export default function SignInScreen() {
  // --- State for inputs ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigation = useNavigation();

  const [montserratLoaded] = useMontserrat({ Montserrat_400Regular, Montserrat_700Bold });
  const [leagueSpartanLoaded] = useLeagueSpartan({ LeagueSpartan_700Bold });

  if (!montserratLoaded || !leagueSpartanLoaded) {
    return null; 
  }

  // --- Handle Sign In ---
  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter both email and password.');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // On success, the onAuthStateChanged listener in your App.js
      // will handle navigation to the 'Home' screen automatically.
      // You don't need navigation.navigate('Home') here if you set that up.
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Sign In Failed', 'Invalid email or password. Please try again.');
      console.error("Firebase sign in error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require("../assets/header.png")} style={styles.topImage} />

      <Text style={styles.title}>Sign In</Text>
      <Text style={styles.subtitle}>Hi! Welcome back, you’ve been missed</Text>

      <View style={styles.inputContainer}>
        <Icon name="email-outline" size={20} color="#A1866F" style={styles.icon} />
        <TextInput
          style={styles.inputField}
          placeholder="example@gmail.com"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="lock-outline" size={20} color="#A1866F" style={styles.icon} />
        <TextInput
          style={styles.inputField}
          placeholder="Password"
          secureTextEntry={!passwordVisible}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
          <Icon
            name={passwordVisible ? "eye-outline" : "eye-off-outline"}
            size={22}
            color="#A1866F"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.signInButton}
        onPress={handleSignIn} // Use the Firebase handler
      >
        <Text style={styles.signInText}>Sign In</Text>
      </TouchableOpacity>

      <Text style={[styles.signupText, { color: "black" }]}>
        Don’t have an account?{" "}
        <Text
          style={[styles.signupLink, { textDecorationLine: "underline" }]}
          onPress={() => navigation.navigate("CreateAccount")}
        >
          Sign Up
        </Text>
      </Text>
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
    backgroundColor: "#FFFFFF", 
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1, 
    borderColor: "#727272", 
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
});

