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
  }

  async init() {
    // Make renderer, game, and settings globally accessible
    window.gameRenderer = this.renderer;
    window.gameInstance = this;
    window.gameSettings = this.settingsManager;

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

    // Hide loading screen and start
    setTimeout(() => {
      this.uiManager.hideLoadingScreen();

      // Show tutorial for first time
      if (!this.uiManager.isTutorialComplete()) {
        this.uiManager.showTutorial();
      } else {
        this.gameState.loadLevel(0);
        // Start music after user has interacted
        this.musicManager.play();
      }
    }, 2000);
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
      onLoadRandom: (difficulty) => {
        this.uiManager.hideDifficulty();
        this.gameState.loadRandomLevel(difficulty);
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
      // Wait for fireworks before showing overlay
      setTimeout(() => {
        this.uiManager.showSuccess();
      }, 2000);
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

    // Update (pass timestamp for animations)
    this.gameState.update(deltaTime, timestamp);
    this.renderer.updateParticles();

    // Throttle UI updates to 10fps (100ms) - sufficient for stats display
    if (timestamp - this.lastUIUpdate >= 100) {
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
    // Stop game loop
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

    // Remove resize listener
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }

    // Clear global references
    window.gameRenderer = null;
    window.gameInstance = null;
    window.gameSettings = null;
  }
}

// Initialize game when DOM is ready
const initHandler = () => {
  const game = new Game();
  game.init();

  // Remove listener after initialization
  document.removeEventListener('DOMContentLoaded', initHandler);
};

document.addEventListener('DOMContentLoaded', initHandler);

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  if (window.gameInstance) {
    window.gameInstance.destroy();
  }
});

export default Game;
