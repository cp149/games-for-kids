/**
 * UIManager - User Interface Manager
 * Handles all UI updates, animations, and DOM manipulation
 */

class UIManager {
    constructor(game) {
        this.game = game;
        this.elements = {};
        this.particles = new ParticleSystem();
        this.currentTime = 0; // Track current time for RAF optimization
        this.init();
    }

    /**
     * Initialize UI manager
     */
    init() {
        // Cache DOM elements
        this.elements.levelDisplay = document.getElementById('level-display');
        this.elements.playerMoves = document.getElementById('player-moves');
        this.elements.playerTime = document.getElementById('player-time');
        this.elements.aiStatus = document.getElementById('ai-status');
        this.elements.aiProgress = document.getElementById('ai-progress');
        this.elements.announcements = document.getElementById('game-announcements');

        // Add animation classes to interactive elements
        this.setupAnimations();
    }

    /**
     * Setup animations for interactive elements
     */
    setupAnimations() {
        // Add hover effects to buttons
        document.querySelectorAll('.control-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.classList.add('pulse');
            });
            btn.addEventListener('mouseleave', () => {
                btn.classList.remove('pulse');
            });
        });

        // Add click feedback
        document.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.add('pop');
                setTimeout(() => btn.classList.remove('pop'), 300);
            });
        });
    }

    /**
     * Update level display with animation
     * @param {number} level - Level number
     */
    updateLevel(level) {
        this.elements.levelDisplay.textContent = I18N.t('level', { level });
        this.elements.levelDisplay.classList.add('zoom-in');
        setTimeout(() => this.elements.levelDisplay.classList.remove('zoom-in'), 400);
    }

    /**
     * Update player moves count
     * @param {number} moves - Number of moves
     */
    updatePlayerMoves(moves) {
        const prev = parseInt(this.elements.playerMoves.textContent) || 0;
        this.elements.playerMoves.textContent = moves;

        // Animate on change
        if (moves > prev) {
            this.elements.playerMoves.classList.add('bounce');
            setTimeout(() => this.elements.playerMoves.classList.remove('bounce'), 1000);
        }
    }

    /**
     * Update player time
     * @param {number} seconds - Elapsed seconds
     */
    updatePlayerTime(seconds) {
        this.currentTime = seconds;
        this.elements.playerTime.textContent = `${seconds}s`;
    }

    /**
     * Update AI status
     * @param {string} status - Status key for i18n
     */
    updateAIStatus(status) {
        this.elements.aiStatus.textContent = I18N.t(status);

        // Add visual feedback
        this.elements.aiStatus.classList.add('fade-in');
        setTimeout(() => this.elements.aiStatus.classList.remove('fade-in'), 500);
    }

    /**
     * Update AI progress bar
     * @param {number} percent - Progress percentage (0-100)
     */
    updateAIProgress(percent) {
        this.elements.aiProgress.style.width = `${Math.min(100, Math.max(0, percent))}%`;

        // Pulse at milestones
        if (percent === 25 || percent === 50 || percent === 75) {
            this.elements.aiProgress.classList.add('pulse');
            setTimeout(() => this.elements.aiProgress.classList.remove('pulse'), 500);
        }
    }

    /**
     * Show victory celebration
     */
    showVictory() {
        // Confetti explosion
        this.particles.createConfetti(window.innerWidth / 2, 100, 50);

        // Show toast
        this.particles.showToast(I18N.t('you_win'), 'success', 2000);

        // Sparkle effect on stars
        setTimeout(() => {
            const starsEl = document.getElementById('result-stars');
            if (starsEl) {
                this.particles.createSparkles(starsEl);
            }
        }, 500);
    }

    /**
     * Show defeat animation
     */
    showDefeat() {
        this.particles.showToast(I18N.t('ai_wins'), 'error', 2000);

        // Shake player panel
        const playerPanel = document.querySelector('.player-panel');
        if (playerPanel) {
            playerPanel.classList.add('shake');
            setTimeout(() => playerPanel.classList.remove('shake'), 500);
        }
    }

    /**
     * Show toast notification
     * @param {string} message - Message to display
     * @param {string} type - Type: success, error, info
     */
    showToast(message, type = 'info') {
        this.particles.showToast(message, type, 2000);
    }

    /**
     * Create ripple effect at position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {string} color - Ripple color
     */
    createRipple(x, y, color) {
        this.particles.createRipple(x, y, color);
    }

    /**
     * Create particle burst
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {string} color - Particle color
     */
    createBurst(x, y, color) {
        this.particles.createBurst(x, y, color, 12);
    }

    /**
     * Animate countdown number
     * @param {number} number - Countdown number
     */
    animateCountdown(number) {
        const overlay = document.getElementById('countdown-overlay');
        const text = overlay.querySelector('.countdown-text');

        text.classList.remove('countdown-pop');
        void text.offsetWidth; // Trigger reflow
        text.classList.add('countdown-pop');
    }

    /**
     * Show loading spinner
     * @param {boolean} show - Show or hide spinner
     */
    showLoading(show = true) {
        let spinner = document.getElementById('loading-spinner');

        if (show && !spinner) {
            spinner = document.createElement('div');
            spinner.id = 'loading-spinner';
            spinner.className = 'spinner';
            spinner.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 9999;
            `;
            document.body.appendChild(spinner);
        } else if (!show && spinner) {
            spinner.remove();
        }
    }

    /**
     * Announce message to screen readers
     * @param {string} message - Message to announce
     * @param {string} priority - 'polite' or 'assertive'
     */
    announce(message, priority = 'polite') {
        if (!this.elements.announcements) return;

        // Clear previous announcement
        this.elements.announcements.textContent = '';

        // Set priority
        this.elements.announcements.setAttribute('aria-live', priority);

        // Announce with slight delay for screen reader pickup
        setTimeout(() => {
            this.elements.announcements.textContent = message;
        }, 100);
    }

    /**
     * Cleanup resources
     */
    destroy() {
        this.particles.destroy();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}
