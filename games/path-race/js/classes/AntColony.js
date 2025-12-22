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
        this.numAnts = CONFIG.ACO.NUM_ANTS;

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
     * Simplified robust heuristic for Hamiltonian path
     * @param {Object} dot - Candidate dot
     * @param {Set} visited - Visited dots
     * @returns {number} Heuristic value (higher is better)
     */
    calculateHeuristic(dot, visited) {
        // Primary: Distance to end (closer is better)
        const distToEnd = Math.abs(dot.gridX - this.grid.endDot.gridX) +
                          Math.abs(dot.gridY - this.grid.endDot.gridY);
        const h1 = 1.0 / (1.0 + distToEnd);

        // Secondary: Connectivity (more unvisited neighbors is better)
        const unvisitedNeighbors = dot.neighbors.filter(n => !visited.has(n.index)).length;
        const h2 = (unvisitedNeighbors + 1) / 5.0; // +1 to avoid zero, normalize by max+1

        // Simple weighted sum (bias toward reaching end)
        return h1 * 0.7 + h2 * 0.3;
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
