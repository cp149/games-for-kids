/**
 * IdleHintManager - Idle Hint System
 * Handles idle detection and hint display for guiding players
 *
 * Extracted from ColorMixGame to follow Single Responsibility Principle
 */

export class IdleHintManager {
    /**
     * @param {Object} options
     * @param {Function} options.setTimeout - Safe setTimeout wrapper
     * @param {Function} options.clearTimeout - Safe clearTimeout wrapper
     * @param {Object} options.config - Game configuration
     */
    constructor(options = {}) {
        this._setTimeout = options.setTimeout || ((fn, ms) => setTimeout(fn, ms));
        this._clearTimeout = options.clearTimeout || ((id) => clearTimeout(id));
        this.config = options.config || {};

        this.idleHintTimer = null;
        this.onShowHint = null; // Callback when hint should be shown
    }

    /**
     * Set callback for showing hints
     * @param {Function} callback - Function(hintColor) to call when hint should show
     */
    setHintCallback(callback) {
        this.onShowHint = callback;
    }

    /**
     * Start idle hint timer
     * @param {Object} state - Current game state
     */
    startTimer(state) {
        this.clearTimer();

        // Don't show hints in free play mode
        if (state.isFreeMode) return;

        // Set timer for 8 seconds
        const idleTime = this.config.UI?.IDLE_HINT_DELAY || 8000;
        this.idleHintTimer = this._setTimeout(() => {
            this.showHint(state);
        }, idleTime);
    }

    /**
     * Clear idle hint timer
     */
    clearTimer() {
        if (this.idleHintTimer) {
            this._clearTimeout(this.idleHintTimer);
            this.idleHintTimer = null;
        }
    }

    /**
     * Show hint based on current goal
     * @param {Object} state - Current game state
     */
    showHint(state) {
        if (state.isFreeMode) return;

        const goal = state.currentGoal;
        if (!goal) return;

        // Determine which color to hint based on goal
        let hintColor = null;

        if (goal.type === 'secondary' && goal.color) {
            const neededColors = this.getColorsForSecondary(goal.color);
            if (neededColors.length > 0) {
                hintColor = neededColors[0];
            }
        } else if (goal.type === 'multiple' && goal.colors && goal.colors[0]) {
            const neededColors = this.getColorsForSecondary(goal.colors[0]);
            if (neededColors.length > 0) {
                hintColor = neededColors[0];
            }
        }

        if (hintColor && this.onShowHint) {
            this.onShowHint(hintColor);
        }
    }

    /**
     * Check if a color helps achieve the current goal
     * @param {string} color - Color to check
     * @param {Object} state - Current game state
     * @returns {boolean} True if color helps goal
     */
    checkIfColorHelpsGoal(color, state) {
        // In free play mode, always return true
        if (state.isFreeMode) {
            return true;
        }

        const goal = state.currentGoal;
        if (!goal) {
            return false;
        }

        // Resolve target color name based on goal type
        let targetColorName = null;
        if (goal.type === 'secondary' || goal.type === 'effect') {
            targetColorName = goal.color;
        } else if (goal.type === 'multiple' && goal.colors) {
            targetColorName = goal.colors[0];
        }

        if (!targetColorName) {
            return false;
        }

        // Map goal colors to their component primary colors
        const colorComponents = {
            purple: ['red', 'blue'],
            green: ['blue', 'yellow'],
            orange: ['red', 'yellow'],
            red: ['red'],
            blue: ['blue'],
            yellow: ['yellow']
        };

        const neededColors = colorComponents[targetColorName] || [];
        return neededColors.includes(color);
    }

    /**
     * Get primary colors needed for a secondary color
     * @param {string} secondaryColor - Secondary color name
     * @returns {string[]} Array of primary colors
     */
    getColorsForSecondary(secondaryColor) {
        const recipes = {
            orange: ['red', 'yellow'],
            green: ['blue', 'yellow'],
            purple: ['red', 'blue']
        };
        return recipes[secondaryColor] || [];
    }

    /**
     * Cleanup resources
     */
    destroy() {
        this.clearTimer();
        this.onShowHint = null;
    }
}

// Dual export pattern for browser and Node.js
if (typeof window !== 'undefined') {
    window.IdleHintManager = IdleHintManager;
}

export default IdleHintManager;
