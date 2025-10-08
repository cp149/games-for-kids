/**
 * Recording Manager - Record and playback user performances
 */

export class RecordingManager {
    constructor() {
        this.recordings = [];
        this.currentRecording = null;
        this.isRecording = false;
        this.isPlaying = false;
        this.playbackStartTime = 0;
        this.recordingStartTime = 0;
        this.playbackTimeoutIds = [];
        this.maxRecordingLength = 60000; // 60 seconds
        this.isInitialized = false;
    }

    /**
     * Initialize the recording manager
     */
    init() {
        this.currentRecording = {
            id: this.generateRecordingId(),
            notes: [],
            startTime: null,
            endTime: null,
            duration: 0
        };
        
        this.isInitialized = true;
        console.log('🎙️ Recording Manager initialized');
    }

    /**
     * Start recording
     */
    startRecording() {
        if (!this.isInitialized || this.isRecording) return false;

        this.isRecording = true;
        this.recordingStartTime = Date.now();
        this.currentRecording = {
            id: this.generateRecordingId(),
            notes: [],
            startTime: this.recordingStartTime,
            endTime: null,
            duration: 0
        };

        console.log('🎙️ Recording started');
        this.updateUI();
        return true;
    }

    /**
     * Stop recording
     */
    stopRecording() {
        if (!this.isRecording) return false;

        this.isRecording = false;
        const endTime = Date.now();
        this.currentRecording.endTime = endTime;
        this.currentRecording.duration = endTime - this.recordingStartTime;

        // Save recording if it has notes
        if (this.currentRecording.notes.length > 0) {
            this.recordings.push({ ...this.currentRecording });
            console.log(`🎙️ Recording saved with ${this.currentRecording.notes.length} notes`);
        } else {
            console.log('🎙️ Recording discarded (no notes)');
        }

        this.updateUI();
        return true;
    }

    /**
     * Record a note
     */
    recordNote(note, timestamp = null) {
        if (!this.isRecording) return false;

        const recordTime = timestamp || Date.now();
        const relativeTime = recordTime - this.recordingStartTime;

        // Check maximum recording length
        if (relativeTime > this.maxRecordingLength) {
            this.stopRecording();
            return false;
        }

        const noteData = {
            note,
            timestamp: relativeTime,
            velocity: 1.0 // Could be used for volume variation
        };

        this.currentRecording.notes.push(noteData);
        console.log(`🎵 Recorded note: ${note} at ${relativeTime}ms`);
        return true;
    }

    /**
     * Play back the current recording
     */
    async play(recordingId = null) {
        if (this.isPlaying) {
            this.stop();
            return;
        }

        let recording;
        if (recordingId) {
            recording = this.getRecording(recordingId);
        } else {
            recording = this.currentRecording;
        }

        if (!recording || recording.notes.length === 0) {
            console.log('🎙️ No recording to play');
            return false;
        }

        this.isPlaying = true;
        this.playbackStartTime = Date.now();
        
        console.log(`🎵 Playing recording with ${recording.notes.length} notes`);
        this.updateUI();

        // Schedule note playback
        recording.notes.forEach(noteData => {
            const timeoutId = setTimeout(() => {
                this.playRecordedNote(noteData.note);
            }, noteData.timestamp);
            
            this.playbackTimeoutIds.push(timeoutId);
        });

        // Auto-stop when recording ends
        const recordingDuration = recording.duration || this.calculateRecordingDuration(recording);
        const stopTimeoutId = setTimeout(() => {
            this.stop();
        }, recordingDuration);
        
        this.playbackTimeoutIds.push(stopTimeoutId);

        return true;
    }

    /**
     * Stop playback
     */
    stop() {
        if (!this.isPlaying) return false;

        this.isPlaying = false;
        
        // Clear all scheduled playbacks
        this.playbackTimeoutIds.forEach(timeoutId => {
            clearTimeout(timeoutId);
        });
        this.playbackTimeoutIds = [];

        console.log('🎵 Playback stopped');
        this.updateUI();
        return true;
    }

    /**
     * Clear current recording
     */
    clear() {
        this.stop();
        
        this.currentRecording = {
            id: this.generateRecordingId(),
            notes: [],
            startTime: null,
            endTime: null,
            duration: 0
        };

        console.log('🗑️ Recording cleared');
        this.updateUI();
    }

    /**
     * Play a recorded note (should be connected to audio system)
     */
    playRecordedNote(note) {
        // This method should trigger the actual audio playback
        // It will be called by the main application
        const event = new CustomEvent('playRecordedNote', {
            detail: { note }
        });
        document.dispatchEvent(event);
        
        // Visual feedback
        const keyElement = document.querySelector(`[data-note="${note}"]`);
        if (keyElement) {
            keyElement.classList.add('pressed');
            setTimeout(() => {
                keyElement.classList.remove('pressed');
            }, 200);
        }
    }

    /**
     * Get a specific recording
     */
    getRecording(id) {
        return this.recordings.find(recording => recording.id === id) || null;
    }

    /**
     * Get all recordings
     */
    getAllRecordings() {
        return [...this.recordings];
    }

    /**
     * Delete a recording
     */
    deleteRecording(id) {
        const index = this.recordings.findIndex(recording => recording.id === id);
        if (index !== -1) {
            this.recordings.splice(index, 1);
            console.log(`🗑️ Recording ${id} deleted`);
            return true;
        }
        return false;
    }

    /**
     * Save recording with custom name
     */
    saveRecording(name = null) {
        if (!this.currentRecording || this.currentRecording.notes.length === 0) {
            return false;
        }

        const recording = {
            ...this.currentRecording,
            name: name || `Recording ${new Date().toLocaleTimeString()}`,
            savedAt: Date.now()
        };

        this.recordings.push(recording);
        console.log(`💾 Recording saved as: ${recording.name}`);
        return recording.id;
    }

    /**
     * Export recording data
     */
    exportRecording(id) {
        const recording = this.getRecording(id);
        if (!recording) return null;

        return JSON.stringify({
            ...recording,
            exportedAt: Date.now(),
            version: '1.0'
        }, null, 2);
    }

    /**
     * Import recording data
     */
    importRecording(recordingData) {
        try {
            const recording = typeof recordingData === 'string' 
                ? JSON.parse(recordingData) 
                : recordingData;

            // Validate recording format
            if (!recording.notes || !Array.isArray(recording.notes)) {
                throw new Error('Invalid recording format');
            }

            // Generate new ID to avoid conflicts
            recording.id = this.generateRecordingId();
            recording.importedAt = Date.now();

            this.recordings.push(recording);
            console.log('📥 Recording imported successfully');
            return recording.id;

        } catch (error) {
            console.error('Failed to import recording:', error);
            return null;
        }
    }

    /**
     * Get recording statistics
     */
    getRecordingStats(id) {
        const recording = id ? this.getRecording(id) : this.currentRecording;
        if (!recording || recording.notes.length === 0) return null;

        const notes = recording.notes;
        const uniqueNotes = new Set(notes.map(n => n.note));
        const duration = recording.duration || this.calculateRecordingDuration(recording);
        
        return {
            id: recording.id,
            noteCount: notes.length,
            uniqueNotes: uniqueNotes.size,
            duration,
            averageInterval: duration / notes.length,
            notesPerSecond: notes.length / (duration / 1000),
            noteRange: this.getNoteRange(notes)
        };
    }

    /**
     * Calculate recording duration
     */
    calculateRecordingDuration(recording) {
        if (recording.notes.length === 0) return 0;
        
        const lastNote = recording.notes[recording.notes.length - 1];
        return lastNote.timestamp + 1000; // Add 1 second for last note
    }

    /**
     * Get note range (lowest and highest notes)
     */
    getNoteRange(notes) {
        if (notes.length === 0) return null;

        const noteValues = notes.map(n => this.noteToNumber(n.note));
        return {
            lowest: this.numberToNote(Math.min(...noteValues)),
            highest: this.numberToNote(Math.max(...noteValues)),
            range: Math.max(...noteValues) - Math.min(...noteValues)
        };
    }

    /**
     * Convert note to number for comparison
     */
    noteToNumber(note) {
        const noteMap = { 'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11 };
        const noteName = note.replace(/[0-9]/g, '');
        const octave = parseInt(note.replace(/[^0-9]/g, '')) || 4;
        return octave * 12 + (noteMap[noteName] || 0);
    }

    /**
     * Convert number back to note
     */
    numberToNote(number) {
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const octave = Math.floor(number / 12);
        const noteIndex = number % 12;
        return noteNames[noteIndex] + octave;
    }

    /**
     * Create practice loop from recording
     */
    createPracticeLoop(id, loopCount = 3) {
        const recording = this.getRecording(id);
        if (!recording) return null;

        const loopedNotes = [];
        const pauseBetweenLoops = 1000; // 1 second pause

        for (let i = 0; i < loopCount; i++) {
            const loopOffset = i * (recording.duration + pauseBetweenLoops);
            
            recording.notes.forEach(noteData => {
                loopedNotes.push({
                    ...noteData,
                    timestamp: noteData.timestamp + loopOffset
                });
            });
        }

        return {
            id: `${recording.id}_loop_${loopCount}`,
            name: `${recording.name || 'Recording'} (${loopCount}x Loop)`,
            notes: loopedNotes,
            duration: loopCount * recording.duration + (loopCount - 1) * pauseBetweenLoops,
            originalId: recording.id,
            isLoop: true
        };
    }

    /**
     * Get recording status
     */
    getStatus() {
        return {
            isRecording: this.isRecording,
            isPlaying: this.isPlaying,
            currentRecordingNotes: this.currentRecording ? this.currentRecording.notes.length : 0,
            totalRecordings: this.recordings.length,
            recordingTime: this.isRecording ? Date.now() - this.recordingStartTime : 0
        };
    }

    /**
     * Update UI elements
     */
    updateUI() {
        const status = this.getStatus();
        
        // Update mode display
        const modeElement = document.getElementById('current-mode');
        if (modeElement) {
            let modeText = 'Mode: Recording';
            if (status.isRecording) {
                modeText += ' (Recording...)';
            } else if (status.isPlaying) {
                modeText += ' (Playing...)';
            }
            modeElement.textContent = modeText;
        }

        // Update instructions
        const instructionsElement = document.getElementById('instructions');
        if (instructionsElement) {
            if (status.isRecording) {
                instructionsElement.textContent = `🎙️ Recording... (${status.currentRecordingNotes} notes)`;
            } else if (status.isPlaying) {
                instructionsElement.textContent = '🎵 Playing back recording...';
            } else if (status.currentRecordingNotes > 0) {
                instructionsElement.textContent = `🎵 Recording ready (${status.currentRecordingNotes} notes) - Press Play to listen!`;
            } else {
                instructionsElement.textContent = '🎙️ Press a piano key to start recording your music!';
            }
        }

        // Update playback controls
        this.updatePlaybackControls();
    }

    /**
     * Update playback control buttons
     */
    updatePlaybackControls() {
        const playBtn = document.getElementById('play-btn');
        const stopBtn = document.getElementById('stop-btn');
        const clearBtn = document.getElementById('clear-btn');

        if (playBtn) {
            playBtn.textContent = this.isPlaying ? '⏸️ Pause' : '▶️ Play';
            playBtn.disabled = !this.currentRecording || this.currentRecording.notes.length === 0;
        }

        if (stopBtn) {
            stopBtn.disabled = !this.isPlaying;
        }

        if (clearBtn) {
            clearBtn.disabled = !this.currentRecording || this.currentRecording.notes.length === 0;
        }
    }

    /**
     * Generate unique recording ID
     */
    generateRecordingId() {
        return `recording_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Clean up resources
     */
    destroy() {
        this.stop();
        this.recordings = [];
        this.currentRecording = null;
        this.playbackTimeoutIds = [];
        this.isInitialized = false;
        
        console.log('🎙️ Recording Manager destroyed');
    }
}