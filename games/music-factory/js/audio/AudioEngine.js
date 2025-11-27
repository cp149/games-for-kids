import { WebAudioContextFactory } from '../implementations/WebAudioContextFactory.js';
import { SystemClock } from '../implementations/SystemClock.js';

/**
 * AudioEngine - Manages Web Audio API for music playback
 * Now supports dependency injection for testability
 */
export class AudioEngine {
  /**
   * @param {Object} config - Configuration options
   * @param {IAudioContextFactory} config.audioContextFactory - Factory for creating AudioContext (default: WebAudioContextFactory)
   * @param {IClock} config.clock - Clock for time operations (default: SystemClock)
   * @param {number} config.tempo - Initial tempo in BPM (default: 120)
   */
  constructor(config = {}) {
    // Dependency injection - allows testing with mocks
    this.audioContextFactory = config.audioContextFactory || new WebAudioContextFactory();
    this.clock = config.clock || new SystemClock();

    // Audio context will be created lazily on initialize()
    this.audioContext = null;
    this.masterGain = null;
    this.activeSources = []; // {source, gainNode, cleanup}
    this.isPlaying = false;
    this.startedAt = 0;
    this.pausedAt = 0;
    this.tempo = config.tempo || 120; // BPM
    this.initialized = false;

    // Reusable preview nodes for performance
    this.previewGain = null;
    this.previewSource = null;
  }

  /**
   * Initialize the audio context
   * Must be called after user interaction
   */
  async initialize() {
    if (this.initialized) return;

    // Use injected factory to create AudioContext
    this.audioContext = this.audioContextFactory.createAudioContext();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);
    this.masterGain.gain.value = 0.7; // Default volume

    // Create reusable preview gain node (performance optimization)
    this.previewGain = this.audioContext.createGain();
    this.previewGain.connect(this.masterGain);

    this.initialized = true;
  }

  /**
   * Get beat duration in seconds
   * @returns {number}
   */
  getBeatDuration() {
    return 60 / this.tempo;
  }

  /**
   * Convert beats to seconds
   * @param {number} beats
   * @returns {number}
   */
  beatsToSeconds(beats) {
    return beats * this.getBeatDuration();
  }

  /**
   * Play a single block immediately (for preview)
   * Reuses gain node for better performance
   * @param {AudioBuffer} audioBuffer
   * @param {number} [volume=1.0]
   */
  playBlockPreview(audioBuffer, volume = 1.0) {
    if (!this.initialized) {
      console.error('AudioEngine not initialized');
      return;
    }

    if (!audioBuffer) {
      console.error('No audioBuffer provided');
      return;
    }

    // Stop any currently playing preview
    if (this.previewSource) {
      try {
        this.previewSource.stop();
        this.previewSource.disconnect();
      } catch (e) {
        // Already stopped
      }
    }

    // Create new source but reuse gain node
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;

    // Reuse the persistent preview gain node
    this.previewGain.gain.value = volume;
    source.connect(this.previewGain);

    source.start(0);
    this.previewSource = source;

    // Clean up source after playback (gain node stays connected)
    source.onended = () => {
      try {
        source.disconnect();
      } catch (e) {
        // Already disconnected
      }
      if (this.previewSource === source) {
        this.previewSource = null;
      }
    };
  }

  /**
   * Play multiple blocks on timeline
   * @param {Array} timelineBlocks - Array of {block, trackIndex, startBeat}
   * @param {number} [startFromBeat=0] - Which beat to start from
   * @param {Function} [connectCallback] - Optional callback to connect additional nodes
   */
  playTimeline(timelineBlocks, startFromBeat = 0, connectCallback = null) {
    if (!this.initialized) return;

    this.stopPlayback();

    const currentTime = this.audioContext.currentTime;
    const startOffset = this.beatsToSeconds(startFromBeat);

    this.isPlaying = true;
    this.startedAt = currentTime - startOffset;
    this.pausedAt = 0;

    // Schedule all blocks
    timelineBlocks.forEach(({ block, startBeat }) => {
      const scheduleTime = currentTime + this.beatsToSeconds(startBeat - startFromBeat);

      if (scheduleTime >= currentTime) {
        this.scheduleBlock(block, scheduleTime, connectCallback);
      }
    });
  }

  /**
   * Schedule a single block to play at specific time
   * @param {MusicBlock} block
   * @param {number} when - AudioContext time
   * @param {Function} [connectCallback] - Optional callback to connect additional nodes
   */
  scheduleBlock(block, when, connectCallback = null) {
    if (!block.isLoaded || !block.audioBuffer) return;

    const source = this.audioContext.createBufferSource();
    const audioBuffer = block.getAudioSegment(this.audioContext);

    if (!audioBuffer) return;

    source.buffer = audioBuffer;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = 1.0;

    source.connect(gainNode);

    // Allow external connection (e.g., to visualizer)
    if (connectCallback) {
      connectCallback(gainNode, block.category);
    }

    gainNode.connect(this.masterGain);

    // Create cleanup function for proper resource management
    const sourceEntry = { source, gainNode, cleaned: false, timeoutId: null };

    const cleanup = () => {
      if (sourceEntry.cleaned) return;
      sourceEntry.cleaned = true;

      // Clear safety timeout
      if (sourceEntry.timeoutId) {
        this.clock.clearTimeout(sourceEntry.timeoutId);
        sourceEntry.timeoutId = null;
      }

      const index = this.activeSources.indexOf(sourceEntry);
      if (index > -1) {
        this.activeSources.splice(index, 1);
      }

      // Safely disconnect nodes
      try {
        source.disconnect();
      } catch (e) {
        // Already disconnected
      }

      try {
        gainNode.disconnect();
      } catch (e) {
        // Already disconnected
      }

      // Note: Don't automatically set isPlaying = false here
      // Let the GameEngine control playback state via stop() or scheduleStop()
      // This allows future blocks to continue playing even after current ones finish
    };

    sourceEntry.cleanup = cleanup;
    source.onended = cleanup;

    try {
      source.start(when);
    } catch (error) {
      console.error(`Failed to start audio block:`, error.message);
      cleanup();
      return;
    }

    // Safety timeout: force cleanup if onended doesn't fire
    // Calculate timeout from scheduled start time, not current time
    const duration = source.buffer.duration;
    const now = this.audioContext.currentTime;
    const delayUntilStart = Math.max(0, when - now); // How long until playback starts
    const totalTimeMs = (delayUntilStart + duration * 1.5 + 0.5) * 1000; // Wait for start + 1.5x duration

    sourceEntry.timeoutId = this.clock.setTimeout(() => {
      cleanup();
    }, totalTimeMs);

    this.activeSources.push(sourceEntry);
  }

  /**
   * Stop all playback
   * @param {boolean} [resetPosition=true] - Whether to reset playback position
   */
  stopPlayback(resetPosition = true) {
    // Stop and disconnect all active sources
    this.activeSources.forEach(entry => {
      // Try to stop the source
      try {
        entry.source.stop(0);
      } catch (e) {
        // Already stopped or not started
      }

      // Disconnect to ensure silence even if stop failed
      try {
        entry.source.disconnect();
      } catch (e) {
        // Already disconnected
      }

      try {
        entry.gainNode.disconnect();
      } catch (e) {
        // Already disconnected
      }

      // Clear safety timeout
      if (entry.timeoutId) {
        this.clock.clearTimeout(entry.timeoutId);
        entry.timeoutId = null;
      }

      // Mark as cleaned to prevent onended from running
      entry.cleaned = true;
    });

    this.activeSources = [];
    this.isPlaying = false;
    if (resetPosition) {
      this.pausedAt = 0;
    }
  }

  /**
   * Pause playback
   */
  pausePlayback() {
    if (!this.isPlaying) return;

    this.pausedAt = this.audioContext.currentTime - this.startedAt;
    this.stopPlayback(false); // Don't reset position
  }

  /**
   * Resume playback from paused position
   * @param {Array} timelineBlocks
   * @param {Function} [connectCallback] - Optional callback to connect additional nodes
   */
  async resumePlayback(timelineBlocks, connectCallback = null) {
    if (this.pausedAt === 0) return;

    // Ensure AudioContext is resumed (browser requirement)
    await this.resume();

    const resumeBeat = this.pausedAt / this.getBeatDuration();
    this.playTimeline(timelineBlocks, resumeBeat, connectCallback);
  }

  /**
   * Set master volume
   * @param {number} volume - 0.0 to 1.0
   */
  setMasterVolume(volume) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Set tempo (BPM)
   * @param {number} bpm
   */
  setTempo(bpm) {
    this.tempo = Math.max(60, Math.min(200, bpm));
  }

  /**
   * Get current playback position in beats
   * @returns {number}
   */
  getCurrentBeat() {
    // Return paused position when paused
    if (!this.isPlaying) {
      if (this.pausedAt > 0) {
        return this.pausedAt / this.getBeatDuration();
      }
      return 0;
    }

    const elapsed = this.audioContext.currentTime - this.startedAt;
    return elapsed / this.getBeatDuration();
  }

  /**
   * Resume audio context (for user interaction requirement)
   */
  async resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  /**
   * Check if playback is paused (has a saved position)
   * @returns {boolean}
   */
  isPaused() {
    return this.pausedAt > 0 && !this.isPlaying;
  }

  /**
   * Clean up all audio resources
   * Call this before destroying the app or on page unload
   */
  async cleanup() {
    // Stop all playback first
    this.stopPlayback();

    // Stop any preview playback
    if (this.previewSource) {
      try {
        this.previewSource.stop();
        this.previewSource.disconnect();
      } catch (e) {
        // Already stopped
      }
      this.previewSource = null;
    }

    // Disconnect preview gain
    if (this.previewGain) {
      try {
        this.previewGain.disconnect();
      } catch (e) {
        // Already disconnected
      }
      this.previewGain = null;
    }

    // Disconnect master gain
    if (this.masterGain) {
      try {
        this.masterGain.disconnect();
      } catch (e) {
        // Already disconnected
      }
      this.masterGain = null;
    }

    // Close AudioContext
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        await this.audioContext.close();
      } catch (e) {
        console.warn('Error closing AudioContext:', e);
      }
      this.audioContext = null;
    }

    this.initialized = false;
  }
}
