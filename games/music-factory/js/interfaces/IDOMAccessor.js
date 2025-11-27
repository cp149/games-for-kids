/**
 * IDOMAccessor - Interface for DOM operations
 * Allows testing UI components without real DOM
 */
export class IDOMAccessor {
  /**
   * Query selector
   * @param {string} selector - CSS selector
   * @returns {Element|null}
   */
  querySelector(selector) {
    throw new Error('querySelector() must be implemented by subclass');
  }

  /**
   * Query selector all
   * @param {string} selector - CSS selector
   * @returns {NodeList|Array}
   */
  querySelectorAll(selector) {
    throw new Error('querySelectorAll() must be implemented by subclass');
  }

  /**
   * Get element by ID
   * @param {string} id - Element ID
   * @returns {Element|null}
   */
  getElementById(id) {
    throw new Error('getElementById() must be implemented by subclass');
  }

  /**
   * Create element
   * @param {string} tagName - Tag name
   * @returns {Element}
   */
  createElement(tagName) {
    throw new Error('createElement() must be implemented by subclass');
  }

  /**
   * Add event listener
   * @param {Element} element - Target element
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   */
  addEventListener(element, event, handler) {
    throw new Error('addEventListener() must be implemented by subclass');
  }

  /**
   * Remove event listener
   * @param {Element} element - Target element
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   */
  removeEventListener(element, event, handler) {
    throw new Error('removeEventListener() must be implemented by subclass');
  }

  /**
   * Set element attribute
   * @param {Element} element - Target element
   * @param {string} name - Attribute name
   * @param {string} value - Attribute value
   */
  setAttribute(element, name, value) {
    throw new Error('setAttribute() must be implemented by subclass');
  }

  /**
   * Get element attribute
   * @param {Element} element - Target element
   * @param {string} name - Attribute name
   * @returns {string|null}
   */
  getAttribute(element, name) {
    throw new Error('getAttribute() must be implemented by subclass');
  }
}
