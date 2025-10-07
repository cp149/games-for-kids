/**
 * Music Manager for Drawing Studio
 * Handles background music playback and controls
 */

export class MusicManager {
    constructor() {
        this.tracks = [
            'assets/sound/back1.mp3',
            'assets/sound/back2.mp3',
            'assets/sound/back3.mp3',
            'assets/sound/back4.mp3'
        ];

        this.currentTrack = null;
        this.currentAudio = null;
        this.isPlaying = false;
        this.volume = this.loadVolume();
        this.isMuted = this.loadMuteState();

        this.shuffledTracks = this.shuffleArray([...this.tracks]);
        this.currentIndex = 0;
    }

    /**
     * Shuffle array using Fisher-Yates algorithm
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Load volume from localStorage
     */
    loadVolume() {
        const saved = localStorage.getItem('drawingStudioVolume');
        return saved ? parseFloat(saved) : 0.3; // Default 30%
    }

    /**
     * Save volume to localStorage
     */
    saveVolume() {
        localStorage.setItem('drawingStudioVolume', this.volume.toString());
    }

    /**
     * Load mute state from localStorage
     */
    loadMuteState() {
        const saved = localStorage.getItem('drawingStudioMuted');
        return saved === 'true';
    }

    /**
     * Save mute state to localStorage
     */
    saveMuteState() {
        localStorage.setItem('drawingStudioMuted', this.isMuted.toString());
    }

    /**
     * Start playing music
     */
    async start() {
        if (this.isMuted) {
            console.log('Music is muted');
            return;
        }

        await this.playNextTrack();
    }

    /**
     * Play next track in shuffled order
     */
    async playNextTrack() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }

        this.currentTrack = this.shuffledTracks[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.shuffledTracks.length;

        // Reshuffle when we've played all tracks
        if (this.currentIndex === 0) {
            this.shuffledTracks = this.shuffleArray([...this.tracks]);
        }

        try {
            this.currentAudio = new Audio(this.currentTrack);
            this.currentAudio.volume = this.volume;
            this.currentAudio.loop = false;

            // Play next track when current one ends
            this.currentAudio.addEventListener('ended', () => {
                this.playNextTrack();
            });

            await this.currentAudio.play();
            this.isPlaying = true;
            console.log(`Playing: ${this.currentTrack}`);
        } catch (error) {
            console.error('Failed to play music:', error);
        }
    }

    /**
     * Pause music
     */
    pause() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.isPlaying = false;
        }
    }

    /**
     * Resume music
     */
    resume() {
        if (this.currentAudio && !this.isMuted) {
            this.currentAudio.play();
            this.isPlaying = true;
        }
    }

    /**
     * Toggle play/pause
     */
    toggle() {
        if (this.isPlaying) {
            this.pause();
        } else {
            if (this.currentAudio) {
                this.resume();
            } else {
                this.start();
            }
        }
    }

    /**
     * Set volume (0.0 to 1.0)
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.currentAudio) {
            this.currentAudio.volume = this.volume;
        }
        this.saveVolume();
    }

    /**
     * Mute/unmute music
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        this.saveMuteState();

        if (this.isMuted) {
            this.pause();
        } else {
            if (!this.currentAudio) {
                this.start();
            } else {
                this.resume();
            }
        }

        return this.isMuted;
    }

    /**
     * Get current state
     */
    getState() {
        return {
            isPlaying: this.isPlaying,
            isMuted: this.isMuted,
            volume: this.volume,
            currentTrack: this.currentTrack
        };
    }
}
