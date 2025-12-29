/**
 * UIManager - Dynamic DOM creation and UI state management
 * Creates all game UI elements using CSS classes from styles.css
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
        this.build();
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
     * Build entire game UI structure
     */
    build() {
        this.container.className = 'game-container';
        this.container.innerHTML = '';

        // Main structure
        const header = this.buildHeader();
        const gameArea = this.buildGameArea();

        this.container.appendChild(header);
        this.container.appendChild(gameArea);
    }

    /**
     * Build header section
     */
    buildHeader() {
        const header = document.createElement('div');
        header.className = 'game-header';

        // Game title
        const title = document.createElement('h1');
        title.className = 'game-title';
        title.textContent = '🦎 ' + this.t('game_title');
        this.elements.title = title;

        // Level info
        const levelInfo = document.createElement('div');
        levelInfo.className = 'level-info';
        levelInfo.textContent = this.t('level', { '0': 1 });
        this.elements.levelInfo = levelInfo;

        // Settings button
        const settingsBtn = document.createElement('button');
        settingsBtn.className = 'settings-btn';
        settingsBtn.innerHTML = '⚙️';
        settingsBtn.setAttribute('aria-label', this.t('settings'));
        this.elements.settingsBtn = settingsBtn;

        header.appendChild(title);
        header.appendChild(levelInfo);
        header.appendChild(settingsBtn);

        return header;
    }

    /**
     * Build main game area with three panels
     */
    buildGameArea() {
        const gameArea = document.createElement('div');
        gameArea.className = 'game-area';

        const colorPalette = this.buildColorPalette();
        const mixingZone = this.buildMixingZone();
        const chameleonPanel = this.buildChameleonPanel();

        gameArea.appendChild(colorPalette);
        gameArea.appendChild(mixingZone);
        gameArea.appendChild(chameleonPanel);

        return gameArea;
    }

    /**
     * Build color palette (left panel)
     */
    buildColorPalette() {
        const palette = document.createElement('div');
        palette.className = 'color-palette';
        this.elements.colorPalette = palette;
        return palette;
    }

    /**
     * Build mixing zone (center panel)
     */
    buildMixingZone() {
        const zone = document.createElement('div');
        zone.className = 'mixing-zone';

        // Mixing slots container
        const slotsContainer = document.createElement('div');
        slotsContainer.className = 'mixing-slots';
        this.elements.mixingSlots = slotsContainer;

        // Clear button
        const clearBtn = document.createElement('button');
        clearBtn.className = 'clear-btn';
        clearBtn.textContent = this.t('clear');
        clearBtn.disabled = true;
        clearBtn.setAttribute('aria-label', this.t('clear'));
        this.elements.clearBtn = clearBtn;

        zone.appendChild(slotsContainer);
        zone.appendChild(clearBtn);

        return zone;
    }

    /**
     * Build chameleon panel (right panel)
     */
    buildChameleonPanel() {
        const panel = document.createElement('div');
        panel.className = 'chameleon-panel';

        // Chameleon container with target thought bubble
        const chameleonContainer = document.createElement('div');
        chameleonContainer.className = 'chameleon-container';

        // Target thought bubble
        const target = document.createElement('div');
        target.className = 'chameleon-target';
        const targetColor = document.createElement('div');
        targetColor.className = 'target-color';
        target.appendChild(targetColor);
        this.elements.chameleonTarget = targetColor;

        // Chameleon
        const chameleon = document.createElement('div');
        chameleon.className = 'chameleon';
        chameleon.innerHTML = '🦎';
        chameleon.setAttribute('aria-label', this.t('chameleon_label'));
        this.elements.chameleon = chameleon;

        chameleonContainer.appendChild(target);
        chameleonContainer.appendChild(chameleon);

        // Goal display
        const goalDisplay = this.buildGoalDisplay();

        // Sticker book button
        const stickerBtn = document.createElement('button');
        stickerBtn.className = 'sticker-book-btn';
        stickerBtn.innerHTML = '📒';
        stickerBtn.setAttribute('aria-label', this.t('sticker_book'));
        this.elements.stickerBtn = stickerBtn;

        panel.appendChild(chameleonContainer);
        panel.appendChild(goalDisplay);
        panel.appendChild(stickerBtn);

        return panel;
    }

    /**
     * Build goal display
     */
    buildGoalDisplay() {
        const display = document.createElement('div');
        display.className = 'goal-display';

        const label = document.createElement('div');
        label.className = 'label';
        label.textContent = this.t('goal');

        const count = document.createElement('span');
        count.className = 'count';
        count.textContent = this.t('goal_progress', { '0': 0, '1': 3 });
        this.elements.goalCount = count;

        display.appendChild(label);
        display.appendChild(count);

        return display;
    }

    /**
     * Add color ball to palette
     * @param {string} color - Color name (red, blue, yellow)
     */
    addColorBall(color) {
        const ball = document.createElement('div');
        ball.className = `color-ball ${color}`;
        ball.dataset.color = color;
        ball.setAttribute('role', 'button');
        ball.setAttribute('aria-label', this.t('color_ball_label', { '0': color }));
        ball.setAttribute('tabindex', '0');

        // Add shape indicator for accessibility
        const shapes = { red: '●', blue: '■', yellow: '▲' };
        ball.setAttribute('data-shape', shapes[color] || '●');

        this.elements.colorPalette.appendChild(ball);
        return ball;
    }

    /**
     * Create mixing slots
     * @param {number} count - Number of slots to create
     */
    createMixingSlots(count) {
        this.elements.mixingSlots.innerHTML = '';
        const slots = [];

        for (let i = 0; i < count; i++) {
            // Add plus sign between slots
            if (i > 0) {
                const plus = document.createElement('div');
                plus.className = 'plus-sign';
                plus.textContent = this.t('plus_sign');
                plus.setAttribute('aria-hidden', 'true');
                this.elements.mixingSlots.appendChild(plus);
            }

            const slot = document.createElement('div');
            slot.className = 'mixing-slot empty';
            slot.dataset.slotIndex = i;
            slot.dataset.label = this.t('slot_label', { '0': i + 1 });
            slot.setAttribute('role', 'button');
            slot.setAttribute('aria-label', this.t('mixing_slot_label', { '0': i + 1 }));
            slot.setAttribute('tabindex', '0');

            this.elements.mixingSlots.appendChild(slot);
            slots.push(slot);
        }

        return slots;
    }

    /**
     * Update level display
     * @param {number} level - Current level
     */
    updateLevel(level) {
        this.elements.levelInfo.textContent = this.t('level', { '0': level });
    }

    /**
     * Update goal display
     * @param {number} current - Current progress
     * @param {number} total - Total goal
     */
    updateGoal(current, total) {
        this.elements.goalCount.textContent = this.t('goal_progress', { '0': current, '1': total });

        // Celebrate animation when goal reached
        if (current >= total) {
            this.elements.goalCount.style.color = 'var(--text-success)';
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
     * Set chameleon color
     * @param {string} color - Color hex code
     */
    setChameleonColor(color) {
        this.elements.chameleon.style.setProperty('--chameleon-color', color);
    }

    /**
     * Set chameleon target color
     * @param {string} color - Color hex code
     */
    setChameleonTarget(color) {
        this.elements.chameleonTarget.style.setProperty('--target-color', color);
    }

    /**
     * Set chameleon mood animation
     * @param {string} mood - Mood type (happy, sad, confused)
     */
    setChameleonMood(mood) {
        this.elements.chameleon.classList.remove('celebrating', 'disgust');

        if (mood === 'happy') {
            this.elements.chameleon.classList.add('celebrating');
            setTimeout(() => {
                this.elements.chameleon.classList.remove('celebrating');
            }, CONFIG.UI.CELEBRATION_DURATION);
        } else if (mood === 'sad') {
            this.elements.chameleon.classList.add('disgust');
            setTimeout(() => {
                this.elements.chameleon.classList.remove('disgust');
            }, 800);
        }
    }

    /**
     * Show splash text effect for successful mix
     * @param {string} colorName - Name of mixed color
     * @param {string} colorHex - Hex color code
     */
    showSplashText(colorName, colorHex) {
        // Remove existing splash
        const existing = document.querySelector('.splash-text');
        if (existing) existing.remove();

        const splash = document.createElement('div');
        splash.className = 'splash-text';
        splash.textContent = colorName.toUpperCase() + '!';
        splash.style.color = colorHex;
        splash.style.textShadow = `
            0 0 20px ${colorHex},
            0 0 40px ${colorHex},
            3px 3px 0 white,
            -3px -3px 0 white
        `;
        document.body.appendChild(splash);

        // Remove after animation
        setTimeout(() => splash.remove(), 1200);
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
        setTimeout(() => splat.remove(), 2000);
    }

    /**
     * Show rainbow glow effect for level complete
     */
    showLevelComplete() {
        this.container.classList.add('level-complete');
        setTimeout(() => {
            this.container.classList.remove('level-complete');
        }, 3000);
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

        // Remove all toasts
        if (typeof document !== 'undefined') {
            document.querySelectorAll('.toast').forEach(toast => toast.remove());
        }

        // Clear container
        if (this.container) {
            this.container.innerHTML = '';
            this.container = null;
        }
        this.elements = null;
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
