/**
 * UIManager - UI state management for existing DOM elements
 * Works with pre-built HTML structure from index.html
 * Juicy & Text-Free Edition - Icons only, minimal text
 */

import { CONFIG } from '../config.js';
import { getI18n } from '../i18n/index.js';
import { EffectsManager } from './EffectsManager.js';
import { ChameleonManager } from './ChameleonManager.js';
import { ModalManager } from './ModalManager.js';

export class UIManager {
    constructor(containerId, i18n = null) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container element '${containerId}' not found`);
        }

        this.i18n = i18n || (typeof getI18n === 'function' ? getI18n() : null);
        this.elements = {};
        this.toastTimeout = null;

        // Timer tracking for cleanup
        this.pendingTimers = new Set();

        this.init();

        // Create sub-managers after init (elements are ready)
        const managerOptions = {
            elements: this.elements,
            setTimeout: (fn, ms) => this._setTimeout(fn, ms),
            clearTimeout: (id) => this._clearTimeout(id),
            t: (key, params) => this.t(key, params)
        };

        this.effectsManager = new EffectsManager(managerOptions);
        this.chameleonManager = new ChameleonManager(managerOptions);
        this.modalManager = new ModalManager({
            ...managerOptions,
            container: this.container
        });

        // Chameleon setup (was in init)
        this.chameleonManager.createChameleonEyes();
        this.chameleonManager.startEyeTracking();
    }

    /**
     * Tracked setTimeout that auto-cleans up
     * @param {Function} callback - Callback function
     * @param {number} delay - Delay in ms
     * @returns {number} Timer ID
     */
    _setTimeout(callback, delay) {
        if (!this.pendingTimers) return null;

        const timerId = setTimeout(() => {
            if (this.pendingTimers) {
                this.pendingTimers.delete(timerId);
                // Only execute callback if component is not destroyed
                callback();
            }
        }, delay);

        this.pendingTimers.add(timerId);
        return timerId;
    }

    /**
     * Helper to clear tracked timeouts (prevents memory leak in pendingTimers Set)
     * @param {number} timerId - Timer ID to clear
     */
    _clearTimeout(timerId) {
        if (timerId == null) return;
        if (this.pendingTimers) {
            this.pendingTimers.delete(timerId);
        }
        clearTimeout(timerId);
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
            targetLeaf: this.container.querySelector('.target-leaf'),
            chameleon: this.container.querySelector('.chameleon'),
            chameleonBody: this.container.querySelector('.chameleon-body'),
            chameleonEyes: this.container.querySelector('.chameleon-eyes'),
            progressStars: this.container.querySelector('.progress-stars'),
            stars: this.container.querySelectorAll('.progress-stars .star'),

            // Mixing area
            bowl: this.container.querySelector('.bowl'),
            liquid: this.container.querySelector('.liquid'),
            particles: this.container.querySelector('.particles'),
            undoBtn: this.container.querySelector('.undo-btn'),
            clearBtn: this.container.querySelector('.clear-btn'),

            // Palette area
            paletteArea: this.container.querySelector('.palette-area'),
            colorSources: this.container.querySelectorAll('.color-source')
        };

        // Set initial states
        if (this.elements.clearBtn) {
            this.elements.clearBtn.disabled = true;
        }

        // Note: Chameleon eyes and tracking are set up in constructor
        // after sub-managers are created
    }


    /**
     * Create chameleon eyes for tracking
     */
    createChameleonEyes() {
        this.chameleonManager.createChameleonEyes();
        // Keep local reference for backward compatibility
        this.pupils = this.chameleonManager.pupils;
    }

    /**
     * Start tracking cursor/touch for eye movement
     */
    startEyeTracking() {
        this.chameleonManager.startEyeTracking();
    }

    /**
     * Update pupil positions based on cursor location
     * @param {number} cursorX - Cursor X position
     * @param {number} cursorY - Cursor Y position
     */
    updateEyePosition(cursorX, cursorY) {
        this.chameleonManager.updateEyePosition(cursorX, cursorY);
    }

    /**
     * Update eye tracking to follow a position
     * @param {number} x - Target X position
     * @param {number} y - Target Y position
     */
    updateEyeTracking(x, y) {
        this.chameleonManager.updateEyeTracking(x, y);
    }

    /**
     * Reset eye tracking to center
     */
    resetEyeTracking() {
        this.chameleonManager.resetEyeTracking();
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
        this.chameleonManager.setChameleonColor(color);
    }

    /**
     * Set goal color in thought bubble
     * @param {string|null} color - Color hex code or null to hide
     */
    setChameleonTarget(color) {
        this.chameleonManager.setChameleonTarget(color);
    }

    /**
     * Set chameleon mood animation
     * @param {string} mood - Mood type (happy, sad, confused)
     */
    setChameleonMood(mood) {
        this.chameleonManager.setChameleonMood(mood);
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
     * Show swirl effect in bowl during mixing
     * @param {string} color - The result color hex
     */
    showSwirlEffect(color) {
        this.effectsManager.showSwirlEffect(color);
    }

    /**
     * Show firefly hint on a color source
     * @param {string} colorName - Color to highlight (red, blue, yellow)
     */
    showFireflyHint(colorName) {
        this.effectsManager.showFireflyHint(colorName);
    }

    /**
     * Hide firefly hint
     */
    hideFireflyHint() {
        this.effectsManager.hideFireflyHint();
    }

    /**
     * Show the undo button
     */
    showUndoButton() {
        if (this.elements.undoBtn) {
            this.elements.undoBtn.classList.remove('hidden');
        }
    }

    /**
     * Hide the undo button
     */
    hideUndoButton() {
        if (this.elements.undoBtn) {
            this.elements.undoBtn.classList.add('hidden');
        }
    }

    /**
     * Get the undo button element
     * @returns {HTMLElement|null}
     */
    getUndoButton() {
        return this.elements.undoBtn;
    }

    /**
     * Add color to bowl (mixing animation)
     * @param {string} color - Color name
     */
    addColorToBowl(color) {
        const colorHex = CONFIG.COLORS.PRIMARY[color];
        if (!colorHex) return;

        // Add bowl squish animation (jelly physics)
        if (this.elements.bowl) {
            this.elements.bowl.classList.add('squish');
            this._setTimeout(() => this.elements.bowl?.classList.remove('squish'), 300);
        }

        // Create splash particle
        if (this.elements.particles) {
            const particle = document.createElement('div');
            particle.className = 'color-particle';
            particle.style.backgroundColor = colorHex;
            this.elements.particles.appendChild(particle);

            this._setTimeout(() => particle.remove(), 1000);
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
            this._clearTimeout(this.toastTimeout);
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

        // Auto-remove after duration (using tracked _setTimeout)
        this.toastTimeout = this._setTimeout(() => {
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
        this.effectsManager.showSplashIcon(emoji, colorHex);
    }

    /**
     * Create sparkle particles for success
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {string} color - Particle color
     */
    createSparkles(x, y, color) {
        this.effectsManager.createSparkles(x, y, color);
    }

    /**
     * Show mud splat overlay effect
     * @param {number} x - X coordinate of splat center
     * @param {number} y - Y coordinate of splat center
     */
    showMudSplat(x, y) {
        this.effectsManager.showMudSplat(x, y);
    }

    /**
     * Show confetti for level complete
     */
    showLevelComplete() {
        this.modalManager.showLevelComplete();
    }


    /**
     * Show mini celebration burst when matching a goal (not level complete)
     * @param {number} centerX - Center X position for burst
     * @param {number} centerY - Center Y position for burst
     * @param {string} color - Primary color for confetti (optional)
     */
    showMiniCelebration(centerX, centerY, color = null) {
        this.effectsManager.showMiniCelebration(centerX, centerY, color);
    }

    /**
     * Create sticker book modal
     * @private
     */
    createStickerBook() {
        this.modalManager.createStickerBook();
        // Keep local references for backward compatibility
        this.stickerBookModal = this.modalManager.stickerBookModal;
        this.stickerGrid = this.modalManager.stickerGrid;
    }

    /**
     * Show sticker book modal
     * @param {string[]} earnedStickers - Array of earned sticker IDs
     * @param {Object} stickerConfig - Sticker configuration from CONFIG.STICKERS
     * @param {string[]} newStickers - Array of newly earned sticker IDs (for "NEW" badge)
     */
    showStickerBook(earnedStickers = [], stickerConfig = {}, newStickers = []) {
        this.modalManager.showStickerBook(earnedStickers, stickerConfig, newStickers);
    }

    /**
     * Hide sticker book modal
     */
    hideStickerBook() {
        this.modalManager.hideStickerBook();
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

        // Hide target leaf and stars in free play
        if (this.elements.targetLeaf) {
            this.elements.targetLeaf.classList.toggle('hidden', enabled);
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

    // ===== Educational Formula Overlay =====

    /**
     * Create the formula overlay DOM element
     */
    createFormulaOverlay() {
        this.modalManager.createFormulaOverlay();
        this.formulaOverlay = this.modalManager.formulaOverlay;
    }

    /**
     * Show educational formula overlay
     * @param {string} color1 - First color name
     * @param {string} color2 - Second color name
     * @param {string} resultColor - Result color name
     */
    showFormulaOverlay(color1, color2, resultColor) {
        this.modalManager.showFormulaOverlay(color1, color2, resultColor);
    }

    /**
     * Hide formula overlay
     */
    hideFormulaOverlay() {
        this.modalManager.hideFormulaOverlay();
    }

    /**
     * Set callback for when formula overlay closes
     * @param {Function} callback - Callback function
     */
    setFormulaCloseCallback(callback) {
        this.modalManager.setFormulaCloseCallback(callback);
    }

    /**
     * Clean up resources
     */
    destroy() {
        // Clear all pending timers first
        if (this.pendingTimers) {
            this.pendingTimers.forEach(timerId => clearTimeout(timerId));
            this.pendingTimers.clear();
            this.pendingTimers = null;
        }

        if (this.toastTimeout) {
            clearTimeout(this.toastTimeout);
            this.toastTimeout = null;
        }

        // Destroy sub-managers
        if (this.chameleonManager) {
            this.chameleonManager.destroy();
            this.chameleonManager = null;
        }

        if (this.effectsManager) {
            this.effectsManager.destroy();
            this.effectsManager = null;
        }

        if (this.modalManager) {
            this.modalManager.destroy();
            this.modalManager = null;
        }

        // Remove all toasts
        if (typeof document !== 'undefined') {
            document.querySelectorAll('.toast').forEach(el => el.remove());
        }

        // Clear references
        this.pupils = null;
        this.stickerBookModal = null;
        this.stickerGrid = null;
        this.formulaOverlay = null;
        this.elements = null;
        this.container = null;
    }
}

export default UIManager;
