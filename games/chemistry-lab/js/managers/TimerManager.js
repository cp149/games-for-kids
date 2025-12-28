/**
 * Timer Manager - Handles game timer and time tracking
 */

class TimerManager {
  constructor(config) {
    this.config = config;
    this.currentTime = null;
    this.timerInterval = null;
    this.isPaused = false;

    // Callbacks
    this.onTimeUpdate = null;
    this.onTimeExpired = null;
  }

  /**
   * Start timer with initial time
   */
  start(initialTime) {
    if (initialTime === null || initialTime === undefined) {
      this.currentTime = null;
      return;
    }

    this.currentTime = initialTime;
    this.isPaused = false;

    // Clear existing interval
    this.stop();

    // Start new interval
    this.timerInterval = setInterval(() => {
      if (!this.isPaused) {
        this.tick();
      }
    }, 1000);

    // Initial update
    if (this.onTimeUpdate) {
      this.onTimeUpdate(this.currentTime);
    }
  }

  /**
   * Timer tick (called every second)
   */
  tick() {
    if (this.currentTime === null) return;

    this.currentTime -= 1;

    // Update callback
    if (this.onTimeUpdate) {
      this.onTimeUpdate(this.currentTime);
    }

    // Check expiration
    if (this.currentTime <= 0) {
      this.stop();
      if (this.onTimeExpired) {
        this.onTimeExpired();
      }
    }
  }

  /**
   * Stop timer
   */
  stop() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  /**
   * Pause timer
   */
  pause() {
    this.isPaused = true;
  }

  /**
   * Resume timer
   */
  resume() {
    this.isPaused = false;
  }

  /**
   * Get current time
   */
  getCurrentTime() {
    return this.currentTime;
  }

  /**
   * Format time for display (MM:SS)
   */
  formatTime(seconds) {
    if (seconds === null || seconds === undefined) {
      return '--';
    }

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Check if timer is active
   */
  isActive() {
    return this.currentTime !== null && this.timerInterval !== null;
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.stop();
    this.onTimeUpdate = null;
    this.onTimeExpired = null;
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.TimerManager = TimerManager;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TimerManager };
}
