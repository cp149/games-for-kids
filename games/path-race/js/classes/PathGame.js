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

        // Managers
        this.uiManager = new UIManager(this);
        this.audioManager = new AudioManager();
        this.levelManager = new LevelManager();
        this.pathManager = new PathManager();
        this.aiManager = new AIManager(this);

        // Game state
        this.gameState = 'menu';
        this.currentLevel = 1;
        this.grid = null;
        this.undoCount = 0;
        this.playerStartTime = null;
        this.playerFinishTime = null;

        // Animation
        this.lastTime = 0;
        this.animationId = null;
        this.countdownValue = 3;

        // Canvas sizing
        this.canvasSize = 500;
        this.cellSize = 0;
        this.dotRadius = CONFIG.GRID.DOT_RADIUS;

        // Event listeners
        this.eventListeners = new Map();

        this.init();
    }

    /**
     * Initialize game
     */
    init() {
        this.setupCanvases();
        this.setupEventListeners();

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

        this.logger.info(`PathGame: Canvas size ${size}x${size}`);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        this.addListener('#start-game-btn', 'click', () => this.startGame());
        this.addListener('#home-btn', 'click', () => this.goHome());
        this.addListener('#restart-btn', 'click', () => this.restartLevel());
        this.addListener('#undo-btn', 'click', () => this.handleUndo());
        this.addListener('#music-btn', 'click', () => this.audioManager.toggleMusic());
        this.addListener('#lang-btn', 'click', () => I18N.cycleLanguage());
        this.addListener('#retry-btn', 'click', () => this.retryLevel());
        this.addListener('#next-level-btn', 'click', () => this.nextLevel());
        this.addListener('#player-canvas', 'click', (e) => this.handlePlayerClick(e));
        this.addListener(document, 'keydown', (e) => this.handleKeyboard(e));
    }

    /**
     * Add event listener and track for cleanup
     */
    addListener(target, event, handler) {
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        if (element) {
            element.addEventListener(event, handler);
            if (!this.eventListeners.has(element)) {
                this.eventListeners.set(element, []);
            }
            this.eventListeners.get(element).push({ event, handler });
        }
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

        // Reset AI
        if (this.aiManager) {
            this.aiManager.reset();
        }

        // Calculate cell size
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

        // Start AI
        this.aiManager.start(this.grid, this.currentLevel);

        // Start game loop
        this.startGameLoop();

        // Update UI
        this.uiManager.updatePlayerMoves(0);
        this.uiManager.updatePlayerTime(0);
    }

    /**
     * Start game loop
     */
    startGameLoop() {
        const loop = (timestamp) => {
            if (this.gameState === 'racing' || this.gameState === 'finished') {
                const deltaTime = timestamp - this.lastTime;
                this.lastTime = timestamp;

                this.update(deltaTime);
                this.renderBothCanvases();
            }

            this.animationId = requestAnimationFrame(loop);
        };

        this.animationId = requestAnimationFrame(loop);
    }

    /**
     * Update game state
     */
    update(deltaTime) {
        if (this.gameState !== 'racing') return;

        // Update player time
        if (this.playerStartTime && !this.playerFinishTime) {
            const elapsed = Math.floor((Date.now() - this.playerStartTime) / 1000);
            this.uiManager.updatePlayerTime(elapsed);
        }

        // Update player moves
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
        ctx.fillStyle = CONFIG.COLORS.CANVAS_BG;
        ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);

        if (!this.grid) return;

        // Draw grid lines
        this.drawGridLines(ctx);

        // Draw connections
        this.drawConnections(ctx);

        // Draw pheromones (AI side only)
        if (side === 'ai' && this.aiManager.antColony) {
            this.drawPheromones(ctx);
        }

        // Draw path
        if (side === 'player') {
            this.drawPath(ctx, this.pathManager.getPath(), CONFIG.COLORS.PLAYER_PATH);
        } else {
            this.drawPath(ctx, this.aiManager.getPath(), CONFIG.COLORS.AI_PATH);
        }

        // Draw dots
        this.drawDots(ctx, side);
    }

    /**
     * Draw grid lines
     */
    drawGridLines(ctx) {
        ctx.strokeStyle = CONFIG.COLORS.GRID_LINE;
        ctx.lineWidth = 1;

        const padding = CONFIG.GRID.GRID_PADDING;
        const gridSize = this.grid.size * this.cellSize;

        for (let i = 0; i <= this.grid.size; i++) {
            // Vertical lines
            ctx.beginPath();
            ctx.moveTo(padding + i * this.cellSize, padding);
            ctx.lineTo(padding + i * this.cellSize, padding + gridSize);
            ctx.stroke();

            // Horizontal lines
            ctx.beginPath();
            ctx.moveTo(padding, padding + i * this.cellSize);
            ctx.lineTo(padding + gridSize, padding + i * this.cellSize);
            ctx.stroke();
        }
    }

    /**
     * Draw connections (possible edges)
     */
    drawConnections(ctx) {
        ctx.strokeStyle = CONFIG.COLORS.GRID_LINE;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);

        this.grid.edges.forEach(edge => {
            const from = this.getDotScreenPos(edge.from);
            const to = this.getDotScreenPos(edge.to);

            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();
        });

        ctx.setLineDash([]);
    }

    /**
     * Draw pheromones (AI visualization)
     */
    drawPheromones(ctx) {
        const pheromones = this.aiManager.getPheromones();
        if (!pheromones) return;

        ctx.lineWidth = 4;

        this.grid.edges.forEach(edge => {
            const key = this.aiManager.antColony.getEdgeKey(edge.from, edge.to);
            const level = pheromones.get(key) || 0;

            // Map pheromone level to alpha
            const alpha = MathUtils.clamp(level * 0.1, 0.1, 0.6);

            ctx.strokeStyle = `rgba(255, 152, 0, ${alpha})`;

            const from = this.getDotScreenPos(edge.from);
            const to = this.getDotScreenPos(edge.to);

            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();
        });
    }

    /**
     * Draw path
     */
    drawPath(ctx, path, color) {
        if (path.length < 2) return;

        ctx.strokeStyle = color;
        ctx.lineWidth = CONFIG.GRID.LINE_WIDTH;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        const start = this.getDotScreenPos(path[0]);
        ctx.moveTo(start.x, start.y);

        for (let i = 1; i < path.length; i++) {
            const pos = this.getDotScreenPos(path[i]);
            ctx.lineTo(pos.x, pos.y);
        }

        ctx.stroke();
    }

    /**
     * Draw dots
     */
    drawDots(ctx, side) {
        this.grid.dots.forEach(dot => {
            const pos = this.getDotScreenPos(dot);
            let radius = this.dotRadius;
            let fillColor = CONFIG.COLORS.NORMAL_DOT;
            let strokeColor = CONFIG.COLORS.NORMAL_DOT_BORDER;

            // Determine color based on type and state
            if (dot.type === CONFIG.DOT_TYPES.START) {
                fillColor = CONFIG.COLORS.START_DOT;
                strokeColor = CONFIG.COLORS.START_DOT;
                radius = this.dotRadius * 1.3;
            } else if (dot.type === CONFIG.DOT_TYPES.END) {
                fillColor = CONFIG.COLORS.END_DOT;
                strokeColor = CONFIG.COLORS.END_DOT;
                radius = this.dotRadius * 1.3;
            } else if (side === 'player' && dot.playerVisited) {
                fillColor = CONFIG.COLORS.VISITED_DOT;
                strokeColor = CONFIG.COLORS.VISITED_DOT;
            } else if (side === 'ai' && dot.aiVisited) {
                fillColor = CONFIG.COLORS.AI_VISITED_DOT;
                strokeColor = CONFIG.COLORS.AI_VISITED_DOT;
            }

            // Draw dot
            ctx.fillStyle = fillColor;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 3;

            ctx.beginPath();
            ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });
    }

    /**
     * Get dot screen position
     */
    getDotScreenPos(dot) {
        const padding = CONFIG.GRID.GRID_PADDING;
        return {
            x: padding + (dot.gridX + 0.5) * this.cellSize,
            y: padding + (dot.gridY + 0.5) * this.cellSize
        };
    }

    /**
     * Handle player click
     */
    handlePlayerClick(event) {
        if (this.gameState !== 'racing') {
            this.logger.warn(`PathGame: Click ignored - state is ${this.gameState}`);
            return;
        }

        const rect = this.playerCanvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        this.logger.info(`PathGame: Click at (${x.toFixed(0)}, ${y.toFixed(0)})`);

        const dot = this.getClickedDot(x, y);

        if (dot) {
            this.logger.info(`PathGame: Clicked dot at (${dot.gridX}, ${dot.gridY}) type=${dot.type}`);
            const success = this.pathManager.addMove(dot);

            if (success) {
                this.audioManager.playSound('click_valid');
                this.renderBothCanvases();

                // Check if complete
                if (this.pathManager.isPathComplete()) {
                    this.playerFinish();
                }
            } else {
                this.logger.warn('PathGame: Move rejected by PathManager');
                this.audioManager.playSound('click_invalid');
                // Flash error animation
                this.playerCanvas.classList.add('flash-error');
                setTimeout(() => this.playerCanvas.classList.remove('flash-error'), 500);
            }
        } else {
            this.logger.info('PathGame: No dot found at click position');
        }
    }

    /**
     * Get clicked dot
     */
    getClickedDot(x, y) {
        const clickRadius = CONFIG.PLAYER.CLICK_RADIUS;

        for (const dot of this.grid.dots) {
            const pos = this.getDotScreenPos(dot);
            const dist = MathUtils.distance({ x, y }, pos);

            if (dist <= clickRadius) {
                return dot;
            }
        }

        return null;
    }

    /**
     * Handle undo
     */
    handleUndo() {
        if (this.gameState !== 'racing') return;

        const undone = this.pathManager.undo();
        if (undone) {
            this.undoCount++;
            this.audioManager.playSound('undo');
            this.renderBothCanvases();
        }
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

        if (winner === 'player') {
            title.textContent = I18N.t('you_win');
            starsEl.textContent = '⭐'.repeat(stars);
        } else if (winner === 'ai') {
            title.textContent = I18N.t('ai_wins');
            starsEl.textContent = '⭐';
        } else {
            title.textContent = 'Tie! 🤝';
            starsEl.textContent = '⭐⭐';
        }

        const playerTime = this.playerFinishTime ?
            Math.floor((this.playerFinishTime - this.playerStartTime) / 1000) : '-';
        timeEl.textContent = playerTime + 's';
        movesEl.textContent = this.pathManager.getPathLength();
        undosEl.textContent = this.undoCount;

        modal.classList.remove('hidden');
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
     * Handle keyboard
     */
    handleKeyboard(event) {
        switch(event.key) {
            case 'Escape':
                this.goHome();
                break;
            case 'r':
            case 'R':
                this.restartLevel();
                break;
            case 'u':
            case 'U':
                this.handleUndo();
                break;
        }
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

        this.eventListeners.forEach((listeners, element) => {
            listeners.forEach(({ event, handler }) => {
                element.removeEventListener(event, handler);
            });
        });
        this.eventListeners.clear();

        if (this.uiManager) this.uiManager.destroy();
        if (this.audioManager) this.audioManager.destroy();
        if (this.levelManager) this.levelManager.destroy();
        if (this.pathManager) this.pathManager.destroy();
        if (this.aiManager) this.aiManager.destroy();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PathGame;
}
