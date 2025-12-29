/**
 * Color Mix Lab - Configuration
 * All game constants and settings in one place
 */

const CONFIG = {
    // Game settings
    GAME: {
        TARGET_AGE: '5-8',
        TOTAL_LEVELS: 5,
        TOTAL_STICKERS: 6
    },

    // Color definitions
    COLORS: {
        PRIMARY: {
            red: '#FF4444',
            blue: '#4477FF',
            yellow: '#FFDD44'
        },
        SECONDARY: {
            purple: '#9944FF',
            orange: '#FF8844',
            green: '#44DD44'
        },
        SPECIAL: {
            mud: '#8B6914',
            burst: '#FF6666',
            splash: '#66AAFF',
            flash: '#FFEE66'
        }
    },

    // Color mixing rules
    MIXING_RULES: {
        // Two different colors -> secondary
        'red+blue': { result: 'purple', type: 'secondary' },
        'blue+red': { result: 'purple', type: 'secondary' },
        'red+yellow': { result: 'orange', type: 'secondary' },
        'yellow+red': { result: 'orange', type: 'secondary' },
        'blue+yellow': { result: 'green', type: 'secondary' },
        'yellow+blue': { result: 'green', type: 'secondary' },
        // Same colors -> effects
        'red+red': { result: 'burst', type: 'effect' },
        'blue+blue': { result: 'splash', type: 'effect' },
        'yellow+yellow': { result: 'flash', type: 'effect' }
    },

    // UI settings
    UI: {
        BALL_SIZE: 80,
        BALL_SIZE_MOBILE: 70,
        SLOT_SIZE: 100,
        SLOT_SIZE_MOBILE: 90,
        CHAMELEON_SIZE: 200,
        TOUCH_TARGET_MIN: 44,
        ANIMATION_DURATION: 300,
        CELEBRATION_DURATION: 2000,
        TOAST_DURATION: 2500
    },

    // Drag settings
    DRAG: {
        THRESHOLD: 10,
        SNAP_DISTANCE: 50
    },

    // Audio settings
    AUDIO: {
        VOLUME_MUSIC: 0.3,
        VOLUME_SFX: 0.5,
        MUSIC_TRACKS: ['assets/sounds/bgm.mp3'],
        SFX: {
            pickup: 'assets/sounds/pickup.mp3',
            drop: 'assets/sounds/drop.mp3',
            mix: 'assets/sounds/mix.mp3',
            success: 'assets/sounds/success.mp3',
            mud: 'assets/sounds/mud.mp3',
            sticker: 'assets/sounds/sticker.mp3'
        }
    },

    // Level configurations - focused on color mixing learning
    LEVELS: {
        1: {
            name: 'make_purple',
            availableColors: ['red', 'blue'],
            goal: { type: 'secondary', color: 'purple', count: 2 },
            slots: 2,
            tutorial: true,
            hint: 'Mix red and blue!'
        },
        2: {
            name: 'make_orange',
            availableColors: ['red', 'yellow'],
            goal: { type: 'secondary', color: 'orange', count: 2 },
            slots: 2,
            tutorial: false,
            hint: 'Mix red and yellow!'
        },
        3: {
            name: 'make_green',
            availableColors: ['blue', 'yellow'],
            goal: { type: 'secondary', color: 'green', count: 2 },
            slots: 2,
            tutorial: false,
            hint: 'Mix blue and yellow!'
        },
        4: {
            name: 'all_colors',
            availableColors: ['red', 'blue', 'yellow'],
            goal: { type: 'discover', count: 3 },
            slots: 2,
            tutorial: false,
            hint: 'Make any 3 mixed colors!'
        },
        5: {
            name: 'color_master',
            availableColors: ['red', 'blue', 'yellow'],
            goal: { type: 'feed', count: 5 },
            slots: 2,
            tutorial: false,
            hint: 'Feed the chameleon 5 colors!'
        }
    },

    // Sticker definitions
    STICKERS: {
        purple: { emoji: '🟣', name: 'purple' },
        orange: { emoji: '🟠', name: 'orange' },
        green: { emoji: '🟢', name: 'green' },
        burst: { emoji: '💥', name: 'burst' },
        splash: { emoji: '💦', name: 'splash' },
        flash: { emoji: '⚡', name: 'flash' }
    },

    // Storage keys
    STORAGE: {
        PROGRESS: 'colorMixLab_progress',
        STICKERS: 'colorMixLab_stickers',
        SETTINGS: 'colorMixLab_settings'
    }
};

// Export for Node.js tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

// Export for browser
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}
