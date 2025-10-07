/**
 * Drawing Studio - Utility Helpers
 * Common utility functions used across the application
 */

/**
 * Get coordinates from mouse or touch event
 * Handles both mouse and touch events uniformly
 * @param {Event} e - Mouse or touch event
 * @param {HTMLElement} element - Target element (canvas)
 * @returns {{x: number, y: number}} - Normalized coordinates
 */
export function getCoords(e, element) {
    const rect = element.getBoundingClientRect();
    const scaleX = element.width / rect.width;
    const scaleY = element.height / rect.height;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
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
 * Check if device is touch-enabled
 * @returns {boolean}
 */
export function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Get canvas as data URL
 * @param {HTMLCanvasElement} canvas
 * @param {string} type - Image type (default: 'image/png')
 * @returns {string} - Data URL
 */
export function canvasToDataURL(canvas, type = 'image/png') {
    return canvas.toDataURL(type);
}

/**
 * Load image from data URL
 * @param {string} dataURL
 * @returns {Promise<HTMLImageElement>}
 */
export function loadImage(dataURL) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = dataURL;
    });
}

/**
 * Add class with animation support
 * @param {HTMLElement} element
 * @param {string} className
 */
export function addAnimatedClass(element, className) {
    element.classList.add(className);
    // Remove after animation completes
    element.addEventListener('animationend', () => {
        element.classList.remove(className);
    }, { once: true });
}

/**
 * Format date for display
 * @param {Date} date
 * @returns {string}
 */
export function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

/**
 * Generate unique ID
 * @returns {string}
 */
export function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Clamp value between min and max
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation
 * @param {number} start
 * @param {number} end
 * @param {number} t - Progress (0-1)
 * @returns {number}
 */
export function lerp(start, end, t) {
    return start + (end - start) * t;
}

/**
 * Calculate distance between two points
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @returns {number}
 */
export function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}
