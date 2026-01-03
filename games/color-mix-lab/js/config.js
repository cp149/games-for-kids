/**
 * Color Mix Lab 2.0 - Configuration
 * Single source of truth for all game constants
 */

const CONFIG = {
  // Primary Colors
  COLORS: {
    RED: '#FF4136',
    BLUE: '#0074D9',
    YELLOW: '#FFDC00',
    PURPLE: '#B10DC9',
    ORANGE: '#FF851B',
    GREEN: '#2ECC40',
    EMPTY: '#E8E8E8',
    MUD: '#5D4037'
  },

  // Color mixing rules: [color1, color2] => result
  MIXING_RULES: {
    'RED+BLUE': 'PURPLE',
    'BLUE+RED': 'PURPLE',
    'RED+YELLOW': 'ORANGE',
    'YELLOW+RED': 'ORANGE',
    'BLUE+YELLOW': 'GREEN',
    'YELLOW+BLUE': 'GREEN',
    'RED+RED': 'RED',
    'BLUE+BLUE': 'BLUE',
    'YELLOW+YELLOW': 'YELLOW'
  },

  // Level definitions
  LEVELS: [
    { id: 1, target: 'ORANGE', hint: 'Mix red and yellow!' },
    { id: 2, target: 'GREEN', hint: 'Mix blue and yellow!' },
    { id: 3, target: 'PURPLE', hint: 'Mix red and blue!' },
    { id: 4, target: 'ORANGE', hint: 'Can you remember?' },
    { id: 5, target: 'GREEN', hint: 'Try again!' },
    { id: 6, target: 'PURPLE', hint: 'You got this!' }
  ],

  // UI Settings
  UI: {
    DRAG_THRESHOLD: 10,
    ANIMATION_DURATION: 500,
    CELEBRATION_DURATION: 1500,
    TOUCH_TARGET_SIZE: 60
  },

  // Audio files
  AUDIO: {
    DROP: 'assets/sounds/drop.mp3',
    SUCCESS: 'assets/sounds/success.mp3',
    WRONG: 'assets/sounds/wrong.mp3'
  },

  // Storage keys
  STORAGE: {
    LEVEL: 'colorMixLab_level',
    SCORE: 'colorMixLab_score'
  }
};

// Dual export pattern
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONFIG };
}
if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}
