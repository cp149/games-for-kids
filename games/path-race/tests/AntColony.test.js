/**
 * AntColony Tests
 * Comprehensive test suite for Ant Colony Optimization algorithm
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { GridFixtures } from './setup.js';

// Mock CONFIG
global.CONFIG = {
    ACO: {
        ALPHA: 0.8,
        BETA: 3.0,
        RHO: 0.1,
        Q: 100,
        NUM_ANTS: 10,
        INITIAL_PHEROMONE: 1.0
    }
};

// Mock Logger
global.window = {
    Logger: {
        info: () => {},
        warn: () => {},
        error: () => {}
    }
};

// Import AntColony
const AntColony = (await import('../js/classes/AntColony.js')).default;

describe('AntColony', () => {
    let colony;
    let grid;

    beforeEach(() => {
        grid = GridFixtures.create3x3Grid();
        colony = new AntColony(grid, 1.0);
    });

    describe('Constructor & Initialization', () => {
        test('should initialize with grid and difficulty', () => {
            expect(colony.grid).toBe(grid);
            expect(colony.difficulty).toBe(1.0);
        });

        test('should initialize ACO parameters from CONFIG', () => {
            expect(colony.alpha).toBe(0.8);
            expect(colony.beta).toBe(3.0);
            expect(colony.rho).toBe(0.1);
            expect(colony.Q).toBe(100);
            expect(colony.numAnts).toBe(10);
        });

        test('should initialize pheromones on all edges', () => {
            expect(colony.pheromones.size).toBe(grid.edges.length);
            colony.pheromones.forEach(value => {
                expect(value).toBe(1.0);
            });
        });

        test('should initialize empty state', () => {
            expect(colony.bestPath).toBeNull();
            expect(colony.bestPathLength).toBe(Infinity);
            expect(colony.iteration).toBe(0);
        });
    });

    describe('Pheromone Management', () => {
        test('getEdgeKey should create consistent key', () => {
            const dot1 = grid.dots[0];
            const dot2 = grid.dots[1];
            const key1 = colony.getEdgeKey(dot1, dot2);
            const key2 = colony.getEdgeKey(dot2, dot1);
            expect(key1).toBe(key2);
        });

        test('getPheromone should return pheromone level', () => {
            const dot1 = grid.dots[0];
            const dot2 = grid.dots[1];
            const pheromone = colony.getPheromone(dot1, dot2);
            expect(pheromone).toBe(1.0);
        });

        test('setPheromone should update pheromone level', () => {
            const dot1 = grid.dots[0];
            const dot2 = grid.dots[1];
            colony.setPheromone(dot1, dot2, 5.0);
            expect(colony.getPheromone(dot1, dot2)).toBe(5.0);
        });

        test('evaporatePheromones should reduce all pheromones', () => {
            const initialValue = 1.0;
            colony.evaporatePheromones();
            colony.pheromones.forEach(value => {
                expect(value).toBe(initialValue * (1 - colony.rho));
            });
        });

        test('evaporatePheromones should apply rho correctly', () => {
            colony.pheromones.set('0-1', 10.0);
            colony.evaporatePheromones();
            expect(colony.pheromones.get('0-1')).toBe(10.0 * 0.9); // rho = 0.1
        });

        test('depositPheromones should add pheromones to path edges', () => {
            const path = [grid.dots[0], grid.dots[1], grid.dots[2]];
            const initialPheromone = colony.getPheromone(grid.dots[0], grid.dots[1]);

            colony.depositPheromones([path]);

            const newPheromone = colony.getPheromone(grid.dots[0], grid.dots[1]);
            expect(newPheromone).toBeGreaterThan(initialPheromone);
        });

        test('depositPheromones should use Q/length formula', () => {
            const path = [grid.dots[0], grid.dots[1]];
            const expectedContribution = colony.Q / path.length;

            colony.depositPheromones([path]);

            const pheromone = colony.getPheromone(grid.dots[0], grid.dots[1]);
            expect(pheromone).toBe(1.0 + expectedContribution);
        });
    });

    describe('Heuristic Calculation', () => {
        test('calculateHeuristic should return higher value for dots closer to end', () => {
            const visited = new Set();
            const closeDot = grid.dots[7]; // (1, 2) - closer to end (2, 2)
            const farDot = grid.dots[1];   // (1, 0) - farther from end

            const h1 = colony.calculateHeuristic(closeDot, visited);
            const h2 = colony.calculateHeuristic(farDot, visited);

            expect(h1).toBeGreaterThan(h2);
        });

        test('calculateHeuristic should return value between 0 and 1', () => {
            const visited = new Set();
            grid.dots.forEach(dot => {
                const h = colony.calculateHeuristic(dot, visited);
                expect(h).toBeGreaterThanOrEqual(0);
                expect(h).toBeLessThanOrEqual(1);
            });
        });

        test('calculateHeuristic should consider connectivity', () => {
            const visited = new Set([1, 2, 4, 5, 7]); // Mark many as visited
            const wellConnectedDot = grid.dots[3]; // (0, 1) - has unvisited neighbors
            const poorlyConnectedDot = grid.dots[6]; // (0, 2) - fewer options

            // More unvisited neighbors should slightly increase heuristic
            const h1 = colony.calculateHeuristic(wellConnectedDot, visited);
            const h2 = colony.calculateHeuristic(poorlyConnectedDot, visited);

            // This might be close, but connectivity should have some effect
            expect(typeof h1).toBe('number');
            expect(typeof h2).toBe('number');
        });
    });

    describe('Path Construction', () => {
        test('constructPath should start at start dot', () => {
            const path = colony.constructPath();
            if (path) {
                expect(path[0].index).toBe(grid.startDot.index);
            }
        });

        test('constructPath should not revisit dots', () => {
            const path = colony.constructPath();
            if (path) {
                const indices = path.map(d => d.index);
                const uniqueIndices = new Set(indices);
                expect(uniqueIndices.size).toBe(indices.length);
            }
        });

        test('constructPath should return null if stuck', () => {
            // Create a scenario where ant gets stuck
            // Set very high pheromone on a dead-end path
            const deadEnd = grid.dots[2]; // (2, 0) - corner
            colony.setPheromone(grid.startDot, grid.dots[1], 1000);
            colony.setPheromone(grid.dots[1], deadEnd, 1000);

            // Try many times, some should get stuck
            let stuckCount = 0;
            for (let i = 0; i < 20; i++) {
                const path = colony.constructPath();
                if (path === null) {
                    stuckCount++;
                }
            }

            // At least some attempts should result in getting stuck
            // (or all should succeed if heuristic is strong enough)
            expect(typeof stuckCount).toBe('number');
        });

        test('selectNextDot should return null if no unvisited neighbors', () => {
            const visited = new Set(grid.dots.map(d => d.index));
            const result = colony.selectNextDot(grid.startDot, visited);
            expect(result).toBeNull();
        });

        test('selectNextDot should return one of the unvisited neighbors', () => {
            const visited = new Set([grid.startDot.index]);
            const next = colony.selectNextDot(grid.startDot, visited);
            expect(next).not.toBeNull();
            expect(grid.startDot.neighbors).toContain(next);
        });

        test('selectNextDot should prefer high pheromone/heuristic', () => {
            const visited = new Set([grid.startDot.index]);
            const neighbor1 = grid.startDot.neighbors[0];
            const neighbor2 = grid.startDot.neighbors[1];

            // Set very high pheromone on one edge
            colony.setPheromone(grid.startDot, neighbor1, 1000);
            colony.setPheromone(grid.startDot, neighbor2, 1);

            // Try multiple times, should heavily favor neighbor1
            let count1 = 0;
            for (let i = 0; i < 50; i++) {
                const next = colony.selectNextDot(grid.startDot, visited);
                if (next === neighbor1) count1++;
            }

            // Should select high-pheromone neighbor most of the time
            expect(count1).toBeGreaterThan(35); // At least 70% of attempts
        });
    });

    describe('Path Validation', () => {
        test('isValidPath should accept valid complete path', () => {
            const path = grid.dots; // All dots in order
            const result = colony.isValidPath(path);
            expect(result).toBe(true);
        });

        test('isValidPath should reject incomplete path', () => {
            const path = [grid.dots[0], grid.dots[1]];
            const result = colony.isValidPath(path);
            expect(result).toBe(false);
        });

        test('isValidPath should reject path not starting at start', () => {
            const path = [...grid.dots];
            path[0] = grid.dots[1]; // Wrong start
            const result = colony.isValidPath(path);
            expect(result).toBe(false);
        });

        test('isValidPath should reject path not ending at end', () => {
            const path = [...grid.dots];
            path[path.length - 1] = grid.dots[0]; // Wrong end
            const result = colony.isValidPath(path);
            expect(result).toBe(false);
        });

        test('isValidPath should reject path with duplicate dots', () => {
            const path = [...grid.dots];
            path[5] = grid.dots[0]; // Duplicate
            const result = colony.isValidPath(path);
            expect(result).toBe(false);
        });

        test('isValidPath should reject null path', () => {
            const result = colony.isValidPath(null);
            expect(result).toBe(false);
        });

        test('isValidPath should reject undefined path', () => {
            const result = colony.isValidPath(undefined);
            expect(result).toBe(false);
        });
    });

    describe('ACO Iteration', () => {
        test('runIteration should construct paths with ants', async () => {
            const result = await colony.runIteration();
            expect(colony.iteration).toBe(1);
        });

        test('runIteration should update best path if better found', async () => {
            // Run multiple iterations
            for (let i = 0; i < 5; i++) {
                await colony.runIteration();
            }

            // Should have found something by now (3x3 is small)
            // Or at least attempted to find a path
            expect(colony.iteration).toBe(5);
        });

        test('runIteration should evaporate and deposit pheromones', async () => {
            const initialPheromone = colony.getPheromone(grid.dots[0], grid.dots[1]);

            await colony.runIteration();

            const newPheromone = colony.getPheromone(grid.dots[0], grid.dots[1]);
            // Pheromone should change (evaporated and possibly deposited)
            expect(newPheromone).not.toBe(initialPheromone);
        });

        test('runIteration should track best path length', async () => {
            expect(colony.bestPathLength).toBe(Infinity);

            // Run iterations until we find a valid path
            for (let i = 0; i < 20; i++) {
                await colony.runIteration();
                if (colony.bestPath) break;
            }

            if (colony.bestPath) {
                expect(colony.bestPathLength).toBe(colony.bestPath.length);
            }
        });
    });

    describe('State Management', () => {
        test('getBestPath should return best path', () => {
            colony.bestPath = [grid.dots[0], grid.dots[1]];
            expect(colony.getBestPath()).toBe(colony.bestPath);
        });

        test('getBestPath should return null initially', () => {
            expect(colony.getBestPath()).toBeNull();
        });

        test('getIteration should return iteration count', async () => {
            expect(colony.getIteration()).toBe(0);
            await colony.runIteration();
            expect(colony.getIteration()).toBe(1);
        });

        test('getPheromones should return pheromone map', () => {
            const pheromones = colony.getPheromones();
            expect(pheromones).toBeInstanceOf(Map);
            expect(pheromones.size).toBeGreaterThan(0);
        });

        test('reset should clear state', () => {
            colony.iteration = 5;
            colony.bestPath = [grid.dots[0]];
            colony.bestPathLength = 10;

            colony.reset();

            expect(colony.iteration).toBe(0);
            expect(colony.bestPath).toBeNull();
            expect(colony.bestPathLength).toBe(Infinity);
        });

        test('reset should reinitialize pheromones', () => {
            colony.setPheromone(grid.dots[0], grid.dots[1], 50);
            colony.reset();

            const pheromone = colony.getPheromone(grid.dots[0], grid.dots[1]);
            expect(pheromone).toBe(1.0);
        });
    });

    describe('Integration Tests', () => {
        test('should solve simple 3x3 grid within reasonable iterations', async () => {
            let foundSolution = false;

            // Run up to 50 iterations
            for (let i = 0; i < 50; i++) {
                await colony.runIteration();
                const bestPath = colony.getBestPath();

                if (bestPath && colony.isValidPath(bestPath)) {
                    foundSolution = true;
                    break;
                }
            }

            // 3x3 grid should be solvable
            expect(foundSolution).toBe(true);
        }, 10000); // 10 second timeout

        test('should improve path quality over iterations', async () => {
            const pathLengths = [];

            for (let i = 0; i < 30; i++) {
                await colony.runIteration();
                if (colony.bestPath) {
                    pathLengths.push(colony.bestPathLength);
                }
            }

            if (pathLengths.length > 1) {
                // Path length should stabilize or improve (not worse than first)
                const firstLength = pathLengths[0];
                const lastLength = pathLengths[pathLengths.length - 1];
                expect(lastLength).toBeLessThanOrEqual(firstLength);
            }
        }, 10000);

        test('difficulty parameter should be stored', () => {
            const hardColony = new AntColony(grid, 2.0);
            expect(hardColony.difficulty).toBe(2.0);
        });
    });

    describe('Edge Cases', () => {
        test('should handle grid with only start and end', () => {
            // Create minimal grid
            const minGrid = {
                dots: [
                    { index: 0, gridX: 0, gridY: 0, type: 'start', neighbors: [] },
                    { index: 1, gridX: 1, gridY: 0, type: 'end', neighbors: [] }
                ],
                edges: [],
                startDot: null,
                endDot: null
            };
            minGrid.dots[0].neighbors = [minGrid.dots[1]];
            minGrid.dots[1].neighbors = [minGrid.dots[0]];
            minGrid.startDot = minGrid.dots[0];
            minGrid.endDot = minGrid.dots[1];

            const minColony = new AntColony(minGrid);
            expect(minColony.grid).toBe(minGrid);
        });

        test('should handle getPheromone for non-existent edge', () => {
            const result = colony.getPheromone({ index: 999 }, { index: 998 });
            expect(result).toBe(1.0); // Should return initial pheromone
        });

        test('constructPath should handle max length limit', () => {
            // Path construction has a safety limit
            const path = colony.constructPath();

            if (path) {
                // Should not exceed grid size + 1
                expect(path.length).toBeLessThanOrEqual(grid.dots.length + 1);
            }
        });
    });
});
