/**
 * Game Configuration and Constants
 */

export const GAME_CONFIG = {
    // Physics
    GRAVITY: 1200,
    JUMP_FORCE: 500,
    OBSTACLE_SPEED: 300,

    // Spawning
    SPAWN_INTERVAL: 1.5,
    POWERUP_INTERVAL: 8,
    ROCK_BASE_INTERVAL: 5,

    // Timing
    COMBO_TIMEOUT: 3, // seconds
    INVINCIBLE_DURATION: 5, // seconds
    JUMP_COOLDOWN: 300, // milliseconds

    // Game balance
    MAX_GAME_SPEED: 3.5,
    SPEED_INCREASE_SCORE: 200, // Score needed for each 0.1x speed increase
    SPEED_INCREASE_AMOUNT: 0.1,

    // Canvas
    GROUND_OFFSET: 100, // pixels from bottom

    // Player
    PLAYER_X: 100,
    PLAYER_SCALE: 0.35,
    PLAYER_COLLISION_SCALE: 0.15,

    // Background color
    BG_COLOR: [135, 206, 235] // Sky blue
};

// Color palette for UI
export const COLORS = {
    SKY_BLUE: [135, 206, 235],
    COMBO_WHITE: [255, 255, 255],
    COMBO_YELLOW: [255, 255, 0],
    COMBO_ORANGE: [255, 165, 0],
    COMBO_RED: [255, 0, 0],
    POWERUP_NOTIFICATION: [255, 255, 100]
};

// Coin types configuration
export const COIN_TYPES = [
    {
        name: "star",
        probability: 15,
        color: [255, 255, 150],
        scale: 0.08,
        value: 100,
        rotate: true,
        special: true
    },
    {
        name: "diamond",
        probability: 5,
        color: [0, 255, 255],
        scale: 0.06,
        value: 500,
        rotate: false,
        special: true
    },
    {
        name: "ruby",
        probability: 10,
        color: [255, 50, 50],
        scale: 0.055,
        value: 200,
        rotate: false,
        special: true
    },
    {
        name: "coin",
        probability: 70,
        color: [255, 215, 0],
        scale: 0.05,
        value: 50,
        rotate: false,
        special: false
    }
];

// Power-up types configuration
export const POWERUP_TYPES = [
    {
        name: "speed-boost",
        emoji: "⚡",
        color: [255, 255, 0],
        scale: 0.5,
        duration: 5,
        description: "Speed Boost!",
        speedMultiplier: 1.5
    },
    {
        name: "slow-motion",
        emoji: "🕐",
        color: [100, 200, 255],
        scale: 0.5,
        duration: 5,
        description: "Slow Motion!",
        speedMultiplier: 0.6
    },
    {
        name: "super-jump",
        emoji: "🦘",
        color: [255, 150, 0],
        scale: 0.5,
        duration: 8,
        description: "Super Jump!",
        jumpMultiplier: 1.6
    }
];

// Ground decoration configurations
export const DECO_CONFIGS = [
    { frame: 0, offset: -11, name: 'grass' },
    { frame: 3, offset: -11, name: 'bush' },
    { frame: 4, offset: -7, name: 'pebble' },
    { frame: 5, offset: -15, name: 'mushroom' }
];

// Pose types
export const POSE_TYPES = {
    ONE_HAND: 'one-hand',
    ARMS_SPREAD: 'arms-spread',
    ONE_LEG: 'one-leg',
    HANDS_UP: 'hands-up'
};

// Music tracks
export const MUSIC_TRACKS = ["bgMusic1", "bgMusic2", "bgMusic3", "bgMusic4", "bgMusic5"];
