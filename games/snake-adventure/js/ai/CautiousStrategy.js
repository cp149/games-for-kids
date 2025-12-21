/**
 * Cautious AI Strategy
 * Careful and safe - prefers food away from boundaries
 */

class CautiousStrategy extends AIStrategy {
    constructor() {
        super('Cautious Survivor');
        this.personalityTrait = 'cautious';
        this.safetyMargin = 300;
    }

    /**
     * Calculate target angle - prefer safe food locations and avoid threats
     */
    calculateTargetAngle(snake, gameState) {
        const head = snake.getHead();
        const { foods, snakes } = gameState;

        // Find nearest threat
        const nearestSnake = this.findNearestSnake(head, snakes, snake.id);
        const threatDistance = nearestSnake
            ? MathUtils.distance(head.x, head.y, nearestSnake.getHead().x, nearestSnake.getHead().y)
            : Infinity;

        // If threat is very close, run away immediately
        if (threatDistance < 300) {
            const threatHead = nearestSnake.getHead();
            const awayAngle = this.angleToTarget(head, threatHead) + Math.PI; // Opposite direction
            return this.findSafeAngle(snake, awayAngle, snakes);
        }

        if (!foods || foods.length === 0) {
            // Move towards safe center, checking for dangers
            const safeAngle = this.moveToSafeZone(head);
            return this.findSafeAngle(snake, safeAngle, snakes);
        }

        // Filter safe foods (away from boundaries AND other snakes)
        const safeFoods = foods.filter(food => {
            // Check boundary safety
            if (!this.isSafePosition(food.x, food.y, this.safetyMargin)) {
                return false;
            }

            // Check if any snake is too close to this food
            for (const otherSnake of snakes.values()) {
                if (!otherSnake.isAlive) continue;
                if (otherSnake.id === snake.id) continue;

                const otherHead = otherSnake.getHead();
                const distToFood = MathUtils.distance(otherHead.x, otherHead.y, food.x, food.y);

                // Avoid food if another snake is close to it
                if (distToFood < 200) {
                    return false;
                }
            }

            return true;
        });

        // Prefer safe foods, fallback to any food
        const targetFoods = safeFoods.length > 0 ? safeFoods : foods;
        const nearestFood = this.findNearestFood(head, targetFoods);

        if (nearestFood) {
            const foodAngle = this.angleToTarget(head, nearestFood);
            return this.findSafeAngle(snake, foodAngle, snakes);
        }

        // Default: move to safe zone with collision avoidance
        const safeAngle = this.moveToSafeZone(head);
        return this.findSafeAngle(snake, safeAngle, snakes);
    }

    /**
     * Move towards safe center area
     */
    moveToSafeZone(head) {
        const centerX = CONFIG.GAME.CANVAS_SIZE / 2;
        const centerY = CONFIG.GAME.CANVAS_SIZE / 2;

        // If already near center, wander
        const distToCenter = MathUtils.distance(head.x, head.y, centerX, centerY);
        if (distToCenter < 500) {
            // Random wander in safe area
            const randomAngle = Math.random() * Math.PI * 2;
            return randomAngle;
        }

        return this.angleToTarget(head, { x: centerX, y: centerY });
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CautiousStrategy;
}
