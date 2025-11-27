/**
 * AudioVisualizer - Visual feedback for audio playback
 */
export class AudioVisualizer {
  constructor(audioEngine) {
    this.audioEngine = audioEngine;
    this.analysers = {
      drums: null,
      bass: null,
      melody: null,
      fx: null
    };
    this.dataArrays = {};
    this.visualElements = {};
    this.animationId = null;
    this.connections = {}; // Track connections for cleanup
  }

  /**
   * Initialize visualizers for each track
   */
  initialize() {
    const tracks = ['drums', 'bass', 'melody', 'fx'];

    tracks.forEach(track => {
      // Create analyser for this track
      const analyser = this.audioEngine.audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;

      // IMPORTANT: Do NOT connect analyser to masterGain
      // Analysers are for visualization only, audio routing is:
      // source → gainNode → masterGain → destination
      // Analysers connect via: gainNode → analyser (for data only)

      this.analysers[track] = analyser;
      this.dataArrays[track] = new Uint8Array(analyser.frequencyBinCount);
      this.connections[track] = []; // Initialize connection tracking

      // Find visual element for this track
      this.visualElements[track] = document.querySelector(`.track-visualizer[data-track="${track}"]`);
    });
  }

  /**
   * Connect a block's audio to its track visualizer
   * @param {AudioNode} gainNode - The gainNode for this block
   * @param {string} trackName - Track category (drums, bass, melody, fx)
   */
  connectToTrack(gainNode, trackName) {
    if (this.analysers[trackName]) {
      // Connect gainNode to analyser for visualization data
      // This does NOT affect audio routing (gainNode already connected to masterGain)
      gainNode.connect(this.analysers[trackName]);

      // Track the connection for later cleanup
      if (this.connections[trackName]) {
        this.connections[trackName].push(gainNode);
      }
    }
  }

  /**
   * Clear all track connections (call on stop)
   */
  clearConnections() {
    Object.keys(this.connections).forEach(track => {
      this.connections[track].forEach(source => {
        try {
          source.disconnect(this.analysers[track]);
        } catch (e) {
          // Already disconnected
        }
      });
      this.connections[track] = [];
    });
  }

  /**
   * Start visualization animation
   */
  start() {
    if (this.animationId) return;
    this.animate();
  }

  /**
   * Stop visualization
   */
  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    // Clear all tracked connections
    this.clearConnections();

    // Reset all visualizers
    Object.values(this.visualElements).forEach(el => {
      if (el) el.style.width = '0%';
    });
  }

  /**
   * Completely destroy the visualizer and release all resources
   */
  destroy() {
    this.stop();

    // Disconnect all analysers from masterGain
    Object.values(this.analysers).forEach(analyser => {
      if (analyser) {
        try {
          analyser.disconnect();
        } catch (e) {
          // Already disconnected
        }
      }
    });

    // Clear all references
    this.analysers = {};
    this.dataArrays = {};
    this.visualElements = {};
    this.connections = {};
  }

  /**
   * Animation loop
   */
  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());

    Object.keys(this.analysers).forEach(track => {
      const analyser = this.analysers[track];
      const dataArray = this.dataArrays[track];
      const element = this.visualElements[track];

      if (!analyser || !element) return;

      // Get frequency data
      analyser.getByteFrequencyData(dataArray);

      // Calculate average volume
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      const percentage = (average / 255) * 100;

      // Update visual element
      element.style.width = percentage + '%';

      // Add pulse effect on high volume
      if (percentage > 60) {
        element.classList.add('pulse');
      } else {
        element.classList.remove('pulse');
      }
    });
  }
}
