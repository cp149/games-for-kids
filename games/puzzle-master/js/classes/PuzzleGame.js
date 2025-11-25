/**
 * PuzzleGame - Main game controller
 */

// Use unified config (GAME_CONFIG alias for backward compatibility)
const GAME_CONFIG = CONFIG.GAME;

class PuzzleGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.imageLoader = new ImageLoader();
        this.puzzleBoard = null;
        this.currentDifficulty = 3;
        this.startTime = 0;
        this.timerInterval = null;
        this.elapsedBeforePause = 0;  // Track elapsed time for pause/resume
        this.moveCount = 0;
        this.winCount = 0;  // Track wins for auto difficulty upgrade
        this.timerWasPaused = false;  // Track timer pause state for visibility change

        // Background music
        this.bgMusic = null;
        this.currentMusicIndex = 0;
        this.isMusicPlaying = false;
        this.handleMusicEnded = null;  // Bound handler for cleanup

        // Bound event handlers for cleanup
        this.handlePieceDropped = null;
        this.handleKeydown = null;
        this.handleVisibilityChange = null;

        // Store DOM element handlers for cleanup
        this.domHandlers = new Map();

        this.init();
    }

    init() {
        this.createUI();
        this.setupEventListeners();
        this.loadDefaultImage();
        this.showTutorialIfNeeded();
    }

    showTutorialIfNeeded() {
        const hasSeenTutorial = localStorage.getItem('puzzleMasterTutorialSeen');
        if (!hasSeenTutorial) {
            setTimeout(() => {
                this.showTutorial();
                localStorage.setItem('puzzleMasterTutorialSeen', 'true');
            }, GAME_CONFIG.TUTORIAL_DELAY);
        }
    }

    showTutorial() {
        const tutorial = document.createElement('div');
        tutorial.className = 'tutorial-modal';
        tutorial.innerHTML = `
            <h2>Welcome to Puzzle Master! 🧩</h2>
            <div class="tutorial-content">
                <p><strong>How to Play:</strong></p>
                <ul>
                    <li>Drag pieces from the right to the board</li>
                    <li>Pieces snap when close to correct position</li>
                    <li>Use <strong>H</strong> key for hints</li>
                    <li>Use <strong>R</strong> key to shuffle</li>
                    <li>Press <strong>Space</strong> to view reference image</li>
                </ul>
            </div>
            <button class="tutorial-btn" id="tutorial-close">Got it!</button>
        `;

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';

        document.body.appendChild(overlay);
        document.body.appendChild(tutorial);

        const closeTutorial = () => {
            tutorial.remove();
            overlay.remove();
        };

        document.getElementById('tutorial-close').onclick = closeTutorial;
        overlay.onclick = closeTutorial;
    }

    createUI() {
        this.container.innerHTML = `
            <div class="puzzle-game">
                <header class="game-header">
                    <h1>🧩 Puzzle Master</h1>
                    <div class="game-stats">
                        <span class="timer">⏱️ <span id="timer">00:00</span></span>
                        <span class="moves">🔄 <span id="moves">0</span> moves</span>
                        <span class="progress">🧩 <span id="progress">0%</span></span>
                    </div>
                </header>

                <div class="controls-panel">
                    <div class="difficulty-selector">
                        <label>Difficulty:</label>
                        <input type="range" id="difficulty-slider" min="2" max="5" value="3" class="difficulty-slider">
                        <span id="difficulty-label" class="difficulty-label">Medium (9)</span>
                        <button class="control-btn" id="shuffle-btn">🔀 New</button>
                    </div>

                    <div class="image-controls">
                        <button class="control-btn" id="load-file-btn">📁 Image</button>
                        <button class="control-btn" id="load-camera-btn">📷 Camera</button>
                        <button class="control-btn" id="hint-btn">💡 Hint</button>
                        <button class="control-btn" id="toggle-reference">👁️ Ref</button>
                        <button class="control-btn" id="music-btn">🎵</button>
                    </div>

                    <input type="file" id="file-input" accept="image/*" style="display: none;">
                    <input type="file" id="camera-input" accept="image/*" capture="environment" style="display: none;">
                </div>

                <div class="game-area">
                    <div class="board-container">
                        <div class="puzzle-board" id="puzzle-board"></div>
                    </div>
                    <div class="pieces-container">
                        <h3>Puzzle Pieces</h3>
                        <div class="pieces-area" id="pieces-area"></div>
                    </div>
                </div>

                <div class="reference-modal" id="reference-modal" style="display: none;">
                    <div class="modal-content">
                        <button class="close-modal" id="close-modal">✕</button>
                        <img id="reference-img" alt="Reference">
                    </div>
                </div>
            </div>
        `;
    }

    // Helper to add DOM event listener with cleanup tracking
    addDomListener(elementId, event, handler) {
        const element = document.getElementById(elementId);
        if (element) {
            const boundHandler = handler.bind(this);
            element.addEventListener(event, boundHandler);
            // Store for cleanup
            const key = `${elementId}:${event}`;
            this.domHandlers.set(key, { element, event, handler: boundHandler });
        }
    }

    setupEventListeners() {
        // Difficulty slider
        this.addDomListener('difficulty-slider', 'input', function(e) {
            this.currentDifficulty = parseInt(e.target.value);
            this.updateDifficultyLabel();
        });
        this.addDomListener('difficulty-slider', 'change', function() {
            this.startNewPuzzle();
        });

        // Image loading
        this.addDomListener('load-file-btn', 'click', function() {
            document.getElementById('file-input').click();
        });

        this.addDomListener('file-input', 'change', function(e) {
            const file = e.target.files[0];
            if (file) {
                this.imageLoader.loadFromFile(file)
                    .then(img => this.startNewPuzzle(img))
                    .catch(err => this.showToast('Failed to load image', 'error'));
            }
        });

        this.addDomListener('load-camera-btn', 'click', function() {
            document.getElementById('camera-input').click();
        });

        this.addDomListener('camera-input', 'change', function(e) {
            const file = e.target.files[0];
            if (file) {
                this.imageLoader.loadFromFile(file)
                    .then(img => this.startNewPuzzle(img))
                    .catch(err => this.showToast('Failed to load image', 'error'));
            }
        });

        // Game controls - Shuffle creates new puzzle with current difficulty
        this.addDomListener('shuffle-btn', 'click', function() {
            this.startNewPuzzle();
        });

        this.addDomListener('hint-btn', 'click', function() {
            if (this.puzzleBoard) {
                this.puzzleBoard.showHint();
            }
        });

        // Reference toggle
        this.addDomListener('toggle-reference', 'click', function() {
            const modal = document.getElementById('reference-modal');
            modal.style.display = 'flex';
        });

        this.addDomListener('close-modal', 'click', function() {
            document.getElementById('reference-modal').style.display = 'none';
        });

        this.addDomListener('reference-modal', 'click', function(e) {
            if (e.target.id === 'reference-modal') {
                document.getElementById('reference-modal').style.display = 'none';
            }
        });

        // Track moves - bind handler for cleanup
        this.handlePieceDropped = () => {
            this.moveCount++;
            document.getElementById('moves').textContent = this.moveCount;
        };
        document.addEventListener('pieceDropped', this.handlePieceDropped);

        // Music control
        this.addDomListener('music-btn', 'click', function() {
            this.toggleMusic();
        });
    }

    loadDefaultImage() {
        // Load a random background image from shared lib
        const bgImages = GAME_CONFIG.DEFAULT_IMAGES;
        const randomBg = bgImages[Math.floor(Math.random() * bgImages.length)];

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = randomBg;
        img.onload = () => {
            this.startNewPuzzle(img);
        };
        img.onerror = () => {
            // Fallback to generated image if loading fails
            this.loadGeneratedImage();
        };
    }

    loadGeneratedImage() {
        // Fallback: Create a colorful generated image
        const { SIZE, CIRCLE_RADIUS, CIRCLE_X, CIRCLE_Y } = GAME_CONFIG.GENERATED_IMAGE;
        const canvas = document.createElement('canvas');
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext('2d');

        const gradient = ctx.createLinearGradient(0, 0, SIZE, SIZE);
        gradient.addColorStop(0, '#FF6B6B');
        gradient.addColorStop(0.5, '#4ECDC4');
        gradient.addColorStop(1, '#45B7D1');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, SIZE, SIZE);

        ctx.fillStyle = '#FFE66D';
        ctx.beginPath();
        ctx.arc(CIRCLE_X, CIRCLE_Y, CIRCLE_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        const img = new Image();
        img.src = canvas.toDataURL();
        img.onload = () => {
            this.startNewPuzzle(img);
        };
    }

    startNewPuzzle(image = null) {
        const img = image || this.imageLoader.getCurrentImage();
        if (!img) return;

        // Save current image for shuffle functionality
        if (image) {
            this.imageLoader.currentImage = image;
        }

        // Stop timer and cleanup before starting new puzzle
        this.stopTimer();

        // Destroy existing puzzle
        if (this.puzzleBoard) {
            this.puzzleBoard.destroy();
        }

        // Clear any existing confetti
        document.querySelectorAll('.confetti').forEach(c => c.remove());

        // Create new puzzle
        const boardContainer = document.getElementById('puzzle-board');
        this.puzzleBoard = new PuzzleBoard(boardContainer, img, this.currentDifficulty);

        this.puzzleBoard.onComplete = () => {
            this.onPuzzleComplete();
        };

        this.puzzleBoard.onFirstPiecePlaced = () => {
            if (!this.isMusicPlaying) {
                this.autoStartMusic();
            }
        };

        document.getElementById('reference-img').src = img.src;

        this.resetStats();
        this.startTimer();
    }

    startTimer(resume = false) {
        this.stopTimer(false);  // Don't save elapsed when starting

        if (resume && this.elapsedBeforePause > 0) {
            // Resume from paused time
            this.startTime = Date.now() - this.elapsedBeforePause;
        } else {
            // Fresh start
            this.startTime = Date.now();
            this.elapsedBeforePause = 0;
        }

        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            document.getElementById('timer').textContent = `${minutes}:${seconds}`;
        }, 1000);
    }

    stopTimer(saveElapsed = true) {
        if (this.timerInterval) {
            if (saveElapsed) {
                // Save elapsed time for potential resume
                this.elapsedBeforePause = Date.now() - this.startTime;
            }
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    resetStats() {
        this.moveCount = 0;
        this.elapsedBeforePause = 0;
        document.getElementById('moves').textContent = '0';
        document.getElementById('timer').textContent = '00:00';
    }

    onPuzzleComplete() {
        this.stopTimer();

        const time = document.getElementById('timer').textContent;
        const moves = this.moveCount;

        // Track wins and auto upgrade difficulty
        this.winCount++;
        if (this.winCount % GAME_CONFIG.WINS_PER_DIFFICULTY_UPGRADE === 0 &&
            this.currentDifficulty < GAME_CONFIG.MAX_DIFFICULTY) {
            this.currentDifficulty++;
            this.updateDifficultyUI();
        }

        // Add celebration effect with stats
        this.showCelebration(time, moves);
    }

    updateDifficultyLabel() {
        document.getElementById('difficulty-label').textContent =
            GAME_CONFIG.DIFFICULTY_LABELS[this.currentDifficulty];
    }

    updateDifficultyUI() {
        document.getElementById('difficulty-slider').value = this.currentDifficulty;
        this.updateDifficultyLabel();
    }

    showCelebration(time, moves) {
        // Use fewer confetti elements for better performance
        const fragment = document.createDocumentFragment();
        const confettiCount = GAME_CONFIG.CONFETTI_COUNT;

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            const size = 8 + Math.random() * 12;
            // Use CSS custom properties for better performance
            confetti.style.setProperty('--confetti-size', `${size}px`);
            confetti.style.setProperty('--confetti-color', `hsl(${Math.random() * 360}, 100%, 50%)`);
            confetti.style.setProperty('--confetti-left', `${Math.random() * 100}%`);
            confetti.style.setProperty('--confetti-radius', Math.random() > 0.5 ? '50%' : '0');
            confetti.style.setProperty('--confetti-duration', `${2 + Math.random() * 2}s`);
            fragment.appendChild(confetti);
        }

        document.body.appendChild(fragment);

        setTimeout(() => {
            document.querySelectorAll('.confetti').forEach(c => c.remove());
        }, GAME_CONFIG.CONFETTI_DURATION);

        // Show stats in a nice banner after a short delay
        setTimeout(() => {
            const statsBanner = document.createElement('div');
            statsBanner.className = 'stats-banner';
            statsBanner.innerHTML = `
                <div class="stats-title">Puzzle Complete!</div>
                <div class="stats-details">⏱️ Time: ${time} | 🔄 Moves: ${moves}</div>
            `;

            document.body.appendChild(statsBanner);

            setTimeout(() => {
                statsBanner.remove();
            }, GAME_CONFIG.STATS_DISPLAY_DURATION);
        }, GAME_CONFIG.CELEBRATION_DELAY);
    }

    initMusic() {
        if (!this.bgMusic) {
            this.bgMusic = new Audio(GAME_CONFIG.MUSIC_FILES[this.currentMusicIndex]);
            this.bgMusic.loop = false;
            this.bgMusic.volume = GAME_CONFIG.MUSIC_VOLUME;

            // Bind handler once for cleanup
            this.handleMusicEnded = () => {
                this.currentMusicIndex = (this.currentMusicIndex + 1) % GAME_CONFIG.MUSIC_FILES.length;
                this.bgMusic.src = GAME_CONFIG.MUSIC_FILES[this.currentMusicIndex];
                if (this.isMusicPlaying) {
                    this.bgMusic.play();
                }
            };
            this.bgMusic.addEventListener('ended', this.handleMusicEnded);
        }
    }

    // Update music button appearance based on playing state
    updateMusicButtonState(isPlaying) {
        const btn = document.getElementById('music-btn');
        if (btn) {
            btn.textContent = isPlaying ? '🔇 Music' : '🎵 Music';
            btn.style.opacity = isPlaying ? '1' : '0.7';
        }
    }

    toggleMusic() {
        this.initMusic();

        if (this.isMusicPlaying) {
            this.bgMusic.pause();
            this.isMusicPlaying = false;
        } else {
            this.bgMusic.play().catch(() => {});
            this.isMusicPlaying = true;
        }
        this.updateMusicButtonState(this.isMusicPlaying);
    }

    stopMusic() {
        if (this.bgMusic && this.isMusicPlaying) {
            this.bgMusic.pause();
            this.isMusicPlaying = false;
            this.updateMusicButtonState(false);
        }
    }

    autoStartMusic() {
        // Only auto-start if music is not already playing
        if (!this.isMusicPlaying) {
            this.initMusic();
            this.bgMusic.play().then(() => {
                this.isMusicPlaying = true;
                this.updateMusicButtonState(true);
            }).catch(() => {});
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, GAME_CONFIG.TOAST_DURATION);
    }

    // Cleanup temporary DOM elements
    cleanupTemporaryElements() {
        const selectors = ['.confetti', '.toast', '.tutorial-modal', '.modal-overlay', '.stats-banner'];
        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => el.remove());
        });
    }

    // Cleanup all resources to prevent memory leaks
    destroy() {
        // Stop timer
        this.stopTimer();

        // Stop and cleanup music
        if (this.bgMusic) {
            this.bgMusic.pause();
            if (this.handleMusicEnded) {
                this.bgMusic.removeEventListener('ended', this.handleMusicEnded);
            }
            this.bgMusic = null;
        }

        // Remove pieceDropped listener
        if (this.handlePieceDropped) {
            document.removeEventListener('pieceDropped', this.handlePieceDropped);
        }

        // Remove keyboard listener
        if (this.handleKeydown) {
            document.removeEventListener('keydown', this.handleKeydown);
        }

        // Remove visibility change listener
        if (this.handleVisibilityChange) {
            document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        }

        // Remove all tracked DOM listeners
        if (this.domHandlers) {
            this.domHandlers.forEach(({ element, event, handler }) => {
                element.removeEventListener(event, handler);
            });
            this.domHandlers.clear();
        }

        // Destroy puzzle board
        if (this.puzzleBoard) {
            this.puzzleBoard.destroy();
            this.puzzleBoard = null;
        }

        // Cleanup image loader
        if (this.imageLoader) {
            this.imageLoader.destroy();
        }

        // Clear temporary elements
        this.cleanupTemporaryElements();
    }
}
