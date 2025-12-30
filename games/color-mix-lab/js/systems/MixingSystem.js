/**
 * MixingSystem - Color mixing logic extracted from ColorMixGame
 * Handles bowl state, color mixing rules, and goal matching
 * Single Responsibility: All mixing-related logic
 */

import { CONFIG } from '../config.js';

export class MixingSystem {
    /**
     * Create MixingSystem instance
     * @param {Object} config - Optional config, uses global CONFIG if not provided
     */
    constructor(config = null) {
        this.config = config || CONFIG;
        this.colorsInBowl = [];
        this.maxColors = 2;
    }

    /**
     * Add color to the mixing bowl
     * @param {string} color - Color name (red, blue, yellow)
     * @returns {Object} Result object with success, colorsInBowl, and optional mixResult
     */
    addColor(color) {
        // Validate color
        if (!color || !this.isValidPrimaryColor(color)) {
            return {
                success: false,
                reason: 'invalid_color',
                colorsInBowl: [...this.colorsInBowl]
            };
        }

        // Check if bowl is full
        if (this.isBowlFull()) {
            return {
                success: false,
                reason: 'bowl_full',
                colorsInBowl: [...this.colorsInBowl]
            };
        }

        // Add color
        this.colorsInBowl.push(color);

        const result = {
            success: true,
            colorsInBowl: [...this.colorsInBowl],
            colorHex: this.getPrimaryColorHex(color),
            mixed: false,
            mixResult: null
        };

        // Auto-mix when bowl is full
        if (this.isBowlFull()) {
            result.mixed = true;
            result.mixResult = this.mix();
        }

        return result;
    }

    /**
     * Mix colors currently in the bowl
     * @returns {Object|null} Mix result or null if cannot mix
     */
    mix() {
        if (!this.canMix()) {
            return null;
        }

        const colors = this.colorsInBowl;
        const sortedColors = [...colors].sort();
        const mixKey = sortedColors.join('+');

        const rule = this.config.MIXING_RULES[mixKey];

        if (rule) {
            const resultHex = rule.type === 'secondary'
                ? this.config.COLORS.SECONDARY[rule.result]
                : this.config.COLORS.SPECIAL[rule.result];

            // Use COLOR_EMOJIS for result display (not STICKERS which are level rewards)
            const emoji = this.config.COLOR_EMOJIS?.[rule.result] || '✨';

            return {
                result: rule.result,
                type: rule.type,
                resultHex: resultHex,
                emoji: emoji,
                inputColors: [...colors]
            };
        }

        // Unknown combination = mud
        const mudEmoji = this.config.COLOR_EMOJIS?.mud || '💩';
        return {
            result: 'mud',
            type: 'mud',
            resultHex: this.config.COLORS.SPECIAL.mud,
            emoji: mudEmoji,
            inputColors: [...colors]
        };
    }

    /**
     * Clear the mixing bowl
     */
    clear() {
        this.colorsInBowl = [];
    }

    /**
     * Undo the last added color (remove last color from bowl)
     * @returns {Object} Result with removed color info
     */
    undo() {
        if (this.colorsInBowl.length === 0) {
            return { success: false, reason: 'bowl_empty' };
        }

        const removedColor = this.colorsInBowl.pop();
        const remainingColor = this.colorsInBowl.length > 0 ? this.colorsInBowl[0] : null;

        return {
            success: true,
            removedColor,
            remainingColor,
            remainingColorHex: remainingColor ? this.getPrimaryColorHex(remainingColor) : null,
            bowlEmpty: this.colorsInBowl.length === 0
        };
    }

    /**
     * Get copy of colors currently in bowl
     * @returns {string[]} Array of color names
     */
    getColorsInBowl() {
        return [...this.colorsInBowl];
    }

    /**
     * Check if bowl is full
     * @returns {boolean} True if bowl has max colors
     */
    isBowlFull() {
        return this.colorsInBowl.length >= this.maxColors;
    }

    /**
     * Check if mixing is possible
     * @returns {boolean} True if bowl has 2+ colors
     */
    canMix() {
        return this.colorsInBowl.length >= 2;
    }

    /**
     * Get maximum number of colors allowed
     * @returns {number} Max colors (default 2)
     */
    getMaxColors() {
        return this.maxColors;
    }

    /**
     * Get hex value for primary color
     * @param {string} color - Color name
     * @returns {string|null} Hex value or null if not found
     */
    getPrimaryColorHex(color) {
        return this.config.COLORS.PRIMARY[color] || null;
    }

    /**
     * Check if color is a valid primary color
     * @param {string} color - Color name
     * @returns {boolean} True if valid primary color
     */
    isValidPrimaryColor(color) {
        return color && this.config.COLORS.PRIMARY.hasOwnProperty(color);
    }

    /**
     * Get current bowl color hex (for single color display)
     * @returns {string|null} Hex value or null if empty/full
     */
    getCurrentColorHex() {
        if (this.colorsInBowl.length === 0) {
            return null;
        }
        if (this.colorsInBowl.length >= 2) {
            return null; // Use mix result instead
        }
        return this.getPrimaryColorHex(this.colorsInBowl[0]);
    }

    /**
     * Check if mix result matches level goal
     * @param {Object} goal - Goal configuration
     * @param {Object} mixResult - Result from mix()
     * @returns {boolean} True if result matches goal
     */
    matchesGoal(goal, mixResult) {
        if (!goal || !mixResult) {
            return false;
        }

        // Mud never matches
        if (mixResult.type === 'mud') {
            return false;
        }

        switch (goal.type) {
            case 'secondary':
                return mixResult.type === 'secondary' && mixResult.result === goal.color;

            case 'effect':
                return mixResult.type === 'effect' && mixResult.result === goal.color;

            case 'multiple':
                return mixResult.type === 'secondary' &&
                       goal.colors &&
                       goal.colors.includes(mixResult.result);

            case 'discover':
            case 'feed':
                // Any valid mix counts
                return mixResult.type !== 'mud';

            default:
                return false;
        }
    }

    /**
     * Check if level is complete
     * @param {Object} goal - Goal configuration
     * @param {number} progress - Current progress count
     * @returns {boolean} True if progress meets or exceeds goal count
     */
    isLevelComplete(goal, progress) {
        return goal && progress >= goal.count;
    }
}

export default MixingSystem;
