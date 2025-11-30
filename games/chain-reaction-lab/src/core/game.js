/**
 * Main Game Class (Refactored)
 * Orchestrates managers and game loop
 */

import i18n from '../utils/i18n.js';
import { AnimationManager } from '../utils/animation.js';
import { Renderer } from './renderer.js';
import { GameStateManager } from '../managers/game-state-manager.js';
import { UIManager } from '../managers/ui-manager.js';
import { InputManager } from '../managers/input-manager.js';
import { SettingsManager } from '../managers/settings-manager.js';
import { MusicManager } from '../managers/music-manager.js';
import { VISUAL_CONSTANTS } from '../config/visual-constants.js';
import logger from '../utils/logger.js';

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.renderer = new Renderer(this.canvas);
    this.animManager = new AnimationManager();

    // Initialize managers
    this.settingsManager = new SettingsManager();
    this.musicManager = new MusicManager(this.settingsManager);
    this.uiManager = new UIManager();
    this.gameState = null; // Created after settings loaded
    this.inputManager = null; // Created in setupInput()

    this.lastFrameTime = 0;
    this.frameId = null;
    this.isRunning = false; // Game loop running state
    this.resizeHandler = null; // Store resize handler reference
    this.lastUIUpdate = 0; // Throttle UI updates

    // Frame-based delays (no setTimeout)
    this.initDelayTimer = 0;
    this.initDelayTarget = 2000; // ms
    this.initComplete = false;

    this.winOverlayTimer = 0;
    this.winOverlayPending = false;
    this.winOverlayData = null;

    // Memory leak prevention
    this.isDestroyed = false; // Prevent callbacks after destroy
  }

  async init() {
    // Encapsulate in single namespace to avoid global pollution
    window.ChainReactionLab = {
      renderer: this.renderer,
      game: this,
      settings: this.settingsManager
    };

    // Load settings
    this.settingsManager.load();
    this.settingsManager.syncUI();

    // Initialize game state with settings
    this.gameState = new GameStateManager(this.canvas, this.renderer, this.settingsManager);

    // Setup state manager callbacks
    this.gameState.onLevelLoaded = (info) => this.handleLevelLoaded(info);
    this.gameState.onWin = (data) => this.handleWin(data);

    // Setup input manager with callbacks
    this.setupInput();

    // Resize canvas with stored handler reference
    this.resizeHandler = () => this.renderer.resize();
    this.renderer.resize();
    window.addEventListener('resize', this.resizeHandler);

    // Initialize i18n
    i18n.updateUI();

    // Start game loop - initialization delay will be handled in gameLoop()
    this.startGameLoop();
  }

  setupInput() {
    this.inputManager = new InputManager(this.canvas, {
      // Canvas interactions
      onCanvasClick: (x, y) => {
        const button = this.gameState.getButtonAt(x, y);
        if (button) {
          this.gameState.clickButton(button);
          this.uiManager.updateStats(this.gameState.moves, this.gameState.getElapsedTime());
        }
      },
      onGetButtonAt: (x, y) => this.gameState.getButtonAt(x, y),

      // Level controls
      onRestart: () => {
        this.uiManager.hideSuccess();
        this.gameState.restartLevel();
      },
      onNextLevel: () => {
        this.uiManager.hideSuccess();
        this.gameState.nextLevel();
      },
      onRestartGame: () => this.gameState.loadLevel(0),
      onLoadRandom: async (difficulty) => {
        this.uiManager.hideDifficulty();

        // Show loading indicator
        this.uiManager.showLoadingIndicator();

        // Allow UI to update before heavy computation (using RAF instead of setTimeout)
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

        // Generate level (may take 200-800ms)
        this.gameState.loadRandomLevel(difficulty);

        // Hide loading indicator
        this.uiManager.hideLoadingIndicator();
      },

      // UI panels
      onShowHint: () => this.uiManager.showHint(),
      onHideHint: () => this.uiManager.hideHint(),
      onShowSettings: () => this.uiManager.showSettings(),
      onHideSettings: () => this.uiManager.hideSettings(),
      onShowDifficulty: () => this.uiManager.showDifficulty(),
      onHideDifficulty: () => this.uiManager.hideDifficulty(),
      onHideGameComplete: () => this.uiManager.hideGameComplete(),

      // Settings
      onSettingChange: (key, value) => {
        this.settingsManager.update(key, value);
        // Update music when music setting changes
        if (key === 'music') {
          this.musicManager.updateFromSettings();
        }
      },

      // Tutorial
      onTutorialNext: () => {
        const isComplete = this.uiManager.nextTutorialStep();
        if (isComplete) {
          this.uiManager.hideTutorial();
          this.gameState.loadLevel(0);
          // Start music after tutorial (user has interacted)
          this.musicManager.play();
        }
      }
    });

    this.inputManager.setupEventListeners();
  }

  handleLevelLoaded(info) {
    this.uiManager.updateLevelInfo(info.badge, info.title, info.description);
    this.uiManager.updateStats(0, 0);
    this.renderer.resize();

    // Start game loop if not running
    this.startGameLoop();
  }

  handleWin(data) {
    if (data.gameComplete) {
      this.uiManager.showGameComplete();
    } else {
      this.uiManager.updateSuccessOverlay(data.moves, data.time);
      // Queue success overlay with frame-based delay
      this.winOverlayPending = true;
      this.winOverlayTimer = 0;
    }
  }

  checkWinCondition() {
    if (this.gameState) {
      this.gameState.checkWinCondition();
    }
  }

  startGameLoop() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastFrameTime = performance.now();
      this.frameId = requestAnimationFrame((t) => this.gameLoop(t));
    }
  }

  stopGameLoop() {
    this.isRunning = false;
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  gameLoop(timestamp = 0) {
    if (!this.isRunning) return; // Check running state

    const deltaTime = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;

    // Handle initialization delay (replaces setTimeout)
    if (!this.initComplete) {
      this.initDelayTimer += deltaTime;

      if (this.initDelayTimer >= this.initDelayTarget) {
        this.initComplete = true;
        this.uiManager.hideLoadingScreen();

        // Show tutorial for first time
        if (!this.uiManager.isTutorialComplete()) {
          this.uiManager.showTutorial();
        } else {
          this.gameState.loadLevel(0);
          // Start music after user has interacted
          this.musicManager.play();
        }
      }
    }

    // Handle win overlay delay (replaces setTimeout)
    if (this.winOverlayPending) {
      this.winOverlayTimer += deltaTime;

      if (this.winOverlayTimer >= VISUAL_CONSTANTS.WIN_OVERLAY_DELAY_MS) {
        this.winOverlayPending = false;
        this.winOverlayTimer = 0;
        this.uiManager.showSuccess();
      }
    }

    // Update (pass timestamp for animations)
    this.gameState.update(deltaTime, timestamp);
    this.renderer.updateParticles();

    // Throttle UI updates to 10fps - sufficient for stats display
    if (timestamp - this.lastUIUpdate >= VISUAL_CONSTANTS.STATS_UPDATE_INTERVAL_MS) {
      this.uiManager.updateStats(this.gameState.moves, this.gameState.getElapsedTime());
      this.lastUIUpdate = timestamp;
    }

    // Render (pass timestamp for animations)
    this.renderer.render({
      level: this.gameState.currentLevelInstance,
      showInitialHint: this.gameState.showInitialHint
    }, timestamp);

    // Continue loop only if running
    if (this.isRunning) {
      this.frameId = requestAnimationFrame((t) => this.gameLoop(t));
    }
  }

  /**
   * Clean up all resources
   */
  destroy() {
    // Prevent callbacks after destroy
    this.isDestroyed = true;

    // Stop game loop (frame-based delays will stop automatically)
    this.stopGameLoop();

    // Clean up managers
    if (this.musicManager) {
      this.musicManager.destroy();
    }
    if (this.inputManager) {
      this.inputManager.destroy();
    }
    if (this.gameState) {
      this.gameState.destroy();
    }
    if (this.animManager) {
      this.animManager.cancelAll();
    }
    if (this.renderer) {
      this.renderer.destroy();
    }

    // Remove resize listener
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }

    // Remove global event listeners
    if (window.ChainReactionLab?.globalHandlers) {
      window.removeEventListener('beforeunload', window.ChainReactionLab.globalHandlers.beforeUnload);
      window.removeEventListener('error', window.ChainReactionLab.globalHandlers.error);
    }

    // Clear global references
    window.ChainReactionLab = null;
  }
}

// Initialize game when DOM is ready
const initHandler = () => {
  const game = new Game();
  game.init();

  // Remove listener after initialization
  document.removeEventListener('DOMContentLoaded', initHandler);
};

// Store global event handlers for cleanup
const beforeUnloadHandler = () => {
  if (window.ChainReactionLab?.game) {
    window.ChainReactionLab.game.destroy();
  }
};

const errorHandler = (event) => {
  logger.error('Uncaught error, performing cleanup:', event.error);
  if (window.ChainReactionLab?.game && !window.ChainReactionLab.game.isDestroyed) {
    try {
      window.ChainReactionLab.game.destroy();
    } catch (cleanupError) {
      logger.error('Error during cleanup:', cleanupError);
    }
  }
};

document.addEventListener('DOMContentLoaded', initHandler);
window.addEventListener('beforeunload', beforeUnloadHandler);
window.addEventListener('error', errorHandler);

// Store references for cleanup
window.ChainReactionLab = window.ChainReactionLab || {};
window.ChainReactionLab.globalHandlers = {
  beforeUnload: beforeUnloadHandler,
  error: errorHandler
};

export default Game;
