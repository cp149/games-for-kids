/**
 * AIManager - AI Opponent Manager
 * Controls the AI opponent using Ant Colony Optimization
 */

class AIManager {
    constructor(callbacks = {}) {
        this.logger = window.Logger;

        // Callbacks for decoupling
        this.callbacks = {
            onProgress: callbacks.onProgress,           // (percent) => {}
            onStatusChange: callbacks.onStatusChange,   // (status) => {}
            onImprovement: callbacks.onImprovement,     // (pathLength) => {}
            onThinking: callbacks.onThinking,           // (iteration, pathLength) => {}
            onNeedsRender: callbacks.onNeedsRender,     // () => {}
            onRender: callbacks.onRender,               // () => {}
            onFinish: callbacks.onFinish                // () => {}
        };

        this.antColony = null;
        this.isRunning = false;
        this.aiPath = [];
        this.currentIteration = 0;
        this.maxIterations = CONFIG.ACO.MAX_ITERATIONS;
        this.iterationDelay = CONFIG.ACO.ITERATION_DELAY;
        this.startTime = null;
        this.finishTime = null;
        this.pathTimeouts = []; // Track setTimeout IDs for path animation

        // Early stopping mechanism
        this.lastImprovementIteration = 0;
        this.bestPathLength = Infinity;
        this.noImprovementThreshold = 20; // Stop if no improvement for 20 iterations

        // Thinking visualization
        this.currentThinkingPath = null; // Current best path being considered
        this.previousBestLength = Infinity; // Track improvements
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

        // Reset thinking visualization
        this.currentThinkingPath = null;
        this.previousBestLength = Infinity;

        // Start iterative solving
        this.runACO();
    }

    /**
     * Run ACO iterations
     */
    async runACO() {
        if (!this.isRunning) return;

        // Main loop - much cleaner than setInterval
        while (this.isRunning && this.currentIteration < this.maxIterations) {
            // Run one iteration
            const bestPath = await this.antColony.runIteration();
            this.currentIteration++;

            // Update thinking path visualization
            this.currentThinkingPath = bestPath;

            // Update UI with progress (search phase: 0-50%)
            const searchProgress = (this.currentIteration / this.maxIterations) * 50;
            this.callbacks.onProgress?.(searchProgress);
            this.callbacks.onStatusChange?.('exploring');

            // Update thinking visualization
            this.callbacks.onThinking?.(
                this.currentIteration,
                bestPath ? bestPath.length : null
            );

            // Track improvement for early stopping
            if (bestPath && bestPath.length < this.bestPathLength) {
                const improved = this.bestPathLength !== Infinity;
                this.bestPathLength = bestPath.length;
                this.lastImprovementIteration = this.currentIteration;
                this.logger.info(`AIManager: Improved path length: ${bestPath.length}`);

                // Show improvement notification
                if (improved) {
                    this.callbacks.onImprovement?.(bestPath.length);
                }

                this.previousBestLength = bestPath.length;
            }

            // Trigger render
            this.callbacks.onNeedsRender?.();

            // Quick fail: if ACO can't find ANY path in first 10 iterations, give up
            if (this.currentIteration === 10 && !bestPath) {
                this.logger.warn('AIManager: ACO failed to find any path in 10 iterations, switching to greedy');
                break;
            }

            // Early stopping: if no improvement after threshold and past minimum iterations
            if (this.currentIteration > 10) {
                const noImprovement = this.currentIteration - this.lastImprovementIteration;
                if (noImprovement >= this.noImprovementThreshold) {
                    this.logger.info(`AIManager: Early stop - no improvement for ${noImprovement} iterations`);
                    break;
                }
            }

            // If found complete path, check if we should continue or execute
            if (bestPath && this.antColony.isValidPath(bestPath)) {
                // Continue iterating if below minimum iterations (for visualization)
                if (this.currentIteration < CONFIG.ACO.MIN_ITERATIONS) {
                    this.logger.info(`AIManager: Found solution at iteration ${this.currentIteration}, continuing to MIN_ITERATIONS`);
                    this.callbacks.onStatusChange?.('found_solution');
                    // Continue to next iteration
                } else {
                    // Above minimum iterations, execute immediately
                    this.logger.info(`AIManager: Found valid solution at iteration ${this.currentIteration}`);
                    this.callbacks.onStatusChange?.('found_solution');
                    this.executePath(bestPath);
                    return; // Exit - path animation in progress
                }
            }

            // Wait before next iteration (simulate delay)
            await new Promise(resolve => setTimeout(resolve, this.iterationDelay));
        }

        // Loop ended without finding solution - try fallback
        this.finishSolving();
    }

    /**
     * Execute the found path
     * @param {Array} path - Path to execute (must be pre-validated)
     */
    async executePath(path) {
        this.stop();
        this.aiPath = path;

        this.logger.info(`AIManager: Executing path - ${path.length} dots from (${path[0].gridX},${path[0].gridY}) to (${path[path.length-1].gridX},${path[path.length-1].gridY})`);

        // Don't change status - keep 'found_solution' or let it transition naturally
        // Status will be updated to 'finished' when path animation completes

        // Clear any existing path timeouts
        this.pathTimeouts.forEach(id => clearTimeout(id));
        this.pathTimeouts = [];

        // Calculate delay based on grid size
        // Small grids (3x3=9 dots): 2000ms per dot (slow, easy to observe)
        // Medium grids (4x4=16 dots): 1250ms per dot
        // Large grids (5x5=25 dots): 800ms per dot (faster to avoid long wait)
        const pathLength = path.length;
        let delayPerDot;
        if (pathLength <= 9) {
            delayPerDot = 2000; // 3x3: 2s per dot
        } else if (pathLength <= 16) {
            delayPerDot = 1250; // 4x4: 1.25s per dot
        } else if (pathLength <= 25) {
            delayPerDot = 800;  // 5x5: 0.8s per dot
        } else {
            delayPerDot = 500;  // 6x6+: 0.5s per dot
        }

        this.logger.info(`AIManager: Animation speed ${delayPerDot}ms per dot for ${pathLength} dots grid`);

        // Mark dots as visited by AI
        path.forEach((dot, index) => {
            const timeoutId = setTimeout(() => {
                dot.aiVisited = true;
                dot.visited = true;

                // Update progress during path execution (execution phase: 50-100%)
                const executionProgress = 50 + ((index + 1) / path.length) * 50;
                this.callbacks.onProgress?.(executionProgress);

                // Check if finished (path is pre-validated, so last step = success)
                if (index === path.length - 1) {
                    this.logger.info('AIManager: Path animation complete, calling finish()');
                    this.finish();
                }

                // Trigger render
                this.callbacks.onRender?.();
            }, index * delayPerDot); // Dynamic delay based on grid size

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
            this.callbacks.onStatusChange?.('failed');
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

        this.callbacks.onStatusChange?.('finished');
        this.callbacks.onProgress?.(100);

        this.logger.info(`AIManager: Finished in ${this.getTime()}ms`);

        // Notify game
        this.callbacks.onFinish?.();
    }

    /**
     * Stop AI
     */
    stop() {
        this.isRunning = false;
        // No need to clear interval - using while loop now
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
     * Get edge key for pheromone lookup
     * @param {Object} from - From dot
     * @param {Object} to - To dot
     * @returns {string|null} Edge key or null if no ant colony
     */
    getEdgeKey(from, to) {
        return this.antColony ? this.antColony.getEdgeKey(from, to) : null;
    }

    /**
     * Get current thinking path for visualization
     * @returns {Array|null} Current best path being considered
     */
    getThinkingPath() {
        return this.currentThinkingPath;
    }

    /**
     * Get current iteration count
     * @returns {number} Current iteration
     */
    getCurrentIteration() {
        return this.currentIteration;
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
