/**
 * Performance Monitor - Universal Component
 * Wraps stats.js for easy integration across all games
 *
 * Features:
 * - FPS (frames per second)
 * - MS (milliseconds per frame)
 * - MB (memory usage in megabytes)
 * - Auto-enable in development environment
 * - Clean resource management
 *
 * Usage:
 *   import { PerformanceMonitor } from '../lib/performance-monitor.js';
 *
 *   const perfMonitor = new PerformanceMonitor();
 *   perfMonitor.init();
 *
 *   // In game loop
 *   perfMonitor.begin();
 *   // ... game logic
 *   perfMonitor.end();
 *
 *   // Cleanup
 *   perfMonitor.destroy();
 */

export class PerformanceMonitor {
  constructor(options = {}) {
    this.options = {
      // Auto-enable in development (localhost/127.0.0.1)
      autoEnable: options.autoEnable !== undefined ? options.autoEnable : true,

      // Position (top-right by default)
      position: options.position || 'top-right',
      topOffset: options.topOffset || 10,
      rightOffset: options.rightOffset || 10,
      leftOffset: options.leftOffset || 10,
      bottomOffset: options.bottomOffset || 10,

      // Which panels to show
      showFPS: options.showFPS !== undefined ? options.showFPS : true,
      showMS: options.showMS !== undefined ? options.showMS : true,
      showMB: options.showMB !== undefined ? options.showMB : true,

      // Panel spacing
      panelSpacing: options.panelSpacing || 90, // 80px width + 10px gap

      // Logger (optional)
      logger: options.logger || console
    };

    this.stats = {
      fps: null,
      ms: null,
      mb: null
    };

    this.enabled = false;
  }

  /**
   * Initialize performance monitoring
   * @returns {boolean} - true if enabled, false otherwise
   */
  init() {
    // Check if should enable
    const isDevelopment = this.options.autoEnable && (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === ''
    );

    if (!isDevelopment) {
      this.options.logger.info('Performance monitor disabled (production mode)');
      return false;
    }

    // Check if Stats is available
    if (!window.Stats) {
      this.options.logger.warn('Stats.js not loaded. Include stats.min.js before initializing.');
      return false;
    }

    this.enabled = true;
    this._createPanels();

    this.options.logger.info('Performance monitor enabled (FPS + MS + MB)');
    return true;
  }

  /**
   * Create stats panels
   * @private
   */
  _createPanels() {
    let panelIndex = 0;

    // FPS Panel
    if (this.options.showFPS) {
      this.stats.fps = new window.Stats();
      this.stats.fps.showPanel(0);
      this._positionPanel(this.stats.fps.dom, panelIndex++);
      document.body.appendChild(this.stats.fps.dom);
    }

    // MS Panel
    if (this.options.showMS) {
      this.stats.ms = new window.Stats();
      this.stats.ms.showPanel(1);
      this._positionPanel(this.stats.ms.dom, panelIndex++);
      document.body.appendChild(this.stats.ms.dom);
    }

    // MB Panel
    if (this.options.showMB) {
      this.stats.mb = new window.Stats();
      this.stats.mb.showPanel(2);
      this._positionPanel(this.stats.mb.dom, panelIndex++);
      document.body.appendChild(this.stats.mb.dom);
    }
  }

  /**
   * Position panel based on configuration
   * @private
   */
  _positionPanel(dom, index) {
    dom.style.position = 'absolute';
    dom.setAttribute('aria-hidden', 'true'); // Dev tool, hide from accessibility tree

    const offset = index * this.options.panelSpacing;

    switch (this.options.position) {
      case 'top-right':
        dom.style.top = this.options.topOffset + 'px';
        dom.style.right = (this.options.rightOffset + offset) + 'px';
        dom.style.left = 'auto';
        dom.style.bottom = 'auto';
        break;

      case 'top-left':
        dom.style.top = this.options.topOffset + 'px';
        dom.style.left = (this.options.leftOffset + offset) + 'px';
        dom.style.right = 'auto';
        dom.style.bottom = 'auto';
        break;

      case 'bottom-right':
        dom.style.bottom = this.options.bottomOffset + 'px';
        dom.style.right = (this.options.rightOffset + offset) + 'px';
        dom.style.left = 'auto';
        dom.style.top = 'auto';
        break;

      case 'bottom-left':
        dom.style.bottom = this.options.bottomOffset + 'px';
        dom.style.left = (this.options.leftOffset + offset) + 'px';
        dom.style.right = 'auto';
        dom.style.top = 'auto';
        break;

      default:
        // Default to top-right
        dom.style.top = this.options.topOffset + 'px';
        dom.style.right = (this.options.rightOffset + offset) + 'px';
        dom.style.left = 'auto';
        dom.style.bottom = 'auto';
    }
  }

  /**
   * Begin performance measurement (call at start of frame)
   */
  begin() {
    if (!this.enabled) return;

    this.stats.fps?.begin();
    this.stats.ms?.begin();
    this.stats.mb?.begin();
  }

  /**
   * End performance measurement (call at end of frame)
   */
  end() {
    if (!this.enabled) return;

    this.stats.fps?.end();
    this.stats.ms?.end();
    this.stats.mb?.end();
  }

  /**
   * Update performance stats (alias for begin/end cycle)
   * Use this if you prefer single call per frame
   */
  update() {
    if (!this.enabled) return;

    this.stats.fps?.update();
    this.stats.ms?.update();
    this.stats.mb?.update();
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (!this.enabled) return;

    if (this.stats.fps) {
      document.body.removeChild(this.stats.fps.dom);
      this.stats.fps = null;
    }

    if (this.stats.ms) {
      document.body.removeChild(this.stats.ms.dom);
      this.stats.ms = null;
    }

    if (this.stats.mb) {
      document.body.removeChild(this.stats.mb.dom);
      this.stats.mb = null;
    }

    this.enabled = false;
    this.options.logger.info('Performance monitor destroyed');
  }

  /**
   * Check if monitoring is enabled
   * @returns {boolean}
   */
  isEnabled() {
    return this.enabled;
  }
}

/**
 * Create and initialize a performance monitor with default settings
 * @param {Object} options - Configuration options
 * @returns {PerformanceMonitor}
 */
export function createPerformanceMonitor(options = {}) {
  const monitor = new PerformanceMonitor(options);
  monitor.init();
  return monitor;
}

export default PerformanceMonitor;

// Browser global for non-module usage
if (typeof window !== 'undefined') {
  window.PerformanceMonitor = PerformanceMonitor;
  window.createPerformanceMonitor = createPerformanceMonitor;
}
