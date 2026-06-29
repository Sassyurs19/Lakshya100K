/**
 * Firestore Database Module
 * Handles all Firestore database operations including:
 * - User data management
 * - Savings CRUD operations
 * - Achievements tracking
 * - Statistics calculations
 */

import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    setDoc, 
    updateDoc, 
    deleteDoc, 
    addDoc, 
    query, 
    where, 
    orderBy, 
    limit,
    onSnapshot,
    serverTimestamp,
    startAfter
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { db } from './firebase-config.js';

// Collection names
const USERS_COLLECTION = 'users';
const SAVINGS_COLLECTION = 'savings';
const ACHIEVEMENTS_COLLECTION = 'achievements';

/**
 * Get user by username
 * @param {string} username - Username to search for
 * @returns {Promise} User data or null
 */
export async function getUserByUsername(username) {
    try {
        const q = query(
            collection(db, USERS_COLLECTION),
            where('username', '==', username),
            limit(1)
        );
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return { success: false, data: null };
        }
        
        const userDoc = querySnapshot.docs[0];
        return { success: true, data: { id: userDoc.id, ...userDoc.data() } };
    } catch (error) {
        console.error('Error getting user by username:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get user by email
 * @param {string} email - Email to search for
 * @returns {Promise} User data or null
 */
export async function getUserByEmail(email) {
    try {
        const q = query(
            collection(db, USERS_COLLECTION),
            where('email', '==', email),
            limit(1)
        );
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return { success: false, data: null };
        }
        
        const userDoc = querySnapshot.docs[0];
        return { success: true, data: { id: userDoc.id, ...userDoc.data() } };
    } catch (error) {
        console.error('Error getting user by email:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Create or update user document
 * @param {string} userId - User ID
 * @param {Object} userData - User data to store
 * @returns {Promise}
 */
export async function createUserDocument(userId, userData) {
    try {
        await setDoc(doc(db, USERS_COLLECTION, userId), {
            ...userData,
            createdAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Error creating user document:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get user document
 * @param {string} userId - User ID
 * @returns {Promise} User data
 */
export async function getUserDocument(userId) {
    try {
        const docRef = doc(db, USERS_COLLECTION, userId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return { success: true, data: docSnap.data() };
        } else {
            return { success: false, error: 'User not found' };
        }
    } catch (error) {
        console.error('Error getting user document:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update user document
 * @param {string} userId - User ID
 * @param {Object} userData - User data to update
 * @returns {Promise}
 */
export async function updateUserDocument(userId, userData) {
    try {
        const docRef = doc(db, USERS_COLLECTION, userId);
        await updateDoc(docRef, userData);
        return { success: true };
    } catch (error) {
        console.error('Error updating user document:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Add a new saving entry
 * @param {Object} savingData - Saving data
 * @returns {Promise} Document reference
 */
export async function addSaving(savingData) {
    try {
        console.log('[addSaving] Adding saving with userId:', savingData.userId, 'amount:', savingData.amount);
        const docRef = await addDoc(collection(db, SAVINGS_COLLECTION), {
            ...savingData,
            month: new Date(savingData.date).getMonth() + 1,
            year: new Date(savingData.date).getFullYear(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        
        console.log('[addSaving] Successfully added saving with ID:', docRef.id);
        
        // Calculate running total
        await updateRunningTotals(savingData.userId);
        
        // Check and unlock achievements
        await checkAndUnlockAchievements(savingData.userId);
        
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('[addSaving] Error adding saving:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Calculate and update running totals for all user savings
 * @param {string} userId - User ID
 * @returns {Promise}
 */
async function updateRunningTotals(userId) {
    try {
        const q = query(
            collection(db, SAVINGS_COLLECTION),
            where('userId', '==', userId),
            orderBy('date', 'asc'),
            orderBy('time', 'asc')
        );
        const querySnapshot = await getDocs(q);
        
        let runningTotal = 0;
        const batch = [];
        
        querySnapshot.forEach((doc) => {
            const saving = doc.data();
            runningTotal += saving.amount;
            batch.push(updateDoc(doc.ref, { runningTotal }));
        });
        
        await Promise.all(batch);
    } catch (error) {
        console.error('Error updating running totals:', error);
    }
}

/**
 * Get a single saving by ID
 * @param {string} savingId - Saving ID
 * @returns {Promise} Saving data
 */
export async function getSavingById(savingId) {
    try {
        const docRef = doc(db, SAVINGS_COLLECTION, savingId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
        } else {
            return { success: false, error: 'Saving not found' };
        }
    } catch (error) {
        console.error('Error getting saving:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get all savings for a user
 * @param {string} userId - User ID
 * @returns {Promise} Array of savings
 */
export async function getUserSavings(userId) {
    try {
        console.log('[getUserSavings] Fetching savings for userId:', userId);
        const q = query(
            collection(db, SAVINGS_COLLECTION),
            where('userId', '==', userId),
            orderBy('date', 'desc'),
            orderBy('time', 'desc')
        );
        const querySnapshot = await getDocs(q);
        
        const savings = [];
        querySnapshot.forEach((doc) => {
            savings.push({ id: doc.id, ...doc.data() });
        });
        
        console.log('[getUserSavings] Retrieved', savings.length, 'savings');
        return { success: true, data: savings };
    } catch (error) {
        console.error('[getUserSavings] Error getting user savings:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get paginated savings for a user
 * @param {string} userId - User ID
 * @param {number} limit - Number of records per page
 * @param {Object} lastDoc - Last document from previous page (for pagination)
 * @returns {Promise} Array of savings with pagination info
 */
export async function getUserSavingsPaginated(userId, limit = 20, lastDoc = null) {
    try {
        console.log('[getUserSavingsPaginated] Fetching paginated savings for userId:', userId, 'limit:', limit, 'lastDoc:', lastDoc ? 'exists' : 'null');
        let q;
        if (lastDoc) {
            q = query(
                collection(db, SAVINGS_COLLECTION),
                where('userId', '==', userId),
                orderBy('date', 'desc'),
                orderBy('time', 'desc'),
                startAfter(lastDoc),
                limit(limit)
            );
        } else {
            q = query(
                collection(db, SAVINGS_COLLECTION),
                where('userId', '==', userId),
                orderBy('date', 'desc'),
                orderBy('time', 'desc'),
                limit(limit)
            );
        }
        
        const querySnapshot = await getDocs(q);
        
        const savings = [];
        let lastVisible = null;
        
        querySnapshot.forEach((doc) => {
            savings.push({ id: doc.id, ...doc.data() });
            lastVisible = doc;
        });
        
        console.log('[getUserSavingsPaginated] Retrieved', savings.length, 'savings');
        return { 
            success: true, 
            data: savings,
            lastDoc: lastVisible,
            hasMore: savings.length === limit
        };
    } catch (error) {
        console.error('[getUserSavingsPaginated] Error getting paginated savings:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update a saving
 * @param {string} savingId - Saving ID
 * @param {Object} savingData - Updated saving data
 * @returns {Promise}
 */
export async function updateSaving(savingId, savingData) {
    try {
        const docRef = doc(db, SAVINGS_COLLECTION, savingId);
        await updateDoc(docRef, {
            ...savingData,
            month: new Date(savingData.date).getMonth() + 1,
            year: new Date(savingData.date).getFullYear(),
            updatedAt: serverTimestamp()
        });
        
        // Recalculate running totals
        const savingDoc = await getDoc(docRef);
        if (savingDoc.exists()) {
            const uid = savingDoc.data().userId;
            await updateRunningTotals(uid);
            await checkAndUnlockAchievements(uid);
        }
        
        return { success: true };
    } catch (error) {
        console.error('Error updating saving:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete a saving
 * @param {string} savingId - Saving ID
 * @returns {Promise}
 */
export async function deleteSaving(savingId) {
    try {
        const docRef = doc(db, SAVINGS_COLLECTION, savingId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const savingData = docSnap.data();
            const userId = savingData.userId;
            const imagePath = savingData.imagePath;
            
            // Delete from Firestore
            await deleteDoc(docRef);
            
            // Delete image from Storage if exists
            if (imagePath) {
                const { deleteSavingImage } = await import('./storage.js');
                await deleteSavingImage(imagePath);
            }
            
            // Recalculate running totals
            await updateRunningTotals(userId);
            await checkAndUnlockAchievements(userId);
        }
        
        return { success: true };
    } catch (error) {
        console.error('Error deleting saving:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Calculate user statistics
 * @param {string} userId - User ID
 * @returns {Promise} Statistics object
 */
export async function calculateStatistics(userId) {
    try {
        console.log('[calculateStatistics] Calculating statistics for userId:', userId);
        const { success, data: savings } = await getUserSavings(userId);
        
        if (!success || !savings.length) {
            console.log('[calculateStatistics] No savings found, returning zero stats');
            return {
                success: true,
                data: {
                    totalSaved: 0,
                    daysActive: 0,
                    currentStreak: 0,
                    longestStreak: 0,
                    averageSaving: 0,
                    highestSaving: 0,
                    lowestSaving: 0,
                    monthlySaving: 0,
                    yearlySaving: 0,
                    todaySaving: 0
                }
            };
        }
        
        const totalSaved = savings.reduce((sum, s) => sum + s.amount, 0);
        const uniqueDates = [...new Set(savings.map(s => s.date))];
        const daysActive = uniqueDates.length;
        
        // Calculate streaks
        const sortedDates = uniqueDates.sort((a, b) => new Date(b) - new Date(a));
        let currentStreak = 0;
        let longestStreak = 0;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let i = 0; i < sortedDates.length; i++) {
            const date = new Date(sortedDates[i]);
            const prevDate = i > 0 ? new Date(sortedDates[i - 1]) : today;
            
            const diffDays = Math.floor((prevDate - date) / (1000 * 60 * 60 * 24));
            
            if (diffDays <= 1) {
                currentStreak++;
                if (currentStreak > longestStreak) {
                    longestStreak = currentStreak;
                }
            } else {
                currentStreak = 1;
            }
        }
        
        const averageSaving = Math.round(totalSaved / savings.length);
        const highestSaving = Math.max(...savings.map(s => s.amount));
        const lowestSaving = Math.min(...savings.map(s => s.amount));
        
        // Calculate monthly and yearly savings
        const now = new Date();
        const thisMonth = savings.filter(s => {
            const savingDate = new Date(s.date);
            return savingDate.getMonth() === now.getMonth() && 
                   savingDate.getFullYear() === now.getFullYear();
        });
        const monthlySaving = thisMonth.reduce((sum, s) => sum + s.amount, 0);
        
        const thisYear = savings.filter(s => {
            const savingDate = new Date(s.date);
            return savingDate.getFullYear() === now.getFullYear();
        });
        const yearlySaving = thisYear.reduce((sum, s) => sum + s.amount, 0);
        
        // Today's saving
        const todaySaving = savings.filter(s => {
            const savingDate = new Date(s.date);
            return savingDate.toDateString() === today.toDateString();
        }).reduce((sum, s) => sum + s.amount, 0);
        
        return {
            success: true,
            data: {
                totalSaved,
                daysActive,
                currentStreak,
                longestStreak,
                averageSaving,
                highestSaving,
                lowestSaving,
                monthlySaving,
                yearlySaving,
                todaySaving
            }
        };
    } catch (error) {
        console.error('Error calculating statistics:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Listen to real-time updates for user savings
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
export function onSavingsUpdate(userId, callback) {
    const q = query(
        collection(db, SAVINGS_COLLECTION),
        where('userId', '==', userId),
        orderBy('date', 'desc'),
        orderBy('time', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
        const savings = [];
        snapshot.forEach((doc) => {
            savings.push({ id: doc.id, ...doc.data() });
        });
        callback(savings);
    });
}

/**
 * Add achievement
 * @param {Object} achievementData - Achievement data
 * @returns {Promise}
 */
export async function addAchievement(achievementData) {
    try {
        await addDoc(collection(db, ACHIEVEMENTS_COLLECTION), {
            ...achievementData,
            achievedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Error adding achievement:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get user achievements
 * @param {string} userId - User ID
 * @returns {Promise} Array of achievements
 */
export async function getUserAchievements(userId) {
    try {
        const q = query(
            collection(db, ACHIEVEMENTS_COLLECTION),
            where('userId', '==', userId),
            orderBy('achievedAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        
        const achievements = [];
        querySnapshot.forEach((doc) => {
            achievements.push({ id: doc.id, ...doc.data() });
        });
        
        return { success: true, data: achievements };
    } catch (error) {
        console.error('Error getting achievements:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Check and unlock achievements for a user based on savings stats
 * @param {string} userId - User ID
 */
export async function checkAndUnlockAchievements(userId) {
    try {
        const statsResult = await calculateStatistics(userId);
        if (!statsResult.success) return;
        
        const { totalSaved } = statsResult.data;
        
        // Fetch existing unlocked achievements
        const existingResult = await getUserAchievements(userId);
        if (!existingResult.success) return;
        
        const unlockedNames = new Set(existingResult.data.map(a => a.name));
        
        const achievementsList = [
            { name: 'First Saving', threshold: 1, type: 'count', description: 'Add your first saving' },
            { name: '₹100', threshold: 100, type: 'amount', description: 'Save ₹100' },
            { name: '₹500', threshold: 500, type: 'amount', description: 'Save ₹500' },
            { name: '₹1,000', threshold: 1000, type: 'amount', description: 'Save ₹1,000' },
            { name: '₹5,000', threshold: 5000, type: 'amount', description: 'Save ₹5,000' },
            { name: '₹10,000', threshold: 10000, type: 'amount', description: 'Save ₹10,000' },
            { name: '₹25,000', threshold: 25000, type: 'amount', description: 'Save ₹25,000' },
            { name: '₹50,000', threshold: 50000, type: 'amount', description: 'Save ₹50,000' },
            { name: '₹75,000', threshold: 75000, type: 'amount', description: 'Save ₹75,000' },
            { name: '₹100,000', threshold: 100000, type: 'amount', description: 'Reach your goal!' }
        ];
        
        // Get total count of savings
        const savingsResult = await getUserSavings(userId);
        const totalCount = savingsResult.success ? savingsResult.data.length : 0;
        
        for (const ach of achievementsList) {
            if (unlockedNames.has(ach.name)) continue;
            
            let qualifies = false;
            if (ach.type === 'count' && totalCount >= ach.threshold) {
                qualifies = true;
            } else if (ach.type === 'amount' && totalSaved >= ach.threshold) {
                qualifies = true;
            }
            
            if (qualifies) {
                await addAchievement({
                    userId,
                    name: ach.name,
                    description: ach.description
                });
                console.log(`Unlocked achievement: ${ach.name} for user ${userId}`);
            }
        }
    } catch (error) {
        console.error('Error checking achievements:', error);
    }
}
