/**
 * AI Controller
 * Manages AI snake behavior and strategy execution
 */

class AIController {
    constructor() {
        this.aiSnakes = new Map(); // Map of snake ID -> strategy instance
    }

    /**
     * Register an AI snake with a strategy
     * @param {Snake} snake - The AI snake instance
     * @param {AIStrategy} strategy - The AI strategy to use
     */
    registerAI(snake, strategy) {
        if (snake.type !== 'ai') {
            console.warn('Attempting to register non-AI snake');
            return;
        }
        this.aiSnakes.set(snake.id, strategy);
    }

    /**
     * Update all AI snakes (new API)
     * @param {number} deltaTime - Time since last frame
     * @param {Array} foods - Array of food objects
     * @param {Snake} playerSnake - The player snake
     * @param {Array} aiSnakes - Array of AI snakes
     */
    updateAll(deltaTime, foods, playerSnake, aiSnakes) {
        // Create Map of all snakes for collision checking
        const allSnakes = new Map();
        if (playerSnake && playerSnake.isAlive) {
            allSnakes.set(playerSnake.id, playerSnake);
        }
        for (const aiSnake of aiSnakes) {
            if (aiSnake && aiSnake.isAlive) {
                allSnakes.set(aiSnake.id, aiSnake);
            }
        }

        const gameState = {
            foods: foods,
            playerSnake: playerSnake,
            aiSnakes: aiSnakes,
            snakes: allSnakes,  // Add snakes Map for strategies
            deltaTime: deltaTime
        };

        for (const aiSnake of aiSnakes) {
            if (!aiSnake || !aiSnake.isAlive) {
                continue;
            }

            const strategy = this.aiSnakes.get(aiSnake.id);
            if (!strategy) {
                continue;
            }

            // Calculate target angle using AI strategy
            const targetAngle = strategy.calculateTargetAngle(aiSnake, gameState);

            // Update snake's target angle
            aiSnake.setTargetAngle(targetAngle);
        }
    }

    /**
     * Update all AI snakes (legacy API)
     * @param {Map} snakes - Map of all snakes
     * @param {Object} gameState - Current game state
     */
    update(snakes, gameState) {
        for (const [snakeId, strategy] of this.aiSnakes.entries()) {
            const snake = snakes.get(snakeId);

            if (!snake || !snake.isAlive) {
                continue;
            }

            // Calculate target angle using AI strategy
            const targetAngle = strategy.calculateTargetAngle(snake, gameState);

            // Update snake's target angle
            snake.setTargetAngle(targetAngle);
        }
    }

    /**
     * Remove AI snake from controller
     * @param {string} snakeId - Snake ID to remove
     */
    removeAI(snakeId) {
        this.aiSnakes.delete(snakeId);
    }

    /**
     * Get strategy for a snake
     * @param {string} snakeId - Snake ID
     * @returns {AIStrategy|null} The strategy or null
     */
    getStrategy(snakeId) {
        return this.aiSnakes.get(snakeId) || null;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AIController };
}
