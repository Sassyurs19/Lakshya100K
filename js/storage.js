/**
 * Firebase Storage Module
 * Handles file storage operations including:
 * - Image uploads with compression
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
const PROOFS_PATH = 'proofs';

/**
 * Compress image before upload
 * @param {File} file - Image file to compress
 * @param {number} maxWidth - Maximum width (default: 1200)
 * @param {number} quality - Quality (0-1, default: 0.8)
 * @returns {Promise} Compressed file
 */
async function compressImage(file, maxWidth = 1200, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // Calculate new dimensions
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const compressedFile = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now()
                            });
                            resolve(compressedFile);
                        } else {
                            reject(new Error('Failed to compress image'));
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = () => reject(new Error('Failed to load image'));
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
    });
}

/**
 * Validate image file
 * @param {File} file - File to validate
 * @returns {Object} Validation result
 */
function validateImageFile(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5 MB
    
    if (!allowedTypes.includes(file.type)) {
        return { isValid: false, error: 'Only JPG, JPEG, PNG, and WebP images are allowed' };
    }
    
    if (file.size > maxSize) {
        return { isValid: false, error: 'Image size must be less than 5 MB' };
    }
    
    return { isValid: true };
}

/**
 * Upload an image to Firebase Storage with compression
 * @param {File} file - File to upload
 * @param {string} path - Storage path (e.g., 'proofs/{userId}/{savingId}')
 * @param {string} fileName - Name for the file
 * @returns {Promise} Download URL
 */
export async function uploadImage(file, path, fileName) {
    try {
        // Validate file
        const validation = validateImageFile(file);
        if (!validation.isValid) {
            return { success: false, error: validation.error };
        }
        
        // Compress image
        const compressedFile = await compressImage(file);
        
        // Create a reference to the file location
        const storageRef = ref(storage, `${path}/${fileName}`);
        
        // Upload the compressed file
        const snapshot = await uploadBytes(storageRef, compressedFile);
        
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
    const fileName = `${savingId}_${Date.now()}.jpg`;
    const path = `${PROOFS_PATH}/${userId}`;
    return await uploadImage(file, path, fileName);
}

/**
 * Upload a profile image
 * @param {File} file - Image file
 * @param {string} userId - User ID
 * @returns {Promise} Download URL
 */
export async function uploadProfileImage(file, userId) {
    const fileName = `profile_${Date.now()}.jpg`;
    const path = 'profile-images';
    return await uploadImage(file, path, fileName);
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
 * Delete a saving image by path
 * @param {string} imagePath - Full image path
 * @returns {Promise}
 */
export async function deleteSavingImage(imagePath) {
    return await deleteImage(imagePath);
}

/**
 * Delete a profile image
 * @param {string} fileName - File name
 * @returns {Promise}
 */
export async function deleteProfileImage(fileName) {
    return await deleteImage(`profile-images/${fileName}`);
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
