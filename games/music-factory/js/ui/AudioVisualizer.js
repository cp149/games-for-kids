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

      this.analysers[track] = analyser;
      this.dataArrays[track] = new Uint8Array(analyser.frequencyBinCount);

      // Find visual element for this track
      this.visualElements[track] = document.querySelector(`.track-visualizer[data-track="${track}"]`);
    });
  }

  /**
   * Connect a block's audio to its track visualizer
   * @param {AudioNode} source - Audio source node
   * @param {string} trackName - Track category (drums, bass, melody, fx)
   */
  connectToTrack(source, trackName) {
    if (this.analysers[trackName]) {
      source.connect(this.analysers[trackName]);
      this.analysers[trackName].connect(this.audioEngine.masterGain);
    }
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

    // Reset all visualizers
    Object.values(this.visualElements).forEach(el => {
      if (el) el.style.width = '0%';
    });
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
