/**
 * Logger Utility
 * Centralized logging system with environment-aware filtering
 */

export class Logger {
  constructor() {
    this.isDevelopment = this.detectEnvironment();
    this.minLevel = this.isDevelopment ? 'debug' : 'warn';
    this.levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
  }

  /**
   * Detect if running in development environment
   * @returns {boolean} True if development
   */
  detectEnvironment() {
    // Node.js environment (tests)
    if (typeof window === 'undefined') {
      return true; // Default to development mode for tests
    }

    // Check for common development indicators
    const isLocalhost = window.location.hostname === 'localhost' ||
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname === '';

    const isFileProtocol = window.location.protocol === 'file:';

    return isLocalhost || isFileProtocol;
  }

  /**
   * Check if log level should be displayed
   * @param {string} level - Log level
   * @returns {boolean} True if should log
   */
  shouldLog(level) {
    return this.levels[level] >= this.levels[this.minLevel];
  }

  /**
   * Log debug message (development only)
   * @param {...any} args - Arguments to log
   */
  debug(...args) {
    if (this.shouldLog('debug')) {
      console.log('[DEBUG]', ...args);
    }
  }

  /**
   * Log info message
   * @param {...any} args - Arguments to log
   */
  info(...args) {
    if (this.shouldLog('info')) {
      console.log('[INFO]', ...args);
    }
  }

  /**
   * Log warning message
   * @param {...any} args - Arguments to log
   */
  warn(...args) {
    if (this.shouldLog('warn')) {
      console.warn('[WARN]', ...args);
    }
  }

  /**
   * Log error message (always logged)
   * @param {...any} args - Arguments to log
   */
  error(...args) {
    if (this.shouldLog('error')) {
      console.error('[ERROR]', ...args);
    }
  }

  /**
   * Group related logs
   * @param {string} label - Group label
   */
  group(label) {
    if (this.isDevelopment) {
      console.group(label);
    }
  }

  /**
   * End log group
   */
  groupEnd() {
    if (this.isDevelopment) {
      console.groupEnd();
    }
  }

  /**
   * Set minimum log level
   * @param {string} level - Minimum level (debug, info, warn, error)
   */
  setLevel(level) {
    if (this.levels[level] !== undefined) {
      this.minLevel = level;
    }
  }
}

// Create singleton instance
const logger = new Logger();

export default logger;
