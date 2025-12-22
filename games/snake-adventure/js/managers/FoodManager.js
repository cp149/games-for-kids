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
            config: foodType.config,
            pulsePhase: Math.random() * Math.PI * 2  // Random initial pulse phase
        };

        this.foods.push(newFood);

        // Log food spawn
        const logger = window.Logger || console;
        logger.log('🍎 Spawned', foodType.name, 'food at', Math.floor(x), Math.floor(y), '(Total:', this.foods.length + ')');
    }

    /**
     * Spawn food at specific position (used when snake dies)
     */
    spawnFoodAt(x, y) {
        const foodType = this.selectFoodType();

        const newFood = {
            x,
            y,
            type: foodType.name,
            config: foodType.config,
            pulsePhase: Math.random() * Math.PI * 2
        };

        this.foods.push(newFood);
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
     * Render all food with enhanced visuals and type-specific effects
     */
    render(ctx, camera) {
        for (const food of this.foods) {
            const x = food.x - camera.getX();
            const y = food.y - camera.getY();
            const pulse = 1 + Math.sin(this.pulsePhase + food.pulsePhase) * CONFIG.FOOD.PULSE_AMOUNT;
            const radius = CONFIG.FOOD.SPAWN_RADIUS * pulse;
            const config = food.config;

            // Outer glow (larger for special foods)
            const glowSize = food.type !== 'NORMAL' ? CONFIG.FOOD.GLOW_RADIUS * 1.5 : CONFIG.FOOD.GLOW_RADIUS;
            const outerGlow = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
            outerGlow.addColorStop(0, config.GLOW_COLOR);
            outerGlow.addColorStop(0.4, config.GLOW_COLOR);
            outerGlow.addColorStop(1, 'transparent');

            ctx.fillStyle = outerGlow;
            ctx.beginPath();
            ctx.arc(x, y, glowSize, 0, Math.PI * 2);
            ctx.fill();

            // Middle glow layer
            const midGlow = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
            midGlow.addColorStop(0, config.COLOR);
            midGlow.addColorStop(0.5, config.GLOW_COLOR);
            midGlow.addColorStop(1, 'transparent');

            ctx.fillStyle = midGlow;
            ctx.beginPath();
            ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
            ctx.fill();

            // Food body with gradient
            const bodyGrad = ctx.createRadialGradient(
                x - radius * 0.4,
                y - radius * 0.4,
                0,
                x,
                y,
                radius
            );
            bodyGrad.addColorStop(0, '#ffffff');
            bodyGrad.addColorStop(0.3, config.COLOR);
            bodyGrad.addColorStop(1, config.COLOR);

            ctx.fillStyle = bodyGrad;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();

            // Type-specific indicators
            if (food.type === 'SPEED') {
                // Lightning bolt effect
                this.renderLightningIcon(ctx, x, y, radius * 0.6);
            } else if (food.type === 'BONUS') {
                // Star effect
                this.renderStarIcon(ctx, x, y, radius * 0.7);
            } else if (food.type === 'GOLDEN') {
                // Crown/sparkle effect
                this.renderCrownIcon(ctx, x, y, radius * 0.7);
            } else if (food.type === 'MAGNET') {
                // Magnet effect
                this.renderMagnetIcon(ctx, x, y, radius * 0.7);
            } else {
                // Normal food - simple shine
                ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.beginPath();
                ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.3, 0, Math.PI * 2);
                ctx.fill();
            }

            // Rotating aura for special foods
            if (food.type !== 'NORMAL') {
                const rotation = this.pulsePhase * 2;
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(rotation);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 2;
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI * 2 / 6) * i;
                    const sx = Math.cos(angle) * radius * 1.5;
                    const sy = Math.sin(angle) * radius * 1.5;
                    const ex = Math.cos(angle) * radius * 2;
                    const ey = Math.sin(angle) * radius * 2;
                    ctx.beginPath();
                    ctx.moveTo(sx, sy);
                    ctx.lineTo(ex, ey);
                    ctx.stroke();
                }
                ctx.restore();
            }
        }
    }

    /**
     * Render lightning icon for speed food
     */
    renderLightningIcon(ctx, x, y, size) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x - size * 0.3, y);
        ctx.lineTo(x + size * 0.2, y);
        ctx.lineTo(x, y + size);
        ctx.lineTo(x + size * 0.3, y - size * 0.2);
        ctx.lineTo(x - size * 0.2, y - size * 0.2);
        ctx.closePath();
        ctx.fill();
    }

    /**
     * Render star icon for bonus food
     */
    renderStarIcon(ctx, x, y, size) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
            const outerX = x + Math.cos(angle) * size;
            const outerY = y + Math.sin(angle) * size;
            const innerAngle = angle + Math.PI / 5;
            const innerX = x + Math.cos(innerAngle) * size * 0.4;
            const innerY = y + Math.sin(innerAngle) * size * 0.4;

            if (i === 0) ctx.moveTo(outerX, outerY);
            else ctx.lineTo(outerX, outerY);
            ctx.lineTo(innerX, innerY);
        }
        ctx.closePath();
        ctx.fill();
    }

    /**
     * Render crown icon for golden food
     */
    renderCrownIcon(ctx, x, y, size) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        // Crown base
        ctx.moveTo(x - size, y + size * 0.3);
        ctx.lineTo(x - size * 0.6, y - size * 0.3);
        ctx.lineTo(x - size * 0.2, y);
        ctx.lineTo(x, y - size);
        ctx.lineTo(x + size * 0.2, y);
        ctx.lineTo(x + size * 0.6, y - size * 0.3);
        ctx.lineTo(x + size, y + size * 0.3);
        ctx.closePath();
        ctx.fill();

        // Crown jewels
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(x, y - size * 0.5, size * 0.2, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Render magnet icon for magnet food
     */
    renderMagnetIcon(ctx, x, y, size) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = size * 0.25;
        ctx.lineCap = 'round';

        // Horseshoe magnet shape
        ctx.beginPath();
        ctx.arc(x, y - size * 0.2, size * 0.6, 0, Math.PI, true);
        ctx.stroke();

        // North pole
        ctx.fillStyle = '#ff3366';
        ctx.fillRect(x - size * 0.7, y - size * 0.3, size * 0.3, size * 0.6);

        // South pole
        ctx.fillStyle = '#3366ff';
        ctx.fillRect(x + size * 0.4, y - size * 0.3, size * 0.3, size * 0.6);
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
     * Clear all food items
     */
    clear() {
        this.foods = [];
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
    module.exports = { FoodManager };
}
