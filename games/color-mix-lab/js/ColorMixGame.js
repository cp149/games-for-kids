/**
 * ColorMixGame - Main game controller
 * Coordinates UI, drag interactions, and game logic
 */

class ColorMixGame {
    constructor(containerId, i18nInstance = null) {
        // Initialize i18n
        this.i18n = i18nInstance || (typeof getI18n === 'function' ? getI18n() : null) || this.createDefaultI18n();

        // Initialize managers with i18n
        this.ui = new UIManager(containerId, this.i18n);
        this.drag = new DragManager({
            onDragStart: (element, data) => this.onDragStart(element, data),
            onDragMove: (element, data) => this.onDragMove(element, data),
            onDragEnd: (element, data) => this.onDragEnd(element, data)
        });

        // Game state
        this.state = {
            currentLevel: 1,
            mixingSlots: [],
            progress: 0,
            stickers: []
        };

        // Initialize game
        this.init();
    }

    /**
     * Create default i18n instance with translations
     * @returns {Object} i18n instance
     */
    createDefaultI18n() {
        // Try to use global I18n class with TRANSLATIONS
        if (typeof I18n !== 'undefined' && typeof TRANSLATIONS !== 'undefined') {
            return new I18n(TRANSLATIONS, 'en');
        }
        // Fallback for environments without i18n
        return {
            t: (key, params = {}) => {
                const fallback = {
                    welcome: 'Welcome to Color Mix Lab!',
                    slot_label: 'Slot {0}'
                };
                let text = fallback[key] || key;
                Object.keys(params).forEach(param => {
                    text = text.replace(`{${param}}`, params[param]);
                });
                return text;
            }
        };
    }

    /**
     * Initialize game
     */
    init() {
        // Load saved progress
        this.loadProgress();

        // Setup level
        this.setupLevel(this.state.currentLevel);

        // Setup event listeners
        this.setupEventListeners();

        // Show welcome message
        this.ui.showToast(this.i18n.t('welcome') + ' 🦎', 'info');
    }

    /**
     * Setup level configuration
     * @param {number} level - Level number
     */
    setupLevel(level) {
        const config = CONFIG.LEVELS[level];
        if (!config) {
            // Safe logging - use warn instead of error
            if (typeof console !== 'undefined' && console.warn) {
                try { console.warn('[ColorMixGame]', this.i18n.t('level_not_found')); } catch { /* ignore */ }
            }
            return;
        }

        // Update UI
        this.ui.updateLevel(level);

        // Create mixing slots
        const slots = this.ui.createMixingSlots(config.slots);
        this.state.mixingSlots = slots.map(() => null);

        // Add color balls
        this.ui.getElement('colorPalette').innerHTML = '';
        config.availableColors.forEach(color => {
            const ball = this.ui.addColorBall(color);
            this.drag.enableDrag(ball, { color });
        });

        // Set goal
        const goal = config.goal;
        this.ui.updateGoal(0, goal.count);

        // Set chameleon target based on level goal
        let targetColor = '#D4C5B9'; // Default gray
        if (goal.type === 'secondary' && goal.color) {
            targetColor = CONFIG.COLORS.SECONDARY[goal.color];
        } else if (goal.type === 'effect' && goal.color) {
            targetColor = CONFIG.COLORS.SPECIAL[goal.color];
        } else if (goal.type === 'multiple' && goal.colors && goal.colors[0]) {
            targetColor = CONFIG.COLORS.SECONDARY[goal.colors[0]];
        }
        this.ui.setChameleonTarget(targetColor);
        this.ui.setChameleonColor('#D4C5B9'); // Default gray

        // Store current goal for validation
        this.state.currentGoal = goal;

        // Reset progress
        this.state.progress = 0;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Clear button
        const clearBtn = this.ui.getElement('clearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearSlots());
        }

        // Settings button
        const settingsBtn = this.ui.getElement('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.ui.showToast(this.i18n.t('settings_coming') + ' ⚙️', 'info');
            });
        }

        // Sticker book button
        const stickerBtn = this.ui.getElement('stickerBtn');
        if (stickerBtn) {
            stickerBtn.addEventListener('click', () => {
                this.ui.showToast(this.i18n.t('sticker_coming') + ' 📒', 'info');
            });
        }
    }

    /**
     * Handle drag start
     * @param {HTMLElement} element - Dragged element
     * @param {Object} data - Drag data
     */
    onDragStart(element, data) {
        // Visual feedback
        element.style.cursor = 'grabbing';
    }

    /**
     * Handle drag move
     * @param {HTMLElement} element - Dragged element
     * @param {Object} data - Drag data with coordinates and drop target
     */
    onDragMove(element, data) {
        // Cache slots on first drag
        if (!this._cachedSlots) {
            this._cachedSlots = Array.from(document.querySelectorAll('.mixing-slot'));
            this._cachedRects = this._cachedSlots.map(slot => {
                const rect = slot.getBoundingClientRect();
                return {
                    slot,
                    centerX: rect.left + rect.width / 2,
                    centerY: rect.top + rect.height / 2
                };
            });
        }

        // Batch DOM updates
        const snapDist = CONFIG.DRAG.SNAP_DISTANCE;
        this._cachedRects.forEach(({ slot, centerX, centerY }) => {
            const distance = Math.hypot(data.x - centerX, data.y - centerY);
            const shouldHighlight = distance < snapDist;
            const isHighlighted = slot.classList.contains('drag-over');

            if (shouldHighlight !== isHighlighted) {
                slot.classList.toggle('drag-over', shouldHighlight);
            }
        });
    }

    /**
     * Handle drag end
     * @param {HTMLElement} element - Dragged element
     * @param {Object} data - Drag data with drop target
     */
    onDragEnd(element, data) {
        // Remove cursor style
        element.style.cursor = '';

        // Clear cache for next drag
        this._cachedSlots = null;
        this._cachedRects = null;

        // Remove all drag-over highlights (batch update)
        if (this._cachedSlots) {
            this._cachedSlots.forEach(slot => slot.classList.remove('drag-over'));
        } else {
            document.querySelectorAll('.mixing-slot').forEach(slot => {
                slot.classList.remove('drag-over');
            });
        }

        // Check if dropped on valid target
        if (data.dropTarget && data.dropTarget.classList.contains('mixing-slot')) {
            const slotIndex = parseInt(data.dropTarget.dataset.slotIndex);

            // Check if slot is empty
            if (!this.state.mixingSlots[slotIndex]) {
                this.fillSlot(slotIndex, data.data.color);
                return true;
            } else {
                this.ui.showToast(this.i18n.t('slot_full'), 'info');
            }
        }

        return false;
    }

    /**
     * Fill mixing slot with color
     * @param {number} slotIndex - Slot index
     * @param {string} color - Color name
     */
    fillSlot(slotIndex, color) {
        // Update state
        this.state.mixingSlots[slotIndex] = color;

        // Update UI
        const slot = this.ui.getElement('mixingSlots').children[slotIndex * 2]; // Account for plus signs
        slot.classList.remove('empty');
        slot.classList.add('filled');
        slot.style.setProperty('--filled-color', CONFIG.COLORS.PRIMARY[color]);

        // Add color ball to slot
        const ball = document.createElement('div');
        ball.className = `color-ball ${color}`;
        ball.style.cursor = 'default';
        slot.innerHTML = '';
        slot.appendChild(ball);

        // Update clear button
        this.updateClearButton();

        // Check if all slots filled
        if (this.state.mixingSlots.every(slot => slot !== null)) {
            this.mixColors();
        }
    }

    /**
     * Clear all mixing slots
     */
    clearSlots() {
        // Reset state
        this.state.mixingSlots = this.state.mixingSlots.map(() => null);

        // Update UI
        const slots = this.ui.getElement('mixingSlots').querySelectorAll('.mixing-slot');
        slots.forEach((slot, index) => {
            slot.classList.remove('filled');
            slot.classList.add('empty');
            slot.innerHTML = '';
            slot.dataset.label = this.i18n.t('slot_label', { '0': index + 1 });
        });

        // Update clear button
        this.updateClearButton();

        // Reset chameleon
        this.ui.setChameleonColor('#D4C5B9');
    }

    /**
     * Update clear button state
     */
    updateClearButton() {
        const clearBtn = this.ui.getElement('clearBtn');
        const hasColors = this.state.mixingSlots.some(slot => slot !== null);
        clearBtn.disabled = !hasColors;
    }

    /**
     * Mix colors in slots
     */
    mixColors() {
        const colors = this.state.mixingSlots.filter(c => c);
        if (colors.length < 2) return;

        // Get mixing result
        const mixKey = colors.join('+');
        const rule = CONFIG.MIXING_RULES[mixKey];

        // Get mix zone center for effects
        const mixingZone = document.querySelector('.mixing-zone');
        const rect = mixingZone ? mixingZone.getBoundingClientRect() : { left: 0, top: 0, width: 0, height: 0 };
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        if (rule) {
            const resultColor = rule.type === 'secondary'
                ? CONFIG.COLORS.SECONDARY[rule.result]
                : CONFIG.COLORS.SPECIAL[rule.result];

            // Update chameleon
            this.ui.setChameleonColor(resultColor);
            this.ui.setChameleonMood('happy');

            // Show splash text effect
            this.ui.showSplashText(rule.result, resultColor);

            // Check if this matches the current goal
            const goal = this.state.currentGoal;
            let matchesGoal = false;

            if (goal.type === 'secondary' && rule.type === 'secondary' && rule.result === goal.color) {
                matchesGoal = true;
            } else if (goal.type === 'effect' && rule.type === 'effect' && rule.result === goal.color) {
                matchesGoal = true;
            } else if (goal.type === 'multiple' && rule.type === 'secondary' && goal.colors.includes(rule.result)) {
                matchesGoal = true;
            } else if (goal.type === 'discover' || goal.type === 'feed') {
                matchesGoal = true; // Any valid mix counts
            }

            // Show feedback
            if (matchesGoal) {
                const colorKey = 'color_' + rule.result;
                this.ui.showToast(this.i18n.t(colorKey) + '! 🎨', 'success');
                this.state.progress++;
                this.ui.updateGoal(this.state.progress, goal.count);

                // Check level complete
                if (this.state.progress >= goal.count) {
                    this.ui.showLevelComplete();
                }
            } else if (rule.type === 'secondary') {
                this.ui.showToast(this.i18n.t('mixed_color', { '0': rule.result }) + ' 🎨', 'info');
            } else {
                const colorKey = 'color_' + rule.result;
                this.ui.showToast(this.i18n.t(colorKey) + '! ✨', 'info');
            }
        } else {
            // Mud!
            this.ui.setChameleonColor(CONFIG.COLORS.SPECIAL.mud);
            this.ui.setChameleonMood('sad');
            this.ui.showMudSplat(centerX, centerY);
            this.ui.showToast(this.i18n.t('mud_message') + ' 💩', 'mud');
        }

        // Auto-clear after delay
        setTimeout(() => {
            this.clearSlots();
        }, 2000);
    }

    /**
     * Load saved progress
     */
    loadProgress() {
        try {
            const saved = localStorage.getItem(CONFIG.STORAGE.PROGRESS);
            if (saved) {
                const data = JSON.parse(saved);
                this.state.currentLevel = data.level || 1;
            }
        } catch {
            // Silent failure - localStorage may be unavailable or data corrupt
            this.state.currentLevel = 1;
        }
    }

    /**
     * Save progress
     */
    saveProgress() {
        try {
            localStorage.setItem(CONFIG.STORAGE.PROGRESS, JSON.stringify({
                level: this.state.currentLevel,
                timestamp: Date.now()
            }));
        } catch {
            // Silent failure - localStorage may be unavailable or quota exceeded
        }
    }

    /**
     * Clean up resources safely
     * Handles null checks and prevents double-destroy errors
     */
    destroy() {
        // Clear cached elements first
        this._cachedSlots = null;
        this._cachedRects = null;

        // Destroy drag manager with null check
        if (this.drag && typeof this.drag.destroy === 'function') {
            try {
                this.drag.destroy();
            } catch {
                // Silent failure - drag manager may already be destroyed
            }
        }
        this.drag = null;

        // Destroy UI manager with null check
        if (this.ui && typeof this.ui.destroy === 'function') {
            try {
                this.ui.destroy();
            } catch {
                // Silent failure - UI manager may already be destroyed
            }
        }
        this.ui = null;

        // Clear remaining references
        this.i18n = null;
        this.state = null;
    }
}

// Export for Node.js tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ColorMixGame;
}

// Export for browser
if (typeof window !== 'undefined') {
    window.ColorMixGame = ColorMixGame;
}
