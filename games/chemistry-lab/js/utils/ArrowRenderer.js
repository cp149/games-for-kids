/**
 * Arrow Renderer
 * Renders flowing dashed arrows for visual hints
 */

class ArrowRenderer {
  constructor() {
    this.dashOffset = 0;
  }

  /**
   * Update animation state
   * @param {number} dt - Delta time in seconds
   */
  update(dt) {
    // Animate dash offset for flowing effect (50px per second)
    this.dashOffset += 50 * dt;
    if (this.dashOffset > 20) {
      this.dashOffset = 0;
    }
  }

  /**
   * Draw flowing dashed arrow between two positions
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {Object} fromPos - Start position {x, y}
   * @param {Object} toPos - End position {x, y}
   * @param {string} color - Arrow color (default: white with 50% opacity)
   */
  drawFlowingArrow(ctx, fromPos, toPos, color = 'rgba(255, 255, 255, 0.5)') {
    ctx.save();

    // Setup dashed line style
    ctx.setLineDash([10, 10]);
    ctx.lineDashOffset = -this.dashOffset; // Negative for forward flow
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    // Draw arrow line
    ctx.beginPath();
    ctx.moveTo(fromPos.x, fromPos.y);
    ctx.lineTo(toPos.x, toPos.y);
    ctx.stroke();

    // Draw arrow head
    this.drawArrowHead(ctx, fromPos, toPos, color);

    ctx.restore();
  }

  /**
   * Draw arrow head at the end of the line
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {Object} from - Start position
   * @param {Object} to - End position
   * @param {string} color - Arrow color
   */
  drawArrowHead(ctx, from, to, color) {
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const headLength = 15;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(
      to.x - headLength * Math.cos(angle - Math.PI / 6),
      to.y - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      to.x - headLength * Math.cos(angle + Math.PI / 6),
      to.y - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
  }

  /**
   * Clean up resources
   */
  destroy() {
    // Nothing to clean up for this simple class
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.ArrowRenderer = ArrowRenderer;
}
