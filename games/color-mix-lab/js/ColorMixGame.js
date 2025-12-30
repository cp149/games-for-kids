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
import { MixingSystem } from './systems/MixingSystem.js';
import { TutorialSystem } from './systems/TutorialSystem.js';

export class ColorMixGame {
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

        // Initialize AudioManager for musical color drops
        this.audio = new AudioManager(CONFIG);
        if (this.audio) {
            this.audio.load();
        }

        // Initialize MixingSystem (extracted mixing logic)
        this.mixing = new MixingSystem(CONFIG);

        // Initialize TutorialSystem
        this.tutorial = new TutorialSystem(CONFIG);

        // Game state
        this.state = {
            currentLevel: 1,
            progress: 0,
            stickers: [],
            freePlayUnlocked: false,
            isFreeMode: false
        };

        // Initialize game
        this.init();
    }

    /**
     * Create default i18n instance with translations
     * @returns {Object} i18n instance
     */
    createDefaultI18n() {
        // Try to use I18n class with TRANSLATIONS
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

        // Setup drag for color sources
        this.setupColorSources();

        // Setup event listeners
        this.setupEventListeners();

        // Show welcome message
        this.ui.showToast(this.i18n.t('welcome') + ' 🦎', 'info');
    }

    /**
     * Setup color sources for dragging
     */
    setupColorSources() {
        const colorSources = this.ui.getColorSources();
        colorSources.forEach(source => {
            const color = source.dataset.color;
            this.drag.enableDrag(source, { color });
        });
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
        this.state.progress = 0;
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
     * Start idle hint timer - shows firefly hint after inactivity
     */
    startIdleHintTimer() {
        // Clear existing timer
        this.clearIdleHintTimer();

        // Don't show hints in free play mode
        if (this.state.isFreeMode) return;

        // Set timer for 8 seconds
        this.idleHintTimer = setTimeout(() => {
            this.showIdleHint();
        }, 8000);
    }

    /**
     * Clear idle hint timer
     */
    clearIdleHintTimer() {
        if (this.idleHintTimer) {
            clearTimeout(this.idleHintTimer);
            this.idleHintTimer = null;
        }
    }

    /**
     * Show firefly hint based on current goal
     */
    showIdleHint() {
        if (this.state.isFreeMode) return;

        const goal = this.state.currentGoal;
        if (!goal) return;

        // Determine which color to hint based on goal
        let hintColor = null;

        if (goal.type === 'secondary' && goal.color) {
            // Find colors needed for this secondary color
            const neededColors = this.getColorsForSecondary(goal.color);
            if (neededColors.length > 0) {
                hintColor = neededColors[0];
            }
        } else if (goal.type === 'multiple' && goal.colors && goal.colors[0]) {
            const neededColors = this.getColorsForSecondary(goal.colors[0]);
            if (neededColors.length > 0) {
                hintColor = neededColors[0];
            }
        }

        if (hintColor) {
            if (this.audio) {
                this.audio.play('hint_appear');
            }
            this.ui.showFireflyHint(hintColor);
        }
    }

    /**
     * Get primary colors needed to make a secondary color
     * @param {string} secondaryColor - The secondary color name
     * @returns {string[]} Array of primary color names
     */
    getColorsForSecondary(secondaryColor) {
        const recipes = {
            orange: ['red', 'yellow'],
            green: ['blue', 'yellow'],
            purple: ['red', 'blue']
        };
        return recipes[secondaryColor] || [];
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Clear button
        const clearBtn = this.ui.getElement('clearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearBowl());
        }

        // Undo button
        const undoBtn = this.ui.getUndoButton();
        if (undoBtn) {
            undoBtn.addEventListener('click', () => this.undoLastColor());
        }

        // Settings button
        const settingsBtn = this.ui.getElement('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.ui.showToast(this.i18n.t('settings_coming') + ' ⚙️', 'info');
            });
        }

        // Sound button
        const soundBtn = this.ui.getElement('soundBtn');
        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                this.ui.showToast('Sound toggle coming soon! 🔊', 'info');
            });
        }

        // Sticker book button
        const stickerBookBtn = this.ui.getElement('stickerBookBtn');
        if (stickerBookBtn) {
            stickerBookBtn.addEventListener('click', () => {
                this.showStickerBook();
            });
        }

        // Free play button
        const freePlayBtn = this.ui.getElement('freePlayBtn');
        if (freePlayBtn) {
            freePlayBtn.addEventListener('click', () => {
                if (this.state.isFreeMode) {
                    this.exitFreePlay();
                } else {
                    this.enterFreePlay();
                }
            });
        }

        // Show free play button if unlocked
        if (this.state.freePlayUnlocked) {
            this.ui.showFreePlayButton(true);
        }
    }

    /**
     * Show sticker book with current collection
     */
    showStickerBook() {
        if (this.audio) {
            this.audio.play('sticker_book_open');
        }
        this.ui.showStickerBook(this.state.stickers, CONFIG.STICKERS);
    }

    /**
     * Enter free play mode
     */
    enterFreePlay() {
        if (!this.state.freePlayUnlocked) {
            this.ui.showToast(this.i18n.t('free_play_locked') || 'Complete all levels first! 🔒', 'info');
            return;
        }

        this.state.isFreeMode = true;

        // Clear any goal
        this.state.currentGoal = null;
        this.state.progress = 0;

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
        this.state.isFreeMode = false;

        // Update UI
        this.ui.setFreePlayMode(false);

        // Return to current level
        this.setupLevel(this.state.currentLevel);

        this.ui.showToast(this.i18n.t('back_to_levels') || 'Back to levels! 📚', 'info');
    }

    /**
     * Handle drag start
     * @param {HTMLElement} element - Dragged element
     * @param {Object} data - Drag data
     */
    onDragStart(element, data) {
        // Hide any firefly hints and reset timer
        this.ui.hideFireflyHint();
        this.startIdleHintTimer();

        // Play pickup sound for the color
        if (this.audio && data.color) {
            this.audio.play(`pickup_${data.color}`);
        }

        // Visual feedback
        element.style.cursor = 'grabbing';

        // Chameleon starts watching
        this.ui.setChameleonMood('watching');

        // Stop tutorial when user starts interacting
        if (this.tutorial && this.tutorial.isRunning()) {
            this.tutorial.stop();
        }
    }

    /**
     * Handle drag move
     * @param {HTMLElement} element - Dragged element
     * @param {Object} data - Drag data with coordinates and drop target
     */
    onDragMove(element, data) {
        // Eye tracking - chameleon watches the dragged color
        this.ui.updateEyeTracking(data.x, data.y);

        // Check if over bowl
        const bowl = this.ui.getBowl();
        if (!bowl) return;

        const rect = bowl.getBoundingClientRect();
        const isOverBowl = data.x >= rect.left && data.x <= rect.right &&
                          data.y >= rect.top && data.y <= rect.bottom;

        bowl.classList.toggle('drag-over', isOverBowl);

        // Emotional feedback: eager if color could help reach goal
        if (isOverBowl && data.data.color) {
            const currentColors = this.ui.bowlColors || [];
            const potentialMix = [...currentColors, data.data.color];
            const wouldHelp = this.checkIfColorHelpsGoal(data.data.color);

            if (wouldHelp) {
                this.ui.setChameleonMood('eager');
            }
        }
    }

    /**
     * Handle drag end
     * @param {HTMLElement} element - Dragged element
     * @param {Object} data - Drag data with drop target
     */
    onDragEnd(element, data) {
        // Remove cursor style
        element.style.cursor = '';

        // Reset chameleon to neutral
        this.ui.setChameleonMood('neutral');

        // Remove drag-over highlight
        const bowl = this.ui.getBowl();
        if (bowl) {
            bowl.classList.remove('drag-over');
        }

        // Check if dropped on bowl
        if (bowl) {
            const rect = bowl.getBoundingClientRect();
            const isOverBowl = data.x >= rect.left && data.x <= rect.right &&
                              data.y >= rect.top && data.y <= rect.bottom;

            if (isOverBowl && data.data.color) {
                this.addColorToBowl(data.data.color);
                return true;
            }
        }

        return false;
    }


    /**
     * Check if adding a color could help reach the current goal
     * @param {string} color - The color being dragged (red, blue, yellow)
     * @returns {boolean} - True if this color could help make the goal color
     */
    checkIfColorHelpsGoal(color) {
        // In free play mode, always return true (any color is fun!)
        if (this.state.isFreeMode) {
            return true;
        }

        const goal = this.state.currentGoal;
        if (!goal || !goal.targetColor) {
            return false;
        }

        // Map goal colors to their component primary colors
        const colorComponents = {
            purple: ['red', 'blue'],
            green: ['blue', 'yellow'],
            orange: ['red', 'yellow'],
            // Primary colors need themselves
            red: ['red'],
            blue: ['blue'],
            yellow: ['yellow']
        };

        const neededColors = colorComponents[goal.targetColor] || [];
        return neededColors.includes(color);
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

        // Play drop sound for the color
        if (this.audio) {
            this.audio.play(`drop_${color}`);
        }

        // Update UI - add color particle animation
        this.ui.addColorToBowl(color);

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
        // Play clear sound
        if (this.audio) {
            this.audio.play('clear_bowl');
        }

        this.mixing.clear();
        this.ui.clearBowl();
        this.ui.hideUndoButton();
        this.ui.setChameleonColor('#D4C5B9'); // Reset to gray
    }

    /**
     * Undo the last color added to bowl
     */
    undoLastColor() {
        const result = this.mixing.undo();

        if (!result.success) {
            return;
        }

        // Play undo sound
        if (this.audio) {
            this.audio.play('undo');
        }

        // Update bowl visual
        if (result.bowlEmpty) {
            this.ui.clearBowl();
            this.ui.hideUndoButton();
        } else {
            // Show the remaining color
            this.ui.setBowlColor(result.remainingColorHex);
        }

        // Reset chameleon color
        this.ui.setChameleonColor('#D4C5B9');

        // Restart idle hint timer
        this.startIdleHintTimer();
    }

    /**
     * Handle mix result from MixingSystem
     * @param {Object} mixResult - Result from mixing.mix()
     */
    handleMixResult(mixResult) {
        // Get bowl center for effects
        const bowl = this.ui.getBowl();
        const rect = bowl ? bowl.getBoundingClientRect() : { left: 0, top: 0, width: 0, height: 0 };
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Show swirl effect during mixing
        this.ui.showSwirlEffect(mixResult.resultHex);

        // Play mix sound based on result
        if (this.audio) {
            if (mixResult.type === 'mud') {
                this.audio.play('mix_mud');
            } else {
                // Play color-specific mix sound
                this.audio.play(`mix_${mixResult.result}`);
            }
        }

        if (mixResult.type !== 'mud') {
            // Valid mix result
            this.ui.setBowlColor(mixResult.resultHex);
            this.ui.setChameleonColor(mixResult.resultHex);
            this.ui.setChameleonMood('happy');
            this.ui.showSplashIcon(mixResult.emoji, mixResult.resultHex);

            // Show educational formula overlay for secondary colors
            if (mixResult.type === 'secondary' && mixResult.inputColors && mixResult.inputColors.length === 2) {
                this.ui.showFormulaOverlay(
                    mixResult.inputColors[0],
                    mixResult.inputColors[1],
                    mixResult.result
                );
            }

            // Record success in tutorial system (resets failure count)
            if (this.tutorial) {
                this.tutorial.recordSuccess();
            }

            // Skip goal checking in free play mode
            if (!this.state.isFreeMode) {
                // Check if this matches the current goal using MixingSystem
                const goal = this.state.currentGoal;
                const matchesGoal = this.mixing.matchesGoal(goal, mixResult);

                if (matchesGoal) {
                    this.state.progress++;
                    this.ui.updateGoal(this.state.progress, goal.count);

                    // Check level complete using MixingSystem
                    if (this.mixing.isLevelComplete(goal, this.state.progress)) {
                        this.handleLevelComplete();
                    } else {
                        // Mini celebration for goal match (not level complete)
                        this.ui.showMiniCelebration(centerX, centerY, mixResult.resultHex);
                    }
                }
            } else {
                // In free play mode, always celebrate a valid mix!
                this.ui.showMiniCelebration(centerX, centerY, mixResult.resultHex);
            }
        } else {
            // Mud!
            this.ui.setBowlColor(mixResult.resultHex);
            this.ui.setChameleonColor(mixResult.resultHex);
            this.ui.setChameleonMood('sad');
            this.ui.showMudSplat(centerX, centerY);

            // Record failure in tutorial system (may trigger hint)
            if (this.tutorial) {
                this.tutorial.recordFailure();
            }
        }

        // Auto-clear after delay
        setTimeout(() => {
            this.clearBowl();
        }, 2000);
    }

    /**
     * Handle level completion
     */
    handleLevelComplete() {
        // Play celebration sounds
        if (this.audio) {
            this.audio.play('level_complete');
            setTimeout(() => {
                this.audio.play('celebration');
            }, 300);
        }

        // Show celebration
        this.ui.showLevelComplete();

        // Award sticker for this level
        const levelConfig = CONFIG.LEVELS[this.state.currentLevel];
        if (levelConfig && levelConfig.sticker) {
            const stickerInfo = CONFIG.STICKERS[levelConfig.sticker];
            if (stickerInfo && !this.state.stickers.includes(levelConfig.sticker)) {
                this.state.stickers.push(levelConfig.sticker);
                if (this.audio) {
                    this.audio.play('sticker_earned');
                }
                this.ui.showToast(`${this.i18n.t('sticker_earned')} ${stickerInfo.emoji}`, 'success');
            }
        }

        // Check if game complete (all levels done)
        const totalLevels = CONFIG.GAME.TOTAL_LEVELS;
        if (this.state.currentLevel >= totalLevels) {
            // Game complete - unlock free mode
            this.state.freePlayUnlocked = true;
            this.saveProgress();
            this.ui.showFreePlayButton(true);
            setTimeout(() => {
                this.ui.showToast(this.i18n.t('game_complete') || 'Game Complete! Free mode unlocked! 🎉', 'success');
            }, 2000);
        } else {
            // Advance to next level after celebration
            setTimeout(() => {
                this.state.currentLevel++;
                this.saveProgress();
                this.setupLevel(this.state.currentLevel);
                this.ui.showToast(`${this.i18n.t('level', { '0': this.state.currentLevel })}!`, 'info');
            }, 2500);
        }
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
                this.state.freePlayUnlocked = data.freePlayUnlocked || false;
                this.state.stickers = data.stickers || [];
            }
        } catch {
            // Silent failure - localStorage may be unavailable or data corrupt
            this.state.currentLevel = 1;
            this.state.freePlayUnlocked = false;
            this.state.stickers = [];
        }
    }

    /**
     * Save progress
     */
    saveProgress() {
        try {
            localStorage.setItem(CONFIG.STORAGE.PROGRESS, JSON.stringify({
                level: this.state.currentLevel,
                freePlayUnlocked: this.state.freePlayUnlocked,
                stickers: this.state.stickers,
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
        // Clear idle hint timer
        this.clearIdleHintTimer();

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

        // Destroy AudioManager with null check
        if (this.audio && typeof this.audio.destroy === 'function') {
            try {
                this.audio.destroy();
            } catch {
                // Silent failure - audio manager may already be destroyed
            }
        }
        this.audio = null;

        // Clear MixingSystem
        this.mixing = null;

        // Destroy TutorialSystem with null check
        if (this.tutorial && typeof this.tutorial.destroy === 'function') {
            try {
                this.tutorial.destroy();
            } catch {
                // Silent failure - tutorial system may already be destroyed
            }
        }
        this.tutorial = null;

        // Clear remaining references
        this.i18n = null;
        this.state = null;
    }
}

export default ColorMixGame;
