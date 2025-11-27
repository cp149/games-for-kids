import { IIDGenerator } from '../interfaces/IIDGenerator.js';

/**
 * SequentialIDGenerator - Test implementation using sequential counter
 * Generates deterministic IDs for testing purposes
 */
export class SequentialIDGenerator extends IIDGenerator {
  constructor() {
    super();
    this.counter = 0;
  }

  /**
   * Generate ID using sequential counter
   * @param {string} prefix - Prefix for the ID
   * @returns {string} Generated ID with counter
   */
  generateId(prefix) {
    return `${prefix}_${++this.counter}`;
  }

  /**
   * Reset counter (useful for test isolation)
   */
  reset() {
    this.counter = 0;
  }
}
