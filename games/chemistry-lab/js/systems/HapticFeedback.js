/**
 * HapticFeedback - Vibration feedback for touch devices
 * Gracefully degrades on non-touch devices
 */
class HapticFeedback {
  /**
   * Check if haptic feedback is supported
   */
  static isSupported() {
    return 'vibrate' in navigator;
  }

  /**
   * Light feedback (50ms) - for subtle interactions
   */
  static light() {
    if (this.isSupported()) {
      navigator.vibrate(50);
    }
  }

  /**
   * Medium feedback (100ms) - for standard interactions
   */
  static medium() {
    if (this.isSupported()) {
      navigator.vibrate(100);
    }
  }

  /**
   * Heavy feedback (200ms) - for impactful events
   */
  static heavy() {
    if (this.isSupported()) {
      navigator.vibrate(200);
    }
  }

  /**
   * Custom pattern feedback
   * @param {number[]} pattern - Array of vibration durations [vibrate, pause, vibrate, ...]
   */
  static pattern(pattern) {
    if (this.isSupported()) {
      navigator.vibrate(pattern);
    }
  }

  /**
   * Stop any ongoing vibration
   */
  static stop() {
    if (this.isSupported()) {
      navigator.vibrate(0);
    }
  }

  // ===== Game-specific feedback patterns =====

  /**
   * Card pickup feedback
   */
  static onPickupCard() {
    this.light();
  }

  /**
   * Card drop feedback
   */
  static onDropCard() {
    this.medium();
  }

  /**
   * Reaction success feedback
   */
  static onReactionSuccess() {
    // Pattern: short-short-short-long
    this.pattern([50, 50, 50, 50, 50, 50, 100]);
  }

  /**
   * Explosion feedback
   */
  static onExplosion() {
    this.heavy();
  }

  /**
   * Level complete feedback
   */
  static onLevelComplete() {
    // Pattern: ascending rhythm
    this.pattern([100, 100, 150, 100, 200]);
  }

  /**
   * Error/invalid action feedback
   */
  static onError() {
    // Pattern: double tap
    this.pattern([80, 100, 80]);
  }

  /**
   * Button press feedback
   */
  static onButtonPress() {
    this.light();
  }

  /**
   * Toggle feedback (on/off)
   */
  static onToggle() {
    // Pattern: quick double tap
    this.pattern([30, 50, 30]);
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.HapticFeedback = HapticFeedback;
}

// Export for Node.js tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HapticFeedback;
}
