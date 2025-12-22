/**
 * PathManager Tests
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { GridFixtures } from './setup.js';

// Mock CONFIG
global.CONFIG = {
    DOT_TYPES: {
        START: 'start',
        END: 'end',
        NORMAL: 'normal'
    },
    PLAYER: {
        DOUBLE_CLICK_PREVENTION: 100
    }
};

// Mock Logger on window object
global.window = {
    Logger: {
        info: () => {},
        warn: () => {},
        error: () => {}
    }
};

// Import PathManager
const PathManager = (await import('../js/managers/PathManager.js')).default;

describe('PathManager', () => {
    let pathManager;
    let grid;

    beforeEach(() => {
        grid = GridFixtures.create3x3Grid();
        pathManager = new PathManager();
        pathManager.setGrid(grid);
    });

    describe('addMove', () => {
        test('should accept start dot as first move', () => {
            const result = pathManager.addMove(grid.startDot);
            expect(result).toBe(true);
            expect(pathManager.getPath()).toHaveLength(1);
        });

        test('should reject non-start dot as first move', () => {
            const normalDot = grid.dots[1];
            const result = pathManager.addMove(normalDot);
            expect(result).toBe(false);
            expect(pathManager.getPath()).toHaveLength(0);
        });

        test('should accept neighbor as next move', async () => {
            pathManager.addMove(grid.startDot);
            await new Promise(resolve => setTimeout(resolve, 150));
            const neighbor = grid.startDot.neighbors[0];
            const result = pathManager.addMove(neighbor);
            expect(result).toBe(true);
            expect(pathManager.getPath()).toHaveLength(2);
        });

        test('should reject non-neighbor as next move', () => {
            pathManager.addMove(grid.startDot); // (0,0)
            const farDot = grid.dots[8]; // (2,2) - not neighbor
            const result = pathManager.addMove(farDot);
            expect(result).toBe(false);
            expect(pathManager.getPath()).toHaveLength(1);
        });

        test('should reject already visited dot', () => {
            pathManager.addMove(grid.startDot);
            const neighbor = grid.startDot.neighbors[0];
            pathManager.addMove(neighbor);

            // Try to add start again
            const result = pathManager.addMove(grid.startDot);
            expect(result).toBe(false);
        });

        test('should mark dots as visited', () => {
            pathManager.addMove(grid.startDot);
            expect(grid.startDot.playerVisited).toBe(true);
            expect(grid.startDot.visited).toBe(true);
        });
    });

    describe('undo', () => {
        test('should remove last move', async () => {
            pathManager.addMove(grid.startDot);
            await new Promise(resolve => setTimeout(resolve, 150));
            const neighbor = grid.startDot.neighbors[0];
            pathManager.addMove(neighbor);

            const result = pathManager.undo();
            expect(result).toBeTruthy();
            expect(pathManager.getPath()).toHaveLength(1);
        });

        test('should unmark dot as visited', async () => {
            pathManager.addMove(grid.startDot);
            await new Promise(resolve => setTimeout(resolve, 150));
            const neighbor = grid.startDot.neighbors[0];
            pathManager.addMove(neighbor);

            pathManager.undo();
            expect(neighbor.playerVisited).toBe(false);
            expect(neighbor.visited).toBe(false);
        });

        test('should return dot when undoing', async () => {
            pathManager.addMove(grid.startDot);
            await new Promise(resolve => setTimeout(resolve, 150));
            const neighbor = grid.startDot.neighbors[0];
            pathManager.addMove(neighbor);

            const result = pathManager.undo();
            expect(result).toBe(neighbor);
        });

        test('should return null when nothing to undo', () => {
            const result = pathManager.undo();
            expect(result).toBeNull();
        });
    });

    describe('isPathComplete', () => {
        test('should return false for incomplete path', () => {
            pathManager.addMove(grid.startDot);
            expect(pathManager.isPathComplete()).toBe(false);
        });

        test('should return false when at end but not all dots visited', () => {
            // This would require a full path to test properly
            // For now, test the basic case
            expect(pathManager.isPathComplete()).toBe(false);
        });
    });

    describe('getPathLength', () => {
        test('should return 0 for empty path', () => {
            expect(pathManager.getPathLength()).toBe(0);
        });

        test('should return correct length', async () => {
            pathManager.addMove(grid.startDot);
            await new Promise(resolve => setTimeout(resolve, 150));
            pathManager.addMove(grid.startDot.neighbors[0]);
            expect(pathManager.getPathLength()).toBe(2);
        });
    });

    describe('destroy', () => {
        test('should clean up resources', () => {
            pathManager.addMove(grid.startDot);
            pathManager.destroy();

            // Should not crash
            expect(pathManager.getPath()).toEqual([]);
        });
    });
});
