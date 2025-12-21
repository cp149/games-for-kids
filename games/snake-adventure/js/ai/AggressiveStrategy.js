/**
 * Aggressive AI Strategy
 * Fast and direct - always goes for nearest food
 */

class AggressiveStrategy extends AIStrategy {
    constructor() {
        super('Aggressive Hunter');
        this.personalityTrait = 'aggressive';
    }

    /**
     * Calculate target angle - hunt weaker snakes, avoid stronger ones
     */
    calculateTargetAngle(snake, gameState) {
        const head = snake.getHead();
        const { foods, snakes } = gameState;

        // Find nearest snake
        const nearestSnake = this.findNearestSnake(head, snakes, snake.id);

        // Attack mode: if we're much longer, hunt the nearest snake
        if (nearestSnake && this.canHunt(snake, nearestSnake)) {
            const lengthAdvantage = snake.getLength() - nearestSnake.getLength();

            // Only hunt if we have significant advantage (5+ segments longer)
            if (lengthAdvantage > 5) {
                const targetHead = nearestSnake.getHead();
                const huntAngle = this.angleToTarget(head, targetHead);

                // Make sure hunting is safe
                return this.findSafeAngle(snake, huntAngle, snakes);
            }
        }

        // Default: go for food
        const nearestFood = this.findNearestFood(head, foods);

        if (nearestFood) {
            const foodAngle = this.angleToTarget(head, nearestFood);
            // Always check safety before going for food
            return this.findSafeAngle(snake, foodAngle, snakes);
        }

        // No food - explore safely
        const centerX = CONFIG.GAME.CANVAS_SIZE / 2;
        const centerY = CONFIG.GAME.CANVAS_SIZE / 2;
        const exploreAngle = this.angleToTarget(head, { x: centerX, y: centerY });
        return this.findSafeAngle(snake, exploreAngle, snakes);
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AggressiveStrategy;
}
