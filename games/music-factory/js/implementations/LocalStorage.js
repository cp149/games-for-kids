import { IStorage } from '../interfaces/IStorage.js';

/**
 * LocalStorage - Production implementation using browser localStorage
 */
export class LocalStorage extends IStorage {
  /**
   * Get item from localStorage
   * @param {string} key - Storage key
   * @returns {string|null}
   */
  getItem(key) {
    return window.localStorage.getItem(key);
  }

  /**
   * Set item in localStorage
   * @param {string} key - Storage key
   * @param {string} value - Value to store
   */
  setItem(key, value) {
    window.localStorage.setItem(key, value);
  }

  /**
   * Remove item from localStorage
   * @param {string} key - Storage key
   */
  removeItem(key) {
    window.localStorage.removeItem(key);
  }

  /**
   * Clear all items from localStorage
   */
  clear() {
    window.localStorage.clear();
  }

  /**
   * Get number of items in localStorage
   * @returns {number}
   */
  get length() {
    return window.localStorage.length;
  }

  /**
   * Get key at index
   * @param {number} index - Index
   * @returns {string|null}
   */
  key(index) {
    return window.localStorage.key(index);
  }
}
