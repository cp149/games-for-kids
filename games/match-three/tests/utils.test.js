/**
 * Utils Unit Tests
 * Tests utility functions for edge cases and boundary conditions
 */

const test = require('node:test');
const assert = require('node:assert');
const Utils = require('../js/utils.js');
const { createTestConfig } = require('../js/test-utils.js');

test('Utils - getCellSize', async (t) => {
    await t.test('calculates cell size for standard desktop', () => {
        const config = createTestConfig();
        const result = Utils.getCellSize(8, {
            viewportWidth: 1024,
            viewportHeight: 768,
            config
        });

        assert.ok(result > 0);
        assert.ok(result >= Utils.MIN_CELL_SIZE);
        assert.ok(result >= config.BOARD.CELL_SIZE_DESKTOP - 8);
    });

    await t.test('handles mobile viewport', () => {
        const config = createTestConfig();
        const result = Utils.getCellSize(8, {
            viewportWidth: 375,
            viewportHeight: 667,
            config
        });

        assert.ok(result > 0);
        assert.ok(result >= Utils.MIN_CELL_SIZE);
    });

    await t.test('handles tablet viewport', () => {
        const config = createTestConfig();
        const result = Utils.getCellSize(8, {
            viewportWidth: 768,
            viewportHeight: 1024,
            config
        });

        assert.ok(result > 0);
        assert.ok(result >= config.BOARD.CELL_SIZE_TABLET - 8);
    });

    await t.test('handles large viewport', () => {
        const config = createTestConfig();
        const result = Utils.getCellSize(8, {
            viewportWidth: 1920,
            viewportHeight: 1080,
            config
        });

        assert.ok(result > 0);
        assert.ok(result >= config.BOARD.CELL_SIZE_LARGE - 10);
    });

    await t.test('returns minimum size for very small screen', () => {
        const config = createTestConfig();
        const result = Utils.getCellSize(8, {
            viewportWidth: 200,
            viewportHeight: 200,
            config
        });

        assert.strictEqual(result, Utils.MIN_CELL_SIZE);
    });

    await t.test('handles zero viewport dimensions', () => {
        const config = createTestConfig();
        const result = Utils.getCellSize(8, {
            viewportWidth: 0,
            viewportHeight: 0,
            config
        });

        assert.strictEqual(result, Utils.MIN_CELL_SIZE);
    });

    await t.test('handles negative viewport dimensions', () => {
        const config = createTestConfig();
        const result = Utils.getCellSize(8, {
            viewportWidth: -100,
            viewportHeight: -100,
            config
        });

        assert.strictEqual(result, Utils.MIN_CELL_SIZE);
    });

    await t.test('handles invalid grid size (0)', () => {
        const config = createTestConfig();
        const result = Utils.getCellSize(0, {
            viewportWidth: 800,
            viewportHeight: 600,
            config
        });

        // Should fall back to config default
        assert.ok(result > 0);
    });

    await t.test('handles invalid grid size (negative)', () => {
        const config = createTestConfig();
        const result = Utils.getCellSize(-5, {
            viewportWidth: 800,
            viewportHeight: 600,
            config
        });

        // Should fall back to config default
        assert.ok(result > 0);
    });

    await t.test('respects max board size constraint', () => {
        const config = createTestConfig();
        const result = Utils.getCellSize(4, { // Small grid
            viewportWidth: 2000,
            viewportHeight: 2000,
            config
        });

        // Cell size * grid should not exceed MAX_BOARD_SIZE
        assert.ok(result * 4 <= config.BOARD.MAX_BOARD_SIZE);
    });

    await t.test('handles very large grid size', () => {
        const config = createTestConfig();
        const result = Utils.getCellSize(20, {
            viewportWidth: 1024,
            viewportHeight: 768,
            config
        });

        assert.ok(result >= Utils.MIN_CELL_SIZE);
        assert.ok(result * 20 <= config.BOARD.MAX_BOARD_SIZE);
    });

    await t.test('returns consistent size for same inputs', () => {
        const config = createTestConfig();
        const options = {
            viewportWidth: 800,
            viewportHeight: 600,
            config
        };

        const result1 = Utils.getCellSize(8, options);
        const result2 = Utils.getCellSize(8, options);

        assert.strictEqual(result1, result2);
    });

    await t.test('insufficient vertical space returns minimum', () => {
        const config = createTestConfig();
        const result = Utils.getCellSize(8, {
            viewportWidth: 800,
            viewportHeight: 150, // Too small for UI elements
            config
        });

        assert.strictEqual(result, Utils.MIN_CELL_SIZE);
    });

    await t.test('insufficient horizontal space returns minimum', () => {
        const config = createTestConfig();
        const result = Utils.getCellSize(8, {
            viewportWidth: 100, // Too small
            viewportHeight: 800,
            config
        });

        assert.strictEqual(result, Utils.MIN_CELL_SIZE);
    });
});

test('Utils - safeParseInt', async (t) => {
    await t.test('parses valid integer string', () => {
        assert.strictEqual(Utils.safeParseInt('42'), 42);
        assert.strictEqual(Utils.safeParseInt('0'), 0);
        assert.strictEqual(Utils.safeParseInt('-10'), -10);
    });

    await t.test('parses integer with whitespace', () => {
        assert.strictEqual(Utils.safeParseInt('  42  '), 42);
        assert.strictEqual(Utils.safeParseInt('\n100\n'), 100);
    });

    await t.test('returns fallback for invalid string', () => {
        assert.strictEqual(Utils.safeParseInt('abc'), 0);
        assert.strictEqual(Utils.safeParseInt('abc', 99), 99);
    });

    await t.test('returns fallback for null', () => {
        assert.strictEqual(Utils.safeParseInt(null), 0);
        assert.strictEqual(Utils.safeParseInt(null, -1), -1);
    });

    await t.test('returns fallback for undefined', () => {
        assert.strictEqual(Utils.safeParseInt(undefined), 0);
        assert.strictEqual(Utils.safeParseInt(undefined, 100), 100);
    });

    await t.test('returns fallback for empty string', () => {
        assert.strictEqual(Utils.safeParseInt(''), 0);
        assert.strictEqual(Utils.safeParseInt('', 50), 50);
    });

    await t.test('truncates decimal strings', () => {
        assert.strictEqual(Utils.safeParseInt('42.7'), 42);
        assert.strictEqual(Utils.safeParseInt('3.14159'), 3);
    });

    await t.test('parses negative numbers', () => {
        assert.strictEqual(Utils.safeParseInt('-100'), -100);
        // Note: -0 becomes 0 in JavaScript (expected behavior)
        const result = Utils.safeParseInt('-0');
        assert.ok(result === 0 || Object.is(result, -0)); // Allow both 0 and -0
    });

    await t.test('handles invalid fallback value', () => {
        const result = Utils.safeParseInt('abc', NaN);
        assert.strictEqual(result, 0); // Should use 0 when fallback is invalid
    });

    await t.test('handles non-numeric fallback', () => {
        const result = Utils.safeParseInt('abc', 'invalid');
        assert.strictEqual(result, 0); // Should use 0 when fallback is non-numeric
    });

    await t.test('handles string fallback', () => {
        const result = Utils.safeParseInt('abc', '99');
        assert.strictEqual(result, 0); // Fallback must be number, not string
    });

    await t.test('parses numbers with leading zeros', () => {
        assert.strictEqual(Utils.safeParseInt('007'), 7);
        assert.strictEqual(Utils.safeParseInt('00042'), 42);
    });

    await t.test('handles very large numbers', () => {
        const result = Utils.safeParseInt('999999999999');
        assert.ok(typeof result === 'number');
        assert.ok(!isNaN(result));
    });
});

test('Utils - isInBounds', async (t) => {
    await t.test('returns true for value within bounds', () => {
        assert.strictEqual(Utils.isInBounds(5, 0, 10), true);
        assert.strictEqual(Utils.isInBounds(0, 0, 10), true); // Inclusive min
    });

    await t.test('returns false for value at max (exclusive)', () => {
        assert.strictEqual(Utils.isInBounds(10, 0, 10), false);
    });

    await t.test('returns false for value below min', () => {
        assert.strictEqual(Utils.isInBounds(-1, 0, 10), false);
    });

    await t.test('returns false for value above max', () => {
        assert.strictEqual(Utils.isInBounds(11, 0, 10), false);
    });

    await t.test('handles negative ranges', () => {
        assert.strictEqual(Utils.isInBounds(-5, -10, 0), true);
        assert.strictEqual(Utils.isInBounds(-10, -10, 0), true);
        assert.strictEqual(Utils.isInBounds(0, -10, 0), false);
    });

    await t.test('handles single value range', () => {
        assert.strictEqual(Utils.isInBounds(5, 5, 6), true);
        assert.strictEqual(Utils.isInBounds(5, 5, 5), false); // Max exclusive
    });

    await t.test('handles decimal values', () => {
        assert.strictEqual(Utils.isInBounds(2.5, 0, 10), true);
        assert.strictEqual(Utils.isInBounds(9.99, 0, 10), true);
        assert.strictEqual(Utils.isInBounds(10.01, 0, 10), false);
    });

    await t.test('handles zero bounds', () => {
        assert.strictEqual(Utils.isInBounds(0, 0, 1), true);
        assert.strictEqual(Utils.isInBounds(-1, 0, 1), false);
    });
});

test('Utils - clamp', async (t) => {
    await t.test('returns value when within range', () => {
        assert.strictEqual(Utils.clamp(5, 0, 10), 5);
        assert.strictEqual(Utils.clamp(0, 0, 10), 0);
        assert.strictEqual(Utils.clamp(10, 0, 10), 10);
    });

    await t.test('clamps value below min', () => {
        assert.strictEqual(Utils.clamp(-5, 0, 10), 0);
        assert.strictEqual(Utils.clamp(-100, 0, 10), 0);
    });

    await t.test('clamps value above max', () => {
        assert.strictEqual(Utils.clamp(15, 0, 10), 10);
        assert.strictEqual(Utils.clamp(1000, 0, 10), 10);
    });

    await t.test('handles negative ranges', () => {
        assert.strictEqual(Utils.clamp(-5, -10, 0), -5);
        assert.strictEqual(Utils.clamp(-15, -10, 0), -10);
        assert.strictEqual(Utils.clamp(5, -10, 0), 0);
    });

    await t.test('handles decimal values', () => {
        assert.strictEqual(Utils.clamp(2.5, 0, 10), 2.5);
        assert.strictEqual(Utils.clamp(-0.5, 0, 10), 0);
        assert.strictEqual(Utils.clamp(10.5, 0, 10), 10);
    });

    await t.test('handles equal min and max', () => {
        assert.strictEqual(Utils.clamp(5, 3, 3), 3);
        assert.strictEqual(Utils.clamp(1, 3, 3), 3);
    });

    await t.test('handles zero values', () => {
        assert.strictEqual(Utils.clamp(0, -5, 5), 0);
        assert.strictEqual(Utils.clamp(0, 1, 10), 1);
    });

    await t.test('handles very large numbers', () => {
        assert.strictEqual(Utils.clamp(1e10, 0, 100), 100);
        assert.strictEqual(Utils.clamp(-1e10, 0, 100), 0);
    });
});

test('Utils - MIN_SCREEN_SIZE constant', async (t) => {
    await t.test('MIN_SCREEN_SIZE is defined', () => {
        assert.ok(typeof Utils.MIN_SCREEN_SIZE === 'number');
        assert.strictEqual(Utils.MIN_SCREEN_SIZE, 320);
    });
});

test('Utils - MIN_CELL_SIZE constant', async (t) => {
    await t.test('MIN_CELL_SIZE is defined', () => {
        assert.ok(typeof Utils.MIN_CELL_SIZE === 'number');
        assert.strictEqual(Utils.MIN_CELL_SIZE, 30);
    });
});

console.log('All Utils tests completed!');
