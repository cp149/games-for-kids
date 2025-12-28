/**
 * ElasticPopAnimation - Elastic easing for "game feel"
 * Creates satisfying bounce effect when cards are placed
 */
class ElasticPopAnimation {
  constructor(duration = 300) {
    this.duration = duration; // milliseconds
    this.progress = 0;
    this.isActive = true;
  }

  /**
   * Elastic ease-out function
   * Creates overshoot effect: 0.8 → 1.2 → 1.0
   */
  easeOutElastic(t) {
    const p = 0.3; // Period
    const amplitude = 1;
    const s = p / 4;

    if (t === 0) return 0;
    if (t === 1) return 1;

    return (
      amplitude *
      Math.pow(2, -10 * t) *
      Math.sin(((t - s) * (2 * Math.PI)) / p) +
      1
    );
  }

  /**
   * Update animation progress
   * @param {number} dt - Delta time in seconds
   * @returns {boolean} - true if animation is still active
   */
  update(dt) {
    if (!this.isActive) return false;

    this.progress += dt / (this.duration / 1000);

    if (this.progress >= 1) {
      this.progress = 1;
      this.isActive = false;
    }

    return this.isActive;
  }

  /**
   * Get current scale value
   * @returns {number} - Scale multiplier (0.8 to 1.2)
   */
  getScale() {
    if (this.progress >= 1) return 1;

    const elasticValue = this.easeOutElastic(this.progress);
    // Map 0-1 to 0.8-1.2 range
    return 0.8 + elasticValue * 0.4;
  }

  /**
   * Render with elastic scaling
   */
  render(ctx, renderCallback, x, y) {
    if (!this.isActive && this.progress >= 1) {
      // Animation complete - render normally
      renderCallback(ctx, 1.0);
      return;
    }

    const scale = this.getScale();

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.translate(-x, -y);

    renderCallback(ctx, scale);

    ctx.restore();
  }

  /**
   * Reset animation
   */
  reset() {
    this.progress = 0;
    this.isActive = true;
  }

  /**
   * Check if animation is complete
   */
  isComplete() {
    return !this.isActive && this.progress >= 1;
  }

  /**
   * Clean up
   */
  destroy() {
    this.isActive = false;
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.ElasticPopAnimation = ElasticPopAnimation;
}

// Export for Node.js tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ElasticPopAnimation;
}
