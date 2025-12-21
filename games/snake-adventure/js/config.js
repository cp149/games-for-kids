/**
 * Snake Adventure - Unified Configuration
 * All game constants and settings in one place
 */

const CONFIG = {
    // Game canvas settings
    GAME: {
        CANVAS_SIZE: 4800,              // Expanded world for more exploration
        INITIAL_VIEWPORT_WIDTH: 900,    // Will adjust to window
        INITIAL_VIEWPORT_HEIGHT: 600,
        TARGET_FPS: 60,
        BACKGROUND_COLOR: '#0a0e27',    // Deep space blue
        BOUNDARY_COLOR: '#00d4ff',      // Electric blue
        BOUNDARY_WIDTH: 8,
        BOUNDARY_GLOW: 20
    },

    // Snake properties
    SNAKE: {
        INITIAL_LENGTH: 3,
        SEGMENT_RADIUS: 14,
        SEGMENT_SPACING: 3,
        HEAD_RADIUS_MULTIPLIER: 1.3,    // Head slightly larger
        INITIAL_SPEED: 220,             // Snappier initial speed
        SPEED_INCREMENT: 20,            // Gradual speed increase
        MAX_SPEED: 480,                 // Balanced top speed
        TURN_RATE: 0.15,                // More responsive turning (0-1)
        MIN_TURN_ANGLE: Math.PI / 180 * 5, // Minimum turn per frame
        BOOST_MULTIPLIER: 1.4,          // Sprint boost multiplier

        // Visual
        GRADIENT_START: '#00ffff',      // Cyan
        GRADIENT_END: '#ff00ff',        // Magenta
        HEAD_GLOW_COLOR: 'rgba(0, 255, 255, 0.8)',
        HEAD_GLOW_RADIUS: 25,
        BODY_GLOW_RADIUS: 15,
        EYE_COLOR: '#ffffff',
        EYE_SIZE: 4,
        EYE_OFFSET: 8,

        // Animation
        PULSE_SPEED: 2,                 // Breathing animation speed
        PULSE_AMOUNT: 0.15,             // Pulse size variation (0-1)
        DEATH_EXPLOSION_PARTICLES: 30
    },

    // Food settings
    FOOD: {
        MAX_COUNT: 20,                  // More food for better gameplay
        SPAWN_RADIUS: 18,
        GLOW_RADIUS: 35,
        COLLECTION_RADIUS: 32,          // Slightly larger collection radius
        MIN_DISTANCE_FROM_SNAKE: 120,
        MIN_DISTANCE_FROM_BOUNDARY: 120,

        // Food types with balanced spawn rates
        TYPES: {
            NORMAL: {
                COLOR: '#ffd700',               // Golden
                GLOW_COLOR: 'rgba(255, 215, 0, 0.7)',
                SCORE: 10,
                SPAWN_WEIGHT: 55                // 55% chance (more variety)
            },
            SPEED: {
                COLOR: '#ff0066',               // Red
                GLOW_COLOR: 'rgba(255, 0, 102, 0.7)',
                SCORE: 20,
                SPEED_BOOST: 50,                // More noticeable speed boost
                BOOST_DURATION: 5000,           // 5 seconds
                SPAWN_WEIGHT: 20                // 20% chance
            },
            BONUS: {
                COLOR: '#00ff00',               // Green
                GLOW_COLOR: 'rgba(0, 255, 0, 0.7)',
                SCORE: 50,
                SCORE_MULTIPLIER: 2,            // Double points
                MULTIPLIER_DURATION: 7000,      // 7 seconds
                SPAWN_WEIGHT: 15                // 15% chance
            },
            GOLDEN: {
                COLOR: '#ffff00',               // Yellow
                GLOW_COLOR: 'rgba(255, 255, 0, 0.9)',
                SCORE: 200,                     // Higher reward
                GROW_AMOUNT: 3,                 // Grow 3 segments
                SPAWN_WEIGHT: 5                 // 5% chance (rare)
            },
            MAGNET: {
                COLOR: '#8a2be2',               // Blue Violet
                GLOW_COLOR: 'rgba(138, 43, 226, 0.8)',
                SCORE: 30,
                MAGNET_RANGE: 250,              // Attract food within range
                MAGNET_DURATION: 6000,          // 6 seconds
                SPAWN_WEIGHT: 5                 // 5% chance (rare power-up)
            }
        },

        PULSE_SPEED: 3.5,
        PULSE_AMOUNT: 0.25
    },

    // Camera follow system
    CAMERA: {
        LERP_SPEED: 0.08,               // Smooth following (0-1)
        DEADZONE_RADIUS: 80,            // Don't follow small movements
        BOUNDARY_PADDING: 200           // Keep this much space from edge
    },

    // Particle effects
    PARTICLES: {
        POOL_SIZE: 100,
        TAIL_SPAWN_RATE: 0.1,           // Chance per frame
        LIFETIME: 0.8,                  // seconds
        SIZE: 6,
        FADE_RATE: 1.5,
        SPREAD: 15,                     // Random position offset
        DEATH_PARTICLE_SPEED: 150,
        DEATH_PARTICLE_LIFETIME: 1.5
    },

    // Controls
    CONTROLS: {
        // Keyboard
        ARROW_TURN_SPEED: 0.15,

        // Touch joystick
        JOYSTICK_BASE_RADIUS: 70,
        JOYSTICK_STICK_RADIUS: 35,
        JOYSTICK_BASE_COLOR: 'rgba(255, 255, 255, 0.3)',
        JOYSTICK_STICK_COLOR: 'rgba(0, 212, 255, 0.8)',
        JOYSTICK_MAX_DISTANCE: 45,
        JOYSTICK_DEADZONE: 10,

        // Swipe
        SWIPE_THRESHOLD: 30,            // Minimum distance for swipe
        SWIPE_ANGLE_SNAP: Math.PI / 8   // Snap to 45° angles
    },

    // UI settings
    UI: {
        HUD_PADDING: 20,
        HUD_FONT: 'bold 24px Arial',
        HUD_COLOR: '#ffffff',
        HUD_GLOW_COLOR: '#00d4ff',
        HUD_GLOW_BLUR: 10,

        BUTTON_SIZE: 50,
        BUTTON_PADDING: 15,
        BUTTON_COLOR: 'rgba(0, 212, 255, 0.3)',
        BUTTON_HOVER_COLOR: 'rgba(0, 212, 255, 0.6)',
        BUTTON_BORDER_COLOR: '#00d4ff',
        BUTTON_BORDER_WIDTH: 2,

        TOAST_DURATION: 2000,
        TOAST_FONT: 'bold 18px Arial',
        TOAST_PADDING: 15,

        GAME_OVER_FONT: 'bold 48px Arial',
        GAME_OVER_COLOR: '#ff0066',

        MENU_BLUR: 'blur(10px)',
        MENU_BACKGROUND: 'rgba(10, 14, 39, 0.9)'
    },

    // Audio settings
    AUDIO: {
        MUSIC_VOLUME: 0.3,
        SFX_VOLUME: 0.5,
        MUSIC_TEMPO_INCREASE: 0.05,     // Tempo increase per speed level
        MAX_TEMPO: 1.5
    },

    // Collision detection
    COLLISION: {
        SPATIAL_GRID_CELL_SIZE: 50,
        SELF_COLLISION_SKIP_SEGMENTS: 5 // Don't check this many segments from head
    },

    // Scoring & progression
    PROGRESSION: {
        FOOD_FOR_SPEED_UP: [20, 40, 70, 110, 160], // Gradual speed increases
        LENGTH_MILESTONES: [15, 30, 50, 75, 100, 150, 200, 300], // More frequent rewards
        SCORE_MILESTONES: [500, 1000, 2500, 5000, 10000] // Score-based achievements
    },

    // Performance
    PERFORMANCE: {
        MAX_DELTA_TIME: 0.1,            // Cap physics timestep
        PARTICLE_CULL_DISTANCE: 1000,   // Don't render far particles
        DEBUG_MODE: false               // Show FPS, collision boxes, etc.
    },

    // AI settings
    AI: {
        INITIAL_COUNT: 2,               // Start with 2 AI snakes for easier beginning
        MAX_COUNT: 5,                   // Max 5 AI snakes (balanced challenge)
        RESPAWN_DELAY_FRAMES: 180,      // 3 seconds at 60 FPS
        SPAWN_ON_MILESTONE: [50, 100, 180], // Spawn new AI at these player lengths
        DIFFICULTY_INCREASE_INTERVAL: 20, // Increase AI speed every 20 food collected
        INITIAL_SPEED_MULTIPLIER: 0.85, // AI starts slightly slower than player
        MAX_SPEED_MULTIPLIER: 0.95      // AI max speed slightly below player
    },

    // Kill feed settings
    KILL_FEED: {
        MAX_ENTRIES: 5,
        ENTRY_DURATION: 5000,           // 5 seconds
        POSITION_X: 20,
        POSITION_Y: 80
    },

    // I18n keys (actual translations in i18n.js)
    I18N_KEYS: {
        GAME_TITLE: 'game_title',
        SCORE: 'score',
        LENGTH: 'length',
        PAUSE: 'pause',
        RESUME: 'resume',
        RESTART: 'restart',
        GAME_OVER: 'game_over',
        YOUR_SCORE: 'your_score',
        PRESS_SPACE: 'press_space',
        TAP_TO_START: 'tap_to_start',
        CONTROLS_INFO: 'controls_info'
    }
};

// Freeze config to prevent accidental modification
Object.freeze(CONFIG);
Object.freeze(CONFIG.GAME);
Object.freeze(CONFIG.SNAKE);
Object.freeze(CONFIG.FOOD);
Object.freeze(CONFIG.CAMERA);
Object.freeze(CONFIG.PARTICLES);
Object.freeze(CONFIG.CONTROLS);
Object.freeze(CONFIG.UI);
Object.freeze(CONFIG.AUDIO);
Object.freeze(CONFIG.COLLISION);
Object.freeze(CONFIG.PROGRESSION);
Object.freeze(CONFIG.PERFORMANCE);
Object.freeze(CONFIG.AI);
Object.freeze(CONFIG.KILL_FEED);

// Export for module usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
