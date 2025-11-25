/**
 * Unified Configuration for Puzzle Master
 * Consolidates all game and board constants
 */

const CONFIG = {
    // Game settings
    GAME: {
        DEFAULT_IMAGES: [
            '../lib/images/background/2.png',
            '../lib/images/background/3.png'
        ],
        MUSIC_FILES: ['assets/sounds/m1.mp3', 'assets/sounds/m2.mp3'],
        MUSIC_VOLUME: 0.4,
        CONFETTI_COUNT: 30,
        CONFETTI_DURATION: 4000,
        CELEBRATION_DELAY: 1500,
        STATS_DISPLAY_DURATION: 4000,
        TOAST_DURATION: 3000,
        HINT_DURATION: 2500,
        TUTORIAL_DELAY: 1000,
        WINS_PER_DIFFICULTY_UPGRADE: 2,
        MAX_DIFFICULTY: 5,
        DIFFICULTY_LABELS: {
            2: 'Easy (4)',
            3: 'Medium (9)',
            4: 'Hard (16)',
            5: 'Expert (25)'
        },
        // Generated image fallback settings
        GENERATED_IMAGE: {
            SIZE: 400,
            CIRCLE_RADIUS: 60,
            CIRCLE_X: 100,
            CIRCLE_Y: 100
        }
    },

    // Board settings
    BOARD: {
        SNAP_DISTANCES: {
            2: 80,  // Easy: very forgiving
            3: 60,  // Medium: forgiving
            4: 50,  // Hard: moderate
            5: 40   // Expert: still reasonable
        },
        MIN_SIZE: 300,
        CONTAINER_PADDING: 16,
        HINT_DURATION: 2500,
        COMPLETION_MESSAGE_DURATION: 3000,
        COMPLETION_CALLBACK_DELAY: 500
    },

    // Piece settings
    PIECE: {
        DEFAULT_Z_INDEX: 1,
        DRAGGING_Z_INDEX: 9999,
        DROP_MARGIN: 50,  // Allow some overflow when checking drop area
        GLOW_DURATION: 500,
        GLOW_COLOR: 'rgba(76, 175, 80, 0.8)'
    },

    // Image loader settings
    IMAGE_LOADER: {
        CACHE_MAX_SIZE: 10,
        ERROR_MESSAGES: {
            NOT_IMAGE: 'The selected file is not a valid image format',
            LOAD_FAILED: 'Failed to load image. Please try another file',
            READ_FAILED: 'Failed to read file. The file may be corrupted',
            URL_FAILED: 'Failed to load image from URL. Please check the URL',
            CAMERA_NOT_SUPPORTED: 'Camera is not supported in this browser',
            CAMERA_ACCESS_DENIED: 'Camera access was denied. Please allow camera access',
            CAMERA_CANCELLED: 'Camera capture was cancelled',
            VIDEO_ERROR: 'Video stream error occurred'
        }
    }
};

// Export for module usage (if needed in future)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
