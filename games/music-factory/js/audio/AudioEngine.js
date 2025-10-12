/**
 * AudioEngine - Manages Web Audio API for music playback
 */
export class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.activeSources = [];
    this.isPlaying = false;
    this.startedAt = 0;
    this.pausedAt = 0;
    this.tempo = 120; // BPM
    this.initialized = false;
  }

  /**
   * Initialize the audio context
   * Must be called after user interaction
   */
  async initialize() {
    if (this.initialized) return;

    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);
    this.masterGain.gain.value = 0.7; // Default volume

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

    console.log('Playing preview, buffer duration:', audioBuffer.duration);

    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(this.masterGain);

    source.start(0);
    console.log('Preview started');

    // Clean up after playback
    source.onended = () => {
      console.log('Preview ended');
      source.disconnect();
      gainNode.disconnect();
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
    source.buffer = block.getAudioSegment(this.audioContext);

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = 1.0;

    source.connect(gainNode);

    // Allow external connection (e.g., to visualizer)
    if (connectCallback) {
      connectCallback(gainNode, block.category);
    }

    gainNode.connect(this.masterGain);

    source.start(when);

    this.activeSources.push(source);

    // Clean up after playback
    source.onended = () => {
      const index = this.activeSources.indexOf(source);
      if (index > -1) {
        this.activeSources.splice(index, 1);
      }
      source.disconnect();
      gainNode.disconnect();

      // If no more sources and was playing, mark as stopped
      if (this.activeSources.length === 0 && this.isPlaying) {
        this.isPlaying = false;
      }
    };
  }

  /**
   * Stop all playback
   */
  stopPlayback() {
    this.activeSources.forEach(source => {
      try {
        source.stop();
        source.disconnect();
      } catch (e) {
        // Already stopped
      }
    });

    this.activeSources = [];
    this.isPlaying = false;
    this.pausedAt = 0;
  }

  /**
   * Pause playback
   */
  pausePlayback() {
    if (!this.isPlaying) return;

    this.pausedAt = this.audioContext.currentTime - this.startedAt;
    this.stopPlayback();
  }

  /**
   * Resume playback
   * @param {Array} timelineBlocks
   */
  resumePlayback(timelineBlocks) {
    if (this.pausedAt === 0) return;

    const resumeBeat = this.pausedAt / this.getBeatDuration();
    this.playTimeline(timelineBlocks, resumeBeat);
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
    if (!this.isPlaying) return 0;

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
}
