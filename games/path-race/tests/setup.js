/**
 * Test Setup and Helpers
 * Provides mock objects and utilities for testing
 */

// Mock Canvas Context
export class MockCanvasContext {
    constructor() {
        this.fillStyle = '';
        this.strokeStyle = '';
        this.lineWidth = 1;
        this.lineCap = 'butt';
        this.lineJoin = 'miter';
        this.operations = [];
    }

    fillRect(x, y, w, h) {
        this.operations.push({ type: 'fillRect', x, y, w, h });
    }

    strokeRect(x, y, w, h) {
        this.operations.push({ type: 'strokeRect', x, y, w, h });
    }

    beginPath() {
        this.operations.push({ type: 'beginPath' });
    }

    moveTo(x, y) {
        this.operations.push({ type: 'moveTo', x, y });
    }

    lineTo(x, y) {
        this.operations.push({ type: 'lineTo', x, y });
    }

    arc(x, y, radius, startAngle, endAngle) {
        this.operations.push({ type: 'arc', x, y, radius, startAngle, endAngle });
    }

    fill() {
        this.operations.push({ type: 'fill' });
    }

    stroke() {
        this.operations.push({ type: 'stroke' });
    }

    setLineDash(segments) {
        this.operations.push({ type: 'setLineDash', segments });
    }

    clearOperations() {
        this.operations = [];
    }
}

// Mock Canvas Element
export class MockCanvas {
    constructor(width = 500, height = 500) {
        this.width = width;
        this.height = height;
        this.style = { width: '500px', height: '500px' };
        this.classList = new Set();
        this.mockContext = new MockCanvasContext();
    }

    getContext(type) {
        if (type === '2d') return this.mockContext;
        return null;
    }

    getBoundingClientRect() {
        return {
            left: 0,
            top: 0,
            width: this.width,
            height: this.height,
            x: 0,
            y: 0,
            right: this.width,
            bottom: this.height
        };
    }
}

// Grid Test Fixtures
export const GridFixtures = {
    /**
     * Create a simple 3x3 grid for testing
     */
    create3x3Grid() {
        const dots = [];
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                dots.push({
                    x, y,
                    gridX: x,
                    gridY: y,
                    type: 'normal',
                    visited: false,
                    playerVisited: false,
                    aiVisited: false,
                    index: y * 3 + x,
                    neighbors: []
                });
            }
        }

        // Set start and end
        dots[0].type = 'start';
        dots[8].type = 'end';

        // Add neighbors (orthogonal only)
        dots.forEach(dot => {
            const neighbors = [];
            const { gridX, gridY } = dot;

            // Up, Down, Left, Right
            if (gridY > 0) neighbors.push(dots[(gridY - 1) * 3 + gridX]);
            if (gridY < 2) neighbors.push(dots[(gridY + 1) * 3 + gridX]);
            if (gridX > 0) neighbors.push(dots[gridY * 3 + (gridX - 1)]);
            if (gridX < 2) neighbors.push(dots[gridY * 3 + (gridX + 1)]);

            dot.neighbors = neighbors;
        });

        const edges = [];
        dots.forEach(dot => {
            dot.neighbors.forEach(neighbor => {
                const key = [dot.index, neighbor.index].sort().join('-');
                if (!edges.find(e => e.key === key)) {
                    edges.push({
                        key,
                        from: dot,
                        to: neighbor,
                        pheromone: 1.0
                    });
                }
            });
        });

        return {
            size: 3,
            dots,
            edges,
            startDot: dots[0],
            endDot: dots[8],
            solution: null
        };
    }
};

// Mock Audio Context
export class MockAudioContext {
    constructor() {
        this.sounds = new Map();
        this.currentlyPlaying = null;
    }

    loadSound(name, path) {
        this.sounds.set(name, { path, loaded: true });
    }

    play(name) {
        if (this.sounds.has(name)) {
            this.currentlyPlaying = name;
            return Promise.resolve();
        }
        return Promise.reject(new Error(`Sound ${name} not loaded`));
    }

    stop() {
        this.currentlyPlaying = null;
    }
}

// Mock Logger
export class MockLogger {
    constructor() {
        this.logs = [];
    }

    info(...args) {
        this.logs.push({ level: 'info', args });
    }

    warn(...args) {
        this.logs.push({ level: 'warn', args });
    }

    error(...args) {
        this.logs.push({ level: 'error', args });
    }

    clear() {
        this.logs = [];
    }
}

// DOM Setup Utilities
export function setupDOM() {
    // Create basic DOM structure for tests
    document.body.innerHTML = `
        <div id="game-container">
            <canvas id="player-canvas"></canvas>
            <canvas id="ai-canvas"></canvas>
        </div>
    `;
}

export function cleanupDOM() {
    document.body.innerHTML = '';
}
