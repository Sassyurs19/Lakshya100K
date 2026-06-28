/**
 * Firebase Authentication Module
 * Handles user authentication operations including:
 * - User registration
 * - User login (email or username)
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
import { getUserByUsername, getUserByEmail, createUserDocument, updateUserDocument } from './database.js';

// Public pages (accessible without authentication)
const PUBLIC_PAGES = ['index.html', 'login.html', 'signup.html', '404.html'];

/**
 * Validate username
 * @param {string} username - Username to validate
 * @returns {Object} Validation result with isValid and message
 */
function validateUsername(username) {
    if (!username) {
        return { isValid: false, message: 'Username is required' };
    }
    
    const trimmed = username.trim();
    
    if (trimmed !== username) {
        return { isValid: false, message: 'Username cannot have leading or trailing spaces' };
    }
    
    if (trimmed.length < 3) {
        return { isValid: false, message: 'Username must be at least 3 characters long' };
    }
    
    if (trimmed.length > 20) {
        return { isValid: false, message: 'Username must be no more than 20 characters long' };
    }
    
    if (/\s/.test(trimmed)) {
        return { isValid: false, message: 'Username cannot contain spaces' };
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
        return { isValid: false, message: 'Username can only contain letters, numbers, and underscores' };
    }
    
    return { isValid: true, message: 'Username is valid' };
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and message
 */
function validatePassword(password) {
    if (password.length < 8) {
        return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/[A-Z]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one number' };
    }
    return { isValid: true, message: 'Password is valid' };
}

/**
 * Register a new user with email, password, and profile data
 * @param {Object} userData - User registration data
 * @param {string} userData.fullName - User's full name
 * @param {string} userData.username - User's username
 * @param {string} userData.email - User's email
 * @param {string} userData.password - User's password
 * @param {string} userData.confirmPassword - Password confirmation
 * @returns {Promise} Registration result
 */
export async function registerUser({ fullName, username, email, password, confirmPassword }) {
    try {
        // Validate passwords match
        if (password !== confirmPassword) {
            return { success: false, error: 'Passwords do not match' };
        }

        // Validate password strength
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return { success: false, error: passwordValidation.message };
        }

        // Validate username
        const usernameValidation = validateUsername(username);
        if (!usernameValidation.isValid) {
            return { success: false, error: usernameValidation.message };
        }

        // Check if username already exists (case-insensitive)
        const usernameCheck = await getUserByUsername(username.toLowerCase());
        if (usernameCheck.success && usernameCheck.data) {
            return { success: false, error: 'Username already taken' };
        }

        // Check if email already exists
        const emailCheck = await getUserByEmail(email.toLowerCase());
        if (emailCheck.success && emailCheck.data) {
            return { success: false, error: 'Email already registered' };
        }

        // Create Firebase Authentication account
        const userCredential = await createUserWithEmailAndPassword(auth, email.toLowerCase(), password);
        
        // Update user profile with display name
        await updateProfile(userCredential.user, {
            displayName: fullName
        });

        // Create user document in Firestore
        const userProfile = {
            uid: userCredential.user.uid,
            fullName: fullName,
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            profileImage: null,
            goalAmount: 100000,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            provider: 'email',
            theme: 'light',
            currency: 'INR'
        };

        await createUserDocument(userCredential.user.uid, userProfile);

        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('Registration error:', error);
        
        // Map Firebase auth errors to user-friendly messages
        const errorMessages = {
            'auth/email-already-in-use': 'Email already registered',
            'auth/invalid-email': 'Invalid email address',
            'auth/operation-not-allowed': 'Email/password sign-in is not enabled',
            'auth/weak-password': 'Password is too weak',
            'auth/network-request-failed': 'We couldn\'t connect. Please check your internet connection and try again.',
            'auth/too-many-requests': 'Too many attempts. Please try again later.',
            'auth/internal-error': 'An internal error occurred. Please try again.'
        };
        
        const errorMessage = errorMessages[error.code] || 'An error occurred during registration. Please try again.';
        return { success: false, error: errorMessage };
    }
}

/**
 * Login user with email or username and password
 * @param {string} identifier - User's email or username
 * @param {string} password - User's password
 * @returns {Promise} Firebase user credential
 */
export async function loginUser(identifier, password) {
    try {
        let email = identifier.toLowerCase();

        // Check if identifier is a username (doesn't contain @)
        if (!identifier.includes('@')) {
            const userResult = await getUserByUsername(identifier.toLowerCase());
            if (userResult.success && userResult.data) {
                email = userResult.data.email;
            } else {
                return { success: false, error: 'No account found with this username' };
            }
        }

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Update last login in Firestore
        if (userCredential.user) {
            await updateUserDocument(userCredential.user.uid, {
                lastLogin: new Date().toISOString()
            });
        }

        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('Login error:', error);
        
        // Map Firebase auth errors to user-friendly messages
        const errorMessages = {
            'auth/invalid-email': 'Invalid email address',
            'auth/user-disabled': 'This account has been disabled',
            'auth/user-not-found': 'No account found with this email',
            'auth/wrong-password': 'Incorrect password',
            'auth/network-request-failed': 'We couldn\'t connect. Please check your internet connection and try again.',
            'auth/too-many-requests': 'Too many attempts. Please try again later.',
            'auth/internal-error': 'An internal error occurred. Please try again.'
        };
        
        const errorMessage = errorMessages[error.code] || 'An error occurred during login. Please try again.';
        return { success: false, error: errorMessage };
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
        
        // Prevent browser back navigation
        window.history.pushState(null, '', window.location.href);
        window.addEventListener('popstate', function(event) {
            window.history.pushState(null, '', window.location.href);
        });
        
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
        await sendPasswordResetEmail(auth, email.toLowerCase());
        return { success: true };
    } catch (error) {
        console.error('Password reset error:', error);
        
        // Map Firebase auth errors to user-friendly messages
        const errorMessages = {
            'auth/invalid-email': 'Invalid email address',
            'auth/user-not-found': 'No account found with this email',
            'auth/network-request-failed': 'We couldn\'t connect. Please check your internet connection and try again.',
            'auth/too-many-requests': 'Too many attempts. Please try again later.',
            'auth/internal-error': 'An internal error occurred. Please try again.'
        };
        
        const errorMessage = errorMessages[error.code] || 'An error occurred. Please try again.';
        return { success: false, error: errorMessage };
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
