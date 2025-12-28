/**
 * Reaction - Visual representation of a chemical reaction
 */

class Reaction {
  constructor(reactionData, x, y, config) {
    this.reactionData = reactionData;
    this.x = x;
    this.y = y;
    this.config = config;

    // Animation state
    this.opacity = 1.0;
    this.scale = 1.0;
    this.lifetime = 0;
    this.maxLifetime = 1000; // 1 second
  }

  /**
   * Update reaction animation
   * @returns {boolean} true if should be removed
   */
  update(deltaTime) {
    this.lifetime += deltaTime;

    // Fade out and scale up
    const progress = this.lifetime / this.maxLifetime;
    this.opacity = 1.0 - progress;
    this.scale = 1.0 + progress * 0.5;

    return this.lifetime >= this.maxLifetime;
  }

  /**
   * Get render data
   */
  getRenderData() {
    return {
      emoji: this.reactionData.emoji,
      x: this.x,
      y: this.y,
      opacity: this.opacity,
      scale: this.scale
    };
  }

  /**
   * Clean up
   */
  destroy() {
    // No resources to clean
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.Reaction = Reaction;
}
