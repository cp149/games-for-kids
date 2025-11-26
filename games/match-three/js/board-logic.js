/**
 * Board Logic - Pure functions for match-three game logic
 * 100% testable without DOM dependencies
 *
 * Grid representation: 2D array where grid[row][col] = gemType (number) or null
 */

const BoardLogic = {
    /**
     * Find all matches in a grid
     * @param {Array<Array<number|null>>} grid - 2D array of gem types
     * @param {number} size - Grid size
     * @param {Array<{row: number, col: number}>} [positions] - Optional: only check around these positions
     * @returns {Array<{row: number, col: number}>} Positions of matched gems
     */
    findMatches(grid, size, positions = null) {
        if (positions && positions.length > 0) {
            return this.findMatchesLocal(grid, size, positions);
        }
        return this.findMatchesFull(grid, size);
    },

    /**
     * Full board scan for matches
     * @param {Array<Array<number|null>>} grid
     * @param {number} size
     * @returns {Array<{row: number, col: number}>}
     */
    findMatchesFull(grid, size) {
        const matches = new Set();
        const key = (r, c) => `${r},${c}`;

        // Check horizontal matches
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size - 2; col++) {
                const type1 = grid[row][col];
                const type2 = grid[row][col + 1];
                const type3 = grid[row][col + 2];

                if (type1 !== null && type1 === type2 && type2 === type3) {
                    matches.add(key(row, col));
                    matches.add(key(row, col + 1));
                    matches.add(key(row, col + 2));

                    // Check for longer matches
                    let checkCol = col + 3;
                    while (checkCol < size && grid[row][checkCol] === type1) {
                        matches.add(key(row, checkCol));
                        checkCol++;
                    }
                }
            }
        }

        // Check vertical matches
        for (let col = 0; col < size; col++) {
            for (let row = 0; row < size - 2; row++) {
                const type1 = grid[row][col];
                const type2 = grid[row + 1][col];
                const type3 = grid[row + 2][col];

                if (type1 !== null && type1 === type2 && type2 === type3) {
                    matches.add(key(row, col));
                    matches.add(key(row + 1, col));
                    matches.add(key(row + 2, col));

                    // Check for longer matches
                    let checkRow = row + 3;
                    while (checkRow < size && grid[checkRow][col] === type1) {
                        matches.add(key(checkRow, col));
                        checkRow++;
                    }
                }
            }
        }

        // Convert back to positions
        return Array.from(matches).map(k => {
            const [r, c] = k.split(',').map(Number);
            return { row: r, col: c };
        });
    },

    /**
     * Local match detection around specific positions
     * @param {Array<Array<number|null>>} grid
     * @param {number} size
     * @param {Array<{row: number, col: number}>} positions
     * @returns {Array<{row: number, col: number}>}
     */
    findMatchesLocal(grid, size, positions) {
        const matches = new Set();
        const key = (r, c) => `${r},${c}`;

        for (const pos of positions) {
            const { row, col } = pos;
            const type = grid[row]?.[col];
            if (type === null || type === undefined) continue;

            // Check horizontal line through this position
            this.findLineMatches(grid, size, row, col, 0, 1, type, matches, key);
            // Check vertical line through this position
            this.findLineMatches(grid, size, row, col, 1, 0, type, matches, key);
        }

        return Array.from(matches).map(k => {
            const [r, c] = k.split(',').map(Number);
            return { row: r, col: c };
        });
    },

    /**
     * Find matches along a line
     * @private
     */
    findLineMatches(grid, size, row, col, dRow, dCol, type, matches, key) {
        const linePositions = [{ row, col }];

        // Search in negative direction
        let r = row - dRow;
        let c = col - dCol;
        while (r >= 0 && r < size && c >= 0 && c < size && grid[r][c] === type) {
            linePositions.unshift({ row: r, col: c });
            r -= dRow;
            c -= dCol;
        }

        // Search in positive direction
        r = row + dRow;
        c = col + dCol;
        while (r >= 0 && r < size && c >= 0 && c < size && grid[r][c] === type) {
            linePositions.push({ row: r, col: c });
            r += dRow;
            c += dCol;
        }

        // Add to matches if 3 or more
        if (linePositions.length >= 3) {
            linePositions.forEach(p => matches.add(key(p.row, p.col)));
        }
    },

    /**
     * Check if swapping two positions would create a match (pure function)
     * @param {Array<Array<number|null>>} grid
     * @param {number} size
     * @param {number} row1
     * @param {number} col1
     * @param {number} row2
     * @param {number} col2
     * @returns {boolean}
     */
    wouldCreateMatch(grid, size, row1, col1, row2, col2) {
        const type1 = grid[row1]?.[col1];
        const type2 = grid[row2]?.[col2];
        if (type1 === null || type1 === undefined ||
            type2 === null || type2 === undefined) {
            return false;
        }

        // Check if type1 at position2 would create a match
        if (this.wouldMatchAt(grid, size, row2, col2, type1, row1, col1)) {
            return true;
        }

        // Check if type2 at position1 would create a match
        if (this.wouldMatchAt(grid, size, row1, col1, type2, row2, col2)) {
            return true;
        }

        return false;
    },

    /**
     * Check if placing a gem type at a position would create a match
     * @private
     */
    wouldMatchAt(grid, size, row, col, type, excludeRow, excludeCol) {
        const getType = (r, c) => {
            if (r === excludeRow && c === excludeCol) return type;
            if (r === row && c === col) return -1;
            return grid[r]?.[c] ?? -1;
        };

        // Check horizontal
        let hCount = 1;
        for (let c = col - 1; c >= 0 && getType(row, c) === type; c--) hCount++;
        for (let c = col + 1; c < size && getType(row, c) === type; c++) hCount++;
        if (hCount >= 3) return true;

        // Check vertical
        let vCount = 1;
        for (let r = row - 1; r >= 0 && getType(r, col) === type; r--) vCount++;
        for (let r = row + 1; r < size && getType(r, col) === type; r++) vCount++;
        if (vCount >= 3) return true;

        return false;
    },

    /**
     * Check if any moves are available on the board
     * @param {Array<Array<number|null>>} grid
     * @param {number} size
     * @returns {boolean}
     */
    hasAvailableMoves(grid, size) {
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                if (grid[row][col] === null) continue;

                // Check right swap
                if (col < size - 1 && this.wouldCreateMatch(grid, size, row, col, row, col + 1)) {
                    return true;
                }

                // Check down swap
                if (row < size - 1 && this.wouldCreateMatch(grid, size, row, col, row + 1, col)) {
                    return true;
                }
            }
        }
        return false;
    },

    /**
     * Apply gravity to a grid - returns new grid state
     * @param {Array<Array<number|null>>} grid
     * @param {number} size
     * @returns {{grid: Array<Array<number|null>>, moves: Array<{from: {row, col}, to: {row, col}}>}}
     */
    applyGravity(grid, size) {
        // Deep copy grid
        const newGrid = grid.map(row => [...row]);
        const moves = [];

        for (let col = 0; col < size; col++) {
            for (let row = size - 1; row >= 0; row--) {
                if (newGrid[row][col] === null) {
                    // Find gem above
                    for (let checkRow = row - 1; checkRow >= 0; checkRow--) {
                        if (newGrid[checkRow][col] !== null) {
                            newGrid[row][col] = newGrid[checkRow][col];
                            newGrid[checkRow][col] = null;
                            moves.push({
                                from: { row: checkRow, col },
                                to: { row, col }
                            });
                            break;
                        }
                    }
                }
            }
        }

        return { grid: newGrid, moves };
    },

    /**
     * Remove matched gems from grid - returns new grid state
     * @param {Array<Array<number|null>>} grid
     * @param {Array<{row: number, col: number}>} matches
     * @returns {Array<Array<number|null>>}
     */
    removeMatches(grid, matches) {
        const newGrid = grid.map(row => [...row]);
        for (const { row, col } of matches) {
            newGrid[row][col] = null;
        }
        return newGrid;
    },

    /**
     * Get random gem type that won't create initial match
     * @param {Array<Array<number|null>>} grid
     * @param {number} row
     * @param {number} col
     * @param {number} numTypes - Number of gem types available
     * @returns {number}
     */
    getRandomGemType(grid, row, col, numTypes) {
        const forbidden = new Set();

        // Check horizontal
        if (col >= 2) {
            const left1 = grid[row][col - 1];
            const left2 = grid[row][col - 2];
            if (left1 !== null && left1 === left2) {
                forbidden.add(left1);
            }
        }

        // Check vertical
        if (row >= 2) {
            const up1 = grid[row - 1]?.[col];
            const up2 = grid[row - 2]?.[col];
            if (up1 !== null && up1 === up2) {
                forbidden.add(up1);
            }
        }

        // Get available types
        const available = [];
        for (let type = 0; type < numTypes; type++) {
            if (!forbidden.has(type)) {
                available.push(type);
            }
        }

        return available[Math.floor(Math.random() * available.length)];
    },

    /**
     * Generate a new board with no initial matches
     * @param {number} size
     * @param {number} numTypes
     * @param {function} [randomFn] - Optional random function for testing
     * @returns {Array<Array<number>>}
     */
    generateBoard(size, numTypes, randomFn = Math.random) {
        const grid = [];
        for (let row = 0; row < size; row++) {
            grid[row] = [];
            for (let col = 0; col < size; col++) {
                grid[row][col] = this.getRandomGemTypeWithRandom(
                    grid, row, col, numTypes, randomFn
                );
            }
        }
        return grid;
    },

    /**
     * Get random gem type with custom random function (for testing)
     * @private
     */
    getRandomGemTypeWithRandom(grid, row, col, numTypes, randomFn) {
        const forbidden = new Set();

        if (col >= 2) {
            const left1 = grid[row][col - 1];
            const left2 = grid[row][col - 2];
            if (left1 !== null && left1 === left2) {
                forbidden.add(left1);
            }
        }

        if (row >= 2) {
            const up1 = grid[row - 1]?.[col];
            const up2 = grid[row - 2]?.[col];
            if (up1 !== null && up1 === up2) {
                forbidden.add(up1);
            }
        }

        const available = [];
        for (let type = 0; type < numTypes; type++) {
            if (!forbidden.has(type)) {
                available.push(type);
            }
        }

        return available[Math.floor(randomFn() * available.length)];
    },

    /**
     * Convert grid to snapshot format for testing/serialization
     * @param {Array<Array<Gem|null>>} gemGrid - Grid of Gem objects
     * @returns {Array<Array<number|null>>}
     */
    gridToSnapshot(gemGrid) {
        return gemGrid.map(row =>
            row.map(gem => gem?.type ?? null)
        );
    },

    /**
     * Validate grid dimensions
     * @param {Array<Array<any>>} grid
     * @param {number} expectedSize
     * @returns {boolean}
     */
    isValidGrid(grid, expectedSize) {
        if (!Array.isArray(grid) || grid.length !== expectedSize) {
            return false;
        }
        return grid.every(row =>
            Array.isArray(row) && row.length === expectedSize
        );
    }
};

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BoardLogic;
}
