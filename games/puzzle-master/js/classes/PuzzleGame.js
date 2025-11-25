/**
 * PuzzleGame - Main game controller
 * Uses UIManager, MusicManager, TimerManager for separation of concerns
 */

// Use unified config (GAME_CONFIG alias for backward compatibility)
const GAME_CONFIG = CONFIG.GAME;

class PuzzleGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);

        // Initialize managers
        this.uiManager = new UIManager(this.container);
        this.musicManager = new MusicManager();
        this.timerManager = new TimerManager();

        // Core components
        this.imageLoader = new ImageLoader();
        this.puzzleBoard = null;

        // Game state
        this.currentDifficulty = 3;
        this.moveCount = 0;
        this.winCount = 0;

        // Bound event handlers for cleanup
        this.handlePieceDropped = null;
        this.handleKeydown = null;
        this.handleVisibilityChange = null;

        // Store DOM element handlers for cleanup
        this.domHandlers = new Map();

        this.init();
    }

    init() {
        this.uiManager.createUI();
        this.setupEventListeners();
        this.loadDefaultImage();
        this.uiManager.showTutorialIfNeeded();
    }

    /**
     * Helper to add DOM event listener with cleanup tracking
     */
    addDomListener(elementId, event, handler) {
        const element = document.getElementById(elementId);
        if (element) {
            const boundHandler = handler.bind(this);
            element.addEventListener(event, boundHandler);
            const key = `${elementId}:${event}`;
            this.domHandlers.set(key, { element, event, handler: boundHandler });
        }
    }

    setupEventListeners() {
        // Difficulty slider
        this.addDomListener('difficulty-slider', 'input', function(e) {
            this.currentDifficulty = parseInt(e.target.value);
            this.uiManager.updateDifficultyLabel(this.currentDifficulty);
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
                    .catch(() => this.uiManager.showToast('Failed to load image', 'error'));
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
                    .catch(() => this.uiManager.showToast('Failed to load image', 'error'));
            }
        });

        // Game controls
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

        // Track moves
        this.handlePieceDropped = () => {
            this.moveCount++;
            document.getElementById('moves').textContent = this.moveCount;
        };
        document.addEventListener('pieceDropped', this.handlePieceDropped);

        // Music control
        this.addDomListener('music-btn', 'click', function() {
            this.musicManager.toggle();
        });
    }

    loadDefaultImage() {
        this.imageLoader.loadRandomDefault()
            .then(img => this.startNewPuzzle(img))
            .catch(() => {
                this.imageLoader.loadGeneratedFallback()
                    .then(img => this.startNewPuzzle(img));
            });
    }

    startNewPuzzle(image = null) {
        const img = image || this.imageLoader.getCurrentImage();
        if (!img) return;

        if (image) {
            this.imageLoader.currentImage = image;
        }

        // Stop timer and cleanup
        this.timerManager.stop();

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
            if (!this.musicManager.isMusicPlaying) {
                this.musicManager.autoStart();
            }
        };

        document.getElementById('reference-img').src = img.src;

        this.resetStats();
        this.timerManager.start();
    }

    /**
     * Start timer (wrapper for external access)
     */
    startTimer(resume = false) {
        this.timerManager.start(resume);
    }

    /**
     * Stop timer (wrapper for external access)
     */
    stopTimer(saveElapsed = true) {
        this.timerManager.stop(saveElapsed);
    }

    resetStats() {
        this.moveCount = 0;
        this.timerManager.reset();
        document.getElementById('moves').textContent = '0';
    }

    onPuzzleComplete() {
        this.timerManager.stop();

        const time = this.timerManager.getCurrentTime();
        const moves = this.moveCount;

        // Track wins and auto upgrade difficulty
        this.winCount++;
        if (this.winCount % GAME_CONFIG.WINS_PER_DIFFICULTY_UPGRADE === 0 &&
            this.currentDifficulty < GAME_CONFIG.MAX_DIFFICULTY) {
            this.currentDifficulty++;
            this.uiManager.updateDifficultyUI(this.currentDifficulty);
        }

        this.uiManager.showCelebration(time, moves);
    }

    /**
     * Cleanup all resources
     */
    destroy() {
        // Stop timer
        this.timerManager.destroy();

        // Stop music
        this.musicManager.destroy();

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
        this.uiManager.cleanupTemporaryElements();
    }
}
