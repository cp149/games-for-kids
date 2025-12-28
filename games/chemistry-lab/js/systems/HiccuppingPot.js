/**
 * Hiccupping Pot - Variable frequency sine shake animation
 * Implements accelerating shake for dangerous cards (lava)
 */

class HiccuppingPot {
  constructor(card, fuseTime = 5000) {
    this.card = card;
    this.fuseTime = fuseTime;
    this.warningTime = 3000; // Start warning 3 seconds before explosion
    this.startTime = performance.now();
    this.baseX = card.x;
    this.baseY = card.y;
    this.isActive = false;
    this.hasExploded = false;

    // Visual state
    this.currentTintColor = null;
    this.pulseScale = 1.0;

    // Callbacks
    this.onExplosion = null;
  }

  /**
   * Update shake animation
   * @returns {boolean} - True if still active, false if exploded
   */
  update() {
    if (this.hasExploded) return false;

    const elapsed = performance.now() - this.startTime;
    const timeRemaining = this.fuseTime - elapsed;
    const percentageRemaining = timeRemaining / this.fuseTime;

    // Check explosion
    if (timeRemaining <= 0) {
      this.explode();
      return false;
    }

    // Only activate warning in last 3 seconds
    if (timeRemaining <= this.warningTime) {
      this.isActive = true;

      // Calculate shake intensity (accelerating)
      const warningProgress = 1 - (timeRemaining / this.warningTime);
      const frequency = 5 + warningProgress * 20; // 5Hz → 25Hz
      const magnitude = 2 + warningProgress * 10; // 2px → 12px

      // Sine shake on both axes
      const now = Date.now();
      const xOffset = Math.sin(now * frequency * 0.01) * magnitude;
      const yOffset = Math.cos(now * frequency * 0.015) * magnitude;

      this.card.x = this.baseX + xOffset;
      this.card.y = this.baseY + yOffset;

      // Color gradient: Orange (255,165,0) → Red (255,0,0)
      const red = 255;
      const green = Math.floor(165 * (1 - warningProgress));
      this.currentTintColor = `rgb(${red}, ${green}, 0)`;

      // Pulsing glow effect (accelerating)
      const pulseSpeed = 1 + warningProgress * 3; // 1Hz → 4Hz
      this.pulseScale = 1.0 + Math.sin(now * pulseSpeed * 0.01) * 0.15;

      // Update card tint color
      if (this.card.element) {
        this.card.element.style.backgroundColor = this.currentTintColor;
        this.card.element.style.transform = `scale(${this.pulseScale})`;
        this.card.element.style.boxShadow = `0 0 ${10 + warningProgress * 20}px ${this.currentTintColor}`;
      }
    }

    return true;
  }

  /**
   * Trigger explosion
   */
  explode() {
    if (this.hasExploded) return;

    this.hasExploded = true;
    this.isActive = false;

    // Reset position
    this.card.x = this.baseX;
    this.card.y = this.baseY;

    // Trigger callback
    if (this.onExplosion) {
      this.onExplosion(this.card);
    }
  }

  /**
   * Cancel hiccup (card cooled down)
   */
  cancel() {
    this.isActive = false;
    this.hasExploded = true;

    // Reset visuals
    if (this.card.element) {
      this.card.element.style.backgroundColor = '';
      this.card.element.style.transform = '';
      this.card.element.style.boxShadow = '';
    }

    // Reset position
    this.card.x = this.baseX;
    this.card.y = this.baseY;
  }

  /**
   * Get remaining time percentage
   */
  getTimeRemaining() {
    const elapsed = performance.now() - this.startTime;
    return Math.max(0, (this.fuseTime - elapsed) / this.fuseTime);
  }

  /**
   * Check if in warning phase
   */
  isInWarningPhase() {
    const elapsed = performance.now() - this.startTime;
    const timeRemaining = this.fuseTime - elapsed;
    return timeRemaining <= this.warningTime && timeRemaining > 0;
  }

  /**
   * Clean up
   */
  destroy() {
    this.cancel();
    this.card = null;
    this.onExplosion = null;
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.HiccuppingPot = HiccuppingPot;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HiccuppingPot };
}
