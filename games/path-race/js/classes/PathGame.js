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

        // Game state
        this.state = new GameState();

        // Managers
        this.renderManager = new RenderManager(this.canvasSize, CONFIG);
        this.uiManager = new UIManager();
        this.audioManager = new AudioManager();
        this.levelManager = new LevelManager();
        this.pathManager = new PathManager();
        this.aiManager = new AIManager({
            onProgress: (percent) => this.uiManager.updateAIProgress(percent),
            onStatusChange: (status) => this.uiManager.updateAIStatus(status),
            onImprovement: (pathLength) => this.uiManager.showAIImprovement(pathLength),
            onThinking: (iteration, pathLength) => this.uiManager.updateAIThinking(iteration, pathLength),
            onNeedsRender: () => this.setNeedsRender(),
            onRender: () => this.renderBothCanvases(),
            onFinish: () => this.checkWinner()
        });
        this.inputManager = new InputManager(this);

        // Animation & RAF optimization
        this.lastTime = 0;
        this.animationId = null;
        this.needsRender = true; // Dirty flag for rendering

        this.init();
    }

    /**
     * Initialize game
     */
    init() {
        this.setupCanvases();
        this.inputManager.setupListeners();

        // Always show instructions on first load
        this.showInstructions();

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
            this.renderManager.setCanvasSize(size);
        }

        this.logger.info(`PathGame: Canvas size ${size}x${size}`);
    }


    /**
     * Show instructions
     */
    showInstructions() {
        this.uiManager.showInstructions();
    }

    /**
     * Start game
     */
    startGame() {
        this.uiManager.hideInstructions();
        this.loadLevel(this.state.level);
    }

    /**
     * Load level
     */
    loadLevel(levelNum) {
        this.logger.info(`PathGame: Loading level ${levelNum}`);

        this.state.transition('loading');
        this.state.level = levelNum;
        this.state.reset();

        // Generate grid
        this.state.grid = GridGenerator.generateLevel(levelNum);
        this.pathManager.setGrid(this.state.grid);
        this.renderManager.setGrid(this.state.grid);

        // Reset AI
        if (this.aiManager) {
            this.aiManager.reset();
        }

        // Calculate cell size (kept for backwards compatibility)
        this.cellSize = (this.canvasSize - CONFIG.GRID.GRID_PADDING * 2) / this.state.grid.size;

        // Update UI
        this.uiManager.updateLevel(levelNum);

        // Start background music (only if not already playing)
        if (!this.audioManager.bgMusic.audio) {
            this.audioManager.startBackgroundMusic();
        }

        // Render initial state
        this.renderBothCanvases();

        // Start countdown
        this.startCountdown();
    }

    /**
     * Start countdown
     */
    startCountdown() {
        this.state.transition('countdown');

        this.uiManager.startCountdown(3, {
            onTick: () => this.audioManager.playSound('countdown'),
            onGo: () => this.audioManager.playSound('go'),
            onComplete: () => this.startRace()
        });
    }

    /**
     * Start race
     */
    startRace() {
        this.logger.info('PathGame: Race started');
        this.state.transition('racing');
        this.state.player.startTime = Date.now();

        // Announce to screen readers
        this.uiManager.announce(`Level ${this.state.level} started. Race against the AI!`, 'assertive');

        // Start AI
        this.aiManager.start(this.state.grid, this.state.level);

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
            if (this.state.state === 'racing' || this.state.state === 'finished') {
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
        if (!this.state.isRacing()) return;

        // Update player time (triggers render on second change)
        if (this.state.player.startTime && !this.state.player.finishTime) {
            const elapsed = Math.floor((Date.now() - this.state.player.startTime) / 1000);
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

        if (!this.state.grid) return;

        // Draw grid lines
        this.renderManager.drawGridLines(ctx);

        // Draw connections
        this.renderManager.drawConnections(ctx);

        // Draw pheromones (AI side only)
        if (side === 'ai' && this.aiManager.antColony) {
            const pheromones = this.aiManager.getPheromones();
            const getEdgeKey = (from, to) => this.aiManager.getEdgeKey(from, to);
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
        this.state.finishPlayer();
        this.audioManager.playSound('path_complete');
        this.checkWinner();
    }

    /**
     * Check winner
     */
    checkWinner() {
        // Prevent multiple calls after race ended
        if (this.state.state === 'finished') {
            this.logger.info('PathGame: checkWinner called but game already finished');
            return;
        }

        const playerDone = this.state.player.finishTime !== null;
        const aiDone = this.aiManager.isFinished();

        this.logger.info(`PathGame: checkWinner - playerDone: ${playerDone}, aiDone: ${aiDone}`);

        // Must have at least one finished
        if (!playerDone && !aiDone) return;

        // Both finished - compare times
        if (playerDone && aiDone) {
            const playerTime = this.state.player.finishTime - this.state.player.startTime;
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
        this.state.transition('finished');
        this.logger.info(`PathGame: Race ended, winner: ${winner}`);

        // Stop game loop
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        // Stop AI opponent
        if (this.aiManager) {
            this.aiManager.stop();
        }

        // Calculate stars
        let stars = 1;
        if (winner === 'player') {
            const playerTime = this.state.player.finishTime - this.state.player.startTime;
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
        this.levelManager.setLevelStars(this.state.level, stars);
        if (stars >= 1) {
            this.levelManager.unlockLevel(this.state.level + 1);
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
        const playerTime = this.state.player.finishTime ?
            Math.floor((this.state.player.finishTime - this.state.player.startTime) / 1000) : null;

        this.uiManager.showResultModal({
            winner,
            stars,
            playerTime,
            moves: this.pathManager.getPathLength(),
            undoCount: this.state.player.undoCount
        });
    }

    /**
     * Hide result modal
     */
    hideResultModal() {
        this.uiManager.hideResultModal();
    }

    /**
     * Restart level
     */
    restartLevel() {
        this.logger.info('PathGame: Restarting level');
        this.loadLevel(this.state.level);
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
        this.state.level++;
        this.loadLevel(this.state.level);
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
