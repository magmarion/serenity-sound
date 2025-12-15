// /services/firebase.ts
import { initializeApp } from 'firebase/app';
import { initializeAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyAmBM_aX2k5ygcFWbhQIH1TA4QYhnNEVSw",
    authDomain: "serenity-9e88e.firebaseapp.com",
    projectId: "serenity-9e88e",
    storageBucket: "serenity-9e88e.firebasestorage.app",
    messagingSenderId: "1082699719904",
    appId: "1:1082699719904:web:2a906c0ebf60ff155cdc85"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence - SIMPLIFIED VERSION
// For v12.6.0, we can use this simpler approach:
const auth = initializeAuth(app);

// Set persistence to use AsyncStorage
setPersistence(auth, browserLocalPersistence)
    .then(() => {
        console.log('Firebase auth persistence set successfully');
    })
    .catch((error) => {
        console.error('Error setting persistence:', error);
    });

// Initialize Firestore and Storage
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
