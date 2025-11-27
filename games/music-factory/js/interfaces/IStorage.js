/**
 * IStorage - Interface for persistent storage
 * Allows testing storage operations without real localStorage
 */
export class IStorage {
  /**
   * Get item from storage
   * @param {string} key - Storage key
   * @returns {string|null}
   */
  getItem(key) {
    throw new Error('getItem() must be implemented by subclass');
  }

  /**
   * Set item in storage
   * @param {string} key - Storage key
   * @param {string} value - Value to store
   */
  setItem(key, value) {
    throw new Error('setItem() must be implemented by subclass');
  }

  /**
   * Remove item from storage
   * @param {string} key - Storage key
   */
  removeItem(key) {
    throw new Error('removeItem() must be implemented by subclass');
  }

  /**
   * Clear all items from storage
   */
  clear() {
    throw new Error('clear() must be implemented by subclass');
  }

  /**
   * Get number of items in storage
   * @returns {number}
   */
  get length() {
    throw new Error('length must be implemented by subclass');
  }

  /**
   * Get key at index
   * @param {number} index - Index
   * @returns {string|null}
   */
  key(index) {
    throw new Error('key() must be implemented by subclass');
  }
}
