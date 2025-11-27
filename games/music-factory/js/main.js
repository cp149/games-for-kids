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
    this.eventListeners = []; // Track event listeners for cleanup
  }

  /**
   * Initialize the application
   */
  async initialize() {
    // Show loading
    this.showLoading();

    try {
      // Create game engine with playback end callback
      this.gameEngine = new GameEngine({
        onPlaybackEnd: () => this.handlePlaybackEnd()
      });

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
   * Setup control buttons with tracked event listeners
   */
  setupControls() {
    // Helper to add and track event listeners
    const addListener = (id, event, handler) => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener(event, handler);
        this.eventListeners.push({ element, event, handler });
      }
    };

    // Control buttons
    addListener('play-btn', 'click', () => this.handlePlay());
    addListener('stop-btn', 'click', () => this.handleStop());
    addListener('clear-btn', 'click', () => this.handleClear());
    addListener('random-btn', 'click', () => this.handleRandom());
    addListener('save-btn', 'click', () => this.handleSave());
    addListener('load-btn', 'click', () => this.handleLoad());

    addListener('loop-toggle', 'change', (e) => {
      this.gameEngine.setLooping(e.target.checked);
    });

    addListener('volume-slider', 'input', (e) => {
      const volume = e.target.value / 100;
      this.gameEngine.setVolume(volume);
    });
  }

  /**
   * Handle play button
   */
  async handlePlay() {
    if (!this.isInitialized) return;

    if (this.gameEngine.isPlaying()) {
      // Currently playing -> pause
      this.gameEngine.pause();
      this.updatePlayButton('play');

      // Pause playhead animation (keep visible at current position)
      if (this.timelineUI) {
        this.timelineUI.pausePlayheadAnimation();
      }
    } else if (this.gameEngine.audioEngine.isPaused()) {
      // Paused -> resume from paused position
      // Note: gameEngine.resume() handles AudioContext resume internally
      await this.gameEngine.resume();
      this.updatePlayButton('pause');

      if (this.timelineUI) {
        this.timelineUI.startPlayheadAnimation();
      }
    } else {
      // Stopped -> start from beginning
      // Ensure AudioContext is resumed before playing
      await this.gameEngine.audioEngine.resume();
      this.gameEngine.play();
      this.updatePlayButton('pause');

      if (this.timelineUI) {
        this.timelineUI.startPlayheadAnimation();
      }
    }
  }

  /**
   * Handle stop button
   */
  handleStop() {
    this.gameEngine.stop();
    this.updatePlayButton('play');

    // Stop playhead animation and hide playhead
    if (this.timelineUI) {
      this.timelineUI.stopPlayheadAnimation();
    }
  }

  /**
   * Handle automatic playback end (called when music finishes naturally)
   */
  handlePlaybackEnd() {
    this.updatePlayButton('play');

    // Stop playhead animation and hide playhead
    if (this.timelineUI) {
      this.timelineUI.stopPlayheadAnimation();
    }
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
   * Handle random button
   */
  handleRandom() {
    // Stop playback before generating
    if (this.gameEngine.isPlaying()) {
      this.handleStop();
    }

    try {
      const placedCount = this.gameEngine.randomizeComposition({
        minBlocks: 12,
        maxBlocks: 24
      });

      // Force UI update
      this.timelineUI.updateBlocks();
      this.autoSave();

      const duration = this.gameEngine.timeline.getTotalDuration();
      this.showMessage(`🎲 Created ${placedCount} blocks (${duration} beats)!`);
    } catch (error) {
      console.error('Random composition error:', error);
      this.showMessage('Error creating random composition: ' + error.message);
    }
  }

  /**
   * Handle save button
   */
  handleSave() {
    const slotName = prompt('Enter save name:', 'my-composition');

    if (slotName) {
      try {
        this.gameEngine.saveComposition(slotName);
        this.showMessage('Composition saved!');
      } catch (error) {
        this.showMessage('Failed to save: ' + error.message);
      }
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
   * Auto-save to localStorage with error handling
   */
  autoSave() {
    try {
      this.gameEngine.saveComposition('autosave');
    } catch (error) {
      // localStorage may be full or disabled
      console.warn('AutoSave failed:', error);
      // Silent failure for autosave - don't interrupt user workflow
    }
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

  /**
   * Clean up all resources and event listeners
   */
  async cleanup() {
    // Remove all tracked event listeners
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];

    // Cleanup UI components
    if (this.timelineUI) {
      this.timelineUI.destroy();
    }

    // Cleanup game engine (audio, visualizer)
    if (this.gameEngine) {
      await this.gameEngine.cleanup();
    }

    this.isInitialized = false;
  }
}

// Start the app
const app = new MusicFactoryApp();

// Expose app to window for debugging
window.musicFactoryApp = app;

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  app.initialize();
});

// Cleanup on page unload to prevent memory leaks
window.addEventListener('beforeunload', () => {
  app.cleanup();
});

// Expose test function for debugging
window.testRandom = function() {
  console.log('Testing random composition...');
  if (window.musicFactoryApp && window.musicFactoryApp.gameEngine) {
    const count = window.musicFactoryApp.gameEngine.randomizeComposition({
      minBlocks: 10,
      maxBlocks: 20
    });
    console.log(`Placed ${count} blocks`);
    window.musicFactoryApp.timelineUI.updateBlocks();
    return count;
  } else {
    console.error('App not initialized');
    return 0;
  }
};
