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

        // Scoring system (points awarded for matches)
        SCORE: {
            MATCH_3: 10,        // Points for matching 3 gems
            MATCH_4: 25,        // Points for matching 4 gems
            MATCH_5: 50,        // Points for matching 5 gems
            MATCH_6_PLUS: 80,   // Points for matching 6+ gems
            COMBO_BONUS: 5      // Additional points per combo level (cascade matches)
        },

        // Animation and interaction timing (all values in milliseconds)
        TIMING: {
            SWAP_DURATION: 200,         // Gem swap animation duration
            MATCH_DURATION: 300,        // Match animation and disappear duration
            FALL_DURATION: 400,         // Gem falling animation duration
            CASCADE_DELAY: 100,         // Delay before checking for cascade matches
            VICTORY_DELAY: 500,         // Delay before showing victory modal
            HINT_DELAY: 2000,           // Hint display duration
            BUTTON_TRANSITION: 150,     // Button hover transition duration
            TOAST_DURATION: 2000        // Toast notification display time
        },

        // Audio settings
        AUDIO: {
            MUSIC_VOLUME: 0.3,          // Background music volume (0.0-1.0)
            SFX_VOLUME: 0.5,            // Sound effects volume (0.0-1.0)
            MUSIC_FILES: [              // Background music files (played in sequence)
                'assets/sounds/01.mp3',
                'assets/sounds/02.mp3'
            ],
            USE_WEB_AUDIO: true         // Use Web Audio API for sound effects (no files needed)
        },

        // Visual effects configuration
        EFFECTS: {
            CONFETTI_COUNT: 50,             // Number of confetti particles on victory
            CONFETTI_DURATION: 3000,        // Confetti animation duration (ms)
            PARTICLE_COUNT: 10,             // Number of particles per effect
            SHAKE_INTENSITY: 5,             // Screen shake intensity (pixels)
            FLOATING_SCORE_DURATION: 1000,  // Floating score animation duration (ms)
            COMBO_DISPLAY_DURATION: 800,    // Combo text display duration (ms)
            STAR_BURST_OFFSET: 60,          // Star burst spread distance (pixels)
            STAR_BURST_DURATION: 600,       // Star burst animation duration (ms)
            STAGGER_DELAY: 50,              // Delay between staggered animations (ms)
            TOAST_SHOW_DELAY: 100,          // Toast fade-in delay (ms)
            TOAST_HIDE_TRANSITION: 300      // Toast fade-out duration (ms)
        }
    },

    // Board settings
    BOARD: {
        // Responsive sizes (mobile first) - in pixels
        CELL_SIZE_MOBILE: 44,      // Mobile (< 480px): compact for small screens
        CELL_SIZE_TABLET: 56,      // Tablet (480-767px): medium size for tablets
        CELL_SIZE_DESKTOP: 70,     // Desktop (768-1439px): larger for desktop monitors
        CELL_SIZE_LARGE: 80,       // Large desktop (1440px+): maximum size for large screens
        GEM_PADDING: 2,            // Space between gems in pixels
        BORDER_RADIUS: 16,         // Board corner rounding in pixels
        MIN_BOARD_SIZE: 320,       // Minimum board dimension in pixels (safety limit)
        MAX_BOARD_SIZE: 720,       // Maximum board dimension in pixels (prevents too large)

        // Dynamic sizing - use available space
        USE_DYNAMIC_SIZE: true,    // Enable responsive sizing based on viewport
        BOARD_MARGIN: 40,          // Margin from screen edges in pixels

        // Touch settings (accessibility compliance)
        MIN_TOUCH_TARGET: 44,      // iOS/Android minimum touch target (44x44 px)
        PREFERRED_TOUCH_TARGET: 48,// WCAG recommended touch target (48x48 px)
        TOUCH_INTENT_THRESHOLD: 10,// Pixels moved before recognizing drag intent

        // Animation settings (CSS easing functions)
        SWAP_EASING: 'ease-out',   // Smooth deceleration for gem swaps
        FALL_EASING: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Bounce effect for falling gems
        MATCH_EASING: 'ease-in-out', // Symmetrical acceleration for match animation

        // Board timing (milliseconds)
        GEM_FADE_DELAY: 50,        // Delay before new gems fade in (ms)
        GEM_FADE_DURATION: 200,    // Duration of gem fade-in animation (ms)
        SHUFFLE_DELAY: 500         // Delay before board becomes interactive after shuffle (ms)
    },

    // Gem settings
    GEM: {
        // Size ratios (relative to cell size, unitless)
        EMOJI_SIZE_RATIO: 0.6,       // Emoji font size = 60% of cell size
        BORDER_RADIUS_RATIO: 0.15,   // Border radius = 15% of cell size

        // Fruit types with emoji and color (6 distinct types)
        FRUITS: [
            { name: 'apple', emoji: '🍎', color: '#FF6B6B' },       // Red - easily distinguishable
            { name: 'blueberry', emoji: '🫐', color: '#5C6BC0' },   // Blue - high contrast
            { name: 'lemon', emoji: '🍋', color: '#FFE66D' },       // Yellow - bright
            { name: 'grape', emoji: '🍇', color: '#C779D0' },       // Purple - distinct
            { name: 'watermelon', emoji: '🍉', color: '#95E1D3' },  // Cyan - unique
            { name: 'kiwi', emoji: '🥝', color: '#7CB342' }         // Green - natural
        ],
        SIZE: 48,                    // Default gem size in pixels (fallback, CSS vars used in practice)
        BORDER_WIDTH: 2,             // Gem border thickness in pixels
        BORDER_COLOR: '#FFFFFF',     // White border for contrast
        SHADOW: '0 2px 4px rgba(0,0,0,0.2)',  // Default shadow (CSS string)
        GLOW_COLOR: 'rgba(255, 255, 255, 0.8)', // Selection glow color
        SELECTED_SCALE: 1.1,         // Scale multiplier when gem is selected (10% larger)
        MATCH_SCALE: 1.2             // Scale multiplier during match animation (20% larger)
    },

    // UI settings
    UI: {
        // UI text strings (i18n ready)
        TEXTS: {
            GAME_TITLE: 'Match Three',
            BUTTON_SHUFFLE: 'Shuffle',
            BUTTON_NEW_GAME: 'New Game',
            BUTTON_SETTINGS: 'Settings',
            BUTTON_MUSIC: 'Toggle Music',
            CONFIRM_NEW_GAME_TITLE: 'New Game',
            CONFIRM_NEW_GAME_MESSAGE: 'Start a new game? Current progress will be lost.',
            CONFIRM_YES: 'Start New Game',
            CONFIRM_CANCEL: 'Cancel'
        },

        // Color palette (hex values)
        COLORS: {
            BACKGROUND: '#F7F7F7',      // Light gray background
            PANEL_BG: '#FFFFFF',        // White panels for contrast
            TEXT_PRIMARY: '#2C3E50',    // Dark blue-gray for main text
            TEXT_SECONDARY: '#7F8C8D',  // Medium gray for secondary text
            SUCCESS: '#27AE60',         // Green for positive feedback
            WARNING: '#F39C12',         // Orange for warnings
            ERROR: '#E74C3C'            // Red for errors
        },

        // Responsive breakpoints (pixels, max-width)
        BREAKPOINTS: {
            MOBILE: 480,    // Phones and small screens (< 480px)
            TABLET: 768,    // Tablets (480-767px)
            DESKTOP: 1024,  // Standard desktops (768-1023px)
            LARGE: 1440     // Large monitors (1024-1439px, > 1440px)
        },

        // Layout dimensions (pixels) - used by Utils.getCellSize()
        HEADER_HEIGHT: 60,          // Fixed header height
        SCORE_PANEL_HEIGHT: 80,     // Score panel height
        CONTROLS_HEIGHT: 60,        // Bottom controls height

        // Typography (CSS font-size strings)
        FONT_SIZES: {
            HEADER: '24px',   // Game title
            SCORE: '32px',    // Score numbers
            BUTTON: '16px',   // Button text
            BODY: '16px',     // General text
            SMALL: '14px'     // Helper text
        }
    },

    // Accessibility (WCAG compliance)
    ACCESSIBILITY: {
        REDUCE_MOTION: false,    // Respect user's prefers-reduced-motion setting (detected at runtime)
        HIGH_CONTRAST: false     // High contrast mode toggle (future enhancement)
    },

    // Performance optimization settings
    PERFORMANCE: {
        TARGET_FPS: 60,          // Target frame rate (60 FPS for smooth animations)
        MAX_PARTICLES: 50,       // Maximum particle effects to prevent lag
        ENABLE_SHADOWS: true,    // CSS box-shadows (can disable for low-end devices)
        ENABLE_EFFECTS: true     // Visual effects toggle (disable for performance)
    },

    // Development and debugging
    DEBUG: {
        SHOW_GRID: false,        // Show grid lines for debugging layout
        SHOW_FPS: false,         // Display FPS counter (performance monitoring)
        LOG_MATCHES: false,      // Console log match events
        LOG_EVENTS: false        // Console log all game events
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
