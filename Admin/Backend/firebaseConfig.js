// firebaseConfig.js (Admin Web App - React Vite)
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBf9suYlf0MRYTOQthmJN3ZUTcYwX4sSfE", 
  authDomain: "mirrora-f6546.firebaseapp.com",
  projectId: "mirrora-f6546",
  storageBucket: "mirrora-f6546.appspot.com",
  messagingSenderId: "337653362560",
  appId: "1:337653362560:web:5613e8a5dd70ce33029b65",
};

// Initialize Firebase (only if not already initialized)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize services
const db = getFirestore(app);
export const auth = getAuth(app);

// Export app ID for chat system
export const appId = 'mirrora-app';

// Export the necessary Firestore functions and database
export { db, collection, getDocs, doc, updateDoc };