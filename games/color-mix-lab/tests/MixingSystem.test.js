/**
 * MixingSystem Unit Tests
 * TDD: Tests written FIRST before implementation
 * Extracted from ColorMixGame mixing logic
 */

// Mock CONFIG - matches new v2.0 design (no same-color effects)
const mockConfig = {
    COLORS: {
        PRIMARY: { red: '#FF6B6B', blue: '#448AFF', yellow: '#FFE66D' },
        SECONDARY: { purple: '#9944FF', orange: '#FF8844', green: '#44DD44' },
        SPECIAL: { mud: '#8B6914' }
    },
    COLOR_EMOJIS: {
        red: '🔴',
        blue: '🔵',
        yellow: '🟡',
        orange: '🟠',
        green: '🟢',
        purple: '🟣',
        mud: '💩'
    },
    MIXING_RULES: {
        'blue+red': { result: 'purple', type: 'secondary' },
        'red+yellow': { result: 'orange', type: 'secondary' },
        'blue+yellow': { result: 'green', type: 'secondary' }
    },
    STICKERS: {
        orange: { emoji: '🍊', name: 'orange', level: 1 },
        leaf: { emoji: '🍀', name: 'leaf', level: 2 },
        grape: { emoji: '🍇', name: 'grape', level: 3 },
        rainbow: { emoji: '🌈', name: 'rainbow', level: 4 },
        chameleon: { emoji: '🦎', name: 'chameleon', level: 5 }
    }
};

global.CONFIG = mockConfig;

// Import after CONFIG is set
const MixingSystem = require('../js/systems/MixingSystem');

describe('MixingSystem', () => {
    let mixingSystem;

    beforeEach(() => {
        mixingSystem = new MixingSystem(mockConfig);
    });

    describe('Constructor', () => {
        test('should initialize with config', () => {
            expect(mixingSystem).toBeDefined();
            expect(mixingSystem.config).toBe(mockConfig);
        });

        test('should initialize with empty bowl', () => {
            expect(mixingSystem.getColorsInBowl()).toEqual([]);
        });

        test('should use global CONFIG if not provided', () => {
            const system = new MixingSystem();
            expect(system.config).toBe(mockConfig);
        });
    });

    describe('addColor', () => {
        test('should add first color to empty bowl', () => {
            const result = mixingSystem.addColor('red');
            expect(result.success).toBe(true);
            expect(result.colorsInBowl).toEqual(['red']);
        });

        test('should add second color', () => {
            mixingSystem.addColor('red');
            const result = mixingSystem.addColor('blue');
            expect(result.success).toBe(true);
            expect(result.colorsInBowl).toEqual(['red', 'blue']);
        });

        test('should reject third color when bowl is full', () => {
            mixingSystem.addColor('red');
            mixingSystem.addColor('blue');
            const result = mixingSystem.addColor('yellow');
            expect(result.success).toBe(false);
            expect(result.reason).toBe('bowl_full');
            expect(result.colorsInBowl).toEqual(['red', 'blue']);
        });

        test('should trigger auto-mix when second color added', () => {
            mixingSystem.addColor('red');
            const result = mixingSystem.addColor('blue');
            expect(result.mixed).toBe(true);
            expect(result.mixResult).toBeDefined();
        });

        test('should return color hex for first color', () => {
            const result = mixingSystem.addColor('red');
            expect(result.colorHex).toBe('#FF6B6B');
        });
    });

    describe('mix', () => {
        test('should return null if less than 2 colors', () => {
            mixingSystem.addColor('red');
            const result = mixingSystem.mix();
            expect(result).toBe(null);
        });

        test('should mix red + blue = purple', () => {
            mixingSystem.addColor('red');
            mixingSystem.addColor('blue');
            const result = mixingSystem.mix();
            expect(result.result).toBe('purple');
            expect(result.type).toBe('secondary');
            expect(result.resultHex).toBe('#9944FF');
        });

        test('should mix red + yellow = orange', () => {
            mixingSystem.addColor('red');
            mixingSystem.addColor('yellow');
            const result = mixingSystem.mix();
            expect(result.result).toBe('orange');
            expect(result.type).toBe('secondary');
            expect(result.resultHex).toBe('#FF8844');
        });

        test('should mix blue + yellow = green', () => {
            mixingSystem.addColor('blue');
            mixingSystem.addColor('yellow');
            const result = mixingSystem.mix();
            expect(result.result).toBe('green');
            expect(result.type).toBe('secondary');
            expect(result.resultHex).toBe('#44DD44');
        });

        test('should produce mud for same color mixing (red + red)', () => {
            mixingSystem.addColor('red');
            mixingSystem.addColor('red');
            const result = mixingSystem.mix();
            expect(result.result).toBe('mud');
            expect(result.type).toBe('mud');
        });

        test('should produce mud for same color mixing (blue + blue)', () => {
            mixingSystem.addColor('blue');
            mixingSystem.addColor('blue');
            const result = mixingSystem.mix();
            expect(result.result).toBe('mud');
            expect(result.type).toBe('mud');
        });

        test('should produce mud for same color mixing (yellow + yellow)', () => {
            mixingSystem.addColor('yellow');
            mixingSystem.addColor('yellow');
            const result = mixingSystem.mix();
            expect(result.result).toBe('mud');
            expect(result.type).toBe('mud');
        });

        test('should produce mud for unknown combinations', () => {
            // Force unknown combination by modifying colors
            mixingSystem.colorsInBowl = ['orange', 'purple'];
            const result = mixingSystem.mix();
            expect(result.result).toBe('mud');
            expect(result.type).toBe('mud');
            expect(result.resultHex).toBe('#8B6914');
        });

        test('should normalize color order (blue+red = red+blue)', () => {
            const system1 = new MixingSystem(mockConfig);
            system1.addColor('blue');
            system1.addColor('red');

            const system2 = new MixingSystem(mockConfig);
            system2.addColor('red');
            system2.addColor('blue');

            expect(system1.mix().result).toBe(system2.mix().result);
        });

        test('should include emoji in result for secondary colors', () => {
            mixingSystem.addColor('red');
            mixingSystem.addColor('yellow');
            const result = mixingSystem.mix();
            // Orange color emoji from COLOR_EMOJIS config
            expect(result.emoji).toBe('🟠');
        });
    });

    describe('clear', () => {
        test('should empty the bowl', () => {
            mixingSystem.addColor('red');
            mixingSystem.addColor('blue');
            mixingSystem.clear();
            expect(mixingSystem.getColorsInBowl()).toEqual([]);
        });

        test('should handle clearing already empty bowl', () => {
            expect(() => mixingSystem.clear()).not.toThrow();
            expect(mixingSystem.getColorsInBowl()).toEqual([]);
        });
    });

    describe('getColorsInBowl', () => {
        test('should return copy of colors array', () => {
            mixingSystem.addColor('red');
            const colors = mixingSystem.getColorsInBowl();
            colors.push('blue'); // Modify returned array
            expect(mixingSystem.getColorsInBowl()).toEqual(['red']); // Original unchanged
        });
    });

    describe('isBowlFull', () => {
        test('should return false for empty bowl', () => {
            expect(mixingSystem.isBowlFull()).toBe(false);
        });

        test('should return false for one color', () => {
            mixingSystem.addColor('red');
            expect(mixingSystem.isBowlFull()).toBe(false);
        });

        test('should return true for two colors', () => {
            mixingSystem.addColor('red');
            mixingSystem.addColor('blue');
            expect(mixingSystem.isBowlFull()).toBe(true);
        });
    });

    describe('canMix', () => {
        test('should return false with zero colors', () => {
            expect(mixingSystem.canMix()).toBe(false);
        });

        test('should return false with one color', () => {
            mixingSystem.addColor('red');
            expect(mixingSystem.canMix()).toBe(false);
        });

        test('should return true with two colors', () => {
            mixingSystem.addColor('red');
            mixingSystem.addColor('blue');
            expect(mixingSystem.canMix()).toBe(true);
        });
    });

    describe('getPrimaryColorHex', () => {
        test('should return hex for primary colors', () => {
            expect(mixingSystem.getPrimaryColorHex('red')).toBe('#FF6B6B');
            expect(mixingSystem.getPrimaryColorHex('blue')).toBe('#448AFF');
            expect(mixingSystem.getPrimaryColorHex('yellow')).toBe('#FFE66D');
        });

        test('should return null for unknown color', () => {
            expect(mixingSystem.getPrimaryColorHex('purple')).toBe(null);
        });
    });

    describe('matchesGoal', () => {
        test('should match secondary color goal', () => {
            const goal = { type: 'secondary', color: 'purple', count: 2 };
            const mixResult = { result: 'purple', type: 'secondary' };
            expect(mixingSystem.matchesGoal(goal, mixResult)).toBe(true);
        });

        test('should not match wrong secondary color', () => {
            const goal = { type: 'secondary', color: 'purple', count: 2 };
            const mixResult = { result: 'orange', type: 'secondary' };
            expect(mixingSystem.matchesGoal(goal, mixResult)).toBe(false);
        });

        test('should not count mud as valid secondary result', () => {
            const goal = { type: 'secondary', color: 'purple', count: 1 };
            const mixResult = { result: 'mud', type: 'mud' };
            expect(mixingSystem.matchesGoal(goal, mixResult)).toBe(false);
        });

        test('should match discover goal for any valid mix', () => {
            const goal = { type: 'discover', count: 3 };
            const mixResult = { result: 'green', type: 'secondary' };
            expect(mixingSystem.matchesGoal(goal, mixResult)).toBe(true);
        });

        test('should match feed goal for any valid mix', () => {
            const goal = { type: 'feed', count: 5 };
            const mixResult = { result: 'purple', type: 'secondary' };
            expect(mixingSystem.matchesGoal(goal, mixResult)).toBe(true);
        });

        test('should match multiple goal when result in colors list', () => {
            const goal = { type: 'multiple', colors: ['purple', 'orange'], count: 2 };
            const mixResult = { result: 'purple', type: 'secondary' };
            expect(mixingSystem.matchesGoal(goal, mixResult)).toBe(true);
        });

        test('should not match multiple goal when result not in colors list', () => {
            const goal = { type: 'multiple', colors: ['purple', 'orange'], count: 2 };
            const mixResult = { result: 'green', type: 'secondary' };
            expect(mixingSystem.matchesGoal(goal, mixResult)).toBe(false);
        });

        test('should not match mud result', () => {
            const goal = { type: 'discover', count: 3 };
            const mixResult = { result: 'mud', type: 'mud' };
            expect(mixingSystem.matchesGoal(goal, mixResult)).toBe(false);
        });
    });

    describe('isLevelComplete', () => {
        test('should return false when progress below goal', () => {
            const goal = { type: 'secondary', color: 'purple', count: 2 };
            expect(mixingSystem.isLevelComplete(goal, 0)).toBe(false);
            expect(mixingSystem.isLevelComplete(goal, 1)).toBe(false);
        });

        test('should return true when progress meets goal', () => {
            const goal = { type: 'secondary', color: 'purple', count: 2 };
            expect(mixingSystem.isLevelComplete(goal, 2)).toBe(true);
        });

        test('should return true when progress exceeds goal', () => {
            const goal = { type: 'secondary', color: 'purple', count: 2 };
            expect(mixingSystem.isLevelComplete(goal, 3)).toBe(true);
        });
    });

    describe('getMaxColors', () => {
        test('should return 2 by default', () => {
            expect(mixingSystem.getMaxColors()).toBe(2);
        });
    });

    describe('getCurrentColorHex', () => {
        test('should return null for empty bowl', () => {
            expect(mixingSystem.getCurrentColorHex()).toBe(null);
        });

        test('should return first color hex for single color', () => {
            mixingSystem.addColor('red');
            expect(mixingSystem.getCurrentColorHex()).toBe('#FF6B6B');
        });

        test('should return null for full bowl (use mix result instead)', () => {
            mixingSystem.addColor('red');
            mixingSystem.addColor('blue');
            expect(mixingSystem.getCurrentColorHex()).toBe(null);
        });
    });
});

describe('MixingSystem Edge Cases', () => {
    let mixingSystem;

    beforeEach(() => {
        mixingSystem = new MixingSystem(mockConfig);
    });

    test('should handle rapid add/clear cycles', () => {
        for (let i = 0; i < 10; i++) {
            mixingSystem.addColor('red');
            mixingSystem.addColor('blue');
            mixingSystem.clear();
        }
        expect(mixingSystem.getColorsInBowl()).toEqual([]);
    });

    test('should handle invalid color gracefully', () => {
        const result = mixingSystem.addColor('invalid');
        expect(result.success).toBe(false);
        expect(result.reason).toBe('invalid_color');
    });

    test('should handle null color gracefully', () => {
        const result = mixingSystem.addColor(null);
        expect(result.success).toBe(false);
        expect(result.reason).toBe('invalid_color');
    });

    test('should handle undefined color gracefully', () => {
        const result = mixingSystem.addColor(undefined);
        expect(result.success).toBe(false);
        expect(result.reason).toBe('invalid_color');
    });
});
