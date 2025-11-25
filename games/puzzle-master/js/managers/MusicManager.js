/**
 * MusicManager - Handles background music playback
 */
class MusicManager {
    constructor() {
        this.bgMusic = null;
        this.currentMusicIndex = 0;
        this.isMusicPlaying = false;
        this.handleMusicEnded = null;
    }

    /**
     * Initialize the audio element and event handlers
     */
    init() {
        if (!this.bgMusic) {
            this.bgMusic = new Audio(CONFIG.GAME.MUSIC_FILES[this.currentMusicIndex]);
            this.bgMusic.loop = false;
            this.bgMusic.volume = CONFIG.GAME.MUSIC_VOLUME;

            // Bind handler for cleanup
            this.handleMusicEnded = () => {
                this.currentMusicIndex = (this.currentMusicIndex + 1) % CONFIG.GAME.MUSIC_FILES.length;
                this.bgMusic.src = CONFIG.GAME.MUSIC_FILES[this.currentMusicIndex];
                if (this.isMusicPlaying) {
                    this.bgMusic.play();
                }
            };
            this.bgMusic.addEventListener('ended', this.handleMusicEnded);
        }
    }

    /**
     * Toggle music playback
     */
    toggle() {
        this.init();

        if (this.isMusicPlaying) {
            this.bgMusic.pause();
            this.isMusicPlaying = false;
        } else {
            this.bgMusic.play().catch(() => {});
            this.isMusicPlaying = true;
        }
        this.updateButtonState(this.isMusicPlaying);
    }

    /**
     * Stop music playback
     */
    stop() {
        if (this.bgMusic && this.isMusicPlaying) {
            this.bgMusic.pause();
            this.isMusicPlaying = false;
            this.updateButtonState(false);
        }
    }

    /**
     * Auto-start music (called when first piece is placed)
     */
    autoStart() {
        if (!this.isMusicPlaying) {
            this.init();
            this.bgMusic.play().then(() => {
                this.isMusicPlaying = true;
                this.updateButtonState(true);
            }).catch(() => {});
        }
    }

    /**
     * Update music button appearance based on playing state
     */
    updateButtonState(isPlaying) {
        const btn = document.getElementById('music-btn');
        if (btn) {
            btn.textContent = isPlaying ? '🎵 Stop' : '🎵';
            btn.style.opacity = isPlaying ? '1' : '0.7';
        }
    }

    /**
     * Cleanup all resources
     */
    destroy() {
        if (this.bgMusic) {
            this.bgMusic.pause();
            if (this.handleMusicEnded) {
                this.bgMusic.removeEventListener('ended', this.handleMusicEnded);
            }
            this.bgMusic = null;
        }
        this.isMusicPlaying = false;
    }
}
