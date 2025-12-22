/**
 * PathGame - Main Game Class
 * Complete game orchestration with dual canvas rendering
 */

class PathGame {
    constructor(playerCanvasId, aiCanvasId) {
        this.logger = window.Logger;
        this.logger.info('PathGame: Initializing...');

        // Canvas setup
        this.playerCanvas = document.getElementById(playerCanvasId);
        this.aiCanvas = document.getElementById(aiCanvasId);
        this.playerCtx = this.playerCanvas.getContext('2d');
        this.aiCtx = this.aiCanvas.getContext('2d');

        // Canvas sizing (must be before managers)
        this.canvasSize = 500;
        this.cellSize = 0;
        this.dotRadius = CONFIG.GRID.DOT_RADIUS;

        // Managers
        this.renderManager = new RenderManager(this.canvasSize, CONFIG);
        this.uiManager = new UIManager(this);
        this.audioManager = new AudioManager();
        this.levelManager = new LevelManager();
        this.pathManager = new PathManager();
        this.aiManager = new AIManager(this);
        this.inputManager = new InputManager(this);

        // Game state
        this.gameState = 'menu';
        this.currentLevel = 1;
        this.grid = null;
        this.undoCount = 0;
        this.playerStartTime = null;
        this.playerFinishTime = null;

        // Animation & RAF optimization
        this.lastTime = 0;
        this.animationId = null;
        this.countdownValue = 3;
        this.needsRender = true; // Dirty flag for rendering

        this.init();
    }

    /**
     * Initialize game
     */
    init() {
        this.setupCanvases();
        this.inputManager.setupListeners();

        if (!localStorage.getItem(CONFIG.STORAGE.TUTORIAL_COMPLETED)) {
            this.showInstructions();
        } else {
            this.loadLevel(1);
        }

        this.logger.info('PathGame: Initialized');
    }

    /**
     * Setup canvases
     */
    setupCanvases() {
        const size = Math.min(500, window.innerWidth * 0.4);
        this.canvasSize = size;

        this.playerCanvas.width = size;
        this.playerCanvas.height = size;
        this.aiCanvas.width = size;
        this.aiCanvas.height = size;

        this.playerCanvas.style.width = size + 'px';
        this.playerCanvas.style.height = size + 'px';
        this.aiCanvas.style.width = size + 'px';
        this.aiCanvas.style.height = size + 'px';

        // Update RenderManager with new canvas size
        if (this.renderManager) {
            this.renderManager.canvasSize = size;
        }

        this.logger.info(`PathGame: Canvas size ${size}x${size}`);
    }


    /**
     * Show instructions
     */
    showInstructions() {
        document.getElementById('instructions-overlay').classList.remove('hidden');
    }

    /**
     * Start game
     */
    startGame() {
        localStorage.setItem(CONFIG.STORAGE.TUTORIAL_COMPLETED, 'true');
        document.getElementById('instructions-overlay').classList.add('hidden');
        this.loadLevel(this.currentLevel);
    }

    /**
     * Load level
     */
    loadLevel(levelNum) {
        this.logger.info(`PathGame: Loading level ${levelNum}`);
        this.currentLevel = levelNum;
        this.gameState = 'loading';

        // Reset game state
        this.playerStartTime = null;
        this.playerFinishTime = null;
        this.undoCount = 0;

        // Generate grid
        this.grid = GridGenerator.generateLevel(levelNum);
        this.pathManager.setGrid(this.grid);
        this.renderManager.setGrid(this.grid);

        // Reset AI
        if (this.aiManager) {
            this.aiManager.reset();
        }

        // Calculate cell size (kept for backwards compatibility)
        this.cellSize = (this.canvasSize - CONFIG.GRID.GRID_PADDING * 2) / this.grid.size;

        // Update UI
        this.uiManager.updateLevel(levelNum);

        // Render initial state
        this.renderBothCanvases();

        // Start countdown
        this.startCountdown();
    }

    /**
     * Start countdown
     */
    startCountdown() {
        this.gameState = 'countdown';
        this.countdownValue = 3;

        const overlay = document.getElementById('countdown-overlay');
        const text = overlay.querySelector('.countdown-text');

        overlay.classList.remove('hidden');

        const countdown = () => {
            if (this.countdownValue > 0) {
                text.textContent = this.countdownValue;
                this.audioManager.playSound('countdown');
                this.countdownValue--;
                setTimeout(countdown, 1000);
            } else {
                text.textContent = 'GO!';
                this.audioManager.playSound('go');
                setTimeout(() => {
                    overlay.classList.add('hidden');
                    this.startRace();
                }, 500);
            }
        };

        countdown();
    }

    /**
     * Start race
     */
    startRace() {
        this.logger.info('PathGame: Race started');
        this.gameState = 'racing';
        this.playerStartTime = Date.now();
        this.undoCount = 0;

        // Announce to screen readers
        this.uiManager.announce(`Level ${this.currentLevel} started. Race against the AI!`, 'assertive');

        // Start AI
        this.aiManager.start(this.grid, this.currentLevel);

        // Start game loop
        this.startGameLoop();

        // Update UI
        this.uiManager.updatePlayerMoves(0);
        this.uiManager.updatePlayerTime(0);
    }

    /**
     * Start game loop with RAF optimization
     */
    startGameLoop() {
        const loop = (timestamp) => {
            if (this.gameState === 'racing' || this.gameState === 'finished') {
                const deltaTime = timestamp - this.lastTime;
                this.lastTime = timestamp;

                this.update(deltaTime);

                // Only render if something changed (dirty flag pattern)
                if (this.needsRender) {
                    this.renderBothCanvases();
                    this.needsRender = false;
                }
            }

            this.animationId = requestAnimationFrame(loop);
        };

        this.animationId = requestAnimationFrame(loop);
    }

    /**
     * Mark that rendering is needed (dirty flag)
     */
    setNeedsRender() {
        this.needsRender = true;
    }

    /**
     * Update game state
     */
    update(deltaTime) {
        if (this.gameState !== 'racing') return;

        // Update player time (triggers render on second change)
        if (this.playerStartTime && !this.playerFinishTime) {
            const elapsed = Math.floor((Date.now() - this.playerStartTime) / 1000);
            const previousTime = this.uiManager.currentTime || 0;
            this.uiManager.updatePlayerTime(elapsed);

            // Mark render needed if time changed (once per second)
            if (elapsed !== previousTime) {
                this.needsRender = true;
            }
        }

        // Update player moves (UI only, no render trigger)
        this.uiManager.updatePlayerMoves(this.pathManager.getPathLength());
    }

    /**
     * Render both canvases
     */
    renderBothCanvases() {
        this.renderCanvas(this.aiCtx, 'ai');
        this.renderCanvas(this.playerCtx, 'player');
    }

    /**
     * Render canvas
     */
    renderCanvas(ctx, side) {
        // Clear
        this.renderManager.clearCanvas(ctx);

        if (!this.grid) return;

        // Draw grid lines
        this.renderManager.drawGridLines(ctx);

        // Draw connections
        this.renderManager.drawConnections(ctx);

        // Draw pheromones (AI side only)
        if (side === 'ai' && this.aiManager.antColony) {
            const pheromones = this.aiManager.getPheromones();
            const getEdgeKey = (from, to) => this.aiManager.antColony.getEdgeKey(from, to);
            this.renderManager.drawPheromones(ctx, pheromones, getEdgeKey);
        }

        // Draw path
        if (side === 'player') {
            this.renderManager.drawPath(ctx, this.pathManager.getPath(), CONFIG.COLORS.PLAYER_PATH);
        } else {
            this.renderManager.drawPath(ctx, this.aiManager.getPath(), CONFIG.COLORS.AI_PATH);
        }

        // Draw dots
        this.renderManager.drawDots(ctx, side);
    }



    /**
     * Player finish
     */
    playerFinish() {
        this.playerFinishTime = Date.now();
        this.logger.info('PathGame: Player finished');
        this.audioManager.playSound('path_complete');
        this.checkWinner();
    }

    /**
     * Check winner
     */
    checkWinner() {
        // Prevent multiple calls after race ended
        if (this.gameState === 'finished') {
            this.logger.info('PathGame: checkWinner called but game already finished');
            return;
        }

        const playerDone = this.playerFinishTime !== null;
        const aiDone = this.aiManager.isFinished();

        this.logger.info(`PathGame: checkWinner - playerDone: ${playerDone}, aiDone: ${aiDone}`);

        // Must have at least one finished
        if (!playerDone && !aiDone) return;

        // Both finished - compare times
        if (playerDone && aiDone) {
            const playerTime = this.playerFinishTime - this.playerStartTime;
            const aiTime = this.aiManager.getTime();

            this.logger.info(`PathGame: Both finished - playerTime: ${playerTime}ms, aiTime: ${aiTime}ms`);

            if (playerTime < aiTime) {
                this.endRace('player');
            } else if (aiTime < playerTime) {
                this.endRace('ai');
            } else {
                this.endRace('tie');
            }
            return; // CRITICAL: Prevent fall-through
        }

        // Only one finished - winner is the one who finished first
        if (playerDone) {
            this.logger.info('PathGame: Only player finished - player wins');
            this.endRace('player');
        } else if (aiDone) {
            this.logger.info('PathGame: Only AI finished - AI wins');
            this.endRace('ai');
        }
    }

    /**
     * End race
     */
    endRace(winner) {
        this.gameState = 'finished';
        this.logger.info(`PathGame: Race ended, winner: ${winner}`);

        // Stop game loop
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        // Calculate stars
        let stars = 1;
        if (winner === 'player') {
            const playerTime = this.playerFinishTime - this.playerStartTime;
            const aiTime = this.aiManager.getTime();

            if (playerTime < aiTime * 0.8) {
                stars = 3;
            } else if (playerTime < aiTime) {
                stars = 2;
            }

            this.audioManager.playSound('win');
        } else {
            this.audioManager.playSound('lose');
        }

        // Save progress
        this.levelManager.setLevelStars(this.currentLevel, stars);
        if (stars >= 1) {
            this.levelManager.unlockLevel(this.currentLevel + 1);
        }

        // Show result modal
        setTimeout(() => {
            this.showResultModal(winner, stars);
        }, 1000);
    }

    /**
     * Show result modal
     */
    showResultModal(winner, stars) {
        const modal = document.getElementById('result-modal');
        const title = document.getElementById('result-title');
        const starsEl = document.getElementById('result-stars');
        const timeEl = document.getElementById('result-time');
        const movesEl = document.getElementById('result-moves');
        const undosEl = document.getElementById('result-undos');

        let announcement = '';
        if (winner === 'player') {
            title.textContent = I18N.t('you_win');
            starsEl.textContent = '⭐'.repeat(stars);
            announcement = `Congratulations! You won with ${stars} star${stars > 1 ? 's' : ''}!`;
        } else if (winner === 'ai') {
            title.textContent = I18N.t('ai_wins');
            starsEl.textContent = '⭐';
            announcement = 'The AI won this round. Try again!';
        } else {
            title.textContent = 'Tie! 🤝';
            starsEl.textContent = '⭐⭐';
            announcement = 'It\'s a tie! Well played!';
        }

        const playerTime = this.playerFinishTime ?
            Math.floor((this.playerFinishTime - this.playerStartTime) / 1000) : '-';
        timeEl.textContent = playerTime + 's';
        movesEl.textContent = this.pathManager.getPathLength();
        undosEl.textContent = this.undoCount;

        // Announce result
        this.uiManager.announce(announcement, 'assertive');

        modal.classList.remove('hidden');
        modal.setAttribute('aria-hidden', 'false');
    }

    /**
     * Hide result modal
     */
    hideResultModal() {
        document.getElementById('result-modal').classList.add('hidden');
    }

    /**
     * Restart level
     */
    restartLevel() {
        this.logger.info('PathGame: Restarting level');
        this.loadLevel(this.currentLevel);
    }

    /**
     * Retry level
     */
    retryLevel() {
        this.hideResultModal();
        this.restartLevel();
    }

    /**
     * Next level
     */
    nextLevel() {
        this.hideResultModal();
        this.currentLevel++;
        this.loadLevel(this.currentLevel);
    }

    /**
     * Go home
     */
    goHome() {
        this.logger.info('PathGame: Going home');
        window.location.href = '../../index.html';
    }


    /**
     * Render AI (called by AIManager)
     */
    renderAI() {
        this.renderCanvas(this.aiCtx, 'ai');
    }

    /**
     * Destroy and cleanup
     */
    destroy() {
        this.logger.info('PathGame: Cleaning up');

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        if (this.renderManager) this.renderManager.destroy();
        if (this.uiManager) this.uiManager.destroy();
        if (this.audioManager) this.audioManager.destroy();
        if (this.levelManager) this.levelManager.destroy();
        if (this.pathManager) this.pathManager.destroy();
        if (this.aiManager) this.aiManager.destroy();
        if (this.inputManager) this.inputManager.destroy();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PathGame;
}
