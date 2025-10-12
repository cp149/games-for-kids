import { GameEngine } from './core/GameEngine.js';
import { DragDropHandler } from './ui/DragDropHandler.js';
import { TimelineUI } from './ui/TimelineUI.js';
import { BlockUI } from './ui/BlockUI.js';

/**
 * Main Application
 */
class MusicFactoryApp {
  constructor() {
    this.gameEngine = null;
    this.dragDropHandler = null;
    this.timelineUI = null;
    this.blockUI = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the application
   */
  async initialize() {
    // Show loading
    this.showLoading();

    try {
      // Create game engine
      this.gameEngine = new GameEngine();

      // Initialize drag drop handler
      this.dragDropHandler = new DragDropHandler(this.gameEngine, {
        onBlockPlaced: () => this.handleBlockPlaced(),
        onDropFailed: () => this.handleDropFailed()
      });

      // Initialize UI components
      this.timelineUI = new TimelineUI(
        this.gameEngine,
        this.dragDropHandler
      );

      this.blockUI = new BlockUI(
        this.gameEngine,
        this.dragDropHandler
      );

      // Initialize game engine (loads audio)
      await this.gameEngine.initialize();

      // Setup UI
      this.setupUI();

      // Setup controls
      this.setupControls();

      // Try to load autosave
      this.loadAutosave();

      this.isInitialized = true;
      this.hideLoading();

    } catch (error) {
      console.error('Initialization failed:', error);
      this.showError('Failed to load Music Factory. Please refresh the page.');
    }
  }

  /**
   * Setup UI components
   */
  setupUI() {
    const libraryContainer = document.getElementById('block-library');
    const timelineContainer = document.getElementById('timeline');

    this.blockUI.initialize(libraryContainer);
    this.timelineUI.initialize(timelineContainer);
  }

  /**
   * Setup control buttons
   */
  setupControls() {
    // Play button
    const playBtn = document.getElementById('play-btn');
    playBtn.addEventListener('click', () => this.handlePlay());

    // Stop button
    const stopBtn = document.getElementById('stop-btn');
    stopBtn.addEventListener('click', () => this.handleStop());

    // Clear button
    const clearBtn = document.getElementById('clear-btn');
    clearBtn.addEventListener('click', () => this.handleClear());

    // Save button
    const saveBtn = document.getElementById('save-btn');
    saveBtn.addEventListener('click', () => this.handleSave());

    // Load button
    const loadBtn = document.getElementById('load-btn');
    loadBtn.addEventListener('click', () => this.handleLoad());

    // Loop toggle
    const loopToggle = document.getElementById('loop-toggle');
    loopToggle.addEventListener('change', (e) => {
      this.gameEngine.setLooping(e.target.checked);
    });

    // Volume slider
    const volumeSlider = document.getElementById('volume-slider');
    volumeSlider.addEventListener('input', (e) => {
      const volume = e.target.value / 100;
      this.gameEngine.setVolume(volume);
    });
  }

  /**
   * Handle play button
   */
  handlePlay() {
    if (!this.isInitialized) return;

    if (this.gameEngine.isPlaying()) {
      this.gameEngine.pause();
      this.updatePlayButton('play');
    } else {
      // Resume audio context if needed
      this.gameEngine.audioEngine.resume();

      this.gameEngine.play();
      this.updatePlayButton('pause');
    }
  }

  /**
   * Handle stop button
   */
  handleStop() {
    this.gameEngine.stop();
    this.updatePlayButton('play');
  }

  /**
   * Handle clear button
   */
  handleClear() {
    if (confirm('Clear all blocks from timeline?')) {
      this.gameEngine.clearTimeline();
      this.timelineUI.updateBlocks();
      this.autoSave();
    }
  }

  /**
   * Handle save button
   */
  handleSave() {
    const slotName = prompt('Enter save name:', 'my-composition');

    if (slotName) {
      this.gameEngine.saveComposition(slotName);
      this.showMessage('Composition saved!');
    }
  }

  /**
   * Handle load button
   */
  handleLoad() {
    const slotName = prompt('Enter save name to load:', 'my-composition');

    if (slotName) {
      const success = this.gameEngine.loadComposition(slotName);

      if (success) {
        this.timelineUI.updateBlocks();
        this.showMessage('Composition loaded!');
      } else {
        this.showMessage('Save not found.');
      }
    }
  }

  /**
   * Handle block placed on timeline
   */
  handleBlockPlaced() {
    this.timelineUI.updateBlocks();
    this.autoSave();
  }

  /**
   * Handle drop failed
   */
  handleDropFailed() {
    this.showMessage('Cannot place block here!');
  }

  /**
   * Update play button text
   */
  updatePlayButton(state) {
    const playBtn = document.getElementById('play-btn');

    if (state === 'play') {
      playBtn.textContent = '▶ Play';
    } else {
      playBtn.textContent = '⏸ Pause';
    }
  }

  /**
   * Auto-save to localStorage
   */
  autoSave() {
    this.gameEngine.saveComposition('autosave');
  }

  /**
   * Load autosave if exists
   */
  loadAutosave() {
    const success = this.gameEngine.loadComposition('autosave');

    if (success) {
      this.timelineUI.updateBlocks();
    }
  }

  /**
   * Show loading screen
   */
  showLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
      loading.style.display = 'flex';
    }
  }

  /**
   * Hide loading screen
   */
  hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
      loading.style.display = 'none';
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
    }
  }

  /**
   * Show temporary message
   */
  showMessage(message) {
    const messageDiv = document.getElementById('message');

    if (messageDiv) {
      messageDiv.textContent = message;
      messageDiv.style.display = 'block';

      setTimeout(() => {
        messageDiv.style.display = 'none';
      }, 2000);
    }
  }
}

// Start the app
const app = new MusicFactoryApp();

// Wait for user interaction to initialize (Web Audio API requirement)
document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('start-btn');

  if (startBtn) {
    startBtn.addEventListener('click', async () => {
      startBtn.style.display = 'none';
      await app.initialize();
    });
  }
});
