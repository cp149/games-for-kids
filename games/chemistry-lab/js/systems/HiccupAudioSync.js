/**
 * Hiccup Audio Sync - Accelerating beep sound synchronized with hiccup animation
 * Implements variable playback rate and interval for escalating tension
 */

class HiccupAudioSync {
  constructor(audioManager) {
    this.audioManager = audioManager;
    this.isActive = false;
    this.intervalId = null;
    this.startTime = null;
    this.fuseTime = 5000;
    this.warningTime = 3000; // Start beeping 3 seconds before explosion
    this.baseInterval = 500; // Initial beep every 0.5s
    this.minInterval = 100; // Fastest beep interval

    // Audio state
    this.currentPlaybackRate = 1.0;
  }

  /**
   * Start beeping sequence
   * @param {number} fuseTime - Total time until explosion (ms)
   */
  start(fuseTime) {
    if (this.isActive) return;

    this.fuseTime = fuseTime;
    this.startTime = Date.now();
    this.isActive = true;

    // Start beep loop
    this.scheduleNextBeep();
  }

  /**
   * Schedule next beep based on remaining time
   */
  scheduleNextBeep() {
    if (!this.isActive) return;

    const elapsed = Date.now() - this.startTime;
    const timeRemaining = this.fuseTime - elapsed;

    // Only beep in warning phase (last 3 seconds)
    if (timeRemaining <= this.warningTime && timeRemaining > 0) {
      // Calculate progress through warning phase
      const warningProgress = 1 - (timeRemaining / this.warningTime);

      // Playback rate: 1.0 → 2.5 (pitch increases)
      this.currentPlaybackRate = 1.0 + warningProgress * 1.5;

      // Play beep
      this.playBeep(this.currentPlaybackRate);

      // Calculate next interval (accelerating)
      const nextInterval = this.baseInterval * (1 - warningProgress * 0.8);
      const clampedInterval = Math.max(this.minInterval, nextInterval);

      // Schedule next beep
      this.intervalId = setTimeout(() => {
        this.scheduleNextBeep();
      }, clampedInterval);
    } else if (timeRemaining > this.warningTime) {
      // Not in warning phase yet, check again in 100ms
      this.intervalId = setTimeout(() => {
        this.scheduleNextBeep();
      }, 100);
    } else {
      // Time's up, stop
      this.stop();
    }
  }

  /**
   * Play beep sound with variable playback rate
   * @param {number} playbackRate - Speed/pitch multiplier (1.0 = normal)
   */
  playBeep(playbackRate) {
    if (!this.audioManager || !this.audioManager.isSoundEnabled()) return;

    // Create audio element for beep
    // Note: Using a simple approach since Web Audio API buffer requires async loading
    const beep = new Audio('assets/sounds/beep.mp3');
    beep.playbackRate = playbackRate;
    beep.volume = 0.4;

    // Play with error handling
    beep.play().catch(err => {
      // Silently fail - audio file may not exist yet
    });
  }

  /**
   * Stop beeping
   */
  stop() {
    this.isActive = false;

    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Get current playback rate
   */
  getPlaybackRate() {
    return this.currentPlaybackRate;
  }

  /**
   * Check if currently beeping
   */
  isBeeping() {
    return this.isActive;
  }

  /**
   * Clean up
   */
  destroy() {
    this.stop();
    this.audioManager = null;
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.HiccupAudioSync = HiccupAudioSync;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HiccupAudioSync };
}
