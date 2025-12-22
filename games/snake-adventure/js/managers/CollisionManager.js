/**
 * CollisionManager - Optimized collision detection with spatial partitioning
 * Reduces O(n²) complexity to approximately O(n) for most cases
 */
class CollisionManager {
    constructor(worldSize, logger) {
        this.worldSize = worldSize;
        this.logger = logger || console;

        // Spatial partitioning grid
        this.cellSize = CONFIG.COLLISION.SPATIAL_GRID_CELL_SIZE;
        this.gridWidth = Math.ceil(worldSize / this.cellSize);
        this.grid = new Map();
    }

    /**
     * Clear the spatial grid
     */
    clearGrid() {
        this.grid.clear();
    }

    /**
     * Get grid cell key for coordinates
     */
    getCellKey(x, y) {
        const cellX = Math.floor(x / this.cellSize);
        const cellY = Math.floor(y / this.cellSize);
        return `${cellX},${cellY}`;
    }

    /**
     * Get all cell keys that a segment occupies (for large segments)
     */
    getSegmentCells(segment, radius) {
        const cells = new Set();

        // Validate coordinates to prevent infinite loops
        if (!segment || !isFinite(segment.x) || !isFinite(segment.y) || !isFinite(radius)) {
            return cells;
        }

        const minX = Math.floor((segment.x - radius) / this.cellSize);
        const maxX = Math.floor((segment.x + radius) / this.cellSize);
        const minY = Math.floor((segment.y - radius) / this.cellSize);
        const maxY = Math.floor((segment.y + radius) / this.cellSize);

        // Safety check: prevent infinite loops with unreasonable bounds
        if (!isFinite(minX) || !isFinite(maxX) || !isFinite(minY) || !isFinite(maxY)) {
            return cells;
        }

        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                cells.add(`${x},${y}`);
            }
        }

        return cells;
    }

    /**
     * Add snake segments to spatial grid
     */
    addSnakeToGrid(snake) {
        if (!snake || !snake.isAlive) return;
        if (typeof snake.getSegments !== 'function') return;

        const segments = snake.getSegments();
        if (!segments || !Array.isArray(segments)) return;

        for (const segment of segments) {
            const cells = this.getSegmentCells(segment, CONFIG.SNAKE.SEGMENT_RADIUS);
            for (const cellKey of cells) {
                if (!this.grid.has(cellKey)) {
                    this.grid.set(cellKey, []);
                }
                this.grid.get(cellKey).push({ snake, segment });
            }
        }
    }

    /**
     * Build spatial grid from all snakes
     */
    buildGrid(snakes) {
        this.clearGrid();
        for (const snake of snakes) {
            if (snake && snake.isAlive) {
                this.addSnakeToGrid(snake);
            }
        }
    }

    /**
     * Get nearby snake segments for collision checking
     */
    getNearbySegments(x, y, radius) {
        const cells = this.getSegmentCells({ x, y }, radius);
        const nearby = new Set();

        for (const cellKey of cells) {
            const cellContents = this.grid.get(cellKey);
            if (cellContents) {
                for (const item of cellContents) {
                    nearby.add(item);
                }
            }
        }

        return Array.from(nearby);
    }

    /**
     * Check boundary collision
     */
    checkBoundaryCollision(head, worldSize, margin) {
        return (
            head.x < margin ||
            head.x > worldSize - margin ||
            head.y < margin ||
            head.y > worldSize - margin
        );
    }

    /**
     * Check collision between two points with radius
     */
    checkPointCollision(x1, y1, x2, y2, radius) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distSquared = dx * dx + dy * dy;
        const radiusSquared = radius * radius;
        return distSquared <= radiusSquared;
    }

    /**
     * Check if snake head collides with other snake bodies (optimized with spatial grid)
     * @param {Snake} snake - The snake to check
     * @param {Array<Snake>} allSnakes - All snakes for fallback
     * @returns {Snake|null} - The snake that was hit, or null
     */
    checkSnakeCollisions(snake, allSnakes) {
        if (!snake.isAlive) return null;

        const head = snake.getHead();
        const radius = CONFIG.SNAKE.SEGMENT_RADIUS * 2; // Check radius

        // Get nearby segments using spatial grid
        const nearby = this.getNearbySegments(head.x, head.y, radius);

        // Check collisions with nearby segments
        for (const { snake: otherSnake, segment } of nearby) {
            if (!otherSnake.isAlive) continue;

            // Skip own snake entirely (don't collide with self)
            if (snake.id === otherSnake.id) continue;

            // Check collision with this segment
            if (this.checkPointCollision(
                head.x, head.y,
                segment.x, segment.y,
                CONFIG.SNAKE.SEGMENT_RADIUS * 2
            )) {
                return otherSnake;
            }
        }

        return null;
    }

    /**
     * Check all snake collisions and return results
     * @param {Array<Snake>} snakes - All snakes
     * @returns {Array} - Array of collision events {snake, hitBy}
     */
    checkAllCollisions(snakes, worldSize) {
        const collisions = [];

        // Validate input
        if (!snakes) return collisions;

        const snakesArray = Array.isArray(snakes) ? snakes : Array.from(snakes);
        if (snakesArray.length === 0) return collisions;

        // Build spatial grid once for all collision checks
        this.buildGrid(snakesArray);

        // Check each snake
        for (const snake of snakesArray) {
            if (!snake || !snake.isAlive) continue;

            const head = snake.getHead ? snake.getHead() : null;
            if (!head) continue;

            // Check boundary collision
            if (this.checkBoundaryCollision(head, worldSize, CONFIG.SNAKE.SEGMENT_RADIUS)) {
                collisions.push({ snake, hitBy: null, type: 'boundary' });
                continue;
            }

            // Check snake-to-snake collision using spatial grid
            const hitSnake = this.checkSnakeCollisions(snake, snakesArray);
            if (hitSnake) {
                collisions.push({ snake, hitBy: hitSnake, type: 'snake' });
            }
        }

        return collisions;
    }

    /**
     * Check food collection for a snake (optimized with spatial grid)
     * @param {Snake} snake
     * @param {Array} foods
     * @returns {Array} - Collected foods
     */
    checkFoodCollections(snake, foods) {
        if (!snake || !snake.isAlive) return [];
        if (!foods || !Array.isArray(foods) || foods.length === 0) return [];

        const head = snake.getHead ? snake.getHead() : null;
        if (!head) return [];

        const collected = [];
        const collectionRadius = CONFIG.FOOD.COLLECTION_RADIUS;

        // Simple distance check for food (food count usually small)
        for (const food of foods) {
            const dist = MathUtils.distance(head.x, head.y, food.x, food.y);
            if (dist < collectionRadius) {
                collected.push(food);
            }
        }

        return collected;
    }

    /**
     * Get grid statistics for debugging
     */
    getGridStats() {
        let totalCells = 0;
        let totalItems = 0;
        let maxItems = 0;

        for (const [key, items] of this.grid.entries()) {
            totalCells++;
            totalItems += items.length;
            maxItems = Math.max(maxItems, items.length);
        }

        return {
            totalCells,
            totalItems,
            maxItems,
            avgItemsPerCell: totalCells > 0 ? (totalItems / totalCells).toFixed(2) : 0
        };
    }
}

// Export for ES6 modules (testing)
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = { CollisionManager };
}
