/**
 * Unit tests for ComboSystem
 *
 * Run with: npm test
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { ComboSystem } from '../../game/ComboSystem.js';

describe('ComboSystem', () => {
    let combo;
    let mockK;

    beforeEach(() => {
        // Mock minimal KAPLAY instance
        mockK = {};

        combo = new ComboSystem(mockK, {
            timeout: 3,
            tiers: [
                { min: 0, multiplier: 1 },
                { min: 5, multiplier: 1.5 },
                { min: 10, multiplier: 2 },
                { min: 20, multiplier: 3 }
            ],
            colors: [
                { min: 0, color: [255, 255, 255] },
                { min: 5, color: [255, 255, 0] },
                { min: 10, color: [255, 165, 0] },
                { min: 20, color: [255, 0, 0] }
            ]
        });
    });

    afterEach(() => {
        vi.clearAllTimers();
    });

    describe('Constructor', () => {
        test('initializes with default values', () => {
            expect(combo.getCombo()).toBe(0);
            expect(combo.getMultiplier()).toBe(1);
            expect(combo.getTimeLeft()).toBe(0);
        });

        test('uses default config if not provided', () => {
            const defaultCombo = new ComboSystem(mockK);
            expect(defaultCombo.timeout).toBe(3);
            expect(defaultCombo.tiers).toBeDefined();
            expect(defaultCombo.colors).toBeDefined();
        });

        test('accepts custom timeout', () => {
            const customCombo = new ComboSystem(mockK, { timeout: 5 });
            expect(customCombo.timeout).toBe(5);
        });

        test('accepts custom tiers', () => {
            const customTiers = [
                { min: 0, multiplier: 1 },
                { min: 3, multiplier: 2 }
            ];
            const customCombo = new ComboSystem(mockK, { tiers: customTiers });
            expect(customCombo.tiers).toEqual(customTiers);
        });

        test('accepts custom colors', () => {
            const customColors = [
                { min: 0, color: [100, 100, 100] }
            ];
            const customCombo = new ComboSystem(mockK, { colors: customColors });
            expect(customCombo.colors).toEqual(customColors);
        });
    });

    describe('getMultiplier', () => {
        test('returns 1 for zero combo', () => {
            expect(combo.getMultiplier()).toBe(1);
        });

        test('returns correct multiplier for tier 1', () => {
            combo.setCombo(5);
            expect(combo.getMultiplier()).toBe(1.5);
        });

        test('returns correct multiplier for tier 2', () => {
            combo.setCombo(10);
            expect(combo.getMultiplier()).toBe(2);
        });

        test('returns correct multiplier for tier 3', () => {
            combo.setCombo(20);
            expect(combo.getMultiplier()).toBe(3);
        });

        test('returns highest applicable tier', () => {
            combo.setCombo(25);
            expect(combo.getMultiplier()).toBe(3);
        });

        test('handles edge case at tier boundary', () => {
            combo.setCombo(4);
            expect(combo.getMultiplier()).toBe(1);
            combo.setCombo(5);
            expect(combo.getMultiplier()).toBe(1.5);
        });
    });

    describe('getColor', () => {
        test('returns white for zero combo', () => {
            expect(combo.getColor()).toEqual([255, 255, 255]);
        });

        test('returns yellow for combo 5+', () => {
            combo.setCombo(5);
            expect(combo.getColor()).toEqual([255, 255, 0]);
        });

        test('returns orange for combo 10+', () => {
            combo.setCombo(10);
            expect(combo.getColor()).toEqual([255, 165, 0]);
        });

        test('returns red for combo 20+', () => {
            combo.setCombo(20);
            expect(combo.getColor()).toEqual([255, 0, 0]);
        });

        test('returns highest applicable color', () => {
            combo.setCombo(100);
            expect(combo.getColor()).toEqual([255, 0, 0]);
        });
    });

    describe('getLevel', () => {
        test('returns 0 for zero combo', () => {
            expect(combo.getLevel()).toBe(0);
        });

        test('returns correct level index', () => {
            combo.setCombo(5);
            expect(combo.getLevel()).toBe(1);

            combo.setCombo(10);
            expect(combo.getLevel()).toBe(2);

            combo.setCombo(20);
            expect(combo.getLevel()).toBe(3);
        });

        test('returns highest level for large combos', () => {
            combo.setCombo(1000);
            expect(combo.getLevel()).toBe(3);
        });
    });

    describe('increment', () => {
        test('increases combo by 1', () => {
            combo.increment();
            expect(combo.getCombo()).toBe(1);
        });

        test('resets timer', () => {
            combo.increment();
            expect(combo.comboTimer).toBe(0);
        });

        test('returns current multiplier', () => {
            combo.setCombo(4);
            const mult = combo.increment();
            expect(mult).toBe(combo.getMultiplier());
        });

        test('calls onComboChange callback', () => {
            const callback = vi.fn();
            combo.onComboChange = callback;
            combo.increment();
            expect(callback).toHaveBeenCalledWith(1, 1);
        });

        test('calls onLevelUp when level increases', () => {
            const callback = vi.fn();
            combo.onLevelUp = callback;
            combo.setCombo(4);
            combo.increment(); // Should trigger level up to 1
            expect(callback).toHaveBeenCalledWith(1);
        });

        test('does not call onLevelUp if level stays same', () => {
            const callback = vi.fn();
            combo.onLevelUp = callback;
            combo.increment(); // Level 0 -> 0
            expect(callback).not.toHaveBeenCalled();
        });

        test('multiple increments work correctly', () => {
            combo.increment();
            combo.increment();
            combo.increment();
            expect(combo.getCombo()).toBe(3);
        });
    });

    describe('update', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        test('does nothing when combo is 0', () => {
            const callback = vi.fn();
            combo.onComboChange = callback;
            combo.update(1);
            expect(callback).not.toHaveBeenCalled();
        });

        test('increments timer when combo is active', () => {
            combo.increment();
            combo.update(1);
            expect(combo.comboTimer).toBe(1);
        });

        test('resets combo after timeout', () => {
            combo.increment();
            combo.update(3); // timeout is 3 seconds
            expect(combo.getCombo()).toBe(0);
        });

        test('calls onComboChange when resetting', () => {
            const callback = vi.fn();
            combo.increment();
            combo.onComboChange = callback;
            combo.update(3);
            expect(callback).toHaveBeenCalledWith(0, 1);
        });

        test('accumulates time correctly', () => {
            combo.increment();
            combo.update(1);
            combo.update(1);
            combo.update(0.5);
            expect(combo.comboTimer).toBe(2.5);
        });

        test('does not reset before timeout', () => {
            combo.increment();
            combo.update(2.9);
            expect(combo.getCombo()).toBe(1);
        });
    });

    describe('reset', () => {
        test('sets combo to 0', () => {
            combo.setCombo(10);
            combo.reset();
            expect(combo.getCombo()).toBe(0);
        });

        test('resets timer', () => {
            combo.increment();
            combo.update(2);
            combo.reset();
            expect(combo.comboTimer).toBe(0);
        });

        test('calls onComboChange', () => {
            const callback = vi.fn();
            combo.setCombo(5);
            combo.onComboChange = callback;
            combo.reset();
            expect(callback).toHaveBeenCalledWith(0, 1);
        });

        test('does not call callback if already 0', () => {
            const callback = vi.fn();
            combo.onComboChange = callback;
            combo.reset();
            expect(callback).not.toHaveBeenCalled();
        });
    });

    describe('getTimeLeft', () => {
        test('returns 0 when combo is 0', () => {
            expect(combo.getTimeLeft()).toBe(0);
        });

        test('returns full timeout initially', () => {
            combo.increment();
            expect(combo.getTimeLeft()).toBe(3);
        });

        test('decreases as time passes', () => {
            combo.increment();
            combo.update(1);
            expect(combo.getTimeLeft()).toBe(2);
        });

        test('returns 0 when expired', () => {
            combo.increment();
            combo.update(3);
            expect(combo.getTimeLeft()).toBe(0);
        });

        test('never returns negative', () => {
            combo.increment();
            combo.update(5);
            expect(combo.getTimeLeft()).toBeGreaterThanOrEqual(0);
        });
    });

    describe('getProgress', () => {
        test('returns 0 when combo is 0', () => {
            expect(combo.getProgress()).toBe(0);
        });

        test('returns 1 initially', () => {
            combo.increment();
            expect(combo.getProgress()).toBe(1);
        });

        test('returns correct progress', () => {
            combo.increment();
            combo.update(1.5); // 1.5s passed, 1.5s left
            expect(combo.getProgress()).toBeCloseTo(0.5, 1);
        });

        test('returns 0 when expired', () => {
            combo.increment();
            combo.update(3);
            expect(combo.getProgress()).toBe(0);
        });

        test('progress decreases linearly', () => {
            combo.increment();
            combo.update(1);
            const prog1 = combo.getProgress();
            combo.update(1);
            const prog2 = combo.getProgress();
            expect(prog2).toBeLessThan(prog1);
        });
    });

    describe('getCombo', () => {
        test('returns current combo count', () => {
            combo.setCombo(7);
            expect(combo.getCombo()).toBe(7);
        });

        test('returns 0 initially', () => {
            expect(combo.getCombo()).toBe(0);
        });
    });

    describe('setCombo', () => {
        test('sets combo to specified value', () => {
            combo.setCombo(15);
            expect(combo.getCombo()).toBe(15);
        });

        test('resets timer', () => {
            combo.increment();
            combo.update(2);
            combo.setCombo(10);
            expect(combo.comboTimer).toBe(0);
        });

        test('calls onComboChange', () => {
            const callback = vi.fn();
            combo.onComboChange = callback;
            combo.setCombo(5);
            expect(callback).toHaveBeenCalledWith(5, 1.5);
        });

        test('prevents negative values', () => {
            combo.setCombo(-5);
            expect(combo.getCombo()).toBe(0);
        });

        test('accepts 0', () => {
            combo.setCombo(10);
            combo.setCombo(0);
            expect(combo.getCombo()).toBe(0);
        });
    });

    describe('Callbacks', () => {
        test('onComboChange receives correct parameters', () => {
            const callback = vi.fn();
            combo.onComboChange = callback;
            combo.increment();
            expect(callback).toHaveBeenCalledWith(
                expect.any(Number),
                expect.any(Number)
            );
        });

        test('onLevelUp receives level', () => {
            const callback = vi.fn();
            combo.onLevelUp = callback;
            combo.setCombo(4);
            combo.increment();
            expect(callback).toHaveBeenCalledWith(expect.any(Number));
        });

        test('callbacks can be null', () => {
            combo.onComboChange = null;
            combo.onLevelUp = null;
            expect(() => combo.increment()).not.toThrow();
        });

        test('onComboEnd is called on timeout', () => {
            const callback = vi.fn();
            combo.onComboEnd = callback;
            combo.increment();
            combo.update(3);
            expect(callback).toHaveBeenCalled();
        });
    });

    describe('Edge cases', () => {
        test('handles very large combo numbers', () => {
            combo.setCombo(999999);
            expect(combo.getCombo()).toBe(999999);
            expect(combo.getMultiplier()).toBe(3); // Max tier
        });

        test('handles rapid increments', () => {
            for (let i = 0; i < 100; i++) {
                combo.increment();
            }
            expect(combo.getCombo()).toBe(100);
        });

        test('handles decimal time values', () => {
            combo.increment();
            combo.update(0.123);
            combo.update(0.456);
            expect(combo.comboTimer).toBeCloseTo(0.579, 2);
        });

        test('handles zero time update', () => {
            combo.increment();
            combo.update(0);
            expect(combo.getCombo()).toBe(1);
        });
    });

    describe('Integration scenarios', () => {
        test('complete combo cycle', () => {
            const changeCallback = vi.fn();
            const levelCallback = vi.fn();
            combo.onComboChange = changeCallback;
            combo.onLevelUp = levelCallback;

            // Build combo
            combo.increment(); // 1
            combo.increment(); // 2
            combo.increment(); // 3
            combo.increment(); // 4
            combo.increment(); // 5 - triggers level up
            expect(levelCallback).toHaveBeenCalled();
            expect(combo.getMultiplier()).toBe(1.5);

            // Continue combo
            for (let i = 0; i < 5; i++) combo.increment();
            expect(combo.getMultiplier()).toBe(2);

            // Let it expire
            combo.update(3);
            expect(combo.getCombo()).toBe(0);
        });

        test('combo with timer reset', () => {
            combo.increment();
            combo.update(2); // Almost expired
            combo.increment(); // Reset timer
            combo.update(2); // Should still be active
            expect(combo.getCombo()).toBeGreaterThan(0);
        });

        test('multiple level ups', () => {
            const callback = vi.fn();
            combo.onLevelUp = callback;

            combo.setCombo(4);
            combo.increment(); // Level 0->1
            combo.setCombo(9);
            combo.increment(); // Level 1->2
            combo.setCombo(19);
            combo.increment(); // Level 2->3

            expect(callback).toHaveBeenCalledTimes(3);
        });
    });

    describe('Custom configurations', () => {
        test('works with different timeout values', () => {
            const shortCombo = new ComboSystem(mockK, { timeout: 1 });
            shortCombo.increment();
            shortCombo.update(1);
            expect(shortCombo.getCombo()).toBe(0);
        });

        test('works with different tier configurations', () => {
            const customCombo = new ComboSystem(mockK, {
                tiers: [
                    { min: 0, multiplier: 1 },
                    { min: 2, multiplier: 5 }
                ]
            });
            customCombo.setCombo(2);
            expect(customCombo.getMultiplier()).toBe(5);
        });

        test('works with single tier', () => {
            const singleTier = new ComboSystem(mockK, {
                tiers: [{ min: 0, multiplier: 1 }]
            });
            singleTier.setCombo(100);
            expect(singleTier.getMultiplier()).toBe(1);
        });
    });
});
