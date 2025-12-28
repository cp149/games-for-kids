/**
 * DragRenderer - Render dragged items above finger with offset
 * Prevents finger from blocking the view on touch devices
 */
class DragRenderer {
  constructor(config) {
    this.config = config;
    this.offsetY = -60; // Render 60px above finger
    this.shadowOpacity = 0.3;
    this.shadowOffsetY = 10;
  }

  /**
   * Render dragged item with finger offset
   */
  render(ctx, item, fingerPos) {
    if (!item || !fingerPos) return;

    const renderX = fingerPos.x;
    const renderY = fingerPos.y + this.offsetY;

    // Draw shadow at finger position (spatial awareness)
    this.renderShadow(ctx, fingerPos);

    // Draw item above finger
    this.renderItem(ctx, item, renderX, renderY);
  }

  /**
   * Render shadow at finger position
   */
  renderShadow(ctx, fingerPos) {
    ctx.save();
    ctx.globalAlpha = this.shadowOpacity;
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.ellipse(
      fingerPos.x,
      fingerPos.y + this.shadowOffsetY,
      30,
      10,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();
  }

  /**
   * Render item at offset position
   */
  renderItem(ctx, item, x, y) {
    ctx.save();

    // Scale slightly larger when dragging (visual feedback)
    const scale = 1.1;
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.translate(-x, -y);

    // Render the item (assuming item has render method)
    if (item.render) {
      item.render(ctx, x, y);
    } else if (item.emoji) {
      // Fallback: render emoji
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.emoji, x, y);
    }

    ctx.restore();
  }

  /**
   * Check if touch device
   */
  static isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  /**
   * Get optimal offset based on device
   */
  static getOptimalOffset() {
    return this.isTouchDevice() ? -60 : -20;
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.config = null;
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.DragRenderer = DragRenderer;
}

// Export for Node.js tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DragRenderer;
}
