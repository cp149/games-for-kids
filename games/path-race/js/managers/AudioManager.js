/**
 * AudioManager - Audio System Manager
 * Handles background music and sound effects
 */

class AudioManager {
    constructor() {
        this.logger = window.Logger;
        this.sounds = new Map();
        this.musicEnabled = true;
        this.sfxEnabled = true;
        this.musicVolume = CONFIG.AUDIO.MUSIC_VOLUME;
        this.sfxVolume = CONFIG.AUDIO.SFX_VOLUME;

        // Audio context for better control
        this.audioContext = null;
        this.musicElement = null;

        this.init();
    }

    /**
     * Initialize audio system
     */
    init() {
        // Load preferences
        this.musicEnabled = localStorage.getItem(CONFIG.STORAGE.MUSIC_ENABLED) !== 'false';
        this.sfxEnabled = localStorage.getItem(CONFIG.STORAGE.SFX_ENABLED) !== 'false';

        // Preload sound effects
        this.preloadSounds();

        // Setup background music if available
        this.setupBackgroundMusic();

        // Handle visibility change (pause music when tab hidden)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseMusic();
            } else if (this.musicEnabled) {
                this.resumeMusic();
            }
        });

        this.logger.info('AudioManager: Initialized');
    }

    /**
     * Preload sound effects
     */
    preloadSounds() {
        const soundFiles = {
            click_valid: 'assets/sounds/sfx/click.mp3',
            click_invalid: 'assets/sounds/sfx/error.mp3',
            undo: 'assets/sounds/sfx/undo.mp3',
            path_complete: 'assets/sounds/sfx/success.mp3',
            win: 'assets/sounds/sfx/win.mp3',
            lose: 'assets/sounds/sfx/lose.mp3',
            countdown: 'assets/sounds/sfx/countdown.mp3',
            go: 'assets/sounds/sfx/go.mp3'
        };

        // Create Audio elements for each sound
        Object.entries(soundFiles).forEach(([key, path]) => {
            const audio = new Audio();
            audio.src = path;
            audio.volume = this.sfxVolume;
            audio.preload = 'auto';

            // Handle loading errors gracefully
            audio.addEventListener('error', () => {
                this.logger.warn(`AudioManager: Failed to load sound: ${path}`);
            });

            this.sounds.set(key, audio);
        });

        this.logger.info(`AudioManager: Preloaded ${this.sounds.size} sounds`);
    }

    /**
     * Setup background music
     */
    setupBackgroundMusic() {
        // Use background-music.js component if available
        if (typeof BackgroundMusic !== 'undefined') {
            this.musicElement = new BackgroundMusic({
                volume: this.musicVolume,
                autoplay: false,
                loop: true
            });

            if (this.musicEnabled) {
                this.playMusic();
            }
        } else {
            this.logger.warn('AudioManager: BackgroundMusic component not available');
        }
    }

    /**
     * Play a sound effect
     * @param {string} soundKey - Key of sound to play
     */
    playSound(soundKey) {
        if (!this.sfxEnabled) return;

        const sound = this.sounds.get(soundKey);
        if (!sound) {
            // Sound not loaded, skip silently
            return;
        }

        // Clone and play (allows overlapping sounds)
        const clone = sound.cloneNode();
        clone.volume = this.sfxVolume;

        clone.play().catch(err => {
            // Fail silently for missing audio files
        });

        // Cleanup after playing
        clone.addEventListener('ended', () => {
            clone.remove();
        });
    }

    /**
     * Play background music
     */
    playMusic() {
        if (!this.musicEnabled || !this.musicElement) return;

        try {
            this.musicElement.play();
            this.logger.info('AudioManager: Music started');
        } catch (err) {
            this.logger.warn('AudioManager: Failed to play music:', err);
        }
    }

    /**
     * Pause background music
     */
    pauseMusic() {
        if (this.musicElement) {
            this.musicElement.pause();
        }
    }

    /**
     * Resume background music
     */
    resumeMusic() {
        if (this.musicEnabled && this.musicElement) {
            this.musicElement.play();
        }
    }

    /**
     * Toggle music on/off
     */
    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        localStorage.setItem(CONFIG.STORAGE.MUSIC_ENABLED, this.musicEnabled);

        if (this.musicEnabled) {
            this.playMusic();
        } else {
            this.pauseMusic();
        }

        this.logger.info(`AudioManager: Music ${this.musicEnabled ? 'enabled' : 'disabled'}`);
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
     * Set music volume
     * @param {number} volume - Volume level (0-1)
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.musicElement) {
            this.musicElement.setVolume(this.musicVolume);
        }
    }

    /**
     * Set SFX volume
     * @param {number} volume - Volume level (0-1)
     */
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.sounds.forEach(sound => {
            sound.volume = this.sfxVolume;
        });
    }

    /**
     * Cleanup resources
     */
    destroy() {
        this.pauseMusic();

        this.sounds.forEach(sound => {
            sound.pause();
            sound.src = '';
        });
        this.sounds.clear();

        if (this.musicElement && this.musicElement.destroy) {
            this.musicElement.destroy();
        }

        this.logger.info('AudioManager: Destroyed');
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
}
