import { IDOMAccessor } from '../../js/interfaces/IDOMAccessor.js';

/**
 * MockElement - Simplified DOM element for testing
 */
export class MockElement {
  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
    this.id = '';
    this.className = '';
    this.attributes = new Map();
    this.eventListeners = new Map();
    this.children = [];
    this.parentElement = null;
    this.innerHTML = '';
    this.textContent = '';
    this.style = {};
  }

  setAttribute(name, value) {
    this.attributes.set(name, value);
    if (name === 'id') this.id = value;
    if (name === 'class') this.className = value;
  }

  getAttribute(name) {
    return this.attributes.get(name) || null;
  }

  addEventListener(event, handler) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(handler);
  }

  removeEventListener(event, handler) {
    if (this.eventListeners.has(event)) {
      const handlers = this.eventListeners.get(event);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  appendChild(child) {
    this.children.push(child);
    child.parentElement = this;
  }

  removeChild(child) {
    const index = this.children.indexOf(child);
    if (index > -1) {
      this.children.splice(index, 1);
      child.parentElement = null;
    }
  }

  querySelector(selector) {
    // Simple implementation - just check ID and class
    if (selector.startsWith('#')) {
      const id = selector.slice(1);
      if (this.id === id) return this;
      for (const child of this.children) {
        const found = child.querySelector?.(selector);
        if (found) return found;
      }
    } else if (selector.startsWith('.')) {
      const className = selector.slice(1);
      if (this.className.includes(className)) return this;
      for (const child of this.children) {
        const found = child.querySelector?.(selector);
        if (found) return found;
      }
    } else {
      // Tag name
      if (this.tagName === selector.toUpperCase()) return this;
      for (const child of this.children) {
        const found = child.querySelector?.(selector);
        if (found) return found;
      }
    }
    return null;
  }

  querySelectorAll(selector) {
    const results = [];
    if (selector.startsWith('#')) {
      const id = selector.slice(1);
      if (this.id === id) results.push(this);
    } else if (selector.startsWith('.')) {
      const className = selector.slice(1);
      if (this.className.includes(className)) results.push(this);
    } else {
      if (this.tagName === selector.toUpperCase()) results.push(this);
    }
    for (const child of this.children) {
      const childResults = child.querySelectorAll?.(selector) || [];
      results.push(...childResults);
    }
    return results;
  }

  // Test helper to trigger events
  dispatchEvent(eventType, eventData = {}) {
    const handlers = this.eventListeners.get(eventType) || [];
    handlers.forEach(handler => handler({ ...eventData, target: this }));
  }
}

/**
 * MockDOMAccessor - Mock implementation for testing
 */
export class MockDOMAccessor extends IDOMAccessor {
  constructor() {
    super();
    this.elements = new Map();
    this.rootElement = new MockElement('body');
    this.rootElement.id = 'root';
    this.elements.set('root', this.rootElement);
  }

  querySelector(selector) {
    if (selector.startsWith('#')) {
      const id = selector.slice(1);
      return this.elements.get(id) || null;
    }
    return this.rootElement.querySelector(selector);
  }

  querySelectorAll(selector) {
    return this.rootElement.querySelectorAll(selector);
  }

  getElementById(id) {
    return this.elements.get(id) || null;
  }

  createElement(tagName) {
    return new MockElement(tagName);
  }

  addEventListener(element, event, handler) {
    element.addEventListener(event, handler);
  }

  removeEventListener(element, event, handler) {
    element.removeEventListener(event, handler);
  }

  setAttribute(element, name, value) {
    element.setAttribute(name, value);
    if (name === 'id') {
      this.elements.set(value, element);
    }
  }

  getAttribute(element, name) {
    return element.getAttribute(name);
  }

  // Test helpers
  addElement(id, element) {
    element.id = id;
    this.elements.set(id, element);
    this.rootElement.appendChild(element);
  }

  reset() {
    this.elements.clear();
    this.rootElement = new MockElement('body');
    this.rootElement.id = 'root';
    this.elements.set('root', this.rootElement);
  }
}
