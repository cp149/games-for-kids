/**
 * Audio Manager - Handles all game sound effects and music
 */

class AudioManager {
    constructor() {
        this.sounds = {};
        this.musicVolume = CONFIG.AUDIO.MUSIC_VOLUME;
        this.sfxVolume = CONFIG.AUDIO.SFX_VOLUME;
        this.enabled = true;

        // Initialize Web Audio API
        this.audioContext = null;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }

        // Background music system using lib component
        this.bgMusic = new BackgroundMusicManager({
            tracks: [
                'assets/sounds/1.mp3',
                'assets/sounds/2.mp3',
                'assets/sounds/3.mp3',
                'assets/sounds/4.mp3',
                'assets/sounds/5.mp3'
            ],
            volume: CONFIG.AUDIO.MUSIC_VOLUME,
            autoPauseOnTabHidden: true,
            logger: window.Logger || console
        });

        this.createSounds();
    }

    /**
     * Create procedural sound effects using Web Audio API
     */
    createSounds() {
        if (!this.audioContext) return;

        // Sound definitions
        this.soundDefs = {
            eat: { type: 'eat', freq: 800, duration: 0.1 },
            speedBoost: { type: 'powerup', freq: 1200, duration: 0.2 },
            bonus: { type: 'powerup', freq: 1500, duration: 0.3 },
            golden: { type: 'golden', freq: 2000, duration: 0.4 },
            death: { type: 'death', freq: 200, duration: 0.5 },
            achievement: { type: 'achievement', freq: 1000, duration: 0.6 },
            aiDeath: { type: 'aideath', freq: 400, duration: 0.3 }
        };
    }

    /**
     * Play sound effect
     */
    play(soundName) {
        if (!this.enabled || !this.audioContext) return;

        const def = this.soundDefs[soundName];
        if (!def) return;

        // Resume audio context if suspended (browser policy)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        const now = this.audioContext.currentTime;

        switch (def.type) {
            case 'eat':
                this.playEatSound(now, def);
                break;
            case 'powerup':
                this.playPowerUpSound(now, def);
                break;
            case 'golden':
                this.playGoldenSound(now, def);
                break;
            case 'death':
                this.playDeathSound(now, def);
                break;
            case 'achievement':
                this.playAchievementSound(now, def);
                break;
            case 'aideath':
                this.playAIDeathSound(now, def);
                break;
        }
    }

    /**
     * Play eat sound (simple beep)
     */
    playEatSound(startTime, def) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.frequency.value = def.freq;
        osc.type = 'sine';

        gain.gain.setValueAtTime(this.sfxVolume * 0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + def.duration);

        osc.start(startTime);
        osc.stop(startTime + def.duration);
    }

    /**
     * Play power-up sound (rising tone)
     */
    playPowerUpSound(startTime, def) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.frequency.setValueAtTime(def.freq * 0.8, startTime);
        osc.frequency.exponentialRampToValueAtTime(def.freq * 1.2, startTime + def.duration);
        osc.type = 'square';

        gain.gain.setValueAtTime(this.sfxVolume * 0.4, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + def.duration);

        osc.start(startTime);
        osc.stop(startTime + def.duration);
    }

    /**
     * Play golden food sound (sparkle effect)
     */
    playGoldenSound(startTime, def) {
        for (let i = 0; i < 3; i++) {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            const offset = i * 0.1;
            osc.frequency.value = def.freq + (i * 200);
            osc.type = 'sine';

            gain.gain.setValueAtTime(this.sfxVolume * 0.2, startTime + offset);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + offset + 0.15);

            osc.start(startTime + offset);
            osc.stop(startTime + offset + 0.15);
        }
    }

    /**
     * Play death sound (descending noise)
     */
    playDeathSound(startTime, def) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.frequency.setValueAtTime(def.freq, startTime);
        osc.frequency.exponentialRampToValueAtTime(50, startTime + def.duration);
        osc.type = 'sawtooth';

        gain.gain.setValueAtTime(this.sfxVolume * 0.5, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + def.duration);

        osc.start(startTime);
        osc.stop(startTime + def.duration);
    }

    /**
     * Play achievement sound (fanfare)
     */
    playAchievementSound(startTime, def) {
        const freqs = [def.freq, def.freq * 1.25, def.freq * 1.5, def.freq * 2];

        freqs.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            const offset = i * 0.12;
            osc.frequency.value = freq;
            osc.type = 'triangle';

            gain.gain.setValueAtTime(this.sfxVolume * 0.3, startTime + offset);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + offset + 0.2);

            osc.start(startTime + offset);
            osc.stop(startTime + offset + 0.2);
        });
    }

    /**
     * Play AI death sound (muted version)
     */
    playAIDeathSound(startTime, def) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.frequency.setValueAtTime(def.freq, startTime);
        osc.frequency.exponentialRampToValueAtTime(100, startTime + def.duration);
        osc.type = 'triangle';

        gain.gain.setValueAtTime(this.sfxVolume * 0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + def.duration);

        osc.start(startTime);
        osc.stop(startTime + def.duration);
    }

    /**
     * Toggle sound
     */
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    /**
     * Set volume
     */
    setVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }

    /**
     * Start background music (random looping)
     */
    startBackgroundMusic() {
        this.bgMusic.start();
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
        return this.bgMusic.toggle();
    }

    /**
     * Set music volume
     */
    setMusicVolume(volume) {
        this.bgMusic.setVolume(volume);
    }

    /**
     * Cleanup
     */
    destroy() {
        this.bgMusic.destroy();

        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AudioManager };
}
