/**
 * Match Three Game Configuration
 * All game constants and settings in one place
 */

const CONFIG = {
    // Game settings
    GAME: {
        GRID_SIZE: 8,
        GEM_TYPES: 6,
        MIN_MATCH: 3,

        // Difficulty settings
        DIFFICULTY: {
            EASY: { targetScore: 500, label: 'Easy' },
            MEDIUM: { targetScore: 1000, label: 'Medium' },
            HARD: { targetScore: 1500, label: 'Hard' }
        },
        DEFAULT_DIFFICULTY: 'EASY',

        // Scoring (lower values for slower progression)
        SCORE: {
            MATCH_3: 10,
            MATCH_4: 25,
            MATCH_5: 50,
            MATCH_6_PLUS: 80,
            COMBO_BONUS: 5
        },

        // Timing
        TIMING: {
            SWAP_DURATION: 200,
            MATCH_DURATION: 300,
            FALL_DURATION: 400,
            CASCADE_DELAY: 100,
            VICTORY_DELAY: 500,
            HINT_DELAY: 2000,
            BUTTON_TRANSITION: 150,
            TOAST_DURATION: 2000
        },

        // Audio
        AUDIO: {
            MUSIC_VOLUME: 0.3,
            SFX_VOLUME: 0.5,
            MUSIC_FILES: [
                'assets/sounds/01.mp3',
                'assets/sounds/02.mp3'
            ],
            // Sound effects generated via Web Audio API (no files needed)
            USE_WEB_AUDIO: true
        },

        // Visual effects
        EFFECTS: {
            CONFETTI_COUNT: 50,
            CONFETTI_DURATION: 3000,
            PARTICLE_COUNT: 10,
            SHAKE_INTENSITY: 5,
            FLOATING_SCORE_DURATION: 1000,
            COMBO_DISPLAY_DURATION: 800,
            STAR_BURST_OFFSET: 60,
            STAR_BURST_DURATION: 600,
            STAGGER_DELAY: 50,
            TOAST_SHOW_DELAY: 100,
            TOAST_HIDE_TRANSITION: 300
        }
    },

    // Board settings
    BOARD: {
        // Responsive sizes (mobile first)
        CELL_SIZE_MOBILE: 44,      // Mobile: compact for small screens
        CELL_SIZE_TABLET: 56,      // Tablet: medium size
        CELL_SIZE_DESKTOP: 70,     // Desktop: larger for big screens
        CELL_SIZE_LARGE: 80,       // Large desktop (1440px+)
        GEM_PADDING: 2,
        BORDER_RADIUS: 16,
        MIN_BOARD_SIZE: 320,
        MAX_BOARD_SIZE: 720,       // Allow larger boards

        // Dynamic sizing - use available space
        USE_DYNAMIC_SIZE: true,
        BOARD_MARGIN: 40,          // Margin from edges

        // Touch settings
        MIN_TOUCH_TARGET: 44,
        PREFERRED_TOUCH_TARGET: 48,
        TOUCH_INTENT_THRESHOLD: 10, // pixels moved before drag

        // Animation settings
        SWAP_EASING: 'ease-out',
        FALL_EASING: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Bounce effect
        MATCH_EASING: 'ease-in-out',

        // Board timing
        GEM_FADE_DELAY: 50,
        GEM_FADE_DURATION: 200,
        SHUFFLE_DELAY: 500
    },

    // Gem settings
    GEM: {
        // Size ratios (relative to cell size)
        EMOJI_SIZE_RATIO: 0.6,       // 60% of cell for emoji
        BORDER_RADIUS_RATIO: 0.15,   // 15% of cell for rounded corners

        // Fruit types with emoji fallback
        FRUITS: [
            { name: 'apple', emoji: '🍎', color: '#FF6B6B' },
            { name: 'blueberry', emoji: '🫐', color: '#5C6BC0' },
            { name: 'lemon', emoji: '🍋', color: '#FFE66D' },
            { name: 'grape', emoji: '🍇', color: '#C779D0' },
            { name: 'watermelon', emoji: '🍉', color: '#95E1D3' },
            { name: 'kiwi', emoji: '🥝', color: '#7CB342' }
        ],
        SIZE: 48,
        BORDER_WIDTH: 2,
        BORDER_COLOR: '#FFFFFF',
        SHADOW: '0 2px 4px rgba(0,0,0,0.2)',
        GLOW_COLOR: 'rgba(255, 255, 255, 0.8)',
        SELECTED_SCALE: 1.1,
        MATCH_SCALE: 1.2
    },

    // UI settings
    UI: {
        COLORS: {
            BACKGROUND: '#F7F7F7',
            PANEL_BG: '#FFFFFF',
            TEXT_PRIMARY: '#2C3E50',
            TEXT_SECONDARY: '#7F8C8D',
            SUCCESS: '#27AE60',
            WARNING: '#F39C12',
            ERROR: '#E74C3C'
        },

        BREAKPOINTS: {
            MOBILE: 480,
            TABLET: 768,
            DESKTOP: 1024,
            LARGE: 1440
        },

        HEADER_HEIGHT: 60,
        SCORE_PANEL_HEIGHT: 80,
        CONTROLS_HEIGHT: 60,

        FONT_SIZES: {
            HEADER: '24px',
            SCORE: '32px',
            BUTTON: '16px',
            BODY: '16px',
            SMALL: '14px'
        }
    },

    // Accessibility
    ACCESSIBILITY: {
        REDUCE_MOTION: false,    // Respect prefers-reduced-motion
        HIGH_CONTRAST: false
    },

    // Performance
    PERFORMANCE: {
        TARGET_FPS: 60,
        MAX_PARTICLES: 50,
        ENABLE_SHADOWS: true,
        ENABLE_EFFECTS: true
    },

    // Development
    DEBUG: {
        SHOW_GRID: false,
        SHOW_FPS: false,
        LOG_MATCHES: false,
        LOG_EVENTS: false
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
