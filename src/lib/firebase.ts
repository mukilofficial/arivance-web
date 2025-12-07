import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyD2wj1GGhG_NxrES-1N098XA3LeNZQHEeg",
    authDomain: "arivance-6697e.firebaseapp.com",
    projectId: "arivance-6697e",
    storageBucket: "arivance-6697e.firebasestorage.app",
    messagingSenderId: "225192775902",
    appId: "1:225192775902:web:97f5a0dcaad89be760f24f",
    measurementId: "G-DKHL3R3Y5N"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
