import { AudioEngine } from '../audio/AudioEngine.js';
import { BlockLibrary } from './BlockLibrary.js';
import { Timeline } from './Timeline.js';
import { AudioVisualizer } from '../ui/AudioVisualizer.js';

/**
 * GameEngine - Main game controller
 */
export class GameEngine {
  constructor() {
    this.audioEngine = new AudioEngine();
    this.blockLibrary = new BlockLibrary();
    this.timeline = new Timeline();
    this.visualizer = null;

    this.isLooping = false;
    this.isReady = false;
    this.playbackInterval = null;
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

    // Initialize visualizer
    this.visualizer = new AudioVisualizer(this.audioEngine);
    this.visualizer.initialize();

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
      clearTimeout(this.playbackInterval);
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
      clearTimeout(this.playbackInterval);
      this.playbackInterval = null;
    }
  }

  /**
   * Resume playback
   */
  resume() {
    const blocks = this.timeline.getAllPlacedBlocks();
    this.audioEngine.resumePlayback(blocks);

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
      clearTimeout(this.playbackInterval);
    }

    const duration = this.timeline.getTotalDuration();
    const durationMs = this.audioEngine.beatsToSeconds(duration) * 1000;

    this.playbackInterval = setTimeout(() => {
      this.play();
    }, durationMs);
  }

  /**
   * Schedule automatic stop at end
   */
  scheduleStop() {
    if (this.playbackInterval) {
      clearTimeout(this.playbackInterval);
    }

    const duration = this.timeline.getTotalDuration();
    const durationMs = this.audioEngine.beatsToSeconds(duration) * 1000;

    this.playbackInterval = setTimeout(() => {
      this.stop();
    }, durationMs);
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
   * Save composition to localStorage
   * @param {string} slotName
   */
  saveComposition(slotName = 'autosave') {
    const state = {
      timeline: this.timeline.exportState(),
      tempo: this.audioEngine.tempo,
      savedAt: new Date().toISOString()
    };

    localStorage.setItem(`musicFactory_${slotName}`, JSON.stringify(state));
  }

  /**
   * Load composition from localStorage
   * @param {string} slotName
   * @returns {boolean}
   */
  loadComposition(slotName = 'autosave') {
    const saved = localStorage.getItem(`musicFactory_${slotName}`);

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
}
