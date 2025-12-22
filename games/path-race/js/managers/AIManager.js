/**
 * AIManager - AI Opponent Manager
 * Controls the AI opponent using Ant Colony Optimization
 */

class AIManager {
    constructor(game) {
        this.logger = window.Logger;
        this.game = game;
        this.antColony = null;
        this.isRunning = false;
        this.aiPath = [];
        this.currentIteration = 0;
        this.maxIterations = CONFIG.ACO.MAX_ITERATIONS;
        this.iterationDelay = CONFIG.ACO.ITERATION_DELAY;
        this.startTime = null;
        this.finishTime = null;
        this.intervalId = null;
        this.pathTimeouts = []; // Track setTimeout IDs for path animation

        // Early stopping mechanism
        this.lastImprovementIteration = 0;
        this.bestPathLength = Infinity;
        this.noImprovementThreshold = 20; // Stop if no improvement for 20 iterations
    }

    /**
     * Start AI opponent
     * @param {Object} grid - Grid to solve
     * @param {number} level - Current level (for difficulty adjustment)
     */
    async start(grid, level) {
        this.logger.info('AIManager: Starting AI opponent');

        // Get difficulty multiplier for this level
        const difficultyMult = CONFIG.ACO.DIFFICULTY_MULTIPLIERS[level] ||
                               CONFIG.ACO.DIFFICULTY_MULTIPLIERS.DEFAULT;

        // Adjust iteration delay based on difficulty
        this.iterationDelay = CONFIG.ACO.ITERATION_DELAY / difficultyMult;

        // Create ant colony
        this.antColony = new AntColony(grid, difficultyMult);
        this.isRunning = true;
        this.currentIteration = 0;
        this.startTime = Date.now();
        this.aiPath = [];

        // Reset early stopping tracking
        this.lastImprovementIteration = 0;
        this.bestPathLength = Infinity;

        // Start iterative solving
        this.runACO();
    }

    /**
     * Run ACO iterations
     */
    async runACO() {
        if (!this.isRunning) return;

        this.intervalId = setInterval(async () => {
            if (!this.isRunning || this.currentIteration >= this.maxIterations) {
                this.finishSolving();
                return;
            }

            // Run one iteration
            const bestPath = await this.antColony.runIteration();
            this.currentIteration++;

            // Update UI with progress
            const progress = (this.currentIteration / this.maxIterations) * 100;
            if (this.game.uiManager) {
                this.game.uiManager.updateAIProgress(progress);
                this.game.uiManager.updateAIStatus('exploring');
            }

            // Track improvement for early stopping
            if (bestPath && bestPath.length < this.bestPathLength) {
                this.bestPathLength = bestPath.length;
                this.lastImprovementIteration = this.currentIteration;
                this.logger.info(`AIManager: Improved path length: ${bestPath.length}`);
            }

            // Quick fail: if ACO can't find ANY path in first 10 iterations, give up
            if (this.currentIteration === 10 && !bestPath) {
                this.logger.warn('AIManager: ACO failed to find any path in 10 iterations, switching to greedy');
                this.finishSolving();
                return;
            }

            // Early stopping: if no improvement after threshold and past minimum iterations
            if (this.currentIteration > 10) {
                const noImprovement = this.currentIteration - this.lastImprovementIteration;
                if (noImprovement >= this.noImprovementThreshold) {
                    this.logger.info(`AIManager: Early stop - no improvement for ${noImprovement} iterations`);
                    this.finishSolving();
                    return;
                }
            }

            // If found complete path, validate and execute it
            if (bestPath && this.antColony.isValidPath(bestPath)) {
                this.logger.info(`AIManager: Found valid solution at iteration ${this.currentIteration}`);
                // Update progress to 100% before executing path
                if (this.game.uiManager) {
                    this.game.uiManager.updateAIProgress(100);
                    this.game.uiManager.updateAIStatus('found_solution');
                }
                this.executePath(bestPath);
            }

        }, this.iterationDelay);
    }

    /**
     * Execute the found path
     * @param {Array} path - Path to execute (must be pre-validated)
     */
    async executePath(path) {
        this.stop();
        this.aiPath = path;

        this.logger.info(`AIManager: Executing path - ${path.length} dots from (${path[0].gridX},${path[0].gridY}) to (${path[path.length-1].gridX},${path[path.length-1].gridY})`);

        if (this.game.uiManager) {
            this.game.uiManager.updateAIStatus('racing');
        }

        // Clear any existing path timeouts
        this.pathTimeouts.forEach(id => clearTimeout(id));
        this.pathTimeouts = [];

        // Mark dots as visited by AI
        path.forEach((dot, index) => {
            const timeoutId = setTimeout(() => {
                dot.aiVisited = true;
                dot.visited = true;

                // Check if finished (path is pre-validated, so last step = success)
                if (index === path.length - 1) {
                    this.logger.info('AIManager: Path animation complete, calling finish()');
                    this.finish();
                }

                // Trigger render
                if (this.game.renderBothCanvases) {
                    this.game.renderBothCanvases();
                }
            }, index * 200); // Animate path step by step

            this.pathTimeouts.push(timeoutId);
        });
    }

    /**
     * Finish AI solving (time up or path found)
     */
    finishSolving() {
        this.stop();

        let bestPath = this.antColony.getBestPath();

        // Validate ACO path
        if (bestPath && !this.antColony.isValidPath(bestPath)) {
            this.logger.warn(`AIManager: ACO path invalid - length: ${bestPath.length}, expected: ${this.antColony.grid.dots.length}`);
            bestPath = null;
        }

        // Fallback: if ACO failed, try greedy algorithm
        if (!bestPath) {
            this.logger.warn('AIManager: ACO failed, trying greedy fallback');
            bestPath = this.greedyPathFinding();
        }

        if (bestPath) {
            this.logger.info('AIManager: Executing validated path');
            this.executePath(bestPath);
        } else {
            this.logger.error('AIManager: No valid path found even with fallback');
            if (this.game.uiManager) {
                this.game.uiManager.updateAIStatus('failed');
            }
        }
    }

    /**
     * Greedy pathfinding fallback
     * Uses nearest-unvisited-neighbor heuristic with backtracking
     */
    greedyPathFinding() {
        const grid = this.antColony.grid;
        const visited = new Set();
        const path = [];

        const backtrack = (current) => {
            visited.add(current.index);
            path.push(current);

            // Reached end with all dots visited?
            if (current.index === grid.endDot.index && visited.size === grid.dots.length) {
                return true;
            }

            // Don't continue if at end but not all visited
            if (current.index === grid.endDot.index) {
                visited.delete(current.index);
                path.pop();
                return false;
            }

            // Try neighbors sorted by distance to end
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

            // Backtrack
            visited.delete(current.index);
            path.pop();
            return false;
        };

        if (backtrack(grid.startDot)) {
            this.logger.info('AIManager: Greedy fallback found solution');
            return path;
        }

        return null;
    }

    /**
     * Mark AI as finished
     */
    finish() {
        // Prevent multiple finish calls
        if (this.finishTime !== null) {
            this.logger.warn('AIManager: finish() called multiple times, ignoring');
            return;
        }

        this.finishTime = Date.now();
        this.isRunning = false;

        if (this.game.uiManager) {
            this.game.uiManager.updateAIStatus('finished');
            this.game.uiManager.updateAIProgress(100);
        }

        this.logger.info(`AIManager: Finished in ${this.getTime()}ms`);

        // Notify game
        if (this.game.checkWinner) {
            this.game.checkWinner();
        }
    }

    /**
     * Stop AI
     */
    stop() {
        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    /**
     * Check if AI is finished
     * @returns {boolean} True if finished
     */
    isFinished() {
        return this.finishTime !== null;
    }

    /**
     * Get AI completion time
     * @returns {number} Time in milliseconds
     */
    getTime() {
        if (!this.finishTime) return null;
        return this.finishTime - this.startTime;
    }

    /**
     * Get AI path
     * @returns {Array} AI path
     */
    getPath() {
        return this.aiPath;
    }

    /**
     * Get pheromone map for visualization
     * @returns {Map|null} Pheromone map
     */
    getPheromones() {
        return this.antColony ? this.antColony.getPheromones() : null;
    }

    /**
     * Reset AI state
     */
    reset() {
        this.stop();

        // Clear any pending path animation timeouts
        this.pathTimeouts.forEach(id => clearTimeout(id));
        this.pathTimeouts = [];

        this.aiPath = [];
        this.currentIteration = 0;
        this.startTime = null;
        this.finishTime = null;
        if (this.antColony) {
            this.antColony.reset();
        }
    }

    /**
     * Clean up resources
     */
    destroy() {
        this.stop();
        this.antColony = null;
        this.aiPath = [];
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIManager;
}
