import { IHTTPClient } from '../interfaces/IHTTPClient.js';

/**
 * FetchHTTPClient - Production implementation using Fetch API
 */
export class FetchHTTPClient extends IHTTPClient {
  /**
   * Fetch a resource
   * @param {string} url - Resource URL
   * @param {Object} [options] - Fetch options
   * @returns {Promise<Response>}
   */
  async fetch(url, options) {
    return window.fetch(url, options);
  }

  /**
   * Fetch and parse JSON
   * @param {string} url - Resource URL
   * @param {Object} [options] - Fetch options
   * @returns {Promise<any>}
   */
  async fetchJSON(url, options) {
    const response = await this.fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  /**
   * Fetch and parse array buffer
   * @param {string} url - Resource URL
   * @param {Object} [options] - Fetch options
   * @returns {Promise<ArrayBuffer>}
   */
  async fetchArrayBuffer(url, options) {
    const response = await this.fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.arrayBuffer();
  }
}
