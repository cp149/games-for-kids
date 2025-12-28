/**
 * Chemistry Lab Game - Main Game Class
 * Card-based chemistry reaction puzzle game
 */

class ChemistryLabGame {
  constructor(canvas, config, levels, i18n) {
    console.log('[Game Constructor] Start');
    const t0 = performance.now();

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.config = config;
    this.levels = levels;
    this.i18n = i18n;

    // Set canvas size
    this.canvas.width = config.CANVAS.WIDTH;
    this.canvas.height = config.CANVAS.HEIGHT;

    // Game state
    this.score = 0;
    this.isPaused = false;
    this.isGameOver = false;

    // Initialize Managers
    console.log('[Game Constructor] Initializing managers...');
    const t1 = performance.now();
    this.initializeManagers();
    console.log(`[Game Constructor] Managers initialized in ${(performance.now() - t1).toFixed(2)}ms`);

    // Animation
    this.lastFrameTime = Date.now();
    this.animationId = null;

    // Performance monitor (attached externally)
    this.perfMonitor = null;

    // Setup tab visibility handler
    this.setupTabVisibility();

    // Load first level
    console.log('[Game Constructor] Loading level 1...');
    const t2 = performance.now();
    this.levelMgr.loadLevel(1);
    console.log(`[Game Constructor] Level 1 loaded in ${(performance.now() - t2).toFixed(2)}ms`);

    // Setup language change callback
    this.i18n.onLanguageChange = () => this.handleLanguageChange();

    console.log(`[Game Constructor] Total: ${(performance.now() - t0).toFixed(2)}ms`);
  }

  /**
   * Public method to perform reaction (called by InputManager)
   */
  performReaction(reactionData) {
    // Get cards from slots
    const cards = this.slotMgr.getSlotCards();

    // Check if catalyst is active
    const hasCatalyst = this.specialCardMgr.hasCatalyst();

    // Perform reaction with manager
    const result = this.reactionMgr.performReaction(cards, hasCatalyst);

    if (!result || !result.success) {
      return;
    }

    // Play reaction sound
    // For synthesis, we might want a different sound, but reuse reaction sound for now
    this.audioMgr.playReactionSound(result.reaction.result);

    // Update score
    this.score += result.points;

    // Show celebration for good reactions
    this.showReactionCelebration(result.reaction, result.points);

    // Update level progress
    // Use output type (e.g. 'STEAM') for synthesis, or result key (e.g. 'RED_EXPLOSION') for others
    const progressKey = result.reaction.output || result.reaction.result;
    this.levelMgr.updateReactionProgress(progressKey);

    // Track catalyst usage
    if (hasCatalyst) {
      this.levelMgr.updateCatalystProgress();
      this.specialCardMgr.returnCatalyst();
    }

    // Handle Reaction Result (Synthesis vs Explosion)
    if (result.reaction.type === 'synthesis' && result.reaction.output) {
      // --- SYNTHESIS LOGIC ---
      const targetSlotIndex = cards[0].slotIndex;

      // Remove and destroy input cards
      cards.forEach(card => {
        this.cardDropMgr.removeCard(card);
        this.slotMgr.removeCardFromSlot(card.slotIndex);
        card.destroy();
      });

      // Create new card
      const newCard = this.cardFactory.createReagentCard(result.reaction.output, 0, 0);

      // Register with CardDropManager (so it can be interacted with)
      this.cardDropMgr.cards.push(newCard);

      // Notify level about new card (for Level8 LAVA logic)
      const currentLevel = this.levelMgr.currentLevel;
      if (currentLevel && typeof currentLevel.onCardCreated === 'function') {
        currentLevel.onCardCreated(newCard);
      }

      // Add reversibility indicator if applicable
      if (this.reversibilitySystem && result.reaction.reversible) {
        const reactionKey = this.reversibilitySystem.getReactionKey(result.reaction.output);
        if (reactionKey) {
          this.reversibilitySystem.addReversibilityIndicator(newCard.element, reactionKey);
          this.attachSwipeHandler(newCard);
        }
      }

      // Place in slot
      this.slotMgr.placeCardInSlot(newCard, targetSlotIndex);

      // Trigger slot changed event to update UI
      if (this.dragMgr && this.dragMgr.onSlotChanged) {
        this.dragMgr.onSlotChanged();
      }

    } else {
      // --- EXPLOSION LOGIC (Legacy) ---
      cards.forEach(card => {
        this.cardDropMgr.removeCard(card);
        card.destroy();
      });

      // Clear slots
      this.slotMgr.clearAllSlots();
      
      // Trigger slot changed event
      if (this.dragMgr && this.dragMgr.onSlotChanged) {
        this.dragMgr.onSlotChanged();
      }
    }

    // Update UI
    this.updateAllUI();

    // Check level completion
    this.levelMgr.checkLevelCompletion(this.score);
  }

  /**
   * Discard a card from a specific slot (User Action)
   */
  discardSlotCard(slotIndex) {
    if (this.slotMgr.isSlotFilled(slotIndex)) {
      const card = this.slotMgr.removeCardFromSlot(slotIndex);
      
      if (card) {
        // Remove from tracking and destroy
        this.cardDropMgr.removeCard(card);
        card.destroy();
        
        // Update UI state
        if (this.dragMgr && this.dragMgr.onSlotChanged) {
          this.dragMgr.onSlotChanged();
        }
        
        // Optional: Play discard sound
        // this.audioMgr.playDiscardSound();
      }
    }
  }

  /**
   * Setup tab visibility auto-pause
   */
  setupTabVisibility() {
    this.wasPausedByTab = false; // Track if pause was caused by tab switch

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Tab hidden - pause game
        if (!this.isPaused && !this.isGameOver) {
          this.wasPausedByTab = true;
          this.pause();
          this.audioMgr.handleTabHidden();
          console.log('[Game] Paused by tab switch');
        }
      } else {
        // Tab visible - auto resume if was paused by tab
        if (this.isPaused && this.wasPausedByTab) {
          this.wasPausedByTab = false;
          this.resume();
          this.audioMgr.handleTabVisible();
          console.log('[Game] Resumed from tab switch');
        } else if (this.isPaused) {
          this.audioMgr.handleTabVisible();
        }
      }
    });
  }

  /**
   * Initialize all managers
   */
  initializeManagers() {
    // Core managers
    this.levelMgr = new LevelManager(this.config, this.levels, this.i18n, this);
    this.timerMgr = new TimerManager(this.config);
    this.audioMgr = new AudioManager(this.config);

    // Lib components
    if (typeof ParticleSystem !== 'undefined') {
      this.particleSystem = new ParticleSystem(this.canvas);
    }

    // Utilities
    this.reactionRules = new ReactionRules(REACTIONS);
    this.cardFactory = new CardFactory(this.config);

    // Game managers (initialized with first level data)
    const levelData = this.levels[0];
    this.cardDropMgr = new CardDropManager(this.config, levelData);
    this.slotMgr = new SlotManager(this.config);
    this.reactionMgr = new ReactionManager(this.config, this.reactionRules, this.particleSystem);
    this.uiMgr = new UIManager(this.config, this.i18n);
    this.specialCardMgr = new SpecialCardManager(this.config, this.cardFactory);

    // Recipe Memory System (Ghost Trails)
    if (typeof RecipeMemorySystem !== 'undefined') {
      this.recipeMemory = new RecipeMemorySystem(this.config, REACTIONS);
    }

    // Particle Personality System (Micro-view demonstrations)
    if (typeof ParticlePersonalitySystem !== 'undefined') {
      this.particlePersonality = new ParticlePersonalitySystem(this, this.config);
    }

    // Reversibility System (Zipper vs Padlock)
    if (typeof ReversibilitySystem !== 'undefined') {
      this.reversibilitySystem = new ReversibilitySystem(this.config);
    }

    // Swipe Gesture Detector
    if (typeof SwipeGestureDetector !== 'undefined') {
      this.swipeDetector = new SwipeGestureDetector(this.config);
    }

    // Zipper Open Animation
    if (typeof ZipperOpenAnimation !== 'undefined') {
      this.zipperAnimation = new ZipperOpenAnimation(this.canvas, this.config);
    }

    // Locked Shake Animation
    if (typeof LockedShakeAnimation !== 'undefined') {
      this.lockedAnimation = new LockedShakeAnimation(this.config);
    }

    // Setup callbacks
    this.setupManagerCallbacks();

    // Input manager (handles audio controls and mix button)
    this.inputMgr = new InputManager(this);

    // Drag manager (initialized after DOM ready)
    this.dragMgr = null;

    // Setup long press detection for recipe memory
    this.setupRecipeMemoryInput();
  }

  /**
   * Setup manager callbacks
   */
  setupManagerCallbacks() {
    // Card drop callbacks
    this.cardDropMgr.onCardMissed = this.handleCardMissed.bind(this);
    this.cardDropMgr.onCardExpired = this.handleCardExpired.bind(this);

    // Level manager callbacks
    this.levelMgr.onLevelLoad = this.handleLevelLoad.bind(this);
    this.levelMgr.onLevelComplete = this.handleLevelComplete.bind(this);

    // Timer callbacks
    this.timerMgr.onTimeUpdate = (time) => this.uiMgr.updateTimer(time);
    this.timerMgr.onTimeExpired = this.gameOver.bind(this);
  }

  /**
   * Initialize drag manager (after DOM ready)
   */
  initializeDragManager() {
    this.dragMgr = new DragManager(this, this.config);
    this.dragMgr.onSlotChanged = this.handleSlotChanged.bind(this);
    this.dragMgr.onSpecialCardDropped = this.handleSpecialCardDropped.bind(this);
    this.dragMgr.onStabilizerDroppedOnCard = this.handleStabilizerDroppedOnCard.bind(this);
  }

  /**
   * Setup long press detection for recipe memory system
   */
  setupRecipeMemoryInput() {
    if (!this.recipeMemory) return;

    // Track event listeners for cleanup
    this.recipeMemoryListeners = new Map();

    const canvas = this.canvas;

    // Mouse events
    const mouseDownHandler = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      this.handleRecipeMemoryPointerDown(x, y);
    };

    const mouseUpHandler = () => {
      this.handleRecipeMemoryPointerUp();
    };

    // Touch events
    const touchStartHandler = (event) => {
      if (event.touches.length === 1) {
        const touch = event.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        this.handleRecipeMemoryPointerDown(x, y);
      }
    };

    const touchEndHandler = () => {
      this.handleRecipeMemoryPointerUp();
    };

    // Add event listeners
    canvas.addEventListener('mousedown', mouseDownHandler);
    canvas.addEventListener('mouseup', mouseUpHandler);
    canvas.addEventListener('touchstart', touchStartHandler);
    canvas.addEventListener('touchend', touchEndHandler);

    // Store for cleanup
    this.recipeMemoryListeners.set('mousedown', { element: canvas, event: 'mousedown', handler: mouseDownHandler });
    this.recipeMemoryListeners.set('mouseup', { element: canvas, event: 'mouseup', handler: mouseUpHandler });
    this.recipeMemoryListeners.set('touchstart', { element: canvas, event: 'touchstart', handler: touchStartHandler });
    this.recipeMemoryListeners.set('touchend', { element: canvas, event: 'touchend', handler: touchEndHandler });
  }

  /**
   * Handle pointer down for recipe memory
   */
  handleRecipeMemoryPointerDown(x, y) {
    if (!this.recipeMemory) return;

    // Check if pointer is over a card in a slot
    const card = this.findCardAtPosition(x, y);
    if (card) {
      this.recipeMemory.onPointerDown(card, x, y);
    }
  }

  /**
   * Handle pointer up for recipe memory
   */
  handleRecipeMemoryPointerUp() {
    if (!this.recipeMemory) return;
    this.recipeMemory.onPointerUp();
  }

  /**
   * Find card at specific position (for long press detection)
   */
  findCardAtPosition(x, y) {
    const canvasRect = this.canvas.getBoundingClientRect();

    // Check cards in slots first (DOM-based)
    for (let i = 0; i < this.slotMgr.slots.length; i++) {
      const card = this.slotMgr.slots[i];
      if (card && card.element) {
        const rect = card.element.getBoundingClientRect();
        const cardX = rect.left - canvasRect.left;
        const cardY = rect.top - canvasRect.top;

        if (x >= cardX && x <= cardX + rect.width &&
            y >= cardY && y <= cardY + rect.height) {
          return card;
        }
      }
    }

    // Check falling cards (position-based)
    for (const card of this.cardDropMgr.cards) {
      if (card.isInSlot) continue; // Already checked above

      const cardWidth = this.config.CARDS.CARD_WIDTH;
      const cardHeight = this.config.CARDS.CARD_HEIGHT;

      if (x >= card.x && x <= card.x + cardWidth &&
          y >= card.y && y <= card.y + cardHeight) {
        return card;
      }
    }

    return null;
  }

  /**
   * Handle level load
   */
  handleLevelLoad(levelData) {
    // Show tutorial hints
    this.levelMgr.showTutorialHints(levelData.level);

    // Clear previous level
    if (this.reactionMgr) {
      this.reactionMgr.clearReactions();
    }
    if (this.slotMgr) {
      this.slotMgr.clearAllSlots();
    }

    // Recreate card drop manager with new level data
    if (this.cardDropMgr) {
      this.cardDropMgr.destroy();
    }
    this.cardDropMgr = new CardDropManager(this.config, levelData);
    this.cardDropMgr.onCardMissed = this.handleCardMissed.bind(this);
    this.cardDropMgr.onCardExpired = this.handleCardExpired.bind(this);

    // Reinitialize drag manager
    if (this.dragMgr) {
      this.dragMgr.destroy();
    }
    this.initializeDragManager();

    // Create special cards
    this.createSpecialCards(levelData);

    // Update UI
    this.updateAllUI();

    // Setup input handlers
    this.inputMgr.setupAllHandlers();
  }

  /**
   * Handle level complete
   */
  handleLevelComplete() {
    this.score += this.config.SCORE.LEVEL_COMPLETE;
    this.stop();

    // Play level complete sound
    this.audioMgr.playLevelComplete();

    // Show level complete banner
    this.showLevelCompleteBanner();

    if (this.levelMgr.hasNextLevel()) {
      setTimeout(() => {
        const nextLevel = this.levelMgr.getCurrentLevel() + 1;
        this.levelMgr.loadLevel(nextLevel);
        this.start();
      }, 2500);
    } else {
      setTimeout(() => {
        this.gameWin();
      }, 2000);
    }
  }

  /**
   * Show level complete banner
   */
  showLevelCompleteBanner() {
    const banner = document.createElement('div');
    banner.className = 'level-complete-banner';
    banner.textContent = this.i18n.t('level_complete');

    const container = document.getElementById('game-container');
    if (container) {
      container.appendChild(banner);

      // Trigger particles if available
      if (this.particleSystem) {
        this.particleSystem.createBurst(400, 400, '#51CF66', 30);
      }

      // Remove after animation
      setTimeout(() => {
        banner.remove();
      }, 2000);
    }
  }

  /**
   * Create special cards for level
   */
  createSpecialCards(levelData) {
    this.specialCardMgr.createSpecialCards(levelData);
  }

  /**
   * Show celebration effect for reaction
   */
  showReactionCelebration(reaction, points) {
    // Create celebration overlay
    const celebration = document.createElement('div');
    celebration.className = 'celebration-overlay';
    
    // Container for content
    const content = document.createElement('div');
    content.style.display = 'flex';
    content.style.flexDirection = 'column';
    content.style.alignItems = 'center';
    
    // Emoji
    const emoji = document.createElement('div');
    emoji.textContent = reaction.emoji;
    content.appendChild(emoji);

    // Label (New: Show name of created item)
    if (reaction.type === 'synthesis' && reaction.output) {
      const label = document.createElement('div');
      label.textContent = reaction.output; // e.g. "STEAM"
      label.style.fontSize = '24px';
      label.style.color = '#fff';
      label.style.textShadow = '0 0 10px rgba(0,0,0,0.8)';
      label.style.marginTop = '10px';
      content.appendChild(label);
    }

    // Add points indicator
    const pointsText = document.createElement('div');
    pointsText.style.fontSize = '36px';
    pointsText.style.color = '#FFD700';
    pointsText.style.marginTop = '10px';
    pointsText.textContent = `+${points}`;
    content.appendChild(pointsText);

    celebration.appendChild(content);
    document.body.appendChild(celebration);

    // Remove after animation
    setTimeout(() => {
      celebration.remove();
    }, 1000);
  }

  /**
   * Handle slot changed
   */
  handleSlotChanged() {
    // Enable/disable mix button based on filled slots
    const hasCards = this.slotMgr.hasFilledSlots();
    this.uiMgr.setMixButtonEnabled(hasCards);

    // Play card drop sound when card placed
    if (hasCards) {
      this.audioMgr.playCardDrop();
    }
  }

  /**
   * Handle special card dropped (catalyst)
   */
  handleSpecialCardDropped(cardId) {
    this.specialCardMgr.activateCatalyst(cardId);
    this.audioMgr.playCatalystSound();
  }

  /**
   * Handle stabilizer dropped on card
   */
  handleStabilizerDroppedOnCard(stabilizerCardId, reagentCardId) {
    const card = this.cardDropMgr.getCardById(reagentCardId);
    if (card) {
      this.specialCardMgr.useStabilizer(stabilizerCardId, card);
      this.audioMgr.playStabilizerSound();
    }
  }

  /**
   * Handle card missed (fell out of bounds)
   */
  handleCardMissed(card) {
    console.log('Card missed:', card.type);
  }

  /**
   * Handle card expired
   */
  handleCardExpired(card) {
    console.log('Card expired:', card.type);
  }

  /**
   * Game over
   */
  gameOver() {
    this.isGameOver = true;
    this.stop();
    this.audioMgr.playFail();
    const message = `${this.i18n.t('time_up')} ${this.i18n.t('current_score', { score: this.score })}`;
    this.uiMgr.showMenu(message);
  }

  /**
   * Game win
   */
  gameWin() {
    this.isGameOver = true;
    this.stop();
    const message = `${this.i18n.t('game_complete')} ${this.i18n.t('current_score', { score: this.score })}`;
    this.uiMgr.showMenu(message);
  }

  /**
   * Update all UI elements
   */
  updateAllUI() {
    this.uiMgr.updateScore(this.score);
    this.uiMgr.updateLevel(this.levelMgr.getCurrentLevel());

    const levelData = this.levelMgr.getCurrentLevelData();
    if (levelData) {
      // Update objective with graphical data
      const objectiveData = this.levelMgr.getObjectiveData(this.score);
      this.uiMgr.updateObjectiveDisplay(objectiveData);
    }
  }

  /**
   * Handle language change
   */
  handleLanguageChange() {
    // Update all UI text
    this.uiMgr.updateAllText();

    // Update objective text
    const objectiveData = this.levelMgr.getObjectiveData(this.score);
    this.uiMgr.updateObjectiveDisplay(objectiveData);
  }

  /**
   * Attach swipe handler to a reversible card
   */
  attachSwipeHandler(card) {
    if (!this.swipeDetector || !card.element) return;

    this.swipeDetector.attachToCard(card.element, (cardElement, direction, velocity) => {
      this.handleCardSwipe(card, direction, velocity);
    });
  }

  /**
   * Handle swipe gesture on a card
   */
  handleCardSwipe(card, direction, velocity) {
    const reactionKey = this.reversibilitySystem.getReactionKey(card.type);

    if (this.reversibilitySystem.isReversible(reactionKey)) {
      // Reversible reaction - perform zipper open animation
      this.performReverseSeparation(card);
    } else if (this.reversibilitySystem.isIrreversible(reactionKey)) {
      // Irreversible reaction - show locked rejection
      this.showLockedRejection(card);
    }
  }

  /**
   * Perform reverse separation (zipper open)
   */
  performReverseSeparation(card) {
    // Determine target card types (reverse of BLUE+RED -> STEAM)
    const targetTypes = ['BLUE', 'RED']; // For STEAM separation

    // Start zipper animation
    if (this.zipperAnimation) {
      this.zipperAnimation.start(card, targetTypes, (types) => {
        // Remove original card
        const slotIndex = card.slotIndex;
        this.slotMgr.removeCardFromSlot(slotIndex);
        this.cardDropMgr.removeCard(card);
        card.destroy();

        // Create separated cards
        types.forEach((type, index) => {
          const newCard = this.cardFactory.createReagentCard(type, 0, 0);
          this.cardDropMgr.cards.push(newCard);

          // Place in adjacent slots if available
          const targetSlot = slotIndex + index;
          if (targetSlot < this.slotMgr.slots.length && !this.slotMgr.isSlotFilled(targetSlot)) {
            this.slotMgr.placeCardInSlot(newCard, targetSlot);
          }
        });

        // Play sound effect
        this.audioMgr.playCardDrop();

        // Update UI
        this.updateAllUI();
      });
    }
  }

  /**
   * Show locked rejection animation
   */
  showLockedRejection(card) {
    if (this.lockedAnimation && card.element) {
      // Play shake animation
      this.lockedAnimation.animateReject(card.element);

      // Show locked pulse
      this.lockedAnimation.showLockedPulse(card.element);

      // Play rejection sound
      this.audioMgr.playFail();
    }
  }

  /**
   * Main game loop - Update
   */
  update() {
    if (this.isPaused || this.isGameOver) {
      console.log('[Game] update() skipped: isPaused=' + this.isPaused + ', isGameOver=' + this.isGameOver);
      return;
    }

    // Performance monitoring - begin
    if (this.perfMonitor) {
      this.perfMonitor.begin();
    }

    const now = Date.now();
    const deltaTime = now - this.lastFrameTime;
    this.lastFrameTime = now;

    console.log('[Game] update() deltaTime:', deltaTime);

    // Convert deltaTime to seconds for physics
    const dt = deltaTime / 1000;

    // Update card drop manager
    console.log('[Game] Calling cardDropMgr.update() with deltaTime:', deltaTime);
    this.cardDropMgr.update(deltaTime);

    // Update reactions
    this.reactionMgr.update(deltaTime);

    // Update recipe memory system
    if (this.recipeMemory) {
      this.recipeMemory.update(dt);
    }

    // Update catalyst manager (if active in current level)
    if (this.catalystManager) {
      this.catalystManager.update(deltaTime);
    }

    // Update current level
    if (this.levelMgr && this.levelMgr.currentLevel) {
      this.levelMgr.currentLevel.update(deltaTime);
    }

    // Update zipper animation
    if (this.zipperAnimation) {
      this.zipperAnimation.update(deltaTime);
    }

    // Update particle personality system
    if (this.particlePersonality) {
      this.particlePersonality.update(dt);
    }

    // Performance monitoring - end
    if (this.perfMonitor) {
      this.perfMonitor.end();
    }
  }

  /**
   * Main game loop - Render
   */
  render() {
    // Clear canvas
    this.ctx.fillStyle = this.config.UI.BG_COLOR;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render reactions
    const reactions = this.reactionMgr.getActiveReactions();
    reactions.forEach(reaction => {
      const data = reaction.getRenderData();
      this.ctx.globalAlpha = data.opacity;
      this.ctx.font = `${48 * data.scale}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(data.emoji, data.x, data.y);
    });

    this.ctx.globalAlpha = 1.0;

    // Render recipe memory ghost trails
    if (this.recipeMemory) {
      this.recipeMemory.render(this.ctx);
    }

    // Render catalyst manager (if active in current level)
    if (this.catalystManager) {
      this.catalystManager.render(this.ctx);
    }

    // Render particle personality system (micro-view)
    if (this.particlePersonality) {
      this.particlePersonality.render(this.ctx);
    }

    // Render zipper animation
    if (this.zipperAnimation) {
      this.zipperAnimation.render(this.ctx);
    }
  }

  /**
   * Game loop
   */
  loop() {
    this.update();
    this.render();
    this.animationId = requestAnimationFrame(() => this.loop());
  }

  /**
   * Start game
   */
  start() {
    console.log('[Game] start() called at', new Date().toISOString());
    const startT0 = performance.now();

    this.isPaused = false;
    this.lastFrameTime = Date.now();

    // Initialize drag manager if not done
    if (!this.dragMgr) {
      console.log('[Game] Initializing drag manager...');
      const t1 = performance.now();
      this.initializeDragManager();
      console.log(`[Game] Drag manager initialized in ${(performance.now() - t1).toFixed(2)}ms`);
    }

    // Start card dropping
    console.log('[Game] Starting card drop manager');
    this.cardDropMgr.start();

    // Start timer
    const levelData = this.levelMgr.getCurrentLevelData();
    console.log('[Game] Level data:', levelData);
    if (levelData && levelData.timer !== null) {
      this.timerMgr.start(levelData.timer);
    }

    // Start background music
    this.audioMgr.start();

    // Start game loop
    console.log('[Game] Starting game loop');
    this.loop();

    console.log(`[Game] start() completed in ${(performance.now() - startT0).toFixed(2)}ms`);
  }

  /**
   * Stop game
   */
  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    // Stop card dropping
    if (this.cardDropMgr) {
      this.cardDropMgr.stop();
    }

    // Stop timer
    this.timerMgr.stop();

    // Stop audio
    this.audioMgr.stop();
  }

  /**
   * Pause game
   */
  pause() {
    this.isPaused = true;
    this.timerMgr.pause();

    // Also pause card generation
    if (this.cardDropMgr) {
      this.cardDropMgr.isPaused = true;
      console.log('[Game] Card generation paused');
    }
  }

  /**
   * Resume game
   */
  resume() {
    if (!this.isGameOver) {
      this.isPaused = false;
      this.lastFrameTime = Date.now();
      this.timerMgr.resume();

      // Also resume card generation
      if (this.cardDropMgr) {
        this.cardDropMgr.isPaused = false;
        this.cardDropMgr.scheduleNextDrop(); // Restart the drop cycle
        console.log('[Game] Card generation resumed');
      }
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.stop();

    // Remove recipe memory event listeners
    if (this.recipeMemoryListeners) {
      this.recipeMemoryListeners.forEach((data) => {
        const { element, event, handler } = data;
        element.removeEventListener(event, handler);
      });
      this.recipeMemoryListeners.clear();
    }

    // Destroy managers
    if (this.inputMgr) this.inputMgr.destroy();
    if (this.levelMgr) this.levelMgr.destroy();
    if (this.timerMgr) this.timerMgr.destroy();
    if (this.audioMgr) this.audioMgr.destroy();
    if (this.cardDropMgr) this.cardDropMgr.destroy();
    if (this.dragMgr) this.dragMgr.destroy();
    if (this.slotMgr) this.slotMgr.destroy();
    if (this.reactionMgr) this.reactionMgr.destroy();
    if (this.uiMgr) this.uiMgr.destroy();
    if (this.specialCardMgr) this.specialCardMgr.destroy();
    if (this.particleSystem) this.particleSystem.destroy();
    if (this.recipeMemory) this.recipeMemory.destroy();
    if (this.particlePersonality) this.particlePersonality.destroy();
    if (this.reversibilitySystem) this.reversibilitySystem.destroy();
    if (this.swipeDetector) this.swipeDetector.destroy();
    if (this.zipperAnimation) this.zipperAnimation.destroy();
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.ChemistryLabGame = ChemistryLabGame;
}
