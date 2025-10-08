/**
 * Piano Engine - Core piano functionality and key management
 */

export class PianoEngine {
    constructor() {
        this.keys = new Map();
        this.keyboardElement = null;
        this.isInitialized = false;
        this.pressedKeys = new Set();
        this.keyMapping = {};
    }

    /**
     * Initialize the piano engine
     */
    async init() {
        try {
            this.keyboardElement = document.getElementById('piano-keyboard');
            if (!this.keyboardElement) {
                throw new Error('Piano keyboard element not found');
            }

            this.setupKeyMapping();
            this.isInitialized = true;
            console.log('🎹 Piano Engine initialized');

        } catch (error) {
            console.error('Failed to initialize Piano Engine:', error);
            throw error;
        }
    }

    /**
     * Set up keyboard to note mapping
     */
    setupKeyMapping() {
        // Map computer keyboard keys to piano notes
        this.keyMapping = {
            // Bottom row (low octave)
            'z': 'C3', 's': 'C#3', 'x': 'D3', 'd': 'D#3', 'c': 'E3',
            'v': 'F3', 'g': 'F#3', 'b': 'G3', 'h': 'G#3', 'n': 'A3', 'j': 'A#3', 'm': 'B3',
            
            // Top row (high octave)
            'q': 'C4', '2': 'C#4', 'w': 'D4', '3': 'D#4', 'e': 'E4',
            'r': 'F4', '5': 'F#4', 't': 'G4', '6': 'G#4', 'y': 'A4', '7': 'A#4', 'u': 'B4',
            'i': 'C5', '9': 'C#5', 'o': 'D5', '0': 'D#5', 'p': 'E5'
        };
    }

    /**
     * Get note from keyboard key
     */
    getNoteFromKey(key) {
        return this.keyMapping[key.toLowerCase()] || null;
    }

    /**
     * Get keyboard key from note
     */
    getKeyFromNote(note) {
        for (const [key, mappedNote] of Object.entries(this.keyMapping)) {
            if (mappedNote === note) {
                return key;
            }
        }
        return null;
    }

    /**
     * Highlight a key visually
     */
    highlightKey(note, duration = 300) {
        const keyElement = this.getKeyElement(note);
        if (keyElement) {
            keyElement.classList.add('pressed');
            setTimeout(() => {
                keyElement.classList.remove('pressed');
            }, duration);
        }
    }

    /**
     * Get key element by note
     */
    getKeyElement(note) {
        if (!this.keyboardElement) return null;
        return this.keyboardElement.querySelector(`[data-note="${note}"]`);
    }

    /**
     * Press key programmatically
     */
    pressKey(note) {
        if (this.pressedKeys.has(note)) return false;
        
        this.pressedKeys.add(note);
        this.highlightKey(note);
        return true;
    }

    /**
     * Release key programmatically
     */
    releaseKey(note) {
        this.pressedKeys.delete(note);
        const keyElement = this.getKeyElement(note);
        if (keyElement) {
            keyElement.classList.remove('pressed');
        }
    }

    /**
     * Release all keys
     */
    releaseAllKeys() {
        this.pressedKeys.forEach(note => {
            this.releaseKey(note);
        });
        this.pressedKeys.clear();
    }

    /**
     * Check if key is currently pressed
     */
    isKeyPressed(note) {
        return this.pressedKeys.has(note);
    }

    /**
     * Get all currently pressed keys
     */
    getPressedKeys() {
        return Array.from(this.pressedKeys);
    }

    /**
     * Animate key sequence (for song teaching)
     */
    async animateSequence(sequence, tempo = 120) {
        const noteInterval = 60000 / tempo; // milliseconds per beat
        
        for (const noteData of sequence) {
            let note, duration;
            
            if (typeof noteData === 'string') {
                note = noteData;
                duration = noteInterval;
            } else {
                note = noteData.note;
                duration = noteData.duration || noteInterval;
            }

            // Highlight the key
            this.highlightKey(note, duration * 0.8);
            
            // Wait for note duration
            await this.sleep(duration);
        }
    }

    /**
     * Show hint for next note to play
     */
    showHint(note, type = 'glow') {
        const keyElement = this.getKeyElement(note);
        if (!keyElement) return;

        switch (type) {
            case 'glow':
                keyElement.style.boxShadow = '0 0 20px #FFD700, 0 0 40px #FFD700';
                setTimeout(() => {
                    keyElement.style.boxShadow = '';
                }, 2000);
                break;
                
            case 'bounce':
                keyElement.style.animation = 'bounce 1s ease-in-out 3';
                setTimeout(() => {
                    keyElement.style.animation = '';
                }, 3000);
                break;
                
            case 'pulse':
                keyElement.style.animation = 'pulse 0.5s ease-in-out infinite';
                setTimeout(() => {
                    keyElement.style.animation = '';
                }, 5000);
                break;
        }
    }

    /**
     * Clear all hints
     */
    clearHints() {
        if (!this.keyboardElement) return;
        
        const keys = this.keyboardElement.querySelectorAll('.piano-key');
        keys.forEach(key => {
            key.style.boxShadow = '';
            key.style.animation = '';
        });
    }

    /**
     * Get key color based on note
     */
    getKeyColor(note) {
        const noteColors = {
            'C': '#FF6B6B',  // Red
            'D': '#FF8E53',  // Orange  
            'E': '#FF6B9D',  // Pink
            'F': '#4ECDC4',  // Teal
            'G': '#45B7D1',  // Blue
            'A': '#96CEB4',  // Green
            'B': '#FFEAA7'   // Yellow
        };
        
        const noteName = note.replace(/[0-9#]/g, '');
        return noteColors[noteName] || '#FFFFFF';
    }

    /**
     * Create visual ripple effect on key
     */
    createRipple(keyElement, clientX, clientY) {
        const rect = keyElement.getBoundingClientRect();
        const ripple = document.createElement('div');
        
        ripple.className = 'key-ripple';
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.6)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s linear';
        ripple.style.pointerEvents = 'none';
        
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (clientY - rect.top - size / 2) + 'px';
        
        keyElement.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    /**
     * Update key visual state
     */
    updateKeyVisuals() {
        if (!this.keyboardElement) return;
        
        const keys = this.keyboardElement.querySelectorAll('.piano-key');
        keys.forEach(key => {
            const note = key.dataset.note;
            const isPressed = this.isKeyPressed(note);
            
            key.classList.toggle('pressed', isPressed);
            
            // Add color coding if not already present
            if (!key.style.borderTopColor) {
                key.style.borderTopColor = this.getKeyColor(note);
            }
        });
    }

    /**
     * Enable/disable keyboard
     */
    setEnabled(enabled) {
        if (!this.keyboardElement) return;
        
        this.keyboardElement.style.pointerEvents = enabled ? 'auto' : 'none';
        this.keyboardElement.style.opacity = enabled ? '1' : '0.5';
    }

    /**
     * Get note octave
     */
    getNoteOctave(note) {
        const match = note.match(/\d+/);
        return match ? parseInt(match[0]) : 4;
    }

    /**
     * Get note name without octave
     */
    getNoteName(note) {
        return note.replace(/\d+/, '');
    }

    /**
     * Check if note is black key
     */
    isBlackKey(note) {
        return note.includes('#');
    }

    /**
     * Get relative position of note on keyboard
     */
    getNotePosition(note) {
        const keyElement = this.getKeyElement(note);
        if (!keyElement || !this.keyboardElement) return null;
        
        const keyboardRect = this.keyboardElement.getBoundingClientRect();
        const keyRect = keyElement.getBoundingClientRect();
        
        return {
            x: keyRect.left - keyboardRect.left,
            y: keyRect.top - keyboardRect.top,
            width: keyRect.width,
            height: keyRect.height
        };
    }

    /**
     * Utility function for delays
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get all available notes
     */
    getAllNotes() {
        return Object.values(this.keyMapping);
    }

    /**
     * Clean up resources
     */
    destroy() {
        this.releaseAllKeys();
        this.clearHints();
        this.keys.clear();
        this.pressedKeys.clear();
        this.keyboardElement = null;
        this.isInitialized = false;
        
        console.log('🎹 Piano Engine destroyed');
    }
}