/**
 * MagicSpoon - Catalyst tool that flies back to rack
 * Implements Quadratic Bezier curve animation
 */

class MagicSpoon {
  constructor(x, y, rackPosition) {
    this.x = x;
    this.y = y;
    this.rackPosition = rackPosition;
    this.isFlying = false;
    this.flyStartTime = 0;
    this.flyDuration = 800; // milliseconds
    this.startPosition = { x: 0, y: 0 };
    this.controlPoint = { x: 0, y: 0 };
    this.scale = 1.0;
    this.rotation = 0;
  }

  /**
   * Start flying back to rack with Bezier curve
   * @param {Object} startPos - Starting position {x, y}
   * @param {Object} endPos - End position {x, y}
   */
  flyBackToRack(startPos, endPos) {
    this.isFlying = true;
    this.flyStartTime = performance.now();
    this.startPosition = { ...startPos };

    // Calculate Bezier control point (arc upward)
    const midX = (startPos.x + endPos.x) / 2;
    const midY = (startPos.y + endPos.y) / 2;
    this.controlPoint = {
      x: midX,
      y: midY - 100 // Arc upward by 100px
    };

    this.rackPosition = { ...endPos };
  }

  /**
   * Update flying animation
   * @param {number} currentTime - Current timestamp
   * @returns {boolean} - True if still flying
   */
  update(currentTime) {
    if (!this.isFlying) return false;

    const elapsed = currentTime - this.flyStartTime;
    const t = Math.min(elapsed / this.flyDuration, 1); // 0-1 progress

    if (t >= 1) {
      // Animation complete
      this.x = this.rackPosition.x;
      this.y = this.rackPosition.y;
      this.isFlying = false;
      this.scale = 1.0;
      this.rotation = 0;
      return false;
    }

    // Quadratic Bezier curve formula
    // B(t) = (1-t)² * P0 + 2(1-t)t * P1 + t² * P2
    const oneMinusT = 1 - t;
    const term1 = Math.pow(oneMinusT, 2);
    const term2 = 2 * oneMinusT * t;
    const term3 = Math.pow(t, 2);

    this.x = term1 * this.startPosition.x +
             term2 * this.controlPoint.x +
             term3 * this.rackPosition.x;

    this.y = term1 * this.startPosition.y +
             term2 * this.controlPoint.y +
             term3 * this.rackPosition.y;

    // Add rotation for "whoosh" effect
    this.rotation = t * Math.PI * 2; // One full rotation during flight

    // Scale slightly smaller during flight
    this.scale = 1.0 - (Math.sin(t * Math.PI) * 0.2); // 1.0 -> 0.8 -> 1.0

    return true; // Still flying
  }

  /**
   * Render the spoon
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.isFlying) {
      ctx.rotate(this.rotation);
      ctx.scale(this.scale, this.scale);
    }

    // Draw spoon emoji
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🥄', 0, 0);

    ctx.restore();
  }

  /**
   * Get render data for external rendering
   * @returns {Object} - Render data {x, y, emoji, scale, rotation}
   */
  getRenderData() {
    return {
      x: this.x,
      y: this.y,
      emoji: '🥄',
      scale: this.scale,
      rotation: this.rotation,
      isFlying: this.isFlying
    };
  }

  /**
   * Check if position is inside spoon bounds
   * @param {number} px - X position
   * @param {number} py - Y position
   * @returns {boolean} - True if inside bounds
   */
  containsPoint(px, py) {
    const radius = 30; // Hit radius for touch-friendly interaction
    const dx = px - this.x;
    const dy = py - this.y;
    return Math.sqrt(dx * dx + dy * dy) < radius;
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.isFlying = false;
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.MagicSpoon = MagicSpoon;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MagicSpoon };
}
