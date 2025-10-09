/**
 * Audio Analyzer - Analyzes audio files and detects notes
 */

export class AudioAnalyzer {
    constructor(audioManager) {
        this.audioManager = audioManager;
        this.audioContext = null;
        this.analyser = null;
        this.isAnalyzing = false;
        this.detectedNotes = [];
        this.onNoteDetected = null;
        
        // Note detection parameters
        this.fftSize = 4096;
        this.smoothingTimeConstant = 0.8;
        this.minDecibels = -90;
        this.maxDecibels = -10;
        this.peakThreshold = -55; // Moderate threshold
        this.lastPeakLevel = -100;
        this.peakDecayRate = 0.95;
    }

    /**
     * Initialize the audio analyzer
     */
    async init() {
        // Don't create audio context during init
        // It will be created on first user interaction
        console.log('✅ Audio Analyzer ready (context will be created on first use)');
    }
    
    /**
     * Ensure audio context and analyzer are created
     */
    async ensureAnalyzer() {
        if (this.analyser) return;
        
        try {
            // Wait for audio context
            if (!this.audioManager.audioContext) {
                await this.audioManager.createAudioContext();
            }
            
            this.audioContext = this.audioManager.audioContext;
            
            // Create analyser node
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = this.fftSize;
            this.analyser.smoothingTimeConstant = this.smoothingTimeConstant;
            this.analyser.minDecibels = this.minDecibels;
            this.analyser.maxDecibels = this.maxDecibels;
            
            console.log('✅ Audio Analyzer created');
        } catch (error) {
            console.error('Failed to create audio analyzer:', error);
            throw error;
        }
    }

    /**
     * Load and analyze an audio file (full analysis)
     */
    async loadAndAnalyze(audioUrl) {
        try {
            console.log('Loading audio file for full analysis:', audioUrl);
            
            // Ensure analyzer is created
            await this.ensureAnalyzer();
            
            // Fetch the audio file
            const response = await fetch(audioUrl);
            const arrayBuffer = await response.arrayBuffer();
            
            // Decode audio data
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            console.log('Audio loaded:', {
                duration: audioBuffer.duration,
                sampleRate: audioBuffer.sampleRate,
                numberOfChannels: audioBuffer.numberOfChannels
            });
            
            // For testing, create simple note sequence
            const extractedNotes = this.createTestNoteSequence(audioBuffer.duration);
            console.log('Generated test notes:', extractedNotes);
            
            // Create source for playback
            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.audioContext.destination);
            
            // Start playback with synchronized note display
            this.startSynchronizedPlayback(extractedNotes, audioBuffer.duration);
            
            // Play the audio
            source.start(0);
            
            // Stop synchronized playback when audio ends
            source.onended = () => {
                this.stopSynchronizedPlayback();
                console.log('Audio playback ended');
                
                // Trigger guide mode callback
                if (this.onPlaybackComplete) {
                    this.onPlaybackComplete(extractedNotes);
                }
            };
            
            return source;
            
        } catch (error) {
            console.error('Failed to load audio:', error);
            throw error;
        }
    }

    /**
     * Extract notes from entire audio buffer using offline analysis
     */
    async extractNotesFromBuffer(audioBuffer) {
        const sampleRate = audioBuffer.sampleRate;
        const duration = audioBuffer.duration;
        const channelData = audioBuffer.getChannelData(0); // Use first channel
        
        const notes = [];
        const windowSize = 4096; // FFT window size
        const hopSize = 1024; // How much to advance each time
        const windowsPerSecond = sampleRate / hopSize;
        
        console.log('Analyzing audio buffer...', { duration, sampleRate, windowsPerSecond });
        
        // Create offline audio context for analysis
        const offlineContext = new OfflineAudioContext(1, audioBuffer.length, sampleRate);
        
        // Analyze audio in chunks
        for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
            const timeStamp = i / sampleRate;
            
            // Extract window of audio data
            const window = channelData.slice(i, i + windowSize);
            
            // Apply window function (Hann window)
            for (let j = 0; j < window.length; j++) {
                window[j] *= 0.5 * (1 - Math.cos(2 * Math.PI * j / (window.length - 1)));
            }
            
            // Perform FFT
            const spectrum = this.performFFT(window);
            
            // Find dominant frequency
            const dominantFreq = this.findDominantFrequencyInSpectrum(spectrum, sampleRate);
            
            if (dominantFreq > 80 && dominantFreq < 4000) { // Musical range
                const note = this.frequencyToNote(dominantFreq);
                
                if (note && note.confidence > 0.3) {
                    // Check if this is a new note or continuation
                    const lastNote = notes[notes.length - 1];
                    if (!lastNote || lastNote.note !== note.note || timeStamp - lastNote.endTime > 0.1) {
                        notes.push({
                            note: note.note,
                            startTime: timeStamp,
                            endTime: timeStamp + (hopSize / sampleRate),
                            frequency: dominantFreq,
                            confidence: note.confidence
                        });
                    } else {
                        // Extend the previous note
                        lastNote.endTime = timeStamp + (hopSize / sampleRate);
                    }
                }
            }
        }
        
        // Filter out very short notes (less than 100ms)
        return notes.filter(note => note.endTime - note.startTime > 0.1);
    }

    /**
     * Simple FFT implementation for spectrum analysis
     */
    performFFT(signal) {
        const N = signal.length;
        const spectrum = new Array(N / 2);
        
        for (let k = 0; k < N / 2; k++) {
            let real = 0;
            let imag = 0;
            
            for (let n = 0; n < N; n++) {
                const angle = -2 * Math.PI * k * n / N;
                real += signal[n] * Math.cos(angle);
                imag += signal[n] * Math.sin(angle);
            }
            
            spectrum[k] = Math.sqrt(real * real + imag * imag);
        }
        
        return spectrum;
    }

    /**
     * Find dominant frequency in spectrum
     */
    findDominantFrequencyInSpectrum(spectrum, sampleRate) {
        let maxValue = 0;
        let maxIndex = 0;
        
        const minIndex = Math.floor(80 * spectrum.length / (sampleRate / 2)); // 80 Hz
        const maxIndexLimit = Math.floor(4000 * spectrum.length / (sampleRate / 2)); // 4000 Hz
        
        for (let i = minIndex; i < Math.min(maxIndexLimit, spectrum.length); i++) {
            if (spectrum[i] > maxValue) {
                maxValue = spectrum[i];
                maxIndex = i;
            }
        }
        
        if (maxValue < 0.01) return 0; // Too quiet
        
        // Convert bin to frequency
        return (maxIndex * sampleRate / 2) / spectrum.length;
    }

    /**
     * Start synchronized playback with extracted notes
     */
    startSynchronizedPlayback(notes, duration) {
        console.log('Starting synchronized playback with', notes.length, 'notes');
        
        this.playbackNotes = notes;
        this.playbackStartTime = this.audioContext.currentTime;
        this.playbackDuration = duration;
        
        // Schedule note events
        this.scheduleNoteEvents();
    }

    /**
     * Schedule note display events based on extracted notes
     */
    scheduleNoteEvents() {
        this.playbackNotes.forEach(noteData => {
            setTimeout(() => {
                if (this.onNoteDetected) {
                    this.onNoteDetected({
                        note: noteData.note,
                        frequency: noteData.frequency,
                        confidence: noteData.confidence
                    });
                }
            }, noteData.startTime * 1000); // Convert to milliseconds
        });
    }

    /**
     * Create test note sequence (for demonstration)
     */
    createTestNoteSequence(duration) {
        const notes = [];
        const noteInterval = 0.8; // Note every 0.8 seconds
        const testNotes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
        
        for (let time = 1; time < duration - 1; time += noteInterval) {
            const noteIndex = Math.floor(time / noteInterval) % testNotes.length;
            notes.push({
                note: testNotes[noteIndex],
                startTime: time,
                endTime: time + 0.5,
                frequency: 440,
                confidence: 0.9
            });
        }
        
        return notes;
    }

    /**
     * Stop synchronized playback
     */
    stopSynchronizedPlayback() {
        console.log('Stopped synchronized playback');
        // Clear any remaining timeouts would require keeping track of them
        // For now, the timeouts will just complete naturally
    }

    /**
     * Start real-time frequency analysis
     */
    startAnalysis() {
        if (this.isAnalyzing) return;
        
        console.log('Starting audio analysis...');
        this.isAnalyzing = true;
        this.detectedNotes = [];
        
        if (!this.analyser) {
            console.error('Analyser not initialized!');
            return;
        }
        
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const floatArray = new Float32Array(bufferLength);
        
        let frameCount = 0;
        
        const analyze = () => {
            if (!this.isAnalyzing) return;
            
            // Get frequency data
            this.analyser.getByteFrequencyData(dataArray);
            this.analyser.getFloatFrequencyData(floatArray);
            
            // Debug: log every 60 frames (about once per 2 seconds)
            if (frameCount % 60 === 0) {
                const maxByte = Math.max(...dataArray);
                const maxFloat = Math.max(...floatArray);
                console.log('Audio levels:', { maxByte, maxFloat, threshold: this.peakThreshold });
            }
            frameCount++;
            
            // Find dominant frequency and check for peak
            const { frequency, peakLevel } = this.findDominantFrequencyWithLevel(floatArray);
            
            // Only detect notes on significant peaks (attack phase)
            if (frequency > 0 && peakLevel > this.lastPeakLevel + 2) { // 2dB increase (more sensitive)
                // Convert frequency to note
                const note = this.frequencyToNote(frequency);
                
                if (note && this.onNoteDetected) {
                    console.log('Note detected (peak):', note);
                    this.onNoteDetected(note);
                }
            }
            
            // Decay the last peak level
            this.lastPeakLevel = Math.max(peakLevel, this.lastPeakLevel * this.peakDecayRate);
            
            // Continue analyzing
            requestAnimationFrame(analyze);
        };
        
        analyze();
    }

    /**
     * Stop frequency analysis
     */
    stopAnalysis() {
        this.isAnalyzing = false;
    }

    /**
     * Find dominant frequency with peak level from FFT data
     */
    findDominantFrequencyWithLevel(frequencyData) {
        let maxValue = -Infinity;
        let maxIndex = 0;
        
        // Skip very low frequencies (below 80 Hz) to avoid noise
        const minFreqBin = Math.floor(80 * frequencyData.length / (this.audioContext.sampleRate / 2));
        
        // Find peak in frequency data
        for (let i = minFreqBin; i < frequencyData.length / 2; i++) {
            if (frequencyData[i] > maxValue && frequencyData[i] > this.peakThreshold) {
                maxValue = frequencyData[i];
                maxIndex = i;
            }
        }
        
        // Check if we found a significant peak
        if (maxValue <= this.peakThreshold) {
            return { frequency: 0, peakLevel: maxValue };
        }
        
        // Convert bin to frequency
        const nyquist = this.audioContext.sampleRate / 2;
        const frequency = (maxIndex * nyquist) / frequencyData.length;
        
        // Apply peak refinement for better accuracy
        if (maxIndex > 0 && maxIndex < frequencyData.length - 1) {
            const y1 = frequencyData[maxIndex - 1];
            const y2 = frequencyData[maxIndex];
            const y3 = frequencyData[maxIndex + 1];
            
            // Parabolic interpolation
            const x0 = (y3 - y1) / (2 * (2 * y2 - y1 - y3));
            const refinedIndex = maxIndex + x0;
            
            return { 
                frequency: (refinedIndex * nyquist) / frequencyData.length,
                peakLevel: maxValue 
            };
        }
        
        return { frequency: frequency, peakLevel: maxValue };
    }

    /**
     * Find dominant frequency from FFT data (legacy method)
     */
    findDominantFrequency(frequencyData) {
        let maxValue = -Infinity;
        let maxIndex = 0;
        
        // Skip very low frequencies (below 80 Hz) to avoid noise
        const minFreqBin = Math.floor(80 * frequencyData.length / (this.audioContext.sampleRate / 2));
        
        // Find peak in frequency data
        for (let i = minFreqBin; i < frequencyData.length / 2; i++) {
            if (frequencyData[i] > maxValue && frequencyData[i] > this.peakThreshold) {
                maxValue = frequencyData[i];
                maxIndex = i;
            }
        }
        
        // Check if we found a significant peak
        if (maxValue <= this.peakThreshold) {
            return 0;
        }
        
        // Convert bin to frequency
        const nyquist = this.audioContext.sampleRate / 2;
        const frequency = (maxIndex * nyquist) / frequencyData.length;
        
        // Apply peak refinement for better accuracy
        if (maxIndex > 0 && maxIndex < frequencyData.length - 1) {
            const y1 = frequencyData[maxIndex - 1];
            const y2 = frequencyData[maxIndex];
            const y3 = frequencyData[maxIndex + 1];
            
            // Parabolic interpolation
            const x0 = (y3 - y1) / (2 * (2 * y2 - y1 - y3));
            const refinedIndex = maxIndex + x0;
            
            return (refinedIndex * nyquist) / frequencyData.length;
        }
        
        return frequency;
    }

    /**
     * Convert frequency to closest note
     */
    frequencyToNote(frequency) {
        if (frequency < 20 || frequency > 20000) return null;
        
        // A4 = 440 Hz
        const A4 = 440;
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        
        // Calculate number of semitones from A4
        const semitones = 12 * Math.log2(frequency / A4);
        const noteNumber = Math.round(semitones) + 69; // A4 is MIDI note 69
        
        // Calculate octave and note
        const octave = Math.floor(noteNumber / 12);
        const noteIndex = noteNumber % 12;
        
        if (octave < 0 || octave > 8) return null;
        
        const noteName = noteNames[noteIndex] + octave;
        
        // Calculate the exact frequency for the detected note
        const exactNoteNumber = Math.round(semitones) + 69;
        const exactFrequency = A4 * Math.pow(2, (exactNoteNumber - 69) / 12);
        const cents = 1200 * Math.log2(frequency / exactFrequency);
        
        return {
            note: noteName,
            frequency: frequency,
            exactFrequency: exactFrequency,
            cents: Math.round(cents),
            confidence: this.calculateConfidence(frequency, exactFrequency)
        };
    }

    /**
     * Calculate confidence level for note detection
     */
    calculateConfidence(detectedFreq, exactFreq) {
        const cents = Math.abs(1200 * Math.log2(detectedFreq / exactFreq));
        // Within 10 cents = very confident, 50 cents = not confident
        return Math.max(0, Math.min(1, 1 - (cents / 50)));
    }

    /**
     * Extract note sequence from audio file (simplified version)
     */
    async extractNoteSequence(audioUrl) {
        try {
            // This is a simplified version - real note extraction would require
            // more sophisticated pitch detection algorithms
            
            const notes = [];
            
            // For demo purposes, return a predefined sequence
            // In a real implementation, this would analyze the entire audio file
            console.log('Note extraction from audio files requires advanced signal processing');
            
            return notes;
            
        } catch (error) {
            console.error('Failed to extract notes:', error);
            return [];
        }
    }

    /**
     * Clean up resources
     */
    destroy() {
        this.stopAnalysis();
        this.analyser = null;
        this.audioContext = null;
    }
}