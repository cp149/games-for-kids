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
        this.chameleonManager.startIdleSystem();
    }

    /** Tracked setTimeout that auto-cleans up */
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

    /** Clear tracked timeout */
    _clearTimeout(timerId) {
        if (timerId == null) return;
        if (this.pendingTimers) {
            this.pendingTimers.delete(timerId);
        }
        clearTimeout(timerId);
    }

    /** Translate key using i18n */
    t(key, params = {}) {
        if (this.i18n) {
            return this.i18n.t(key, params);
        }
        return key;
    }

    /** Initialize by querying existing DOM elements */
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

            // Palette area (two-row layout)
            paletteArea: this.container.querySelector('.palette-area'),
            mixedColorsTray: this.container.querySelector('.mixed-colors-tray'),
            primarySources: this.container.querySelector('.primary-sources'),
            colorSources: this.container.querySelectorAll('.color-source')
        };

        // Set initial states
        if (this.elements.clearBtn) {
            this.elements.clearBtn.disabled = true;
        }

        // Note: Chameleon eyes and tracking are set up in constructor
        // after sub-managers are created
    }


    /** Create chameleon eyes for tracking */
    createChameleonEyes() {
        this.chameleonManager.createChameleonEyes();
        // Keep local reference for backward compatibility
        this.pupils = this.chameleonManager.pupils;
    }

    /** Start eye tracking */
    startEyeTracking() {
        this.chameleonManager.startEyeTracking();
    }

    /** Update pupil positions based on cursor location */
    updateEyePosition(cursorX, cursorY) {
        this.chameleonManager.updateEyePosition(cursorX, cursorY);
    }

    /** Update eye tracking to follow position */
    updateEyeTracking(x, y) {
        this.chameleonManager.updateEyeTracking(x, y);
    }

    /** Reset eye tracking to center */
    resetEyeTracking() {
        this.chameleonManager.resetEyeTracking();
    }

    /** Get color sources for drag setup */
    getColorSources() {
        return this.elements.colorSources;
    }

    /** Set available colors for current level */
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

    /** Get bowl element for drop target */
    getBowl() {
        return this.elements.bowl;
    }

    /** Get chameleon element for feed drop target */
    getChameleon() {
        return this.elements.chameleon;
    }

    /** Update level display */
    updateLevel(level) {
        // Update aria label for accessibility
        if (this.elements.progressStars) {
            this.elements.progressStars.setAttribute('aria-label', this.t('level', { '0': level }));
        }
    }

    /** Update goal display with visual stars */
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

    /** Set chameleon body color */
    setChameleonColor(color) {
        this.chameleonManager.setChameleonColor(color);
    }

    /** Flash chameleon with a color temporarily */
    flashChameleonColor(color) {
        const originalColor = '#D4C5B9';  // Default gray
        this.chameleonManager.setChameleonColor(color);
        this._setTimeout(() => {
            this.chameleonManager.setChameleonColor(originalColor);
        }, 400);
    }

    /** Set goal color in thought bubble */
    setChameleonTarget(color) {
        this.chameleonManager.setChameleonTarget(color);
    }

    /** Set chameleon mood animation */
    setChameleonMood(mood) {
        this.chameleonManager.setChameleonMood(mood);
    }

    /** Update bowl liquid color */
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

    /** Show swirl effect in bowl during mixing */
    showSwirlEffect(color) {
        this.effectsManager.showSwirlEffect(color);
    }

    /** Show firefly hint on a color source */
    showFireflyHint(colorName) {
        this.effectsManager.showFireflyHint(colorName);
    }

    /** Hide firefly hint */
    hideFireflyHint() {
        this.effectsManager.hideFireflyHint();
    }

    /** Show the undo button */
    showUndoButton() {
        if (this.elements.undoBtn) {
            this.elements.undoBtn.classList.remove('hidden');
        }
    }

    /** Hide the undo button */
    hideUndoButton() {
        if (this.elements.undoBtn) {
            this.elements.undoBtn.classList.add('hidden');
        }
    }

    /** Get the undo button element */
    getUndoButton() {
        return this.elements.undoBtn;
    }

    /** Add color to bowl with animation */
    addColorToBowl(color, colorHex = null) {
        // Get color hex - use provided hex or look up from CONFIG
        const hex = colorHex || 
            CONFIG.COLORS.PRIMARY[color] || 
            CONFIG.COLORS.SECONDARY[color] ||
            CONFIG.COLORS.TERTIARY?.[color] ||
            CONFIG.COLORS.SPECIAL?.[color];
        
        if (!hex) return;

        // Add bowl squish animation (jelly physics)
        if (this.elements.bowl) {
            this.elements.bowl.classList.add('squish');
            this._setTimeout(() => this.elements.bowl?.classList.remove('squish'), 300);
        }

        // Create splash particle
        if (this.elements.particles) {
            const particle = document.createElement('div');
            particle.className = 'color-particle';
            particle.style.backgroundColor = hex;
            this.elements.particles.appendChild(particle);

            this._setTimeout(() => particle.remove(), 1000);
        }

        // Update clear button
        this.updateClearButton(true);
    }

    /** Clear bowl */
    clearBowl() {
        this.setBowlColor(null);
        if (this.elements.particles) {
            this.elements.particles.innerHTML = '';
        }
        this.updateClearButton(false);
    }

    /** Update clear button state */
    updateClearButton(hasColors) {
        if (this.elements.clearBtn) {
            this.elements.clearBtn.disabled = !hasColors;
        }
    }

    /** Show toast notification */
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

    /** Show splash icon effect for successful mix */
    showSplashIcon(emoji, colorHex) {
        this.effectsManager.showSplashIcon(emoji, colorHex);
    }

    /** Create sparkle particles */
    createSparkles(x, y, color) {
        this.effectsManager.createSparkles(x, y, color);
    }

    /** Show mud splat overlay effect */
    showMudSplat(x, y) {
        this.effectsManager.showMudSplat(x, y);
    }

    /** Show confetti for level complete */
    showLevelComplete() {
        this.modalManager.showLevelComplete();
    }


    /** Show mini celebration burst when matching a goal */
    showMiniCelebration(centerX, centerY, color = null) {
        this.effectsManager.showMiniCelebration(centerX, centerY, color);
    }


    /**
     * Show emoji particle burst celebration
     * @param {string[]} emojis - Array of emojis to burst
     * @param {string} colorHex - Hex color for particles
     */
    showParticleBurst(emojis, colorHex) {
        this.effectsManager.showParticleBurst(emojis, colorHex);
    }

    /**
     * Trigger chameleon giggle animation
     */
    triggerChameleonGiggle() {
        this.chameleonManager.giggle();
    }

    /**
     * Show bubble pop effect from element
     * @param {HTMLElement} element - Origin element
     */
    showBubblePop(element) {
        this.effectsManager.showBubblePop(element);
    }

    /**
     * Show floating combo text
     * @param {string} text - Text to display
     * @param {HTMLElement} element - Origin element
     */
    showComboText(text, element) {
        this.effectsManager.showComboText(text, element);
    }

    /**
     * Trigger bowl jelly impact animation
     */
    triggerBowlJelly() {
        this.effectsManager.triggerBowlJelly();
    }

    /** Create sticker book modal */
    createStickerBook() {
        this.modalManager.createStickerBook();
        // Keep local references for backward compatibility
        this.stickerBookModal = this.modalManager.stickerBookModal;
        this.stickerGrid = this.modalManager.stickerGrid;
    }

    /** Show sticker book modal */
    showStickerBook(earnedStickers = [], stickerConfig = {}, newStickers = []) {
        this.modalManager.showStickerBook(earnedStickers, stickerConfig, newStickers);
    }

    /** Hide sticker book modal */
    hideStickerBook() {
        this.modalManager.hideStickerBook();
    }

    /** Show/hide free play button */
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

    /** Set free play mode UI state */
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
     * Add a mixed color as a draggable source for chain mixing
     * @param {Object} mixResult - Result from MixingSystem.mix() containing result, resultHex, ryb
     * @returns {HTMLElement|null} The created color source element
     */
    addMixedColorSource(mixResult) {
        const tray = this.elements.mixedColorsTray;
        if (!mixResult || !tray) return null;
        
        const colorName = mixResult.result;
        const colorHex = mixResult.resultHex;
        
        // Use hex as unique identifier (allows different shades of same "name")
        const colorId = colorHex.replace('#', 'hex-');
        
        // Check if this exact color (by hex) already exists in tray
        const existingSource = tray.querySelector(
            `.color-source[data-color-id="${colorId}"]`
        );
        if (existingSource) {
            // Already exists, just make sure it's visible
            existingSource.classList.remove('hidden');
            return existingSource;
        }
        
        // Create new color source element
        const source = document.createElement('div');
        source.className = `color-source mixed-color`;
        source.dataset.color = colorName;
        source.dataset.colorId = colorId;
        source.dataset.colorHex = colorHex;
        source.draggable = true;
        source.setAttribute('role', 'button');
        source.setAttribute('tabindex', '0');
        source.setAttribute('aria-label', `${colorName} Color - Drag to bowl`);
        
        // Store RYB data for chain mixing
        if (mixResult.ryb) {
            source.dataset.ryb = JSON.stringify(mixResult.ryb);
        }
        
        // Create inner elements
        const blob = document.createElement('div');
        blob.className = 'color-blob';
        blob.style.background = colorHex;
        blob.setAttribute('aria-hidden', 'true');
        
        const pattern = document.createElement('div');
        pattern.className = 'color-pattern pattern-mixed';
        pattern.setAttribute('aria-hidden', 'true');
        
        source.appendChild(blob);
        source.appendChild(pattern);
        
        // Add to mixed colors tray
        tray.appendChild(source);
        
        // Add pop-in animation
        source.classList.add('pop-in');
        this._setTimeout(() => source.classList.remove('pop-in'), 400);
        
        return source;
    }

    /**
     * Remove a specific mixed color source (when fed to chameleon)
     * @param {HTMLElement} element - The color source element to remove
     */
    removeMixedColorSource(element) {
        if (!element) return;
        
        // Add eating animation
        element.classList.add('being-eaten');
        
        // Remove after animation completes
        this._setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, 300);
    }

    /**
     * Remove all mixed color sources (for level reset)
     */
    clearMixedColorSources() {
        const tray = this.elements.mixedColorsTray;
        if (!tray) return;
        
        // Clear all mixed colors from tray
        tray.innerHTML = '';
    }

    /** Get element reference by name */
    getElement(name) {
        return this.elements[name];
    }

    /** Create formula overlay DOM element */
    createFormulaOverlay() {
        this.modalManager.createFormulaOverlay();
        this.formulaOverlay = this.modalManager.formulaOverlay;
    }

    /** Show educational formula overlay */
    showFormulaOverlay(color1, color2, resultColor) {
        this.modalManager.showFormulaOverlay(color1, color2, resultColor);
    }

    /** Hide formula overlay */
    hideFormulaOverlay() {
        this.modalManager.hideFormulaOverlay();
    }

    /** Set callback for formula overlay close */
    setFormulaCloseCallback(callback) {
        this.modalManager.setFormulaCloseCallback(callback);
    }

    /** Clean up resources */
    destroy() {
        // Helper to safely destroy a manager
        const safeDestroy = (obj) => {
            if (obj && typeof obj.destroy === 'function') {
                try { obj.destroy(); } catch { /* silent */ }
            }
        };

        // Clear all pending timers
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
        safeDestroy(this.chameleonManager);
        safeDestroy(this.effectsManager);
        safeDestroy(this.modalManager);

        this.chameleonManager = null;
        this.effectsManager = null;
        this.modalManager = null;

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
