/**
 * RenderManager Tests
 * Test suite for canvas rendering manager
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import CONFIG from '../js/config.js';
import RenderManager from '../js/managers/RenderManager.js';

describe('RenderManager - Construction', () => {
    it('should create with default canvas size', () => {
        const rm = new RenderManager(500, CONFIG);
        expect(rm.canvasSize).toBe(500);
        expect(rm.dotRadius).toBe(CONFIG.GRID.DOT_RADIUS);
    });

    it('should create with custom canvas size', () => {
        const rm = new RenderManager(600, CONFIG);
        expect(rm.canvasSize).toBe(600);
    });

    it('should initialize cellSize to 0', () => {
        const rm = new RenderManager(500, CONFIG);
        expect(rm.cellSize).toBe(0);
    });
});

describe('RenderManager - Grid Setup', () => {
    let rm;

    beforeEach(() => {
        rm = new RenderManager(500, CONFIG);
    });

    it('should calculate cellSize for 3x3 grid', () => {
        const grid = { size: 3, dots: [], edges: [] };
        rm.setGrid(grid);

        const expectedCellSize = (500 - CONFIG.GRID.GRID_PADDING * 2) / 3;
        expect(rm.cellSize).toBe(expectedCellSize);
    });

    it('should calculate cellSize for 5x5 grid', () => {
        const grid = { size: 5, dots: [], edges: [] };
        rm.setGrid(grid);

        const expectedCellSize = (500 - CONFIG.GRID.GRID_PADDING * 2) / 5;
        expect(rm.cellSize).toBe(expectedCellSize);
    });

    it('should store grid reference', () => {
        const grid = { size: 3, dots: [], edges: [] };
        rm.setGrid(grid);

        expect(rm.grid).toBe(grid);
    });
});

describe('RenderManager - Coordinate Conversion', () => {
    let rm;

    beforeEach(() => {
        rm = new RenderManager(500, CONFIG);
        const grid = { size: 3, dots: [], edges: [] };
        rm.setGrid(grid);
    });

    it('should convert dot at (0,0) to screen position', () => {
        const dot = { gridX: 0, gridY: 0 };
        const pos = rm.getDotScreenPos(dot);

        const padding = CONFIG.GRID.GRID_PADDING;
        const expectedX = padding + 0.5 * rm.cellSize;
        const expectedY = padding + 0.5 * rm.cellSize;

        expect(pos.x).toBe(expectedX);
        expect(pos.y).toBe(expectedY);
    });

    it('should convert dot at (2,2) to screen position', () => {
        const dot = { gridX: 2, gridY: 2 };
        const pos = rm.getDotScreenPos(dot);

        const padding = CONFIG.GRID.GRID_PADDING;
        const expectedX = padding + 2.5 * rm.cellSize;
        const expectedY = padding + 2.5 * rm.cellSize;

        expect(pos.x).toBe(expectedX);
        expect(pos.y).toBe(expectedY);
    });

    it('should center dots in grid cells', () => {
        const dot = { gridX: 1, gridY: 1 };
        const pos = rm.getDotScreenPos(dot);

        // Position should be at center (0.5 offset)
        const padding = CONFIG.GRID.GRID_PADDING;
        const expectedX = padding + 1.5 * rm.cellSize;

        expect(pos.x).toBe(expectedX);
    });
});

describe('RenderManager - Canvas Drawing', () => {
    let rm, mockCtx;

    beforeEach(() => {
        rm = new RenderManager(500, CONFIG);
        const grid = {
            size: 3,
            dots: [
                { gridX: 0, gridY: 0, type: CONFIG.DOT_TYPES.START },
                { gridX: 1, gridY: 1, type: CONFIG.DOT_TYPES.NORMAL },
                { gridX: 2, gridY: 2, type: CONFIG.DOT_TYPES.END }
            ],
            edges: [
                { from: { gridX: 0, gridY: 0 }, to: { gridX: 1, gridY: 1 } }
            ]
        };
        rm.setGrid(grid);

        // Mock canvas context
        mockCtx = {
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 0,
            lineCap: '',
            lineJoin: '',
            fillRect: vi.fn(),
            beginPath: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            stroke: vi.fn(),
            arc: vi.fn(),
            fill: vi.fn(),
            setLineDash: vi.fn()
        };
    });

    it('should clear canvas with background color', () => {
        rm.clearCanvas(mockCtx);

        expect(mockCtx.fillStyle).toBe(CONFIG.COLORS.CANVAS_BG);
        expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 500, 500);
    });

    it('should draw grid lines', () => {
        rm.drawGridLines(mockCtx);

        expect(mockCtx.strokeStyle).toBe(CONFIG.COLORS.GRID_LINE);
        expect(mockCtx.lineWidth).toBe(1);
        // Should draw vertical and horizontal lines
        expect(mockCtx.beginPath).toHaveBeenCalled();
        expect(mockCtx.stroke).toHaveBeenCalled();
    });

    it('should draw connections with dashed lines', () => {
        rm.drawConnections(mockCtx);

        expect(mockCtx.setLineDash).toHaveBeenCalledWith([5, 5]);
        expect(mockCtx.stroke).toHaveBeenCalled();
        expect(mockCtx.setLineDash).toHaveBeenCalledWith([]);
    });

    it('should draw path with correct style', () => {
        const path = [
            { gridX: 0, gridY: 0 },
            { gridX: 1, gridY: 1 }
        ];

        rm.drawPath(mockCtx, path, CONFIG.COLORS.PLAYER_PATH);

        expect(mockCtx.strokeStyle).toBe(CONFIG.COLORS.PLAYER_PATH);
        expect(mockCtx.lineWidth).toBe(CONFIG.GRID.LINE_WIDTH);
        expect(mockCtx.lineCap).toBe('round');
        expect(mockCtx.lineJoin).toBe('round');
    });

    it('should not draw path with less than 2 points', () => {
        rm.drawPath(mockCtx, [{ gridX: 0, gridY: 0 }], CONFIG.COLORS.PLAYER_PATH);

        expect(mockCtx.beginPath).not.toHaveBeenCalled();
    });

    it('should draw dots with different sizes for start/end', () => {
        rm.drawDots(mockCtx, 'player');

        // Should draw all dots
        expect(mockCtx.arc).toHaveBeenCalled();
        expect(mockCtx.fill).toHaveBeenCalled();
        expect(mockCtx.stroke).toHaveBeenCalled();
    });

    it('should handle empty grid gracefully', () => {
        rm.grid = null;

        expect(() => rm.drawGridLines(mockCtx)).not.toThrow();
        expect(() => rm.drawConnections(mockCtx)).not.toThrow();
        expect(() => rm.drawDots(mockCtx)).not.toThrow();
    });
});

describe('RenderManager - Validation', () => {
    let rm;

    beforeEach(() => {
        rm = new RenderManager(500, CONFIG);
    });

    it('should handle grid with zero size', () => {
        const grid = { size: 0, dots: [], edges: [] };
        rm.setGrid(grid);

        expect(rm.cellSize).toBe(Infinity); // Division by zero
    });

    it('should handle missing grid gracefully', () => {
        const dot = { gridX: 0, gridY: 0 };
        // Should not throw even if grid not set
        expect(() => rm.getDotScreenPos(dot)).not.toThrow();
    });
});

describe('RenderManager - Pheromones', () => {
    let rm, mockCtx;

    beforeEach(() => {
        rm = new RenderManager(500, CONFIG);
        const grid = {
            size: 3,
            dots: [],
            edges: [
                {
                    from: { id: 0, gridX: 0, gridY: 0 },
                    to: { id: 1, gridX: 1, gridY: 1 }
                },
                {
                    from: { id: 1, gridX: 1, gridY: 1 },
                    to: { id: 2, gridX: 2, gridY: 2 }
                }
            ]
        };
        rm.setGrid(grid);

        mockCtx = {
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 0,
            beginPath: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            stroke: vi.fn()
        };
    });

    it('should draw pheromones with varying alpha', () => {
        const pheromones = new Map();
        pheromones.set('0-1', 5);  // Medium level
        pheromones.set('1-2', 10); // High level

        const getEdgeKey = (from, to) => `${from.id}-${to.id}`;

        rm.drawPheromones(mockCtx, pheromones, getEdgeKey);

        // Should set stroke style with rgba
        expect(mockCtx.strokeStyle).toContain('rgba');
        expect(mockCtx.stroke).toHaveBeenCalled();
    });

    it('should handle empty pheromones map', () => {
        const pheromones = new Map();
        const getEdgeKey = (from, to) => `${from.id}-${to.id}`;

        // Should not throw
        expect(() => {
            rm.drawPheromones(mockCtx, pheromones, getEdgeKey);
        }).not.toThrow();
    });

    it('should handle null pheromones', () => {
        const getEdgeKey = (from, to) => `${from.id}-${to.id}`;

        // Should not throw
        expect(() => {
            rm.drawPheromones(mockCtx, null, getEdgeKey);
        }).not.toThrow();
    });

    it('should clamp alpha values to max 0.6', () => {
        const pheromones = new Map();
        // Set both edges to high level
        pheromones.set('0-1', 100);
        pheromones.set('1-2', 100);

        const getEdgeKey = (from, to) => `${from.id}-${to.id}`;

        rm.drawPheromones(mockCtx, pheromones, getEdgeKey);

        // The last strokeStyle should have alpha clamped to 0.6
        expect(mockCtx.strokeStyle).toContain('0.6');
    });

    it('should clamp alpha values to min 0.1', () => {
        const pheromones = new Map();
        pheromones.set('0-1', 0); // Zero level

        const getEdgeKey = (from, to) => `${from.id}-${to.id}`;

        rm.drawPheromones(mockCtx, pheromones, getEdgeKey);

        // Alpha should be clamped to min 0.1
        expect(mockCtx.strokeStyle).toContain('0.1');
    });

    it('should handle no grid set', () => {
        rm.grid = null;
        const pheromones = new Map();
        const getEdgeKey = (from, to) => `${from.id}-${to.id}`;

        expect(() => {
            rm.drawPheromones(mockCtx, pheromones, getEdgeKey);
        }).not.toThrow();
    });
});
