/**
 * MixingSystem - Color mixing logic extracted from ColorMixGame
 * Handles bowl state, color mixing rules, and goal matching
 * Single Responsibility: All mixing-related logic
 */

import { CONFIG } from '../config.js';
import { ColorMixEngine } from './ColorMixEngine.js';

export class MixingSystem {
    /**
     * Create MixingSystem instance
     * @param {Object} config - Optional config, uses global CONFIG if not provided
     */
    constructor(config = null) {
        this.config = config || CONFIG;
        this.colorsInBowl = [];
        this.maxColors = 2;
        
        // Use dynamic color mixing engine
        this.colorEngine = new ColorMixEngine();
    }

    /**
     * Add color to the mixing bowl
     * Supports both primary colors and mixed color results (for chain mixing)
     * @param {string|Object} color - Color name or color result object with ryb values
     * @returns {Object} Result object with success, colorsInBowl, and optional mixResult
     */
    addColor(color) {
        // Validate color - accept any known color (for chain mixing)
        const colorName = this.normalizeColorInput(color);
        if (!colorName) {
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

        // Add color (store the full color info for chain mixing)
        this.colorsInBowl.push(color);

        const result = {
            success: true,
            colorsInBowl: [...this.colorsInBowl],
            colorHex: this.getColorHex(color),
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
     * Normalize color input to a usable format
     * @param {string|Object} color - Color name or color result object
     * @returns {string|null} Normalized color name or null if invalid
     */
    normalizeColorInput(color) {
        if (!color) return null;
        
        // If it's a string, check if it's a known color
        if (typeof color === 'string') {
            if (this.colorEngine.COLOR_NAMES[color.toLowerCase()]) {
                return color.toLowerCase();
            }
            return null;
        }
        
        // If it's an object with ryb values (from previous mix)
        if (color.ryb) {
            return color.result || 'mixed';
        }
        
        // If it's an object with a result property
        if (color.result && this.colorEngine.COLOR_NAMES[color.result]) {
            return color.result;
        }
        
        return null;
    }

    /**
     * Mix colors currently in the bowl using dynamic RYB mixing
     * @returns {Object|null} Mix result or null if cannot mix
     */
    mix() {
        if (!this.canMix()) {
            return null;
        }

        // Use ColorMixEngine for dynamic mixing
        const mixResult = this.colorEngine.mix(this.colorsInBowl);
        
        if (mixResult) {
            // Store original input colors for display
            mixResult.inputColors = [...this.colorsInBowl].map(c => 
                typeof c === 'string' ? c : c.result
            );
        }

        return mixResult;
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
            remainingColorHex: remainingColor ? this.getColorHex(remainingColor) : null,
            bowlEmpty: this.colorsInBowl.length === 0
        };
    }

    /**
     * Get copy of colors currently in bowl
     * @returns {Array} Array of color names or objects
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
     * Get hex value for any color (primary, secondary, or mixed)
     * @param {string|Object} color - Color name or color object
     * @returns {string|null} Hex value or null if not found
     */
    getColorHex(color) {
        if (!color) return null;
        
        // If it's a string, look it up in the engine
        if (typeof color === 'string') {
            return this.colorEngine.getHex(color);
        }
        
        // If it's an object with resultHex
        if (color.resultHex) {
            return color.resultHex;
        }
        
        // If it's an object with ryb, calculate hex
        if (color.ryb) {
            return this.colorEngine.rybToHex(color.ryb);
        }
        
        return null;
    }

    /**
     * Get hex value for primary color (backward compatibility)
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
     * Check if color is valid for mixing (any known color)
     * @param {string|Object} color - Color name or color object
     * @returns {boolean} True if valid for mixing
     */
    isValidColor(color) {
        return this.normalizeColorInput(color) !== null;
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
        return this.getColorHex(this.colorsInBowl[0]);
    }

    /**
     * Check if mix result matches level goal
     * Uses dynamic color matching with tolerance
     * @param {Object} goal - Goal configuration
     * @param {Object} mixResult - Result from mix()
     * @returns {boolean} True if result matches goal
     */
    matchesGoal(goal, mixResult) {
        if (!goal || !mixResult) {
            return false;
        }

        // All colors can potentially match - use RYB distance, not type
        switch (goal.type) {
            case 'secondary':
            case 'tertiary':
            case 'mixed':
                // Use RYB distance matching - any color close enough matches
                if (mixResult.ryb) {
                    return this.colorEngine.matchesTarget(mixResult, goal.color, 0.2);
                }
                // Fallback: exact name match
                return mixResult.result === goal.color;

            case 'effect':
                // Effects still use name matching (e.g., special named effects)
                return mixResult.result === goal.color;

            case 'multiple':
                // Check if result matches any of the goal colors
                if (!goal.colors) return false;
                if (mixResult.ryb) {
                    return goal.colors.some(targetColor => 
                        this.colorEngine.matchesTarget(mixResult, targetColor, 0.2)
                    );
                }
                // Fallback: exact name match
                return goal.colors.includes(mixResult.result);

            case 'discover':
            case 'feed':
                // Any mix counts - no type restriction
                return true;

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

    /**
     * Get the color engine for advanced operations
     * @returns {ColorMixEngine}
     */
    getColorEngine() {
        return this.colorEngine;
    }
}

export default MixingSystem;
