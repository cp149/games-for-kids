/**
 * Vitest Setup File
 * Global mocks and test utilities
 */

import { vi } from 'vitest';

// Mock CONFIG object
global.CONFIG = {
  GAME: {
    CANVAS_SIZE: 5000,
    BACKGROUND_COLOR: '#0a0e27',
    BOUNDARY_COLOR: '#ff0066',
    BOUNDARY_WIDTH: 4,
    BOUNDARY_GLOW: 15
  },
  SNAKE: {
    SEGMENT_RADIUS: 8,
    INITIAL_SPEED: 150
  },
  FOOD: {
    SPAWN_RADIUS: 10,
    COLLECTION_RADIUS: 25,
    MIN_DISTANCE_FROM_BOUNDARY: 100,
    MIN_DISTANCE_FROM_SNAKE: 50,
    MAX_COUNT: 30,
    PULSE_SPEED: 3,
    PULSE_AMOUNT: 0.15,
    GLOW_RADIUS: 30,
    TYPES: {
      NORMAL: {
        SCORE: 10,
        GROWTH: 3,
        SPAWN_WEIGHT: 70,
        COLOR: '#00ff88',
        GLOW_COLOR: 'rgba(0, 255, 136, 0.6)'
      },
      SPEED: {
        SCORE: 15,
        GROWTH: 2,
        SPAWN_WEIGHT: 15,
        BOOST_DURATION: 3000,
        COLOR: '#ffaa00',
        GLOW_COLOR: 'rgba(255, 170, 0, 0.6)'
      },
      GOLDEN: {
        SCORE: 30,
        GROWTH: 5,
        SPAWN_WEIGHT: 10,
        SCORE_MULTIPLIER: 2,
        MULTIPLIER_DURATION: 5000,
        COLOR: '#ffd700',
        GLOW_COLOR: 'rgba(255, 215, 0, 0.8)'
      },
      MAGNET: {
        SCORE: 20,
        GROWTH: 3,
        SPAWN_WEIGHT: 5,
        MAGNET_RANGE: 200,
        MAGNET_DURATION: 5000,
        COLOR: '#8a2be2',
        GLOW_COLOR: 'rgba(138, 43, 226, 0.6)'
      }
    }
  },
  COLLISION: {
    SPATIAL_GRID_CELL_SIZE: 100
  },
  AI: {
    INITIAL_COUNT: 3,
    MAX_COUNT: 8,
    INITIAL_SPEED_MULTIPLIER: 0.8,
    SPAWN_ON_MILESTONE: [20, 40, 60, 80, 100],
    RESPAWN_DELAY_FRAMES: 300
  },
  AUDIO: {
    MUSIC_VOLUME: 0.3,
    SFX_VOLUME: 0.5
  }
};

// Mock MathUtils
global.MathUtils = {
  distance: (x1, y1, x2, y2) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  },
  random: (min, max) => {
    return min + Math.random() * (max - min);
  }
};

// Mock I18N
global.I18N = {
  t: (key, params = {}) => {
    const templates = {
      combo: `${params.count}x COMBO`,
      combo_ended: `${params.count}x Combo Ended!`,
      score_multiplier: '2x Score!',
      new_ai: 'New AI Challenger!',
      speed_boost: 'Speed Boost!',
      golden_food: 'Golden Food +3!',
      magnet_power: 'Magnet Power!',
      paused: 'PAUSED',
      right_click_to_resume: 'Right-click to resume'
    };
    return templates[key] || key;
  },
  currentLang: 'en',
  setLanguage: vi.fn(),
  getLanguages: () => [
    { code: 'en', name: 'English' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' }
  ]
};

// Mock Logger
global.Logger = {
  log: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  getEnvironment: () => ({ platform: 'test' })
};

// Mock performance.now()
if (typeof performance === 'undefined') {
  global.performance = {
    now: () => Date.now()
  };
}

// Mock requestAnimationFrame
if (typeof requestAnimationFrame === 'undefined') {
  global.requestAnimationFrame = (callback) => {
    return setTimeout(() => callback(Date.now()), 16);
  };
}

// Mock canvas creation for tests
global.document.createElement = new Proxy(document.createElement.bind(document), {
  apply(target, thisArg, args) {
    const element = Reflect.apply(target, thisArg, args);

    if (args[0] === 'canvas') {
      element.getContext = vi.fn(() => ({
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        shadowBlur: 0,
        shadowColor: '',
        font: '',
        textAlign: '',
        textBaseline: '',
        fillRect: vi.fn(),
        strokeRect: vi.fn(),
        fillText: vi.fn(),
        strokeText: vi.fn(),
        beginPath: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        setLineDash: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
        rotate: vi.fn(),
        scale: vi.fn(),
        createRadialGradient: vi.fn(() => ({
          addColorStop: vi.fn()
        })),
        createLinearGradient: vi.fn(() => ({
          addColorStop: vi.fn()
        })),
        drawImage: vi.fn()
      }));
    }

    return element;
  }
});
