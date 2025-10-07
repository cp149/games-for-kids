/**
 * Drawing Studio - Drawing Engine
 * Core drawing functionality and canvas management
 */

import { getCoords } from '../utils/helpers.js';
import { ToolManager } from './ToolSystem.js';
import { HistoryManager } from './HistoryManager.js';

export class DrawingEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error(`Canvas element not found: ${canvasId}`);
        }

        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;

        // Initialize systems
        this.toolManager = new ToolManager();
        this.historyManager = new HistoryManager(10);

        // Color palette (12 kid-friendly colors)
        this.colorPalette = [
            '#FF6B6B', // Red
            '#4ECDC4', // Cyan
            '#45B7D1', // Blue
            '#FFA07A', // Orange
            '#98D8C8', // Mint
            '#F7DC6F', // Yellow
            '#BB8FCE', // Purple
            '#85C1E2', // Sky Blue
            '#F8B500', // Gold
            '#52B788', // Green
            '#FF6B9D', // Pink
            '#95A5A6'  // Gray
        ];

        this.currentColor = this.colorPalette[0];
        this.toolManager.setColor(this.currentColor);

        // Bind event handlers
        this.handleStart = this.handleStart.bind(this);
        this.handleMove = this.handleMove.bind(this);
        this.handleEnd = this.handleEnd.bind(this);

        // Set up event listeners
        this.setupEventListeners();

        // Save initial blank state
        this.saveState();

        console.log('DrawingEngine initialized');
        console.log(`Canvas size: ${this.canvas.width}x${this.canvas.height}`);
    }

    /**
     * Set up canvas event listeners
     */
    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', this.handleStart);
        this.canvas.addEventListener('mousemove', this.handleMove);
        this.canvas.addEventListener('mouseup', this.handleEnd);
        this.canvas.addEventListener('mouseout', this.handleEnd);

        // Touch events
        this.canvas.addEventListener('touchstart', this.handleStart, { passive: false });
        this.canvas.addEventListener('touchmove', this.handleMove, { passive: false });
        this.canvas.addEventListener('touchend', this.handleEnd);
        this.canvas.addEventListener('touchcancel', this.handleEnd);

        // Prevent context menu on long press
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        console.log('Event listeners set up');
    }

    /**
     * Handle drawing start
     * @param {Event} e
     */
    handleStart(e) {
        this.isDrawing = true;
        const { x, y } = getCoords(e, this.canvas);
        this.lastX = x;
        this.lastY = y;

        const tool = this.toolManager.getActiveTool();
        tool.start(this.ctx, x, y);
    }

    /**
     * Handle drawing movement
     * @param {Event} e
     */
    handleMove(e) {
        if (!this.isDrawing) return;
        e.preventDefault(); // Prevent scrolling on mobile

        const { x, y } = getCoords(e, this.canvas);
        const tool = this.toolManager.getActiveTool();
        tool.draw(this.ctx, this.lastX, this.lastY, x, y);

        this.lastX = x;
        this.lastY = y;
    }

    /**
     * Handle drawing end
     */
    handleEnd() {
        if (this.isDrawing) {
            this.isDrawing = false;

            const tool = this.toolManager.getActiveTool();
            if (tool.end) {
                tool.end(this.ctx);
            }

            // Save state after drawing
            this.saveState();
        }
    }

    /**
     * Set active tool
     * @param {string} toolId
     */
    setTool(toolId) {
        return this.toolManager.setActiveTool(toolId);
    }

    /**
     * Set tool line width
     * @param {number} width - Line width in pixels (1-50)
     */
    setLineWidth(width) {
        this.toolManager.setLineWidth(width);
    }

    /**
     * Set drawing color
     * @param {string} color
     */
    setColor(color) {
        this.currentColor = color;
        this.toolManager.setColor(color);
        console.log(`Color set to: ${color}`);
    }

    /**
     * Clear canvas
     */
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.saveState();
        console.log('Canvas cleared');
    }

    /**
     * Undo last action
     * @returns {Promise<boolean>}
     */
    async undo() {
        return await this.historyManager.undo(this.canvas, this.ctx);
    }

    /**
     * Redo last undone action
     * @returns {Promise<boolean>}
     */
    async redo() {
        return await this.historyManager.redo(this.canvas, this.ctx);
    }

    /**
     * Check if undo is available
     * @returns {boolean}
     */
    canUndo() {
        return this.historyManager.canUndo();
    }

    /**
     * Check if redo is available
     * @returns {boolean}
     */
    canRedo() {
        return this.historyManager.canRedo();
    }

    /**
     * Save current state to history
     */
    saveState() {
        this.historyManager.saveState(this.canvas);
    }

    /**
     * Get color palette
     * @returns {string[]}
     */
    getColorPalette() {
        return this.colorPalette;
    }

    /**
     * Get current color
     * @returns {string}
     */
    getCurrentColor() {
        return this.currentColor;
    }

    /**
     * Get available tools
     * @returns {Array<{id: string, name: string}>}
     */
    getAvailableTools() {
        return this.toolManager.getAvailableTools();
    }

    /**
     * Get active tool info
     * @returns {object}
     */
    getActiveToolInfo() {
        const tool = this.toolManager.getActiveTool();
        return {
            name: tool.name,
            lineWidth: tool.getLineWidth(),
            color: tool.color
        };
    }

    /**
     * Export canvas as data URL
     * @param {string} type - Image type (default: 'image/png')
     * @returns {string}
     */
    export(type = 'image/png') {
        return this.canvas.toDataURL(type);
    }

    /**
     * Get debug info
     * @returns {object}
     */
    getDebugInfo() {
        return {
            canvas: {
                width: this.canvas.width,
                height: this.canvas.height
            },
            tool: this.getActiveToolInfo(),
            history: this.historyManager.getStateInfo(),
            isDrawing: this.isDrawing
        };
    }

    /**
     * Get canvas as data URL
     * @param {string} type - Image type (default: 'image/png')
     * @param {number} quality - Image quality for JPEG (0-1)
     * @returns {string}
     */
    getDataURL(type = 'image/png', quality = 0.95) {
        return this.canvas.toDataURL(type, quality);
    }

    /**
     * Generate thumbnail
     * @param {number} maxSize - Maximum width/height in pixels
     * @returns {string} Thumbnail data URL
     */
    generateThumbnail(maxSize = 200) {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        // Calculate thumbnail dimensions (preserve aspect ratio)
        const scale = Math.min(maxSize / this.canvas.width, maxSize / this.canvas.height);
        tempCanvas.width = Math.floor(this.canvas.width * scale);
        tempCanvas.height = Math.floor(this.canvas.height * scale);

        // Draw scaled image
        tempCtx.drawImage(this.canvas, 0, 0, tempCanvas.width, tempCanvas.height);

        // Return as JPEG for smaller size
        return tempCanvas.toDataURL('image/jpeg', 0.7);
    }

    /**
     * Load image data onto canvas
     * @param {string} dataURL - Image data URL
     * @returns {Promise<void>}
     */
    async loadFromDataURL(dataURL) {
        return new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = () => {
                // Clear canvas
                this.clear();

                // Draw image
                this.ctx.drawImage(img, 0, 0);

                // Save state
                this.saveState();

                console.log('Image loaded onto canvas');
                resolve();
            };

            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };

            img.src = dataURL;
        });
    }

    /**
     * Download canvas as PNG file
     * @param {string} filename - Filename (without extension)
     */
    downloadAsPNG(filename = 'artwork') {
        const dataURL = this.canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = dataURL;
        link.click();
        console.log(`Downloaded: ${filename}.png`);
    }

    /**
     * Check if canvas is blank
     * @returns {boolean}
     */
    isCanvasBlank() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;

        // Check if all pixels are white or transparent
        for (let i = 0; i < data.length; i += 4) {
            // Check if pixel is not white (255,255,255) and not transparent (alpha = 0)
            if (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255 || data[i + 3] !== 0) {
                return false;
            }
        }
        return true;
    }
}
