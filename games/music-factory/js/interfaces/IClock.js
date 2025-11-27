/**
 * IClock - Interface for time-related operations
 * Allows testing with controlled time progression
 */
export class IClock {
  /**
   * Get current timestamp in milliseconds
   * @returns {number}
   */
  now() {
    throw new Error('now() must be implemented by subclass');
  }

  /**
   * Set a timeout to execute callback after delay
   * @param {Function} callback - Function to execute
   * @param {number} delay - Delay in milliseconds
   * @returns {number} Timer ID
   */
  setTimeout(callback, delay) {
    throw new Error('setTimeout() must be implemented by subclass');
  }

  /**
   * Clear a previously set timeout
   * @param {number} timerId - Timer ID to clear
   */
  clearTimeout(timerId) {
    throw new Error('clearTimeout() must be implemented by subclass');
  }
}
