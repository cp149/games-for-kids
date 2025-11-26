/**
 * BoardLogic Unit Tests
 * Tests pure game logic functions without DOM dependencies
 */

const test = require('node:test');
const assert = require('node:assert');
const BoardLogic = require('../js/board-logic.js');

// Test helper: create test grid
function createGrid(size, fill = null) {
    return Array(size).fill(null).map(() => Array(size).fill(fill));
}

// Test helper: set grid pattern
function setPattern(grid, pattern) {
    pattern.forEach(([row, col, type]) => {
        grid[row][col] = type;
    });
    return grid;
}

test('BoardLogic - findMatches', async (t) => {
    await t.test('finds horizontal match of 3', () => {
        const grid = createGrid(5);
        setPattern(grid, [
            [0, 0, 0], [0, 1, 0], [0, 2, 0] // Row 0: three 0s
        ]);

        const matches = BoardLogic.findMatches(grid, 5);
        assert.strictEqual(matches.length, 3);
        assert.ok(matches.some(m => m.row === 0 && m.col === 0));
        assert.ok(matches.some(m => m.row === 0 && m.col === 1));
        assert.ok(matches.some(m => m.row === 0 && m.col === 2));
    });

    await t.test('finds vertical match of 3', () => {
        const grid = createGrid(5);
        setPattern(grid, [
            [0, 0, 1], [1, 0, 1], [2, 0, 1] // Col 0: three 1s
        ]);

        const matches = BoardLogic.findMatches(grid, 5);
        assert.strictEqual(matches.length, 3);
        assert.ok(matches.some(m => m.row === 0 && m.col === 0));
        assert.ok(matches.some(m => m.row === 1 && m.col === 0));
        assert.ok(matches.some(m => m.row === 2 && m.col === 0));
    });

    await t.test('finds match of 4', () => {
        const grid = createGrid(5);
        setPattern(grid, [
            [0, 0, 2], [0, 1, 2], [0, 2, 2], [0, 3, 2] // Four 2s
        ]);

        const matches = BoardLogic.findMatches(grid, 5);
        assert.strictEqual(matches.length, 4);
    });

    await t.test('finds match of 5', () => {
        const grid = createGrid(6);
        setPattern(grid, [
            [0, 0, 3], [0, 1, 3], [0, 2, 3], [0, 3, 3], [0, 4, 3] // Five 3s
        ]);

        const matches = BoardLogic.findMatches(grid, 6);
        assert.strictEqual(matches.length, 5);
    });

    await t.test('finds multiple separate matches', () => {
        const grid = createGrid(8);
        setPattern(grid, [
            // Horizontal match
            [0, 0, 1], [0, 1, 1], [0, 2, 1],
            // Vertical match
            [2, 5, 2], [3, 5, 2], [4, 5, 2]
        ]);

        const matches = BoardLogic.findMatches(grid, 8);
        assert.strictEqual(matches.length, 6);
    });

    await t.test('finds L-shaped match (counts both directions)', () => {
        const grid = createGrid(5);
        setPattern(grid, [
            // Horizontal: [1,0], [1,1], [1,2]
            [1, 0, 4], [1, 1, 4], [1, 2, 4],
            // Vertical: [1,2], [2,2], [3,2]
            [2, 2, 4], [3, 2, 4]
        ]);

        const matches = BoardLogic.findMatches(grid, 5);
        assert.ok(matches.length >= 5); // Should count all 5 positions
    });

    await t.test('ignores null cells', () => {
        const grid = createGrid(5);
        setPattern(grid, [
            [0, 0, 1], [0, 1, 1], [0, 2, null] // Broken match
        ]);

        const matches = BoardLogic.findMatches(grid, 5);
        assert.strictEqual(matches.length, 0);
    });

    await t.test('returns empty array when no matches', () => {
        const grid = createGrid(5);
        setPattern(grid, [
            [0, 0, 1], [0, 1, 2], [0, 2, 3],
            [1, 0, 4], [1, 1, 5], [1, 2, 0]
        ]);

        const matches = BoardLogic.findMatches(grid, 5);
        assert.strictEqual(matches.length, 0);
    });
});

test('BoardLogic - findMatchesLocal', async (t) => {
    await t.test('finds match around single position', () => {
        const grid = createGrid(5);
        setPattern(grid, [
            [0, 0, 1], [0, 1, 1], [0, 2, 1]
        ]);

        const matches = BoardLogic.findMatches(grid, 5, [{ row: 0, col: 1 }]);
        assert.strictEqual(matches.length, 3);
    });

    await t.test('finds matches around multiple positions', () => {
        const grid = createGrid(8);
        setPattern(grid, [
            // Match 1
            [0, 0, 1], [0, 1, 1], [0, 2, 1],
            // Match 2
            [5, 0, 2], [5, 1, 2], [5, 2, 2]
        ]);

        const matches = BoardLogic.findMatches(grid, 8, [
            { row: 0, col: 1 },
            { row: 5, col: 1 }
        ]);
        assert.strictEqual(matches.length, 6);
    });

    await t.test('returns empty for position without match', () => {
        const grid = createGrid(5);
        setPattern(grid, [
            [0, 0, 1], [0, 1, 2], [0, 2, 3]
        ]);

        const matches = BoardLogic.findMatches(grid, 5, [{ row: 0, col: 1 }]);
        assert.strictEqual(matches.length, 0);
    });
});

test('BoardLogic - wouldCreateMatch', async (t) => {
    await t.test('detects valid horizontal swap', () => {
        const grid = createGrid(5);
        setPattern(grid, [
            [0, 0, 1], [0, 1, 2], [0, 2, 1], [0, 3, 1]
        ]);

        // Swapping [0,1] and [0,2] creates match
        const would = BoardLogic.wouldCreateMatch(grid, 5, 0, 1, 0, 2);
        assert.strictEqual(would, true);
    });

    await t.test('detects valid vertical swap', () => {
        const grid = createGrid(5);
        setPattern(grid, [
            [0, 0, 3], [1, 0, 4], [2, 0, 3], [3, 0, 3]
        ]);

        // Swapping [1,0] and [2,0] creates match
        const would = BoardLogic.wouldCreateMatch(grid, 5, 1, 0, 2, 0);
        assert.strictEqual(would, true);
    });

    await t.test('rejects invalid swap', () => {
        const grid = createGrid(5);
        setPattern(grid, [
            [0, 0, 1], [0, 1, 2], [0, 2, 3], [0, 3, 4]
        ]);

        const would = BoardLogic.wouldCreateMatch(grid, 5, 0, 1, 0, 2);
        assert.strictEqual(would, false);
    });

    await t.test('handles null cells', () => {
        const grid = createGrid(5);
        setPattern(grid, [
            [0, 0, 1], [0, 1, null], [0, 2, 1]
        ]);

        const would = BoardLogic.wouldCreateMatch(grid, 5, 0, 0, 0, 1);
        assert.strictEqual(would, false);
    });
});

test('BoardLogic - applyGravity', async (t) => {
    await t.test('moves single gem down', () => {
        const grid = [
            [1, null, null, null, null],
            [null, null, null, null, null],
            [null, null, null, null, null],
            [null, null, null, null, null],
            [null, null, null, null, null]
        ];

        const result = BoardLogic.applyGravity(grid, 5);
        assert.strictEqual(result.grid[4][0], 1);  // Moved to bottom
        assert.strictEqual(result.grid[0][0], null);
        assert.strictEqual(result.moves.length, 1);
        assert.deepStrictEqual(result.moves[0], {
            from: { row: 0, col: 0 },
            to: { row: 4, col: 0 }
        });
    });

    await t.test('moves multiple gems in column', () => {
        const grid = [
            [1, null, null, null, null],
            [2, null, null, null, null],
            [null, null, null, null, null],
            [null, null, null, null, null],
            [null, null, null, null, null]
        ];

        const result = BoardLogic.applyGravity(grid, 5);
        // Gravity fills from bottom: 2 goes to row 4, 1 goes to row 3
        assert.strictEqual(result.grid[3][0], 1);  // 1 moves down
        assert.strictEqual(result.grid[4][0], 2);  // 2 moves to bottom
        assert.strictEqual(result.grid[0][0], null);
        assert.strictEqual(result.grid[1][0], null);
        assert.strictEqual(result.moves.length, 2);
    });

    await t.test('handles multiple columns', () => {
        const grid = [
            [1, 2, null],
            [null, null, null],
            [null, null, null]
        ];

        const result = BoardLogic.applyGravity(grid, 3);
        assert.strictEqual(result.grid[2][0], 1);  // 1 falls to bottom
        assert.strictEqual(result.grid[2][1], 2);  // 2 falls to bottom
        assert.strictEqual(result.moves.length, 2);
    });

    await t.test('returns empty moves when no gravity needed', () => {
        const grid = createGrid(3);
        setPattern(grid, [
            [0, 0, 1], [1, 0, 2], [2, 0, 3]
        ]);

        const result = BoardLogic.applyGravity(grid, 3);
        assert.strictEqual(result.moves.length, 0);
    });
});

test('BoardLogic - removeMatches', async (t) => {
    await t.test('removes matched gems', () => {
        const grid = createGrid(5);
        setPattern(grid, [
            [0, 0, 1], [0, 1, 1], [0, 2, 1], [0, 3, 2]
        ]);

        const matches = [
            { row: 0, col: 0 },
            { row: 0, col: 1 },
            { row: 0, col: 2 }
        ];

        const newGrid = BoardLogic.removeMatches(grid, matches);
        assert.strictEqual(newGrid[0][0], null);
        assert.strictEqual(newGrid[0][1], null);
        assert.strictEqual(newGrid[0][2], null);
        assert.strictEqual(newGrid[0][3], 2); // Untouched
    });

    await t.test('returns new grid (immutable)', () => {
        const grid = createGrid(3);
        setPattern(grid, [[0, 0, 1]]);

        const newGrid = BoardLogic.removeMatches(grid, [{ row: 0, col: 0 }]);
        assert.strictEqual(grid[0][0], 1); // Original unchanged
        assert.strictEqual(newGrid[0][0], null); // New grid modified
    });
});

test('BoardLogic - hasAvailableMoves', async (t) => {
    await t.test('finds horizontal swap opportunity', () => {
        const grid = createGrid(5);
        setPattern(grid, [
            [0, 0, 1], [0, 1, 2], [0, 2, 1], [0, 3, 1]
        ]);

        const has = BoardLogic.hasAvailableMoves(grid, 5);
        assert.strictEqual(has, true);
    });

    await t.test('finds vertical swap opportunity', () => {
        const grid = createGrid(5);
        setPattern(grid, [
            [0, 0, 3], [1, 0, 4], [2, 0, 3], [3, 0, 3]
        ]);

        const has = BoardLogic.hasAvailableMoves(grid, 5);
        assert.strictEqual(has, true);
    });

    await t.test('returns false when no moves available', () => {
        const grid = createGrid(3);
        setPattern(grid, [
            [0, 0, 1], [0, 1, 2], [0, 2, 3],
            [1, 0, 4], [1, 1, 5], [1, 2, 0],
            [2, 0, 2], [2, 1, 3], [2, 2, 1]
        ]);

        const has = BoardLogic.hasAvailableMoves(grid, 3);
        assert.strictEqual(has, false);
    });
});

test('BoardLogic - getRandomGemType', async (t) => {
    await t.test('avoids horizontal match', () => {
        const grid = createGrid(5);
        setPattern(grid, [
            [0, 0, 1], [0, 1, 1]
        ]);

        const type = BoardLogic.getRandomGemType(grid, 0, 2, 6);
        assert.notStrictEqual(type, 1); // Should not return 1
    });

    await t.test('avoids vertical match', () => {
        const grid = createGrid(5);
        setPattern(grid, [
            [0, 0, 2], [1, 0, 2]
        ]);

        const type = BoardLogic.getRandomGemType(grid, 2, 0, 6);
        assert.notStrictEqual(type, 2);
    });

    await t.test('returns valid type (0-5)', () => {
        const grid = createGrid(5);
        const type = BoardLogic.getRandomGemType(grid, 0, 0, 6);
        assert.ok(type >= 0 && type < 6);
    });

    await t.test('handles edge case at (0,0)', () => {
        const grid = createGrid(5);
        const type = BoardLogic.getRandomGemType(grid, 0, 0, 6);
        assert.ok(type >= 0 && type < 6);
    });
});

test('BoardLogic - generateBoard', async (t) => {
    await t.test('creates full grid', () => {
        const grid = BoardLogic.generateBoard(8, 6);
        assert.strictEqual(grid.length, 8);
        assert.strictEqual(grid[0].length, 8);

        // All cells filled
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                assert.ok(grid[row][col] !== null);
                assert.ok(grid[row][col] >= 0 && grid[row][col] < 6);
            }
        }
    });

    await t.test('has no initial matches', () => {
        const grid = BoardLogic.generateBoard(8, 6);
        const matches = BoardLogic.findMatches(grid, 8);
        assert.strictEqual(matches.length, 0);
    });

    await t.test('works with custom random function', () => {
        let callCount = 0;
        const fakeRandom = () => {
            callCount++;
            return 0.5; // Always return middle value
        };

        const grid = BoardLogic.generateBoard(3, 6, fakeRandom);
        assert.ok(callCount > 0); // Random function was called
        assert.strictEqual(grid.length, 3);
    });
});

test('BoardLogic - isValidGrid', async (t) => {
    await t.test('validates correct grid', () => {
        const grid = createGrid(5);
        assert.strictEqual(BoardLogic.isValidGrid(grid, 5), true);
    });

    await t.test('rejects wrong size', () => {
        const grid = createGrid(3);
        assert.strictEqual(BoardLogic.isValidGrid(grid, 5), false);
    });

    await t.test('rejects non-array', () => {
        assert.strictEqual(BoardLogic.isValidGrid(null, 5), false);
        assert.strictEqual(BoardLogic.isValidGrid({}, 5), false);
    });

    await t.test('rejects irregular grid', () => {
        const grid = [[1, 2], [3]]; // Second row too short
        assert.strictEqual(BoardLogic.isValidGrid(grid, 2), false);
    });
});

console.log('All BoardLogic tests completed!');
