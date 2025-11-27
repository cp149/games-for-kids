/**
 * IHTTPClient - Interface for HTTP requests
 * Allows testing network operations without real requests
 */
export class IHTTPClient {
  /**
   * Fetch a resource
   * @param {string} url - Resource URL
   * @param {Object} [options] - Fetch options
   * @returns {Promise<Response>}
   */
  async fetch(url, options) {
    throw new Error('fetch() must be implemented by subclass');
  }

  /**
   * Fetch and parse JSON
   * @param {string} url - Resource URL
   * @param {Object} [options] - Fetch options
   * @returns {Promise<any>}
   */
  async fetchJSON(url, options) {
    throw new Error('fetchJSON() must be implemented by subclass');
  }

  /**
   * Fetch and parse array buffer
   * @param {string} url - Resource URL
   * @param {Object} [options] - Fetch options
   * @returns {Promise<ArrayBuffer>}
   */
  async fetchArrayBuffer(url, options) {
    throw new Error('fetchArrayBuffer() must be implemented by subclass');
  }
}
