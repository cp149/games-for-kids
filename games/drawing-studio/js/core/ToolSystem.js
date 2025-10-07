/**
 * Drawing Studio - Tool System
 * Base Tool class and tool implementations (Brush, Eraser)
 */

/**
 * Base Tool Class
 * All drawing tools extend this class
 */
export class Tool {
    constructor(name, sizes = { small: 3, medium: 8, large: 15 }) {
        this.name = name;
        this.sizes = sizes;
        this.currentSize = 'medium';
        this.color = '#000000';
    }

    /**
     * Set tool size
     * @param {string} size - 'small', 'medium', or 'large'
     */
    setSize(size) {
        if (this.sizes[size]) {
            this.currentSize = size;
            console.log(`${this.name} size set to ${size} (${this.getLineWidth()}px)`);
        }
    }

    /**
     * Get current line width
     * @returns {number}
     */
    getLineWidth() {
        return this.sizes[this.currentSize];
    }

    /**
     * Set tool color
     * @param {string} color
     */
    setColor(color) {
        this.color = color;
    }

    /**
     * Configure canvas context for this tool
     * @param {CanvasRenderingContext2D} ctx
     */
    configureContext(ctx) {
        ctx.lineWidth = this.getLineWidth();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
    }

    /**
     * Start drawing
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} x
     * @param {number} y
     */
    start(ctx, x, y) {
        this.configureContext(ctx);
        // Draw a dot for single clicks
        ctx.beginPath();
        ctx.arc(x, y, this.getLineWidth() / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Continue drawing
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} fromX
     * @param {number} fromY
     * @param {number} toX
     * @param {number} toY
     */
    draw(ctx, fromX, fromY, toX, toY) {
        this.configureContext(ctx);
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();
    }

    /**
     * End drawing
     */
    end() {
        // Override in subclasses if needed
    }
}

/**
 * Brush Tool
 * Standard drawing brush
 */
export class BrushTool extends Tool {
    constructor() {
        super('Brush', {
            small: 3,
            medium: 8,
            large: 15
        });
    }
}

/**
 * Eraser Tool
 * Removes drawn content
 */
export class EraserTool extends Tool {
    constructor() {
        super('Eraser', {
            small: 10,
            medium: 20,
            large: 40
        });
    }

    /**
     * Configure context for erasing
     * @param {CanvasRenderingContext2D} ctx
     */
    configureContext(ctx) {
        ctx.lineWidth = this.getLineWidth();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        // Use globalCompositeOperation to erase
        ctx.globalCompositeOperation = 'destination-out';
    }

    /**
     * Start erasing
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} x
     * @param {number} y
     */
    start(ctx, x, y) {
        this.configureContext(ctx);
        ctx.beginPath();
        ctx.arc(x, y, this.getLineWidth() / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Continue erasing
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} fromX
     * @param {number} fromY
     * @param {number} toX
     * @param {number} toY
     */
    draw(ctx, fromX, fromY, toX, toY) {
        this.configureContext(ctx);
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();
    }

    /**
     * Reset composite operation after erasing
     * @param {CanvasRenderingContext2D} ctx
     */
    end(ctx) {
        ctx.globalCompositeOperation = 'source-over';
    }
}

/**
 * Tool Manager
 * Manages available tools and active tool
 */
export class ToolManager {
    constructor() {
        this.tools = new Map();
        this.activeTool = null;

        // Register default tools
        this.registerTool('brush', new BrushTool());
        this.registerTool('eraser', new EraserTool());

        // Set brush as default
        this.setActiveTool('brush');
    }

    /**
     * Register a new tool
     * @param {string} id
     * @param {Tool} tool
     */
    registerTool(id, tool) {
        this.tools.set(id, tool);
        console.log(`Tool registered: ${id} (${tool.name})`);
    }

    /**
     * Set active tool
     * @param {string} id
     * @returns {boolean}
     */
    setActiveTool(id) {
        if (this.tools.has(id)) {
            this.activeTool = this.tools.get(id);
            console.log(`Active tool: ${id} (${this.activeTool.name})`);
            return true;
        }
        console.error(`Tool not found: ${id}`);
        return false;
    }

    /**
     * Get active tool
     * @returns {Tool}
     */
    getActiveTool() {
        return this.activeTool;
    }

    /**
     * Set tool size
     * @param {string} size
     */
    setSize(size) {
        if (this.activeTool) {
            this.activeTool.setSize(size);
        }
    }

    /**
     * Set tool color
     * @param {string} color
     */
    setColor(color) {
        if (this.activeTool) {
            this.activeTool.setColor(color);
        }
    }

    /**
     * Get list of available tools
     * @returns {Array<{id: string, name: string}>}
     */
    getAvailableTools() {
        return Array.from(this.tools.entries()).map(([id, tool]) => ({
            id,
            name: tool.name
        }));
    }
}
