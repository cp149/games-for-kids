/**
 * ScoreManager - Advanced scoring system for games
 *
 * Features:
 * - Basic score tracking
 * - Star rating system (1-3 stars)
 * - Combo multipliers
 * - High score persistence (localStorage)
 * - Score events and callbacks
 *
 * @example
 * const score = new ScoreManager();
 * score.addPoints(10);
 * score.startCombo();
 * score.addPoints(20); // 40 points (2x multiplier)
 * console.log(score.getStars()); // 1-3 based on thresholds
 */
export class ScoreManager {
    /**
     * @param {Object} options - Configuration options
     * @param {number[]} options.starThresholds - Score thresholds for 1, 2, 3 stars [100, 250, 500]
     * @param {number} options.comboTimeout - Seconds before combo resets (default: 3)
     * @param {number} options.maxComboMultiplier - Maximum combo multiplier (default: 5)
     * @param {string} options.storageKey - localStorage key for high scores
     */
    constructor(options = {}) {
        this.score = 0;
        this.combo = 0;
        this.comboMultiplier = 1;
        this.comboTimer = null;

        // Configuration
        this.starThresholds = options.starThresholds || [100, 250, 500];
        this.comboTimeout = options.comboTimeout || 3; // seconds
        this.maxComboMultiplier = options.maxComboMultiplier || 5;
        this.storageKey = options.storageKey || 'game_highscore';

        // Event listeners
        this.listeners = {
            scoreChange: [],
            comboChange: [],
            newHighScore: []
        };

        // Load high score
        this.highScore = this.loadHighScore();
    }

    /**
     * Add points to score with optional combo multiplier
     * @param {number} points - Base points to add
     * @param {boolean} applyCombo - Whether to apply combo multiplier (default: true)
     * @fires scoreChange
     * @fires newHighScore
     */
    addPoints(points, applyCombo = true) {
        const multipliedPoints = applyCombo ? points * this.comboMultiplier : points;
        this.score += multipliedPoints;

        this.emit('scoreChange', this.score, multipliedPoints);

        // Check for new high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
            this.emit('newHighScore', this.highScore);
        }

        return multipliedPoints;
    }

    /**
     * Increment combo and update multiplier
     * @fires comboChange
     */
    increaseCombo() {
        this.combo++;
        this.comboMultiplier = Math.min(
            Math.floor(1 + this.combo / 3),
            this.maxComboMultiplier
        );

        this.resetComboTimer();
        this.emit('comboChange', this.combo, this.comboMultiplier);
    }

    /**
     * Reset combo to zero
     * @fires comboChange
     */
    resetCombo() {
        if (this.combo > 0) {
            this.combo = 0;
            this.comboMultiplier = 1;
            this.clearComboTimer();
            this.emit('comboChange', this.combo, this.comboMultiplier);
        }
    }

    /**
     * Reset combo timer (private)
     * @private
     */
    resetComboTimer() {
        this.clearComboTimer();
        this.comboTimer = setTimeout(() => {
            this.resetCombo();
        }, this.comboTimeout * 1000);
    }

    /**
     * Clear combo timer (private)
     * @private
     */
    clearComboTimer() {
        if (this.comboTimer) {
            clearTimeout(this.comboTimer);
            this.comboTimer = null;
        }
    }

    /**
     * Get current score
     * @returns {number} Current score
     */
    getScore() {
        return this.score;
    }

    /**
     * Get current combo count
     * @returns {number} Current combo
     */
    getCombo() {
        return this.combo;
    }

    /**
     * Get current combo multiplier
     * @returns {number} Current multiplier
     */
    getMultiplier() {
        return this.comboMultiplier;
    }

    /**
     * Get star rating based on current score
     * @returns {number} Stars (0-3)
     */
    getStars() {
        if (this.score >= this.starThresholds[2]) return 3;
        if (this.score >= this.starThresholds[1]) return 2;
        if (this.score >= this.starThresholds[0]) return 1;
        return 0;
    }

    /**
     * Get high score
     * @returns {number} High score
     */
    getHighScore() {
        return this.highScore;
    }

    /**
     * Reset current score (not high score)
     */
    reset() {
        this.score = 0;
        this.resetCombo();
        this.emit('scoreChange', this.score, 0);
    }

    /**
     * Reset high score (use with caution)
     */
    resetHighScore() {
        this.highScore = 0;
        this.saveHighScore();
    }

    /**
     * Save high score to localStorage
     * @private
     */
    saveHighScore() {
        try {
            localStorage.setItem(this.storageKey, this.highScore.toString());
        } catch (error) {
            console.warn('Failed to save high score:', error);
        }
    }

    /**
     * Load high score from localStorage
     * @private
     * @returns {number} Saved high score or 0
     */
    loadHighScore() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? parseInt(saved, 10) : 0;
        } catch (error) {
            console.warn('Failed to load high score:', error);
            return 0;
        }
    }

    /**
     * Register event listener
     * @param {string} event - Event name ('scoreChange', 'comboChange', 'newHighScore')
     * @param {Function} callback - Callback function
     * @example
     * score.on('scoreChange', (newScore, pointsAdded) => {
     *   console.log(`Score: ${newScore} (+${pointsAdded})`);
     * });
     */
    on(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].push(callback);
        }
    }

    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback to remove
     */
    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }

    /**
     * Emit event to all listeners
     * @private
     * @param {string} event - Event name
     * @param {...any} args - Arguments to pass to listeners
     */
    emit(event, ...args) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => {
                try {
                    callback(...args);
                } catch (error) {
                    console.error(`Error in ${event} listener:`, error);
                }
            });
        }
    }

    /**
     * Get score statistics
     * @returns {Object} Stats object with score, combo, multiplier, stars, highScore
     */
    getStats() {
        return {
            score: this.score,
            combo: this.combo,
            multiplier: this.comboMultiplier,
            stars: this.getStars(),
            highScore: this.highScore
        };
    }

    /**
     * Set star thresholds
     * @param {number[]} thresholds - Array of 3 thresholds [1star, 2star, 3star]
     */
    setStarThresholds(thresholds) {
        if (thresholds.length === 3) {
            this.starThresholds = thresholds;
        }
    }
}
