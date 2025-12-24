/**
 * AudioManager - Audio System Manager
 * Handles background music and sound effects
 */

class AudioManager {
    constructor() {
        this.logger = window.Logger;
        this.sounds = new Map();
        this.sfxEnabled = true;
        this.sfxVolume = CONFIG.AUDIO.SFX_VOLUME;

        // Audio context for Web Audio API
        this.audioContext = null;

        // Background music system using lib component
        this.bgMusic = new BackgroundMusicManager({
            tracks: CONFIG.AUDIO.MUSIC_TRACKS || [],
            volume: CONFIG.AUDIO.MUSIC_VOLUME,
            autoStart: false,
            autoPauseOnTabHidden: true, // Auto-pause when tab hidden (lib feature)
            logger: this.logger
        });

        this.init();
    }

    /**
     * Initialize audio system
     */
    init() {
        // Load SFX preferences
        this.sfxEnabled = localStorage.getItem(CONFIG.STORAGE.SFX_ENABLED) !== 'false';

        // Initialize Web Audio API
        this.initAudioContext();

        // Preload sound effects
        this.preloadSounds();

        this.logger.info('AudioManager: Initialized');
    }

    /**
     * Initialize Web Audio API context
     */
    initAudioContext() {
        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.logger.info('AudioManager: Web Audio API initialized');
            } catch (err) {
                this.logger.warn('AudioManager: Web Audio API not supported');
            }
        }
    }

    /**
     * Preload sound effects (Web Audio API - no files needed)
     */
    preloadSounds() {
        // Define sound parameters (frequency, duration, type)
        const soundParams = {
            click_valid: { freq: 800, duration: 0.1, type: 'sine' },
            click_invalid: { freq: 200, duration: 0.2, type: 'sawtooth' },
            undo: { freq: 600, duration: 0.15, type: 'triangle' },
            path_complete: { freq: 1000, duration: 0.3, type: 'sine' },
            win: { freq: 1200, duration: 0.5, type: 'sine', ascending: true },
            lose: { freq: 300, duration: 0.4, type: 'sawtooth', descending: true },
            countdown: { freq: 900, duration: 0.15, type: 'square' },
            go: { freq: 1500, duration: 0.2, type: 'sine' }
        };

        // Store sound parameters
        Object.entries(soundParams).forEach(([key, params]) => {
            this.sounds.set(key, params);
        });

        this.logger.info(`AudioManager: Initialized ${this.sounds.size} Web Audio sounds`);
    }

    /**
     * Play a sound effect using Web Audio API
     * @param {string} soundKey - Key of sound to play
     */
    playSound(soundKey) {
        if (!this.sfxEnabled || !this.audioContext) return;

        const params = this.sounds.get(soundKey);
        if (!params) {
            this.logger.warn(`AudioManager: Sound not found: ${soundKey}`);
            return;
        }

        try {
            const now = this.audioContext.currentTime;

            // Create oscillator
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            // Set waveform type
            oscillator.type = params.type || 'sine';

            // Set frequency (with pitch variation for special sounds)
            if (params.ascending) {
                oscillator.frequency.setValueAtTime(params.freq * 0.8, now);
                oscillator.frequency.linearRampToValueAtTime(params.freq * 1.2, now + params.duration);
            } else if (params.descending) {
                oscillator.frequency.setValueAtTime(params.freq * 1.2, now);
                oscillator.frequency.linearRampToValueAtTime(params.freq * 0.8, now + params.duration);
            } else {
                oscillator.frequency.setValueAtTime(params.freq, now);
            }

            // Set volume envelope (fade in/out for smoother sound)
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(this.sfxVolume * 0.3, now + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + params.duration);

            // Play
            oscillator.start(now);
            oscillator.stop(now + params.duration);

        } catch (err) {
            this.logger.warn(`AudioManager: Failed to play sound ${soundKey}:`, err);
        }
    }

    /**
     * Start background music
     */
    startBackgroundMusic() {
        this.bgMusic.start();
        this.logger.info('AudioManager: Background music started');
    }

    /**
     * Stop background music
     */
    stopBackgroundMusic() {
        this.bgMusic.stop();
    }

    /**
     * Toggle background music on/off
     */
    toggleMusic() {
        const isEnabled = this.bgMusic.toggle();
        this.logger.info(`AudioManager: Music ${isEnabled ? 'enabled' : 'disabled'}`);
        return isEnabled;
    }

    /**
     * Set music volume
     * @param {number} volume - Volume level (0-1)
     */
    setMusicVolume(volume) {
        this.bgMusic.setVolume(volume);
    }

    /**
     * Toggle sound effects on/off
     */
    toggleSFX() {
        this.sfxEnabled = !this.sfxEnabled;
        localStorage.setItem(CONFIG.STORAGE.SFX_ENABLED, this.sfxEnabled);
        this.logger.info(`AudioManager: SFX ${this.sfxEnabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Set SFX volume
     * @param {number} volume - Volume level (0-1)
     */
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.logger.info(`AudioManager: SFX volume set to ${this.sfxVolume}`);
    }

    /**
     * Cleanup resources
     */
    destroy() {
        this.bgMusic.destroy();

        // Clear sound parameters
        this.sounds.clear();

        // Close audio context
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }

        this.logger.info('AudioManager: Destroyed');
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
}
