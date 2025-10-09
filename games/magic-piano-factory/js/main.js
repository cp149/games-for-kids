/**
 * Magic Piano Factory - Main Application
 * Musical adventure game for children
 */

import { PianoEngine } from './core/PianoEngine.js';
import { AudioManager } from './audio/AudioManager.js';
import { AudioAnalyzer } from './audio/AudioAnalyzer.js';
import { VisualEffects } from './ui/VisualEffects.js';
import { SongLibrary } from './core/SongLibrary.js';

class MagicPianoFactory {
    constructor() {
        this.pianoEngine = null;
        this.audioManager = null;
        this.audioAnalyzer = null;
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
        this.audioPlaybackSource = null;
        this.lastDetectedNote = null;
        this.lastNoteTime = 0;
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
            this.audioAnalyzer = new AudioAnalyzer(this.audioManager);

            this.showLoadingProgress('Setting up magical effects...', 60);

            // Initialize components
            await this.pianoEngine.init();
            this.visualEffects.init();
            this.songLibrary.init();
            await this.audioAnalyzer.init();

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
        // Piano mode dropdown
        this.setupPianoModeDropdown();
        
        // Mode selector
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                if (mode) { // Only switch mode if button has a mode data attribute
                    this.switchMode(mode);
                }
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
     * Set up mode dropdown functionality
     */
    setupModeDropdown() {
        const dropdownBtn = document.getElementById('mode-dropdown-btn');
        const dropdownMenu = document.getElementById('mode-dropdown-menu');
        const modeOptions = document.querySelectorAll('.mode-option');

        // Toggle dropdown on button click
        dropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });

        // Handle mode selection
        modeOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                const modeText = e.target.textContent.trim();
                
                // Update button text
                dropdownBtn.textContent = modeText + ' ⯆';
                
                // Hide dropdown
                dropdownMenu.classList.remove('show');
                
                // Switch mode
                this.switchMode(mode);
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            dropdownMenu.classList.remove('show');
        });

        // Prevent dropdown from closing when clicking inside menu
        dropdownMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    /**
     * Set up piano mode dropdown functionality
     */
    setupPianoModeDropdown() {
        const dropdownBtn = document.getElementById('piano-mode-btn');
        const dropdownMenu = document.getElementById('piano-mode-menu');
        
        // Move menu to body to avoid z-index stacking issues
        if (dropdownMenu && dropdownMenu.parentNode !== document.body) {
            document.body.appendChild(dropdownMenu);
        }
        const modeOptions = document.querySelectorAll('.piano-mode-option');
        const octaveButtons = document.querySelectorAll('.octave-jump-btn');

        // Toggle dropdown on button click
        dropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            if (dropdownMenu.classList.contains('show')) {
                dropdownMenu.classList.remove('show');
            } else {
                // Calculate position relative to button
                const btnRect = dropdownBtn.getBoundingClientRect();
                const menuWidth = 280;
                const menuHeight = 400; // Approximate menu height
                
                // Calculate viewport dimensions
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                
                // Position menu - prefer right side of button, but ensure it fits in viewport
                let left = btnRect.right - menuWidth + 20; // Slight overlap with button
                let top = btnRect.bottom + 8;
                
                // Adjust if menu would go off right edge
                if (left + menuWidth > viewportWidth - 20) {
                    left = btnRect.left - menuWidth - 8; // Show on left side instead
                }
                
                // Adjust if menu would go off bottom edge
                if (top + menuHeight > viewportHeight - 20) {
                    top = btnRect.top - menuHeight - 8; // Show above button instead
                }
                
                // Ensure minimum margins
                left = Math.max(10, Math.min(left, viewportWidth - menuWidth - 10));
                top = Math.max(10, Math.min(top, viewportHeight - menuHeight - 10));
                
                console.log('Menu positioning:', { left, top, btnRect, viewportWidth, viewportHeight });
                
                // Apply position
                dropdownMenu.style.left = left + 'px';
                dropdownMenu.style.top = top + 'px';
                
                // Force high z-index and show menu
                dropdownMenu.style.zIndex = '999999';
                dropdownMenu.classList.add('show');
                
                console.log('Menu should be visible now', dropdownMenu.style.cssText);
            }
        });

        // Handle interaction mode selection
        modeOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                const modeText = e.target.textContent.trim();
                
                // Update button text
                dropdownBtn.textContent = modeText + ' ⯆';
                
                // Update active state
                modeOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                // Hide dropdown
                dropdownMenu.classList.remove('show');
                
                // Switch interaction mode
                this.switchInteractionMode(mode);
            });
        });

        // Handle octave jump buttons
        octaveButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const note = e.target.dataset.note;
                
                // Hide dropdown
                dropdownMenu.classList.remove('show');
                
                // Jump to the specified note
                this.scrollToNote(note);
                
                // Optional: Play the note as feedback
                this.audioManager.playNote(note, 0.5);
            });
        });

        // Handle scroll navigation buttons
        const scrollLeftBtn = document.getElementById('scroll-left-btn');
        const scrollRightBtn = document.getElementById('scroll-right-btn');
        
        if (scrollLeftBtn) {
            scrollLeftBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.scrollPiano(-200);
                // Keep menu open for continuous scrolling
            });
        }
        
        if (scrollRightBtn) {
            scrollRightBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.scrollPiano(200);
                // Keep menu open for continuous scrolling
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            dropdownMenu.classList.remove('show');
        });

        // Prevent dropdown from closing when clicking inside menu
        dropdownMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Set initial active state
        const playModeOption = document.querySelector('.piano-mode-option[data-mode="play"]');
        if (playModeOption) {
            playModeOption.classList.add('active');
        }
    }

    /**
     * Set up song card event listeners
     */
    setupSongCardListeners() {
        // Level button listeners
        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const level = btn.dataset.level;
                this.showSongPopup(level);
            });
        });

        // Song popup close button
        const closePopupBtn = document.getElementById('close-song-popup');
        if (closePopupBtn) {
            closePopupBtn.addEventListener('click', () => {
                this.hideSongPopup();
            });
        }

        // Close popup when clicking outside
        const songPopup = document.getElementById('song-popup');
        if (songPopup) {
            songPopup.addEventListener('click', (e) => {
                if (e.target === songPopup) {
                    this.hideSongPopup();
                }
            });
        }
    }

    /**
     * Show song selection popup for a specific level
     */
    showSongPopup(level) {
        const popup = document.getElementById('song-popup');
        const popupTitle = document.getElementById('popup-level-title');
        const popupSongs = document.getElementById('popup-songs');

        if (!popup || !popupTitle || !popupSongs) return;

        // Get songs for this level
        const songs = this.songLibrary.getSongsByDifficulty(level);
        
        // Update popup title
        const levelTitles = {
            'beginner': '🟢 Beginner Songs',
            'easy': '🟡 Easy Songs',
            'medium': '🟠 Medium Songs',
            'hard': '🔴 Hard Songs'
        };
        popupTitle.textContent = levelTitles[level] || 'Select a Song';

        // Clear existing songs
        popupSongs.innerHTML = '';

        // Add song cards
        songs.forEach(song => {
            const songCard = document.createElement('div');
            songCard.className = 'popup-song-card';
            songCard.dataset.song = song.id;
            
            // Map song IDs to emojis
            const songEmojis = {
                'baa-baa': '🐑',
                'three-mice': '🐭',
                'old-macdonald': '🚜',
                'twinkle': '⭐',
                'mary': '🐑',
                'row': '🚣',
                'london-bridge': '🌉',
                'hickory-dock': '🕐',
                'wheels-bus': '🚌',
                'are-you-sleeping': '😴',
                'birthday': '🎂',
                'jingle-bells': '🔔',
                'silent-night': '🌙',
                'merry-christmas': '🎄',
                'ode-to-joy': '🎼',
                'fur-elise': '🎹',
                'canon-d': '🎵',
                'ave-maria': '⛪',
                'audio-back3': '🎧'
            };

            const isAudioFile = !!song.audioFile;
            songCard.innerHTML = `
                <div class="popup-song-title">${songEmojis[song.id] || '🎵'} ${song.title} ${isAudioFile ? '(Audio)' : ''}</div>
                <div class="popup-song-info">${song.tempo} BPM | ${song.timeSignature} ${isAudioFile ? '| Real-time guidance' : ''}</div>
            `;

            songCard.addEventListener('click', () => {
                this.playSong(song.id);
                this.hideSongPopup();
            });

            popupSongs.appendChild(songCard);
        });

        // Move popup to body if not already there
        if (popup.parentNode !== document.body) {
            document.body.appendChild(popup);
        }

        // Show popup
        popup.style.display = 'flex';
        popup.style.position = 'fixed';
        popup.style.zIndex = '9999999';
        
        // Force reflow and add animation
        popup.offsetHeight;
        popup.classList.add('show');
    }

    /**
     * Hide song popup
     */
    hideSongPopup() {
        const popup = document.getElementById('song-popup');
        if (popup) {
            popup.classList.remove('show');
            setTimeout(() => {
                popup.style.display = 'none';
            }, 300);
        }
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
     * Add navigation controls UI (now removed - handled by popup)
     */
    addNavigationControls() {
        // Navigation is now handled by the popup modal
        // No permanent navigation bar needed
    }

    /**
     * Set up interaction mode dropdown functionality
     */
    setupInteractionModeDropdown() {
        const dropdownBtn = document.getElementById('interaction-mode-btn');
        const dropdownMenu = document.getElementById('interaction-mode-menu');
        const modeOptions = document.querySelectorAll('.interaction-mode-option');

        // Toggle dropdown on button click
        dropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });

        // Handle mode selection
        modeOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                const modeText = e.target.textContent.trim();
                
                // Update button text
                dropdownBtn.textContent = modeText + ' ⯆';
                
                // Hide dropdown
                dropdownMenu.classList.remove('show');
                
                // Switch interaction mode
                this.switchInteractionMode(mode);
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            dropdownMenu.classList.remove('show');
        });

        // Prevent dropdown from closing when clicking inside menu
        dropdownMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    /**
     * Switch between play and scroll interaction modes
     */
    switchInteractionMode(mode) {
        this.interactionMode = mode;
        
        // Update interaction hint
        const hintElement = document.getElementById('interaction-hint');
        if (hintElement) {
            if (mode === 'play') {
                hintElement.textContent = '🎹 Click keys to play';
            } else {
                hintElement.textContent = '🖱️ Drag to scroll piano';
            }
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
            // Update main position indicator (if it exists)
            const indicator = document.getElementById('current-position');
            if (indicator) {
                indicator.textContent = `Current: ${closestNote}`;
            }
            
            // Update popup position indicator
            const popupIndicator = document.getElementById('popup-current-position');
            if (popupIndicator) {
                popupIndicator.textContent = closestNote;
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

            // Check if this is an audio file song
            if (song.audioFile) {
                // Stop any previous audio playback
                if (this.audioPlaybackSource) {
                    this.audioPlaybackSource.stop();
                }

                // Set up audio callbacks
                console.log('Setting up audio callbacks...');
                this.audioAnalyzer.onNoteDetected = (detectedNote) => {
                    console.log('Audio analyzer callback triggered:', detectedNote);
                    this.onAudioNoteDetected(detectedNote);
                };
                
                // Set up playback completion callback
                this.audioAnalyzer.onPlaybackComplete = (extractedNotes) => {
                    console.log('Audio playback completed, starting guide mode...');
                    this.startGuideMode(extractedNotes);
                };

                // Load and play the audio file
                this.updateInstructions(`🎵 Loading audio: ${song.title}...`);
                
                try {
                    this.audioPlaybackSource = await this.audioAnalyzer.loadAndAnalyze(song.audioFile);
                    
                    // Show sheet music (empty for now, will be populated in real-time)
                    this.displaySheetMusic(song);
                    
                    this.updateInstructions(`🎵 Playing: ${song.title} | Follow the highlighted notes!`);
                } catch (error) {
                    console.error('Failed to load audio:', error);
                    this.updateInstructions(`❌ Failed to load audio file`);
                    return;
                }
                
            } else {
                // Normal song with predefined notes
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
            }
            
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

        // Highlight next note after a delay based on the actual note duration and tempo
        const currentNote = this.currentSong.notes[this.currentNoteIndex - 1]; // Previous note we just played
        const nextNoteDelay = this.calculateRhythmDelay(currentNote);
        
        setTimeout(() => {
            this.highlightNextNote();
        }, nextNoteDelay);
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
        
        // Check if this is an audio file song with no predefined notes
        if (song.audioFile && (!song.notes || song.notes.length === 0)) {
            // Clear any placeholder when notes start coming in
            // Notes will be added in real-time by addNoteToRealTimeSheet
            console.log('Audio file song - notes will be added in real-time');
        } else {
            // Normal song with predefined notes
            song.notes.forEach((noteData, index) => {
                const noteElement = document.createElement('div');
                noteElement.className = 'note-item';
                noteElement.dataset.index = index;
                
                // Create child-friendly note display
                const childDisplay = this.createChildFriendlyNote(noteData.note);
                noteElement.appendChild(childDisplay);
                
                noteSequence.appendChild(noteElement);
            });
        }

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
        // Speed control select (compact version)
        const speedSelect = document.getElementById('speed-select');
        if (speedSelect) {
            speedSelect.addEventListener('change', (e) => {
                this.learningSpeed = e.target.value;
                console.log(`Learning speed set to: ${this.learningSpeed}`);
            });
        }

        // Learning mode select (compact version)
        const modeSelect = document.getElementById('mode-select');
        if (modeSelect) {
            modeSelect.addEventListener('change', (e) => {
                this.learningModeType = e.target.value;
                console.log(`Learning mode set to: ${this.learningModeType}`);
                
                // Apply mode changes
                this.applyLearningMode();
            });
        }
    }

    /**
     * Handle note detected from audio analysis
     */
    onAudioNoteDetected(detectedNote) {
        console.log('onAudioNoteDetected:', this.isLearningMode, detectedNote?.note, detectedNote?.confidence);
        
        if (!this.isLearningMode || !detectedNote || detectedNote.confidence < 0.1) { // Lowered threshold
            console.log('Skipping note - conditions:', {
                notLearningMode: !this.isLearningMode,
                noDetectedNote: !detectedNote, 
                lowConfidence: detectedNote?.confidence < 0.1,
                actualConfidence: detectedNote?.confidence
            });
            return;
        }
        
        const noteName = detectedNote.note;
        const currentTime = Date.now();
        
        // Debounce - avoid adding the same note too frequently
        if (this.lastDetectedNote === noteName && currentTime - this.lastNoteTime < 300) {
            return; // Skip if same note within 300ms
        }
        
        // Only add notes with decent confidence
        if (detectedNote.confidence < 0.2) {
            return; // Skip low confidence notes
        }
        
        console.log('Adding note to sheet music:', noteName);
        this.lastDetectedNote = noteName;
        this.lastNoteTime = currentTime;
        
        // Clear previous highlights
        document.querySelectorAll('.piano-key.audio-active').forEach(key => {
            key.classList.remove('audio-active');
        });
        
        // Highlight the detected note
        const keyElement = document.querySelector(`[data-note="${noteName}"]`);
        if (keyElement) {
            keyElement.classList.add('audio-active', 'next-note');
            
            // Auto-follow the detected note
            this.autoFollowNote(noteName);
            
            // Update instructions
            this.updateInstructions(`🎵 Playing: ${noteName} (${Math.round(detectedNote.confidence * 100)}% confidence)`);
            
            // Add visual effect (commented out - method doesn't exist)
            // this.visualEffects.createNoteEffect(keyElement, noteName);
        }
        
        // Always add note to sheet music, even if key element not found
        this.addNoteToRealTimeSheet(noteName);
    }
    
    /**
     * Add note to real-time sheet music display
     */
    addNoteToRealTimeSheet(noteName) {
        const noteSequence = document.getElementById('note-sequence');
        if (!noteSequence) {
            console.error('Note sequence element not found');
            return;
        }
        
        // Create note item
        const noteItem = document.createElement('div');
        noteItem.className = 'note-item';
        
        // Show child-friendly note for audio analysis
        const childDisplay = this.createChildFriendlyNote(noteName);
        noteItem.appendChild(childDisplay);
        
        // Add to sequence
        noteSequence.appendChild(noteItem);
        
        // Scroll to the end
        noteSequence.scrollLeft = noteSequence.scrollWidth;
        
        // Limit the number of displayed notes
        const maxNotes = 30; // Increased to show more notes
        while (noteSequence.children.length > maxNotes) {
            noteSequence.removeChild(noteSequence.firstChild);
        }
        
        // Update progress based on time elapsed
        this.updateAudioProgress();
    }
    
    /**
     * Update progress bar for audio playback
     */
    updateAudioProgress() {
        if (!this.audioPlaybackSource || !this.audioPlaybackSource.buffer) return;
        
        const currentTime = this.audioManager.audioContext.currentTime;
        const duration = this.audioPlaybackSource.buffer.duration;
        
        // This is approximate - would need better time tracking for accuracy
        const progress = Math.min(100, (currentTime / duration) * 100);
        
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressText) progressText.textContent = `${Math.round(progress)}%`;
    }

    /**
     * Start guide mode after audio playback
     */
    startGuideMode(extractedNotes) {
        console.log('Starting guide mode with', extractedNotes.length, 'notes');
        
        // Update the current song with extracted notes
        if (this.currentSong) {
            // Convert extracted notes to the format expected by the learning system
            this.currentSong.notes = extractedNotes.map(noteData => ({
                note: noteData.note,
                duration: (noteData.endTime - noteData.startTime) * 1000 // Convert to milliseconds
            }));
            
            // Reset learning state
            this.currentNoteIndex = 0;
            
            // Update sheet music to show the extracted notes
            this.displayExtractedNotesInSheet(extractedNotes);
            
            // Start guided learning
            this.startSongLearning();
            
            // Update instructions
            this.updateInstructions(`🎯 Practice time! Play the highlighted notes in sequence`);
            
            // Auto-scroll to the first note
            if (extractedNotes.length > 0) {
                const firstNote = extractedNotes[0].note;
                this.scrollToNote(firstNote);
            }
        }
    }
    
    /**
     * Display extracted notes in sheet music
     */
    displayExtractedNotesInSheet(extractedNotes) {
        const noteSequence = document.getElementById('note-sequence');
        if (!noteSequence) return;
        
        // Clear existing notes
        noteSequence.innerHTML = '';
        
        // Add extracted notes
        extractedNotes.forEach((noteData, index) => {
            const noteElement = document.createElement('div');
            noteElement.className = 'note-item';
            noteElement.dataset.index = index;
            
            // Create child-friendly note display
            const childDisplay = this.createChildFriendlyNote(noteData.note);
            noteElement.appendChild(childDisplay);
            
            noteSequence.appendChild(noteElement);
        });
        
        // Update progress
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        if (progressFill) progressFill.style.width = '0%';
        if (progressText) progressText.textContent = '0%';
        
        console.log('Updated sheet music with', extractedNotes.length, 'extracted notes');
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
     * Calculate staff position for a note (for five-line staff display)
     */
    getStaffPosition(note) {
        // Extract note name and octave
        const noteName = note.replace(/[0-9]/g, '');
        const octave = parseInt(note.match(/[0-9]/)?.[0] || '4');
        
        // Base positions for treble clef (C4 = Middle C is below staff)
        const notePositions = {
            'C': 0, 'D': 1, 'E': 2, 'F': 3, 'G': 4, 'A': 5, 'B': 6
        };
        
        const baseNote = noteName.replace('#', '');
        const isSharp = noteName.includes('#');
        
        // Calculate position relative to C4 (Middle C)
        const basePosition = notePositions[baseNote];
        const octaveOffset = (octave - 4) * 7; // 7 semitones per octave in staff positions
        
        return {
            staffLine: basePosition + octaveOffset,
            isSharp: isSharp,
            noteName: baseNote
        };
    }

    /**
     * Create child-friendly visual note display
     */
    createChildFriendlyNote(note) {
        const container = document.createElement('div');
        container.className = 'child-note-display';
        
        // Get note color and info
        const noteInfo = this.getChildNoteInfo(note);
        
        // Create large colored circle for the note
        const noteCircle = document.createElement('div');
        noteCircle.className = 'note-circle';
        noteCircle.style.backgroundColor = noteInfo.color;
        noteCircle.textContent = noteInfo.letter;
        
        // Create simple piano key visual
        const keyVisual = document.createElement('div');
        keyVisual.className = 'key-visual';
        
        if (noteInfo.isBlackKey) {
            keyVisual.classList.add('black-key');
            keyVisual.style.backgroundColor = '#333';
        } else {
            keyVisual.classList.add('white-key');
            keyVisual.style.backgroundColor = 'white';
            keyVisual.style.border = '2px solid #333';
        }
        
        // Add position indicator
        const positionDot = document.createElement('div');
        positionDot.className = 'position-dot';
        positionDot.style.backgroundColor = noteInfo.color;
        positionDot.style.left = noteInfo.position + '%';
        
        keyVisual.appendChild(positionDot);
        
        container.appendChild(noteCircle);
        container.appendChild(keyVisual);
        
        return container;
    }

    /**
     * Get child-friendly note information
     */
    getChildNoteInfo(note) {
        const noteName = note.replace(/[0-9]/g, '');
        const octave = parseInt(note.match(/[0-9]/)?.[0] || '4');
        
        // Color coding for notes (rainbow style)
        const noteColors = {
            'C': '#FF6B6B',   // Red
            'C#': '#FF8E53',  // Orange-red  
            'D': '#FFB84D',   // Orange
            'D#': '#FFD93D',  // Yellow-orange
            'E': '#6BCF7F',   // Green
            'F': '#4ECDC4',   // Teal
            'F#': '#45B7D1',  // Blue
            'G': '#6C5CE7',   // Purple
            'G#': '#A29BFE',  // Light purple
            'A': '#FD79A8',   // Pink
            'A#': '#E17055',  // Brown
            'B': '#74B9FF'    // Light blue
        };
        
        // Position on simplified keyboard (0-100%)
        const keyPositions = {
            'C': 8, 'C#': 12, 'D': 20, 'D#': 24, 'E': 32,
            'F': 44, 'F#': 48, 'G': 56, 'G#': 60, 'A': 68, 'A#': 72, 'B': 80
        };
        
        // Adjust position based on octave
        let basePosition = keyPositions[noteName] || 50;
        if (octave === 3) basePosition -= 30;
        else if (octave === 5) basePosition += 20;
        
        return {
            letter: noteName,
            color: noteColors[noteName] || '#999',
            isBlackKey: noteName.includes('#'),
            position: Math.max(10, Math.min(90, basePosition)),
            octave: octave
        };
    }

    /**
     * Get display information for a piano key
     */
    getKeyDisplayInfo(note) {
        // Extract note name and octave
        const noteName = note.replace(/[0-9]/g, '');
        const octave = parseInt(note.match(/[0-9]/)?.[0] || '4');
        
        // Position descriptions for different octaves
        const positionMap = {
            'C3': 'Far Left',
            'D3': 'Left Side',
            'E3': 'Left Side',
            'F3': 'Left Side',
            'G3': 'Left Side',
            'A3': 'Left Side',
            'B3': 'Left Side',
            'C4': 'Middle C',
            'D4': 'Center Right',
            'E4': 'Center Right',
            'F4': 'Center Right',
            'G4': 'Center Right',
            'A4': 'Center Right',
            'B4': 'Center Right',
            'C5': 'Right Side',
            'D5': 'Right Side',
            'E5': 'Right Side',
            'F5': 'Right Side',
            'G5': 'Right Side',
            'A5': 'Right Side',
            'B5': 'Right Side',
            'C#3': 'Left Black',
            'D#3': 'Left Black',
            'F#3': 'Left Black',
            'G#3': 'Left Black',
            'A#3': 'Left Black',
            'C#4': 'Center Black',
            'D#4': 'Center Black',
            'F#4': 'Center Black',
            'G#4': 'Center Black',
            'A#4': 'Center Black',
            'C#5': 'Right Black',
            'D#5': 'Right Black',
            'F#5': 'Right Black',
            'G#5': 'Right Black',
            'A#5': 'Right Black',
        };
        
        // Get position description
        const position = positionMap[note] || `Octave ${octave}`;
        
        // Simple display name
        const displayName = noteName;
        
        return {
            displayName,
            position
        };
    }

    /**
     * Calculate rhythm-based delay for next note
     */
    calculateRhythmDelay(note) {
        if (!note || !note.duration) {
            // Fallback to speed-based timing
            const timings = this.getSpeedTimings();
            return timings.nextNoteDelay;
        }
        
        // Base the delay on the note's actual duration
        let baseDelay = note.duration;
        
        // Apply speed modifications
        const speedMultipliers = {
            slow: 1.5,     // 50% slower
            normal: 1.0,   // Normal speed
            fast: 0.7,     // 30% faster
            instant: 0.3   // Very fast
        };
        
        const multiplier = speedMultipliers[this.learningSpeed] || 1.0;
        const rhythmDelay = Math.max(200, baseDelay * multiplier); // Minimum 200ms
        
        console.log(`Note delay: ${rhythmDelay}ms (duration: ${note.duration}ms, speed: ${this.learningSpeed})`);
        return rhythmDelay;
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