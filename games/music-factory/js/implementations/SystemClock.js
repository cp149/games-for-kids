import { IClock } from '../interfaces/IClock.js';

/**
 * SystemClock - Production implementation using native timers
 */
export class SystemClock extends IClock {
  /**
   * Get current timestamp from system
   * @returns {number}
   */
  now() {
    return Date.now();
  }

  /**
   * Set a timeout using native setTimeout
   * @param {Function} callback
   * @param {number} delay
   * @returns {number}
   */
  setTimeout(callback, delay) {
    return window.setTimeout(callback, delay);
  }

  /**
   * Clear a timeout using native clearTimeout
   * @param {number} timerId
   */
  clearTimeout(timerId) {
    window.clearTimeout(timerId);
  }
}
