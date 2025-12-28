/**
 * Chemistry Lab - Configuration
 */

const CONFIG = {
  CANVAS: {
    WIDTH: 800,
    HEIGHT: 800,
    CENTER_X: 400,
    CENTER_Y: 400
  },

  CARDS: {
    DROP_SPEED: 50, // pixels per second
    DROP_INTERVAL: 2000, // milliseconds between cards
    DROP_ZONE_WIDTH: 700,
    DROP_ZONE_HEIGHT: 300,
    CARD_WIDTH: 80,
    CARD_HEIGHT: 100
  },

  SLOTS: {
    COUNT: 4,
    WIDTH: 120,
    HEIGHT: 120
  },

  GAME: {
    INITIAL_LEVEL: 1,
    MAX_LEVEL: 11
  },

  SCORE: {
    BASIC_REACTION: 10,
    COMBO_REACTION: 20,
    CATALYST_BONUS: 10,
    LEVEL_COMPLETE: 100
  },

  TIMER: {
    DEFAULT: 60 // seconds
  },

  UI: {
    BG_COLOR: '#0f3460'
  }
};

// Reagent types and colors
const REAGENT_TYPES = {
  // Tier 1 (Basic Primary Colors)
  RED: { color: 'red', emoji: '🔴', class: 'red', tier: 1 },
  BLUE: { color: 'blue', emoji: '🔵', class: 'blue', tier: 1 },
  YELLOW: { color: 'yellow', emoji: '🟡', class: 'yellow', tier: 1 },

  // Tier 1.5 (L3-L4 Color Mixing Products)
  PURPLE: { color: '#9b59b6', emoji: '🟣', class: 'purple', tier: 1.5 },
  ORANGE: { color: '#ff8c42', emoji: '🟠', class: 'orange', tier: 1.5 },
  GREEN: { color: '#51cf66', emoji: '🟢', class: 'green', tier: 1.5 },

  // Tier 2 (Physical State Compounds)
  STEAM: { color: '#e6f7ff', emoji: '💨', class: 'steam', tier: 2 },
  MUD: { color: '#8d6e63', emoji: '🟤', class: 'mud', tier: 2 },
  ENERGY: { color: '#e040fb', emoji: '⚡', class: 'energy', tier: 2 },

  // Tier 3 (Advanced)
  CLOUD: { color: '#ffffff', emoji: '☁️', class: 'cloud', tier: 3 },
  LAVA: { color: '#ff3d00', emoji: '🌋', class: 'lava', tier: 3, dangerous: true },
  STORM: { color: '#607d8b', emoji: '⛈️', class: 'storm', tier: 3 },

  // Tier 3 (Safe variants)
  OBSIDIAN: { color: '#424242', emoji: '🪨', class: 'obsidian', tier: 3 }
};

// Special card types
const SPECIAL_TYPES = {
  CATALYST: { emoji: '⭐', name: 'Catalyst', class: 'catalyst' },
  STABILIZER: { emoji: '🛡️', name: 'Stabilizer', class: 'stabilizer' }
};

// Reaction rules
const REACTIONS = {
  // === L1-L4: Pure Color Pairing (Teaching Basics) ===

  // L1: Red Magic - same color synthesis
  'RED+RED': { result: 'RED_BOOM', points: 10, color: '#ff6b6b', emoji: '💥', description: 'Red Boom' },

  // L2: Blue Splash - different feedback than red
  'BLUE+BLUE': { result: 'BLUE_SPLASH', points: 10, color: '#4dabf7', emoji: '💦', description: 'Blue Splash' },

  // L3: Purple Puzzle - first A+B=C synthesis
  'BLUE+RED': { type: 'synthesis', output: 'PURPLE', points: 15, color: '#9b59b6', emoji: '🟣', description: 'Magic Potion', reversible: true },

  // L4: Yellow Awakening - three primary colors
  'YELLOW+YELLOW': { result: 'YELLOW_SPARK', points: 10, color: '#ffd43b', emoji: '⚡', description: 'Yellow Spark' },
  'RED+YELLOW': { type: 'synthesis', output: 'ORANGE', points: 12, color: '#ff8c42', emoji: '🍊', description: 'Orange' },
  'BLUE+YELLOW': { type: 'synthesis', output: 'GREEN', points: 12, color: '#51cf66', emoji: '💚', description: 'Green' },

  // === L5+: Physical World (States of Matter) ===

  // State transitions (L5-L6)
  // Note: RED+BLUE already defined as PURPLE in L3, STEAM moved to higher levels
  'YELLOW+GREEN': { type: 'synthesis', output: 'MUD', points: 15, color: '#8d6e63', emoji: '🟤' },

  // Tier 2 Synthesis
  'STEAM+STEAM': { type: 'synthesis', output: 'CLOUD', points: 30, color: '#ffffff', emoji: '☁️' },
  'MUD+RED': { type: 'synthesis', output: 'LAVA', points: 30, color: '#ff3d00', emoji: '🌋' },
  'ENERGY+STEAM': { type: 'synthesis', output: 'STORM', points: 40, color: '#607d8b', emoji: '⛈️' },

  // Legacy explosions (kept for backward compatibility)
  'GREEN+GREEN': { result: 'GREEN_EXPLOSION', points: 10, color: '#51cf66', emoji: '💥' },
  
  // Cross-Tier Interactions (Examples)
  'CLOUD+STORM': { result: 'THUNDERSTORM_EXPLOSION', points: 100, color: '#ffeb3b', emoji: '🌩️✨' },

  // Triple reactions (bonus)
  'BLUE+RED+YELLOW': { result: 'RAINBOW_EXPLOSION', points: 30, color: '#ffffff', emoji: '🌈💥' }
};

// Level definitions (L1-9)
const LEVELS = [
  // L1: Tutorial - Learn drag & mix
  {
    level: 1,
    name: 'First Reactions',
    objective: {
      type: 'count',
      target: 3,
      description: 'Complete 3 reactions'
    },
    timer: null, // unlimited
    cards: ['RED', 'BLUE'],
    dropInterval: 2500,
    specialCards: []
  },

  // L2: Purple Potion - first A+B=C synthesis
  {
    level: 2,
    name: 'Potion Class',
    objective: {
      type: 'specific',
      target: { 'PURPLE': 2 },
      description: 'Create 2 Purple Potions (Red + Blue)'
    },
    timer: null,
    cards: ['RED', 'BLUE'], // No yellow - avoid confusion for 5yo
    dropInterval: 2000,
    specialCards: []
  },

  // L3: Color mixing mastery (moved from L4)
  {
    level: 3,
    name: 'Yellow Awakening',
    objective: {
      type: 'multiple_specific',
      target: { 'ORANGE': 1, 'GREEN': 1, 'YELLOW_SPARK': 1 },
      description: '🔴🟡=🍊 | 🔵🟡=💚 | 🟡🟡=⚡'
    },
    timer: null, // No timer - let them learn colors first
    cards: ['RED', 'BLUE', 'YELLOW'],
    dropInterval: 2000,
    specialCards: []
  },

  // L4: Speed challenge (moved from L3, now they know all recipes)
  {
    level: 4,
    name: 'Speed Lab',
    objective: {
      type: 'count',
      target: 5,
      description: 'Complete 5 reactions in 60s'
    },
    timer: 60,
    cards: ['RED', 'BLUE', 'YELLOW'],
    dropInterval: 1800,
    specialCards: []
  },

  // L5: Catalyst strategy
  {
    level: 5,
    name: 'Boosted Reactions',
    objective: {
      type: 'score',
      target: 500,
      description: 'Reach 500 points'
    },
    timer: 120,
    cards: ['RED', 'BLUE', 'YELLOW'],
    dropInterval: 1500,
    specialCards: [
      { type: 'CATALYST', count: 3 }
    ]
  },

  // L6: Catalyst challenge
  {
    level: 6,
    name: 'Catalyst Master',
    objective: {
      type: 'catalyst_count',
      target: 5,
      description: 'Use catalyst 5 times in 90s'
    },
    timer: 90,
    cards: ['RED', 'BLUE', 'YELLOW', 'GREEN'],
    dropInterval: 1200,
    specialCards: [
      { type: 'CATALYST', count: 3 }
    ]
  },

  // L7: Stabilizer intro
  {
    level: 7,
    name: 'Time Pressure',
    objective: {
      type: 'count',
      target: 5,
      description: 'Complete 5 reactions (cards expire in 10s)'
    },
    timer: 90,
    cards: ['RED', 'BLUE', 'YELLOW'],
    dropInterval: 1500,
    expirationTime: 10,
    specialCards: [
      { type: 'STABILIZER', count: 3 }
    ]
  },

  // L8: Stabilizer tactics
  {
    level: 8,
    name: 'Stable Science',
    objective: {
      type: 'specific',
      target: { 'RAINBOW_EXPLOSION': 1 },
      description: 'Make 1 rainbow explosion (use stabilizers wisely)'
    },
    timer: 120,
    cards: ['RED', 'BLUE', 'YELLOW'],
    dropInterval: 1800,
    expirationTime: 10,
    specialCards: [
      { type: 'STABILIZER', count: 4 }
    ]
  },

  // L9: Speed challenge
  {
    level: 9,
    name: 'Master Lab',
    objective: {
      type: 'score',
      target: 1000,
      description: 'Reach 1000 points in 120s'
    },
    timer: 120,
    cards: ['RED', 'BLUE', 'YELLOW', 'GREEN'],
    dropInterval: 1000,
    expirationTime: 8,
    specialCards: [
      { type: 'CATALYST', count: 3 },
      { type: 'STABILIZER', count: 3 }
    ]
  }
];

// Export for browser
if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
  window.REAGENT_TYPES = REAGENT_TYPES;
  window.SPECIAL_TYPES = SPECIAL_TYPES;
  window.REACTIONS = REACTIONS;
  window.LEVELS = LEVELS;
}
