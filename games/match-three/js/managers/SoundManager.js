/**
 * SoundManager - Handles sound effects using Web Audio API
 * No audio files needed - all sounds generated programmatically
 */
class SoundManager {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.volume = CONFIG.GAME.AUDIO.SFX_VOLUME;
        this.initFailed = false;
    }

    /**
     * Initialize audio context (must be called after user interaction)
     */
    init() {
        if (this.initFailed) return this;

        if (!this.audioContext) {
            try {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (!AudioContextClass) {
                    console.warn('Web Audio API not supported');
                    this.initFailed = true;
                    return this;
                }
                this.audioContext = new AudioContextClass();
            } catch (error) {
                console.warn('Failed to create AudioContext:', error.message);
                this.initFailed = true;
            }
        }
        return this;
    }

    /**
     * Resume audio context if suspended
     */
    async resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
            } catch (error) {
                console.warn('Failed to resume AudioContext:', error.message);
            }
        }
    }

    /**
     * Create oscillator with common setup
     * @param {string} type - Oscillator type (sine, triangle, square, sawtooth)
     * @param {number} frequency - Initial frequency
     * @returns {{oscillator: OscillatorNode, gainNode: GainNode, ctx: AudioContext}|null}
     */
    createOscillator(type, frequency) {
        if (!this.audioContext) return null;

        try {
            const ctx = this.audioContext;
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

            return { oscillator, gainNode, ctx };
        } catch (error) {
            console.warn('Failed to create oscillator:', error.message);
            return null;
        }
    }

    /**
     * Play swap sound - quick swoosh
     */
    playSwap() {
        if (!this.enabled || !this.audioContext) return;

        try {
            this.resume();
            const setup = this.createOscillator('sine', 400);
            if (!setup) return;

            const { oscillator, gainNode, ctx } = setup;

            oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.1);
        } catch (error) {
            console.warn('Failed to play swap sound:', error.message);
        }
    }

    /**
     * Play match sound - happy chime
     */
    playMatch() {
        if (!this.enabled || !this.audioContext) return;

        try {
            this.resume();
            const ctx = this.audioContext;
            const frequencies = [523, 659, 784]; // C5, E5, G5 chord

            frequencies.forEach((freq, i) => {
                const setup = this.createOscillator('sine', freq);
                if (!setup) return;

                const { oscillator, gainNode } = setup;
                const startTime = ctx.currentTime + i * 0.05;

                gainNode.gain.setValueAtTime(0, startTime);
                gainNode.gain.linearRampToValueAtTime(this.volume * 0.2, startTime + 0.02);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

                oscillator.start(startTime);
                oscillator.stop(startTime + 0.3);
            });
        } catch (error) {
            console.warn('Failed to play match sound:', error.message);
        }
    }

    /**
     * Play cascade/combo sound - rising tone
     */
    playCascade(comboLevel = 1) {
        if (!this.enabled || !this.audioContext) return;

        try {
            this.resume();
            const baseFreq = 400 + comboLevel * 100;
            const setup = this.createOscillator('triangle', baseFreq);
            if (!setup) return;

            const { oscillator, gainNode, ctx } = setup;

            oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.15);
            gainNode.gain.setValueAtTime(this.volume * 0.25, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.2);
        } catch (error) {
            console.warn('Failed to play cascade sound:', error.message);
        }
    }

    /**
     * Play invalid move sound - low buzz
     */
    playInvalid() {
        if (!this.enabled || !this.audioContext) return;

        try {
            this.resume();
            const setup = this.createOscillator('square', 150);
            if (!setup) return;

            const { oscillator, gainNode, ctx } = setup;

            oscillator.frequency.setValueAtTime(100, ctx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(this.volume * 0.15, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.2);
        } catch (error) {
            console.warn('Failed to play invalid sound:', error.message);
        }
    }

    /**
     * Play victory sound - triumphant fanfare
     */
    playVictory() {
        if (!this.enabled || !this.audioContext) return;

        try {
            this.resume();
            const ctx = this.audioContext;
            const notes = [
                { freq: 523, time: 0 },      // C5
                { freq: 659, time: 0.15 },   // E5
                { freq: 784, time: 0.3 },    // G5
                { freq: 1047, time: 0.45 }   // C6
            ];

            notes.forEach(note => {
                const setup = this.createOscillator('sine', note.freq);
                if (!setup) return;

                const { oscillator, gainNode } = setup;
                const startTime = ctx.currentTime + note.time;

                oscillator.frequency.setValueAtTime(note.freq, startTime);
                gainNode.gain.setValueAtTime(0, startTime);
                gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, startTime + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);

                oscillator.start(startTime);
                oscillator.stop(startTime + 0.4);
            });
        } catch (error) {
            console.warn('Failed to play victory sound:', error.message);
        }
    }

    /**
     * Play select sound - soft click
     */
    playSelect() {
        if (!this.enabled || !this.audioContext) return;

        try {
            this.resume();
            const setup = this.createOscillator('sine', 800);
            if (!setup) return;

            const { oscillator, gainNode, ctx } = setup;

            gainNode.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.05);
        } catch (error) {
            console.warn('Failed to play select sound:', error.message);
        }
    }

    /**
     * Toggle sound on/off
     */
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    /**
     * Set volume
     */
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.audioContext) {
            try {
                this.audioContext.close();
            } catch (error) {
                console.warn('Failed to close AudioContext:', error.message);
            }
            this.audioContext = null;
        }
        this.initFailed = false;
    }
}
