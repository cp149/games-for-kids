/**
 * Explorer AI Strategy
 * Curious and wandering - explores while collecting nearby food
 */

class ExplorerStrategy extends AIStrategy {
    constructor() {
        super('Curious Explorer');
        this.personalityTrait = 'explorer';
        this.wanderChangeInterval = 2000; // Change direction every 2 seconds
        this.lastWanderChange = 0;
        this.currentWanderAngle = Math.random() * Math.PI * 2;
        this.detectionRadius = 400; // Only target food within this range
    }

    /**
     * Calculate target angle - explore with opportunistic food collection, avoid danger
     */
    calculateTargetAngle(snake, gameState) {
        const head = snake.getHead();
        const { foods, snakes } = gameState;
        const currentTime = Date.now();

        // Look for nearby food
        const nearbyFoods = foods.filter(food => {
            const dist = MathUtils.distance(head.x, head.y, food.x, food.y);
            return dist < this.detectionRadius;
        });

        // If nearby food exists, go for it (with safety check)
        if (nearbyFoods.length > 0) {
            const nearestFood = this.findNearestFood(head, nearbyFoods);
            const foodAngle = this.angleToTarget(head, nearestFood);
            return this.findSafeAngle(snake, foodAngle, snakes);
        }

        // Otherwise, wander
        if (currentTime - this.lastWanderChange > this.wanderChangeInterval) {
            // Change wander direction
            this.currentWanderAngle = Math.random() * Math.PI * 2;
            this.lastWanderChange = currentTime;
        }

        // Avoid boundaries - turn away if getting close
        const margin = 300;
        if (head.x < margin) {
            // Too close to left - turn right
            this.currentWanderAngle = MathUtils.random(-Math.PI / 4, Math.PI / 4);
        } else if (head.x > CONFIG.GAME.CANVAS_SIZE - margin) {
            // Too close to right - turn left
            this.currentWanderAngle = MathUtils.random(Math.PI * 3 / 4, Math.PI * 5 / 4);
        }

        if (head.y < margin) {
            // Too close to top - turn down
            this.currentWanderAngle = MathUtils.random(Math.PI / 4, Math.PI * 3 / 4);
        } else if (head.y > CONFIG.GAME.CANVAS_SIZE - margin) {
            // Too close to bottom - turn up
            this.currentWanderAngle = MathUtils.random(-Math.PI * 3 / 4, -Math.PI / 4);
        }

        // Apply safety check to wander direction
        return this.findSafeAngle(snake, this.currentWanderAngle, snakes);
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExplorerStrategy;
}
