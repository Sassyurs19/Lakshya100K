/**
 * Utilities Module
 * Common utility functions used across the application
 */

/**
 * Format currency with proper formatting
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency symbol (default: ₹)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = '₹') {
    return `${currency}${amount.toLocaleString()}`;
}

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Format date to short string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string (e.g., "Jun 28, 2026")
 */
export function formatDateShort(date) {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

/**
 * Format time to readable string
 * @param {string|Date} time - Time to format
 * @returns {string} Formatted time string
 */
export function formatTime(time) {
    const t = new Date(time);
    return t.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

/**
 * Get time-based greeting
 * @returns {string} Greeting message
 */
export function getGreeting() {
    const hour = new Date().getHours();
    
    if (hour < 12) {
        return 'Good Morning';
    } else if (hour < 17) {
        return 'Good Afternoon';
    } else {
        return 'Good Evening';
    }
}

/**
 * Calculate percentage
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @returns {number} Percentage
 */
export function calculatePercentage(value, total) {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
}

/**
 * Calculate days remaining to reach goal
 * @param {number} remaining - Remaining amount
 * @param {number} dailyAverage - Daily average saving
 * @returns {number} Estimated days
 */
export function calculateDaysRemaining(remaining, dailyAverage) {
    if (dailyAverage === 0) return null;
    return Math.ceil(remaining / dailyAverage);
}

/**
 * Calculate estimated completion date
 * @param {number} remaining - Remaining amount
 * @param {number} dailyAverage - Daily average saving
 * @returns {Date|null} Estimated completion date
 */
export function calculateEstimatedDate(remaining, dailyAverage) {
    const days = calculateDaysRemaining(remaining, dailyAverage);
    if (days === null) return null;
    
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Valid email
 */
export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result
 */
export function validatePassword(password) {
    const result = {
        isValid: true,
        errors: []
    };
    
    if (password.length < 8) {
        result.isValid = false;
        result.errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
        result.isValid = false;
        result.errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
        result.isValid = false;
        result.errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
        result.isValid = false;
        result.errors.push('Password must contain at least one number');
    }
    
    return result;
}

/**
 * Debounce function for performance optimization
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Generate random ID
 * @returns {string} Random ID
 */
export function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, length) {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
}

/**
 * Get category icon class (Font Awesome)
 * @param {string} category - Category name
 * @returns {string} Icon class
 */
export function getCategoryIcon(category) {
    const icons = {
        'Cash': 'fa-money-bill',
        'Bank': 'fa-university',
        'UPI': 'fa-mobile-alt',
        'Wallet': 'fa-wallet',
        'Investment': 'fa-chart-line',
        'Other': 'fa-box'
    };
    return icons[category] || 'fa-money-bill';
}

/**
 * Get achievement icon class (Font Awesome)
 * @param {string} achievement - Achievement name
 * @returns {string} Icon class
 */
export function getAchievementIcon(achievement) {
    const icons = {
        'first_saving': 'fa-crosshairs',
        'hundred': 'fa-coins',
        'five_hundred': 'fa-money-bill',
        'thousand': 'fa-gem',
        'five_thousand': 'fa-trophy',
        'ten_thousand': 'fa-star',
        'twenty_five_thousand': 'fa-award',
        'fifty_thousand': 'fa-crown',
        'seventy_five_thousand': 'fa-fire',
        'one_hundred_thousand': 'fa-flag-checkered'
    };
    return icons[achievement] || 'fa-trophy';
}

/**
 * Animate number count up
 * @param {HTMLElement} element - Element to animate
 * @param {number} target - Target number
 * @param {number} duration - Animation duration in ms
 */
export function animateCountUp(element, target, duration = 1000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 16);
}

/**
 * Show toast notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, warning, info)
 */
export function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'warning': 'fa-exclamation-triangle',
        'info': 'fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span>${message}</span>
        <button class="toast-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(toast);
    
    // Remove toast after 5 seconds
    setTimeout(() => {
        toast.classList.add('toast-hide');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 5000);
    
    // Close button functionality
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.classList.add('toast-hide');
        setTimeout(() => {
            toast.remove();
        }, 300);
    });
}

/**
 * Check if user is on mobile device
 * @returns {boolean} Is mobile
 */
export function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise}
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return { success: true };
    } catch (error) {
        console.error('Error copying to clipboard:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Download data as file
 * @param {string} data - Data to download
 * @param {string} filename - File name
 * @param {string} type - File type
 */
export function downloadFile(data, filename, type = 'text/plain') {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

/**
 * Export data as CSV
 * @param {Array} data - Array of objects to export
 * @param {string} filename - File name
 */
export function exportToCSV(data, filename = 'export.csv') {
    if (!data.length) return;
    
    const headers = Object.keys(data[0]);
    const csv = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
            const value = row[header];
            const stringValue = value !== null && value !== undefined ? String(value) : '';
            return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
        }).join(','))
    ].join('\n');
    
    downloadFile(csv, filename, 'text/csv');
}
