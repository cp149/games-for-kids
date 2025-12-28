/**
 * SleepAnimation - Manages sleeping animation with floating zzz emoji
 */

class SleepAnimation {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.zEmojis = [];
    this.spawnInterval = 800; // milliseconds between z spawns
    this.lastSpawnTime = 0;
    this.isActive = true;
  }

  /**
   * Update animation
   * @param {number} deltaTime - Delta time in seconds
   */
  update(deltaTime) {
    if (!this.isActive) return;

    const now = performance.now();

    // Spawn new Z emoji
    if (now - this.lastSpawnTime > this.spawnInterval) {
      this.spawnZEmoji();
      this.lastSpawnTime = now;
    }

    // Update existing Z emojis
    this.zEmojis.forEach(z => {
      z.age += deltaTime;
      z.y -= z.speed * deltaTime; // Float upward
      z.opacity = Math.max(0, 1 - z.age / z.lifetime); // Fade out
    });

    // Remove dead emojis
    this.zEmojis = this.zEmojis.filter(z => z.age < z.lifetime);
  }

  /**
   * Spawn a new Z emoji
   */
  spawnZEmoji() {
    this.zEmojis.push({
      x: this.x + (Math.random() - 0.5) * 20, // Slight random offset
      y: this.y - 40, // Start above the card
      speed: 15, // pixels per second (slow float)
      opacity: 1,
      age: 0,
      lifetime: 2000 / 1000, // 2 seconds in seconds
      emoji: '💤'
    });
  }

  /**
   * Render animation
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    if (!this.isActive) return;

    ctx.save();

    this.zEmojis.forEach(z => {
      ctx.globalAlpha = z.opacity;
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(z.emoji, z.x, z.y);
    });

    ctx.restore();
  }

  /**
   * Update position (when card/slot moves)
   * @param {number} x - New x position
   * @param {number} y - New y position
   */
  updatePosition(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * Stop animation
   */
  stop() {
    this.isActive = false;
    this.zEmojis = [];
  }

  /**
   * Start animation
   */
  start() {
    this.isActive = true;
    this.lastSpawnTime = performance.now();
  }

  /**
   * Clean up
   */
  destroy() {
    this.stop();
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.SleepAnimation = SleepAnimation;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SleepAnimation };
}
