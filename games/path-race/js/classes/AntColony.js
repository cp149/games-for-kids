/**
 * AntColony - Ant Colony Optimization Algorithm
 * Implements ACO for AI pathfinding with visualization
 */

class AntColony {
    constructor(grid, difficulty = 1.0) {
        this.logger = window.Logger;
        this.grid = grid;
        this.difficulty = difficulty; // Speed multiplier

        // ACO parameters from config
        this.alpha = CONFIG.ACO.ALPHA;
        this.beta = CONFIG.ACO.BETA;
        this.rho = CONFIG.ACO.RHO;
        this.Q = CONFIG.ACO.Q;

        // Scale ant count with grid size for better coverage
        const gridSize = grid.size || Math.sqrt(grid.dots.length);
        this.numAnts = Math.max(CONFIG.ACO.NUM_ANTS, Math.floor(gridSize * 2));

        // State
        this.pheromones = new Map();
        this.bestPath = null;
        this.bestPathLength = Infinity;
        this.iteration = 0;
        this.isRunning = false;

        this.initializePheromones();
    }

    /**
     * Initialize pheromone levels on all edges
     */
    initializePheromones() {
        this.grid.edges.forEach(edge => {
            const key = this.getEdgeKey(edge.from, edge.to);
            this.pheromones.set(key, CONFIG.ACO.INITIAL_PHEROMONE);
        });
    }

    /**
     * Get edge key for pheromone map
     */
    getEdgeKey(dot1, dot2) {
        const a = Math.min(dot1.index, dot2.index);
        const b = Math.max(dot1.index, dot2.index);
        return `${a}-${b}`;
    }

    /**
     * Get pheromone level for an edge
     */
    getPheromone(dot1, dot2) {
        const key = this.getEdgeKey(dot1, dot2);
        return this.pheromones.get(key) || CONFIG.ACO.INITIAL_PHEROMONE;
    }

    /**
     * Set pheromone level for an edge
     */
    setPheromone(dot1, dot2, value) {
        const key = this.getEdgeKey(dot1, dot2);
        this.pheromones.set(key, value);
    }

    /**
     * Run one iteration of ACO
     * @returns {Object|null} Best path found this iteration
     */
    async runIteration() {
        this.iteration++;
        const paths = [];
        let validCount = 0;
        let invalidCount = 0;

        // Each ant constructs a path
        for (let i = 0; i < this.numAnts; i++) {
            const path = this.constructPath();
            if (path) {
                if (this.isValidPath(path)) {
                    paths.push(path);
                    validCount++;

                    // Update best path
                    if (path.length === this.grid.dots.length && path.length < this.bestPathLength) {
                        this.bestPath = path;
                        this.bestPathLength = path.length;
                        this.logger.info(`AntColony: New best path found, length: ${path.length}`);
                    }
                } else {
                    invalidCount++;
                }
            } else {
                invalidCount++;
            }
        }

        this.logger.info(`AntColony: Iteration ${this.iteration} - valid: ${validCount}/${this.numAnts}, invalid: ${invalidCount}`);

        // Update pheromones
        this.evaporatePheromones();
        this.depositPheromones(paths);

        return this.bestPath;
    }

    /**
     * Construct a path for one ant
     * @returns {Array|null} Path as array of dots, or null if failed
     */
    constructPath() {
        const path = [];
        const visited = new Set();
        let current = this.grid.startDot;

        path.push(current);
        visited.add(current.index);

        // Build path until we reach end or get stuck
        while (current.index !== this.grid.endDot.index && path.length < this.grid.dots.length + 1) {
            const next = this.selectNextDot(current, visited);

            if (!next) {
                // Got stuck
                return null;
            }

            path.push(next);
            visited.add(next.index);
            current = next;
        }

        return path;
    }

    /**
     * Select next dot using ACO probability
     * @param {Object} current - Current dot
     * @param {Set} visited - Set of visited dot indices
     * @returns {Object|null} Next dot or null if no options
     */
    selectNextDot(current, visited) {
        // Get unvisited neighbors
        const unvisited = current.neighbors.filter(n => !visited.has(n.index));

        if (unvisited.length === 0) {
            return null;
        }

        // Calculate probabilities for each unvisited neighbor
        const probabilities = [];
        let totalProb = 0;

        unvisited.forEach(neighbor => {
            const pheromone = this.getPheromone(current, neighbor);
            const heuristic = this.calculateHeuristic(neighbor, visited);

            // ACO formula: prob ∝ (pheromone^alpha) * (heuristic^beta)
            const prob = Math.pow(pheromone, this.alpha) * Math.pow(heuristic, this.beta);

            probabilities.push({ dot: neighbor, prob });
            totalProb += prob;
        });

        // Normalize probabilities
        probabilities.forEach(p => p.prob /= totalProb);

        // Roulette wheel selection
        const rand = Math.random();
        let cumulative = 0;

        for (const p of probabilities) {
            cumulative += p.prob;
            if (rand <= cumulative) {
                return p.dot;
            }
        }

        // Fallback (shouldn't reach here)
        return probabilities[probabilities.length - 1].dot;
    }

    /**
     * Calculate heuristic value for a dot
     * Enhanced multi-factor heuristic for Hamiltonian path
     * @param {Object} dot - Candidate dot
     * @param {Set} visited - Visited dots
     * @returns {number} Heuristic value (higher is better)
     */
    calculateHeuristic(dot, visited) {
        const totalDots = this.grid.dots.length;
        const remainingDots = totalDots - visited.size;

        // Factor 1: Progress toward goal (distance to end)
        const distToEnd = Math.abs(dot.gridX - this.grid.endDot.gridX) +
                          Math.abs(dot.gridY - this.grid.endDot.gridY);
        const h1 = 1.0 / (1.0 + distToEnd);

        // Factor 2: Dead-end avoidance (unvisited neighbor count)
        const unvisitedNeighbors = dot.neighbors.filter(n => !visited.has(n.index));
        const neighborCount = unvisitedNeighbors.length;

        // Heavily penalize dead ends (0 unvisited neighbors) unless at end
        let h2;
        if (dot.index === this.grid.endDot.index) {
            h2 = remainingDots === 1 ? 1.0 : 0.0; // Only good if all visited
        } else if (neighborCount === 0) {
            h2 = 0.0; // Dead end - very bad
        } else {
            h2 = Math.min(1.0, neighborCount / 4.0);
        }

        // Factor 3: Future connectivity - check neighbor's neighbors
        let h3 = 0;
        if (neighborCount > 0) {
            let totalFutureOptions = 0;
            unvisitedNeighbors.forEach(neighbor => {
                const futureOptions = neighbor.neighbors.filter(
                    nn => !visited.has(nn.index) && nn.index !== dot.index
                ).length;
                totalFutureOptions += futureOptions;
            });
            h3 = Math.min(1.0, totalFutureOptions / (neighborCount * 3.0));
        }

        // Factor 4: Center preference early, edge preference late
        const progressRatio = visited.size / totalDots;
        const gridSize = this.grid.size || Math.sqrt(this.grid.dots.length);
        const centerX = (gridSize - 1) / 2;
        const centerY = (gridSize - 1) / 2;
        const distFromCenter = Math.abs(dot.gridX - centerX) + Math.abs(dot.gridY - centerY);
        const maxDistFromCenter = centerX + centerY;

        let h4;
        if (progressRatio < 0.5) {
            // Early game: prefer center exploration
            h4 = 1.0 - (distFromCenter / maxDistFromCenter);
        } else {
            // Late game: move toward end
            h4 = h1; // Reuse end-distance heuristic
        }

        // Weighted combination
        // Early game: balance all factors
        // Late game: prioritize reaching end and avoiding dead ends
        if (remainingDots > totalDots * 0.5) {
            // Early/mid game: balanced exploration
            return h1 * 0.25 + h2 * 0.35 + h3 * 0.25 + h4 * 0.15;
        } else {
            // Late game: focus on goal and avoiding traps
            return h1 * 0.4 + h2 * 0.4 + h3 * 0.2;
        }
    }

    /**
     * Evaporate pheromones
     */
    evaporatePheromones() {
        this.pheromones.forEach((value, key) => {
            this.pheromones.set(key, value * (1 - this.rho));
        });
    }

    /**
     * Deposit pheromones from ant paths
     * @param {Array} paths - Array of paths found by ants
     */
    depositPheromones(paths) {
        paths.forEach(path => {
            const contribution = this.Q / path.length;

            for (let i = 0; i < path.length - 1; i++) {
                const from = path[i];
                const to = path[i + 1];
                const current = this.getPheromone(from, to);
                this.setPheromone(from, to, current + contribution);
            }
        });
    }

    /**
     * Check if path is valid (visits all dots, starts at start, ends at end)
     * @param {Array} path - Path to validate
     * @returns {boolean} True if valid
     */
    isValidPath(path) {
        if (!path || path.length !== this.grid.dots.length) {
            return false;
        }

        if (path[0].index !== this.grid.startDot.index) {
            return false;
        }

        if (path[path.length - 1].index !== this.grid.endDot.index) {
            return false;
        }

        // Check all dots are unique
        const indices = new Set(path.map(d => d.index));
        if (indices.size !== path.length) {
            return false;
        }

        return true;
    }

    /**
     * Get best path found so far
     * @returns {Array|null} Best path or null
     */
    getBestPath() {
        return this.bestPath;
    }

    /**
     * Get current iteration number
     * @returns {number} Iteration count
     */
    getIteration() {
        return this.iteration;
    }

    /**
     * Get pheromone map for visualization
     * @returns {Map} Pheromone map
     */
    getPheromones() {
        return this.pheromones;
    }

    /**
     * Reset the colony
     */
    reset() {
        this.initializePheromones();
        this.bestPath = null;
        this.bestPathLength = Infinity;
        this.iteration = 0;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AntColony;
}
