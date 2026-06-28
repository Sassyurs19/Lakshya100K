/**
 * Firebase Configuration
 * 
 * Lakshya ₹100K - Firebase Project Configuration
 */

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAMqfOkmvsBRWmUHOCKG83GqPaIVcvC-UI",
    authDomain: "lakshya-100k.firebaseapp.com",
    projectId: "lakshya-100k",
    storageBucket: "lakshya-100k.firebasestorage.app",
    messagingSenderId: "772396453515",
    appId: "1:772396453515:web:b5e3314be252b283d10e8e"
};

// Initialize Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export for use in other modules
export { app, auth, db, storage };
