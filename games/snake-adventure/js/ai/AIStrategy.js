/**
 * AI Strategy Base Class
 * Abstract base class for different AI behaviors
 */

class AIStrategy {
    constructor(name = 'Base AI') {
        this.name = name;
    }

    /**
     * Calculate target angle for the snake
     * @param {Snake} snake - The AI snake
     * @param {Object} gameState - Current game state
     * @returns {number} Target angle in radians
     */
    calculateTargetAngle(snake, gameState) {
        throw new Error('calculateTargetAngle must be implemented by subclass');
    }

    /**
     * Find nearest food to snake head
     * @param {Object} head - Snake head position {x, y}
     * @param {Array} foods - Array of food objects
     * @returns {Object|null} Nearest food or null
     */
    findNearestFood(head, foods) {
        if (!foods || foods.length === 0) return null;

        let nearestFood = null;
        let minDistance = Infinity;

        for (const food of foods) {
            const dist = MathUtils.distance(head.x, head.y, food.x, food.y);
            if (dist < minDistance) {
                minDistance = dist;
                nearestFood = food;
            }
        }

        return nearestFood;
    }

    /**
     * Check if position is safe (not too close to boundaries)
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} margin - Safety margin
     * @returns {boolean} True if safe
     */
    isSafePosition(x, y, margin = 200) {
        return (
            x > margin &&
            x < CONFIG.GAME.CANVAS_SIZE - margin &&
            y > margin &&
            y < CONFIG.GAME.CANVAS_SIZE - margin
        );
    }

    /**
     * Calculate angle to target position
     * @param {Object} from - Start position {x, y}
     * @param {Object} to - Target position {x, y}
     * @returns {number} Angle in radians
     */
    angleToTarget(from, to) {
        return Math.atan2(to.y - from.y, to.x - from.x);
    }

    /**
     * Check if angle leads to collision with other snakes
     * @param {Snake} snake - Current snake
     * @param {number} angle - Angle to check
     * @param {Map} allSnakes - All snakes in game
     * @param {number} lookAhead - How far to look ahead (pixels)
     * @returns {boolean} True if collision detected
     */
    willCollide(snake, angle, allSnakes, lookAhead = 200) {
        const head = snake.getHead();
        const checkX = head.x + Math.cos(angle) * lookAhead;
        const checkY = head.y + Math.sin(angle) * lookAhead;

        // Check boundary
        const margin = CONFIG.SNAKE.SEGMENT_RADIUS * 2;
        if (checkX < margin || checkX > CONFIG.GAME.CANVAS_SIZE - margin ||
            checkY < margin || checkY > CONFIG.GAME.CANVAS_SIZE - margin) {
            return true;
        }

        // Check collision with other snakes
        for (const otherSnake of allSnakes.values()) {
            if (!otherSnake.isAlive) continue;
            if (otherSnake.id === snake.id) continue;

            // Check if predicted position hits other snake's body
            if (otherSnake.checkBodyCollision(checkX, checkY, 0)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Find safe angle that avoids collisions
     * @param {Snake} snake - Current snake
     * @param {number} preferredAngle - Preferred direction
     * @param {Map} allSnakes - All snakes in game
     * @returns {number} Safe angle or preferred angle if no danger
     */
    findSafeAngle(snake, preferredAngle, allSnakes) {
        // If preferred angle is safe, use it
        if (!this.willCollide(snake, preferredAngle, allSnakes)) {
            return preferredAngle;
        }

        // Try angles around preferred direction
        const angles = [
            preferredAngle + Math.PI / 4,      // 45° right
            preferredAngle - Math.PI / 4,      // 45° left
            preferredAngle + Math.PI / 2,      // 90° right
            preferredAngle - Math.PI / 2,      // 90° left
            preferredAngle + Math.PI * 3 / 4,  // 135° right
            preferredAngle - Math.PI * 3 / 4,  // 135° left
            preferredAngle + Math.PI           // 180° opposite
        ];

        for (const angle of angles) {
            if (!this.willCollide(snake, angle, allSnakes)) {
                return angle;
            }
        }

        // All directions dangerous, try to go opposite of nearest threat
        return preferredAngle + Math.PI;
    }

    /**
     * Find nearest snake (for hunting or avoiding)
     * @param {Object} head - Snake head position
     * @param {Map} allSnakes - All snakes
     * @param {string} excludeId - Snake ID to exclude
     * @returns {Snake|null} Nearest snake or null
     */
    findNearestSnake(head, allSnakes, excludeId) {
        let nearestSnake = null;
        let minDistance = Infinity;

        for (const snake of allSnakes.values()) {
            if (!snake.isAlive) continue;
            if (snake.id === excludeId) continue;

            const otherHead = snake.getHead();
            const dist = MathUtils.distance(head.x, head.y, otherHead.x, otherHead.y);

            if (dist < minDistance) {
                minDistance = dist;
                nearestSnake = snake;
            }
        }

        return nearestSnake;
    }

    /**
     * Check if we are longer than target snake (can hunt it)
     * @param {Snake} snake - Our snake
     * @param {Snake} target - Target snake
     * @returns {boolean} True if we are longer
     */
    canHunt(snake, target) {
        return snake.getLength() > target.getLength();
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIStrategy;
}
