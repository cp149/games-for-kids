/**
 * Snake Manager - Manages multiple snakes (player and AI)
 */

class SnakeManager {
    constructor() {
        this.snakes = new Map(); // Map of snake ID -> Snake instance
        this.playerSnake = null;
    }

    /**
     * Create and add a player snake
     */
    createPlayerSnake(options = {}) {
        const playerOptions = {
            type: 'player',
            x: options.x || CONFIG.GAME.CANVAS_SIZE / 2,
            y: options.y || CONFIG.GAME.CANVAS_SIZE / 2,
            ...options
        };

        this.playerSnake = new Snake(playerOptions);
        this.snakes.set(this.playerSnake.id, this.playerSnake);

        return this.playerSnake;
    }

    /**
     * Create and add an AI snake
     */
    createAISnake(options = {}) {
        const aiOptions = {
            type: 'ai',
            color: options.color || {
                start: '#ff00ff',
                end: '#00ffff',
                glow: 'rgba(255, 0, 255, 0.8)'
            },
            ...options
        };

        const aiSnake = new Snake(aiOptions);
        this.snakes.set(aiSnake.id, aiSnake);

        return aiSnake;
    }

    /**
     * Remove a snake by ID
     */
    removeSnake(snakeId) {
        const snake = this.snakes.get(snakeId);
        if (snake) {
            snake.destroy();
            this.snakes.delete(snakeId);

            if (this.playerSnake && this.playerSnake.id === snakeId) {
                this.playerSnake = null;
            }
        }
    }

    /**
     * Get snake by ID
     */
    getSnake(snakeId) {
        return this.snakes.get(snakeId);
    }

    /**
     * Get player snake
     */
    getPlayerSnake() {
        return this.playerSnake;
    }

    /**
     * Get all snakes
     */
    getAllSnakes() {
        return Array.from(this.snakes.values());
    }

    /**
     * Get all AI snakes
     */
    getAISnakes() {
        return this.getAllSnakes().filter(snake => snake.type === 'ai');
    }

    /**
     * Update all snakes
     */
    update(deltaTime) {
        for (const snake of this.snakes.values()) {
            if (snake.isAlive) {
                snake.update(deltaTime);
            }
        }
    }

    /**
     * Render all snakes
     */
    render(ctx, camera) {
        for (const snake of this.snakes.values()) {
            if (snake.isAlive) {
                snake.render(ctx, camera);
            }
        }
    }

    /**
     * Check if any snake head collides with a point
     */
    checkHeadCollision(x, y, radius) {
        for (const snake of this.snakes.values()) {
            if (!snake.isAlive) continue;

            const head = snake.getHead();
            if (MathUtils.distance(x, y, head.x, head.y) < radius + CONFIG.SNAKE.SEGMENT_RADIUS) {
                return snake;
            }
        }
        return null;
    }

    /**
     * Check if point collides with any snake body
     */
    checkBodyCollision(x, y, excludeSnakeId = null) {
        for (const snake of this.snakes.values()) {
            if (!snake.isAlive) continue;
            if (excludeSnakeId && snake.id === excludeSnakeId) continue;

            if (snake.checkBodyCollision(x, y, CONFIG.COLLISION.SELF_COLLISION_SKIP_SEGMENTS)) {
                return snake;
            }
        }
        return null;
    }

    /**
     * Get all snake segments (for food spawning)
     */
    getAllSegments() {
        const allSegments = [];
        for (const snake of this.snakes.values()) {
            allSegments.push(...snake.segments);
        }
        return allSegments;
    }

    /**
     * Reset all snakes
     */
    reset() {
        for (const snake of this.snakes.values()) {
            snake.reset();
        }
    }

    /**
     * Clear all snakes
     */
    clear() {
        for (const snake of this.snakes.values()) {
            snake.destroy();
        }
        this.snakes.clear();
        this.playerSnake = null;
    }

    /**
     * Cleanup
     */
    destroy() {
        this.clear();
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SnakeManager };
}
