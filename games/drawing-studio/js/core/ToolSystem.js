/**
 * Drawing Studio - Tool System
 * Base Tool class and tool implementations (Brush, Eraser)
 */

/**
 * Base Tool Class
 * All drawing tools extend this class
 */
export class Tool {
    constructor(name, defaultWidth = 8) {
        this.name = name;
        this.lineWidth = defaultWidth;
        this.color = '#000000';
    }

    /**
     * Set line width directly
     * @param {number} width - Line width in pixels
     */
    setLineWidth(width) {
        this.lineWidth = Math.max(1, Math.min(50, width)); // Clamp between 1-50
        console.log(`${this.name} line width set to ${this.lineWidth}px`);
    }

    /**
     * Get current line width
     * @returns {number}
     */
    getLineWidth() {
        return this.lineWidth;
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
        super('Brush', 8); // Default 8px
    }
}

/**
 * Eraser Tool
 * Removes drawn content
 */
export class EraserTool extends Tool {
    constructor() {
        super('Eraser', 20); // Default 20px
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
     * Set tool line width
     * @param {number} width
     */
    setLineWidth(width) {
        if (this.activeTool) {
            this.activeTool.setLineWidth(width);
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
