/**
 * MusicManager - Handles background music and sound effects
 * Uses Web Audio API for sound effects (via SoundManager)
 */

class MusicManager {
    constructor() {
        this.bgMusic = null;
        this.sfxEnabled = true;
        this.musicEnabled = true;
        this.currentMusicIndex = 0;
        this.handleMusicEnded = null;

        // Sound effects via Web Audio API
        this.soundManager = new SoundManager();

        // SFX strategy map - replaces switch statement
        this.sfxStrategies = null;

        this.init();
    }

    /**
     * Initialize music manager
     */
    init() {
        // Create background music element
        this.bgMusic = new Audio();
        this.bgMusic.loop = false;
        this.bgMusic.volume = CONFIG.GAME.AUDIO.MUSIC_VOLUME;

        // Track audio loading state
        this.audioLoadError = false;
        this.audioErrorCount = 0;

        // Setup music ended handler
        this.handleMusicEnded = () => {
            const musicFiles = CONFIG.GAME.AUDIO.MUSIC_FILES;
            this.currentMusicIndex = (this.currentMusicIndex + 1) % musicFiles.length;
            this.bgMusic.src = musicFiles[this.currentMusicIndex];
            if (this.musicEnabled) {
                this.playWithErrorHandling();
            }
        };
        this.bgMusic.addEventListener('ended', this.handleMusicEnded);

        // Setup error handler for audio loading failures
        this.handleAudioError = (event) => {
            this.audioErrorCount++;
            this.audioLoadError = true;
            console.warn(`Audio loading failed: ${this.bgMusic.src}`, event);

            // Try next track if available (max 3 retries)
            if (this.audioErrorCount < 3) {
                const musicFiles = CONFIG.GAME.AUDIO.MUSIC_FILES;
                if (musicFiles.length > 1) {
                    this.currentMusicIndex = (this.currentMusicIndex + 1) % musicFiles.length;
                    this.bgMusic.src = musicFiles[this.currentMusicIndex];
                    this.playWithErrorHandling();
                }
            } else {
                console.warn('Audio playback disabled after multiple failures');
                this.musicEnabled = false;
            }
        };
        this.bgMusic.addEventListener('error', this.handleAudioError);

        // Initialize SFX strategy map
        this.sfxStrategies = {
            'SWAP': () => this.soundManager.playSwap(),
            'MATCH': () => this.soundManager.playMatch(),
            'CASCADE': () => this.soundManager.playCascade(),
            'VICTORY': () => this.soundManager.playVictory(),
            'INVALID': () => this.soundManager.playInvalid(),
            'SELECT': () => this.soundManager.playSelect()
        };
    }

    /**
     * Play audio with error handling
     * @private
     */
    playWithErrorHandling() {
        this.bgMusic.play().catch(err => {
            // Ignore AbortError (normal when switching tracks quickly)
            if (err.name !== 'AbortError') {
                console.warn('Audio play failed:', err.message);
            }
        });
    }

    /**
     * Start background music
     */
    startMusic() {
        if (!this.musicEnabled) return;

        const musicFiles = CONFIG.GAME.AUDIO.MUSIC_FILES;
        if (musicFiles.length === 0) return;

        // Reset error count on manual start
        this.audioErrorCount = 0;
        this.audioLoadError = false;

        this.bgMusic.src = musicFiles[this.currentMusicIndex];
        this.playWithErrorHandling();

        // Initialize sound manager on first user interaction
        this.soundManager.init();
    }

    /**
     * Stop background music
     */
    stopMusic() {
        if (this.bgMusic) {
            this.bgMusic.pause();
            this.bgMusic.currentTime = 0;
        }
    }

    /**
     * Toggle background music
     */
    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;

        if (this.musicEnabled) {
            this.startMusic();
        } else {
            this.stopMusic();
        }

        return this.musicEnabled;
    }

    /**
     * Play sound effect using Web Audio API
     * Uses strategy pattern for cleaner code
     * @param {string} name - SFX name (SWAP, MATCH, CASCADE, VICTORY, INVALID, SELECT)
     */
    playSFX(name) {
        if (!this.sfxEnabled) return;

        // Initialize on first use
        this.soundManager.init();

        // Use strategy map instead of switch
        const strategy = this.sfxStrategies[name];
        if (strategy) {
            strategy();
        }
    }

    /**
     * Toggle sound effects
     */
    toggleSFX() {
        this.sfxEnabled = !this.sfxEnabled;
        this.soundManager.enabled = this.sfxEnabled;
        return this.sfxEnabled;
    }

    /**
     * Set music volume
     */
    setMusicVolume(volume) {
        if (this.bgMusic) {
            this.bgMusic.volume = Math.max(0, Math.min(1, volume));
        }
    }

    /**
     * Check if music is playing
     */
    isMusicPlaying() {
        return this.musicEnabled && this.bgMusic && !this.bgMusic.paused;
    }

    /**
     * Clean up resources
     */
    destroy() {
        // Remove event listeners BEFORE stopping (to prevent ended event)
        if (this.bgMusic) {
            if (this.handleMusicEnded) {
                this.bgMusic.removeEventListener('ended', this.handleMusicEnded);
                this.handleMusicEnded = null;
            }
            if (this.handleAudioError) {
                this.bgMusic.removeEventListener('error', this.handleAudioError);
                this.handleAudioError = null;
            }
        }

        // Stop and release audio resources
        if (this.bgMusic) {
            this.bgMusic.pause();
            this.bgMusic.src = '';
            this.bgMusic.load(); // Reset audio element
            this.bgMusic = null;
        }

        // Destroy sound manager
        if (this.soundManager) {
            this.soundManager.destroy();
            this.soundManager = null;
        }

        this.musicEnabled = false;
        this.sfxEnabled = false;
        this.audioLoadError = false;
        this.audioErrorCount = 0;
    }
}
