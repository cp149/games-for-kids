/**
 * GameLoop - Time-independent physics system
 * Ensures consistent behavior across different framerates
 */
class GameLoop {
  constructor(updateCallback, renderCallback) {
    this.updateCallback = updateCallback;
    this.renderCallback = renderCallback;
    this.lastFrameTime = performance.now();
    this.animationId = null;
    this.isPaused = false;
    this.maxDeltaTime = 0.1; // Maximum 100ms to prevent "death spiral"
  }

  /**
   * Main game loop tick
   */
  tick() {
    if (this.isPaused) {
      this.animationId = requestAnimationFrame(() => this.tick());
      return;
    }

    const currentTime = performance.now();
    const dt = (currentTime - this.lastFrameTime) / 1000; // Convert to seconds
    this.lastFrameTime = currentTime;

    // Limit dt to prevent huge jumps after tab switch or lag
    const safeDt = Math.min(dt, this.maxDeltaTime);

    // Update physics
    if (this.updateCallback) {
      this.updateCallback(safeDt);
    }

    // Render
    if (this.renderCallback) {
      this.renderCallback();
    }

    this.animationId = requestAnimationFrame(() => this.tick());
  }

  /**
   * Start the game loop
   */
  start() {
    this.isPaused = false;
    this.lastFrameTime = performance.now();
    this.tick();
  }

  /**
   * Stop the game loop
   */
  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Pause the game loop
   */
  pause() {
    this.isPaused = true;
  }

  /**
   * Resume the game loop
   */
  resume() {
    this.isPaused = false;
    this.lastFrameTime = performance.now(); // Reset time to prevent huge dt
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.stop();
    this.updateCallback = null;
    this.renderCallback = null;
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.GameLoop = GameLoop;
}

// Export for Node.js tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameLoop;
}
