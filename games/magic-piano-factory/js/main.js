/**
 * Magic Piano Factory - Main Application
 * Musical adventure game for children
 */

import { PianoEngine } from './core/PianoEngine.js';
import { AudioManager } from './audio/AudioManager.js';
import { VisualEffects } from './ui/VisualEffects.js';
import { SongLibrary } from './core/SongLibrary.js';

class MagicPianoFactory {
    constructor() {
        this.pianoEngine = null;
        this.audioManager = null;
        this.visualEffects = null;
        this.songLibrary = null;
        this.currentMode = 'songs';
        this.isLoaded = false;
        this.interactionMode = 'play'; // 'play' or 'scroll'
        this.currentSong = null;
        this.currentNoteIndex = 0;
        this.isLearningMode = false;
        this.learningSpeed = 'normal';
        this.learningModeType = 'guided';
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log('🎹 Starting Magic Piano Factory...');
            this.showLoadingProgress('Initializing audio system...', 20);

            // Initialize core systems
            this.audioManager = new AudioManager();
            await this.audioManager.init();
            
            this.showLoadingProgress('Creating piano keyboard...', 40);
            
            this.pianoEngine = new PianoEngine();
            this.visualEffects = new VisualEffects();
            this.songLibrary = new SongLibrary();

            this.showLoadingProgress('Setting up magical effects...', 60);

            // Initialize components
            await this.pianoEngine.init();
            this.visualEffects.init();
            this.songLibrary.init();

            this.showLoadingProgress('Connecting components...', 80);

            // Set up event listeners
            this.setupEventListeners();
            this.setupKeyboard();
            this.setupModeHandlers();
            
            // Setup song card listeners after everything is initialized
            this.setupSongCardListeners();

            this.showLoadingProgress('Ready to play!', 100);

            // Hide loading screen
            setTimeout(() => {
                this.hideLoadingScreen();
                this.isLoaded = true;
                console.log('✨ Magic Piano Factory loaded successfully!');
            }, 500);

        } catch (error) {
            console.error('Failed to initialize Magic Piano Factory:', error);
            this.showError('Failed to load the piano. Please refresh the page.');
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Header controls
        document.getElementById('volume-btn').addEventListener('click', () => {
            this.audioManager.toggleMute();
            this.updateVolumeButton();
        });

        document.getElementById('settings-btn').addEventListener('click', () => {
            this.showSettings();
        });

        document.getElementById('help-btn').addEventListener('click', () => {
            this.showHelp();
        });

        // Mode selector
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                this.switchMode(mode);
            });
        });



        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardInput(e);
        });

        // Touch optimization
        document.addEventListener('touchstart', () => {}, { passive: true });
        
        // Prevent context menu on long press
        document.addEventListener('contextmenu', (e) => {
            if (e.target.classList.contains('piano-key')) {
                e.preventDefault();
            }
        });
    }

    /**
     * Set up song card event listeners
     */
    setupSongCardListeners() {
        // Wait a bit to ensure DOM is ready
        setTimeout(() => {
            document.querySelectorAll('.song-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    // Get songId from the card itself, not the clicked element
                    const songId = card.dataset.song;
                    console.log('Song card clicked, ID:', songId);
                    if (songId) {
                        this.playSong(songId);
                    } else {
                        console.error('No song ID found on card:', card);
                    }
                });
            });
        }, 100);
    }

    /**
     * Generate full 88-key piano layout (A0-C8)
     */
    generateFullPianoLayout() {
        const notes = [];
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const keyMappings = ['z','s','x','d','c','v','g','b','h','n','j','m','q','2','w','3','e','r','5','t','6','y','7','u','i','9','o','0','p'];
        let keyIndex = 0;

        // Generate standard 88-key piano layout (A0-C8)
        // Start from A0, A#0, B0
        notes.push({ note: 'A0', type: 'white', key: keyMappings[keyIndex++] || '' });
        notes.push({ note: 'A#0', type: 'black', key: keyMappings[keyIndex++] || '' });
        notes.push({ note: 'B0', type: 'white', key: keyMappings[keyIndex++] || '' });

        // Generate complete octaves C1 through C7
        for (let octave = 1; octave <= 7; octave++) {
            for (let i = 0; i < noteNames.length; i++) {
                const noteName = noteNames[i];
                const type = noteName.includes('#') ? 'black' : 'white';
                const key = keyIndex < keyMappings.length ? keyMappings[keyIndex++] : '';
                notes.push({ note: `${noteName}${octave}`, type, key });
            }
        }

        // Final high C (C8)
        notes.push({ note: 'C8', type: 'white', key: '' });

        // Debug: Log some notes to verify
        console.log('🎹 Generated piano keys:', notes.slice(0, 10).map(n => n.note));
        console.log('🎹 Total keys:', notes.length);

        return notes;
    }

    /**
     * Set up piano keyboard with scroll functionality
     */
    setupKeyboard() {
        const keyboard = document.getElementById('piano-keyboard');
        keyboard.innerHTML = '';

        // Generate full 88-key piano layout (A0-C8) for real piano experience
        const notes = this.generateFullPianoLayout();

        notes.forEach(noteData => {
            const key = document.createElement('div');
            key.className = `piano-key ${noteData.type}`;
            key.dataset.note = noteData.note;
            key.dataset.key = noteData.key;
            
            // Add visual note label with octave number
            const label = document.createElement('span');
            label.className = 'key-label';
            label.textContent = noteData.note; // Keep full note name including octave number
            key.appendChild(label);

            // Touch and mouse events
            key.addEventListener('mousedown', (e) => this.playNote(noteData.note, e));
            key.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.playNote(noteData.note, e);
            }, { passive: false });

            keyboard.appendChild(key);
        });

        // Setup piano navigation
        this.setupPianoNavigation();
        
        // Center on middle C (C4) initially (with delay for DOM to settle)
        setTimeout(() => {
            this.scrollToNote('C4');
        }, 100);
    }

    /**
     * Setup piano navigation controls and scroll functionality
     */
    setupPianoNavigation() {
        const container = document.getElementById('piano-container');
        
        // Add navigation controls
        this.addNavigationControls();
        
        // Add touch/mouse scroll support
        this.addScrollSupport(container);
        
        // Add keyboard shortcuts for navigation
        this.addNavigationShortcuts();
    }

    /**
     * Add navigation controls UI
     */
    addNavigationControls() {
        const controlPanel = document.querySelector('.control-panel');
        
        const navControls = document.createElement('div');
        navControls.className = 'piano-navigation';
        navControls.innerHTML = `
            <div class="mode-switch">
                <button id="play-mode-btn" class="mode-switch-btn active">
                    🎹 Play Mode
                </button>
                <button id="scroll-mode-btn" class="mode-switch-btn">
                    🖱️ Scroll Mode
                </button>
            </div>
            <div class="octave-controls">
                <button id="scroll-left-btn" class="nav-btn">⬅️</button>
                <button id="scroll-to-c1" class="octave-btn">C1</button>
                <button id="scroll-to-c2" class="octave-btn">C2</button>
                <button id="scroll-to-c3" class="octave-btn">C3</button>
                <button id="scroll-to-c4" class="octave-btn active">C4</button>
                <button id="scroll-to-c5" class="octave-btn">C5</button>
                <button id="scroll-to-c6" class="octave-btn">C6</button>
                <button id="scroll-to-c7" class="octave-btn">C7</button>
                <button id="scroll-right-btn" class="nav-btn">➡️</button>
            </div>
            <div class="position-indicator">
                <span id="current-position">Middle C (C4)</span>
                <span id="interaction-hint">🎹 Click keys to play</span>
            </div>
        `;
        
        controlPanel.appendChild(navControls);
        
        // Add event listeners
        document.getElementById('play-mode-btn').addEventListener('click', () => this.switchInteractionMode('play'));
        document.getElementById('scroll-mode-btn').addEventListener('click', () => this.switchInteractionMode('scroll'));
        
        document.getElementById('scroll-left-btn').addEventListener('click', () => this.scrollPiano(-200));
        document.getElementById('scroll-right-btn').addEventListener('click', () => this.scrollPiano(200));
        
        // Octave navigation
        for (let i = 1; i <= 7; i++) {
            const btn = document.getElementById(`scroll-to-c${i}`);
            if (btn) {
                btn.addEventListener('click', () => this.scrollToNote(`C${i}`));
            }
        }
    }

    /**
     * Switch between play and scroll interaction modes
     */
    switchInteractionMode(mode) {
        this.interactionMode = mode;
        
        // Update UI
        document.querySelectorAll('.mode-switch-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (mode === 'play') {
            document.getElementById('play-mode-btn').classList.add('active');
            document.getElementById('interaction-hint').textContent = '🎹 Click keys to play';
        } else {
            document.getElementById('scroll-mode-btn').classList.add('active');
            document.getElementById('interaction-hint').textContent = '🖱️ Drag to scroll piano';
        }
        
        // Update piano container state
        const container = document.getElementById('piano-container');
        if (container) {
            container.classList.toggle('scroll-mode', mode === 'scroll');
            container.style.cursor = mode === 'scroll' ? 'grab' : 'default';
        }
        
        console.log(`Switched to ${mode} mode`);
    }

    /**
     * Add smooth scroll support with multiple input methods
     */
    addScrollSupport(container) {
        if (!container) {
            console.warn('Piano container not found for scroll support');
            return;
        }
        
        let isScrolling = false;
        let startX = 0;
        let scrollLeft = 0;

        // Mouse wheel support for easy scrolling (only in scroll mode)
        container.addEventListener('wheel', (e) => {
            if (this.interactionMode === 'scroll') {
                e.preventDefault();
                const scrollAmount = e.deltaY > 0 ? 100 : -100;
                container.scrollBy({
                    left: scrollAmount,
                    behavior: 'smooth'
                });
            }
        }, { passive: false });

        // Mouse drag support (only in scroll mode)
        container.addEventListener('mousedown', (e) => {
            // Only allow dragging in scroll mode
            if (this.interactionMode !== 'scroll') {
                return;
            }
            
            // Don't drag if clicking on a piano key
            if (e.target.classList.contains('piano-key') || e.target.classList.contains('key-label')) {
                return;
            }
            
            isScrolling = true;
            startX = e.pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
            container.style.cursor = 'grabbing';
            e.preventDefault();
        });

        document.addEventListener('mouseup', () => {
            if (isScrolling) {
                isScrolling = false;
                container.style.cursor = this.interactionMode === 'scroll' ? 'grab' : 'default';
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (!isScrolling) return;
            e.preventDefault();
            const x = e.pageX - container.offsetLeft;
            const walk = (x - startX) * 1.5;
            container.scrollLeft = scrollLeft - walk;
        });

        // Touch events for mobile
        container.addEventListener('touchstart', (e) => {
            // Don't interfere with piano key touches
            if (e.target.classList.contains('piano-key') || e.target.classList.contains('key-label')) {
                return;
            }
            startX = e.touches[0].pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
        }, { passive: true });

        container.addEventListener('touchmove', (e) => {
            if (e.target.classList.contains('piano-key') || e.target.classList.contains('key-label')) {
                return;
            }
            const x = e.touches[0].pageX - container.offsetLeft;
            const walk = (x - startX) * 1.5;
            container.scrollLeft = scrollLeft - walk;
        }, { passive: true });

        // Keyboard arrow keys support
        container.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.scrollPiano(-50);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.scrollPiano(50);
            }
        });

        // Update position indicator on scroll
        container.addEventListener('scroll', () => {
            this.updatePositionIndicator();
        });
    }

    /**
     * Add keyboard shortcuts for piano navigation
     */
    addNavigationShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.scrollPiano(-200);
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.scrollPiano(200);
                        break;
                    case 'Home':
                        e.preventDefault();
                        this.scrollToNote('A0');
                        break;
                    case 'End':
                        e.preventDefault();
                        this.scrollToNote('C8');
                        break;
                    case '4':
                        e.preventDefault();
                        this.scrollToNote('C4');
                        break;
                }
            }
        });
    }

    /**
     * Scroll piano by specific amount
     */
    scrollPiano(amount) {
        const container = document.getElementById('piano-container');
        if (container) {
            container.scrollBy({
                left: amount,
                behavior: 'smooth'
            });
        }
    }

    /**
     * Scroll to specific note
     */
    scrollToNote(noteName) {
        const noteElement = document.querySelector(`[data-note="${noteName}"]`);
        const container = document.getElementById('piano-container');
        
        if (noteElement && container) {
            const containerWidth = container.clientWidth;
            const notePosition = noteElement.offsetLeft;
            const noteWidth = noteElement.offsetWidth;
            
            // Center the note in view
            const scrollPosition = notePosition - (containerWidth / 2) + (noteWidth / 2);
            
            container.scrollTo({
                left: Math.max(0, scrollPosition),
                behavior: 'smooth'
            });
            
            // Update active octave button
            this.updateActiveOctaveButton(noteName);
            
            // Brief highlight effect
            noteElement.classList.add('highlighted');
            setTimeout(() => noteElement.classList.remove('highlighted'), 1000);
        }
    }

    /**
     * Update position indicator
     */
    updatePositionIndicator() {
        const container = document.getElementById('piano-container');
        if (!container) return;
        
        const scrollPosition = container.scrollLeft + container.clientWidth / 2;
        
        // Find the note closest to center
        const keys = document.querySelectorAll('.piano-key');
        let closestNote = null;
        let closestDistance = Infinity;
        
        keys.forEach(key => {
            const keyCenter = key.offsetLeft + key.offsetWidth / 2;
            const distance = Math.abs(keyCenter - scrollPosition);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestNote = key.dataset.note;
            }
        });
        
        if (closestNote) {
            const indicator = document.getElementById('current-position');
            if (indicator) {
                indicator.textContent = `Current: ${closestNote}`;
            }
        }
    }

    /**
     * Update active octave button
     */
    updateActiveOctaveButton(noteName) {
        // Remove active from all octave buttons
        document.querySelectorAll('.octave-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active to current octave
        const octave = noteName.charAt(noteName.length - 1);
        const activeBtn = document.getElementById(`scroll-to-c${octave}`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }

    /**
     * Set up mode handlers
     */
    setupModeHandlers() {
        this.switchMode('songs'); // Start in songs mode
    }

    /**
     * Play a note
     */
    async playNote(note, event) {
        if (!this.isLoaded) return;

        try {
            // Visual feedback
            const key = event.target.closest('.piano-key');
            if (key) {
                key.classList.add('pressed');
                setTimeout(() => key.classList.remove('pressed'), 150);
                
                // Create particle effect
                this.visualEffects.createParticles(event.clientX, event.clientY, note);
            }

            // Play audio
            await this.audioManager.playNote(note);


            // Check if this note is part of learning mode
            this.onNotePlayed(note);
            
            // Update UI only if not in learning mode (learning mode has its own updates)
            if (!this.isLearningMode) {
                this.updateInstructions(`Played: ${note}`);
                
                // Auto-scroll to follow played notes in play mode
                if (this.interactionMode === 'play') {
                    this.autoFollowNote(note);
                }
            }

        } catch (error) {
            console.error('Error playing note:', error);
        }
    }

    /**
     * Handle keyboard input
     */
    handleKeyboardInput(event) {
        if (!this.isLoaded) return;

        const key = event.key.toLowerCase();
        const pianoKey = document.querySelector(`[data-key="${key}"]`);
        
        if (pianoKey && !event.repeat) {
            const note = pianoKey.dataset.note;
            
            // Create fake event for visual effects
            const rect = pianoKey.getBoundingClientRect();
            const fakeEvent = {
                target: pianoKey,
                clientX: rect.left + rect.width / 2,
                clientY: rect.top + rect.height / 2
            };
            
            this.playNote(note, fakeEvent);
        }
    }

    /**
     * Switch between modes
     */
    switchMode(mode) {
        if (this.currentMode === mode) return;

        // Update UI
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        // Show/hide mode-specific UI
        const songSelector = document.getElementById('song-selector');

        songSelector.style.display = mode === 'songs' ? 'block' : 'none';

        // Update mode
        this.currentMode = mode;
        document.getElementById('current-mode').textContent = `Mode: ${this.getModeDisplayName(mode)}`;

        // Update instructions
        const instructions = {
            'free': '🎹 Tap the colorful keys to create beautiful music!',
            'songs': '🎵 Choose a song to learn and play along!'
        };
        
        this.updateInstructions(instructions[mode]);
        
        // Auto-scroll to middle C when entering songs mode
        if (mode === 'songs') {
            setTimeout(() => {
                this.scrollToNote('C4');
            }, 300);
        }

        console.log(`Switched to ${mode} mode`);
    }

    /**
     * Start learning a song with step-by-step guidance
     */
    async playSong(songId) {
        try {
            console.log('Attempting to play song with ID:', songId);
            
            if (!songId) {
                console.error('No song ID provided');
                this.updateInstructions('❌ Please select a valid song');
                return;
            }

            const song = this.songLibrary.getSong(songId);
            if (!song) {
                console.error(`Song not found: ${songId}`);
                console.log('Available songs:', this.songLibrary.getAllSongs().map(s => s.id));
                this.updateInstructions(`❌ Song "${songId}" not found`);
                return;
            }

            // Initialize learning mode
            this.currentSong = song;
            this.currentNoteIndex = 0;
            this.isLearningMode = true;

            // Auto-scroll to the first note of the song
            if (song.notes && song.notes.length > 0) {
                const firstNote = song.notes[0].note;
                this.scrollToNote(firstNote);
                
                // Show initial range highlight
                this.highlightSongRange(songId);
                
                // Start the learning process
                const timings = this.getSpeedTimings();
                setTimeout(() => {
                    this.startSongLearning();
                }, timings.initialDelay); // After range highlight disappears
            }

            // Show sheet music
            this.displaySheetMusic(song);
            
            this.updateInstructions(`🎵 Learning: ${song.title} | Watch for the highlighted notes!`);
            
        } catch (error) {
            console.error('Error loading song:', error);
        }
    }

    /**
     * Start the step-by-step song learning process
     */
    startSongLearning() {
        if (!this.currentSong || !this.isLearningMode) return;
        
        this.currentNoteIndex = 0;
        this.highlightNextNote();
        this.updateInstructions(`🎯 Play the highlighted note: ${this.getCurrentNote()?.note || 'None'}`);
    }

    /**
     * Highlight the next note to play
     */
    highlightNextNote() {
        // Clear previous next-note highlights
        document.querySelectorAll('.piano-key.next-note').forEach(key => {
            key.classList.remove('next-note');
        });

        const currentNote = this.getCurrentNote();
        if (!currentNote) {
            this.completeSong();
            return;
        }

        // Highlight the next note to play
        const noteElement = document.querySelector(`[data-note="${currentNote.note}"]`);
        if (noteElement) {
            noteElement.classList.add('next-note');
            
            // Auto-scroll to note if it's not visible
            this.autoFollowNote(currentNote.note);
        }
    }

    /**
     * Get the current note to play
     */
    getCurrentNote() {
        if (!this.currentSong || this.currentNoteIndex >= this.currentSong.notes.length) {
            return null;
        }
        return this.currentSong.notes[this.currentNoteIndex];
    }

    /**
     * Handle note played during learning mode
     */
    onNotePlayed(playedNote) {
        if (!this.isLearningMode || !this.currentSong) return;

        if (this.learningModeType === 'free') {
            // Free practice mode - any note from the song is accepted
            const songNotes = this.songLibrary.getSongNotes(this.currentSong.id);
            if (songNotes.includes(playedNote)) {
                this.updateInstructions(`🎹 Great! You played ${playedNote} from the song!`);
            }
            return;
        }

        // Guided mode - must play the correct note
        const expectedNote = this.getCurrentNote();
        if (!expectedNote) return;

        if (playedNote === expectedNote.note) {
            // Correct note played!
            this.onCorrectNote();
        } else {
            // Wrong note played
            this.onWrongNote(playedNote, expectedNote.note);
        }
    }

    /**
     * Handle correct note played
     */
    onCorrectNote() {
        const timings = this.getSpeedTimings();
        
        // Visual feedback for correct note
        const noteElement = document.querySelector(`[data-note="${this.getCurrentNote().note}"]`);
        if (noteElement) {
            noteElement.classList.add('correct-note');
            setTimeout(() => noteElement.classList.remove('correct-note'), timings.feedbackDuration);
        }

        // Move to next note
        this.currentNoteIndex++;
        
        // Update progress
        const progress = Math.round((this.currentNoteIndex / this.currentSong.notes.length) * 100);
        this.updateInstructions(`✅ Correct! Progress: ${progress}% (${this.currentNoteIndex}/${this.currentSong.notes.length})`);

        // Update sheet music progress
        this.updateSheetMusicProgress();

        // Highlight next note after a delay based on speed
        setTimeout(() => {
            this.highlightNextNote();
        }, timings.nextNoteDelay);
    }

    /**
     * Handle wrong note played
     */
    onWrongNote(playedNote, expectedNote) {
        const timings = this.getSpeedTimings();
        
        // Visual feedback for wrong note
        const playedElement = document.querySelector(`[data-note="${playedNote}"]`);
        if (playedElement) {
            playedElement.classList.add('wrong-note');
            setTimeout(() => playedElement.classList.remove('wrong-note'), timings.feedbackDuration);
        }

        this.updateInstructions(`❌ Try again! Expected: ${expectedNote}, you played: ${playedNote}`);
        
        // Keep the current note highlighted - return to instruction faster for instant mode
        const returnDelay = this.learningSpeed === 'instant' ? 800 : 1500;
        setTimeout(() => {
            this.updateInstructions(`🎯 Play the highlighted note: ${expectedNote}`);
        }, returnDelay);
    }

    /**
     * Complete the song learning
     */
    completeSong() {
        this.isLearningMode = false;
        
        // Clear all highlights
        document.querySelectorAll('.piano-key.next-note').forEach(key => {
            key.classList.remove('next-note');
        });

        // Celebration effect
        this.showCompletionCelebration();
        
        this.updateInstructions(`🎉 Congratulations! You completed "${this.currentSong.title}"! 🎉`);
        
        // Reset for next song
        this.currentSong = null;
        this.currentNoteIndex = 0;
    }

    /**
     * Show completion celebration
     */
    showCompletionCelebration() {
        // Add celebration animation to all keys used in the song
        const songNotes = this.songLibrary.getSongNotes(this.currentSong.id);
        songNotes.forEach((noteName, index) => {
            setTimeout(() => {
                const noteElement = document.querySelector(`[data-note="${noteName}"]`);
                if (noteElement) {
                    noteElement.classList.add('celebration');
                    setTimeout(() => noteElement.classList.remove('celebration'), 1000);
                }
            }, index * 100);
        });
    }

    /**
     * Display sheet music for the selected song
     */
    displaySheetMusic(song) {
        const sheetMusic = document.getElementById('sheet-music');
        const songTitleDisplay = document.getElementById('song-title-display');
        const noteSequence = document.getElementById('note-sequence');
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');

        if (!sheetMusic || !songTitleDisplay || !noteSequence) return;

        // Show sheet music
        sheetMusic.style.display = 'block';
        songTitleDisplay.textContent = song.title;

        // Reset progress
        progressFill.style.width = '0%';
        progressText.textContent = '0%';

        // Generate note sequence display
        noteSequence.innerHTML = '';
        song.notes.forEach((noteData, index) => {
            const noteElement = document.createElement('div');
            noteElement.className = 'note-item';
            noteElement.dataset.index = index;
            
            // Simplify note display (remove octave number for readability)
            const displayNote = noteData.note.replace(/[0-9]/g, '');
            noteElement.innerHTML = `
                <div class="note-symbol">${displayNote}</div>
            `;
            
            noteSequence.appendChild(noteElement);
        });

        // Add control handlers
        this.setupLearningControls();

        // Add close button handler
        const closeBtn = document.getElementById('close-sheet-btn');
        if (closeBtn) {
            closeBtn.onclick = () => {
                sheetMusic.style.display = 'none';
                this.isLearningMode = false;
                this.clearAllHighlights();
            };
        }
    }

    /**
     * Setup learning control handlers
     */
    setupLearningControls() {
        // Speed control buttons
        document.querySelectorAll('.speed-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active from all speed buttons
                document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
                
                // Add active to clicked button
                e.target.classList.add('active');
                
                // Update speed
                this.learningSpeed = e.target.dataset.speed;
                console.log(`Learning speed set to: ${this.learningSpeed}`);
            });
        });

        // Learning mode buttons
        document.querySelectorAll('.learning-mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active from all mode buttons
                document.querySelectorAll('.learning-mode-btn').forEach(b => b.classList.remove('active'));
                
                // Add active to clicked button
                e.target.classList.add('active');
                
                // Update mode
                this.learningModeType = e.target.dataset.mode;
                console.log(`Learning mode set to: ${this.learningModeType}`);
                
                // Apply mode changes
                this.applyLearningMode();
            });
        });
    }

    /**
     * Apply learning mode changes
     */
    applyLearningMode() {
        if (this.learningModeType === 'free') {
            // Free practice mode - clear guidance highlights
            this.clearAllHighlights();
            this.updateInstructions('🎹 Free Practice: Play any notes from the song!');
        } else {
            // Guided mode - restore current note highlight
            if (this.isLearningMode && this.currentSong) {
                this.highlightNextNote();
                const currentNote = this.getCurrentNote();
                this.updateInstructions(`🎯 Play the highlighted note: ${currentNote?.note || 'None'}`);
            }
        }
    }

    /**
     * Get timing delays based on learning speed
     */
    getSpeedTimings() {
        const timings = {
            slow: {
                initialDelay: 5000,     // 5 seconds to study range
                nextNoteDelay: 1200,    // 1.2 seconds between notes
                feedbackDuration: 800   // 0.8 seconds for feedback
            },
            normal: {
                initialDelay: 3500,     // 3.5 seconds to study range
                nextNoteDelay: 600,     // 0.6 seconds between notes
                feedbackDuration: 500   // 0.5 seconds for feedback
            },
            fast: {
                initialDelay: 2000,     // 2 seconds to study range
                nextNoteDelay: 300,     // 0.3 seconds between notes
                feedbackDuration: 300   // 0.3 seconds for feedback
            },
            instant: {
                initialDelay: 1000,     // 1 second to study range
                nextNoteDelay: 100,     // 0.1 seconds between notes
                feedbackDuration: 200   // 0.2 seconds for feedback
            }
        };
        
        return timings[this.learningSpeed] || timings.normal;
    }

    /**
     * Update sheet music progress
     */
    updateSheetMusicProgress() {
        if (!this.currentSong || !this.isLearningMode) return;

        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        const noteItems = document.querySelectorAll('.note-item');

        const progress = Math.round((this.currentNoteIndex / this.currentSong.notes.length) * 100);
        
        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressText) progressText.textContent = `${progress}%`;

        // Highlight current note in sheet music
        noteItems.forEach((item, index) => {
            item.classList.remove('current', 'completed');
            if (index < this.currentNoteIndex) {
                item.classList.add('completed');
            } else if (index === this.currentNoteIndex) {
                item.classList.add('current');
            }
        });
    }

    /**
     * Clear all learning highlights
     */
    clearAllHighlights() {
        document.querySelectorAll('.piano-key.next-note, .piano-key.correct-note, .piano-key.wrong-note').forEach(key => {
            key.classList.remove('next-note', 'correct-note', 'wrong-note');
        });
    }

    /**
     * Get the note range used in a song (lowest to highest)
     */
    getSongNoteRange(song) {
        if (!song.notes || song.notes.length === 0) return 'No notes';
        
        const notes = song.notes.map(n => n.note);
        const uniqueNotes = [...new Set(notes)].sort();
        
        return `${uniqueNotes[0]} - ${uniqueNotes[uniqueNotes.length - 1]}`;
    }

    /**
     * Highlight the range of keys used in a song
     */
    highlightSongRange(songId) {
        // Clear previous highlights
        document.querySelectorAll('.piano-key.song-highlight').forEach(key => {
            key.classList.remove('song-highlight');
        });

        const songNotes = this.songLibrary.getSongNotes(songId);
        if (!songNotes || songNotes.length === 0) return;

        // Highlight keys used in this song
        songNotes.forEach(noteName => {
            const noteElement = document.querySelector(`[data-note="${noteName}"]`);
            if (noteElement) {
                noteElement.classList.add('song-highlight');
            }
        });

        // Remove highlights after 3 seconds
        setTimeout(() => {
            document.querySelectorAll('.piano-key.song-highlight').forEach(key => {
                key.classList.remove('song-highlight');
            });
        }, 3000);
    }

    /**
     * Show loading progress
     */
    showLoadingProgress(text, progress) {
        const loadingText = document.getElementById('loading-text');
        const loadingProgress = document.getElementById('loading-progress');
        
        if (loadingText) loadingText.textContent = text;
        if (loadingProgress) loadingProgress.style.width = `${progress}%`;
    }

    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            // Show welcome message first
            this.showWelcomeMessage();
            
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    /**
     * Show welcome message for audio activation
     */
    showWelcomeMessage() {
        const welcomeOverlay = document.createElement('div');
        welcomeOverlay.id = 'welcome-overlay';
        welcomeOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(31, 27, 46, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            backdrop-filter: blur(10px);
        `;

        const welcomeContent = document.createElement('div');
        welcomeContent.style.cssText = `
            text-align: center;
            color: white;
            max-width: 400px;
            padding: 2rem;
        `;

        welcomeContent.innerHTML = `
            <h2 style="font-size: 2.5rem; margin-bottom: 1rem; background: linear-gradient(45deg, #8B5CF6, #EC4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                🎹 Welcome to Magic Piano Factory! ✨
            </h2>
            <p style="font-size: 1.2rem; margin-bottom: 2rem; color: #C4B5FD;">
                Tap anywhere to start your musical adventure!
            </p>
            <div style="font-size: 3rem; animation: pulse 2s infinite;">
                👆
            </div>
        `;

        welcomeOverlay.appendChild(welcomeContent);
        document.body.appendChild(welcomeOverlay);

        // Add click/touch handler
        const activateAudio = async () => {
            welcomeOverlay.remove();
            
            // Try to create audio context
            if (this.audioManager) {
                await this.audioManager.createAudioContext();
            }
            
            this.updateInstructions('🎹 Play keys, scroll with mouse wheel, or use navigation buttons!');
        };

        welcomeOverlay.addEventListener('click', activateAudio);
        welcomeOverlay.addEventListener('touchstart', activateAudio, { passive: true });
    }

    /**
     * Update volume button
     */
    updateVolumeButton() {
        const volumeBtn = document.getElementById('volume-btn');
        const isMuted = this.audioManager.isMuted();
        volumeBtn.textContent = isMuted ? '🔇' : '🔊';
        volumeBtn.title = isMuted ? 'Unmute' : 'Mute';
    }

    /**
     * Update instructions
     */
    updateInstructions(text) {
        const instructions = document.getElementById('instructions');
        if (instructions) {
            instructions.textContent = text;
        }
    }

    /**
     * Auto-scroll to follow played notes (gentler than manual scrollToNote)
     */
    autoFollowNote(noteName) {
        const noteElement = document.querySelector(`[data-note="${noteName}"]`);
        const container = document.getElementById('piano-container');
        
        if (!noteElement || !container) return;
        
        const containerRect = container.getBoundingClientRect();
        const noteRect = noteElement.getBoundingClientRect();
        
        // Check if note is outside visible area
        const isOutsideLeft = noteRect.left < containerRect.left + 50;
        const isOutsideRight = noteRect.right > containerRect.right - 50;
        
        if (isOutsideLeft || isOutsideRight) {
            const notePosition = noteElement.offsetLeft;
            const containerWidth = container.clientWidth;
            const noteWidth = noteElement.offsetWidth;
            
            // Center the note in view
            const scrollPosition = notePosition - (containerWidth / 2) + (noteWidth / 2);
            
            container.scrollTo({
                left: Math.max(0, scrollPosition),
                behavior: 'smooth'
            });
        }
    }

    /**
     * Get display name for mode
     */
    getModeDisplayName(mode) {
        const names = {
            'free': 'Free Play',
            'songs': 'Songs'
        };
        return names[mode] || mode;
    }

    /**
     * Show settings modal
     */
    showSettings() {
        // TODO: Implement settings modal
        alert('Settings coming soon!');
    }

    /**
     * Show help modal
     */
    showHelp() {
        // TODO: Implement help modal
        alert(`🎹 Magic Piano Help:

🎮 DUAL MODE SYSTEM:
• 🎹 Play Mode: Click keys to play (auto-follows)
• 🖱️ Scroll Mode: Drag & scroll freely

🖱️ Mouse Users:
• Play Mode: Click keys, piano follows you
• Scroll Mode: Mouse wheel + drag to navigate
• Switch modes with the toggle buttons

⌨️ Keyboard:
• Q-P keys: Play notes
• Arrow keys: Scroll piano (any mode)
• Ctrl+1-7: Jump to octaves

📱 Touch Users:
• Play Mode: Tap keys, auto-scroll follows
• Scroll Mode: Swipe to navigate
• Use C1-C7 buttons for quick jumps

💡 Tips:
• Play Mode: Perfect for performance
• Scroll Mode: Great for exploring range
• Piano auto-centers on played notes`);
    }

    /**
     * Show error message
     */
    showError(message) {
        // TODO: Implement proper error modal
        alert(`Error: ${message}`);
    }

    /**
     * Clean up resources
     */
    destroy() {
        if (this.audioManager) this.audioManager.destroy();
        if (this.visualEffects) this.visualEffects.destroy();
        
        console.log('Magic Piano Factory destroyed');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    const app = new MagicPianoFactory();
    
    // Make app available globally for debugging
    window.pianoApp = app;
    
    // Handle page unload
    window.addEventListener('beforeunload', () => {
        app.destroy();
    });
    
    // Start the application
    await app.init();
});

// Handle visibility change (pause when tab is hidden)
document.addEventListener('visibilitychange', () => {
    if (window.pianoApp && window.pianoApp.audioManager) {
        if (document.hidden) {
            window.pianoApp.audioManager.pause();
        } else {
            window.pianoApp.audioManager.resume();
        }
    }
});