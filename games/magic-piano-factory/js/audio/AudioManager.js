/**
 * Audio Manager - Web Audio API implementation for piano sounds
 */

export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.oscillators = new Map();
        this.isMuted = false;
        this.volume = 0.7;
        this.noteFrequencies = {};
        this.isInitialized = false;
    }

    /**
     * Initialize the audio system
     */
    async init() {
        try {
            // Initialize note frequencies first (no audio context needed)
            this.initializeNoteFrequencies();
            
            // Mark as initialized but audio context will be created on first user interaction
            this.isInitialized = true;
            console.log('✅ Audio Manager initialized (audio context will start on user interaction)');

        } catch (error) {
            console.error('Failed to initialize audio manager:', error);
            throw error;
        }
    }

    /**
     * Create audio context (called on first user interaction)
     */
    async createAudioContext() {
        if (this.audioContext) return true;

        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create master gain node
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.setValueAtTime(this.volume, this.audioContext.currentTime);

            // Resume audio context if needed
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            console.log('🔊 Audio Context created and ready');
            return true;

        } catch (error) {
            console.error('Failed to create audio context:', error);
            return false;
        }
    }

    /**
     * Initialize note frequencies using equal temperament tuning
     */
    initializeNoteFrequencies() {
        // A4 = 440 Hz (reference)
        const A4 = 440;
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        
        // Calculate frequencies for full piano range (octaves 0-8)
        for (let octave = 0; octave <= 8; octave++) {
            for (let i = 0; i < noteNames.length; i++) {
                const noteName = noteNames[i];
                const noteNumber = octave * 12 + i;
                const A4NoteNumber = 4 * 12 + 9; // A4 note number
                const semitoneDistance = noteNumber - A4NoteNumber;
                const frequency = A4 * Math.pow(2, semitoneDistance / 12);
                
                this.noteFrequencies[`${noteName}${octave}`] = frequency;
            }
        }

        // Debug: Log some specific notes
        console.log('🎵 Note frequencies initialized');
        console.log('Sample frequencies:', {
            'A0': this.noteFrequencies['A0'],
            'F2': this.noteFrequencies['F2'],
            'C4': this.noteFrequencies['C4'],
            'C8': this.noteFrequencies['C8']
        });
    }

    /**
     * Play a single note with piano-like sound
     */
    async playNote(noteName, duration = 2.0) {
        if (!this.isInitialized || this.isMuted) return;

        try {
            // Create audio context on first use (user gesture requirement)
            if (!this.audioContext) {
                const success = await this.createAudioContext();
                if (!success) return;
            }

            // Resume audio context if suspended (mobile requirement)
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            const frequency = this.noteFrequencies[noteName];
            if (!frequency) {
                console.warn(`Unknown note: ${noteName}`);
                console.log('Available notes (first 10):', Object.keys(this.noteFrequencies).slice(0, 10));
                console.log('Total notes available:', Object.keys(this.noteFrequencies).length);
                console.log('Looking for note frequencies:', this.noteFrequencies);
                return;
            }

            // Stop any existing note
            this.stopNote(noteName);

            // Create piano-like sound using multiple oscillators
            const currentTime = this.audioContext.currentTime;
            const noteGain = this.audioContext.createGain();
            noteGain.connect(this.masterGain);

            // Create multiple harmonics for richer piano sound
            const harmonics = [
                { freq: frequency, gain: 0.8 },          // Fundamental
                { freq: frequency * 2, gain: 0.4 },      // 2nd harmonic
                { freq: frequency * 3, gain: 0.2 },      // 3rd harmonic
                { freq: frequency * 4, gain: 0.1 },      // 4th harmonic
                { freq: frequency * 5, gain: 0.05 }      // 5th harmonic
            ];

            const oscillators = [];

            harmonics.forEach(harmonic => {
                const oscillator = this.audioContext.createOscillator();
                const harmonicGain = this.audioContext.createGain();
                
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(harmonic.freq, currentTime);
                
                harmonicGain.gain.setValueAtTime(harmonic.gain, currentTime);
                
                oscillator.connect(harmonicGain);
                harmonicGain.connect(noteGain);
                
                oscillators.push(oscillator);
            });

            // Add subtle vibrato for more realistic sound
            const vibrato = this.audioContext.createOscillator();
            const vibratoGain = this.audioContext.createGain();
            
            vibrato.type = 'sine';
            vibrato.frequency.setValueAtTime(5, currentTime); // 5 Hz vibrato
            vibratoGain.gain.setValueAtTime(2, currentTime); // Subtle depth
            
            vibrato.connect(vibratoGain);
            vibratoGain.connect(oscillators[0].frequency); // Apply to fundamental

            // Piano-like ADSR envelope
            const attackTime = 0.01;
            const decayTime = 0.3;
            const sustainLevel = 0.4;
            const releaseTime = 1.5;

            // Attack
            noteGain.gain.setValueAtTime(0, currentTime);
            noteGain.gain.linearRampToValueAtTime(1, currentTime + attackTime);
            
            // Decay
            noteGain.gain.exponentialRampToValueAtTime(sustainLevel, currentTime + attackTime + decayTime);
            
            // Release
            noteGain.gain.exponentialRampToValueAtTime(0.001, currentTime + duration);

            // Start oscillators
            oscillators.forEach(osc => osc.start(currentTime));
            vibrato.start(currentTime);

            // Stop oscillators after duration
            setTimeout(() => {
                oscillators.forEach(osc => {
                    try {
                        osc.stop();
                    } catch (e) {
                        // Oscillator already stopped
                    }
                });
                try {
                    vibrato.stop();
                } catch (e) {
                    // Oscillator already stopped
                }
            }, duration * 1000);

            // Store for potential early stopping
            this.oscillators.set(noteName, { oscillators, vibrato, gain: noteGain });

        } catch (error) {
            console.error(`Error playing note ${noteName}:`, error);
        }
    }

    /**
     * Stop a specific note
     */
    stopNote(noteName) {
        const noteData = this.oscillators.get(noteName);
        if (noteData) {
            try {
                noteData.oscillators.forEach(osc => osc.stop());
                noteData.vibrato.stop();
            } catch (e) {
                // Already stopped
            }
            this.oscillators.delete(noteName);
        }
    }

    /**
     * Stop all currently playing notes
     */
    stopAllNotes() {
        this.oscillators.forEach((noteData, noteName) => {
            this.stopNote(noteName);
        });
        this.oscillators.clear();
    }

    /**
     * Play a chord (multiple notes simultaneously)
     */
    async playChord(noteNames, duration = 2.0) {
        const promises = noteNames.map(note => this.playNote(note, duration));
        await Promise.all(promises);
    }

    /**
     * Play a sequence of notes
     */
    async playSequence(sequence, tempo = 120) {
        const noteInterval = 60000 / tempo; // milliseconds per beat
        
        for (const note of sequence) {
            if (typeof note === 'string') {
                // Single note
                await this.playNote(note, noteInterval / 1000);
            } else if (Array.isArray(note)) {
                // Chord
                await this.playChord(note, noteInterval / 1000);
            } else if (note.note) {
                // Note with custom duration
                const duration = note.duration || noteInterval / 1000;
                await this.playNote(note.note, duration);
            }
            
            // Wait for note timing
            await this.sleep(noteInterval * 0.8); // Slight gap between notes
        }
    }

    /**
     * Set master volume
     */
    setVolume(volume) {
        if (!this.isInitialized) return;
        
        this.volume = Math.max(0, Math.min(1, volume));
        const targetVolume = this.isMuted ? 0 : this.volume;
        
        if (this.masterGain) {
            const currentTime = this.audioContext.currentTime;
            this.masterGain.gain.exponentialRampToValueAtTime(
                Math.max(0.001, targetVolume), 
                currentTime + 0.1
            );
        }
    }

    /**
     * Toggle mute
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        this.setVolume(this.volume);
        console.log(`Audio ${this.isMuted ? 'muted' : 'unmuted'}`);
    }

    /**
     * Get mute status
     */
    isMuted() {
        return this.isMuted;
    }

    /**
     * Pause audio (stop all notes)
     */
    pause() {
        this.stopAllNotes();
        if (this.audioContext && this.audioContext.state === 'running') {
            this.audioContext.suspend();
        }
    }

    /**
     * Resume audio
     */
    async resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    /**
     * Utility function for delays
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get note frequency
     */
    getNoteFrequency(noteName) {
        return this.noteFrequencies[noteName] || null;
    }

    /**
     * Check if audio is supported
     */
    static isSupported() {
        return !!(window.AudioContext || window.webkitAudioContext);
    }

    /**
     * Create a simple sound effect
     */
    async playSoundEffect(type = 'click') {
        if (!this.isInitialized || this.isMuted) return;

        try {
            const currentTime = this.audioContext.currentTime;
            const oscillator = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            oscillator.connect(gain);
            gain.connect(this.masterGain);

            switch (type) {
                case 'click':
                    oscillator.frequency.setValueAtTime(800, currentTime);
                    oscillator.type = 'sine';
                    gain.gain.setValueAtTime(0.1, currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.1);
                    oscillator.start(currentTime);
                    oscillator.stop(currentTime + 0.1);
                    break;
                
                case 'success':
                    oscillator.frequency.setValueAtTime(523.25, currentTime); // C5
                    oscillator.frequency.exponentialRampToValueAtTime(783.99, currentTime + 0.2); // G5
                    oscillator.type = 'sine';
                    gain.gain.setValueAtTime(0.2, currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.3);
                    oscillator.start(currentTime);
                    oscillator.stop(currentTime + 0.3);
                    break;
            }

        } catch (error) {
            console.error('Error playing sound effect:', error);
        }
    }

    /**
     * Clean up resources
     */
    destroy() {
        this.stopAllNotes();
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        this.masterGain = null;
        this.oscillators.clear();
        this.isInitialized = false;
        
        console.log('🔇 Audio Manager destroyed');
    }
}