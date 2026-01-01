/**
 * LevelManager - Level progression and sticker management
 * Handles level state, progression, sticker rewards, and persistence
 * Single Responsibility: All level-related logic
 */

import { CONFIG } from '../config.js';

export class LevelManager {
    /**
     * Create LevelManager instance
     * @param {Object} config - Optional config, uses global CONFIG if not provided
     */
    constructor(config = null) {
        this.config = config || CONFIG;
        this.currentLevel = 1;
        this.progress = 0;
        this.stickers = [];
        this.freePlayUnlocked = false;
        this.isFreeMode = false;

        // Event callbacks
        this.callbacks = {
            onLevelChange: null,
            onProgressChange: null,
            onStickerCollected: null,
            onLevelComplete: null,
            onFreeModeChange: null
        };
    }

    /**
     * Get current level number
     * @returns {number} Current level
     */
    getCurrentLevel() {
        return this.currentLevel;
    }

    /**
     * Get configuration for a level
     * @param {number} level - Level number (defaults to current)
     * @returns {Object|null} Level config or null if invalid
     */
    getLevelConfig(level = this.currentLevel) {
        return this.config.LEVELS[level] || null;
    }

    /**
     * Get goal for current level
     * @returns {Object} Goal configuration
     */
    getGoal() {
        const config = this.getLevelConfig();
        return config ? config.goal : null;
    }

    /**
     * Get available colors for current level
     * @returns {string[]} Array of color names
     */
    getAvailableColors() {
        const config = this.getLevelConfig();
        return config ? config.availableColors : [];
    }

    /**
     * Get hint for current level
     * @returns {string} Hint text
     */
    getHint() {
        const config = this.getLevelConfig();
        return config ? config.hint : '';
    }

    /**
     * Check if current level is a tutorial level
     * @returns {boolean} True if tutorial level
     */
    isTutorialLevel() {
        const config = this.getLevelConfig();
        return config ? config.tutorial === true : false;
    }

    /**
     * Get current progress count
     * @returns {number} Progress count
     */
    getProgress() {
        return this.progress;
    }

    /**
     * Add progress toward goal
     * @param {number} amount - Amount to add (default 1)
     */
    addProgress(amount = 1) {
        if (amount < 0) {
            return; // Ignore negative values
        }
        this.progress += amount;

        if (this.callbacks.onProgressChange) {
            this.callbacks.onProgressChange(this.progress, this.getGoal());
        }

        // Check for level completion
        if (this.isLevelComplete() && this.callbacks.onLevelComplete) {
            this.callbacks.onLevelComplete(this.currentLevel, this.getLevelConfig());
        }
    }

    /**
     * Reset progress to zero
     */
    resetProgress() {
        this.progress = 0;
    }

    /**
     * Check if current level is complete
     * @returns {boolean} True if progress meets or exceeds goal
     */
    isLevelComplete() {
        const goal = this.getGoal();
        return goal && this.progress >= goal.count;
    }

    /**
     * Advance to next level
     * @returns {Object} Result with success status and new level info
     */
    nextLevel() {
        if (this.isLastLevel()) {
            return {
                success: false,
                reason: 'max_level_reached',
                level: this.currentLevel
            };
        }

        this.currentLevel++;
        this.resetProgress();

        const config = this.getLevelConfig();

        if (this.callbacks.onLevelChange) {
            this.callbacks.onLevelChange(this.currentLevel, config);
        }

        return {
            success: true,
            level: this.currentLevel,
            config: config
        };
    }

    /**
     * Set level directly
     * @param {number} level - Level number
     */
    setLevel(level) {
        const total = this.getTotalLevels();
        this.currentLevel = Math.max(1, Math.min(level, total));
        this.resetProgress();
    }

    /**
     * Get total number of levels
     * @returns {number} Total levels
     */
    getTotalLevels() {
        return this.config.GAME.TOTAL_LEVELS;
    }

    /**
     * Check if current level is the last level
     * @returns {boolean} True if at last level
     */
    isLastLevel() {
        return this.currentLevel >= this.getTotalLevels();
    }

    // --- Sticker Management ---

    /**
     * Get collected stickers
     * @returns {string[]} Copy of stickers array
     */
    getStickers() {
        return [...this.stickers];
    }

    /**
     * Add a sticker to collection
     * @param {string} stickerId - Sticker ID
     * @returns {Object} Result with success status and sticker info
     */
    addSticker(stickerId) {
        const stickerInfo = this.getStickerInfo(stickerId);

        if (!stickerInfo) {
            return {
                success: false,
                reason: 'invalid_sticker',
                sticker: null
            };
        }

        const isNew = !this.hasSticker(stickerId);

        if (isNew) {
            this.stickers.push(stickerId);

            if (this.callbacks.onStickerCollected) {
                this.callbacks.onStickerCollected(stickerId, stickerInfo);
            }
        }

        return {
            success: true,
            isNew: isNew,
            sticker: stickerInfo
        };
    }

    /**
     * Check if sticker is collected
     * @param {string} stickerId - Sticker ID
     * @returns {boolean} True if collected
     */
    hasSticker(stickerId) {
        return this.stickers.includes(stickerId);
    }

    /**
     * Get number of collected stickers
     * @returns {number} Sticker count
     */
    getStickerCount() {
        return this.stickers.length;
    }

    /**
     * Get total available stickers
     * @returns {number} Total stickers
     */
    getTotalStickers() {
        return this.config.GAME.TOTAL_STICKERS;
    }

    /**
     * Check if all stickers are collected
     * @returns {boolean} True if all collected
     */
    getAllStickersCollected() {
        return this.getStickerCount() >= this.getTotalStickers();
    }

    /**
     * Get sticker info by ID
     * @param {string} stickerId - Sticker ID
     * @returns {Object|null} Sticker info or null
     */
    getStickerInfo(stickerId) {
        return this.config.STICKERS[stickerId] || null;
    }

    /**
     * Get all sticker definitions
     * @returns {Object} All sticker infos
     */
    getAllStickerInfos() {
        return { ...this.config.STICKERS };
    }

    // --- Persistence ---

    /**
     * Save state to localStorage
     */
    save() {
        try {
            const progressData = {
                level: this.currentLevel,
                progress: this.progress,
                freePlayUnlocked: this.freePlayUnlocked
            };
            localStorage.setItem(
                this.config.STORAGE.PROGRESS,
                JSON.stringify(progressData)
            );
            localStorage.setItem(
                this.config.STORAGE.STICKERS,
                JSON.stringify(this.stickers)
            );
        } catch (e) {
            // Silently fail if localStorage unavailable
        }
    }


    /**
     * Check if free play mode is unlocked
     * @returns {boolean}
     */
    isFreePlayUnlocked() {
        return this.freePlayUnlocked;
    }

    /**
     * Unlock free play mode
     */
    unlockFreePlay() {
        this.freePlayUnlocked = true;
        this.save();
    }

    /**
     * Enter free play mode
     * @returns {boolean} Success status
     */
    enterFreePlay() {
        if (!this.freePlayUnlocked) {
            return false;
        }
        this.isFreeMode = true;
        if (this.callbacks.onFreeModeChange) {
            this.callbacks.onFreeModeChange(true);
        }
        return true;
    }

    /**
     * Exit free play mode
     */
    exitFreePlay() {
        this.isFreeMode = false;
        if (this.callbacks.onFreeModeChange) {
            this.callbacks.onFreeModeChange(false);
        }
    }

    /**
     * Check if currently in free play mode
     * @returns {boolean}
     */
    isInFreeMode() {
        return this.isFreeMode;
    }

    /**
     * Set callback for free mode changes
     * @param {Function} callback - Callback(isFreeMode)
     */
    onFreeModeChange(callback) {
        this.callbacks.onFreeModeChange = callback;
    }

    /**
     * Load state from localStorage
     */
    load() {
        try {
            const progressStr = localStorage.getItem(this.config.STORAGE.PROGRESS);
            const stickersStr = localStorage.getItem(this.config.STORAGE.STICKERS);

            if (progressStr) {
                const progressData = JSON.parse(progressStr);
                this.currentLevel = progressData.level || 1;
                this.progress = progressData.progress || 0;
                this.freePlayUnlocked = progressData.freePlayUnlocked || false;
            }

            if (stickersStr) {
                this.stickers = JSON.parse(stickersStr) || [];
            }
        } catch (e) {
            // Reset to defaults on error
            this.currentLevel = 1;
            this.progress = 0;
            this.stickers = [];
            this.freePlayUnlocked = false;
        }
    }

    /**
     * Reset all progress
     */
    reset() {
        this.currentLevel = 1;
        this.progress = 0;
        this.stickers = [];

        try {
            localStorage.removeItem(this.config.STORAGE.PROGRESS);
            localStorage.removeItem(this.config.STORAGE.STICKERS);
        } catch (e) {
            // Silently fail
        }
    }

    // --- Event Callbacks ---

    /**
     * Set callback for level change
     * @param {Function} callback - Callback function(level, config)
     */
    onLevelChange(callback) {
        this.callbacks.onLevelChange = callback;
    }

    /**
     * Set callback for progress change
     * @param {Function} callback - Callback function(progress, goal)
     */
    onProgressChange(callback) {
        this.callbacks.onProgressChange = callback;
    }

    /**
     * Set callback for sticker collection
     * @param {Function} callback - Callback function(stickerId, stickerInfo)
     */
    onStickerCollected(callback) {
        this.callbacks.onStickerCollected = callback;
    }

    /**
     * Set callback for level completion
     * @param {Function} callback - Callback function(level, config)
     */
    onLevelComplete(callback) {
        this.callbacks.onLevelComplete = callback;
    }

    /**
     * Clean up resources
     */
    destroy() {
        this.callbacks = {
            onLevelChange: null,
            onProgressChange: null,
            onStickerCollected: null,
            onLevelComplete: null
        };
    }
}

export default LevelManager;
