import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
    apiKey: "AIzaSyAmBM_aX2k5ygcFWbhQIH1TA4QYhnNEVSw",
    authDomain: "serenity-9e88e.firebaseapp.com",
    projectId: "serenity-9e88e",
    storageBucket: "serenity-9e88e.firebasestorage.app",
    messagingSenderId: "1082699719904",
    appId: "1:1082699719904:web:2a906c0ebf60ff155cdc85"
};
const app = initializeApp(firebaseConfig)

const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

export { app, auth, db, storage }
