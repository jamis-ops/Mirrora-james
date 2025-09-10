import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth'; // Correct import
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

const firebaseConfig = {
  apiKey: "AIzaSyBf9suYlf0MRYTOQthmJN3ZUTcYwX4sSfE",
  authDomain: "mirrora-f6546.firebaseapp.com",
  projectId: "mirrora-f6546",
  storageBucket: "mirrora-f6546.appspot.com",
  messagingSenderId: "337653362560",
  appId: "1:337653362560:web:5613e8a5dd70ce33029b65",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);

// Initialize Auth with persistence to ensure the user stays logged in
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});