/**
 * Unit tests for ScoreManager
 *
 * Run with: npm test
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { ScoreManager } from '../../game/ScoreManager.js';

describe('ScoreManager', () => {
    let score;
    let mockStorage;

    beforeEach(() => {
        // Mock localStorage
        mockStorage = {
            data: {},
            getItem(key) {
                return this.data[key] || null;
            },
            setItem(key, value) {
                this.data[key] = value;
            },
            clear() {
                this.data = {};
            }
        };
        global.localStorage = mockStorage;

        score = new ScoreManager();
    });

    afterEach(() => {
        vi.clearAllTimers();
    });

    describe('Constructor', () => {
        test('initializes with default values', () => {
            expect(score.getScore()).toBe(0);
            expect(score.getCombo()).toBe(0);
            expect(score.getMultiplier()).toBe(1);
        });

        test('loads high score from localStorage', () => {
            mockStorage.setItem('game_highscore', '1000');
            const newScore = new ScoreManager();
            expect(newScore.getHighScore()).toBe(1000);
        });

        test('uses custom star thresholds', () => {
            const customScore = new ScoreManager({
                starThresholds: [50, 100, 200]
            });
            customScore.addPoints(75, false);
            expect(customScore.getStars()).toBe(1);
        });

        test('uses custom storage key', () => {
            const customScore = new ScoreManager({
                storageKey: 'custom_key'
            });
            customScore.addPoints(100, false);
            customScore.saveHighScore();
            expect(mockStorage.getItem('custom_key')).toBe('100');
        });

        test('handles localStorage errors gracefully', () => {
            const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const badStorage = {
                getItem() { throw new Error('Storage error'); },
                setItem() { throw new Error('Storage error'); }
            };
            global.localStorage = badStorage;

            const newScore = new ScoreManager();
            expect(newScore.getHighScore()).toBe(0);
            consoleWarnSpy.mockRestore();
        });
    });

    describe('addPoints', () => {
        test('adds points to score', () => {
            score.addPoints(100, false);
            expect(score.getScore()).toBe(100);
        });

        test('applies combo multiplier by default', () => {
            score.increaseCombo();
            score.increaseCombo();
            score.increaseCombo(); // Should give multiplier > 1
            const multiplier = score.getMultiplier();
            score.addPoints(100); // applyCombo defaults to true
            expect(score.getScore()).toBe(100 * multiplier);
        });

        test('skips combo multiplier when requested', () => {
            score.increaseCombo();
            score.increaseCombo();
            score.addPoints(100, false);
            expect(score.getScore()).toBe(100);
        });

        test('returns multiplied points', () => {
            score.increaseCombo();
            score.increaseCombo();
            score.increaseCombo();
            const multiplier = score.getMultiplier();
            const added = score.addPoints(50);
            expect(added).toBe(50 * multiplier);
        });

        test('triggers scoreChange event', () => {
            const listener = vi.fn();
            score.on('scoreChange', listener);
            score.addPoints(50, false);
            expect(listener).toHaveBeenCalledWith(50, 50);
        });

        test('updates high score', () => {
            score.addPoints(100, false);
            expect(score.getHighScore()).toBe(100);
        });

        test('triggers newHighScore event', () => {
            const listener = vi.fn();
            score.on('newHighScore', listener);
            score.addPoints(100, false);
            expect(listener).toHaveBeenCalledWith(100);
        });

        test('saves high score to localStorage', () => {
            score.addPoints(500, false);
            expect(mockStorage.getItem('game_highscore')).toBe('500');
        });
    });

    describe('increaseCombo', () => {
        test('increases combo count', () => {
            score.increaseCombo();
            expect(score.getCombo()).toBe(1);
        });

        test('increases multiplier', () => {
            score.increaseCombo();
            score.increaseCombo();
            score.increaseCombo();
            expect(score.getMultiplier()).toBeGreaterThan(1);
        });

        test('respects max multiplier', () => {
            const limitedScore = new ScoreManager({ maxComboMultiplier: 3 });
            for (let i = 0; i < 100; i++) {
                limitedScore.increaseCombo();
            }
            expect(limitedScore.getMultiplier()).toBeLessThanOrEqual(3);
        });

        test('triggers comboChange event', () => {
            const listener = vi.fn();
            score.on('comboChange', listener);
            score.increaseCombo();
            expect(listener).toHaveBeenCalledWith(1, score.getMultiplier());
        });

        test('resets combo timer', () => {
            vi.useFakeTimers();
            score.increaseCombo();
            vi.advanceTimersByTime(2000);
            score.increaseCombo(); // Should reset timer
            vi.advanceTimersByTime(2500);
            expect(score.getCombo()).toBeGreaterThan(0); // Still active
            vi.useRealTimers();
        });
    });

    describe('resetCombo', () => {
        test('resets combo to zero', () => {
            score.increaseCombo();
            score.increaseCombo();
            score.resetCombo();
            expect(score.getCombo()).toBe(0);
        });

        test('resets multiplier to 1', () => {
            score.increaseCombo();
            score.increaseCombo();
            score.resetCombo();
            expect(score.getMultiplier()).toBe(1);
        });

        test('triggers comboChange event', () => {
            const listener = vi.fn();
            score.increaseCombo();
            score.on('comboChange', listener);
            score.resetCombo();
            expect(listener).toHaveBeenCalledWith(0, 1);
        });

        test('does nothing if combo already zero', () => {
            const listener = vi.fn();
            score.on('comboChange', listener);
            score.resetCombo();
            expect(listener).not.toHaveBeenCalled();
        });

        test('clears combo timer', () => {
            vi.useFakeTimers();
            score.increaseCombo();
            score.resetCombo();
            vi.advanceTimersByTime(5000);
            expect(score.getCombo()).toBe(0); // Should stay 0
            vi.useRealTimers();
        });
    });

    describe('getScore', () => {
        test('returns current score', () => {
            score.addPoints(123, false);
            expect(score.getScore()).toBe(123);
        });

        test('returns 0 initially', () => {
            expect(score.getScore()).toBe(0);
        });
    });

    describe('getCombo', () => {
        test('returns current combo', () => {
            score.increaseCombo();
            score.increaseCombo();
            expect(score.getCombo()).toBe(2);
        });
    });

    describe('getMultiplier', () => {
        test('returns 1 initially', () => {
            expect(score.getMultiplier()).toBe(1);
        });

        test('calculates multiplier correctly', () => {
            score.increaseCombo();
            score.increaseCombo();
            score.increaseCombo(); // combo = 3, multiplier = 1 + floor(3/3) = 2
            expect(score.getMultiplier()).toBe(2);
        });

        test('increases with combo count', () => {
            const mult1 = score.getMultiplier();
            score.increaseCombo();
            score.increaseCombo();
            score.increaseCombo();
            const mult2 = score.getMultiplier();
            expect(mult2).toBeGreaterThan(mult1);
        });
    });

    describe('getStars', () => {
        test('returns 0 stars initially', () => {
            expect(score.getStars()).toBe(0);
        });

        test('returns 1 star for threshold 1', () => {
            score.addPoints(150, false); // Default: [100, 250, 500]
            expect(score.getStars()).toBe(1);
        });

        test('returns 2 stars for threshold 2', () => {
            score.addPoints(300, false);
            expect(score.getStars()).toBe(2);
        });

        test('returns 3 stars for threshold 3', () => {
            score.addPoints(600, false);
            expect(score.getStars()).toBe(3);
        });

        test('uses custom thresholds', () => {
            const customScore = new ScoreManager({
                starThresholds: [10, 20, 30]
            });
            customScore.addPoints(25, false);
            expect(customScore.getStars()).toBe(2);
        });
    });

    describe('getHighScore', () => {
        test('returns 0 initially', () => {
            expect(score.getHighScore()).toBe(0);
        });

        test('updates when score increases', () => {
            score.addPoints(100, false);
            expect(score.getHighScore()).toBe(100);
        });

        test('does not decrease', () => {
            score.addPoints(200, false);
            score.reset();
            expect(score.getHighScore()).toBe(200);
        });

        test('loads from localStorage', () => {
            mockStorage.setItem('game_highscore', '999');
            const newScore = new ScoreManager();
            expect(newScore.getHighScore()).toBe(999);
        });
    });

    describe('reset', () => {
        test('resets score to 0', () => {
            score.addPoints(100, false);
            score.reset();
            expect(score.getScore()).toBe(0);
        });

        test('resets combo', () => {
            score.increaseCombo();
            score.reset();
            expect(score.getCombo()).toBe(0);
        });

        test('does not reset high score', () => {
            score.addPoints(100, false);
            score.reset();
            expect(score.getHighScore()).toBe(100);
        });

        test('triggers scoreChange event', () => {
            const listener = vi.fn();
            score.on('scoreChange', listener);
            score.reset();
            expect(listener).toHaveBeenCalledWith(0, 0);
        });
    });

    describe('resetHighScore', () => {
        test('resets high score to 0', () => {
            score.addPoints(100, false);
            score.resetHighScore();
            expect(score.getHighScore()).toBe(0);
        });

        test('saves reset to localStorage', () => {
            score.addPoints(100, false);
            score.resetHighScore();
            expect(mockStorage.getItem('game_highscore')).toBe('0');
        });
    });

    describe('Event system', () => {
        test('on() registers listeners', () => {
            const listener = vi.fn();
            score.on('scoreChange', listener);
            score.addPoints(10, false);
            expect(listener).toHaveBeenCalled();
        });

        test('supports multiple listeners', () => {
            const listener1 = vi.fn();
            const listener2 = vi.fn();
            score.on('scoreChange', listener1);
            score.on('scoreChange', listener2);
            score.addPoints(10, false);
            expect(listener1).toHaveBeenCalled();
            expect(listener2).toHaveBeenCalled();
        });

        test('off() removes listeners', () => {
            const listener = vi.fn();
            score.on('scoreChange', listener);
            score.off('scoreChange', listener);
            score.addPoints(10, false);
            expect(listener).not.toHaveBeenCalled();
        });

        test('handles listener errors gracefully', () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const badListener = vi.fn(() => { throw new Error('Test error'); });
            const goodListener = vi.fn();

            score.on('scoreChange', badListener);
            score.on('scoreChange', goodListener);

            score.addPoints(10, false);

            expect(badListener).toHaveBeenCalled();
            expect(goodListener).toHaveBeenCalled();
            consoleErrorSpy.mockRestore();
        });

        test('ignores events without listeners', () => {
            expect(() => score.addPoints(10, false)).not.toThrow();
        });
    });

    describe('getStats', () => {
        test('returns all statistics', () => {
            score.addPoints(150, false);
            score.increaseCombo();
            const stats = score.getStats();

            expect(stats).toHaveProperty('score', 150);
            expect(stats).toHaveProperty('combo');
            expect(stats).toHaveProperty('multiplier');
            expect(stats).toHaveProperty('stars', 1);
            expect(stats).toHaveProperty('highScore', 150);
        });

        test('reflects current state', () => {
            score.increaseCombo();
            score.increaseCombo();
            const stats1 = score.getStats();

            score.increaseCombo();
            const stats2 = score.getStats();

            expect(stats2.combo).toBeGreaterThan(stats1.combo);
        });
    });

    describe('setStarThresholds', () => {
        test('updates star thresholds', () => {
            score.addPoints(40, false);
            expect(score.getStars()).toBe(0);

            score.setStarThresholds([10, 50, 100]);
            expect(score.getStars()).toBe(1);
        });

        test('requires exactly 3 thresholds', () => {
            const currentThresholds = [100, 250, 500];
            score.setStarThresholds([10, 20]); // Invalid
            score.addPoints(150, false);
            expect(score.getStars()).toBe(1); // Should use original thresholds
        });
    });

    describe('Combo timer', () => {
        test('resets combo after timeout', () => {
            vi.useFakeTimers();
            const customScore = new ScoreManager({ comboTimeout: 2 });

            customScore.increaseCombo();
            expect(customScore.getCombo()).toBe(1);

            vi.advanceTimersByTime(2000);
            expect(customScore.getCombo()).toBe(0);

            vi.useRealTimers();
        });

        test('timer resets on new combo', () => {
            vi.useFakeTimers();
            const customScore = new ScoreManager({ comboTimeout: 3 });

            customScore.increaseCombo();
            vi.advanceTimersByTime(2000);
            customScore.increaseCombo(); // Reset timer
            vi.advanceTimersByTime(2000); // Total 4s, but timer was reset at 2s
            expect(customScore.getCombo()).toBeGreaterThan(0);

            vi.useRealTimers();
        });
    });

    describe('Integration scenarios', () => {
        test('complete game scenario', () => {
            const listener = vi.fn();
            score.on('scoreChange', listener);
            score.on('newHighScore', listener);

            // Start game
            expect(score.getScore()).toBe(0);

            // Collect coins with combo
            score.increaseCombo();
            score.addPoints(100);

            score.increaseCombo();
            score.addPoints(100);

            score.increaseCombo();
            score.addPoints(100);

            // Check results
            expect(score.getScore()).toBeGreaterThan(300); // Due to multipliers
            expect(score.getStars()).toBeGreaterThan(0);
            expect(listener).toHaveBeenCalled();
        });

        test('multiple games maintain high score', () => {
            // Game 1
            score.addPoints(500, false);
            score.reset();

            // Game 2
            score.addPoints(300, false);
            expect(score.getHighScore()).toBe(500);

            // Game 3
            score.reset();
            score.addPoints(800, false);
            expect(score.getHighScore()).toBe(800);
        });
    });
});
