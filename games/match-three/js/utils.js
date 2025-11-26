/**
 * Utils - Shared utility functions
 * Common functions used across multiple classes
 *
 * Supports dependency injection for testability:
 * - Pass viewport dimensions and config as parameters to getCellSize
 */

const Utils = {
    /**
     * Minimum supported screen dimension
     */
    MIN_SCREEN_SIZE: 320,

    /**
     * Absolute minimum cell size (fallback)
     */
    MIN_CELL_SIZE: 30,

    /**
     * Calculate cell size based on viewport - dynamic sizing for best fit
     * @param {number} [gridSize] - Number of cells in grid (default: CONFIG.GAME.GRID_SIZE)
     * @param {Object} [options] - Optional dependencies for testing
     * @param {number} [options.viewportWidth] - Viewport width (default: window.innerWidth)
     * @param {number} [options.viewportHeight] - Viewport height (default: window.innerHeight)
     * @param {Object} [options.config] - Configuration object (default: CONFIG)
     * @returns {number} Cell size in pixels (always positive)
     */
    getCellSize(gridSize, options = {}) {
        // Get config and viewport with defaults
        const config = options.config || CONFIG;
        const width = options.viewportWidth ?? (typeof window !== 'undefined' ? window.innerWidth : 800);
        const height = options.viewportHeight ?? (typeof window !== 'undefined' ? window.innerHeight : 600);
        const defaultGridSize = gridSize ?? config.GAME.GRID_SIZE;

        // Validate inputs
        const safeGridSize = defaultGridSize > 0 ? defaultGridSize : config.GAME.GRID_SIZE;

        // Handle very small screens
        if (width < this.MIN_SCREEN_SIZE || height < this.MIN_SCREEN_SIZE) {
            console.warn('Screen too small, using minimum cell size');
            return this.MIN_CELL_SIZE;
        }

        // Calculate available space for the board
        // Account for header, score panel, controls, and margins
        const verticalSpace = Math.max(0, height - config.UI.HEADER_HEIGHT
            - config.UI.SCORE_PANEL_HEIGHT - config.UI.CONTROLS_HEIGHT
            - config.BOARD.BOARD_MARGIN * 2);
        const horizontalSpace = Math.max(0, width - config.BOARD.BOARD_MARGIN * 2);

        // Handle edge case where no space available
        if (verticalSpace <= 0 || horizontalSpace <= 0) {
            console.warn('Insufficient space for board, using minimum cell size');
            return this.MIN_CELL_SIZE;
        }

        // Use smaller of horizontal/vertical to ensure square board fits
        const availableSpace = Math.min(horizontalSpace, verticalSpace);

        // Calculate ideal cell size based on available space
        let idealCellSize = Math.floor(availableSpace / safeGridSize);

        // Ensure positive value
        if (idealCellSize <= 0) {
            return this.MIN_CELL_SIZE;
        }

        // Clamp to min/max based on breakpoints
        let minSize, maxSize;
        if (width <= config.UI.BREAKPOINTS.MOBILE) {
            minSize = config.BOARD.CELL_SIZE_MOBILE - 8;
            maxSize = config.BOARD.CELL_SIZE_MOBILE + 8;
        } else if (width <= config.UI.BREAKPOINTS.TABLET) {
            minSize = config.BOARD.CELL_SIZE_TABLET - 8;
            maxSize = config.BOARD.CELL_SIZE_TABLET + 16;
        } else if (width <= config.UI.BREAKPOINTS.LARGE) {
            minSize = config.BOARD.CELL_SIZE_DESKTOP - 8;
            maxSize = config.BOARD.CELL_SIZE_DESKTOP + 20;
        } else {
            // Large screens - allow bigger cells
            minSize = config.BOARD.CELL_SIZE_LARGE - 10;
            maxSize = config.BOARD.CELL_SIZE_LARGE + 20;
        }

        // Ensure minSize is at least the absolute minimum
        minSize = Math.max(this.MIN_CELL_SIZE, minSize);

        // Ensure cell size stays within reasonable bounds
        idealCellSize = Math.max(minSize, Math.min(maxSize, idealCellSize));

        // Ensure board doesn't exceed max size
        const maxBoardSize = config.BOARD.MAX_BOARD_SIZE;
        if (idealCellSize * safeGridSize > maxBoardSize) {
            idealCellSize = Math.floor(maxBoardSize / safeGridSize);
        }

        // Final safety check
        return Math.max(this.MIN_CELL_SIZE, idealCellSize);
    },

    /**
     * Safely parse integer from string with fallback
     * @param {string} value - Value to parse
     * @param {number} fallback - Fallback value if parsing fails (default: 0)
     * @returns {number} Parsed integer or fallback
     */
    safeParseInt(value, fallback = 0) {
        // Ensure fallback itself is a valid number
        const safeFallback = (typeof fallback === 'number' && !isNaN(fallback))
            ? fallback
            : 0;

        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? safeFallback : parsed;
    },

    /**
     * Check if value is within bounds
     * @param {number} value - Value to check
     * @param {number} min - Minimum (inclusive)
     * @param {number} max - Maximum (exclusive)
     * @returns {boolean} True if value is within bounds
     */
    isInBounds(value, min, max) {
        return value >= min && value < max;
    },

    /**
     * Clamp value between min and max
     * @param {number} value - Value to clamp
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Clamped value
     */
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
