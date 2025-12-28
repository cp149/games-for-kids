/**
 * WakeUpAnimation - Manages wake-up animation with alarm and bounce
 */

class WakeUpAnimation {
  constructor(x, y, targetScale = 1.0) {
    this.x = x;
    this.y = y;
    this.targetScale = targetScale;
    this.duration = 500; // milliseconds
    this.startTime = performance.now();
    this.isComplete = false;

    // Animation phases
    this.phases = [
      { scale: 0.8, duration: 0.15 }, // Squash
      { scale: 1.2, duration: 0.35 }, // Bounce up
      { scale: 1.0, duration: 0.5 }   // Settle
    ];

    this.currentPhase = 0;
    this.phaseStartTime = this.startTime;
  }

  /**
   * Get current scale based on animation progress
   * @returns {number} - Current scale value
   */
  getCurrentScale() {
    if (this.isComplete) return this.targetScale;

    const elapsed = performance.now() - this.phaseStartTime;
    const phase = this.phases[this.currentPhase];
    const phaseDuration = phase.duration * this.duration;

    if (elapsed >= phaseDuration) {
      // Move to next phase
      this.currentPhase++;
      this.phaseStartTime = performance.now();

      if (this.currentPhase >= this.phases.length) {
        this.isComplete = true;
        return this.targetScale;
      }

      return this.phases[this.currentPhase - 1].scale * this.targetScale;
    }

    // Interpolate within current phase
    const t = elapsed / phaseDuration;
    const prevScale = this.currentPhase > 0
      ? this.phases[this.currentPhase - 1].scale
      : 1.0;
    const currentScale = phase.scale;

    // Ease-out interpolation
    const eased = 1 - Math.pow(1 - t, 3);
    return (prevScale + (currentScale - prevScale) * eased) * this.targetScale;
  }

  /**
   * Render alarm icon (only during first half of animation)
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    if (this.isComplete) return;

    const elapsed = performance.now() - this.startTime;
    const showAlarm = elapsed < this.duration * 0.4;

    if (showAlarm) {
      ctx.save();

      // Flash alarm icon
      const flash = Math.sin((elapsed / 100) * Math.PI) * 0.3 + 0.7;
      ctx.globalAlpha = flash;

      ctx.font = '32px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⏰', this.x, this.y - 50);

      ctx.restore();
    }
  }

  /**
   * Update position
   * @param {number} x - New x position
   * @param {number} y - New y position
   */
  updatePosition(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * Check if animation is complete
   * @returns {boolean}
   */
  isDone() {
    return this.isComplete;
  }

  /**
   * Clean up
   */
  destroy() {
    this.isComplete = true;
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.WakeUpAnimation = WakeUpAnimation;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WakeUpAnimation };
}
