/**
 * AudioManager - Sound effects management using Web Audio API
 * For background music, use lib/background-music.js (BackgroundMusicManager)
 */

import { CONFIG } from '../config.js';

export class AudioManager {
    constructor(config = null) {
        this.config = config || CONFIG;

        if (!this.config) {
            throw new Error('Config is required for AudioManager');
        }

        // Audio state
        this.sfxVolume = this.config.AUDIO.VOLUME_SFX;
        this.sfxEnabled = true;

        // Sound effect definitions with Web Audio API tones
        // Musical color drops - each color has a unique instrument/note
        this.sfxDefinitions = {
            // Color pickup sounds (when drag starts)
            pickup_red: { frequency: 261.63, duration: 0.15, type: 'square' },    // C4 - drum-like
            pickup_blue: { frequency: 130.81, duration: 0.2, type: 'triangle' },  // C3 - bass-like
            pickup_yellow: { frequency: 523.25, duration: 0.15, type: 'sine' },   // C5 - piano-like

            // Color drop sounds (when dropped into bowl)
            drop_red: { frequency: 293.66, duration: 0.2, type: 'square' },       // D4 - drum
            drop_blue: { frequency: 146.83, duration: 0.25, type: 'triangle' },   // D3 - bass
            drop_yellow: { frequency: 587.33, duration: 0.2, type: 'sine' },      // D5 - piano

            // Mix result sounds
            mix_success: { frequency: 523.25, duration: 0.3, type: 'sine' },      // C5 - happy
            mix_orange: { frequency: 392.00, duration: 0.3, type: 'sine' },       // G4 - warm
            mix_green: { frequency: 440.00, duration: 0.3, type: 'sine' },        // A4 - fresh
            mix_purple: { frequency: 493.88, duration: 0.3, type: 'sine' },       // B4 - magical
            mix_mud: { frequency: 110.00, duration: 0.4, type: 'sawtooth' },      // A2 - comical

            // UI sounds
            level_complete: { frequency: 659.25, duration: 0.5, type: 'square', chord: true }, // E5 with chord
            sticker_earned: { frequency: 783.99, duration: 0.3, type: 'sine' },   // G5
            button_click: { frequency: 440, duration: 0.08, type: 'sine' },       // A4 - quick click
            clear_bowl: { frequency: 220, duration: 0.15, type: 'triangle' },     // A3 - whoosh

            // Additional UI sounds
            sticker_book_open: { frequency: 523.25, duration: 0.2, type: 'sine' },  // C5
            sticker_book_close: { frequency: 392.00, duration: 0.15, type: 'sine' }, // G4
            undo: { frequency: 330.00, duration: 0.12, type: 'triangle' },         // E4 - soft undo
            hint_appear: { frequency: 880.00, duration: 0.15, type: 'sine' },      // A5 - sparkle
            celebration: { frequency: 523.25, duration: 0.4, type: 'sine', arpeggio: true }, // C5 arpeggio

            // Chameleon reaction sounds
            chameleon_happy: { frequency: 659.25, duration: 0.2, type: 'sine' },   // E5 - happy chirp
            chameleon_sad: { frequency: 196.00, duration: 0.3, type: 'triangle' }, // G3 - sad wah
            chameleon_confused: { frequency: 349.23, duration: 0.25, type: 'square' }, // F4 - confused
            chameleon_eat: { frequency: 523.25, duration: 0.25, type: 'sine', arpeggio: true }, // C5 - nom nom

            // Mixed color pickup sounds (secondary colors)
            pickup_orange: { frequency: 329.63, duration: 0.15, type: 'sine' },   // E4 - warm
            pickup_green: { frequency: 349.23, duration: 0.15, type: 'triangle' }, // F4 - fresh
            pickup_purple: { frequency: 369.99, duration: 0.15, type: 'sine' },   // F#4 - magical
            pickup_brown: { frequency: 220.00, duration: 0.15, type: 'sawtooth' }, // A3 - earthy
            pickup_mixed: { frequency: 392.00, duration: 0.15, type: 'sine' },    // G4 - generic mixed

            // Mixed color drop sounds
            drop_orange: { frequency: 369.99, duration: 0.2, type: 'sine' },      // F#4
            drop_green: { frequency: 392.00, duration: 0.2, type: 'triangle' },   // G4
            drop_purple: { frequency: 415.30, duration: 0.2, type: 'sine' },      // G#4
            drop_brown: { frequency: 246.94, duration: 0.2, type: 'sawtooth' },   // B3
            drop_mixed: { frequency: 440.00, duration: 0.2, type: 'sine' }        // A4 - generic mixed
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
            const volume = volumeOverride !== null ? volumeOverride : this.sfxVolume;

            // Handle special sound types
            if (definition.chord) {
                // Play a major chord (root, major third, perfect fifth)
                this.playChord(definition.frequency, definition.duration, definition.type, volume);
            } else if (definition.arpeggio) {
                // Play ascending arpeggio
                this.playArpeggio(definition.frequency, definition.duration, definition.type, volume);
            } else {
                this.playTone(definition.frequency, definition.duration, definition.type, volume);
            }
        }
    }

    /**
     * Play a tone using Web Audio API with ADSR envelope
     * @param {number} frequency - Frequency in Hz
     * @param {number} duration - Duration in seconds
     * @param {string} type - Oscillator type (sine, square, sawtooth, triangle)
     * @param {number} volume - Volume (0-1)
     * @param {number} startTime - Optional start time offset
     */
    playTone(frequency, duration, type, volume, startTime = 0) {
        if (!this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = type;

            const now = this.audioContext.currentTime + startTime;

            // ADSR envelope for smoother, more musical sound
            const attack = 0.02;
            const decay = duration * 0.2;
            const sustain = volume * 0.7;
            const release = duration * 0.3;

            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(volume, now + attack);
            gainNode.gain.linearRampToValueAtTime(sustain, now + attack + decay);
            gainNode.gain.linearRampToValueAtTime(0, now + duration);

            oscillator.start(now);
            oscillator.stop(now + duration + 0.1);

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
     * Play a major chord
     * @param {number} rootFreq - Root frequency
     * @param {number} duration - Duration in seconds
     * @param {string} type - Oscillator type
     * @param {number} volume - Volume (0-1)
     */
    playChord(rootFreq, duration, type, volume) {
        // Major chord: root, major third (1.26), perfect fifth (1.5)
        const chordVolume = volume * 0.5; // Reduce volume for each note
        this.playTone(rootFreq, duration, type, chordVolume);
        this.playTone(rootFreq * 1.26, duration, type, chordVolume);
        this.playTone(rootFreq * 1.5, duration, type, chordVolume);
    }

    /**
     * Play ascending arpeggio
     * @param {number} rootFreq - Root frequency
     * @param {number} duration - Total duration in seconds
     * @param {string} type - Oscillator type
     * @param {number} volume - Volume (0-1)
     */
    playArpeggio(rootFreq, duration, type, volume) {
        const noteLength = duration / 4;
        const notes = [1, 1.26, 1.5, 2]; // Root, third, fifth, octave

        notes.forEach((ratio, index) => {
            this.playTone(rootFreq * ratio, noteLength, type, volume, index * noteLength * 0.7);
        });
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

export default AudioManager;
