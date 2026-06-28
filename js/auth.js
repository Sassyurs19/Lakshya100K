/**
 * Firebase Authentication Module
 * Handles user authentication operations including:
 * - User registration
 * - User login
 * - User logout
 * - Password reset
 * - Session management
 * - Page protection
 */

import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { auth } from './firebase-config.js';

// Public pages (accessible without authentication)
const PUBLIC_PAGES = ['index.html', 'login.html', 'signup.html', '404.html'];

/**
 * Register a new user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {string} displayName - User's display name
 * @returns {Promise} Firebase user credential
 */
export async function registerUser(email, password, displayName) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update user profile with display name
        await updateProfile(userCredential.user, {
            displayName: displayName
        });
        
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Login user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise} Firebase user credential
 */
export async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Logout current user and clear session
 * @returns {Promise}
 */
export async function logoutUser() {
    try {
        await signOut(auth);
        // Clear any local storage
        localStorage.clear();
        sessionStorage.clear();
        // Redirect to index.html
        window.location.href = 'index.html';
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Send password reset email
 * @param {string} email - User's email
 * @returns {Promise}
 */
export async function resetPassword(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error) {
        console.error('Password reset error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Listen to authentication state changes
 * @param {Function} callback - Callback function to handle auth state changes
 * @returns {Function} Unsubscribe function
 */
export function onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
}

/**
 * Get current authenticated user
 * @returns {Object|null} Current user or null
 */
export function getCurrentUser() {
    return auth.currentUser;
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
    return auth.currentUser !== null;
}

/**
 * Get current page name
 * @returns {string} Current page filename
 */
function getCurrentPage() {
    const path = window.location.pathname;
    return path.split('/').pop() || 'index.html';
}

/**
 * Check if current page is public
 * @returns {boolean}
 */
function isPublicPage() {
    const currentPage = getCurrentPage();
    return PUBLIC_PAGES.includes(currentPage);
}

/**
 * Protect authenticated pages - redirect to login if not authenticated
 */
export function protectAuthenticatedPages() {
    const user = getCurrentUser();
    const currentPage = getCurrentPage();
    
    // If not authenticated and trying to access protected page
    if (!user && !isPublicPage()) {
        window.location.href = 'login.html';
        return false;
    }
    
    return true;
}

/**
 * Redirect authenticated users from public pages to dashboard
 */
export function redirectAuthenticatedUsers() {
    const user = getCurrentUser();
    const currentPage = getCurrentPage();
    
    // If authenticated and on public page (except 404)
    if (user && isPublicPage() && currentPage !== '404.html') {
        window.location.href = 'dashboard.html';
        return true;
    }
    
    return false;
}

/**
 * Initialize authentication guard
 * Handles page protection based on authentication state
 */
export function initializeAuthGuard() {
    const user = getCurrentUser();
    const currentPage = getCurrentPage();
    
    if (user) {
        // User is authenticated
        if (isPublicPage() && currentPage !== '404.html') {
            // Redirect to dashboard if on public page
            window.location.href = 'dashboard.html';
        }
    } else {
        // User is not authenticated
        if (!isPublicPage()) {
            // Redirect to login if on protected page
            window.location.href = 'login.html';
        }
    }
}
