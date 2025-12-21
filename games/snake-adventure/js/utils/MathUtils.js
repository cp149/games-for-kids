/**
 * Math Utilities
 * Helper functions for common calculations
 */

const MathUtils = {
    /**
     * Linear interpolation
     * @param {number} start - Start value
     * @param {number} end - End value
     * @param {number} t - Interpolation factor (0-1)
     * @returns {number} Interpolated value
     */
    lerp(start, end, t) {
        return start + (end - start) * t;
    },

    /**
     * Clamp value between min and max
     * @param {number} value - Value to clamp
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Clamped value
     */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    /**
     * Calculate distance between two points
     * @param {number} x1 - First point X
     * @param {number} y1 - First point Y
     * @param {number} x2 - Second point X
     * @param {number} y2 - Second point Y
     * @returns {number} Distance
     */
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },

    /**
     * Calculate angle between two points
     * @param {number} x1 - First point X
     * @param {number} y1 - First point Y
     * @param {number} x2 - Second point X
     * @param {number} y2 - Second point Y
     * @returns {number} Angle in radians
     */
    angleBetween(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    },

    /**
     * Normalize angle to 0-2π range
     * @param {number} angle - Angle in radians
     * @returns {number} Normalized angle
     */
    normalizeAngle(angle) {
        while (angle < 0) angle += Math.PI * 2;
        while (angle >= Math.PI * 2) angle -= Math.PI * 2;
        return angle;
    },

    /**
     * Get shortest angular difference
     * @param {number} from - From angle
     * @param {number} to - To angle
     * @returns {number} Shortest difference (-π to π)
     */
    angleDifference(from, to) {
        let diff = to - from;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        return diff;
    },

    /**
     * Random number between min and max
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random number
     */
    random(min, max) {
        return min + Math.random() * (max - min);
    },

    /**
     * Random integer between min and max (inclusive)
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random integer
     */
    randomInt(min, max) {
        return Math.floor(this.random(min, max + 1));
    },

    /**
     * Check if point is inside circle
     * @param {number} px - Point X
     * @param {number} py - Point Y
     * @param {number} cx - Circle center X
     * @param {number} cy - Circle center Y
     * @param {number} radius - Circle radius
     * @returns {boolean} True if inside
     */
    pointInCircle(px, py, cx, cy, radius) {
        return this.distance(px, py, cx, cy) <= radius;
    },

    /**
     * Check if two circles intersect
     * @param {number} x1 - First circle X
     * @param {number} y1 - First circle Y
     * @param {number} r1 - First circle radius
     * @param {number} x2 - Second circle X
     * @param {number} y2 - Second circle Y
     * @param {number} r2 - Second circle radius
     * @returns {boolean} True if intersecting
     */
    circlesIntersect(x1, y1, r1, x2, y2, r2) {
        return this.distance(x1, y1, x2, y2) <= (r1 + r2);
    },

    /**
     * Generate unique ID
     * @returns {string} Unique identifier
     */
    generateId() {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Weighted random selection
     * @param {Array} items - Array of items to choose from
     * @param {Array} weights - Array of weights (higher = more likely)
     * @returns {*} Randomly selected item
     */
    weightedRandom(items, weights) {
        if (!items || items.length === 0) return null;
        if (!weights || weights.length !== items.length) {
            // No weights provided, use uniform distribution
            return items[Math.floor(Math.random() * items.length)];
        }

        // Calculate total weight
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

        // Random value between 0 and total weight
        let random = Math.random() * totalWeight;

        // Find the item
        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return items[i];
            }
        }

        // Fallback (should never reach here)
        return items[items.length - 1];
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MathUtils;
}
