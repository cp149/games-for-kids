import { IHTTPClient } from '../../js/interfaces/IHTTPClient.js';

/**
 * MockResponse - Simplified Response object for testing
 */
export class MockResponse {
  constructor(body, options = {}) {
    this.body = body;
    this.ok = options.ok !== undefined ? options.ok : true;
    this.status = options.status || (this.ok ? 200 : 404);
    this.statusText = options.statusText || (this.ok ? 'OK' : 'Not Found');
    this.headers = new Map(Object.entries(options.headers || {}));
  }

  async json() {
    if (typeof this.body === 'string') {
      return JSON.parse(this.body);
    }
    return this.body;
  }

  async text() {
    if (typeof this.body === 'string') {
      return this.body;
    }
    return JSON.stringify(this.body);
  }

  async arrayBuffer() {
    if (this.body instanceof ArrayBuffer) {
      return this.body;
    }
    // Convert string to ArrayBuffer for testing
    const encoder = new TextEncoder();
    return encoder.encode(JSON.stringify(this.body)).buffer;
  }
}

/**
 * MockHTTPClient - Mock implementation for testing
 */
export class MockHTTPClient extends IHTTPClient {
  constructor() {
    super();
    this.responses = new Map();
    this.requests = [];
    this.defaultResponse = new MockResponse({ error: 'No mock response configured' }, { ok: false, status: 404 });
  }

  /**
   * Mock a response for a specific URL
   * @param {string} url - URL to mock
   * @param {any} body - Response body
   * @param {Object} [options] - Response options
   */
  mockResponse(url, body, options = {}) {
    this.responses.set(url, new MockResponse(body, options));
  }

  /**
   * Mock an array buffer response
   * @param {string} url - URL to mock
   * @param {ArrayBuffer} arrayBuffer - Array buffer data
   * @param {Object} [options] - Response options
   */
  mockArrayBufferResponse(url, arrayBuffer, options = {}) {
    this.responses.set(url, new MockResponse(arrayBuffer, options));
  }

  /**
   * Mock an error response
   * @param {string} url - URL to mock
   * @param {number} status - HTTP status code
   * @param {string} statusText - Status text
   */
  mockErrorResponse(url, status = 404, statusText = 'Not Found') {
    this.responses.set(url, new MockResponse(
      { error: statusText },
      { ok: false, status, statusText }
    ));
  }

  /**
   * Fetch a resource (mocked)
   * @param {string} url - Resource URL
   * @param {Object} [options] - Fetch options
   * @returns {Promise<MockResponse>}
   */
  async fetch(url, options) {
    // Record request
    this.requests.push({ url, options, timestamp: Date.now() });

    // Return mocked response or default
    const response = this.responses.get(url) || this.defaultResponse;
    return response;
  }

  /**
   * Fetch and parse JSON (mocked)
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
   * Fetch and parse array buffer (mocked)
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

  // Test helpers
  getRequests() {
    return this.requests;
  }

  getLastRequest() {
    return this.requests[this.requests.length - 1] || null;
  }

  clearRequests() {
    this.requests = [];
  }

  clearResponses() {
    this.responses.clear();
  }

  reset() {
    this.clearRequests();
    this.clearResponses();
  }
}
