/**
 * Color Mix Lab 2.0 - Configuration
 * Single source of truth for all game constants
 */

const CONFIG = {
  // Primary Colors + Gradient Variants
  COLORS: {
    // Primary
    RED: '#FF4136',
    BLUE: '#0074D9',
    YELLOW: '#FFDC00',
    // Secondary (1:1 mix)
    PURPLE: '#B10DC9',
    ORANGE: '#FF851B',
    GREEN: '#2ECC40',
    // Tertiary (2:1 mix)
    RED_ORANGE: '#FF5722',    // 2 red + 1 yellow
    YELLOW_ORANGE: '#FFAB00', // 1 red + 2 yellow
    RED_PURPLE: '#E91E63',    // 2 red + 1 blue (magenta)
    BLUE_PURPLE: '#673AB7',   // 1 red + 2 blue (indigo)
    YELLOW_GREEN: '#8BC34A',  // 1 blue + 2 yellow (lime)
    BLUE_GREEN: '#009688',    // 2 blue + 1 yellow (teal)
    // Special
    BROWN: '#795548',         // 1:1:1 mix
    EMPTY: '#E8E8E8',
    MUD: '#5D4037'            // unbalanced 3-color mix
  },

  // Color emoji for visual formulas
  COLOR_EMOJI: {
    RED: '🔴',
    BLUE: '🔵',
    YELLOW: '🟡',
    PURPLE: '🟣',
    ORANGE: '🟠',
    GREEN: '🟢',
    RED_ORANGE: '🧡',
    YELLOW_ORANGE: '🌟',
    RED_PURPLE: '💗',
    BLUE_PURPLE: '💜',
    YELLOW_GREEN: '💚',
    BLUE_GREEN: '🩵',
    BROWN: '🟤',
    MUD: '💩'
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
  // type: 'mix' = standard mixing, 'quiz' = fill-in-the-blank
  LEVELS: [
    { id: 1, type: 'mix', target: 'ORANGE' },
    { id: 2, type: 'mix', target: 'GREEN' },
    { id: 3, type: 'mix', target: 'PURPLE' },
    { id: 4, type: 'quiz', given: 'RED', missing: 'YELLOW', result: 'ORANGE' },
    { id: 5, type: 'quiz', given: 'BLUE', missing: 'YELLOW', result: 'GREEN' },
    { id: 6, type: 'quiz', given: 'RED', missing: 'BLUE', result: 'PURPLE' },
    { id: 7, type: 'mix', target: 'ORANGE' },
    { id: 8, type: 'mix', target: 'GREEN' },
    { id: 9, type: 'quiz', given: 'YELLOW', missing: 'RED', result: 'ORANGE' },
    { id: 10, type: 'quiz', given: 'YELLOW', missing: 'BLUE', result: 'GREEN' },
    { id: 11, type: 'quiz', given: 'BLUE', missing: 'RED', result: 'PURPLE' },
    { id: 12, type: 'mix', target: 'PURPLE' }
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
    SCORE: 'colorMixLab_score',
    RECIPES: 'colorMixLab_recipes',
    ACHIEVEMENTS: 'colorMixLab_achievements'
  },

  // All discoverable recipes
  RECIPES: [
    // Secondary colors (1:1)
    { id: 'orange', colors: ['RED', 'YELLOW'], result: 'ORANGE', name: 'Orange' },
    { id: 'green', colors: ['BLUE', 'YELLOW'], result: 'GREEN', name: 'Green' },
    { id: 'purple', colors: ['RED', 'BLUE'], result: 'PURPLE', name: 'Purple' },
    // Tertiary colors (2:1)
    { id: 'red_orange', colors: ['RED', 'RED', 'YELLOW'], result: 'RED_ORANGE', name: 'Red-Orange' },
    { id: 'yellow_orange', colors: ['RED', 'YELLOW', 'YELLOW'], result: 'YELLOW_ORANGE', name: 'Yellow-Orange' },
    { id: 'red_purple', colors: ['RED', 'RED', 'BLUE'], result: 'RED_PURPLE', name: 'Magenta' },
    { id: 'blue_purple', colors: ['RED', 'BLUE', 'BLUE'], result: 'BLUE_PURPLE', name: 'Indigo' },
    { id: 'yellow_green', colors: ['BLUE', 'YELLOW', 'YELLOW'], result: 'YELLOW_GREEN', name: 'Lime' },
    { id: 'blue_green', colors: ['BLUE', 'BLUE', 'YELLOW'], result: 'BLUE_GREEN', name: 'Teal' },
    // Special
    { id: 'brown', colors: ['RED', 'BLUE', 'YELLOW'], result: 'BROWN', name: 'Brown' }
  ],

  // Achievements
  ACHIEVEMENTS: [
    { id: 'first_mix', icon: '🎨', name: 'First Mix', condition: 'levels >= 1' },
    { id: 'recipe_hunter', icon: '📖', name: 'Recipe Hunter', condition: 'recipes >= 3' },
    { id: 'color_master', icon: '🏆', name: 'Color Master', condition: 'levels >= 10' },
    { id: 'high_scorer', icon: '⭐', name: 'High Scorer', condition: 'score >= 1000' }
  ]
};

// Dual export pattern
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONFIG };
}
if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}
