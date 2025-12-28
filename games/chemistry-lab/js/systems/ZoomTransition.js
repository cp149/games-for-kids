/**
 * ZoomTransition - Smooth camera zoom for micro-view demonstrations
 * Handles scale transition and viewport management
 */
class ZoomTransition {
  constructor(canvas, config) {
    this.canvas = canvas;
    this.config = config;

    // Zoom state
    this.currentScale = 1.0;
    this.targetScale = 1.0;
    this.isZooming = false;

    // Animation properties
    this.zoomDuration = 1000; // ms
    this.zoomProgress = 0;
    this.zoomEasing = 'ease-in-out';

    // Focus point (where to zoom into)
    this.focusX = config.CANVAS.CENTER_X;
    this.focusY = config.CANVAS.CENTER_Y;

    // Callbacks
    this.onZoomComplete = null;
    this.onZoomStart = null;
  }

  /**
   * Start zoom transition
   * @param {number} targetScale - Target scale (1.0 = normal, 3.0 = 3x zoom)
   * @param {number} focusX - X coordinate to focus on
   * @param {number} focusY - Y coordinate to focus on
   * @param {number} duration - Animation duration in ms
   */
  zoomTo(targetScale, focusX, focusY, duration = 1000) {
    this.targetScale = targetScale;
    this.focusX = focusX;
    this.focusY = focusY;
    this.zoomDuration = duration;
    this.zoomProgress = 0;
    this.isZooming = true;

    if (this.onZoomStart) {
      this.onZoomStart(this.currentScale, targetScale);
    }
  }

  /**
   * Zoom into micro view (3x)
   */
  zoomIn(focusX, focusY, duration = 1000) {
    this.zoomTo(3.0, focusX, focusY, duration);
  }

  /**
   * Zoom out to normal view (1x)
   */
  zoomOut(duration = 1000) {
    this.zoomTo(1.0, this.focusX, this.focusY, duration);
  }

  /**
   * Update zoom animation
   */
  update(dt) {
    if (!this.isZooming) return;

    this.zoomProgress += dt * 1000; // Convert to ms

    if (this.zoomProgress >= this.zoomDuration) {
      // Zoom complete
      this.currentScale = this.targetScale;
      this.zoomProgress = this.zoomDuration;
      this.isZooming = false;

      if (this.onZoomComplete) {
        this.onZoomComplete(this.currentScale);
      }
      return;
    }

    // Interpolate scale with easing
    const t = this.zoomProgress / this.zoomDuration;
    const easedT = this.easeInOutCubic(t);
    this.currentScale = this.lerp(
      this.currentScale,
      this.targetScale,
      easedT
    );
  }

  /**
   * Apply zoom transformation to canvas context
   */
  applyTransform(ctx) {
    if (this.currentScale === 1.0) return;

    // Save context state
    ctx.save();

    // Translate to focus point
    ctx.translate(this.focusX, this.focusY);

    // Apply scale
    ctx.scale(this.currentScale, this.currentScale);

    // Translate back
    ctx.translate(-this.focusX, -this.focusY);
  }

  /**
   * Restore canvas context after zoom
   */
  restoreTransform(ctx) {
    if (this.currentScale === 1.0) return;
    ctx.restore();
  }

  /**
   * Get current zoom level
   */
  getScale() {
    return this.currentScale;
  }

  /**
   * Check if currently zooming
   */
  isActive() {
    return this.isZooming;
  }

  /**
   * Check if in micro view
   */
  isInMicroView() {
    return this.currentScale > 1.5;
  }

  /**
   * Linear interpolation
   */
  lerp(start, end, t) {
    return start + (end - start) * t;
  }

  /**
   * Ease-in-out cubic easing function
   */
  easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /**
   * Get viewport bounds in world space
   */
  getViewportBounds() {
    const canvasWidth = this.config.CANVAS.WIDTH;
    const canvasHeight = this.config.CANVAS.HEIGHT;

    // Calculate viewport in world coordinates
    const viewportWidth = canvasWidth / this.currentScale;
    const viewportHeight = canvasHeight / this.currentScale;

    return {
      left: this.focusX - viewportWidth / 2,
      right: this.focusX + viewportWidth / 2,
      top: this.focusY - viewportHeight / 2,
      bottom: this.focusY + viewportHeight / 2,
      width: viewportWidth,
      height: viewportHeight
    };
  }

  /**
   * Convert screen coordinates to world coordinates
   */
  screenToWorld(screenX, screenY) {
    const bounds = this.getViewportBounds();
    const canvasWidth = this.config.CANVAS.WIDTH;
    const canvasHeight = this.config.CANVAS.HEIGHT;

    return {
      x: bounds.left + (screenX / canvasWidth) * bounds.width,
      y: bounds.top + (screenY / canvasHeight) * bounds.height
    };
  }

  /**
   * Reset zoom to normal
   */
  reset() {
    this.currentScale = 1.0;
    this.targetScale = 1.0;
    this.isZooming = false;
    this.zoomProgress = 0;
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.onZoomComplete = null;
    this.onZoomStart = null;
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.ZoomTransition = ZoomTransition;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ZoomTransition };
}
