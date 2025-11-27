import { IDOMAccessor } from '../interfaces/IDOMAccessor.js';

/**
 * BrowserDOMAccessor - Production implementation using real DOM
 */
export class BrowserDOMAccessor extends IDOMAccessor {
  /**
   * Query selector
   * @param {string} selector - CSS selector
   * @returns {Element|null}
   */
  querySelector(selector) {
    return document.querySelector(selector);
  }

  /**
   * Query selector all
   * @param {string} selector - CSS selector
   * @returns {NodeList}
   */
  querySelectorAll(selector) {
    return document.querySelectorAll(selector);
  }

  /**
   * Get element by ID
   * @param {string} id - Element ID
   * @returns {Element|null}
   */
  getElementById(id) {
    return document.getElementById(id);
  }

  /**
   * Create element
   * @param {string} tagName - Tag name
   * @returns {Element}
   */
  createElement(tagName) {
    return document.createElement(tagName);
  }

  /**
   * Add event listener
   * @param {Element} element - Target element
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   */
  addEventListener(element, event, handler) {
    element.addEventListener(event, handler);
  }

  /**
   * Remove event listener
   * @param {Element} element - Target element
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   */
  removeEventListener(element, event, handler) {
    element.removeEventListener(event, handler);
  }

  /**
   * Set element attribute
   * @param {Element} element - Target element
   * @param {string} name - Attribute name
   * @param {string} value - Attribute value
   */
  setAttribute(element, name, value) {
    element.setAttribute(name, value);
  }

  /**
   * Get element attribute
   * @param {Element} element - Target element
   * @param {string} name - Attribute name
   * @returns {string|null}
   */
  getAttribute(element, name) {
    return element.getAttribute(name);
  }
}
