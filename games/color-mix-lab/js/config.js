/**
 * Color Mix Lab - Configuration
 * All game constants and settings in one place
 */

export const CONFIG = {
    // Game settings
    GAME: {
        TARGET_AGE: '5-8',
        TOTAL_LEVELS: 5,
        TOTAL_STICKERS: 5
    },

    // Color definitions
    COLORS: {
        PRIMARY: {
            red: '#FF6B6B',
            blue: '#448AFF',
            yellow: '#FFE66D'
        },
        SECONDARY: {
            purple: '#9944FF',
            orange: '#FF8844',
            green: '#44DD44'
        },
        SPECIAL: {
            mud: '#8B6914'
        }
    },

    // Color result emojis (for displaying mix results)
    COLOR_EMOJIS: {
        red: '🔴',
        blue: '🔵',
        yellow: '🟡',
        orange: '🟠',
        green: '🟢',
        purple: '🟣',
        mud: '💩'
    },

    // Color mixing rules - only A+B=C patterns (no same-color effects)
    MIXING_RULES: {
        'red+blue': { result: 'purple', type: 'secondary' },
        'blue+red': { result: 'purple', type: 'secondary' },
        'red+yellow': { result: 'orange', type: 'secondary' },
        'yellow+red': { result: 'orange', type: 'secondary' },
        'blue+yellow': { result: 'green', type: 'secondary' },
        'yellow+blue': { result: 'green', type: 'secondary' }
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

    // Level configurations - 5 teaching levels + free mode
    // Teaching Phase (1-3): Single success, learn each combination
    // Mastery Phase (4-5): 3 successes, test learned combinations
    LEVELS: {
        1: {
            name: 'make_orange',
            availableColors: ['red', 'yellow'],
            goal: { type: 'secondary', color: 'orange', count: 1 },
            slots: 2,
            tutorial: 'handheld',
            sticker: 'orange'
        },
        2: {
            name: 'make_green',
            availableColors: ['blue', 'yellow'],
            goal: { type: 'secondary', color: 'green', count: 1 },
            slots: 2,
            tutorial: 'image',
            sticker: 'leaf'
        },
        3: {
            name: 'make_purple',
            availableColors: ['red', 'blue'],
            goal: { type: 'secondary', color: 'purple', count: 1 },
            slots: 2,
            tutorial: 'image',
            sticker: 'grape'
        },
        4: {
            name: 'orange_and_green',
            availableColors: ['red', 'blue', 'yellow'],
            goal: { type: 'multiple', colors: ['orange', 'green'], count: 3 },
            slots: 2,
            tutorial: 'none',
            sticker: 'rainbow'
        },
        5: {
            name: 'green_and_purple',
            availableColors: ['red', 'blue', 'yellow'],
            goal: { type: 'multiple', colors: ['green', 'purple'], count: 3 },
            slots: 2,
            tutorial: 'none',
            sticker: 'chameleon'
        }
    },

    // Free play mode configuration
    FREE_MODE: {
        enabled: true,
        unlockAfter: 5,
        availableColors: ['red', 'blue', 'yellow']
    },

    // Sticker definitions - earned after completing each level
    STICKERS: {
        orange: { emoji: '🍊', name: 'orange', level: 1 },
        leaf: { emoji: '🍀', name: 'leaf', level: 2 },
        grape: { emoji: '🍇', name: 'grape', level: 3 },
        rainbow: { emoji: '🌈', name: 'rainbow', level: 4 },
        chameleon: { emoji: '🦎', name: 'chameleon', level: 5 }
    },

    // Storage keys
    STORAGE: {
        PROGRESS: 'colorMixLab_progress',
        STICKERS: 'colorMixLab_stickers',
        SETTINGS: 'colorMixLab_settings'
    }
};

export default CONFIG;
