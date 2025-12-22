/**
 * MathUtils - Mathematical Utility Functions
 * Helper functions for grid calculations, distance, and geometry
 *
 * Will be implemented by @game-mechanics-engineer in Phase 3
 */

const MathUtils = {
    /**
     * Calculate Euclidean distance between two points
     * @param {Object} p1 - Point {x, y}
     * @param {Object} p2 - Point {x, y}
     * @returns {number} Distance
     */
    distance(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
    },

    /**
     * Calculate Manhattan distance (grid distance)
     * @param {Object} p1 - Point {x, y}
     * @param {Object} p2 - Point {x, y}
     * @returns {number} Manhattan distance
     */
    manhattanDistance(p1, p2) {
        return Math.abs(p2.x - p1.x) + Math.abs(p2.y - p1.y);
    },

    /**
     * Check if two points are orthogonal neighbors
     * @param {Object} p1 - Point {x, y}
     * @param {Object} p2 - Point {x, y}
     * @returns {boolean} True if neighbors
     */
    areOrthogonalNeighbors(p1, p2) {
        return this.manhattanDistance(p1, p2) === 1;
    },

    /**
     * Clamp value between min and max
     * @param {number} value - Value to clamp
     * @param {number} min - Minimum
     * @param {number} max - Maximum
     * @returns {number} Clamped value
     */
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    /**
     * Linear interpolation
     * @param {number} a - Start value
     * @param {number} b - End value
     * @param {number} t - Interpolation factor (0-1)
     * @returns {number} Interpolated value
     */
    lerp(a, b, t) {
        return a + (b - a) * t;
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MathUtils;
}
