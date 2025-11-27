import { IIDGenerator } from '../interfaces/IIDGenerator.js';

/**
 * TimestampIDGenerator - Production implementation using timestamps
 * Generates unique IDs using timestamps for production use
 */
export class TimestampIDGenerator extends IIDGenerator {
  /**
   * Generate ID using timestamp
   * @param {string} prefix - Prefix for the ID
   * @returns {string} Generated ID with timestamp
   */
  generateId(prefix) {
    return `${prefix}_${Date.now()}`;
  }
}
