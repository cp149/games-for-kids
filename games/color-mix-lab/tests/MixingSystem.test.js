/**
 * MixingSystem Unit Tests
 * TDD: Tests written FIRST before implementation
 * Extracted from ColorMixGame mixing logic
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { MixingSystem } from '../js/systems/MixingSystem.js';

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
            // Hex is dynamically calculated from RYB
            expect(result.resultHex).toMatch(/^#[0-9A-Fa-f]{6}$/);
        });

        test('should mix red + yellow = orange', () => {
            mixingSystem.addColor('red');
            mixingSystem.addColor('yellow');
            const result = mixingSystem.mix();
            expect(result.result).toBe('orange');
            expect(result.type).toBe('secondary');
            expect(result.resultHex).toMatch(/^#[0-9A-Fa-f]{6}$/);
        });

        test('should mix blue + yellow = green', () => {
            mixingSystem.addColor('blue');
            mixingSystem.addColor('yellow');
            const result = mixingSystem.mix();
            expect(result.result).toBe('green');
            expect(result.type).toBe('secondary');
            expect(result.resultHex).toMatch(/^#[0-9A-Fa-f]{6}$/);
        });

        test('should produce same color when mixing identical colors (red + red)', () => {
            mixingSystem.addColor('red');
            mixingSystem.addColor('red');
            const result = mixingSystem.mix();
            // Dynamic mixing: same + same = same (realistic behavior)
            expect(result.result).toBe('red');
            expect(result.type).toBe('primary');
        });

        test('should produce same color when mixing identical colors (blue + blue)', () => {
            mixingSystem.addColor('blue');
            mixingSystem.addColor('blue');
            const result = mixingSystem.mix();
            expect(result.result).toBe('blue');
            expect(result.type).toBe('primary');
        });

        test('should produce same color when mixing identical colors (yellow + yellow)', () => {
            mixingSystem.addColor('yellow');
            mixingSystem.addColor('yellow');
            const result = mixingSystem.mix();
            expect(result.result).toBe('yellow');
            expect(result.type).toBe('primary');
        });

        test('should produce dynamic mixed color for secondary combinations', () => {
            // Normalized vector addition: orange + purple = reddish mixed
            // orange [1,1,0] + purple [1,0,1] = [2,1,1] → normalized [1, 0.5, 0.5]
            mixingSystem.colorsInBowl = ['orange', 'purple'];
            const result = mixingSystem.mix();
            expect(result.type).toBe('mixed');
            expect(result.isDynamic).toBe(true);
            // RYB should be [1, 0.5, 0.5] (red-dominant)
            expect(result.ryb[0]).toBeCloseTo(1, 1);
            expect(result.ryb[1]).toBeCloseTo(0.5, 1);
            expect(result.ryb[2]).toBeCloseTo(0.5, 1);
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

        test('should match any mix for discover goal (including mixed colors)', () => {
            // In dynamic color system, all mixes count - no more "mud" rejection
            const goal = { type: 'discover', count: 3 };
            const mixResult = { result: 'gray-tone', type: 'mixed', ryb: [0.33, 0.33, 0.33] };
            expect(mixingSystem.matchesGoal(goal, mixResult)).toBe(true);
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

describe('MixingSystem Chain Mixing', () => {
    let mixingSystem;

    beforeEach(() => {
        mixingSystem = new MixingSystem(mockConfig);
    });

    test('should mix primary colors to get secondary (red + yellow = orange)', () => {
        mixingSystem.addColor('red');
        mixingSystem.addColor('yellow');
        const result = mixingSystem.mix();

        expect(result.result).toBe('orange');
        expect(result.ryb).toBeDefined();
        expect(result.resultHex).toBeDefined();
    });

    test('should accept colorData object (from previous mix) as input', () => {
        // First mix: red + yellow = orange
        mixingSystem.addColor('red');
        mixingSystem.addColor('yellow');
        const orangeResult = mixingSystem.mix();

        // Clear and use orange result object for chain mixing
        mixingSystem.clear();
        const addResult = mixingSystem.addColor(orangeResult);

        expect(addResult.success).toBe(true);
        expect(addResult.colorHex).toBe(orangeResult.resultHex);
    });

    test('should chain mix: orange (object) + blue = brown/mud', () => {
        // First mix: red + yellow = orange
        mixingSystem.addColor('red');
        mixingSystem.addColor('yellow');
        const orangeResult = mixingSystem.mix();

        // Chain mix: orange + blue
        mixingSystem.clear();
        mixingSystem.addColor(orangeResult); // Pass full object
        mixingSystem.addColor('blue');
        const brownResult = mixingSystem.mix();

        expect(brownResult).not.toBeNull();
        expect(brownResult.ryb).toBeDefined();
        // Orange (0.5, 0.5, 0) + Blue (0, 0, 1) = (0.25, 0.25, 0.5)
        // With dynamic naming, this produces a blue-dominant dynamic color
        expect(brownResult.result).toMatch(/brown|mud|blue-purple|blue-tinted|blue-yellow-blend/);
    });

    test('should chain mix multiple levels deep', () => {
        // Level 1: red + yellow = orange
        mixingSystem.addColor('red');
        mixingSystem.addColor('yellow');
        const orange = mixingSystem.mix();
        expect(orange.result).toBe('orange');

        // Level 2: orange + blue = muddy color
        mixingSystem.clear();
        mixingSystem.addColor(orange);
        mixingSystem.addColor('blue');
        const level2 = mixingSystem.mix();
        expect(level2).not.toBeNull();
        expect(level2.ryb).toBeDefined();

        // Level 3: level2 result + yellow
        mixingSystem.clear();
        mixingSystem.addColor(level2);
        mixingSystem.addColor('yellow');
        const level3 = mixingSystem.mix();
        expect(level3).not.toBeNull();
        expect(level3.ryb).toBeDefined();
    });

    test('should preserve RYB values through chain mixing', () => {
        // Create orange
        mixingSystem.addColor('red');
        mixingSystem.addColor('yellow');
        const orange = mixingSystem.mix();

        // Orange RYB should be (1, 1, 0) with max mixing algorithm
        expect(orange.ryb[0]).toBeCloseTo(1, 1); // Red
        expect(orange.ryb[1]).toBeCloseTo(1, 1); // Yellow
        expect(orange.ryb[2]).toBeCloseTo(0, 1); // Blue

        // Mix orange + blue
        mixingSystem.clear();
        mixingSystem.addColor(orange);
        mixingSystem.addColor('blue');
        const result = mixingSystem.mix();

        // Result should be max: (1, 1, 1) = mud/brown
        expect(result.ryb[0]).toBeCloseTo(1, 1);
        expect(result.ryb[1]).toBeCloseTo(1, 1);
        expect(result.ryb[2]).toBeCloseTo(1, 1);
    });

    test('should handle mixing two secondary colors', () => {
        // Create orange
        mixingSystem.addColor('red');
        mixingSystem.addColor('yellow');
        const orange = mixingSystem.mix();

        // Create green
        mixingSystem.clear();
        mixingSystem.addColor('blue');
        mixingSystem.addColor('yellow');
        const green = mixingSystem.mix();

        // Mix orange + green
        mixingSystem.clear();
        mixingSystem.addColor(orange);
        mixingSystem.addColor(green);
        const result = mixingSystem.mix();

        expect(result).not.toBeNull();
        expect(result.ryb).toBeDefined();
        expect(result.resultHex).toBeDefined();
    });

    test('should handle mixing same secondary color with itself', () => {
        // Create orange
        mixingSystem.addColor('red');
        mixingSystem.addColor('yellow');
        const orange = mixingSystem.mix();

        // Mix orange + orange
        mixingSystem.clear();
        mixingSystem.addColor(orange);
        mixingSystem.addColor(orange);
        const result = mixingSystem.mix();

        // Same color + same color = same color
        expect(result.result).toBe('orange');
    });
});
