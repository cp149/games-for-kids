import { IStorage } from '../../js/interfaces/IStorage.js';

/**
 * MockStorage - In-memory storage implementation for testing
 */
export class MockStorage extends IStorage {
  constructor() {
    super();
    this.store = new Map();
  }

  /**
   * Get item from storage
   * @param {string} key - Storage key
   * @returns {string|null}
   */
  getItem(key) {
    return this.store.get(key) || null;
  }

  /**
   * Set item in storage
   * @param {string} key - Storage key
   * @param {string} value - Value to store
   */
  setItem(key, value) {
    this.store.set(key, String(value));
  }

  /**
   * Remove item from storage
   * @param {string} key - Storage key
   */
  removeItem(key) {
    this.store.delete(key);
  }

  /**
   * Clear all items from storage
   */
  clear() {
    this.store.clear();
  }

  /**
   * Get number of items in storage
   * @returns {number}
   */
  get length() {
    return this.store.size;
  }

  /**
   * Get key at index
   * @param {number} index - Index
   * @returns {string|null}
   */
  key(index) {
    const keys = Array.from(this.store.keys());
    return keys[index] || null;
  }

  // Test helpers
  getAllKeys() {
    return Array.from(this.store.keys());
  }

  getAllValues() {
    return Array.from(this.store.values());
  }

  toJSON() {
    return Object.fromEntries(this.store);
  }

  reset() {
    this.clear();
  }
}
