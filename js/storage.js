/**
 * Firebase Storage Module
 * Handles file storage operations including:
 * - Image uploads
 * - Image downloads
 * - Image deletion
 * - URL generation
 */

import { 
    ref, 
    uploadBytes, 
    getDownloadURL, 
    deleteObject,
    getMetadata
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';
import { storage } from './firebase-config.js';

// Storage path constants
const SAVINGS_IMAGES_PATH = 'savings-images';
const PROFILE_IMAGES_PATH = 'profile-images';

/**
 * Upload an image to Firebase Storage
 * @param {File} file - File to upload
 * @param {string} path - Storage path (e.g., 'savings-images' or 'profile-images')
 * @param {string} fileName - Name for the file
 * @returns {Promise} Download URL
 */
export async function uploadImage(file, path, fileName) {
    try {
        // Create a reference to the file location
        const storageRef = ref(storage, `${path}/${fileName}`);
        
        // Upload the file
        const snapshot = await uploadBytes(storageRef, file);
        
        // Get the download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        return { success: true, url: downloadURL, ref: snapshot.ref };
    } catch (error) {
        console.error('Error uploading image:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Upload a saving proof image
 * @param {File} file - Image file
 * @param {string} userId - User ID
 * @param {string} savingId - Saving ID
 * @returns {Promise} Download URL
 */
export async function uploadSavingImage(file, userId, savingId) {
    const fileName = `${userId}_${savingId}_${Date.now()}`;
    return await uploadImage(file, SAVINGS_IMAGES_PATH, fileName);
}

/**
 * Upload a profile image
 * @param {File} file - Image file
 * @param {string} userId - User ID
 * @returns {Promise} Download URL
 */
export async function uploadProfileImage(file, userId) {
    const fileName = `${userId}_profile_${Date.now()}`;
    return await uploadImage(file, PROFILE_IMAGES_PATH, fileName);
}

/**
 * Get download URL for a file
 * @param {string} path - File path in storage
 * @returns {Promise} Download URL
 */
export async function getImageURL(path) {
    try {
        const storageRef = ref(storage, path);
        const url = await getDownloadURL(storageRef);
        return { success: true, url };
    } catch (error) {
        console.error('Error getting image URL:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete an image from storage
 * @param {string} path - File path in storage
 * @returns {Promise}
 */
export async function deleteImage(path) {
    try {
        const storageRef = ref(storage, path);
        await deleteObject(storageRef);
        return { success: true };
    } catch (error) {
        console.error('Error deleting image:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete a saving image
 * @param {string} fileName - File name
 * @returns {Promise}
 */
export async function deleteSavingImage(fileName) {
    return await deleteImage(`${SAVINGS_IMAGES_PATH}/${fileName}`);
}

/**
 * Delete a profile image
 * @param {string} fileName - File name
 * @returns {Promise}
 */
export async function deleteProfileImage(fileName) {
    return await deleteImage(`${PROFILE_IMAGES_PATH}/${fileName}`);
}

/**
 * Get file metadata
 * @param {string} path - File path in storage
 * @returns {Promise} File metadata
 */
export async function getFileMetadata(path) {
    try {
        const storageRef = ref(storage, path);
        const metadata = await getMetadata(storageRef);
        return { success: true, metadata };
    } catch (error) {
        console.error('Error getting file metadata:', error);
        return { success: false, error: error.message };
    }
}
