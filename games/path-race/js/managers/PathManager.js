/**
 * PathManager - Path Validation Manager
 * Validates player moves and path completeness
 */

class PathManager {
    constructor() {
        this.logger = window.Logger;
        this.playerPath = [];
        this.grid = null;
        this.lastClickTime = 0;
    }

    /**
     * Set the grid for this manager
     * @param {Object} grid - Grid data
     */
    setGrid(grid) {
        this.grid = grid;
        this.reset();
    }

    /**
     * Reset path state
     */
    reset() {
        this.playerPath = [];
        if (this.grid) {
            this.grid.dots.forEach(dot => {
                dot.visited = false;
                dot.playerVisited = false;
            });
        }
    }

    /**
     * Validate if a move is legal
     * @param {Object} fromDot - Current dot (null if starting)
     * @param {Object} toDot - Target dot
     * @returns {boolean} True if valid move
     */
    validateMove(fromDot, toDot) {
        // First move must be start dot
        if (!fromDot && toDot.type === CONFIG.DOT_TYPES.START) {
            return true;
        }

        // Must have a from dot for subsequent moves
        if (!fromDot) {
            return false;
        }

        // Can't move to already visited dot
        if (toDot.playerVisited) {
            return false;
        }

        // Must be orthogonal neighbor
        return fromDot.neighbors.includes(toDot);
    }

    /**
     * Add a move to the path
     * @param {Object} dot - Dot to add
     * @returns {boolean} True if added successfully
     */
    addMove(dot) {
        // Prevent double-click
        const now = Date.now();
        if (now - this.lastClickTime < CONFIG.PLAYER.DOUBLE_CLICK_PREVENTION) {
            return false;
        }
        this.lastClickTime = now;

        const currentDot = this.playerPath.length > 0
            ? this.playerPath[this.playerPath.length - 1]
            : null;

        if (!this.validateMove(currentDot, dot)) {
            this.logger.warn('PathManager: Invalid move attempted');
            return false;
        }

        this.playerPath.push(dot);
        dot.playerVisited = true;
        dot.visited = true; // Also set general visited flag

        this.logger.info(`PathManager: Move added, path length: ${this.playerPath.length}`);
        return true;
    }

    /**
     * Undo the last move
     * @returns {Object|null} The removed dot, or null if nothing to undo
     */
    undo() {
        if (this.playerPath.length === 0) {
            return null;
        }

        const dot = this.playerPath.pop();
        dot.playerVisited = false;
        dot.visited = false;

        this.logger.info(`PathManager: Undo, path length: ${this.playerPath.length}`);
        return dot;
    }

    /**
     * Check if path is complete
     * @returns {boolean} True if all dots visited and ended at end dot
     */
    isPathComplete() {
        if (!this.grid) return false;

        // Must have visited all dots
        if (this.playerPath.length !== this.grid.dots.length) {
            return false;
        }

        // Last dot must be the end dot
        const lastDot = this.playerPath[this.playerPath.length - 1];
        return lastDot.type === CONFIG.DOT_TYPES.END;
    }

    /**
     * Get current path
     * @returns {Array} Array of dots in path
     */
    getPath() {
        return [...this.playerPath];
    }

    /**
     * Get path length
     * @returns {number} Number of moves
     */
    getPathLength() {
        return this.playerPath.length;
    }

    /**
     * Get last dot in path
     * @returns {Object|null} Last dot or null
     */
    getLastDot() {
        return this.playerPath.length > 0
            ? this.playerPath[this.playerPath.length - 1]
            : null;
    }

    /**
     * Check if a specific dot has been visited
     * @param {Object} dot - Dot to check
     * @returns {boolean} True if visited
     */
    isVisited(dot) {
        return dot.playerVisited === true;
    }

    /**
     * Get available next moves from current position
     * @returns {Array} Array of valid next dots
     */
    getAvailableMoves() {
        const currentDot = this.getLastDot();
        if (!currentDot) {
            // First move - must be start dot
            return [this.grid.startDot];
        }

        // Return unvisited neighbors
        return currentDot.neighbors.filter(neighbor => !neighbor.playerVisited);
    }

    /**
     * Clean up resources
     */
    destroy() {
        this.reset();
        this.grid = null;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PathManager;
}
