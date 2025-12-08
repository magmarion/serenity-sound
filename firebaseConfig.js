import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "DIN_API_KEY",
    authDomain: "DIN_DOMAIN",
    projectId: "DITT_PROJECT_ID",
    storageBucket: "DITT_BUCKET.appspot.com",
    messagingSenderId: "xxxx",
    appId: "xxxx"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
