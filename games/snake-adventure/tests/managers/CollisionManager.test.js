/**
 * CollisionManager Tests - Performance & Crash Prevention
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { CollisionManager } from '../../js/managers/CollisionManager.js';

describe('CollisionManager - Performance & Safety', () => {
    let collisionManager;
    let mockLogger;
    const worldSize = 5000;

    beforeEach(() => {
        mockLogger = { log: vi.fn(), info: vi.fn() };
        collisionManager = new CollisionManager(worldSize, mockLogger);
    });

    describe('Performance - O(n) Complexity', () => {
        test('should complete collision check in <16ms for 50 snakes', () => {
            const snakes = [];
            for (let i = 0; i < 50; i++) {
                snakes.push(createSnake(i, [
                    { x: 100 + i * 50, y: 100 + i * 50 },
                    { x: 110 + i * 50, y: 110 + i * 50 }
                ]));
            }

            const start = performance.now();
            collisionManager.checkAllCollisions(snakes, worldSize);
            const duration = performance.now() - start;

            expect(duration).toBeLessThan(16); // Must finish in 1 frame (60fps)
        });

        test('spatial grid should reduce collision checks', () => {
            // Create 100 snakes spread across world
            const snakes = [];
            for (let i = 0; i < 100; i++) {
                const x = (i % 10) * 500;
                const y = Math.floor(i / 10) * 500;
                snakes.push(createSnake(i, [{ x, y }]));
            }

            const start = performance.now();
            collisionManager.buildGrid(snakes);
            const buildTime = performance.now() - start;

            expect(buildTime).toBeLessThan(5); // Grid build should be fast
        });
    });

    describe('Crash Prevention - Invalid Input', () => {
        test('should not crash with null snakes array', () => {
            expect(() => collisionManager.checkAllCollisions(null, worldSize)).not.toThrow();
        });

        test('should not crash with empty snakes array', () => {
            expect(() => collisionManager.checkAllCollisions([], worldSize)).not.toThrow();
        });

        test('should not crash when snake has NaN coordinates', () => {
            const snake = createSnake(1, [{ x: NaN, y: NaN }]);
            expect(() => collisionManager.checkAllCollisions([snake], worldSize)).not.toThrow();
        });

        test('should not crash when snake has Infinity coordinates', () => {
            const snake = createSnake(1, [{ x: Infinity, y: -Infinity }]);
            expect(() => collisionManager.checkAllCollisions([snake], worldSize)).not.toThrow();
        });

        test('should not crash with null snake in array', () => {
            const snakes = [createSnake(1, [{ x: 100, y: 100 }]), null, createSnake(2, [{ x: 200, y: 200 }])];
            expect(() => collisionManager.checkAllCollisions(snakes, worldSize)).not.toThrow();
        });

        test('should not crash when snake missing getHead', () => {
            const badSnake = { id: 1, isAlive: true, getSegments: () => [] };
            expect(() => collisionManager.checkAllCollisions([badSnake], worldSize)).not.toThrow();
        });

        test('should not crash when snake missing getSegments', () => {
            const badSnake = { id: 1, isAlive: true, getHead: () => ({ x: 100, y: 100 }) };
            expect(() => collisionManager.checkAllCollisions([badSnake], worldSize)).not.toThrow();
        });
    });

    describe('Boundary Collision Critical Cases', () => {
        test('should detect left boundary collision', () => {
            const snake = createSnake(1, [{ x: 5, y: 100 }]);
            const head = snake.getHead();

            const collision = collisionManager.checkBoundaryCollision(head, worldSize, 8);

            expect(collision).toBe(true);
        });

        test('should detect right boundary collision', () => {
            const snake = createSnake(1, [{ x: worldSize - 5, y: 100 }]);
            const head = snake.getHead();

            const collision = collisionManager.checkBoundaryCollision(head, worldSize, 8);

            expect(collision).toBe(true);
        });

        test('should not detect collision in safe area', () => {
            const snake = createSnake(1, [{ x: worldSize / 2, y: worldSize / 2 }]);
            const head = snake.getHead();

            const collision = collisionManager.checkBoundaryCollision(head, worldSize, 8);

            expect(collision).toBe(false);
        });
    });

    describe('Snake-to-Snake Collision', () => {
        test('should detect head hitting another snake body', () => {
            const snake1 = createSnake(1, [
                { x: 100, y: 100 },
                { x: 110, y: 100 },
                { x: 120, y: 100 }
            ]);
            const snake2 = createSnake(2, [
                { x: 115, y: 100 }, // Head colliding with snake1
                { x: 125, y: 100 }
            ]);

            collisionManager.buildGrid([snake1, snake2]);
            const hitSnake = collisionManager.checkSnakeCollisions(snake2, [snake1, snake2]);

            expect(hitSnake).toBe(snake1);
        });

        test('should NOT detect collision with self', () => {
            const snake = createSnake(1, [
                { x: 100, y: 100 },
                { x: 110, y: 100 },
                { x: 120, y: 100 }
            ]);

            collisionManager.buildGrid([snake]);
            const hitSnake = collisionManager.checkSnakeCollisions(snake, [snake]);

            expect(hitSnake).toBeNull();
        });

        test('should NOT detect collision when snakes far apart', () => {
            const snake1 = createSnake(1, [{ x: 100, y: 100 }]);
            const snake2 = createSnake(2, [{ x: 1000, y: 1000 }]);

            collisionManager.buildGrid([snake1, snake2]);
            const hitSnake = collisionManager.checkSnakeCollisions(snake2, [snake1, snake2]);

            expect(hitSnake).toBeNull();
        });
    });

    describe('Food Collection', () => {
        test('should collect nearby food', () => {
            const snake = createSnake(1, [{ x: 100, y: 100 }]);
            const foods = [
                { x: 105, y: 105 }, // Close
                { x: 500, y: 500 }  // Far
            ];

            const collected = collisionManager.checkFoodCollections(snake, foods);

            expect(collected).toHaveLength(1);
            expect(collected[0]).toBe(foods[0]);
        });

        test('should not crash with empty food array', () => {
            const snake = createSnake(1, [{ x: 100, y: 100 }]);

            expect(() => collisionManager.checkFoodCollections(snake, [])).not.toThrow();
        });

        test('should not crash with null food array', () => {
            const snake = createSnake(1, [{ x: 100, y: 100 }]);

            expect(() => collisionManager.checkFoodCollections(snake, null)).not.toThrow();
        });

        test('should not collect for dead snake', () => {
            const snake = createSnake(1, [{ x: 100, y: 100 }]);
            snake.isAlive = false;
            const foods = [{ x: 105, y: 105 }];

            const collected = collisionManager.checkFoodCollections(snake, foods);

            expect(collected).toHaveLength(0);
        });
    });

    describe('Grid Building', () => {
        test('should skip dead snakes', () => {
            const snakes = [
                createSnake(1, [{ x: 100, y: 100 }]),
                createSnake(2, [{ x: 200, y: 200 }])
            ];
            snakes[1].isAlive = false;

            collisionManager.buildGrid(snakes);
            const stats = collisionManager.getGridStats();

            // Should only have alive snake's segments
            expect(stats.totalItems).toBeGreaterThan(0);
            expect(stats.totalItems).toBeLessThan(10); // Not both snakes
        });

        test('should clear grid on rebuild', () => {
            const snakes1 = [createSnake(1, [{ x: 100, y: 100 }])];
            collisionManager.buildGrid(snakes1);
            const stats1 = collisionManager.getGridStats();

            const snakes2 = []; // Empty
            collisionManager.buildGrid(snakes2);
            const stats2 = collisionManager.getGridStats();

            expect(stats2.totalCells).toBe(0);
            expect(stats2.totalItems).toBe(0);
        });
    });

    // Helper function
    function createSnake(id, segments) {
        return {
            id,
            isAlive: true,
            getHead: () => segments[0] || null,
            getSegments: () => segments
        };
    }
});
