/**
 * Snake Game - Main game controller
 * Coordinates all managers and game loop
 * Refactored to use BuffManager, CollisionManager, and RenderManager
 */

class SnakeGame {
    constructor(canvasId, logger = null) {
        // Canvas setup - support both canvas object (for testing) and canvas ID (for production)
        if (typeof canvasId === 'string') {
            this.canvas = document.getElementById(canvasId);
            this.container = this.canvas ? this.canvas.parentElement : null;
        } else {
            // For testing: accept canvas object directly
            this.canvas = canvasId;
            this.container = null;
        }

        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

        // Logger instance
        this.logger = logger || window.Logger || console;

        // Game state
        this.state = 'menu'; // menu, playing, paused, gameover
        this.score = 0;
        this.lastTime = 0;
        this.eventListeners = new Map();
        this.perfMonitor = null; // Will be set externally

        // AI respawn queue
        this.aiRespawnQueue = [];

        // Achievement tracking
        this.lastScoreMilestone = 0;

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
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;

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

        // New managers
        this.buffManager = new BuffManager(this.logger);
        this.collisionManager = new CollisionManager(CONFIG.GAME.CANVAS_SIZE, this.logger);
        this.renderManager = new RenderManager(this.canvas, this.cameraManager, this.logger);

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
                color: aiColors[i % aiColors.length],
                speed: CONFIG.SNAKE.INITIAL_SPEED * CONFIG.AI.INITIAL_SPEED_MULTIPLIER
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
            } else if ((this.state === 'playing' || this.state === 'paused') && e.code === 'Space') {
                this.togglePause();
            }
        };

        document.addEventListener('keydown', handleKeyboard);
        this.eventListeners.set('keydown', { element: document, event: 'keydown', handler: handleKeyboard });

        // Touch controls
        const handleTouchStart = (e) => {
            if (this.state === 'menu') {
                this.start();
                return;
            }
            const touch = e.touches[0];
            this.mouseX = touch.clientX;
            this.mouseY = touch.clientY;
        };

        const handleTouchMove = (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.mouseX = touch.clientX;
            this.mouseY = touch.clientY;
        };

        // Mouse controls
        const handleMouseClick = (e) => {
            if (this.state === 'menu') {
                this.start();
            }
        };

        const handleMouseMove = (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        };

        this.canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        this.canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        this.canvas.addEventListener('click', handleMouseClick);
        this.canvas.addEventListener('mousemove', handleMouseMove);

        // Home button
        const homeBtn = document.getElementById('home-btn');
        if (homeBtn) {
            homeBtn.addEventListener('click', () => {
                window.location.href = '../../index.html';
            });
        }

        // Pause button
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.togglePause());
        }

        // Language button
        const langBtn = document.getElementById('lang-btn');
        if (langBtn) {
            langBtn.addEventListener('click', () => {
                this.uiManager.showLanguageSelector();
            });
        }

        // Language change callback
        this.uiManager.onLanguageChange = () => {
            this.refreshUI();
        };

        // Right-click to pause/resume
        const handleContextMenu = (e) => {
            e.preventDefault();
            if (this.state === 'playing' || this.state === 'paused') {
                this.togglePause();
            }
        };

        this.canvas.addEventListener('contextmenu', handleContextMenu);
        this.eventListeners.set('contextmenu', { element: this.canvas, event: 'contextmenu', handler: handleContextMenu });
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

        // Reset buff manager
        this.buffManager.reset();

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

        // Respawn food
        this.foodManager.clear();
        this.foodManager.ensureMinimumFood(this.snakeManager.getAllSegments());

        // Update UI
        this.uiManager.updateScore(this.score);
        this.uiManager.updateLength(this.playerSnake.getLength());

        // Start game loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    /**
     * Toggle pause
     */
    togglePause() {
        if (this.state === 'playing') {
            this.state = 'paused';
            this.logger.log('⏸️ Game paused');
        } else if (this.state === 'paused') {
            this.state = 'playing';
            this.logger.log('▶️ Game resumed');
            requestAnimationFrame((time) => this.gameLoop(time));
        }
    }

    /**
     * Main game loop
     */
    gameLoop(currentTime) {
        if (this.state !== 'playing') return;

        // Calculate delta time
        const deltaTime = this.lastTime ? Math.min((currentTime - this.lastTime) / 1000, 0.1) : 0;
        this.lastTime = currentTime;

        // Update
        this.update(deltaTime);

        // Render
        this.render();

        // Continue loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    /**
     * Update game state
     */
    update(deltaTime) {
        // Update player snake direction based on mouse
        if (this.playerSnake && this.playerSnake.isAlive) {
            const head = this.playerSnake.getHead();
            const worldX = this.mouseX + this.cameraManager.getX();
            const worldY = this.mouseY + this.cameraManager.getY();
            const targetAngle = Math.atan2(worldY - head.y, worldX - head.x);
            this.playerSnake.setTargetAngle(targetAngle);
        }

        // Update all snakes and spawn trail particles
        for (const snake of this.snakeManager.snakes.values()) {
            if (snake.isAlive) {
                snake.update(deltaTime);

                // Spawn trail particles for moving snakes
                const head = snake.getHead();
                if (head) {
                    this.particleManager.spawn(head.x, head.y, snake.color.start);
                }
            }
        }

        // Update AI decisions
        this.aiController.updateAll(
            deltaTime,
            this.foodManager.foods,
            this.snakeManager.getPlayerSnake(),
            this.snakeManager.getAISnakes()
        );

        // Update buff manager and handle events
        const buffEvent = this.buffManager.update(deltaTime, this.playerSnake, this.foodManager.foods);
        if (buffEvent && buffEvent.comboEnded) {
            this.uiManager.showToast('🔥 ' + I18N.t('combo_ended', { count: buffEvent.count }));
        }

        // Update camera
        if (this.playerSnake && this.playerSnake.isAlive) {
            const head = this.playerSnake.getHead();
            this.cameraManager.follow(head);
        }
        this.cameraManager.update(deltaTime);

        // Check food collection
        for (const snake of this.snakeManager.snakes.values()) {
            if (!snake.isAlive) continue;

            const collectedFoods = this.collisionManager.checkFoodCollections(snake, this.foodManager.foods);
            for (const food of collectedFoods) {
                this.handleFoodCollision(snake, food);
            }
        }

        // Check collisions using optimized collision manager
        const collisions = this.collisionManager.checkAllCollisions(
            Array.from(this.snakeManager.snakes.values()),
            CONFIG.GAME.CANVAS_SIZE
        );

        for (const collision of collisions) {
            this.handleSnakeDeath(collision.snake, collision.hitBy);
        }

        // Process AI respawn queue
        for (let i = this.aiRespawnQueue.length - 1; i >= 0; i--) {
            const respawn = this.aiRespawnQueue[i];
            respawn.framesRemaining--;

            if (respawn.framesRemaining <= 0) {
                const margin = 500;
                const x = MathUtils.random(margin, CONFIG.GAME.CANVAS_SIZE - margin);
                const y = MathUtils.random(margin, CONFIG.GAME.CANVAS_SIZE - margin);

                const newSnake = this.snakeManager.createAISnake({
                    x, y,
                    angle: Math.random() * Math.PI * 2,
                    color: respawn.color,
                    speed: CONFIG.SNAKE.INITIAL_SPEED * CONFIG.AI.INITIAL_SPEED_MULTIPLIER
                });

                const strategy = respawn.strategyType === 'aggressive'
                    ? new AggressiveStrategy()
                    : new CautiousStrategy();

                this.aiController.registerAI(newSnake, strategy);
                this.logger.log('🤖 AI snake respawned!');
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

        // Update render manager animations
        this.renderManager.updateStars(deltaTime);

        // Update particles and leaderboard
        this.particleManager.update(deltaTime);
        this.leaderboardManager.update(this.snakeManager.snakes, this.playerSnake);
        this.killFeedManager.update(deltaTime);

        // Ensure minimum food
        this.foodManager.ensureMinimumFood(this.snakeManager.getAllSegments());
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

        const margin = 500;
        const x = MathUtils.random(margin, CONFIG.GAME.CANVAS_SIZE - margin);
        const y = MathUtils.random(margin, CONFIG.GAME.CANVAS_SIZE - margin);

        const colors = [
            { start: '#ff0066', end: '#ff6699', glow: 'rgba(255, 0, 102, 0.8)' },
            { start: '#00ff88', end: '#00ddaa', glow: 'rgba(0, 255, 136, 0.8)' },
            { start: '#ffaa00', end: '#ffdd44', glow: 'rgba(255, 170, 0, 0.8)' }
        ];

        const newSnake = this.snakeManager.createAISnake({
            x, y,
            angle: Math.random() * Math.PI * 2,
            color: colors[this.aiSpawnedCount % colors.length],
            speed: CONFIG.SNAKE.INITIAL_SPEED * CONFIG.AI.INITIAL_SPEED_MULTIPLIER
        });

        this.aiController.registerAI(newSnake, new AggressiveStrategy());
        this.aiSpawnedCount++;

        this.uiManager.showToast('🤖 ' + I18N.t('new_ai'));
        this.audioManager.play('powerup');
        this.logger.log('🤖 New AI spawned at milestone:', this.playerSnake.getLength());
    }

    /**
     * Apply food type-specific effects using strategy pattern
     */
    applyFoodEffect(foodType, snake, foodConfig) {
        const foodEffects = {
            'SPEED': () => {
                this.buffManager.activateSpeedBoost(this.playerSnake, foodConfig.BOOST_DURATION);
                this.uiManager.showToast('⚡ ' + I18N.t('speed_boost'));
                this.uiManager.showBuffIndicator('speed', foodConfig.BOOST_DURATION);
                this.audioManager.play('speedBoost');
            },
            'BONUS': () => {
                this.buffManager.activateScoreMultiplier(foodConfig.SCORE_MULTIPLIER, foodConfig.MULTIPLIER_DURATION);
                this.uiManager.showToast('💎 ' + I18N.t('score_multiplier'));
                this.uiManager.showBuffIndicator('bonus', foodConfig.MULTIPLIER_DURATION);
                this.audioManager.play('powerup');
            },
            'GOLDEN': () => {
                // Golden food gives extra growth (already grew 1, need GROW_AMOUNT - 1 more)
                if (foodConfig.GROW_AMOUNT) {
                    for (let i = 1; i < foodConfig.GROW_AMOUNT; i++) {
                        snake.grow();
                    }
                }
                this.uiManager.showToast('🌟 ' + I18N.t('golden_food'));
                this.audioManager.play('golden');
            },
            'MAGNET': () => {
                this.buffManager.activateMagnet(foodConfig.MAGNET_RANGE, foodConfig.MAGNET_DURATION);
                this.uiManager.showToast('🧲 ' + I18N.t('magnet_power'));
                this.uiManager.showBuffIndicator('magnet', foodConfig.MAGNET_DURATION);
                this.audioManager.play('powerup');
            },
            'NORMAL': () => {
                // Normal food - just eat sound
                this.audioManager.play('eat');
            }
        };

        // Execute food effect if handler exists
        const handler = foodEffects[foodType];
        if (handler) {
            handler();
        } else {
            // Fallback for unknown food types
            this.audioManager.play('eat');
        }
    }

    /**
     * Handle food collision
     */
    handleFoodCollision(snake, collectedFood) {
        const isPlayer = snake.type === 'player';
        const foodConfig = collectedFood.config;

        // Grow snake (all food makes snake grow by 1 segment)
        snake.grow();

        // Remove food
        const foodIndex = this.foodManager.foods.indexOf(collectedFood);
        if (foodIndex !== -1) {
            this.foodManager.foods.splice(foodIndex, 1);
        }

        // Player gets scoring and buffs
        if (isPlayer) {
            // Increment combo
            this.buffManager.incrementCombo();

            // Calculate score with multipliers
            const baseScore = foodConfig.SCORE;
            const earnedScore = this.buffManager.calculateScore(baseScore);

            this.score += earnedScore;
            this.uiManager.updateScore(this.score);
            this.uiManager.updateLength(snake.getLength());

            // Handle food type effects using strategy mapping
            this.applyFoodEffect(collectedFood.type, snake, foodConfig);

            // Combo notification
            if (this.buffManager.getComboCount() >= 3) {
                this.uiManager.showToast('🔥 ' + I18N.t('combo', { count: this.buffManager.getComboCount() }));
            }
        } else {
            // AI just gets basic eat sound
            this.audioManager.play('eat');
        }

        // Particles
        this.particleManager.spawnFoodCollect(
            collectedFood.x, collectedFood.y,
            foodConfig.COLOR
        );
    }

    /**
     * Handle snake death
     */
    handleSnakeDeath(snake, killer = null) {
        if (!snake || !snake.isAlive) return;

        const isPlayer = snake.type === 'player';

        this.logger.log(isPlayer ? '💀 Player died!' : '🤖 AI snake died!', 'Length:', snake.getLength());

        // Mark as dead
        snake.isAlive = false;

        // Award score to killer
        if (killer && killer.type === 'player') {
            const baseScore = CONFIG.FOOD.TYPES.NORMAL.SCORE * snake.getLength();
            const earnedScore = this.buffManager.calculateScore(baseScore);
            this.score += earnedScore;
            this.uiManager.updateScore(this.score);
        }

        // Convert body to food with particles
        const segments = snake.getSegments();
        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];

            // Create food at segment position
            if (i % 2 === 0) {
                this.foodManager.spawnFoodAt(segment.x, segment.y);
            }

            // Create death particles
            if (i % 3 === 0) {
                this.particleManager.spawnExplosion(
                    segment.x, segment.y,
                    snake.color.start
                );
            }
        }

        // Kill feed
        this.killFeedManager.addDeath(snake, killer);

        // Respawn or game over
        if (isPlayer) {
            this.gameOver();
        } else {
            this.respawnAISnake(snake);
        }

        this.audioManager.play('death');
    }

    /**
     * Respawn AI snake
     */
    respawnAISnake(deadSnake) {
        const strategy = this.aiController.aiSnakes.get(deadSnake);
        const strategyType = strategy instanceof AggressiveStrategy ? 'aggressive' : 'cautious';

        this.aiRespawnQueue.push({
            color: deadSnake.color,
            strategyType: strategyType,
            framesRemaining: CONFIG.AI.RESPAWN_DELAY_FRAMES
        });

        this.aiController.aiSnakes.delete(deadSnake);
    }

    /**
     * Game over
     */
    gameOver() {
        this.state = 'gameover';
        this.logger.info('💀 Game Over! Score:', this.score);
        this.uiManager.showGameOver(this.score, () => this.start());
    }

    /**
     * Refresh UI after language change
     */
    refreshUI() {
        this.uiManager.updateScore(this.score);
        if (this.playerSnake) {
            this.uiManager.updateLength(this.playerSnake.getLength());
        }
    }

    /**
     * Render game
     */
    render() {
        this.renderManager.render(
            this.state,
            this.playerSnake,
            this.buffManager,
            this.particleManager,
            this.snakeManager,
            this.foodManager,
            this.leaderboardManager,
            this.killFeedManager
        );
    }

    /**
     * Cleanup
     */
    destroy() {
        this.logger.info('🔄 Destroying game...');

        // Cleanup event listeners
        for (const [key, { element, event, handler }] of this.eventListeners) {
            element.removeEventListener(event, handler);
        }
        this.eventListeners.clear();

        // Cleanup render manager
        if (this.renderManager) {
            this.renderManager.destroy();
        }

        this.logger.info('✅ Game destroyed');
    }
}

// Export for ES6 modules (testing)
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = { SnakeGame };
}
