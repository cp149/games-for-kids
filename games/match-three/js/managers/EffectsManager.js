/**
 * EffectsManager - Handles visual effects and animations
 * Manages floating scores, combos, star bursts, and confetti
 */

class EffectsManager {
    constructor(container) {
        this.container = container;
        this.timers = new Set(); // Track all timers for cleanup
        this._boardElement = null; // Cached board element for performance
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
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} count - Number of stars
     */
    showStarBurst(x, y, count = 5) {
        const board = this.getBoardElement();
        if (!board) return;

        const offset = CONFIG.GAME.EFFECTS.STAR_BURST_OFFSET;
        const duration = CONFIG.GAME.EFFECTS.STAR_BURST_DURATION;
        const stagger = CONFIG.GAME.EFFECTS.STAGGER_DELAY;

        for (let i = 0; i < count; i++) {
            this.safeSetTimeout(() => {
                // Check if board still exists (use cached element)
                if (!this.getBoardElement()) return;

                const star = document.createElement('div');
                star.className = 'star-burst';

                // Random offset from center
                const offsetX = (Math.random() - 0.5) * offset;
                const offsetY = (Math.random() - 0.5) * offset;

                star.style.left = `${x + offsetX}px`;
                star.style.top = `${y + offsetY}px`;

                board.appendChild(star);

                this.safeSetTimeout(() => {
                    if (star.parentNode) star.remove();
                }, duration);
            }, i * stagger);
        }
    }

    /**
     * Show confetti celebration effect
     */
    showConfetti() {
        const count = CONFIG.GAME.EFFECTS.CONFETTI_COUNT;
        const stagger = CONFIG.GAME.EFFECTS.STAGGER_DELAY;

        for (let i = 0; i < count; i++) {
            this.safeSetTimeout(() => {
                this.createConfetti();
            }, i * stagger);
        }
    }

    /**
     * Create single confetti piece
     */
    createConfetti() {
        // Check if container still exists
        if (!this.container || !this.container.parentNode) return;

        const confetti = document.createElement('div');
        confetti.className = 'confetti';

        // Random position
        confetti.style.left = `${Math.random() * 100}%`;

        // Random color from fruits
        const fruits = CONFIG.GEM.FRUITS;
        const randomColor = fruits[Math.floor(Math.random() * fruits.length)].color;
        confetti.style.backgroundColor = randomColor;

        // Random size
        const size = 8 + Math.random() * 8;
        confetti.style.width = `${size}px`;
        confetti.style.height = `${size}px`;

        // Random animation delay
        confetti.style.animationDelay = `${Math.random() * 0.5}s`;

        this.container.appendChild(confetti);

        this.safeSetTimeout(() => {
            if (confetti.parentNode) confetti.remove();
        }, CONFIG.GAME.EFFECTS.CONFETTI_DURATION);
    }

    /**
     * Show toast notification
     * @param {string} message - Message to display
     * @param {string} type - Toast type (info, success, warning, error)
     */
    showToast(message, type = 'info') {
        // Check if container still exists
        if (!this.container || !this.container.parentNode) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        this.container.appendChild(toast);

        this.safeSetTimeout(() => {
            if (toast.parentNode) toast.classList.add('show');
        }, CONFIG.GAME.EFFECTS.TOAST_SHOW_DELAY);

        this.safeSetTimeout(() => {
            if (toast.parentNode) {
                toast.classList.remove('show');
                this.safeSetTimeout(() => {
                    if (toast.parentNode) toast.remove();
                }, CONFIG.GAME.EFFECTS.TOAST_HIDE_TRANSITION);
            }
        }, CONFIG.GAME.TIMING.TOAST_DURATION);
    }

    /**
     * Clean up resources
     */
    destroy() {
        // Clear all pending timers
        this.timers.forEach(timerId => clearTimeout(timerId));
        this.timers.clear();

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
