import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";  // Get Auth from Firebase directly
import { getFirestore } from "firebase/firestore"; // Get Firestore

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

// Initialize Firestore and Auth instances
export const db = getFirestore(app);
export const auth = getAuth(app);  // Authentication
