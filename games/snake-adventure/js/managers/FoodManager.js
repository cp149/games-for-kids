/**
 * Food Manager - Handles food spawning and collection with multiple types
 * Supports multiple food items on screen simultaneously
 */

class FoodManager {
    constructor() {
        this.foods = [];
        this.pulsePhase = 0;
    }

    /**
     * Select random food type based on spawn weights
     */
    selectFoodType() {
        const types = CONFIG.FOOD.TYPES;
        const totalWeight = Object.values(types).reduce((sum, type) => sum + type.SPAWN_WEIGHT, 0);
        let random = Math.random() * totalWeight;

        for (const [typeName, typeConfig] of Object.entries(types)) {
            random -= typeConfig.SPAWN_WEIGHT;
            if (random <= 0) {
                return { name: typeName, config: typeConfig };
            }
        }

        // Fallback to NORMAL
        return { name: 'NORMAL', config: types.NORMAL };
    }

    /**
     * Spawn a single food at random position
     */
    spawnOne(snakeSegments) {
        const maxAttempts = 50;
        let attempts = 0;
        let validPosition = false;
        let x, y;

        while (!validPosition && attempts < maxAttempts) {
            x = MathUtils.random(
                CONFIG.FOOD.MIN_DISTANCE_FROM_BOUNDARY,
                CONFIG.GAME.CANVAS_SIZE - CONFIG.FOOD.MIN_DISTANCE_FROM_BOUNDARY
            );
            y = MathUtils.random(
                CONFIG.FOOD.MIN_DISTANCE_FROM_BOUNDARY,
                CONFIG.GAME.CANVAS_SIZE - CONFIG.FOOD.MIN_DISTANCE_FROM_BOUNDARY
            );

            // Check distance from snake
            validPosition = true;
            for (const seg of snakeSegments) {
                if (MathUtils.distance(x, y, seg.x, seg.y) < CONFIG.FOOD.MIN_DISTANCE_FROM_SNAKE) {
                    validPosition = false;
                    break;
                }
            }

            // Check distance from other foods
            for (const food of this.foods) {
                if (MathUtils.distance(x, y, food.x, food.y) < CONFIG.FOOD.MIN_DISTANCE_FROM_SNAKE) {
                    validPosition = false;
                    break;
                }
            }

            attempts++;
        }

        // Select food type
        const foodType = this.selectFoodType();

        const newFood = {
            x,
            y,
            type: foodType.name,
            config: foodType.config
        };

        this.foods.push(newFood);

        // Log food spawn
        const logger = window.Logger || console;
        logger.log('🍎 Spawned', foodType.name, 'food at', Math.floor(x), Math.floor(y), '(Total:', this.foods.length + ')');
    }

    /**
     * Ensure minimum number of food items on screen
     */
    ensureMinimumFood(snakeSegments) {
        const maxFood = CONFIG.FOOD.MAX_COUNT;
        while (this.foods.length < maxFood) {
            this.spawnOne(snakeSegments);
        }
    }

    /**
     * Update animation
     */
    update(deltaTime) {
        this.pulsePhase += deltaTime * CONFIG.FOOD.PULSE_SPEED;
    }

    /**
     * Render all food with type-specific colors
     */
    render(ctx, camera) {
        for (const food of this.foods) {
            const x = food.x - camera.x;
            const y = food.y - camera.y;
            const pulse = 1 + Math.sin(this.pulsePhase) * CONFIG.FOOD.PULSE_AMOUNT;
            const radius = CONFIG.FOOD.SPAWN_RADIUS * pulse;
            const config = food.config;

            // Glow
            const glow = ctx.createRadialGradient(x, y, 0, x, y, CONFIG.FOOD.GLOW_RADIUS);
            glow.addColorStop(0, config.COLOR);
            glow.addColorStop(0.5, config.GLOW_COLOR);
            glow.addColorStop(1, 'transparent');

            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(x, y, CONFIG.FOOD.GLOW_RADIUS, 0, Math.PI * 2);
            ctx.fill();

            // Food body
            ctx.fillStyle = config.COLOR;
            ctx.shadowBlur = 20;
            ctx.shadowColor = config.COLOR;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Type indicator (inner circle for special foods)
            if (food.type !== 'NORMAL') {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.beginPath();
                ctx.arc(x, y, radius * 0.4, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    /**
     * Check collision with snake head
     * Returns the food object if collision detected, null otherwise
     */
    checkCollision(head) {
        for (const food of this.foods) {
            if (MathUtils.distance(head.x, head.y, food.x, food.y) < CONFIG.FOOD.COLLECTION_RADIUS) {
                return food;
            }
        }
        return null;
    }

    /**
     * Remove a specific food item
     */
    removeFood(food) {
        const index = this.foods.indexOf(food);
        if (index > -1) {
            this.foods.splice(index, 1);
        }
    }

    /**
     * Get current food count
     */
    getFoodCount() {
        return this.foods.length;
    }

    /**
     * Cleanup
     */
    destroy() {
        this.foods = [];
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FoodManager;
}
