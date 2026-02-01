import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// Firebase configuration using environment variables
// To set up, create a .env file based on .env.example
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Enable offline persistence for Firestore (lazily after initial load)
// This allows the app to work offline and sync when back online
// Run in next tick to avoid blocking initial render
setTimeout(() => {
    enableIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition') {
            // Multiple tabs open, persistence can only be enabled in one tab at a time.
            console.warn('Firestore persistence failed: Multiple tabs open');
        } else if (err.code === 'unimplemented') {
            // The current browser doesn't support persistence
            console.warn('Firestore persistence not supported in this browser');
        }
    });
}, 0);

// Configure Google Provider
export const googleProvider = new GoogleAuthProvider();
// Add Calendar API scope - MUST be before signIn
googleProvider.addScope('https://www.googleapis.com/auth/calendar.readonly');
// Request access_type offline to get refresh token
googleProvider.setCustomParameters({
    prompt: 'consent', // Force consent screen to show even if previously approved
    access_type: 'offline', // Get refresh token
    hd: 'iimranchi.ac.in' // Restrict to specific domain
});
