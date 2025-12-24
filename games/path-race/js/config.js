/**
 * Path Race - Game Configuration
 * All constants and settings in one place
 */

const CONFIG = {
    // Game settings
    GAME: {
        TITLE: 'Path Race',
        VERSION: '1.0.0',
        TARGET_FPS: 60,
        DEBUG_MODE: false
    },

    // Grid settings
    GRID: {
        MIN_SIZE: 3,                    // Minimum grid (3x3)
        MAX_SIZE: 6,                    // Maximum grid (6x6)
        CELL_SIZE: 80,                  // Pixels per grid cell
        DOT_RADIUS: 24,                 // Dot size (large for children)
        LINE_WIDTH: 6,                  // Path line thickness
        GRID_PADDING: 40,               // Padding around grid

        // Difficulty by level
        SIZE_BY_LEVEL: {
            1: 3,  2: 3,  3: 3,         // Levels 1-3: 3x3
            4: 4,  5: 4,  6: 4,         // Levels 4-6: 4x4
            7: 5,  8: 5,  9: 5, 10: 5,  // Levels 7-10: 5x5
            DEFAULT: 6                   // 11+: 6x6
        }
    },

    // Color scheme (child-friendly, high contrast)
    COLORS: {
        // Background
        CANVAS_BG: '#FAFAFA',
        GRID_LINE: '#E0E0E0',

        // Dots
        START_DOT: '#4CAF50',           // Green
        END_DOT: '#F44336',             // Red
        NORMAL_DOT: '#FFFFFF',          // White
        NORMAL_DOT_BORDER: '#BDBDBD',   // Gray border
        VISITED_DOT: '#2196F3',         // Blue (player)
        AI_VISITED_DOT: '#FF9800',      // Orange (AI)

        // Paths
        PLAYER_PATH: '#2196F3',         // Blue
        AI_PATH: '#FF9800',             // Orange
        AI_PHEROMONE: 'rgba(255, 152, 0, 0.3)', // Translucent orange

        // Hover states
        DOT_HOVER: '#64B5F6',           // Light blue
        DOT_INVALID: '#EF5350',         // Light red

        // UI
        SUCCESS_COLOR: '#4CAF50',
        ERROR_COLOR: '#F44336',
        WARNING_COLOR: '#FFC107',
        INFO_COLOR: '#2196F3'
    },

    // Dot types
    DOT_TYPES: {
        START: 'start',
        END: 'end',
        NORMAL: 'normal'
    },

    // Ant Colony Optimization parameters
    ACO: {
        NUM_ANTS: 10,                   // Base number of ants (scaled by grid size)
        MAX_ITERATIONS: 150,            // Maximum ACO iterations (increased for harder grids)
        MIN_ITERATIONS: 3,              // Minimum iterations before stopping (reduced for speed)
        ITERATION_DELAY: 150,           // ms between iterations (faster gameplay)

        // Algorithm parameters (balanced exploration vs exploitation)
        ALPHA: 1.2,                     // Pheromone importance (increased - trust trails more)
        BETA: 2.0,                      // Heuristic importance (reduced - allow more exploration)
        RHO: 0.1,                       // Evaporation rate (slower - preserve good trails)
        Q: 100,                         // Pheromone deposit constant
        INITIAL_PHEROMONE: 1.0,         // Starting pheromone level

        // Difficulty multipliers (AI speed by level)
        DIFFICULTY_MULTIPLIERS: {
            1: 0.5,   2: 0.5,   3: 0.5,    // Very slow (easy levels)
            4: 0.6,   5: 0.6,   6: 0.6,    // Slow
            7: 0.75,  8: 0.75,  9: 0.75, 10: 0.75,  // Medium
            DEFAULT: 0.85                   // Fast (11+)
        },

        // Visualization
        ANT_SIZE: 8,                    // Visual ant sprite size
        PHEROMONE_MIN_ALPHA: 0.1,       // Minimum pheromone visibility
        PHEROMONE_MAX_ALPHA: 0.6,       // Maximum pheromone visibility
        SHOW_EXPLORATION: true          // Show AI exploration phase
    },

    // Player interaction
    PLAYER: {
        CLICK_RADIUS: 40,               // Click detection radius
        MAX_UNDO_COUNT: 999,            // Unlimited undo (for children)
        DOUBLE_CLICK_PREVENTION: 200,   // ms to prevent double clicks
        TOUCH_TARGET_SIZE: 60,          // Minimum touch target (accessibility)
    },

    // Level progression
    LEVELS: {
        TOTAL_LEVELS: 15,               // Total designed levels
        STARS_PER_LEVEL: 3,             // Maximum stars

        // Star requirements (relative to AI time)
        STAR_3_MULTIPLIER: 0.8,         // Beat AI by 20% = 3 stars
        STAR_2_MULTIPLIER: 1.0,         // Beat AI = 2 stars
        STAR_1_MULTIPLIER: 1.5,         // Complete within 150% of AI = 1 star

        // Unlock system
        STARS_TO_UNLOCK_NEXT: 1,        // Need 1+ star to unlock next level
    },

    // Animation settings
    ANIMATION: {
        DOT_HOVER_SCALE: 1.15,
        DOT_CLICK_SCALE: 1.3,
        LINE_DRAW_SPEED: 200,           // ms per line segment
        PATH_PULSE_SPEED: 2,            // Breathing animation
        CONFETTI_COUNT: 30,
        CONFETTI_DURATION: 2000,        // ms

        // Easing functions
        EASE_OUT_CUBIC: (t) => 1 - Math.pow(1 - t, 3),
        EASE_IN_OUT_QUAD: (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
    },

    // Audio settings
    AUDIO: {
        MUSIC_VOLUME: 0.3,
        SFX_VOLUME: 0.5,

        // Background music tracks (random play)
        MUSIC_TRACKS: [
            'assets/sounds/music/background.mp3'
        ],

        // Sound file paths
        SOUNDS: {
            CLICK_VALID: 'assets/sounds/sfx/click.mp3',
            CLICK_INVALID: 'assets/sounds/sfx/error.mp3',
            LINE_DRAW: 'assets/sounds/sfx/draw.mp3',
            UNDO: 'assets/sounds/sfx/undo.mp3',
            WIN: 'assets/sounds/sfx/win.mp3',
            LOSE: 'assets/sounds/sfx/lose.mp3',
            STAR: 'assets/sounds/sfx/star.mp3',
            COUNTDOWN: 'assets/sounds/sfx/countdown.mp3',
            GO: 'assets/sounds/sfx/go.mp3',
            BG_MUSIC: 'assets/sounds/music/background.mp3'
        }
    },

    // UI settings
    UI: {
        COUNTDOWN_DURATION: 3000,       // 3 seconds countdown
        COUNTDOWN_STEPS: [3, 2, 1, 'GO!'],
        RESULT_DELAY: 1000,             // Delay before showing result modal

        // Toast notifications
        TOAST_DURATION: 2000,
        TOAST_POSITION: 'top-center',

        // Button states
        BUTTON_COOLDOWN: 300,           // ms to prevent button spam
    },

    // Performance optimization
    PERFORMANCE: {
        MAX_DELTA_TIME: 0.1,            // Cap frame delta
        CANVAS_SCALE: window.devicePixelRatio || 1,
        USE_REQUEST_ANIMATION_FRAME: true,
        LAZY_LOAD_ASSETS: true
    },

    // Local storage keys
    STORAGE: {
        LANGUAGE: 'path_race_lang',
        LEVEL_PROGRESS: 'path_race_levels',
        MUSIC_ENABLED: 'path_race_music',
        SFX_ENABLED: 'path_race_sfx'
    },

    // I18n keys (translations in i18n.js)
    I18N_KEYS: {
        GAME_TITLE: 'game_title',
        PLAYER: 'player',
        AI_OPPONENT: 'ai_opponent',
        LEVEL: 'level',
        MOVES: 'moves',
        TIME: 'time',
        STATUS: 'status',
        PROGRESS: 'progress',
        START_RACE: 'start_race',
        UNDO: 'undo',
        RESTART: 'restart',
        YOU_WIN: 'you_win',
        AI_WINS: 'ai_wins',
        RETRY: 'retry',
        NEXT_LEVEL: 'next_level',
        HOW_TO_PLAY: 'how_to_play',
        RULE_START: 'rule_start',
        RULE_VISIT: 'rule_visit',
        RULE_DIRECTION: 'rule_direction',
        RULE_END: 'rule_end',
        RULE_RACE: 'rule_race',
        YOUR_TIME: 'your_time',
        YOUR_MOVES: 'your_moves',
        UNDO_USED: 'undo_used'
    },

    // Debug helpers
    DEBUG: {
        SHOW_GRID_COORDS: false,
        SHOW_SOLUTION_PATH: false,
        SHOW_PHEROMONE_VALUES: false,
        LOG_AI_DECISIONS: false,
        HIGHLIGHT_VALID_MOVES: false
    }
};

// Freeze config to prevent accidental modification
Object.freeze(CONFIG);
Object.freeze(CONFIG.GAME);
Object.freeze(CONFIG.GRID);
Object.freeze(CONFIG.COLORS);
Object.freeze(CONFIG.DOT_TYPES);
Object.freeze(CONFIG.ACO);
Object.freeze(CONFIG.PLAYER);
Object.freeze(CONFIG.LEVELS);
Object.freeze(CONFIG.ANIMATION);
Object.freeze(CONFIG.AUDIO);
Object.freeze(CONFIG.UI);
Object.freeze(CONFIG.PERFORMANCE);
Object.freeze(CONFIG.STORAGE);
Object.freeze(CONFIG.I18N_KEYS);
Object.freeze(CONFIG.DEBUG);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
