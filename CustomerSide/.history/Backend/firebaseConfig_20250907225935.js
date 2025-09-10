import { initializeApp, getApps, getApp } from "firebase/app";  // Firebase SDK for the app initialization
import auth from '@react-native-firebase/auth';  // Use React Native Firebase Auth
import { getFirestore } from "firebase/firestore"; // Firestore for database
import AsyncStorage from "@react-native-async-storage/async-storage"; // Required for persistence

// Your Firebase config (ensure this is accurate)
const firebaseConfig = {
  apiKey: "AIzaSyBf9suYlf0MRYTOQthmJN3ZUTcYwX4sSfE",
  authDomain: "mirrora-f6546.firebaseapp.com",
  projectId: "mirrora-f6546",
  storageBucket: "mirrora-f6546.appspot.com",
  messagingSenderId: "337653362560",
  appId: "1:337653362560:web:5613e8a5dd70ce33029b65",
};

// Initialize Firebase app (this handles hot reload scenarios)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Firebase Auth using React Native Firebase
export const firebaseAuth = auth();

// Firebase Auth persistence is handled by React Native Firebase, so no need for manual persistence setup
firebaseAuth.setPersistence(auth.Auth.Persistence.LOCAL)  // This ensures persistence using Local Storage
  .then(() => {
    console.log("Auth persistence set to Local Storage.");
  })
  .catch((error) => {
    console.error("Auth persistence setup error:", error);
  });
