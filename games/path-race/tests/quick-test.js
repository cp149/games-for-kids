#!/usr/bin/env node
/**
 * Quick Test Runner - No dependencies needed
 * Runs basic algorithm validation tests
 */

// Setup globals
global.window = {
    Logger: {
        info: (msg) => console.log(`ℹ️  ${msg}`),
        warn: (msg) => console.warn(`⚠️  ${msg}`),
        error: (msg) => console.error(`❌ ${msg}`)
    }
};

global.CONFIG = {
    ACO: {
        NUM_ANTS: 10,
        MAX_ITERATIONS: 100,
        ITERATION_DELAY: 150,
        ALPHA: 0.8,
        BETA: 3.0,
        RHO: 0.1,
        Q: 100,
        INITIAL_PHEROMONE: 1.0
    },
    DOT_TYPES: {
        START: 'start',
        END: 'end',
        NORMAL: 'normal'
    },
    GRID: {
        SIZE_BY_LEVEL: {
            1: 3, 2: 3, 3: 3,
            4: 4, 5: 4, 6: 4,
            7: 5, 8: 5, 9: 5, 10: 5,
            DEFAULT: 6
        }
    }
};

// Import modules
const GridGenerator = require('../js/utils/GridGenerator.js');
const AntColony = require('../js/classes/AntColony.js');

// Test results
let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`✅ ${name}`);
        passed++;
    } catch (error) {
        console.error(`❌ ${name}`);
        console.error(`   Error: ${error.message}`);
        failed++;
    }
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

console.log('\n🧪 Path Race - Quick Algorithm Tests\n');
console.log('=====================================\n');

// Test 1: Grid Generation
test('Grid Generation - 3x3', () => {
    const grid = GridGenerator.generateLevel(1);
    assert(grid.size === 3, 'Grid size should be 3');
    assert(grid.dots.length === 9, 'Should have 9 dots');
    assert(grid.startDot, 'Should have start dot');
    assert(grid.endDot, 'Should have end dot');
    assert(grid.solution, 'Should have solution');
    assert(grid.solution.length === 9, 'Solution should visit all 9 dots');
});

// Test 2: Checkerboard Constraint (Bipartite Graph Theory)
test('Start/End Parity Correct', () => {
    const grid = GridGenerator.generateLevel(1);
    const startParity = (grid.startDot.gridX + grid.startDot.gridY) % 2;
    const endParity = (grid.endDot.gridX + grid.endDot.gridY) % 2;

    // For even grids: different parities
    // For odd grids: same parity (majority partition)
    if (grid.size % 2 === 0) {
        assert(startParity !== endParity, 'Even grid: start and end must be different parities');
    } else {
        assert(startParity === endParity, 'Odd grid: start and end must have same parity (even)');
        assert(startParity === 0, 'Odd grid: both must be in even partition');
    }
});

// Test 3: Solution Validity
test('Solution is Valid Hamiltonian Path', () => {
    const grid = GridGenerator.generateLevel(1);
    const solution = grid.solution;

    assert(solution[0].index === grid.startDot.index, 'Solution starts at start dot');
    assert(solution[solution.length - 1].index === grid.endDot.index, 'Solution ends at end dot');

    // All unique
    const indices = new Set(solution.map(d => d.index));
    assert(indices.size === solution.length, 'All dots must be unique');

    // All adjacent
    for (let i = 0; i < solution.length - 1; i++) {
        const current = solution[i];
        const next = solution[i + 1];
        const isAdjacent = current.neighbors.some(n => n.index === next.index);
        assert(isAdjacent, `Step ${i} to ${i + 1} must be adjacent`);
    }
});

// Test 4: ACO Initialization
test('ACO Initialization', () => {
    const grid = GridGenerator.generateLevel(1);
    const aco = new AntColony(grid, 1.0);

    assert(aco.grid === grid, 'ACO should store grid');
    assert(aco.bestPath === null, 'Initial best path should be null');
    assert(aco.iteration === 0, 'Initial iteration should be 0');

    const pheromones = aco.getPheromones();
    assert(pheromones.size > 0, 'Should have pheromones initialized');
});

// Test 5: Path Validation
test('isValidPath - Valid Path', () => {
    const grid = GridGenerator.generateLevel(1);
    const aco = new AntColony(grid, 1.0);

    const isValid = aco.isValidPath(grid.solution);
    assert(isValid === true, 'Grid solution should be valid');
});

// Test 6: Path Validation - Incomplete
test('isValidPath - Incomplete Path', () => {
    const grid = GridGenerator.generateLevel(1);
    const aco = new AntColony(grid, 1.0);

    const incompletePath = grid.solution.slice(0, 5);
    const isValid = aco.isValidPath(incompletePath);
    assert(isValid === false, 'Incomplete path should be invalid');
});

// Test 7: Path Validation - Wrong Start
test('isValidPath - Wrong Start', () => {
    const grid = GridGenerator.generateLevel(1);
    const aco = new AntColony(grid, 1.0);

    const wrongPath = [...grid.solution];
    wrongPath[0] = grid.dots[1];
    const isValid = aco.isValidPath(wrongPath);
    assert(isValid === false, 'Path with wrong start should be invalid');
});

// Test 8: Multiple Grid Generation
test('Multiple Grid Generation', () => {
    for (let level = 1; level <= 10; level++) {
        const grid = GridGenerator.generateLevel(level);
        assert(grid.solution, `Level ${level} should have solution`);
        assert(grid.solution.length === grid.dots.length, `Level ${level} solution should be complete`);
    }
});

// Test 9: Greedy Fallback
test('Greedy Fallback Algorithm', () => {
    const grid = GridGenerator.generateLevel(1);
    const visited = new Set();
    const path = [];

    const backtrack = (current) => {
        visited.add(current.index);
        path.push(current);

        if (current.index === grid.endDot.index && visited.size === grid.dots.length) {
            return true;
        }

        if (current.index === grid.endDot.index) {
            visited.delete(current.index);
            path.pop();
            return false;
        }

        const unvisited = current.neighbors
            .filter(n => !visited.has(n.index))
            .sort((a, b) => {
                const distA = Math.abs(a.gridX - grid.endDot.gridX) +
                              Math.abs(a.gridY - grid.endDot.gridY);
                const distB = Math.abs(b.gridX - grid.endDot.gridX) +
                              Math.abs(b.gridY - grid.endDot.gridY);
                return distA - distB;
            });

        for (const neighbor of unvisited) {
            if (backtrack(neighbor)) {
                return true;
            }
        }

        visited.delete(current.index);
        path.pop();
        return false;
    };

    const found = backtrack(grid.startDot);
    assert(found, 'Greedy should find path');
    assert(path.length === 9, 'Greedy path should have 9 dots');
});

// Test 10: Stress Test
test('Stress Test - 20 Random Grids', () => {
    for (let i = 0; i < 20; i++) {
        const level = Math.floor(Math.random() * 10) + 1;
        const grid = GridGenerator.generateLevel(level);
        assert(grid.solution, `Random grid ${i + 1} should have solution`);
    }
});

// Summary
console.log('\n=====================================\n');
console.log(`📊 Results: ${passed} passed, ${failed} failed\n`);

if (failed === 0) {
    console.log('✅ All tests passed!\n');
    process.exit(0);
} else {
    console.log('❌ Some tests failed!\n');
    process.exit(1);
}
