/**
 * GridGenerator - Level Grid Generation
 * Generates solvable grid puzzles with Hamiltonian path validation
 */

const GridGenerator = {
    /**
     * Generate a grid for a specific level
     * @param {number} level - Level number
     * @returns {Object} Grid data with dots and solution
     */
    generateLevel(level) {
        const Logger = window.Logger;
        Logger.info(`GridGenerator: Generating level ${level}`);

        // Determine grid size from config
        const size = CONFIG.GRID.SIZE_BY_LEVEL[level] || CONFIG.GRID.SIZE_BY_LEVEL.DEFAULT;

        // Generate grid with guaranteed Hamiltonian path
        let grid;
        let attempts = 0;
        const maxAttempts = 500;

        do {
            grid = this.generateGrid(size, size);
            attempts++;

            if (this.validateHamiltonianPath(grid)) {
                Logger.info(`GridGenerator: Level ${level} generated in ${attempts} attempts (${size}x${size})`);
                return grid;
            }

            if (attempts >= maxAttempts) {
                Logger.warn(`GridGenerator: Max attempts reached for level ${level}, using deterministic fallback`);
                // Use deterministic start/end positions that are known to work
                grid = this.generateDeterministicGrid(size);
                if (this.validateHamiltonianPath(grid)) {
                    Logger.info(`GridGenerator: Fallback grid validated for level ${level}`);
                    return grid;
                }
                Logger.error(`GridGenerator: Even fallback failed for level ${level}!`);
                return grid; // Last resort
            }
        } while (true);
    },

    /**
     * Generate a deterministic grid with known solvable start/end
     */
    generateDeterministicGrid(size) {
        const grid = this.generateGrid(size, size);

        // Reset all types
        grid.dots.forEach(dot => dot.type = CONFIG.DOT_TYPES.NORMAL);

        // Select start/end based on grid size and bipartite graph theory
        let startDot, endDot;

        if (size % 2 === 0) {
            // Even grid: Can use different parities
            // Total dots = even. Use opposite corners with different parities
            startDot = grid.dots[0]; // (0,0) - parity even
            endDot = grid.dots[(size - 1) * size + (size - 2)]; // (size-2, size-1) - parity odd
        } else {
            // Odd grid: MUST use same parity (both even)
            // For n×n odd grid: (n²+1)/2 even positions, (n²-1)/2 odd positions
            // Hamiltonian path must start and end in majority partition (even)
            startDot = grid.dots[0]; // (0,0) - parity even
            endDot = grid.dots[grid.dots.length - 1]; // (size-1, size-1) - parity even
        }

        startDot.type = CONFIG.DOT_TYPES.START;
        endDot.type = CONFIG.DOT_TYPES.END;

        grid.startDot = startDot;
        grid.endDot = endDot;

        return grid;
    },

    /**
     * Generate a basic grid structure
     * @param {number} width - Grid width
     * @param {number} height - Grid height
     * @returns {Object} Grid data structure
     */
    generateGrid(width, height) {
        const dots = [];
        const size = width; // Assume square grid

        // Create dots in grid positions
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                dots.push({
                    x: x,
                    y: y,
                    gridX: x,
                    gridY: y,
                    type: CONFIG.DOT_TYPES.NORMAL,
                    visited: false,
                    index: y * size + x
                });
            }
        }

        // Randomly select start and end positions
        // They must have different "colors" (sum of coordinates parity)
        // and should be reasonably far apart

        // Group dots by "color" (checkerboard pattern)
        const evenDots = []; // x+y is even
        const oddDots = [];  // x+y is odd

        dots.forEach(dot => {
            if ((dot.gridX + dot.gridY) % 2 === 0) {
                evenDots.push(dot);
            } else {
                oddDots.push(dot);
            }
        });

        // Select start/end based on grid size parity (bipartite graph theory)
        let startDot, endDot;

        if (size % 2 === 0) {
            // Even grid: Use different parities (bipartite with equal partitions)
            startDot = evenDots[Math.floor(Math.random() * evenDots.length)];
            startDot.type = CONFIG.DOT_TYPES.START;

            // Pick end from opposite color, preferably far from start
            const candidates = oddDots.filter(dot => {
                const dist = Math.abs(dot.gridX - startDot.gridX) + Math.abs(dot.gridY - startDot.gridY);
                return dist >= size;
            });

            if (candidates.length > 0) {
                endDot = candidates[Math.floor(Math.random() * candidates.length)];
            } else {
                endDot = oddDots[Math.floor(Math.random() * oddDots.length)];
            }
        } else {
            // Odd grid: Use SAME parity (bipartite with unequal partitions)
            // For n×n odd: (n²+1)/2 even, (n²-1)/2 odd → must start and end on even
            startDot = evenDots[Math.floor(Math.random() * evenDots.length)];
            startDot.type = CONFIG.DOT_TYPES.START;

            // Pick end from SAME parity (even), preferably far from start
            const candidates = evenDots.filter(dot => {
                if (dot.index === startDot.index) return false;
                const dist = Math.abs(dot.gridX - startDot.gridX) + Math.abs(dot.gridY - startDot.gridY);
                return dist >= size;
            });

            if (candidates.length > 0) {
                endDot = candidates[Math.floor(Math.random() * candidates.length)];
            } else {
                // Fallback: any even dot except start
                const availableEven = evenDots.filter(d => d.index !== startDot.index);
                endDot = availableEven[Math.floor(Math.random() * availableEven.length)];
            }
        }
        endDot.type = CONFIG.DOT_TYPES.END;

        // Build adjacency relationships (only orthogonal neighbors)
        const edges = [];
        dots.forEach(dot => {
            dot.neighbors = this.getOrthogonalNeighbors(dot, dots, size);

            // Create edges for visualization
            dot.neighbors.forEach(neighbor => {
                const edgeKey = this.getEdgeKey(dot, neighbor);
                if (!edges.find(e => e.key === edgeKey)) {
                    edges.push({
                        key: edgeKey,
                        from: dot,
                        to: neighbor,
                        pheromone: CONFIG.ACO.INITIAL_PHEROMONE
                    });
                }
            });
        });

        return {
            size: size,
            dots: dots,
            edges: edges,
            startDot: startDot,
            endDot: endDot,
            solution: null
        };
    },

    /**
     * Get orthogonal neighbors (up, down, left, right)
     */
    getOrthogonalNeighbors(dot, allDots, size) {
        const neighbors = [];
        const { gridX, gridY } = dot;

        const directions = [
            { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
            { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
        ];

        directions.forEach(({ dx, dy }) => {
            const newX = gridX + dx;
            const newY = gridY + dy;

            if (newX >= 0 && newX < size && newY >= 0 && newY < size) {
                neighbors.push(allDots[newY * size + newX]);
            }
        });

        return neighbors;
    },

    /**
     * Generate unique edge key
     */
    getEdgeKey(dot1, dot2) {
        const a = Math.min(dot1.index, dot2.index);
        const b = Math.max(dot1.index, dot2.index);
        return `${a}-${b}`;
    },

    /**
     * Validate that a Hamiltonian path exists
     */
    validateHamiltonianPath(grid) {
        const { startDot, endDot, dots } = grid;
        const visited = new Set();
        const path = [];

        const found = this.findHamiltonianPath(startDot, endDot, visited, path, dots.length);

        if (found) {
            grid.solution = [...path];
            return true;
        }
        return false;
    },

    /**
     * Backtracking algorithm to find Hamiltonian path
     */
    findHamiltonianPath(current, end, visited, path, totalDots) {
        visited.add(current.index);
        path.push(current);

        if (current.index === end.index && visited.size === totalDots) {
            return true;
        }

        if (current.index === end.index && visited.size < totalDots) {
            visited.delete(current.index);
            path.pop();
            return false;
        }

        for (const neighbor of current.neighbors) {
            if (!visited.has(neighbor.index)) {
                if (this.findHamiltonianPath(neighbor, end, visited, path, totalDots)) {
                    return true;
                }
            }
        }

        visited.delete(current.index);
        path.pop();
        return false;
    },

    /**
     * Find all valid Hamiltonian paths (for difficulty rating)
     */
    findAllPaths(grid, maxPaths = 10) {
        const { startDot, endDot, dots } = grid;
        const allPaths = [];
        const visited = new Set();
        const path = [];

        this.findAllPathsRecursive(startDot, endDot, visited, path, dots.length, allPaths, maxPaths);
        return allPaths;
    },

    findAllPathsRecursive(current, end, visited, path, totalDots, allPaths, maxPaths) {
        if (allPaths.length >= maxPaths) return;

        visited.add(current.index);
        path.push(current);

        if (current.index === end.index && visited.size === totalDots) {
            allPaths.push([...path]);
            visited.delete(current.index);
            path.pop();
            return;
        }

        if (current.index === end.index && visited.size < totalDots) {
            visited.delete(current.index);
            path.pop();
            return;
        }

        for (const neighbor of current.neighbors) {
            if (!visited.has(neighbor.index)) {
                this.findAllPathsRecursive(neighbor, end, visited, path, totalDots, allPaths, maxPaths);
            }
        }

        visited.delete(current.index);
        path.pop();
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GridGenerator;
}
