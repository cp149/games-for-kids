/**
 * MatchThreeGame - Main game controller
 * Coordinates board, UI, music, and score managers
 * Keeps class under 300 lines by delegating to managers
 *
 * Supports dependency injection for testability:
 * - doc: Document object (default: window.document)
 * - config: Configuration object (default: CONFIG)
 * - timeController: Time controller for async operations
 * - BoardClass, UIManagerClass, etc.: Manager constructors
 * - autoInit: Whether to auto-initialize (default: true)
 */

class MatchThreeGame {
    /**
     * @param {string} containerId - ID of container element
     * @param {Object} [options] - Optional dependencies for testing
     * @param {Document} [options.doc] - Document object
     * @param {Object} [options.config] - Configuration object
     * @param {Object} [options.timeController] - Time controller
     * @param {Function} [options.BoardClass] - Board constructor
     * @param {Function} [options.UIManagerClass] - UIManager constructor
     * @param {Function} [options.MusicManagerClass] - MusicManager constructor
     * @param {Function} [options.ScoreManagerClass] - ScoreManager constructor
     * @param {boolean} [options.autoInit] - Auto-initialize game (default: true)
     */
    constructor(containerId, options = {}) {
        // Dependency injection with defaults
        this._doc = options.doc || (typeof document !== 'undefined' ? document : null);
        this._config = options.config || CONFIG;
        this._timeController = options.timeController || null;

        // Injectable classes
        const BoardClass = options.BoardClass || Board;
        const UIManagerClass = options.UIManagerClass || UIManager;
        const MusicManagerClass = options.MusicManagerClass || MusicManager;
        const ScoreManagerClass = options.ScoreManagerClass || ScoreManager;

        // Store classes for later use
        this._BoardClass = BoardClass;

        this.container = this._doc.getElementById(containerId);

        // Initialize managers
        this.uiManager = new UIManagerClass(this.container, { doc: this._doc, config: this._config });
        this.musicManager = new MusicManagerClass({ config: this._config });
        this.scoreManager = new ScoreManagerClass({ config: this._config });

        // Game components
        this.board = null;

        // Track event handlers for cleanup
        this.handlers = new Map();

        // Auto-initialize unless disabled (for testing)
        if (options.autoInit !== false) {
            this.init();
        }
    }

    /**
     * Initialize game
     */
    init() {
        this.uiManager.createUI();
        this.setupEventListeners();
        this.startNewGame();
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        this.setupUIListeners();
        this.setupSettingsListeners();
        this.addHandler(window, 'resize', this.handleResize.bind(this));

        // Start music on first user interaction (browser autoplay policy)
        this.startMusicOnce = () => {
            this.musicManager.startMusic();
            this._doc.removeEventListener('click', this.startMusicOnce);
            this._doc.removeEventListener('touchstart', this.startMusicOnce);
            this.startMusicOnce = null;
        };
        this._doc.addEventListener('click', this.startMusicOnce);
        this._doc.addEventListener('touchstart', this.startMusicOnce);
    }

    /**
     * Setup UI button listeners
     */
    setupUIListeners() {
        this.addHandler(this.uiManager.getElement('musicToggle'), 'click', this.handleMusicToggle.bind(this));
        this.addHandler(this.uiManager.getElement('settingsBtn'), 'click', () => this.uiManager.showSettings());
        this.addHandler(this.uiManager.getElement('newGameBtn'), 'click', this.handleNewGame.bind(this));
        this.addHandler(this.uiManager.getElement('shuffleBtn'), 'click', this.handleShuffle.bind(this));

        const nextLevelBtn = this._doc.getElementById('next-level-btn');
        if (nextLevelBtn) this.addHandler(nextLevelBtn, 'click', this.handleNextLevel.bind(this));

        const closeSettingsBtn = this._doc.getElementById('close-settings-btn');
        if (closeSettingsBtn) this.addHandler(closeSettingsBtn, 'click', () => this.uiManager.hideSettings());
    }

    /**
     * Setup settings modal listeners
     */
    setupSettingsListeners() {
        const sfxCheckbox = this._doc.getElementById('sound-effects');
        if (sfxCheckbox) {
            sfxCheckbox.checked = this.musicManager.sfxEnabled;
            this.addHandler(sfxCheckbox, 'change', () => this.musicManager.toggleSFX());
        }

        const difficultySelect = this._doc.getElementById('difficulty-select');
        if (difficultySelect) {
            difficultySelect.value = this.scoreManager.getDifficulty();
            this.addHandler(difficultySelect, 'change', (e) => {
                this.scoreManager.setDifficulty(e.target.value);
                this.uiManager.updateScore(this.scoreManager.getScore(), this.scoreManager.getTarget());
            });
        }
    }

    /**
     * Add event listener with cleanup tracking
     */
    addHandler(element, event, handler) {
        if (element) {
            element.addEventListener(event, handler);
            const key = `${element.id || 'window'}:${event}`;
            this.handlers.set(key, { element, event, handler });
        }
    }

    /**
     * Start new game
     */
    startNewGame() {
        // Clean up old board listeners first
        this.cleanupBoardListeners();

        // Destroy existing board
        if (this.board) {
            this.board.destroy();
            this.board = null;
        }

        // Reset score
        this.scoreManager.reset();

        // Create new board with injected dependencies
        const gameArea = this.uiManager.getElement('gameArea');
        this.board = new this._BoardClass(gameArea, {
            doc: this._doc,
            config: this._config,
            timeController: this._timeController
        });

        // Setup board event listeners
        this.setupBoardListeners();

        // Update UI
        this.uiManager.updateScore(
            this.scoreManager.getScore(),
            this.scoreManager.getTarget()
        );
        this.uiManager.updateLevel(this.scoreManager.getLevel());

        // Start music
        this.musicManager.startMusic();
    }

    /**
     * Setup board-specific event listeners
     */
    setupBoardListeners() {
        const el = this.board.element;

        // Create bound handlers and store them for cleanup
        this.boardHandlers = {
            gemsMatched: (e) => this.onGemsMatched(e),
            cascade: (e) => this.onCascade(e),
            validSwap: () => this.onValidSwap(),
            invalidSwap: () => this.onInvalidSwap(),
            shuffled: () => this.uiManager.showToast('Board shuffled!', 'info')
        };

        // Add listeners
        Object.entries(this.boardHandlers).forEach(([event, handler]) => {
            el.addEventListener(event, handler);
        });
    }

    /**
     * Clean up board event listeners
     */
    cleanupBoardListeners() {
        if (this.board && this.board.element && this.boardHandlers) {
            Object.entries(this.boardHandlers).forEach(([event, handler]) => {
                this.board.element.removeEventListener(event, handler);
            });
        }
        this.boardHandlers = null;
    }

    onGemsMatched(e) {
        const points = this.scoreManager.addMatchScore(e.detail.count, false);
        this.updateScoreDisplay();
        this.musicManager.playSFX('MATCH');

        // Show floating score and star burst at match location
        if (e.detail.matches && e.detail.matches.length > 0) {
            const firstGem = e.detail.matches[0];
            const cellSize = firstGem.getCellSize();
            const padding = this._config.BOARD.GEM_PADDING / 2;
            const x = firstGem.col * cellSize + cellSize / 2 + padding;
            const y = firstGem.row * cellSize + padding;

            this.uiManager.showFloatingScore(points, x, y);
            this.uiManager.showStarBurst(x, y + cellSize / 2, Math.min(e.detail.count, 8));
        }

        this.checkLevelComplete();
    }

    onCascade(e) {
        const points = this.scoreManager.addMatchScore(e.detail.count, true);
        this.updateScoreDisplay();
        this.musicManager.playSFX('CASCADE');

        // Show combo display
        const comboCount = this.scoreManager.getCombo();
        if (comboCount > 1) {
            this.uiManager.showCombo(comboCount);
        }

        this.checkLevelComplete();
    }

    onValidSwap() {
        this.musicManager.playSFX('SWAP');
        this.scoreManager.resetCombo();
    }

    onInvalidSwap() {
        this.musicManager.playSFX('INVALID');
        this.uiManager.showToast('Invalid move!', 'warning');
    }

    updateScoreDisplay() {
        this.uiManager.updateScore(this.scoreManager.getScore(), this.scoreManager.getTarget());
    }

    checkLevelComplete() {
        if (this.scoreManager.isLevelComplete()) {
            this.handleLevelComplete();
        }
    }

    /**
     * Handle music toggle
     */
    handleMusicToggle() {
        const isPlaying = this.musicManager.toggleMusic();
        this.uiManager.setMusicIcon(isPlaying);
    }

    /**
     * Handle new game button
     */
    handleNewGame() {
        if (confirm('Start a new game? Current progress will be lost.')) {
            this.scoreManager.currentLevel = 1;
            this.startNewGame();
        }
    }

    /**
     * Handle shuffle button
     */
    async handleShuffle() {
        if (this.board && !this.board.isProcessing) {
            await this.board.shuffle();
        }
    }

    /**
     * Handle hint button
     */
    handleHint() {
        if (!this.board || this.board.isProcessing) return;

        // Check if moves are available
        if (!this.board.hasAvailableMoves()) {
            this.uiManager.showToast('No moves available! Shuffling...', 'warning');
            this.handleShuffle();
            return;
        }

        this.uiManager.showToast('Look for matching patterns!', 'info');
    }

    /**
     * Handle level complete
     */
    handleLevelComplete() {
        setTimeout(() => {
            this.musicManager.playSFX('VICTORY');

            const stats = this.scoreManager.getStats();
            this.uiManager.showVictory(stats.score, stats.stars);
        }, this._config.GAME.TIMING.VICTORY_DELAY);
    }

    /**
     * Handle next level button
     */
    handleNextLevel() {
        this.uiManager.hideVictory();
        this.scoreManager.nextLevel();
        this.startNewGame();
    }

    /**
     * Restart game with current settings
     */
    restartGame() {
        this.startNewGame();
    }

    /**
     * Handle window resize
     */
    handleResize() {
        if (this.board) {
            this.board.resize();
        }
    }

    /**
     * Clean up resources
     */
    destroy() {
        // Clean up one-time music listeners (if not yet triggered)
        if (this.startMusicOnce && this._doc) {
            this._doc.removeEventListener('click', this.startMusicOnce);
            this._doc.removeEventListener('touchstart', this.startMusicOnce);
            this.startMusicOnce = null;
        }

        // Clean up board listeners
        this.cleanupBoardListeners();

        // Remove all tracked event listeners
        this.handlers.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.handlers.clear();

        // Destroy components
        if (this.board) {
            this.board.destroy();
            this.board = null;
        }

        if (this.uiManager) {
            this.uiManager.destroy();
            this.uiManager = null;
        }

        if (this.musicManager) {
            this.musicManager.destroy();
            this.musicManager = null;
        }

        if (this.scoreManager) {
            this.scoreManager.destroy();
            this.scoreManager = null;
        }

        this.container = null;
        this._doc = null;
        this._config = null;
        this._timeController = null;
    }

    // ==================== Test Hooks ====================

    /**
     * Get game state snapshot (for testing)
     * @returns {Object}
     */
    _getSnapshot() {
        return {
            board: this.board ? this.board._getSnapshot() : null,
            score: this.scoreManager ? this.scoreManager.getScore() : 0,
            level: this.scoreManager ? this.scoreManager.getLevel() : 1,
            isProcessing: this.board ? this.board.isProcessing : false
        };
    }

    /**
     * Directly set board state (for testing)
     * @param {Array<Array<number|null>>} typeGrid
     */
    _setBoardState(typeGrid) {
        if (this.board) {
            this.board._setGridTypes(typeGrid);
        }
    }
}
