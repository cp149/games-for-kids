/**
 * GameFeedbackSystem - Visual and Audio Feedback Orchestration
 * Handles all game feedback including mix results, celebrations, and notifications
 *
 * Extracted from ColorMixGame to follow Single Responsibility Principle
 * Uses dependency injection for loose coupling
 */

export class GameFeedbackSystem {
    /**
     * @param {Object} options
     * @param {Object} options.ui - UIManager instance
     * @param {Object} options.audio - AudioManager instance
     * @param {Object} options.i18n - i18n instance for translations
     * @param {Function} options.setTimeout - Safe setTimeout wrapper
     */
    constructor(options = {}) {
        this.ui = options.ui || null;
        this.audio = options.audio || null;
        this.i18n = options.i18n || { t: (key) => key };
        this._setTimeout = options.setTimeout || ((fn, ms) => setTimeout(fn, ms));
    }

    /**
     * Show feedback for mix result
     * @param {Object} mixResult - Result from MixingSystem.mix()
     * @param {Object} position - { centerX, centerY } for effects
     */
    showMixFeedback(mixResult, position = {}) {
        const { centerX = 0, centerY = 0 } = position;

        // Show swirl effect during mixing
        if (this.ui) {
            this.ui.showSwirlEffect(mixResult.resultHex);
        }

        // Play mix sound based on result
        if (this.audio) {
            if (mixResult.type === 'mud') {
                this.audio.play('mix_mud');
            } else {
                this.audio.play(`mix_${mixResult.result}`);

                // Play musical chord for the mixed color (educational audio feedback)
                this._playMixChord(mixResult.result);
            }
        }

        if (mixResult.type !== 'mud') {
            this._showSuccessFeedback(mixResult);
        } else {
            this._showMudFeedback(mixResult, centerX, centerY);
        }
    }

    /**
     * Show success mix feedback
     * @private
     */
    _showSuccessFeedback(mixResult) {
        if (!this.ui) return;

        // Update visuals
        this.ui.setBowlColor(mixResult.resultHex);
        this.ui.setChameleonColor(mixResult.resultHex);
        this.ui.setChameleonMood('happy');
        this.ui.showSplashIcon(mixResult.emoji, mixResult.resultHex);

        // Show educational formula overlay for secondary colors
        if (mixResult.type === 'secondary' && mixResult.inputColors?.length === 2) {
            this.ui.showFormulaOverlay(
                mixResult.inputColors[0],
                mixResult.inputColors[1],
                mixResult.result
            );
        }

        // Update dynamic atmosphere based on mixed color
        this._updateAtmosphere(mixResult.result);

        // Show real-world context toast (educational association)
        this._showColorContext(mixResult.result);

        // Show emoji particle burst celebration
        this._showParticleBurst(mixResult.result, mixResult.resultHex);

        // Show combo text effect
        this._showComboText(mixResult);
    }

    /**
     * Show mud (failed mix) feedback
     * @private
     */
    _showMudFeedback(mixResult, centerX, centerY) {
        if (!this.ui) return;

        this.ui.setBowlColor(mixResult.resultHex);
        this.ui.setChameleonColor(mixResult.resultHex);
        this.ui.setChameleonMood('sad');
        this.ui.showMudSplat(centerX, centerY);
    }


    /**
     * Show real-world context for the mixed color (educational)
     * @param {string} colorName - Name of the color
     * @private
     */
    _showColorContext(colorName) {
        // Import CONFIG dynamically to avoid circular dependency
        const CONFIG = window.CONFIG || (typeof require !== 'undefined' ? require('../config.js').CONFIG : null);
        if (!CONFIG?.COLOR_CONTEXT) return;

        const context = CONFIG.COLOR_CONTEXT[colorName];
        if (context && this.ui) {
            // Show fun fact toast after a short delay
            this._setTimeout(() => {
                if (this.ui) {
                    const message = `${context.object} ${context.funFact}`;
                    this.ui.showToast(message, 'info');
                }
            }, 500);
        }
    }

    /**
     * Show emoji particle burst for celebration
     * @param {string} colorName - Name of the color
     * @param {string} colorHex - Hex color value
     * @private
     */
    _showParticleBurst(colorName, colorHex) {
        const CONFIG = window.CONFIG || (typeof require !== 'undefined' ? require('../config.js').CONFIG : null);
        if (!CONFIG?.PARTICLE_EMOJIS) return;

        const emojis = CONFIG.PARTICLE_EMOJIS[colorName];
        if (emojis && this.ui) {
            // Create particle burst at bowl center
            this.ui.showParticleBurst(emojis, colorHex);
        }
    }

    /**
     * Show floating combo text for successful mix
     * @param {Object} mixResult - The mix result
     */
    _showComboText(mixResult) {
        if (!this.ui?.showComboText || !mixResult) return;

        // Build combo text based on result
        let comboText = '';
        if (mixResult.emoji) {
            comboText = `${mixResult.emoji} Mix!`;
        } else {
            comboText = '✨ Nice!';
        }

        // Get bowl element for positioning
        const bowl = this.ui?.getBowl?.();
        if (bowl) {
            this.ui.showComboText(comboText, bowl);
        }
    }


    /**
     * Play musical chord for mixed color
     * @param {string} colorName - Name of the mixed color
     * @private
     */
    _playMixChord(colorName) {
        const CONFIG = window.CONFIG || (typeof require !== 'undefined' ? require('../config.js').CONFIG : null);
        if (!CONFIG?.COLOR_NOTES || !this.audio) return;

        const colorNote = CONFIG.COLOR_NOTES[colorName];
        if (colorNote?.frequencies) {
            // Play chord for mixed colors (multiple frequencies)
            this._setTimeout(() => {
                if (this.audio && this.audio.playChord) {
                    this.audio.playChord(colorNote.frequencies, 0.4);
                }
            }, 200);
        } else if (colorNote?.frequency) {
            // Play single note for primary colors
            this._setTimeout(() => {
                if (this.audio && this.audio.playTone) {
                    this.audio.playTone(colorNote.frequency, 0.3);
                }
            }, 200);
        }
    }


    /**
     * Update background atmosphere based on mixed color
     * Creates immersive color-themed environment for kids
     * @param {string} colorName - Name of the mixed color
     * @private
     */
    _updateAtmosphere(colorName) {
        if (typeof document === 'undefined') return;

        const body = document.body;
        const atmosphereModes = ['mode-orange', 'mode-green', 'mode-purple', 'mode-brown'];

        // Remove all existing atmosphere modes
        atmosphereModes.forEach(mode => body.classList.remove(mode));

        // Add new atmosphere based on color
        switch (colorName) {
            case 'orange':
                body.classList.add('mode-orange');
                break;
            case 'green':
                body.classList.add('mode-green');
                break;
            case 'purple':
                body.classList.add('mode-purple');
                break;
            case 'brown':
            case 'mud':
                body.classList.add('mode-brown');
                break;
            // No atmosphere change for other colors (keep neutral)
        }
    }

    /**
     * Show mini celebration for goal match
     * @param {number} centerX - X position
     * @param {number} centerY - Y position
     * @param {string} colorHex - Color for celebration
     */
    showGoalMatchCelebration(centerX, centerY, colorHex) {
        if (this.ui) {
            this.ui.showMiniCelebration(centerX, centerY, colorHex);
        }
    }

    /**
     * Show level complete celebration
     * @returns {Promise} Resolves when celebration animations start
     */
    showLevelCompleteCelebration() {
        // Play celebration sounds
        if (this.audio) {
            this.audio.play('level_complete');
            this._setTimeout(() => {
                if (this.audio) {
                    this.audio.play('celebration');
                }
            }, 300);
        }

        // Show visual celebration
        if (this.ui) {
            this.ui.showLevelComplete();
        }
    }

    /**
     * Show sticker earned notification
     * @param {Object} stickerInfo - Sticker definition with emoji
     */
    showStickerEarned(stickerInfo) {
        if (this.audio) {
            this.audio.play('sticker_earned');
        }

        if (this.ui && stickerInfo) {
            const message = `${this.i18n.t('sticker_earned')} ${stickerInfo.emoji}`;
            this.ui.showToast(message, 'success');
        }
    }

    /**
     * Show game complete notification
     */
    showGameComplete() {
        if (this.ui) {
            this.ui.showFreePlayButton(true);
            this._setTimeout(() => {
                if (this.ui) {
                    const message = this.i18n.t('game_complete') || 'Game Complete! Free mode unlocked! 🎉';
                    this.ui.showToast(message, 'success');
                }
            }, 2000);
        }
    }

    /**
     * Show level transition notification
     * @param {number} level - New level number
     */
    showLevelTransition(level) {
        if (this.ui) {
            const message = this.i18n.t('level', { '0': level }) || `Level ${level}`;
            this.ui.showToast(`${message}!`, 'info');
        }
    }

    /**
     * Show toast message
     * @param {string} message - Message to display
     * @param {string} type - Toast type (success, info, error)
     */
    showToast(message, type = 'info') {
        if (this.ui) {
            this.ui.showToast(message, type);
        }
    }

    /**
     * Cleanup resources
     */
    destroy() {
        this.ui = null;
        this.audio = null;
        this.i18n = null;
    }
}

// Dual export pattern for browser and Node.js
if (typeof window !== 'undefined') {
    window.GameFeedbackSystem = GameFeedbackSystem;
}

export default GameFeedbackSystem;
