/**
 * API Contract Tests - Verify manager method signatures
 * Catches method name mismatches that unit tests miss
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { ParticleManager } from '../js/managers/ParticleManager.js';
import { FoodManager } from '../js/managers/FoodManager.js';
import { SnakeManager } from '../js/managers/SnakeManager.js';
import { UIManager } from '../js/managers/UIManager.js';
import { AudioManager } from '../js/managers/AudioManager.js';
import { CameraManager } from '../js/managers/CameraManager.js';
import { BuffManager } from '../js/managers/BuffManager.js';
import { CollisionManager } from '../js/managers/CollisionManager.js';
import { RenderManager } from '../js/managers/RenderManager.js';
import { LeaderboardManager } from '../js/managers/LeaderboardManager.js';
import { KillFeedManager } from '../js/managers/KillFeedManager.js';
import { AIController } from '../js/ai/AIController.js';

describe('API Contract Tests', () => {
    describe('ParticleManager - Methods called by SnakeGame', () => {
        let manager;

        beforeEach(() => {
            manager = new ParticleManager();
        });

        test('should have spawnFoodCollect method', () => {
            expect(typeof manager.spawnFoodCollect).toBe('function');
        });

        test('should have spawnExplosion method', () => {
            expect(typeof manager.spawnExplosion).toBe('function');
        });

        test('should have update method', () => {
            expect(typeof manager.update).toBe('function');
        });

        test('should have render method', () => {
            expect(typeof manager.render).toBe('function');
        });
    });

    describe('FoodManager - Methods called by SnakeGame', () => {
        let manager;

        beforeEach(() => {
            manager = new FoodManager();
        });

        test('should have spawnFoodAt method', () => {
            expect(typeof manager.spawnFoodAt).toBe('function');
        });

        test('should have ensureMinimumFood method', () => {
            expect(typeof manager.ensureMinimumFood).toBe('function');
        });

        test('should have clear method', () => {
            expect(typeof manager.clear).toBe('function');
        });

        test('should have foods array', () => {
            expect(Array.isArray(manager.foods)).toBe(true);
        });

        test('should have render method', () => {
            expect(typeof manager.render).toBe('function');
        });
    });

    describe('SnakeManager - Methods called by SnakeGame', () => {
        let manager;

        beforeEach(() => {
            manager = new SnakeManager();
        });

        test('should have createPlayerSnake method', () => {
            expect(typeof manager.createPlayerSnake).toBe('function');
        });

        test('should have createAISnake method', () => {
            expect(typeof manager.createAISnake).toBe('function');
        });

        test('should have getAllSegments method', () => {
            expect(typeof manager.getAllSegments).toBe('function');
        });

        test('should have getPlayerSnake method', () => {
            expect(typeof manager.getPlayerSnake).toBe('function');
        });

        test('should have getAISnakes method', () => {
            expect(typeof manager.getAISnakes).toBe('function');
        });

        test('should have clear method', () => {
            expect(typeof manager.clear).toBe('function');
        });

        test('should have snakes Map', () => {
            expect(manager.snakes instanceof Map).toBe(true);
        });

        test('should have render method', () => {
            expect(typeof manager.render).toBe('function');
        });

        test('should have update method', () => {
            expect(typeof manager.update).toBe('function');
        });
    });

    describe('BuffManager - Methods called by SnakeGame', () => {
        let manager;
        let mockLogger;

        beforeEach(() => {
            mockLogger = { log: vi.fn(), info: vi.fn(), warn: vi.fn() };
            manager = new BuffManager(mockLogger);
        });

        test('should have reset method', () => {
            expect(typeof manager.reset).toBe('function');
        });

        test('should have update method', () => {
            expect(typeof manager.update).toBe('function');
        });

        test('should have activateSpeedBoost method', () => {
            expect(typeof manager.activateSpeedBoost).toBe('function');
        });

        test('should have activateScoreMultiplier method', () => {
            expect(typeof manager.activateScoreMultiplier).toBe('function');
        });

        test('should have activateMagnet method', () => {
            expect(typeof manager.activateMagnet).toBe('function');
        });

        test('should have incrementCombo method', () => {
            expect(typeof manager.incrementCombo).toBe('function');
        });

        test('should have calculateScore method', () => {
            expect(typeof manager.calculateScore).toBe('function');
        });

        test('should have getComboCount method', () => {
            expect(typeof manager.getComboCount).toBe('function');
        });

        test('should have hasMagnet method', () => {
            expect(typeof manager.hasMagnet).toBe('function');
        });

        test('should have getMagnetRange method', () => {
            expect(typeof manager.getMagnetRange).toBe('function');
        });

        test('should have hasCombo method', () => {
            expect(typeof manager.hasCombo).toBe('function');
        });
    });

    describe('CollisionManager - Methods called by SnakeGame', () => {
        let manager;
        let mockLogger;

        beforeEach(() => {
            mockLogger = { log: vi.fn(), info: vi.fn() };
            manager = new CollisionManager(5000, mockLogger);
        });

        test('should have checkFoodCollections method', () => {
            expect(typeof manager.checkFoodCollections).toBe('function');
        });

        test('should have checkAllCollisions method', () => {
            expect(typeof manager.checkAllCollisions).toBe('function');
        });
    });

    describe('RenderManager - Methods called by SnakeGame', () => {
        let manager;
        let mockCanvas, mockCamera, mockLogger;

        beforeEach(() => {
            mockCanvas = document.createElement('canvas');
            mockCamera = { getX: () => 0, getY: () => 0 };
            mockLogger = { log: vi.fn(), info: vi.fn(), warn: vi.fn() };
            manager = new RenderManager(mockCanvas, mockCamera, mockLogger);
        });

        test('should have updateStars method', () => {
            expect(typeof manager.updateStars).toBe('function');
        });

        test('should have render method', () => {
            expect(typeof manager.render).toBe('function');
        });

        test('should have destroy method', () => {
            expect(typeof manager.destroy).toBe('function');
        });
    });

    describe('CameraManager - Methods called by SnakeGame', () => {
        let manager;

        beforeEach(() => {
            manager = new CameraManager(1920, 1080, 5000);
        });

        test('should have follow method', () => {
            expect(typeof manager.follow).toBe('function');
        });

        test('should have update method', () => {
            expect(typeof manager.update).toBe('function');
        });

        test('should have getX method', () => {
            expect(typeof manager.getX).toBe('function');
        });

        test('should have getY method', () => {
            expect(typeof manager.getY).toBe('function');
        });

        test('should have resize method', () => {
            expect(typeof manager.resize).toBe('function');
        });
    });

    describe('AudioManager - Methods called by SnakeGame', () => {
        let manager;

        beforeEach(() => {
            manager = new AudioManager();
        });

        test('should have play method', () => {
            expect(typeof manager.play).toBe('function');
        });
    });

    describe('UIManager - Methods called by SnakeGame', () => {
        let manager;
        let mockContainer;

        beforeEach(() => {
            mockContainer = document.createElement('div');
            manager = new UIManager(mockContainer);
        });

        test('should have init method', () => {
            expect(typeof manager.init).toBe('function');
        });

        test('should have showStartScreen method', () => {
            expect(typeof manager.showStartScreen).toBe('function');
        });

        test('should have showGameOver method (not showGameOverScreen)', () => {
            expect(typeof manager.showGameOver).toBe('function');
            expect(manager.showGameOverScreen).toBeUndefined();
        });

        test('should have updateScore method', () => {
            expect(typeof manager.updateScore).toBe('function');
        });

        test('should have updateLength method', () => {
            expect(typeof manager.updateLength).toBe('function');
        });

        test('should have showToast method', () => {
            expect(typeof manager.showToast).toBe('function');
        });

        test('should have showBuffIndicator method', () => {
            expect(typeof manager.showBuffIndicator).toBe('function');
        });

        test('should have showLanguageSelector method', () => {
            expect(typeof manager.showLanguageSelector).toBe('function');
        });

        test('should have updatePauseButton method', () => {
            expect(typeof manager.updatePauseButton).toBe('function');
        });
    });

    describe('LeaderboardManager - Methods called by SnakeGame', () => {
        let manager;

        beforeEach(() => {
            manager = new LeaderboardManager();
        });

        test('should have update method', () => {
            expect(typeof manager.update).toBe('function');
        });

        test('should have render method', () => {
            expect(typeof manager.render).toBe('function');
        });

        test('should have reset method', () => {
            expect(typeof manager.reset).toBe('function');
        });
    });

    describe('KillFeedManager - Methods called by SnakeGame', () => {
        let manager;

        beforeEach(() => {
            manager = new KillFeedManager();
        });

        test('should have addDeath method (not addKill)', () => {
            expect(typeof manager.addDeath).toBe('function');
            expect(manager.addKill).toBeUndefined();
        });

        test('should have update method', () => {
            expect(typeof manager.update).toBe('function');
        });

        test('should have render method', () => {
            expect(typeof manager.render).toBe('function');
        });

        test('should have reset method', () => {
            expect(typeof manager.reset).toBe('function');
        });
    });

    describe('AIController - Methods called by SnakeGame', () => {
        let controller;

        beforeEach(() => {
            controller = new AIController();
        });

        test('should have registerAI method', () => {
            expect(typeof controller.registerAI).toBe('function');
        });

        test('should have updateAll method', () => {
            expect(typeof controller.updateAll).toBe('function');
        });

        test('should have aiSnakes Map', () => {
            expect(controller.aiSnakes instanceof Map).toBe(true);
        });
    });
});
