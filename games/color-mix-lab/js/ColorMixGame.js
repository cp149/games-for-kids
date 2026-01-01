/**
 * ColorMixGame - Main game controller
 * Coordinates UI, drag interactions, and game logic
 * Uses bowl-based mixing instead of slots
 */

import { CONFIG } from './config.js';
import { I18n, getI18n } from './i18n/index.js';
import { TRANSLATIONS } from './i18n/translations.js';
import { UIManager } from './managers/UIManager.js';
import { DragManager } from './managers/DragManager.js';
import { AudioManager } from './managers/AudioManager.js';
import { IdleHintManager } from './managers/IdleHintManager.js';
import { LevelManager } from './managers/LevelManager.js';
import { DragInteractionHandler } from './managers/DragInteractionHandler.js';
import { MixingSystem } from './systems/MixingSystem.js';
import { TutorialSystem } from './systems/TutorialSystem.js';
import { GameFeedbackSystem } from './systems/GameFeedbackSystem.js';

export class ColorMixGame {
    constructor(containerId, i18nInstance = null) {
        // Initialize i18n
        this.i18n = i18nInstance || (typeof getI18n === 'function' ? getI18n() : null) || this.createDefaultI18n();

        // Initialize managers with i18n
        this.ui = new UIManager(containerId, this.i18n);

        // Initialize AudioManager for musical color drops
        this.audio = new AudioManager(CONFIG);
        if (this.audio) {
            this.audio.load();
        }

        // Initialize MixingSystem (extracted mixing logic)
        this.mixing = new MixingSystem(CONFIG);

        // Initialize TutorialSystem
        this.tutorial = new TutorialSystem(CONFIG);

        // Initialize DragInteractionHandler for drag callbacks
        this.dragHandler = new DragInteractionHandler({
            ui: this.ui,
            audio: this.audio,
            tutorial: this.tutorial,
            checkIfColorHelpsGoal: (color) => this.checkIfColorHelpsGoal(color),
            addColorToBowl: (color) => this.addColorToBowl(color),
            startIdleHintTimer: () => this.startIdleHintTimer(),
            feedChameleon: (element, data) => this.feedColorToChameleon(element, data)
        });

        // Initialize DragManager with handler callbacks
        this.drag = new DragManager({
            onDragStart: (el, data) => this.dragHandler.onDragStart(el, data),
            onDragMove: (el, data) => this.dragHandler.onDragMove(el, data),
            onDragEnd: (el, data) => this.dragHandler.onDragEnd(el, data),
            onTap: (el, data) => this.handleColorTap(el, data)
        });

        // Initialize GameFeedbackSystem for visual/audio feedback orchestration
        this.feedback = new GameFeedbackSystem({
            ui: this.ui,
            audio: this.audio,
            i18n: this.i18n,
            setTimeout: (fn, ms) => this._setTimeout(fn, ms)
        });

        // Initialize LevelManager for level state and persistence
        this.level = new LevelManager(CONFIG);
        this.level.load();

        // Initialize IdleHintManager for idle hints
        this.idleHint = new IdleHintManager({
            setTimeout: (fn, ms) => this._setTimeout(fn, ms),
            clearTimeout: (id) => this._clearTimeout(id),
            config: CONFIG
        });
        this.idleHint.setHintCallback((color) => {
            if (this.audio) this.audio.play('hint_appear');
            this.ui.showFireflyHint(color);
        });

        // Transient game state (non-persistent)
        this.state = {
            currentGoal: null
        };

        // Timer and event tracking for cleanup
        this.pendingTimers = new Set();
        this.boundListeners = new Map();

        // Initialize game
        this.init();
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
     * Create default i18n instance with translations
     * @returns {Object} i18n instance
     */
    createDefaultI18n() {
        // Use I18n class with TRANSLATIONS if available
        if (typeof I18n !== 'undefined' && typeof TRANSLATIONS !== 'undefined') {
            return new I18n(TRANSLATIONS, 'en');
        }
        // Minimal fallback for environments without i18n
        const fallback = { welcome: 'Welcome to Color Mix Lab!', slot_label: 'Slot {0}' };
        return {
            t: (key, params = {}) => {
                let text = fallback[key] || key;
                Object.keys(params).forEach(p => text = text.replace(`{${p}}`, params[p]));
                return text;
            }
        };
    }

    /**
     * Initialize game
     */
    init() {
        this.setupLevel(this.level.currentLevel);
        this.setupColorSources();
        this.setupEventListeners();
        this.ui.showToast(this.i18n.t('welcome') + ' 🦎', 'info');
    }

    /**
     * Setup color sources for dragging
     */
    setupColorSources() {
        const colorSources = this.ui.getColorSources();
        colorSources.forEach(source => {
            const color = source.dataset.color;
            // Enable drag-and-drop (tap handled via onTap callback)
            this.drag.enableDrag(source, { color });
        });
    }

    /**
     * Handle tap on a color source (accessibility: tap-to-select)
     * @param {HTMLElement} source - The color source element
     * @param {string} color - The color name
     */
    handleColorTap(element, data) {
        const color = data?.color;
        if (!color) return;

        // Play selection sound
        if (this.audio) {
            const CONFIG = window.CONFIG;
            const colorNote = CONFIG?.COLOR_NOTES?.[color];
            if (colorNote?.frequency) {
                this.audio.playTone(colorNote.frequency, 0.1);
            }
        }

        // Directly add color to bowl
        this.addColorToBowl(color);

        // Trigger bowl jelly effect
        if (this.ui?.triggerBowlJelly) {
            this.ui.triggerBowlJelly();
        }
    }


    /**
     * Setup level configuration
     * @param {number} level - Level number
     */
    setupLevel(level) {
        const config = CONFIG.LEVELS[level];
        if (!config) {
            if (typeof Logger !== 'undefined') {
                Logger.warn('[ColorMixGame]', this.i18n.t('level_not_found'));
            }
            return;
        }

        // Update UI
        this.ui.updateLevel(level);

        // Set available colors for this level
        this.ui.setAvailableColors(config.availableColors);

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

        // Reset progress and bowl
        this.level.resetProgress();
        this.mixing.clear();
        this.ui.clearBowl();

        // Hide any existing hints
        this.ui.hideFireflyHint();

        // Setup and start tutorial for this level
        if (this.tutorial) {
            this.tutorial.setupLevel(level);
            this.tutorial.start(this.ui.container);
        }

        // Start idle hint timer (show hint after 8 seconds of inactivity)
        this.startIdleHintTimer();
    }

    /**
     * Start idle hint timer - delegates to IdleHintManager
     */
    startIdleHintTimer() {
        const state = {
            isFreeMode: this.level.isInFreeMode(),
            currentGoal: this.state.currentGoal
        };
        this.idleHint.startTimer(state);
    }

    /**
     * Clear idle hint timer - delegates to IdleHintManager
     */
    clearIdleHintTimer() {
        this.idleHint.clearTimer();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Helper to track event listeners for cleanup
        const bind = (el, event, handler) => {
            if (!el) return;
            el.addEventListener(event, handler);
            if (!this.boundListeners.has(el)) this.boundListeners.set(el, []);
            this.boundListeners.get(el).push({ event, handler });
        };

        // Button bindings
        bind(this.ui.getElement('clearBtn'), 'click', () => this.clearBowl());
        bind(this.ui.getUndoButton(), 'click', () => this.undoLastColor());
        bind(this.ui.getElement('settingsBtn'), 'click', () => 
            this.ui.showToast(this.i18n.t('settings_coming') + ' ⚙️', 'info'));
        bind(this.ui.getElement('soundBtn'), 'click', () => 
            this.ui.showToast('Sound toggle coming soon! 🔊', 'info'));
        bind(this.ui.getElement('stickerBookBtn'), 'click', () => this.showStickerBook());
        bind(this.ui.getElement('freePlayBtn'), 'click', () => 
            this.level.isInFreeMode() ? this.exitFreePlay() : this.enterFreePlay());

        // Chameleon click for giggle animation
        bind(this.ui.getElement('chameleon'), 'click', () => this.ui.triggerChameleonGiggle());

        // Show free play button if unlocked
        if (this.level.isFreePlayUnlocked()) this.ui.showFreePlayButton(true);
    }

    /**
     * Show sticker book with current collection
     */
    showStickerBook() {
        if (this.audio) this.audio.play('sticker_book_open');
        this.ui.showStickerBook(this.level.getStickers(), CONFIG.STICKERS);
    }

    /**
     * Enter free play mode
     */
    enterFreePlay() {
        if (!this.level.enterFreePlay()) {
            this.ui.showToast(this.i18n.t('free_play_locked') || 'Complete all levels first! 🔒', 'info');
            return;
        }

        // Clear any goal
        this.state.currentGoal = null;

        // Set all colors available
        const freeColors = CONFIG.FREE_MODE.availableColors;
        this.ui.setAvailableColors(freeColors);

        // Update UI for free play
        this.ui.setFreePlayMode(true);
        this.ui.setChameleonTarget(null); // No target
        this.ui.setChameleonColor('#D4C5B9'); // Reset to gray

        // Clear bowl
        this.mixing.clear();
        this.ui.clearBowl();

        // Stop tutorial if running
        if (this.tutorial && this.tutorial.isRunning()) {
            this.tutorial.stop();
        }

        this.ui.showToast(this.i18n.t('free_play_started') || 'Free Play! Mix any colors! 🎨', 'success');
    }

    /**
     * Exit free play mode and return to levels
     */
    exitFreePlay() {
        this.level.exitFreePlay();

        // Update UI
        this.ui.setFreePlayMode(false);

        // Return to current level
        this.setupLevel(this.level.currentLevel);

        this.ui.showToast(this.i18n.t('back_to_levels') || 'Back to levels! 📚', 'info');
    }



    /**
     * Check if adding a color could help reach the current goal
     * Delegates to IdleHintManager
     * @param {string} color - The color being dragged (red, blue, yellow)
     * @returns {boolean} - True if this color could help make the goal color
     */
    checkIfColorHelpsGoal(color) {
        const state = {
            isFreeMode: this.level.isInFreeMode(),
            currentGoal: this.state.currentGoal
        };
        return this.idleHint.checkIfColorHelpsGoal(color, state);
    }

    /**
     * Add color to the mixing bowl
     * @param {string} color - Color name (red, blue, yellow)
     */
    addColorToBowl(color) {
        const result = this.mixing.addColor(color);

        if (!result.success) {
            if (result.reason === 'bowl_full') {
                this.ui.showToast(this.i18n.t('bowl_full') || 'Bowl is full! Clear first.', 'info');
            }
            return;
        }

        // Extract color name for audio and UI (handle both string and object)
        const colorName = typeof color === 'string' ? color : (color.result || 'mixed');

        // Play drop sound for the color
        if (this.audio) {
            this.audio.play(`drop_${colorName}`);
        }

        // Update UI - add color particle animation
        this.ui.addColorToBowl(colorName, result.colorHex);

        // Show undo button when first color is added
        if (result.colorsInBowl.length === 1) {
            this.ui.setBowlColor(result.colorHex);
            this.ui.showUndoButton();
        }

        // If auto-mixed, handle the result (undo hidden after mix)
        if (result.mixed && result.mixResult) {
            this.ui.hideUndoButton();
            this.handleMixResult(result.mixResult);
        }
    }

    /**
     * Clear the mixing bowl
     */
    clearBowl() {
        if (this.audio) this.audio.play('clear_bowl');

        // Trigger bubble pop effect
        const clearBtn = this.ui.getElement('clearBtn');
        if (clearBtn && this.ui.showBubblePop) {
            this.ui.showBubblePop(clearBtn);
        }

        this.mixing.clear();
        this.ui.clearBowl();
        this.ui.hideUndoButton();
        this.ui.setChameleonColor('#D4C5B9');
    }

    /**
     * Feed a mixed color to the chameleon (remove from tray)
     * @param {HTMLElement} element - The color source element being fed
     * @param {Object} data - Drag data containing color info
     */
    feedColorToChameleon(element, data) {
        // Play eating sound
        if (this.audio) this.audio.play('chameleon_eat');

        // Show chameleon happy reaction
        this.ui.setChameleonMood('happy');

        // Flash chameleon with the color being eaten
        if (data.colorData?.resultHex) {
            this.ui.flashChameleonColor(data.colorData.resultHex);
        }

        // Remove the color from tray with animation
        this.ui.removeMixedColorSource(element);

        // Reset chameleon mood after animation
        this._setTimeout(() => {
            this.ui.setChameleonMood('neutral');
        }, 600);
    }

    /**
     * Undo the last color added to bowl
     */
    undoLastColor() {
        const result = this.mixing.undo();
        if (!result.success) return;

        if (this.audio) this.audio.play('undo');

        if (result.bowlEmpty) {
            this.ui.clearBowl();
            this.ui.hideUndoButton();
        } else {
            this.ui.setBowlColor(result.remainingColorHex);
        }

        this.ui.setChameleonColor('#D4C5B9');
        this.startIdleHintTimer();
    }

    /**
     * Handle mix result from MixingSystem
     * @param {Object} mixResult - Result from mixing.mix()
     */
    handleMixResult(mixResult) {
        const bowl = this.ui.getBowl();
        const rect = bowl?.getBoundingClientRect() || { left: 0, top: 0, width: 0, height: 0 };
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        this.feedback.showMixFeedback(mixResult, { centerX, centerY });

        // Record in tutorial system
        if (this.tutorial) {
            mixResult.type !== 'mud' ? this.tutorial.recordSuccess() : this.tutorial.recordFailure();
        }

        // Handle goal progression
        const isMud = mixResult.type === 'mud';
        if (!isMud && !this.level.isInFreeMode()) {
            const goal = this.state.currentGoal;
            if (this.mixing.matchesGoal(goal, mixResult)) {
                this.level.addProgress(1);
                this.ui.updateGoal(this.level.getProgress(), goal.count);
                this.level.isLevelComplete() 
                    ? this.handleLevelComplete() 
                    : this.feedback.showGoalMatchCelebration(centerX, centerY, mixResult.resultHex);
            }
        } else if (!isMud) {
            this.feedback.showGoalMatchCelebration(centerX, centerY, mixResult.resultHex);
        }

        // Add mixed color to palette for chain mixing (all non-primary colors can be reused)
        if (mixResult.type !== 'primary') {
            const newSource = this.ui.addMixedColorSource(mixResult);
            if (newSource) {
                // Enable drag on the new color source
                this.drag.enableDrag(newSource, { 
                    color: mixResult.result,
                    colorData: mixResult,  // Pass full data for dynamic mixing
                    isMixedColor: true     // Flag for chameleon feeding
                });
            }
        }

        this._setTimeout(() => this.clearBowl(), 2000);
    }

    /**
     * Handle level completion
     */
    handleLevelComplete() {
        this.feedback.showLevelCompleteCelebration();

        // Award sticker for this level
        const levelConfig = CONFIG.LEVELS[this.level.currentLevel];
        if (levelConfig?.sticker) {
            const stickerInfo = CONFIG.STICKERS[levelConfig.sticker];
            if (stickerInfo && !this.level.hasSticker(levelConfig.sticker)) {
                this.level.addSticker(levelConfig.sticker);
                this.feedback.showStickerEarned(stickerInfo);
            }
        }

        if (this.level.isLastLevel()) {
            this.level.unlockFreePlay();
            this.feedback.showGameComplete();
        } else {
            this._setTimeout(() => {
                if (this.level) {
                    this.level.nextLevel();
                    this.setupLevel(this.level.currentLevel);
                    this.feedback.showLevelTransition(this.level.currentLevel);
                }
            }, 2500);
        }
    }

    /**
     * Load saved progress using LevelManager
     */
    loadProgress() {
        // LevelManager handles persistence - just reload
        this.level.load();
    }

    /**
     * Save progress using LevelManager
     */
    saveProgress() {
        this.level.save();
    }

    /**
     * Clean up resources safely
     * Handles null checks and prevents double-destroy errors
     */
    destroy() {
        // Helper to safely destroy a manager
        const safeDestroy = (obj) => {
            if (obj && typeof obj.destroy === 'function') {
                try { obj.destroy(); } catch { /* silent */ }
            }
        };

        // Clear all pending timers first
        if (this.pendingTimers) {
            this.pendingTimers.forEach(timerId => clearTimeout(timerId));
            this.pendingTimers.clear();
            this.pendingTimers = null;
        }

        // Remove all tracked event listeners
        if (this.boundListeners) {
            this.boundListeners.forEach((listeners, element) => {
                listeners.forEach(({ event, handler }) => {
                    element.removeEventListener(event, handler);
                });
            });
            this.boundListeners.clear();
            this.boundListeners = null;
        }

        // Clear idle hint timer
        this.clearIdleHintTimer();

        // Destroy all managers in order
        safeDestroy(this.drag);
        safeDestroy(this.dragHandler);
        safeDestroy(this.ui);
        safeDestroy(this.audio);
        safeDestroy(this.tutorial);
        safeDestroy(this.feedback);
        safeDestroy(this.idleHint);
        safeDestroy(this.level);

        // Clear all references
        this.drag = null;
        this.dragHandler = null;
        this.ui = null;
        this.audio = null;
        this.mixing = null;
        this.tutorial = null;
        this.feedback = null;
        this.idleHint = null;
        this.level = null;
        this.i18n = null;
        this.state = null;
    }
}

export default ColorMixGame;
