/**
 * AudioManager - Sound effects management using Web Audio API
 * For background music, use lib/background-music.js (BackgroundMusicManager)
 */

class AudioManager {
    constructor(config = null) {
        this.config = config || (typeof CONFIG !== 'undefined' ? CONFIG : null);

        if (!this.config) {
            throw new Error('Config is required for AudioManager');
        }

        // Audio state
        this.sfxVolume = this.config.AUDIO.VOLUME_SFX;
        this.sfxEnabled = true;

        // Sound effect definitions with Web Audio API tones
        this.sfxDefinitions = {
            mix_success: { frequency: 523.25, duration: 0.2, type: 'sine' }, // C5 note
            mix_mud: { frequency: 130.81, duration: 0.3, type: 'sawtooth' }, // C3 note
            level_complete: { frequency: 659.25, duration: 0.5, type: 'square' }, // E5 note
            sticker_earned: { frequency: 783.99, duration: 0.3, type: 'sine' }, // G5 note
            button_click: { frequency: 440, duration: 0.1, type: 'sine' } // A4 note
        };

        // Web Audio API context (created lazily)
        this.audioContext = null;
    }

    /**
     * Initialize Web Audio API context
     * Must be called after user interaction for browser compatibility
     */
    initAudioContext() {
        if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
            if (!this.audioContext) {
                this.audioContext = new (AudioContext || webkitAudioContext)();
            }
        }
    }

    /**
     * Load audio resources
     * @returns {Promise} Resolves when loading complete
     */
    async load() {
        this.initAudioContext();
        return Promise.resolve();
    }

    /**
     * Play a sound effect
     * @param {string} sfxName - Name of the sound effect
     * @param {number} volumeOverride - Optional volume override (0-1)
     */
    play(sfxName, volumeOverride = null) {
        if (!this.sfxEnabled) return;

        const definition = this.sfxDefinitions[sfxName];
        if (!definition) {
            // Use Logger if available, otherwise silent
            if (typeof Logger !== 'undefined') {
                Logger.warn(`Sound effect '${sfxName}' not found`);
            }
            return;
        }

        if (this.audioContext) {
            this.playTone(
                definition.frequency,
                definition.duration,
                definition.type,
                volumeOverride !== null ? volumeOverride : this.sfxVolume
            );
        }
    }

    /**
     * Play a tone using Web Audio API
     * @param {number} frequency - Frequency in Hz
     * @param {number} duration - Duration in seconds
     * @param {string} type - Oscillator type (sine, square, sawtooth, triangle)
     * @param {number} volume - Volume (0-1)
     */
    playTone(frequency, duration, type, volume) {
        if (!this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = type;
            gainNode.gain.value = volume;

            const now = this.audioContext.currentTime;
            oscillator.start(now);
            oscillator.stop(now + duration);

            // Cleanup
            oscillator.onended = () => {
                oscillator.disconnect();
                gainNode.disconnect();
            };
        } catch (error) {
            if (typeof Logger !== 'undefined') {
                Logger.warn('Failed to play tone:', error);
            }
        }
    }

    /**
     * Set SFX volume level
     * @param {number} level - Volume level (0-1)
     */
    setVolume(level) {
        this.sfxVolume = Math.max(0, Math.min(1, level));
    }

    /**
     * Get current SFX volume level
     * @returns {number} Current volume (0-1)
     */
    getVolume() {
        return this.sfxVolume;
    }

    /**
     * Enable/disable sound effects
     * @param {boolean} enabled - True to enable, false to disable
     */
    setSfxEnabled(enabled) {
        this.sfxEnabled = enabled;
    }

    /**
     * Check if sound effects are enabled
     * @returns {boolean} True if enabled
     */
    isSfxEnabled() {
        return this.sfxEnabled;
    }

    /**
     * Clean up resources
     */
    destroy() {
        if (this.audioContext) {
            try {
                this.audioContext.close();
            } catch (error) {
                // Ignore errors during cleanup
            }
            this.audioContext = null;
        }
    }
}

// Export for Node.js tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
}

// Export for browser
if (typeof window !== 'undefined') {
    window.AudioManager = AudioManager;
}
