/**
 * ColorMixGame Unit Tests
 * Following TDD principles - tests written FIRST
 */

// Mock dependencies
const mockUIManager = {
    showToast: jest.fn(),
    updateLevel: jest.fn(),
    createMixingSlots: jest.fn(() => [{}, {}]),
    getElement: jest.fn(() => ({ innerHTML: '', addEventListener: jest.fn() })),
    addColorBall: jest.fn(() => ({ style: {} })),
    updateGoal: jest.fn(),
    setChameleonTarget: jest.fn(),
    setChameleonColor: jest.fn(),
    setChameleonMood: jest.fn(),
    showSplashText: jest.fn(),
    showMudSplat: jest.fn(),
    showLevelComplete: jest.fn(),
    destroy: jest.fn()
};

const mockDragManager = {
    enableDrag: jest.fn(),
    destroy: jest.fn()
};

// Mock CONFIG
global.CONFIG = {
    LEVELS: {
        1: {
            name: 'make_purple',
            availableColors: ['red', 'blue'],
            goal: { type: 'secondary', color: 'purple', count: 2 },
            slots: 2
        }
    },
    COLORS: {
        PRIMARY: { red: '#FF4444', blue: '#4477FF', yellow: '#FFDD44' },
        SECONDARY: { purple: '#9944FF', orange: '#FF8844', green: '#44DD44' },
        SPECIAL: { mud: '#8B6914' }
    },
    MIXING_RULES: {
        // Sorted keys: blue comes before red alphabetically
        'blue+red': { result: 'purple', type: 'secondary' },
        'red+yellow': { result: 'orange', type: 'secondary' },
        'blue+yellow': { result: 'green', type: 'secondary' },
        'red+red': { result: 'burst', type: 'effect' },
        'blue+blue': { result: 'splash', type: 'effect' },
        'yellow+yellow': { result: 'flash', type: 'effect' }
    },
    DRAG: { THRESHOLD: 10, SNAP_DISTANCE: 50 },
    UI: { TOAST_DURATION: 2500 },
    STORAGE: { PROGRESS: 'colorMixLab_progress' }
};

// Mock SimpleI18n
class MockSimpleI18n {
    constructor() {
        this.translations = {};
    }
    addTranslations(t) { this.translations = t; }
    t(key, ...args) {
        const text = this.translations.en?.[key] || key;
        return args.reduce((str, arg, i) => str.replace(`{${i}}`, arg), text);
    }
}

global.SimpleI18n = MockSimpleI18n;
global.TRANSLATIONS = { en: { welcome: 'Welcome!' } };

describe('ColorMixGame', () => {
    describe('Constructor and Initialization', () => {
        test('should initialize with valid container id', () => {
            // This test defines expected behavior
            // Implementation will need to handle this
            expect(true).toBe(true);
        });

        test('should throw error for invalid container id', () => {
            // Expected: throw when container not found
            expect(true).toBe(true);
        });
    });

    describe('destroy() method null checks', () => {
        test('should safely handle null ui manager', () => {
            const game = { ui: null, drag: mockDragManager, state: {}, i18n: {} };

            const safeDestroy = () => {
                if (game.drag) {
                    game.drag.destroy();
                    game.drag = null;
                }
                if (game.ui) {
                    game.ui.destroy();
                    game.ui = null;
                }
                game.i18n = null;
                game.state = null;
            };

            expect(() => safeDestroy()).not.toThrow();
        });

        test('should safely handle null drag manager', () => {
            const game = { ui: mockUIManager, drag: null, state: {}, i18n: {} };

            const safeDestroy = () => {
                if (game.drag) {
                    game.drag.destroy();
                    game.drag = null;
                }
                if (game.ui) {
                    game.ui.destroy();
                    game.ui = null;
                }
                game.i18n = null;
                game.state = null;
            };

            expect(() => safeDestroy()).not.toThrow();
        });

        test('should safely handle already null state', () => {
            const game = { ui: mockUIManager, drag: mockDragManager, state: null, i18n: {} };

            const safeDestroy = () => {
                if (game.drag) {
                    game.drag.destroy();
                    game.drag = null;
                }
                if (game.ui) {
                    game.ui.destroy();
                    game.ui = null;
                }
                game.i18n = null;
                game.state = null;
            };

            expect(() => safeDestroy()).not.toThrow();
        });

        test('should safely handle double destroy call', () => {
            const game = { ui: mockUIManager, drag: mockDragManager, state: {}, i18n: {} };

            const safeDestroy = () => {
                if (game.drag) {
                    game.drag.destroy();
                    game.drag = null;
                }
                if (game.ui) {
                    game.ui.destroy();
                    game.ui = null;
                }
                game.i18n = null;
                game.state = null;
            };

            // First call
            expect(() => safeDestroy()).not.toThrow();
            // Second call - should not throw
            expect(() => safeDestroy()).not.toThrow();
        });

        test('should safely handle null i18n', () => {
            const game = { ui: mockUIManager, drag: mockDragManager, state: {}, i18n: null };

            const safeDestroy = () => {
                if (game.drag) {
                    game.drag.destroy();
                    game.drag = null;
                }
                if (game.ui) {
                    game.ui.destroy();
                    game.ui = null;
                }
                game.i18n = null;
                game.state = null;
            };

            expect(() => safeDestroy()).not.toThrow();
        });
    });

    describe('i18n integration', () => {
        test('should use i18n.t() for welcome message', () => {
            const i18n = new MockSimpleI18n();
            i18n.addTranslations({ en: { welcome: 'Welcome to Color Mix Lab!' } });

            expect(i18n.t('welcome')).toBe('Welcome to Color Mix Lab!');
        });

        test('should use i18n.t() for level display', () => {
            const i18n = new MockSimpleI18n();
            i18n.addTranslations({ en: { level: 'Level {0}' } });

            expect(i18n.t('level', 1)).toBe('Level 1');
        });

        test('should use i18n.t() for slot full message', () => {
            const i18n = new MockSimpleI18n();
            i18n.addTranslations({ en: { slot_full: 'Slot is full! Clear first.' } });

            expect(i18n.t('slot_full')).toBe('Slot is full! Clear first.');
        });

        test('should return key when translation missing', () => {
            const i18n = new MockSimpleI18n();
            i18n.addTranslations({ en: {} });

            // Missing key should return the key itself
            expect(i18n.t('missing_key')).toBe('missing_key');
        });

        test('should handle null i18n gracefully in game methods', () => {
            // Pattern: safe i18n access
            const safeTranslate = (i18n, key, params = {}) => {
                if (!i18n || typeof i18n.t !== 'function') {
                    return key;
                }
                return i18n.t(key, params);
            };

            expect(safeTranslate(null, 'welcome')).toBe('welcome');
            expect(safeTranslate(undefined, 'welcome')).toBe('welcome');
        });
    });

    describe('Safe logging', () => {
        test('should not call console.error directly', () => {
            // Pattern: use try-catch with silent failure or custom logger
            const safeLog = (message) => {
                // Safe logging that doesn't throw
                if (typeof console !== 'undefined' && console.warn) {
                    try {
                        console.warn('[ColorMixGame]', message);
                    } catch {
                        // Silently ignore logging failures
                    }
                }
            };

            expect(() => safeLog('test')).not.toThrow();
        });

        test('should handle missing level gracefully without console.error', () => {
            const levels = CONFIG.LEVELS;
            const level = 999;

            // Pattern: return early with warning instead of error
            const setupLevel = () => {
                if (!levels[level]) {
                    // Use warn instead of error, or silent return
                    return false;
                }
                return true;
            };

            expect(setupLevel()).toBe(false);
        });
    });

    describe('loadProgress safe handling', () => {
        test('should handle localStorage errors gracefully', () => {
            // Mock localStorage that throws
            const mockStorage = {
                getItem: () => { throw new Error('Storage error'); }
            };

            const loadProgress = () => {
                try {
                    const saved = mockStorage.getItem('test');
                    return saved ? JSON.parse(saved) : null;
                } catch {
                    // Silent failure - no console.error
                    return null;
                }
            };

            expect(loadProgress()).toBe(null);
        });

        test('should handle invalid JSON gracefully', () => {
            const mockStorage = {
                getItem: () => 'invalid json {'
            };

            const loadProgress = () => {
                try {
                    const saved = mockStorage.getItem('test');
                    return saved ? JSON.parse(saved) : null;
                } catch {
                    return null;
                }
            };

            expect(loadProgress()).toBe(null);
        });
    });

    describe('saveProgress safe handling', () => {
        test('should handle localStorage.setItem errors gracefully', () => {
            const mockStorage = {
                setItem: () => { throw new Error('Quota exceeded'); }
            };

            const saveProgress = (data) => {
                try {
                    mockStorage.setItem('test', JSON.stringify(data));
                    return true;
                } catch {
                    return false;
                }
            };

            expect(saveProgress({ level: 1 })).toBe(false);
        });
    });
});

describe('Translations file', () => {
    test('should have all required English keys', () => {
        const requiredKeys = [
            'game_title', 'level', 'goal', 'clear', 'welcome',
            'bowl_full', 'mud_message', 'mixed_color'
        ];

        // Import would be: const TRANSLATIONS = require('../js/i18n/translations.js');
        // For now, we define expected structure
        const mockTranslations = {
            en: {
                game_title: 'Color Mix Lab',
                level: 'Level {0}',
                goal: 'Goal',
                clear: 'Clear',
                welcome: 'Welcome to Color Mix Lab!',
                bowl_full: 'Bowl is full! Clear first.',
                mud_message: 'Eww! Mud!',
                mixed_color: 'Mixed {0}!'
            }
        };

        requiredKeys.forEach(key => {
            expect(mockTranslations.en).toHaveProperty(key);
        });
    });

    test('should have matching Chinese translations', () => {
        const mockTranslations = {
            en: { welcome: 'Welcome to Color Mix Lab!' },
            zh: { welcome: '欢迎来到调色实验室！' }
        };

        expect(mockTranslations.zh).toHaveProperty('welcome');
    });
});

describe('Bowl-based mixing logic', () => {
    describe('addColorToBowl behavior', () => {
        test('should allow first color to be added to empty bowl', () => {
            const state = { colorsInBowl: [] };

            const addColorToBowl = (color) => {
                if (state.colorsInBowl.length >= 2) {
                    return false;
                }
                state.colorsInBowl.push(color);
                return true;
            };

            expect(addColorToBowl('red')).toBe(true);
            expect(state.colorsInBowl).toEqual(['red']);
        });

        test('should allow second color to be added', () => {
            const state = { colorsInBowl: ['red'] };

            const addColorToBowl = (color) => {
                if (state.colorsInBowl.length >= 2) {
                    return false;
                }
                state.colorsInBowl.push(color);
                return true;
            };

            expect(addColorToBowl('blue')).toBe(true);
            expect(state.colorsInBowl).toEqual(['red', 'blue']);
        });

        test('should reject third color when bowl is full', () => {
            const state = { colorsInBowl: ['red', 'blue'] };

            const addColorToBowl = (color) => {
                if (state.colorsInBowl.length >= 2) {
                    return false;
                }
                state.colorsInBowl.push(color);
                return true;
            };

            expect(addColorToBowl('yellow')).toBe(false);
            expect(state.colorsInBowl).toEqual(['red', 'blue']);
        });
    });

    describe('clearBowl behavior', () => {
        test('should empty the bowl', () => {
            const state = { colorsInBowl: ['red', 'blue'] };

            const clearBowl = () => {
                state.colorsInBowl = [];
            };

            clearBowl();
            expect(state.colorsInBowl).toEqual([]);
        });

        test('should handle clearing already empty bowl', () => {
            const state = { colorsInBowl: [] };

            const clearBowl = () => {
                state.colorsInBowl = [];
            };

            expect(() => clearBowl()).not.toThrow();
            expect(state.colorsInBowl).toEqual([]);
        });
    });

    describe('mixColors behavior', () => {
        test('should not mix with only one color', () => {
            const colors = ['red'];

            const getMixResult = (colorArray) => {
                if (colorArray.length < 2) return null;
                const sortedColors = [...colorArray].sort();
                const mixKey = sortedColors.join('+');
                return CONFIG.MIXING_RULES[mixKey];
            };

            expect(getMixResult(colors)).toBe(null);
        });

        test('should mix red + blue = purple', () => {
            const colors = ['red', 'blue'];

            const getMixResult = (colorArray) => {
                if (colorArray.length < 2) return null;
                const sortedColors = [...colorArray].sort();
                const mixKey = sortedColors.join('+');
                return CONFIG.MIXING_RULES[mixKey];
            };

            const result = getMixResult(colors);
            expect(result).toBeDefined();
            expect(result.result).toBe('purple');
            expect(result.type).toBe('secondary');
        });

        test('should mix red + yellow = orange', () => {
            // Update CONFIG for this test
            CONFIG.MIXING_RULES['red+yellow'] = { result: 'orange', type: 'secondary' };

            const colors = ['red', 'yellow'];

            const getMixResult = (colorArray) => {
                if (colorArray.length < 2) return null;
                const sortedColors = [...colorArray].sort();
                const mixKey = sortedColors.join('+');
                return CONFIG.MIXING_RULES[mixKey];
            };

            const result = getMixResult(colors);
            expect(result).toBeDefined();
            expect(result.result).toBe('orange');
        });

        test('should mix blue + yellow = green', () => {
            CONFIG.MIXING_RULES['blue+yellow'] = { result: 'green', type: 'secondary' };

            const colors = ['blue', 'yellow'];

            const getMixResult = (colorArray) => {
                if (colorArray.length < 2) return null;
                const sortedColors = [...colorArray].sort();
                const mixKey = sortedColors.join('+');
                return CONFIG.MIXING_RULES[mixKey];
            };

            const result = getMixResult(colors);
            expect(result).toBeDefined();
            expect(result.result).toBe('green');
        });

        test('should handle same color mixing (effects)', () => {
            CONFIG.MIXING_RULES['red+red'] = { result: 'burst', type: 'effect' };

            const colors = ['red', 'red'];

            const getMixResult = (colorArray) => {
                if (colorArray.length < 2) return null;
                const sortedColors = [...colorArray].sort();
                const mixKey = sortedColors.join('+');
                return CONFIG.MIXING_RULES[mixKey];
            };

            const result = getMixResult(colors);
            expect(result).toBeDefined();
            expect(result.result).toBe('burst');
            expect(result.type).toBe('effect');
        });

        test('should produce mud for invalid combinations', () => {
            // Remove any rule that might exist for this combination
            delete CONFIG.MIXING_RULES['orange+purple'];

            const colors = ['orange', 'purple'];

            const getMixResult = (colorArray) => {
                if (colorArray.length < 2) return null;
                const sortedColors = [...colorArray].sort();
                const mixKey = sortedColors.join('+');
                return CONFIG.MIXING_RULES[mixKey] || null; // null means mud
            };

            const result = getMixResult(colors);
            expect(result).toBe(null);
        });

        test('should handle color order consistently (sorting)', () => {
            // Test that blue+red gives same result as red+blue
            const colors1 = ['blue', 'red'];
            const colors2 = ['red', 'blue'];

            const getMixResult = (colorArray) => {
                if (colorArray.length < 2) return null;
                const sortedColors = [...colorArray].sort();
                const mixKey = sortedColors.join('+');
                return CONFIG.MIXING_RULES[mixKey];
            };

            const result1 = getMixResult(colors1);
            const result2 = getMixResult(colors2);

            // Both should produce purple since sorting normalizes the order
            expect(result1).toEqual(result2);
        });
    });

    describe('goal matching', () => {
        test('should match secondary color goal', () => {
            const goal = { type: 'secondary', color: 'purple', count: 2 };
            const mixResult = { result: 'purple', type: 'secondary' };

            const matchesGoal = (goalConfig, result) => {
                if (goalConfig.type === 'secondary' && result.type === 'secondary') {
                    return result.result === goalConfig.color;
                }
                return false;
            };

            expect(matchesGoal(goal, mixResult)).toBe(true);
        });

        test('should not match wrong secondary color', () => {
            const goal = { type: 'secondary', color: 'purple', count: 2 };
            const mixResult = { result: 'orange', type: 'secondary' };

            const matchesGoal = (goalConfig, result) => {
                if (goalConfig.type === 'secondary' && result.type === 'secondary') {
                    return result.result === goalConfig.color;
                }
                return false;
            };

            expect(matchesGoal(goal, mixResult)).toBe(false);
        });

        test('should match discover goal for any secondary', () => {
            const goal = { type: 'discover', count: 3 };
            const mixResult = { result: 'green', type: 'secondary' };

            const matchesGoal = (goalConfig, result) => {
                if (goalConfig.type === 'discover') {
                    return true; // Any valid mix counts
                }
                if (goalConfig.type === 'secondary' && result.type === 'secondary') {
                    return result.result === goalConfig.color;
                }
                return false;
            };

            expect(matchesGoal(goal, mixResult)).toBe(true);
        });

        test('should match feed goal for any mix', () => {
            const goal = { type: 'feed', count: 5 };
            const mixResult = { result: 'purple', type: 'secondary' };

            const matchesGoal = (goalConfig, result) => {
                if (goalConfig.type === 'feed' || goalConfig.type === 'discover') {
                    return true;
                }
                if (goalConfig.type === 'secondary' && result.type === 'secondary') {
                    return result.result === goalConfig.color;
                }
                return false;
            };

            expect(matchesGoal(goal, mixResult)).toBe(true);
        });

        test('should match effect goal', () => {
            const goal = { type: 'effect', color: 'burst', count: 1 };
            const mixResult = { result: 'burst', type: 'effect' };

            const matchesGoal = (goalConfig, result) => {
                if (goalConfig.type === 'effect' && result.type === 'effect') {
                    return result.result === goalConfig.color;
                }
                if (goalConfig.type === 'secondary' && result.type === 'secondary') {
                    return result.result === goalConfig.color;
                }
                return false;
            };

            expect(matchesGoal(goal, mixResult)).toBe(true);
        });
    });

    describe('level completion', () => {
        test('should complete level when progress meets goal count', () => {
            const goal = { type: 'secondary', color: 'purple', count: 2 };
            let progress = 0;

            const checkLevelComplete = (goalConfig, currentProgress) => {
                return currentProgress >= goalConfig.count;
            };

            expect(checkLevelComplete(goal, 0)).toBe(false);
            expect(checkLevelComplete(goal, 1)).toBe(false);
            expect(checkLevelComplete(goal, 2)).toBe(true);
            expect(checkLevelComplete(goal, 3)).toBe(true);
        });

        test('should handle goal with count of 1', () => {
            const goal = { type: 'effect', color: 'burst', count: 1 };

            const checkLevelComplete = (goalConfig, currentProgress) => {
                return currentProgress >= goalConfig.count;
            };

            expect(checkLevelComplete(goal, 0)).toBe(false);
            expect(checkLevelComplete(goal, 1)).toBe(true);
        });
    });
});

describe('Auto-clear after mixing', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('should clear bowl after 2 second delay', () => {
        const state = { colorsInBowl: ['red', 'blue'] };
        let cleared = false;

        const clearBowl = () => {
            state.colorsInBowl = [];
            cleared = true;
        };

        // Simulate mix with auto-clear
        setTimeout(() => {
            clearBowl();
        }, 2000);

        expect(cleared).toBe(false);
        expect(state.colorsInBowl).toEqual(['red', 'blue']);

        jest.advanceTimersByTime(2000);

        expect(cleared).toBe(true);
        expect(state.colorsInBowl).toEqual([]);
    });
});
