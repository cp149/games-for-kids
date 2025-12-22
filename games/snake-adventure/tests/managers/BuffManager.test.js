/**
 * BuffManager Tests - Crash Prevention & Critical Logic
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { BuffManager } from '../../js/managers/BuffManager.js';

describe('BuffManager - Crash Prevention', () => {
    let buffManager;
    let mockLogger;
    let mockPlayerSnake;
    let mockFoods;

    beforeEach(() => {
        mockLogger = { log: vi.fn(), info: vi.fn() };
        buffManager = new BuffManager(mockLogger);
        mockPlayerSnake = {
            speed: 100,
            isAlive: true,
            getHead: () => ({ x: 500, y: 500 })
        };
        mockFoods = [
            { x: 450, y: 450 },
            { x: 600, y: 600 }
        ];
    });

    describe('Invalid Input Handling', () => {
        test('should not crash with null player', () => {
            expect(() => buffManager.update(0.1, null, mockFoods)).not.toThrow();
        });

        test('should not crash with undefined foods', () => {
            expect(() => buffManager.update(0.1, mockPlayerSnake, undefined)).not.toThrow();
        });

        test('should not crash with empty foods array', () => {
            expect(() => buffManager.update(0.1, mockPlayerSnake, [])).not.toThrow();
        });

        test('should not crash when food has NaN coordinates', () => {
            mockFoods[0].x = NaN;
            mockFoods[0].y = NaN;
            buffManager.activateMagnet(200, 5000);
            expect(() => buffManager.update(0.1, mockPlayerSnake, mockFoods)).not.toThrow();
        });

        test('should not crash when player has invalid head', () => {
            mockPlayerSnake.getHead = () => null;
            buffManager.activateMagnet(200, 5000);
            expect(() => buffManager.update(0.1, mockPlayerSnake, mockFoods)).not.toThrow();
        });

        test('should not crash with dead player', () => {
            mockPlayerSnake.isAlive = false;
            buffManager.activateMagnet(200, 5000);
            expect(() => buffManager.update(0.1, mockPlayerSnake, mockFoods)).not.toThrow();
        });

        test('should handle negative deltaTime', () => {
            buffManager.activateScoreMultiplier(2, 5000);
            expect(() => buffManager.update(-1, mockPlayerSnake, mockFoods)).not.toThrow();
        });

        test('should handle extremely large deltaTime', () => {
            buffManager.activateScoreMultiplier(2, 5000);
            expect(() => buffManager.update(999999, mockPlayerSnake, mockFoods)).not.toThrow();
        });
    });

    describe('Magnet Core Logic', () => {
        test('should pull food towards player', () => {
            buffManager.activateMagnet(200, 5000);
            const initialX = mockFoods[0].x;

            buffManager.update(0.5, mockPlayerSnake, mockFoods);

            // Food should move closer (x increases from 450 -> 500)
            expect(mockFoods[0].x).toBeGreaterThan(initialX);
        });

        test('should not pull food outside range', () => {
            buffManager.activateMagnet(50, 5000); // Very small range
            const initialPos = { ...mockFoods[1] }; // Far food at (600, 600)

            buffManager.update(0.1, mockPlayerSnake, mockFoods);

            expect(mockFoods[1].x).toBe(initialPos.x);
            expect(mockFoods[1].y).toBe(initialPos.y);
        });

        test('should expire magnet after duration', () => {
            buffManager.activateMagnet(200, 1000); // 1 second

            buffManager.update(2, mockPlayerSnake, mockFoods); // 2 seconds

            expect(buffManager.hasMagnet()).toBe(false);
            expect(buffManager.getMagnetRange()).toBe(0);
        });
    });

    describe('Combo System Critical Logic', () => {
        test('should reset combo on timeout and return event', () => {
            buffManager.incrementCombo();
            buffManager.incrementCombo();
            buffManager.incrementCombo(); // combo = 3

            const event = buffManager.update(3, mockPlayerSnake, mockFoods); // > 2s timeout

            expect(buffManager.comboCount).toBe(0);
            expect(event).toBeDefined();
            expect(event.comboEnded).toBe(true);
            expect(event.count).toBe(3);
        });

        test('should not trigger event for combo < 3', () => {
            buffManager.incrementCombo();
            buffManager.incrementCombo(); // combo = 2

            const event = buffManager.update(3, mockPlayerSnake, mockFoods);

            expect(event).toBeNull();
        });

        test('combo multiplier should increase score correctly', () => {
            buffManager.comboCount = 5;
            const baseScore = 10;

            const finalScore = buffManager.calculateScore(baseScore);

            expect(finalScore).toBe(20); // 5x combo = 2x multiplier
        });

        test('should stack combo and score multipliers', () => {
            buffManager.activateScoreMultiplier(2, 5000);
            buffManager.comboCount = 10; // 3x combo multiplier
            const baseScore = 10;

            const finalScore = buffManager.calculateScore(baseScore);

            expect(finalScore).toBe(60); // 10 * 2 * 3 = 60
        });
    });

    describe('Speed Boost Critical Logic', () => {
        test('should save and restore original speed', () => {
            const originalSpeed = mockPlayerSnake.speed;

            buffManager.activateSpeedBoost(mockPlayerSnake, 1000);
            expect(mockPlayerSnake.speed).toBeGreaterThan(originalSpeed);

            buffManager.update(2, mockPlayerSnake, mockFoods); // Expire
            expect(mockPlayerSnake.speed).toBe(originalSpeed);
        });

        test('should not crash when activating on null player', () => {
            expect(() => buffManager.activateSpeedBoost(null, 1000)).not.toThrow();
        });
    });

    describe('Reset Functionality', () => {
        test('should clear all active buffs', () => {
            buffManager.activateScoreMultiplier(2, 5000);
            buffManager.activateMagnet(200, 5000);
            buffManager.activateSpeedBoost(mockPlayerSnake, 5000);
            buffManager.incrementCombo();
            buffManager.incrementCombo();

            buffManager.reset();

            expect(buffManager.scoreMultiplier).toBe(1);
            expect(buffManager.magnetRange).toBe(0);
            expect(buffManager.comboCount).toBe(0);
            expect(buffManager.scoreMultiplierTimer).toBe(0);
        });
    });
});
