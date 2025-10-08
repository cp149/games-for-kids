/**
 * Magic Piano Factory - Main Application
 * Musical adventure game for children
 */

import { PianoEngine } from './core/PianoEngine.js';
import { AudioManager } from './audio/AudioManager.js';
import { VisualEffects } from './ui/VisualEffects.js';
import { SongLibrary } from './core/SongLibrary.js';
import { RecordingManager } from './core/RecordingManager.js';

class MagicPianoFactory {
    constructor() {
        this.pianoEngine = null;
        this.audioManager = null;
        this.visualEffects = null;
        this.songLibrary = null;
        this.recordingManager = null;
        this.currentMode = 'free';
        this.isLoaded = false;
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
            this.recordingManager = new RecordingManager();

            this.showLoadingProgress('Setting up magical effects...', 60);

            // Initialize components
            await this.pianoEngine.init();
            this.visualEffects.init();
            this.songLibrary.init();
            this.recordingManager.init();

            this.showLoadingProgress('Connecting components...', 80);

            // Set up event listeners
            this.setupEventListeners();
            this.setupKeyboard();
            this.setupModeHandlers();

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

        // Playback controls
        document.getElementById('play-btn').addEventListener('click', () => {
            this.recordingManager.play();
        });

        document.getElementById('stop-btn').addEventListener('click', () => {
            this.recordingManager.stop();
        });

        document.getElementById('clear-btn').addEventListener('click', () => {
            this.recordingManager.clear();
        });

        // Song selection
        document.querySelectorAll('.song-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const songId = e.target.dataset.song;
                this.playSong(songId);
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
            
            // Add visual note label
            const label = document.createElement('span');
            label.className = 'key-label';
            label.textContent = noteData.note.replace(/[0-9]/g, '');
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
            </div>
        `;
        
        controlPanel.appendChild(navControls);
        
        // Add event listeners
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

        // Mouse wheel support for easy scrolling
        container.addEventListener('wheel', (e) => {
            e.preventDefault();
            const scrollAmount = e.deltaY > 0 ? 100 : -100;
            container.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        }, { passive: false });

        // Mouse drag support (only when not clicking on piano keys)
        container.addEventListener('mousedown', (e) => {
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
                container.style.cursor = 'grab';
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
        this.switchMode('free'); // Start in free play mode
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

            // Record if in recording mode
            if (this.currentMode === 'record') {
                this.recordingManager.recordNote(note, Date.now());
            }

            // Update UI
            this.updateInstructions(`Played: ${note}`);

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
        const playbackControls = document.getElementById('playback-controls');

        songSelector.style.display = mode === 'songs' ? 'block' : 'none';
        playbackControls.style.display = mode === 'record' ? 'flex' : 'none';

        // Update mode
        this.currentMode = mode;
        document.getElementById('current-mode').textContent = `Mode: ${this.getModeDisplayName(mode)}`;

        // Update instructions
        const instructions = {
            'free': '🎹 Tap the colorful keys to create beautiful music!',
            'songs': '🎵 Choose a song to learn and play along!',
            'record': '🎙️ Record your musical creation and play it back!'
        };
        
        this.updateInstructions(instructions[mode]);

        console.log(`Switched to ${mode} mode`);
    }

    /**
     * Play a preset song
     */
    async playSong(songId) {
        try {
            const song = this.songLibrary.getSong(songId);
            if (!song) {
                console.error(`Song not found: ${songId}`);
                return;
            }

            this.updateInstructions(`🎵 Playing: ${song.title}`);
            
            // TODO: Implement song playback with visual guidance
            console.log(`Playing song: ${song.title}`);
            
        } catch (error) {
            console.error('Error playing song:', error);
        }
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
     * Get display name for mode
     */
    getModeDisplayName(mode) {
        const names = {
            'free': 'Free Play',
            'songs': 'Songs',
            'record': 'Recording'
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

🖱️ Mouse Users:
• Mouse wheel: Scroll piano left/right
• Click & drag: Drag piano (outside keys)
• Click keys: Play notes

⌨️ Keyboard:
• Q-P keys: Play notes
• Arrow keys: Scroll piano
• Ctrl+1-7: Jump to octaves

📱 Touch Users:
• Swipe: Scroll piano
• Tap keys: Play notes
• Use navigation buttons

🎵 Navigation:
• C1-C7 buttons: Jump to octaves
• ⬅️➡️ buttons: Scroll slowly`);
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
        if (this.recordingManager) this.recordingManager.destroy();
        
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