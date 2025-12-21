/**
 * Snake Game - Main game controller
 * Coordinates all managers and game loop
 */

class SnakeGame {
    constructor(canvasId) {
        // Canvas setup
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.container = this.canvas.parentElement;

        // Logger instance
        this.logger = window.Logger || console;

        // Game state
        this.state = 'menu'; // menu, playing, paused, gameover
        this.score = 0;
        this.lastTime = 0;
        this.eventListeners = new Map();
        this.perfMonitor = null; // Will be set externally

        // AI respawn queue
        this.aiRespawnQueue = [];

        // Active buffs
        this.scoreMultiplier = 1;
        this.scoreMultiplierTimer = 0;
        this.speedBoostTimer = 0;
        this.originalSpeed = 0;

        // Mouse tracking for continuous following
        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;

        // Initialize
        this.setupCanvas();
        this.createManagers();
        this.setupControls();
        this.showMenu();
    }

    /**
     * Setup canvas size - Full screen
     */
    setupCanvas() {
        const updateSize = () => {
            // Use full window size for canvas
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;

            // Update camera viewport if it exists
            if (this.cameraManager) {
                this.cameraManager.resize(this.canvas.width, this.canvas.height);
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
    }

    /**
     * Create all managers
     */
    createManagers() {
        this.uiManager = new UIManager(this.container);
        this.snakeManager = new SnakeManager();
        this.foodManager = new FoodManager();
        this.cameraManager = new CameraManager(
            this.canvas.width,
            this.canvas.height,
            CONFIG.GAME.CANVAS_SIZE
        );
        this.particleManager = new ParticleManager();
        this.aiController = new AIController();
        this.audioManager = new AudioManager();
        this.leaderboardManager = new LeaderboardManager();
        this.killFeedManager = new KillFeedManager();

        // Track AI spawned count
        this.aiSpawnedCount = 0;
        this.lastMilestoneLength = 0;

        // Create player snake
        this.playerSnake = this.snakeManager.createPlayerSnake();

        // Create initial AI snakes
        this.createAISnakes();

        this.uiManager.init();
        this.foodManager.ensureMinimumFood(this.snakeManager.getAllSegments());
    }

    /**
     * Create AI snakes with different personalities
     */
    createAISnakes() {
        const aiColors = [
            { start: '#ff0066', end: '#ff6699', glow: 'rgba(255, 0, 102, 0.8)' },
            { start: '#00ff88', end: '#00ddaa', glow: 'rgba(0, 255, 136, 0.8)' },
            { start: '#ffaa00', end: '#ffdd44', glow: 'rgba(255, 170, 0, 0.8)' },
            { start: '#aa00ff', end: '#dd44ff', glow: 'rgba(170, 0, 255, 0.8)' },
            { start: '#00aaff', end: '#44ddff', glow: 'rgba(0, 170, 255, 0.8)' }
        ];

        const strategies = [AggressiveStrategy, CautiousStrategy, ExplorerStrategy];
        const count = Math.min(CONFIG.AI.INITIAL_COUNT, CONFIG.AI.MAX_COUNT);

        for (let i = 0; i < count; i++) {
            const margin = 500;
            const x = MathUtils.random(margin, CONFIG.GAME.CANVAS_SIZE - margin);
            const y = MathUtils.random(margin, CONFIG.GAME.CANVAS_SIZE - margin);

            const aiSnake = this.snakeManager.createAISnake({
                x: x,
                y: y,
                angle: Math.random() * Math.PI * 2,
                color: aiColors[i % aiColors.length]
            });

            const StrategyClass = strategies[i % strategies.length];
            this.aiController.registerAI(aiSnake, new StrategyClass());
            this.aiSpawnedCount++;
        }
    }

    /**
     * Setup mouse and touch controls
     */
    setupControls() {
        // Keyboard - only for pause
        const handleKeyboard = (e) => {
            if (this.state === 'menu' && e.code === 'Space') {
                this.start();
            } else if (this.state === 'playing' && e.code === 'Space') {
                this.togglePause();
            } else if (this.state === 'paused' && e.code === 'Space') {
                this.togglePause();
            }
        };

        document.addEventListener('keydown', handleKeyboard);
        this.eventListeners.set('keydown', { element: document, event: 'keydown', handler: handleKeyboard });

        // Touch controls - track touch position
        const handleTouchStart = (e) => {
            if (this.state === 'menu') {
                this.start();
                return;
            }

            // Update mouse position from touch
            const touch = e.touches[0];
            this.mouseX = touch.clientX;
            this.mouseY = touch.clientY;
        };

        const handleTouchMove = (e) => {
            e.preventDefault();

            // Update mouse position from touch
            const touch = e.touches[0];
            this.mouseX = touch.clientX;
            this.mouseY = touch.clientY;
        };

        // Mouse controls - continuous following
        const handleMouseClick = (e) => {
            if (this.state === 'menu') {
                this.start();
                return;
            }
        };

        const handleMouseMove = (e) => {
            // Always track mouse position
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        };

        this.canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        this.canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        this.canvas.addEventListener('click', handleMouseClick);
        this.canvas.addEventListener('mousemove', handleMouseMove);

        // Pause button
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.togglePause());
        }
    }

    /**
     * Show menu
     */
    showMenu() {
        this.state = 'menu';
        this.uiManager.showStartScreen(() => this.start());
    }

    /**
     * Start game
     */
    start() {
        this.logger.info('🎮 Game started');
        this.state = 'playing';
        this.score = 0;

        // Reset buffs
        this.scoreMultiplier = 1;
        this.scoreMultiplierTimer = 0;
        this.speedBoostTimer = 0;
        this.originalSpeed = 0;

        // Reset all snakes
        this.snakeManager.clear();
        this.aiController.aiSnakes.clear();
        this.aiRespawnQueue = [];
        this.aiSpawnedCount = 0;
        this.lastMilestoneLength = 0;

        // Reset managers
        this.leaderboardManager.reset();
        this.killFeedManager.reset();

        // Recreate player snake
        this.playerSnake = this.snakeManager.createPlayerSnake();

        // Recreate AI snakes
        this.createAISnakes();

        this.foodManager.ensureMinimumFood(this.snakeManager.getAllSegments());
        this.particleManager.clear();
        this.uiManager.updateScore(0);
        this.uiManager.updateLength(CONFIG.SNAKE.INITIAL_LENGTH);

        // Start game loop
        this.lastTime = performance.now();
        this.gameLoop();
    }

    /**
     * Toggle pause
     */
    togglePause() {
        if (this.state === 'playing') {
            this.state = 'paused';
            this.uiManager.updatePauseButton(true);
        } else if (this.state === 'paused') {
            this.state = 'playing';
            this.uiManager.updatePauseButton(false);
            this.lastTime = performance.now();
            this.gameLoop();
        }
    }

    /**
     * Game loop
     */
    gameLoop() {
        if (this.state !== 'playing') return;

        // Begin performance measurement
        if (this.perfMonitor) {
            this.perfMonitor.begin();
        }

        const currentTime = performance.now();
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, CONFIG.PERFORMANCE.MAX_DELTA_TIME);
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();

        // End performance measurement
        if (this.perfMonitor) {
            this.perfMonitor.end();
        }

        requestAnimationFrame(() => this.gameLoop());
    }

    /**
     * Update game state
     */
    update(deltaTime) {
        // Warn about performance issues
        if (deltaTime > CONFIG.PERFORMANCE.MAX_DELTA_TIME) {
            this.logger.warn('⚠️ High delta time detected:', deltaTime.toFixed(3), 's');
        }

        // Update player snake target angle to follow mouse
        if (this.playerSnake && this.playerSnake.isAlive) {
            const head = this.playerSnake.getHead();

            // Convert snake head world position to screen position
            const headScreenX = head.x - this.cameraManager.x;
            const headScreenY = head.y - this.cameraManager.y;

            // Calculate angle from snake head to mouse
            const dx = this.mouseX - headScreenX;
            const dy = this.mouseY - headScreenY;
            const targetAngle = Math.atan2(dy, dx);

            // Update player snake's target angle
            this.playerSnake.setTargetAngle(targetAngle);

            // Update camera to follow player snake
            this.cameraManager.follow(head);

            // Spawn particles at tail
            const tail = this.playerSnake.segments[this.playerSnake.segments.length - 1];
            if (tail) {
                this.particleManager.spawn(tail.x, tail.y, CONFIG.SNAKE.GRADIENT_END);
            }
        }

        // Update AI snakes using their strategies
        const gameState = {
            foods: this.foodManager.foods,
            snakes: this.snakeManager.snakes,
            playerSnake: this.playerSnake
        };
        this.aiController.update(this.snakeManager.snakes, gameState);

        // Update all snakes
        this.snakeManager.update(deltaTime);

        // Update particles
        this.particleManager.update(deltaTime);
        this.foodManager.update(deltaTime);

        // Update leaderboard
        this.leaderboardManager.update(this.snakeManager.snakes, this.playerSnake);

        // Update kill feed
        this.killFeedManager.update();

        // Check food collision for all snakes
        for (const snake of this.snakeManager.snakes.values()) {
            if (snake.isAlive) {
                const head = snake.getHead();
                const collectedFood = this.foodManager.checkCollision(head);
                if (collectedFood) {
                    this.handleFoodCollision(snake, collectedFood);
                }
            }
        }

        // Update buff timers
        if (this.scoreMultiplierTimer > 0) {
            this.scoreMultiplierTimer -= deltaTime;
            if (this.scoreMultiplierTimer <= 0) {
                this.scoreMultiplier = 1;
                this.logger.log('💎 Score multiplier expired');
            }
        }

        if (this.speedBoostTimer > 0) {
            this.speedBoostTimer -= deltaTime;
            if (this.speedBoostTimer <= 0 && this.originalSpeed > 0) {
                this.playerSnake.speed = this.originalSpeed;
                this.originalSpeed = 0;
                this.logger.log('⚡ Speed boost expired');
            }
        }

        // Check collisions for all snakes
        for (const snake of this.snakeManager.snakes.values()) {
            if (!snake.isAlive) continue;

            const head = snake.getHead();

            // Check boundary collision
            if (this.checkBoundaryCollision(head)) {
                this.handleSnakeDeath(snake);
                continue;
            }

            // Check collision with other snakes' bodies
            for (const otherSnake of this.snakeManager.snakes.values()) {
                if (!otherSnake.isAlive) continue;
                if (snake.id === otherSnake.id) continue; // Skip self

                // Check if this snake's head hits other snake's body
                if (otherSnake.checkBodyCollision(head.x, head.y, 0)) {
                    this.handleSnakeDeath(snake, otherSnake);
                    break;
                }
            }
        }

        // Process AI respawn queue
        for (let i = this.aiRespawnQueue.length - 1; i >= 0; i--) {
            const respawn = this.aiRespawnQueue[i];
            respawn.framesRemaining--;

            if (respawn.framesRemaining <= 0) {
                // Respawn AI snake
                const margin = 500;
                const x = MathUtils.random(margin, CONFIG.GAME.CANVAS_SIZE - margin);
                const y = MathUtils.random(margin, CONFIG.GAME.CANVAS_SIZE - margin);

                const newSnake = this.snakeManager.createAISnake({
                    x: x,
                    y: y,
                    angle: Math.random() * Math.PI * 2,
                    color: respawn.color
                });

                const strategy = respawn.strategyType === 'aggressive'
                    ? new AggressiveStrategy()
                    : new CautiousStrategy();

                this.aiController.registerAI(newSnake, strategy);

                this.logger.log('🤖 AI snake respawned!');

                // Remove from queue
                this.aiRespawnQueue.splice(i, 1);
            }
        }

        // Check if should spawn new AI based on player progress
        if (this.playerSnake && this.playerSnake.isAlive) {
            const currentLength = this.playerSnake.getLength();

            for (const milestone of CONFIG.AI.SPAWN_ON_MILESTONE) {
                if (currentLength >= milestone && this.lastMilestoneLength < milestone) {
                    this.spawnAdditionalAI();
                    this.lastMilestoneLength = currentLength;
                    break;
                }
            }
        }
    }

    /**
     * Spawn additional AI snake if under max limit
     */
    spawnAdditionalAI() {
        const currentAICount = this.snakeManager.getAISnakes().length + this.aiRespawnQueue.length;

        if (currentAICount >= CONFIG.AI.MAX_COUNT) {
            this.logger.log('⚠️ Max AI count reached, not spawning more');
            return;
        }

        const aiColors = [
            { start: '#ff0066', end: '#ff6699', glow: 'rgba(255, 0, 102, 0.8)' },
            { start: '#00ff88', end: '#00ddaa', glow: 'rgba(0, 255, 136, 0.8)' },
            { start: '#ffaa00', end: '#ffdd44', glow: 'rgba(255, 170, 0, 0.8)' },
            { start: '#aa00ff', end: '#dd44ff', glow: 'rgba(170, 0, 255, 0.8)' },
            { start: '#00aaff', end: '#44ddff', glow: 'rgba(0, 170, 255, 0.8)' }
        ];

        const strategies = [AggressiveStrategy, CautiousStrategy, ExplorerStrategy];

        const margin = 500;
        const x = MathUtils.random(margin, CONFIG.GAME.CANVAS_SIZE - margin);
        const y = MathUtils.random(margin, CONFIG.GAME.CANVAS_SIZE - margin);

        const aiSnake = this.snakeManager.createAISnake({
            x: x,
            y: y,
            angle: Math.random() * Math.PI * 2,
            color: aiColors[this.aiSpawnedCount % aiColors.length]
        });

        const StrategyClass = strategies[this.aiSpawnedCount % strategies.length];
        this.aiController.registerAI(aiSnake, new StrategyClass());
        this.aiSpawnedCount++;

        this.uiManager.showToast('🚨 New AI Challenger!');
        this.audioManager.play('achievement');
        this.logger.info('🤖 New AI spawned! Total AI:', currentAICount + 1);
    }

    /**
     * Handle food collision for any snake (player or AI)
     */
    handleFoodCollision(snake, collectedFood) {
        if (!snake || !collectedFood) return;

        const foodConfig = collectedFood.config;
        const foodType = collectedFood.type;
        const isPlayer = snake.type === 'player';

        // Player-only: Calculate and add score
        if (isPlayer) {
            const baseScore = foodConfig.SCORE;
            const earnedScore = Math.floor(baseScore * this.scoreMultiplier);
            this.score += earnedScore;
        }

        // Handle special food effects
        switch (foodType) {
            case 'SPEED':
                // Speed boost
                if (isPlayer) {
                    if (this.speedBoostTimer <= 0) {
                        this.originalSpeed = snake.speed;
                    }
                    this.uiManager.showToast('⚡ Speed Boost!');
                    this.audioManager.play('speedBoost');
                    this.logger.info('⚡ Speed boost activated!');
                }
                snake.speed = Math.min(
                    snake.speed + foodConfig.SPEED_BOOST,
                    CONFIG.SNAKE.MAX_SPEED
                );
                this.speedBoostTimer = foodConfig.BOOST_DURATION / 1000;
                break;

            case 'BONUS':
                // Score multiplier (player only)
                if (isPlayer) {
                    this.scoreMultiplier = foodConfig.SCORE_MULTIPLIER;
                    this.scoreMultiplierTimer = foodConfig.MULTIPLIER_DURATION / 1000;
                    this.uiManager.showToast('💎 2x Score!');
                    this.audioManager.play('bonus');
                    this.logger.info('💎 Score multiplier activated!');
                }
                break;

            case 'GOLDEN':
                // Grow multiple segments
                for (let i = 0; i < foodConfig.GROW_AMOUNT; i++) {
                    snake.grow();
                }
                if (isPlayer) {
                    this.uiManager.showToast('⭐ Golden Food +3!');
                    this.audioManager.play('golden');
                    this.logger.info('⭐ Golden food! Grew', foodConfig.GROW_AMOUNT, 'segments');
                }
                break;

            default:
                // Normal food - always grow
                snake.grow();
                if (isPlayer) {
                    this.audioManager.play('eat');
                }
                break;
        }

        // Always grow at least once (for non-golden food)
        if (foodType !== 'GOLDEN') {
            snake.grow();
        }

        // Remove collected food and spawn new one
        this.foodManager.removeFood(collectedFood);
        this.foodManager.ensureMinimumFood(this.snakeManager.getAllSegments());

        // Player-only: Update UI and check achievements
        if (isPlayer) {
            this.uiManager.updateScore(this.score);
            this.uiManager.updateLength(snake.getLength());

            const baseScore = foodConfig.SCORE;
            const earnedScore = Math.floor(baseScore * this.scoreMultiplier);
            this.logger.log('🍎', foodType, 'food collected! +', earnedScore, 'points. Total:', this.score);

            // Speed up every N food
            const foodCount = snake.getLength() - CONFIG.SNAKE.INITIAL_LENGTH;
            if (CONFIG.PROGRESSION.FOOD_FOR_SPEED_UP.includes(foodCount)) {
                snake.increaseSpeed();
                this.uiManager.showToast(I18N.t('speed_up'));
                this.logger.info('🚀 Natural speed increase! Current speed:', snake.speed);
            }

            // Achievement milestones
            if (CONFIG.PROGRESSION.LENGTH_MILESTONES.includes(snake.getLength())) {
                this.uiManager.showToast(
                    I18N.t('achievement', { length: snake.getLength() })
                );
                this.audioManager.play('achievement');
                this.logger.info('🏆 Achievement! Length milestone:', snake.getLength());
            }
        } else {
            // AI snake - just log
            this.logger.log('🤖 AI snake collected', foodType, 'food. Length:', snake.getLength());
        }
    }

    /**
     * Render game
     */
    render() {
        // Clear
        this.ctx.fillStyle = CONFIG.GAME.BACKGROUND_COLOR;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw boundary (visible part)
        this.renderBoundary();

        // Render game objects
        this.particleManager.render(this.ctx, this.cameraManager);
        this.snakeManager.render(this.ctx, this.cameraManager);
        this.foodManager.render(this.ctx, this.cameraManager);

        // Render UI overlays (in screen space, not world space)
        this.leaderboardManager.render(this.ctx, this.canvas);
        this.killFeedManager.render(this.ctx);
    }

    /**
     * Render world boundary with spikes
     */
    renderBoundary() {
        const left = -this.cameraManager.x;
        const top = -this.cameraManager.y;
        const right = CONFIG.GAME.CANVAS_SIZE - this.cameraManager.x;
        const bottom = CONFIG.GAME.CANVAS_SIZE - this.cameraManager.y;

        // Base boundary line
        this.ctx.strokeStyle = CONFIG.GAME.BOUNDARY_COLOR;
        this.ctx.lineWidth = CONFIG.GAME.BOUNDARY_WIDTH;
        this.ctx.shadowBlur = CONFIG.GAME.BOUNDARY_GLOW;
        this.ctx.shadowColor = CONFIG.GAME.BOUNDARY_COLOR;
        this.ctx.strokeRect(left, top, CONFIG.GAME.CANVAS_SIZE, CONFIG.GAME.CANVAS_SIZE);

        // Draw spikes
        const spikeSize = 30;
        const spikeSpacing = 50;
        this.ctx.fillStyle = CONFIG.GAME.BOUNDARY_COLOR;

        // Top spikes (pointing down)
        for (let x = 0; x < CONFIG.GAME.CANVAS_SIZE; x += spikeSpacing) {
            const sx = x - this.cameraManager.x;
            const sy = top;
            this.ctx.beginPath();
            this.ctx.moveTo(sx, sy);
            this.ctx.lineTo(sx + spikeSize / 2, sy + spikeSize);
            this.ctx.lineTo(sx + spikeSize, sy);
            this.ctx.closePath();
            this.ctx.fill();
        }

        // Bottom spikes (pointing up)
        for (let x = 0; x < CONFIG.GAME.CANVAS_SIZE; x += spikeSpacing) {
            const sx = x - this.cameraManager.x;
            const sy = bottom;
            this.ctx.beginPath();
            this.ctx.moveTo(sx, sy);
            this.ctx.lineTo(sx + spikeSize / 2, sy - spikeSize);
            this.ctx.lineTo(sx + spikeSize, sy);
            this.ctx.closePath();
            this.ctx.fill();
        }

        // Left spikes (pointing right)
        for (let y = 0; y < CONFIG.GAME.CANVAS_SIZE; y += spikeSpacing) {
            const sx = left;
            const sy = y - this.cameraManager.y;
            this.ctx.beginPath();
            this.ctx.moveTo(sx, sy);
            this.ctx.lineTo(sx + spikeSize, sy + spikeSize / 2);
            this.ctx.lineTo(sx, sy + spikeSize);
            this.ctx.closePath();
            this.ctx.fill();
        }

        // Right spikes (pointing left)
        for (let y = 0; y < CONFIG.GAME.CANVAS_SIZE; y += spikeSpacing) {
            const sx = right;
            const sy = y - this.cameraManager.y;
            this.ctx.beginPath();
            this.ctx.moveTo(sx, sy);
            this.ctx.lineTo(sx - spikeSize, sy + spikeSize / 2);
            this.ctx.lineTo(sx, sy + spikeSize);
            this.ctx.closePath();
            this.ctx.fill();
        }

        this.ctx.shadowBlur = 0;
    }

    /**
     * Check boundary collision
     */
    checkBoundaryCollision(head) {
        const margin = CONFIG.SNAKE.SEGMENT_RADIUS;
        return (
            head.x < margin ||
            head.x > CONFIG.GAME.CANVAS_SIZE - margin ||
            head.y < margin ||
            head.y > CONFIG.GAME.CANVAS_SIZE - margin
        );
    }

    /**
     * Check self collision
     */
    checkSelfCollision() {
        const head = this.snakeManager.getHead();
        const skipSegments = CONFIG.COLLISION.SELF_COLLISION_SKIP_SEGMENTS;

        for (let i = skipSegments; i < this.snakeManager.segments.length; i++) {
            const seg = this.snakeManager.segments[i];
            if (MathUtils.circlesIntersect(
                head.x, head.y, CONFIG.SNAKE.SEGMENT_RADIUS,
                seg.x, seg.y, CONFIG.SNAKE.SEGMENT_RADIUS
            )) {
                return true;
            }
        }
        return false;
    }

    /**
     * Handle snake death - turn body into food
     */
    handleSnakeDeath(snake, killer = null) {
        if (!snake || !snake.isAlive) return;

        const isPlayer = snake.type === 'player';

        this.logger.log(isPlayer ? '💀 Player died!' : '🤖 AI snake died!', 'Length:', snake.getLength());

        // Play death sound
        if (isPlayer) {
            this.audioManager.play('death');
        } else {
            this.audioManager.play('aiDeath');
        }

        // Add to kill feed
        this.killFeedManager.addDeath(snake, killer);

        // Turn snake body into food (every 3rd segment to avoid too much food)
        const segments = snake.segments;
        for (let i = 0; i < segments.length; i += 3) {
            const seg = segments[i];

            // Create food at segment position
            const foodTypes = Object.keys(CONFIG.FOOD.TYPES);
            const weights = foodTypes.map(type => CONFIG.FOOD.TYPES[type].SPAWN_WEIGHT);
            const randomType = MathUtils.weightedRandom(foodTypes, weights);
            const foodConfig = CONFIG.FOOD.TYPES[randomType];

            this.foodManager.foods.push({
                x: seg.x,
                y: seg.y,
                type: randomType,
                config: foodConfig,
                pulsePhase: Math.random() * Math.PI * 2
            });
        }

        // Mark snake as dead
        snake.die();

        // If player died, game over
        if (isPlayer) {
            this.gameOver();
        } else {
            // AI snake - respawn after delay
            this.respawnAISnake(snake);
        }
    }

    /**
     * Respawn AI snake after death
     */
    respawnAISnake(deadSnake) {
        // Remove dead snake from controller
        this.aiController.removeAI(deadSnake.id);
        this.snakeManager.removeSnake(deadSnake.id);

        // Add to respawn queue (3 seconds = 180 frames at 60 FPS)
        this.aiRespawnQueue.push({
            framesRemaining: 180,
            color: deadSnake.color,
            strategyType: deadSnake.color.start === '#ff0066' ? 'aggressive' : 'cautious'
        });
    }

    /**
     * Game over
     */
    gameOver() {
        this.logger.warn('💀 Game Over! Final score:', this.score, 'Length:', this.playerSnake ? this.playerSnake.getLength() : 0);
        this.state = 'gameover';
        this.uiManager.showGameOver(this.score, () => this.start());
    }

    /**
     * Cleanup
     */
    destroy() {
        this.state = 'destroyed';

        // Destroy performance monitor
        if (this.perfMonitor) {
            this.perfMonitor.destroy();
            this.perfMonitor = null;
        }

        // Destroy all managers
        this.uiManager.destroy();
        this.snakeManager.destroy();
        this.foodManager.destroy();
        this.cameraManager.destroy();
        this.particleManager.destroy();
        this.audioManager.destroy();
        this.leaderboardManager.destroy();
        this.killFeedManager.destroy();

        // Remove event listeners
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners.clear();

        // Clear references
        this.canvas = null;
        this.ctx = null;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SnakeGame;
}
