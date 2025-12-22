/**
 * RenderManager
 * Handles all canvas rendering operations
 */

class RenderManager {
    constructor(canvasSize = 500, config = null) {
        // Use injected config or global CONFIG
        this.config = config || (typeof window !== 'undefined' ? window.CONFIG : require('../config.js'));

        this.canvasSize = canvasSize;
        this.cellSize = 0;
        this.dotRadius = this.config.GRID.DOT_RADIUS;
        this.grid = null;
    }

    /**
     * Set grid and calculate cell size
     */
    setGrid(grid) {
        this.grid = grid;
        this.cellSize = (this.canvasSize - this.config.GRID.GRID_PADDING * 2) / grid.size;
    }

    /**
     * Convert grid coordinates to screen position
     */
    getDotScreenPos(dot) {
        const padding = this.config.GRID.GRID_PADDING;
        return {
            x: padding + (dot.gridX + 0.5) * this.cellSize,
            y: padding + (dot.gridY + 0.5) * this.cellSize
        };
    }

    /**
     * Clear canvas with background color
     */
    clearCanvas(ctx) {
        ctx.fillStyle = this.config.COLORS.CANVAS_BG;
        ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);
    }

    /**
     * Draw grid lines
     */
    drawGridLines(ctx) {
        if (!this.grid) return;

        ctx.strokeStyle = this.config.COLORS.GRID_LINE;
        ctx.lineWidth = 1;

        const padding = this.config.GRID.GRID_PADDING;
        const gridSize = this.grid.size * this.cellSize;

        for (let i = 0; i <= this.grid.size; i++) {
            // Vertical lines
            ctx.beginPath();
            ctx.moveTo(padding + i * this.cellSize, padding);
            ctx.lineTo(padding + i * this.cellSize, padding + gridSize);
            ctx.stroke();

            // Horizontal lines
            ctx.beginPath();
            ctx.moveTo(padding, padding + i * this.cellSize);
            ctx.lineTo(padding + gridSize, padding + i * this.cellSize);
            ctx.stroke();
        }
    }

    /**
     * Draw possible connections (edges)
     */
    drawConnections(ctx) {
        if (!this.grid) return;

        ctx.strokeStyle = this.config.COLORS.GRID_LINE;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);

        this.grid.edges.forEach(edge => {
            const from = this.getDotScreenPos(edge.from);
            const to = this.getDotScreenPos(edge.to);

            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();
        });

        ctx.setLineDash([]);
    }

    /**
     * Draw path
     */
    drawPath(ctx, path, color) {
        if (!path || path.length < 2) return;

        ctx.strokeStyle = color;
        ctx.lineWidth = this.config.GRID.LINE_WIDTH;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        const start = this.getDotScreenPos(path[0]);
        ctx.moveTo(start.x, start.y);

        for (let i = 1; i < path.length; i++) {
            const pos = this.getDotScreenPos(path[i]);
            ctx.lineTo(pos.x, pos.y);
        }

        ctx.stroke();
    }

    /**
     * Draw dots
     */
    drawDots(ctx, side = 'player') {
        if (!this.grid) return;

        this.grid.dots.forEach(dot => {
            const pos = this.getDotScreenPos(dot);
            let radius = this.dotRadius;
            let fillColor = this.config.COLORS.NORMAL_DOT;
            let strokeColor = this.config.COLORS.NORMAL_DOT_BORDER;

            // Determine color based on type and state
            if (dot.type === this.config.DOT_TYPES.START) {
                fillColor = this.config.COLORS.START_DOT;
                strokeColor = this.config.COLORS.START_DOT;
                radius = this.dotRadius * 1.3;
            } else if (dot.type === this.config.DOT_TYPES.END) {
                fillColor = this.config.COLORS.END_DOT;
                strokeColor = this.config.COLORS.END_DOT;
                radius = this.dotRadius * 1.3;
            } else if (side === 'player' && dot.playerVisited) {
                fillColor = this.config.COLORS.VISITED_DOT;
                strokeColor = this.config.COLORS.VISITED_DOT;
            } else if (side === 'ai' && dot.aiVisited) {
                fillColor = this.config.COLORS.AI_VISITED_DOT;
                strokeColor = this.config.COLORS.AI_VISITED_DOT;
            }

            // Draw dot
            ctx.fillStyle = fillColor;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 3;

            ctx.beginPath();
            ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });
    }

    /**
     * Draw pheromones (AI visualization)
     * @param {CanvasRenderingContext2D} ctx
     * @param {Map} pheromones - Map of edge keys to pheromone levels
     * @param {Function} getEdgeKeyFn - Function to get edge key
     */
    drawPheromones(ctx, pheromones, getEdgeKeyFn) {
        if (!this.grid || !pheromones) return;

        ctx.lineWidth = 4;

        this.grid.edges.forEach(edge => {
            const key = getEdgeKeyFn(edge.from, edge.to);
            const level = pheromones.get(key) || 0;

            // Map pheromone level to alpha (0.1 to 0.6)
            const alpha = Math.max(0.1, Math.min(0.6, level * 0.1));

            ctx.strokeStyle = `rgba(255, 152, 0, ${alpha})`;

            const from = this.getDotScreenPos(edge.from);
            const to = this.getDotScreenPos(edge.to);

            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();
        });
    }

    /**
     * Destroy and cleanup
     */
    destroy() {
        this.grid = null;
    }
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RenderManager;
}

// Make available globally for browser
if (typeof window !== 'undefined') {
    window.RenderManager = RenderManager;
}
