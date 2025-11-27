import { AudioEngine } from '../audio/AudioEngine.js';
import { BlockLibrary } from './BlockLibrary.js';
import { Timeline } from './Timeline.js';
import { AudioVisualizer } from '../ui/AudioVisualizer.js';
import { SystemClock } from '../implementations/SystemClock.js';
import { LocalStorage } from '../implementations/LocalStorage.js';

/**
 * GameEngine - Main game controller
 * Now supports dependency injection for testability
 */
export class GameEngine {
  /**
   * @param {Object} config - Configuration options
   * @param {AudioEngine} config.audioEngine - Audio engine instance (default: new AudioEngine())
   * @param {BlockLibrary} config.blockLibrary - Block library instance (default: new BlockLibrary())
   * @param {Timeline} config.timeline - Timeline instance (default: new Timeline())
   * @param {AudioVisualizer} config.visualizer - Audio visualizer instance (default: created on initialize)
   * @param {IClock} config.clock - Clock for timer operations (default: SystemClock)
   * @param {IStorage} config.storage - Storage for save/load (default: LocalStorage)
   */
  constructor(config = {}) {
    // Dependency injection - allows testing with mocks
    this.audioEngine = config.audioEngine || new AudioEngine();
    this.blockLibrary = config.blockLibrary || new BlockLibrary();
    this.timeline = config.timeline || new Timeline();
    this.visualizer = config.visualizer || null;
    this.clock = config.clock || new SystemClock();
    this.storage = config.storage || new LocalStorage();

    // Internal state
    this.isLooping = false;
    this.isReady = false;
    this.playbackInterval = null;

    // Track if visualizer was provided (don't auto-create if injected)
    this._visualizerProvided = !!config.visualizer;
  }

  /**
   * Initialize the game engine
   */
  async initialize() {
    // Initialize audio (requires user interaction)
    await this.audioEngine.initialize();

    // Initialize block library
    this.blockLibrary.initialize();

    // Load all audio files
    await this.blockLibrary.loadAll(this.audioEngine.audioContext);

    // Initialize visualizer (only if not provided via config)
    if (!this._visualizerProvided) {
      this.visualizer = new AudioVisualizer(this.audioEngine);
      this.visualizer.initialize();
    }

    this.isReady = true;
  }

  /**
   * Start playback
   */
  play() {
    if (!this.isReady) return;

    const blocks = this.timeline.getAllPlacedBlocks();

    if (blocks.length === 0) {
      console.warn('No blocks on timeline');
      return;
    }


    // Start visualization
    if (this.visualizer) {
      this.visualizer.start();
    }

    // Setup connection callback for visualizer
    const connectCallback = (gainNode, category) => {
      if (this.visualizer) {
        this.visualizer.connectToTrack(gainNode, category);
      }
    };

    this.audioEngine.playTimeline(blocks, 0, connectCallback);

    // If looping, schedule next loop
    if (this.isLooping) {
      this.scheduleLoop();
    } else {
      // Schedule stop at end
      this.scheduleStop();
    }
  }

  /**
   * Stop playback
   */
  stop() {
    this.audioEngine.stopPlayback();

    if (this.playbackInterval) {
      this.clock.clearTimeout(this.playbackInterval);
      this.playbackInterval = null;
    }

    // Stop visualization
    if (this.visualizer) {
      this.visualizer.stop();
    }
  }

  /**
   * Pause playback
   */
  pause() {
    const blocks = this.timeline.getAllPlacedBlocks();
    this.audioEngine.pausePlayback();

    if (this.playbackInterval) {
      this.clock.clearTimeout(this.playbackInterval);
      this.playbackInterval = null;
    }
  }

  /**
   * Resume playback from paused position
   */
  async resume() {
    const blocks = this.timeline.getAllPlacedBlocks();

    if (blocks.length === 0) {
      console.warn('No blocks on timeline');
      return;
    }

    // Start visualization
    if (this.visualizer) {
      this.visualizer.start();
    }

    // Setup connection callback for visualizer
    const connectCallback = (gainNode, category) => {
      if (this.visualizer) {
        this.visualizer.connectToTrack(gainNode, category);
      }
    };

    // Resume audio playback with visualizer callback
    await this.audioEngine.resumePlayback(blocks, connectCallback);

    if (this.isLooping) {
      this.scheduleLoop();
    } else {
      this.scheduleStop();
    }
  }

  /**
   * Schedule automatic loop
   */
  scheduleLoop() {
    if (this.playbackInterval) {
      this.clock.clearTimeout(this.playbackInterval);
    }

    const duration = this.timeline.getTotalDuration();

    // Only schedule loop if there's actual content
    if (duration > 0) {
      const durationMs = this.audioEngine.beatsToSeconds(duration) * 1000;

      this.playbackInterval = this.clock.setTimeout(() => {
        this.play();
      }, durationMs);
    }
  }

  /**
   * Schedule automatic stop at end
   */
  scheduleStop() {
    if (this.playbackInterval) {
      this.clock.clearTimeout(this.playbackInterval);
    }

    const duration = this.timeline.getTotalDuration();

    // Only schedule stop if there's actual content
    if (duration > 0) {
      const durationMs = this.audioEngine.beatsToSeconds(duration) * 1000;

      this.playbackInterval = this.clock.setTimeout(() => {
        this.stop();
      }, durationMs);
    }
  }

  /**
   * Toggle looping mode
   * @param {boolean} enabled
   */
  setLooping(enabled) {
    this.isLooping = enabled;
  }

  /**
   * Preview a single block
   * @param {MusicBlock} block
   */
  previewBlock(block) {
    if (!block.isLoaded) return;

    const audioBuffer = block.getAudioSegment(this.audioEngine.audioContext);
    this.audioEngine.playBlockPreview(audioBuffer);
  }

  /**
   * Add block to timeline
   * @param {string} trackName
   * @param {MusicBlock} block
   * @param {number} startBeat
   * @returns {boolean}
   */
  addBlockToTimeline(trackName, block, startBeat) {
    return this.timeline.addBlock(trackName, block.clone(), startBeat);
  }

  /**
   * Remove block from timeline
   * @param {string} trackName
   * @param {string} placedId
   */
  removeBlockFromTimeline(trackName, placedId) {
    this.timeline.removeBlock(trackName, placedId);
  }

  /**
   * Clear timeline
   */
  clearTimeline() {
    this.stop();
    this.timeline.clearAll();
  }

  /**
   * Save composition to storage
   * @param {string} slotName
   * @throws {Error} If storage is unavailable or full
   */
  saveComposition(slotName = 'autosave') {
    const state = {
      timeline: this.timeline.exportState(),
      tempo: this.audioEngine.tempo,
      savedAt: new Date().toISOString()
    };

    try {
      this.storage.setItem(`musicFactory_${slotName}`, JSON.stringify(state));
    } catch (error) {
      // Quota exceeded or storage disabled
      throw new Error(`Failed to save composition: ${error.message}`);
    }
  }

  /**
   * Load composition from storage
   * @param {string} slotName
   * @returns {boolean}
   */
  loadComposition(slotName = 'autosave') {
    const saved = this.storage.getItem(`musicFactory_${slotName}`);

    if (!saved) {
      return false;
    }

    try {
      const state = JSON.parse(saved);

      this.stop();
      this.timeline.importState(state.timeline, this.blockLibrary);
      this.audioEngine.setTempo(state.tempo || 120);

      return true;
    } catch (error) {
      console.error('Failed to load composition:', error);
      return false;
    }
  }

  /**
   * Set master volume
   * @param {number} volume - 0.0 to 1.0
   */
  setVolume(volume) {
    this.audioEngine.setMasterVolume(volume);
  }

  /**
   * Set tempo
   * @param {number} bpm
   */
  setTempo(bpm) {
    this.audioEngine.setTempo(bpm);
  }

  /**
   * Get current playback position
   * @returns {number} Current beat position
   */
  getCurrentBeat() {
    return this.audioEngine.getCurrentBeat();
  }

  /**
   * Get if audio is playing
   * @returns {boolean}
   */
  isPlaying() {
    return this.audioEngine.isPlaying;
  }

  /**
   * Generate a random composition using available blocks
   * @param {Object} options - Randomization options
   * @param {number} options.minBlocks - Minimum number of blocks (default: 8)
   * @param {number} options.maxBlocks - Maximum number of blocks (default: 16)
   * @param {string[]} options.tracks - Tracks to use (default: all tracks)
   * @param {number} options.maxAttempts - Max placement attempts per block (default: 20)
   * @returns {number} Number of blocks successfully placed
   */
  randomizeComposition(options = {}) {
    const {
      minBlocks = 8,
      maxBlocks = 16,
      tracks = ['drums', 'bass', 'melody', 'fx'],
      maxAttempts = 20
    } = options;

    // Clear existing timeline
    this.clearTimeline();

    // Get all available blocks (only loaded ones)
    const allBlocks = this.blockLibrary.getAllBlocks();
    const availableBlocks = allBlocks.filter(block => block.isLoaded);

    if (availableBlocks.length === 0) {
      console.warn('No loaded blocks available for randomization');
      return 0;
    }

    // Determine how many blocks to place
    const targetBlockCount = Math.floor(
      Math.random() * (maxBlocks - minBlocks + 1)
    ) + minBlocks;

    let placedCount = 0;

    // Strategy: Fill tracks progressively to create denser composition
    // Use a weighted random approach - prefer earlier positions
    for (let i = 0; i < targetBlockCount; i++) {
      // Pick random block
      const randomBlock = availableBlocks[
        Math.floor(Math.random() * availableBlocks.length)
      ];

      // Verify block is ready
      if (!randomBlock.isLoaded || !randomBlock.audioBuffer) {
        continue;
      }

      // Pick random track
      const randomTrack = tracks[
        Math.floor(Math.random() * tracks.length)
      ];

      // Try to find next available position on this track
      let placed = false;

      // First, try to find earliest available slot on the track
      const trackBlocks = this.timeline.getTrackBlocks(randomTrack);
      let candidatePositions = [];

      // Add position 0 if available
      if (trackBlocks.length === 0 || trackBlocks[0].startBeat >= randomBlock.duration) {
        candidatePositions.push(0);
      }

      // Find gaps between existing blocks
      for (let j = 0; j < trackBlocks.length - 1; j++) {
        const gapStart = trackBlocks[j].endBeat;
        const gapEnd = trackBlocks[j + 1].startBeat;
        const gapSize = gapEnd - gapStart;

        if (gapSize >= randomBlock.duration) {
          // Align to grid
          const alignedStart = Math.ceil(gapStart / this.timeline.beatGrid) * this.timeline.beatGrid;
          if (alignedStart + randomBlock.duration <= gapEnd) {
            candidatePositions.push(alignedStart);
          }
        }
      }

      // Add position after last block
      if (trackBlocks.length > 0) {
        const lastBlock = trackBlocks[trackBlocks.length - 1];
        const nextPosition = Math.ceil(lastBlock.endBeat / this.timeline.beatGrid) * this.timeline.beatGrid;
        if (nextPosition + randomBlock.duration <= this.timeline.maxBeats) {
          candidatePositions.push(nextPosition);
        }
      }

      // If we have candidate positions, use one
      if (candidatePositions.length > 0) {
        // Prefer earlier positions (weighted random)
        const weights = candidatePositions.map((_, idx) =>
          Math.pow(0.7, idx) // Exponential decay - earlier positions more likely
        );
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;

        let selectedIndex = 0;
        for (let j = 0; j < weights.length; j++) {
          random -= weights[j];
          if (random <= 0) {
            selectedIndex = j;
            break;
          }
        }

        const position = candidatePositions[selectedIndex];
        if (this.addBlockToTimeline(randomTrack, randomBlock, position)) {
          placed = true;
          placedCount++;
        }
      }

      // Fallback: try random positions if smart placement failed
      if (!placed) {
        for (let attempt = 0; attempt < maxAttempts && !placed; attempt++) {
          const maxPosition = Math.max(0, this.timeline.maxBeats - randomBlock.duration);
          const randomBeat = Math.floor(
            Math.random() * (maxPosition / this.timeline.beatGrid + 1)
          ) * this.timeline.beatGrid;

          if (this.addBlockToTimeline(randomTrack, randomBlock, randomBeat)) {
            placed = true;
            placedCount++;
          }
        }
      }
    }

    return placedCount;
  }

  /**
   * Clean up all resources
   */
  async cleanup() {
    this.stop();

    if (this.visualizer) {
      this.visualizer.destroy();
      this.visualizer = null;
    }

    await this.audioEngine.cleanup();
    this.isReady = false;
  }
}
