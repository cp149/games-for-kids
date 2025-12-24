/**
 * EffectsManager - Handles visual effects and animations
 * Manages floating scores, combos, star bursts, and confetti
 * Uses lib/particle-system.js for common effects
 */

class EffectsManager {
    constructor(container) {
        this.container = container;
        this.timers = new Set(); // Track all timers for cleanup
        this._boardElement = null; // Cached board element for performance

        // Use shared ParticleSystem from lib
        this.particles = new ParticleSystem(container);
    }

    /**
     * Get cached board element (lazy loading)
     * Avoids repeated getElementById calls in high-frequency scenarios
     * @returns {HTMLElement|null}
     */
    getBoardElement() {
        if (!this._boardElement || !this._boardElement.parentNode) {
            this._boardElement = document.getElementById('game-board');
        }
        return this._boardElement;
    }

    /**
     * Safe setTimeout with cleanup tracking
     * @param {Function} callback - Function to execute
     * @param {number} delay - Delay in milliseconds
     * @returns {number} Timer ID
     */
    safeSetTimeout(callback, delay) {
        const timerId = setTimeout(() => {
            this.timers.delete(timerId);
            callback();
        }, delay);
        this.timers.add(timerId);
        return timerId;
    }

    /**
     * Show floating score animation at position
     * @param {number} points - Points to display
     * @param {number} x - X position relative to board
     * @param {number} y - Y position relative to board
     */
    showFloatingScore(points, x, y) {
        const floating = document.createElement('div');
        floating.className = 'floating-score';
        floating.textContent = `+${points}`;

        // Position relative to game board (use cached element)
        const board = this.getBoardElement();
        if (board) {
            floating.style.left = `${x}px`;
            floating.style.top = `${y}px`;
            board.appendChild(floating);

            // Remove after animation
            this.safeSetTimeout(() => {
                if (floating.parentNode) floating.remove();
            }, CONFIG.GAME.EFFECTS.FLOATING_SCORE_DURATION);
        }
    }

    /**
     * Show combo display for chain matches
     * @param {number} comboCount - Current combo count
     */
    showCombo(comboCount) {
        if (comboCount < 2) return;

        const combo = document.createElement('div');
        combo.className = 'combo-display';

        // Different text based on combo count
        if (comboCount >= 5) {
            combo.textContent = `Combo x${comboCount}!`;
            combo.style.color = '#FF4500';
        } else if (comboCount >= 3) {
            combo.textContent = `Combo x${comboCount}!`;
            combo.style.color = '#FFD700';
        } else {
            combo.textContent = `Combo x${comboCount}!`;
        }

        this.container.appendChild(combo);

        // Remove after animation
        this.safeSetTimeout(() => {
            if (combo.parentNode) combo.remove();
        }, CONFIG.GAME.EFFECTS.COMBO_DISPLAY_DURATION);
    }

    /**
     * Show star burst effect at position
     * Delegates to lib/particle-system.js
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} count - Number of stars
     */
    showStarBurst(x, y, count = 5) {
        // Use ParticleSystem's createBurst for star effect
        this.particles.createBurst(x, y, '#FFD700', count);
    }

    /**
     * Show confetti celebration effect
     * Delegates to lib/particle-system.js
     */
    showConfetti() {
        const count = CONFIG.GAME.EFFECTS.CONFETTI_COUNT;
        // Use ParticleSystem's createConfetti with game's count
        this.particles.createConfetti(window.innerWidth / 2, 100, count);
    }

    /**
     * Show toast notification
     * Delegates to lib/particle-system.js
     * @param {string} message - Message to display
     * @param {string} type - Toast type (info, success, warning, error)
     */
    showToast(message, type = 'info') {
        // Use ParticleSystem's showToast with game's duration
        const duration = CONFIG.GAME.TIMING.TOAST_DURATION || 2000;
        this.particles.showToast(message, type, duration);
    }

    /**
     * Clean up resources
     */
    destroy() {
        // Clear all pending timers
        this.timers.forEach(timerId => clearTimeout(timerId));
        this.timers.clear();

        // Destroy particle system
        if (this.particles) {
            this.particles.destroy();
        }

        // Remove any lingering effect elements
        if (this.container) {
            const effects = this.container.querySelectorAll(
                '.floating-score, .combo-display, .star-burst, .confetti, .toast'
            );
            effects.forEach(el => el.remove());
        }

        this.container = null;
        this._boardElement = null; // Clear cached board element
    }
}
