// Backend/firebaseConfig.js - Complete Fixed and Corrected Version
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getStorage } from 'firebase/storage'; // ADDED FOR FILE ATTACHMENTS
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBf9suYlf0MRYTOQthmJN3ZUTcYwX4sSfE",
  authDomain: "mirrora-f6546.firebaseapp.com",
  projectId: "mirrora-f6546",
  storageBucket: "mirrora-f6546.appspot.com",
  messagingSenderId: "337653362560",
  appId: "1:337653362560:web:5613e8a5dd70ce33029b65",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export app ID for chat system
export const appId = 'mirrora-app';

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth with persistence to ensure the user stays logged in
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// Initialize Storage for file attachments - ADDED THIS
export const storage = getStorage(app);

/**
 * Adds or updates a user's display name within the chat system.
 * This function creates a document for the user inside the chat artifact structure
 * at the path: /artifacts/{appId}/public/data/users/{userId}
 *
 * @param {string} userId - The unique ID of the user (from Firebase Auth)
 * @param {string} userName - The display name of the user
 * @param {string} userEmail - The user's email (optional)
 */
export const addUserNameToChat = async (userId, userName, userEmail = null) => {
  if (!userId || !userName) {
    console.error("Error: User ID and User Name are required to save chat data.");
    return;
  }

  try {
    const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', userId);

    await setDoc(userDocRef, {
      name: userName,
      email: userEmail,
      updatedAt: new Date(),
      isOnline: true,
      lastSeen: new Date(),
    }, { merge: true });

    console.log(`Successfully saved user '${userName}' (ID: ${userId}) to chat system`);

  } catch (error) {
    console.error("Error writing user data to chat system: ", error);
  }
};

/**
 * Update user online status in chat system
 * @param {string} userId - The Firebase Auth user ID
 * @param {boolean} isOnline - Whether user is online
 */
export const updateUserOnlineStatus = async (userId, isOnline) => {
  if (!userId) return;
  
  try {
    const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', userId);
    
    await setDoc(userDocRef, {
      isOnline: isOnline,
      lastSeen: new Date(),
    }, { merge: true });

  } catch (error) {
    console.error('Error updating user online status:', error);
  }
};

/**
 * Initialize user profile in chat system on first login
 * @param {Object} user - Firebase Auth user object
 * @param {string} displayName - User's display name
 */
export const initializeUserInChat = async (user, displayName) => {
  if (!user || !displayName) return;
  
  try {
    await addUserNameToChat(user.uid, displayName, user.email);
    await updateUserOnlineStatus(user.uid, true);
    console.log('User initialized in chat system successfully');
  } catch (error) {
    console.error('Error initializing user in chat:', error);
  }
};

/**
 * Clean up user session (call on logout)
 * @param {string} userId - The Firebase Auth user ID
 */
export const cleanupUserSession = async (userId) => {
  if (!userId) return;
  
  try {
    await updateUserOnlineStatus(userId, false);
    console.log('User session cleaned up successfully');
  } catch (error) {
    console.error('Error cleaning up user session:', error);
  }
};

// Default export for the app instance if needed
export default app;