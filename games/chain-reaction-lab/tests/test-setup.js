/**
 * Test Environment Setup
 * Mock browser APIs for Node.js testing
 * MUST be imported before any game modules
 */

// Mock localStorage FIRST
global.localStorage = {
  data: {},
  getItem(key) { return this.data[key] || null; },
  setItem(key, value) { this.data[key] = value; },
  removeItem(key) { delete this.data[key]; },
  clear() { this.data = {}; }
};

// Mock navigator
global.navigator = {
  language: 'en-US',
  userLanguage: 'en-US'
};

// Mock canvas context
function mockCanvasContext() {
  return {
    save: () => {},
    restore: () => {},
    clearRect: () => {},
    fillRect: () => {},
    strokeRect: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    arc: () => {},
    ellipse: () => {},
    bezierCurveTo: () => {},
    fill: () => {},
    stroke: () => {},
    closePath: () => {},
    translate: () => {},
    rotate: () => {},
    scale: () => {},
    fillText: () => {},
    createLinearGradient: () => ({
      addColorStop: () => {}
    }),
    drawImage: () => {},
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: '',
    textBaseline: '',
    shadowBlur: 0,
    shadowColor: '',
    globalAlpha: 1
  };
}

// Mock window
global.window = {
  gameRenderer: null,
  gameInstance: null,
  gameSettings: {
    get: (key) => {
      const defaults = { sound: true, music: true, particles: true, highQuality: true };
      return defaults[key];
    }
  },
  addEventListener: () => {},
  removeEventListener: () => {}
};

// Mock document
global.document = {
  getElementById: (id) => {
    const mocks = {
      gameCanvas: {
        width: 800,
        height: 600,
        parentElement: { getBoundingClientRect: () => ({ width: 800, height: 600 }) },
        getContext: () => mockCanvasContext()
      },
      soundToggle: { checked: true },
      musicToggle: { checked: true },
      particlesToggle: { checked: true },
      qualityToggle: { checked: true }
    };
    return mocks[id] || {
      checked: true,
      style: {},
      classList: { add: () => {}, remove: () => {}, contains: () => false },
      textContent: '',
      innerHTML: ''
    };
  },
  createElement: (tag) => {
    if (tag === 'canvas') {
      return {
        width: 800,
        height: 600,
        getContext: () => mockCanvasContext()
      };
    }
    return { style: {}, classList: { add: () => {}, remove: () => {} } };
  },
  addEventListener: () => {},
  removeEventListener: () => {},
  querySelectorAll: () => []
};

// Mock animation frames
global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Mock performance
global.performance = { now: () => Date.now() };

// Mock Image and Audio
global.Image = class Image {
  constructor() { this.src = ''; }
};

global.Audio = class Audio {
  constructor() { this.src = ''; }
  play() { return Promise.resolve(); }
};

export { mockCanvasContext };
