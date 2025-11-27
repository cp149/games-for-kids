/**
 * IIDGenerator - Interface for ID generation
 * Allows testing with deterministic IDs and production with timestamp-based IDs
 */
export class IIDGenerator {
  /**
   * Generate a unique ID with given prefix
   * @param {string} prefix - Prefix for the ID
   * @returns {string} Generated unique ID
   */
  generateId(prefix) {
    throw new Error('generateId() must be implemented by subclass');
  }
}
