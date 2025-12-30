/**
 * UIManager - UI state management for existing DOM elements
 * Works with pre-built HTML structure from index.html
 * Juicy & Text-Free Edition - Icons only, minimal text
 */

class UIManager {
    constructor(containerId, i18n = null) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container element '${containerId}' not found`);
        }

        this.i18n = i18n || (typeof getI18n === 'function' ? getI18n() : null);
        this.elements = {};
        this.toastTimeout = null;
        this.init();
    }

    /**
     * Translate a key using i18n
     * @param {string} key - Translation key
     * @param {Object} params - Parameters for interpolation
     * @returns {string} Translated text or key
     */
    t(key, params = {}) {
        if (this.i18n) {
            return this.i18n.t(key, params);
        }
        return key;
    }

    /**
     * Initialize by querying existing DOM elements
     */
    init() {
        // Query existing elements from index.html
        this.elements = {
            // Header elements
            stickerBookBtn: this.container.querySelector('.sticker-book-btn'),
            settingsBtn: this.container.querySelector('.settings-btn'),
            soundBtn: this.container.querySelector('.sound-btn'),
            freePlayBtn: this.container.querySelector('.free-play-btn'),

            // Chameleon area
            chameleon: this.container.querySelector('.chameleon'),
            chameleonBody: this.container.querySelector('.chameleon-body'),
            thoughtBubble: this.container.querySelector('.thought-bubble'),
            goalColor: this.container.querySelector('.goal-color'),
            progressStars: this.container.querySelector('.progress-stars'),
            stars: this.container.querySelectorAll('.progress-stars .star'),

            // Mixing area
            bowl: this.container.querySelector('.bowl'),
            liquid: this.container.querySelector('.liquid'),
            particles: this.container.querySelector('.particles'),
            clearBtn: this.container.querySelector('.clear-btn'),

            // Palette area
            paletteArea: this.container.querySelector('.palette-area'),
            colorSources: this.container.querySelectorAll('.color-source')
        };

        // Set initial states
        if (this.elements.clearBtn) {
            this.elements.clearBtn.disabled = true;
        }
    }

    /**
     * Get color sources for drag setup
     * @returns {NodeList} Color source elements
     */
    getColorSources() {
        return this.elements.colorSources;
    }

    /**
     * Set available colors for current level
     * @param {string[]} availableColors - Array of color names (e.g., ['red', 'yellow'])
     */
    setAvailableColors(availableColors) {
        if (!this.elements.colorSources) return;

        this.elements.colorSources.forEach(source => {
            const color = source.dataset.color;
            if (availableColors.includes(color)) {
                source.classList.remove('hidden');
                source.setAttribute('aria-hidden', 'false');
                source.setAttribute('tabindex', '0');
            } else {
                source.classList.add('hidden');
                source.setAttribute('aria-hidden', 'true');
                source.setAttribute('tabindex', '-1');
            }
        });
    }

    /**
     * Get bowl element for drop target
     * @returns {HTMLElement} Bowl element
     */
    getBowl() {
        return this.elements.bowl;
    }

    /**
     * Update level display (using stars)
     * @param {number} level - Current level
     */
    updateLevel(level) {
        // Update aria label for accessibility
        if (this.elements.progressStars) {
            this.elements.progressStars.setAttribute('aria-label', this.t('level', { '0': level }));
        }
    }

    /**
     * Update goal display - Visual stars
     * @param {number} current - Current progress
     * @param {number} total - Total goal
     */
    updateGoal(current, total) {
        const stars = this.elements.stars;
        if (!stars || stars.length === 0) return;

        stars.forEach((star, index) => {
            if (index < current) {
                star.classList.add('filled');
                star.textContent = '⭐';
            } else {
                star.classList.remove('filled');
                star.textContent = '☆';
            }
        });

        if (this.elements.progressStars) {
            this.elements.progressStars.setAttribute('aria-label',
                this.t('goal_progress', { '0': current, '1': total }));
        }
    }

    /**
     * Set chameleon body color
     * @param {string} color - Color hex code
     */
    setChameleonColor(color) {
        if (this.elements.chameleonBody) {
            this.elements.chameleonBody.style.setProperty('--chameleon-color', color);
        }
        // Also set on parent chameleon for fallback
        if (this.elements.chameleon) {
            this.elements.chameleon.style.setProperty('--chameleon-color', color);
        }
    }

    /**
     * Set goal color in thought bubble
     * @param {string|null} color - Color hex code or null to hide
     */
    setChameleonTarget(color) {
        if (this.elements.goalColor) {
            if (color) {
                this.elements.goalColor.style.setProperty('--target-color', color);
                this.elements.goalColor.style.opacity = '1';
            } else {
                this.elements.goalColor.style.opacity = '0';
            }
        }
        if (this.elements.thoughtBubble) {
            if (color) {
                this.elements.thoughtBubble.style.setProperty('--target-color', color);
            }
        }
    }

    /**
     * Set chameleon mood animation
     * @param {string} mood - Mood type (happy, sad, confused)
     */
    setChameleonMood(mood) {
        const chameleon = this.elements.chameleon;
        if (!chameleon) return;

        chameleon.classList.remove('celebrating', 'disgust');

        if (mood === 'happy') {
            chameleon.classList.add('celebrating');
            setTimeout(() => {
                chameleon.classList.remove('celebrating');
            }, CONFIG.UI.CELEBRATION_DURATION);
        } else if (mood === 'sad') {
            chameleon.classList.add('disgust');
            setTimeout(() => {
                chameleon.classList.remove('disgust');
            }, 800);
        }
    }

    /**
     * Update bowl liquid color
     * @param {string} color - Color hex code or null to clear
     */
    setBowlColor(color) {
        if (this.elements.liquid) {
            if (color) {
                this.elements.liquid.style.backgroundColor = color;
                this.elements.liquid.style.opacity = '1';
            } else {
                this.elements.liquid.style.backgroundColor = 'transparent';
                this.elements.liquid.style.opacity = '0';
            }
        }
    }

    /**
     * Add color to bowl (mixing animation)
     * @param {string} color - Color name
     */
    addColorToBowl(color) {
        const colorHex = CONFIG.COLORS.PRIMARY[color];
        if (!colorHex) return;

        // Create splash particle
        if (this.elements.particles) {
            const particle = document.createElement('div');
            particle.className = 'color-particle';
            particle.style.backgroundColor = colorHex;
            this.elements.particles.appendChild(particle);

            setTimeout(() => particle.remove(), 1000);
        }

        // Update clear button
        this.updateClearButton(true);
    }

    /**
     * Clear bowl
     */
    clearBowl() {
        this.setBowlColor(null);
        if (this.elements.particles) {
            this.elements.particles.innerHTML = '';
        }
        this.updateClearButton(false);
    }

    /**
     * Update clear button state
     * @param {boolean} hasColors - Whether bowl has colors
     */
    updateClearButton(hasColors) {
        if (this.elements.clearBtn) {
            this.elements.clearBtn.disabled = !hasColors;
        }
    }

    /**
     * Show toast notification
     * @param {string} message - Message to display
     * @param {string} type - Toast type (success, info, mud)
     */
    showToast(message, type = 'info') {
        // Cancel existing timeout
        if (this.toastTimeout) {
            clearTimeout(this.toastTimeout);
        }

        // Reuse existing toast if available
        let toast = document.querySelector('.toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.setAttribute('role', 'status');
            toast.setAttribute('aria-live', 'polite');
            document.body.appendChild(toast);
        }

        // Update content
        toast.className = `toast ${type}`;
        toast.textContent = message;

        // Auto-remove after duration
        this.toastTimeout = setTimeout(() => {
            toast.remove();
            this.toastTimeout = null;
        }, CONFIG.UI.TOAST_DURATION);
    }

    /**
     * Show splash icon effect for successful mix
     * @param {string} emoji - Emoji to display
     * @param {string} colorHex - Hex color code
     */
    showSplashIcon(emoji, colorHex) {
        // Remove existing splash
        const existing = document.querySelector('.splash-text');
        if (existing) existing.remove();

        const splash = document.createElement('div');
        splash.className = 'splash-text'; // Keep class for animation
        splash.textContent = emoji;
        splash.style.color = colorHex;
        splash.style.fontSize = '120px'; // Make it huge
        splash.style.textShadow = '0 10px 30px rgba(0,0,0,0.3)';
        document.body.appendChild(splash);

        // Sparkle particles
        this.createSparkles(window.innerWidth / 2, window.innerHeight / 2, colorHex);

        // Remove after animation
        setTimeout(() => splash.remove(), 1400);
    }

    /**
     * Create sparkle particles for success
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {string} color - Particle color
     */
    createSparkles(x, y, color) {
        const particleCount = 20;
        for (let i = 0; i < particleCount; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.left = x + 'px';
            sparkle.style.top = y + 'px';
            sparkle.style.background = color;

            // Random direction
            const angle = (Math.PI * 2 * i) / particleCount;
            const distance = 80 + Math.random() * 40;
            const targetX = x + Math.cos(angle) * distance;
            const targetY = y + Math.sin(angle) * distance;

            sparkle.style.setProperty('--target-x', targetX + 'px');
            sparkle.style.setProperty('--target-y', targetY + 'px');

            document.body.appendChild(sparkle);

            setTimeout(() => sparkle.remove(), 800);
        }
    }

    /**
     * Show mud splat overlay effect
     * @param {number} x - X coordinate of splat center
     * @param {number} y - Y coordinate of splat center
     */
    showMudSplat(x, y) {
        // Remove existing splat
        const existing = document.querySelector('.mud-splat-overlay');
        if (existing) existing.remove();

        const splat = document.createElement('div');
        splat.className = 'mud-splat-overlay';
        splat.style.setProperty('--splat-x', (x / window.innerWidth * 100) + '%');
        splat.style.setProperty('--splat-y', (y / window.innerHeight * 100) + '%');
        document.body.appendChild(splat);

        // Remove after animation
        setTimeout(() => splat.remove(), 2500);
    }

    /**
     * Show confetti for level complete
     */
    showLevelComplete() {
        this.container.classList.add('level-complete');

        // Create confetti particles
        const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#9944FF', '#44DD44'];
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.left = Math.random() * window.innerWidth + 'px';
            confetti.style.top = '-20px';
            confetti.style.setProperty('--confetti-color', colors[Math.floor(Math.random() * colors.length)]);
            confetti.style.animationDelay = (Math.random() * 0.5) + 's';
            document.body.appendChild(confetti);

            setTimeout(() => confetti.remove(), 2500);
        }

        setTimeout(() => {
            this.container.classList.remove('level-complete');
        }, 3000);
    }

    /**
     * Create sticker book modal
     * @private
     */
    createStickerBook() {
        if (this.stickerBookModal) return;

        // Create modal container
        this.stickerBookModal = document.createElement('div');
        this.stickerBookModal.className = 'sticker-book-modal';
        this.stickerBookModal.setAttribute('role', 'dialog');
        this.stickerBookModal.setAttribute('aria-label', this.t('sticker_book'));
        this.stickerBookModal.setAttribute('aria-modal', 'true');

        // Create modal content
        const content = document.createElement('div');
        content.className = 'sticker-book-content';

        // Header with close button
        const header = document.createElement('div');
        header.className = 'sticker-book-header';
        header.innerHTML = `
            <h2 class="sticker-book-title">📖 ${this.t('sticker_book')}</h2>
            <button class="sticker-book-close" aria-label="Close">&times;</button>
        `;

        // Stickers grid
        this.stickerGrid = document.createElement('div');
        this.stickerGrid.className = 'sticker-book-grid';

        content.appendChild(header);
        content.appendChild(this.stickerGrid);
        this.stickerBookModal.appendChild(content);

        // Add to container
        this.container.appendChild(this.stickerBookModal);

        // Close button event
        const closeBtn = header.querySelector('.sticker-book-close');
        closeBtn.addEventListener('click', () => this.hideStickerBook());

        // Close on backdrop click
        this.stickerBookModal.addEventListener('click', (e) => {
            if (e.target === this.stickerBookModal) {
                this.hideStickerBook();
            }
        });

        // Close on Escape key
        this.stickerBookKeyHandler = (e) => {
            if (e.key === 'Escape' && this.stickerBookModal.classList.contains('visible')) {
                this.hideStickerBook();
            }
        };
        document.addEventListener('keydown', this.stickerBookKeyHandler);
    }

    /**
     * Show sticker book modal
     * @param {string[]} earnedStickers - Array of earned sticker IDs
     * @param {Object} stickerConfig - Sticker configuration from CONFIG.STICKERS
     */
    showStickerBook(earnedStickers = [], stickerConfig = {}) {
        this.createStickerBook();

        // Clear and populate grid
        this.stickerGrid.innerHTML = '';

        // Get all sticker definitions
        const allStickers = Object.entries(stickerConfig);

        allStickers.forEach(([stickerId, info]) => {
            const isEarned = earnedStickers.includes(stickerId);
            const stickerItem = document.createElement('div');
            stickerItem.className = `sticker-item ${isEarned ? 'earned' : 'locked'}`;
            stickerItem.setAttribute('role', 'img');
            stickerItem.setAttribute('aria-label',
                isEarned ? `${info.name} sticker earned` : `${info.name} sticker locked`);

            if (isEarned) {
                stickerItem.innerHTML = `
                    <span class="sticker-emoji">${info.emoji}</span>
                    <span class="sticker-name">${info.name}</span>
                `;
            } else {
                stickerItem.innerHTML = `
                    <span class="sticker-emoji locked">🔒</span>
                    <span class="sticker-name">${this.t('level')} ${info.level}</span>
                `;
            }

            this.stickerGrid.appendChild(stickerItem);
        });

        // Show modal
        this.stickerBookModal.classList.add('visible');
        this.stickerBookModal.querySelector('.sticker-book-close').focus();
    }

    /**
     * Hide sticker book modal
     */
    hideStickerBook() {
        if (this.stickerBookModal) {
            this.stickerBookModal.classList.remove('visible');
        }
    }

    /**
     * Show/hide free play button
     * @param {boolean} show - Whether to show the button
     */
    showFreePlayButton(show) {
        if (this.elements.freePlayBtn) {
            if (show) {
                this.elements.freePlayBtn.classList.remove('hidden');
                this.elements.freePlayBtn.classList.add('unlocked');
            } else {
                this.elements.freePlayBtn.classList.add('hidden');
            }
        }
    }

    /**
     * Set free play mode UI state
     * @param {boolean} enabled - Whether free play is active
     */
    setFreePlayMode(enabled) {
        if (this.container) {
            this.container.classList.toggle('free-play-mode', enabled);
        }

        // Update free play button appearance
        if (this.elements.freePlayBtn) {
            this.elements.freePlayBtn.classList.toggle('active', enabled);
            const icon = this.elements.freePlayBtn.querySelector('.icon-free-play');
            if (icon) {
                icon.textContent = enabled ? '📚' : '🎨';
            }
        }

        // Hide thought bubble and stars in free play
        if (this.elements.thoughtBubble) {
            this.elements.thoughtBubble.classList.toggle('hidden', enabled);
        }
        if (this.elements.progressStars) {
            this.elements.progressStars.classList.toggle('hidden', enabled);
        }
    }

    /**
     * Get element reference
     * @param {string} name - Element name
     */
    getElement(name) {
        return this.elements[name];
    }

    /**
     * Clean up resources
     */
    destroy() {
        if (this.toastTimeout) {
            clearTimeout(this.toastTimeout);
            this.toastTimeout = null;
        }

        // Clean up sticker book
        if (this.stickerBookKeyHandler) {
            document.removeEventListener('keydown', this.stickerBookKeyHandler);
            this.stickerBookKeyHandler = null;
        }
        if (this.stickerBookModal && this.stickerBookModal.parentElement) {
            this.stickerBookModal.remove();
        }
        this.stickerBookModal = null;
        this.stickerGrid = null;

        // Remove all toasts and effects
        if (typeof document !== 'undefined') {
            document.querySelectorAll('.toast, .splash-text, .mud-splat-overlay, .sparkle, .confetti-piece').forEach(el => el.remove());
        }

        this.elements = null;
        this.container = null;
    }
}

// Export for Node.js tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}

// Export for browser
if (typeof window !== 'undefined') {
    window.UIManager = UIManager;
}
