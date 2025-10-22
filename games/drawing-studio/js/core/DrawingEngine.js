/**
 * Drawing Studio - Drawing Engine
 * Core drawing functionality and canvas management
 */

import { getCoords } from '../utils/helpers.js';
import { ToolManager } from './ToolSystem.js';
import { HistoryManager } from './HistoryManager.js';
import { SymmetryManager } from './SymmetryManager.js';

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
        this.symmetryManager = new SymmetryManager(this.canvas);

        // Create overlay canvas for symmetry guides
        this.createOverlayCanvas();

        // Initial overlay update
        this.updateOverlay();

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
     * Create overlay canvas for symmetry guides
     */
    createOverlayCanvas() {
        this.overlayCanvas = document.createElement('canvas');
        this.overlayCanvas.width = this.canvas.width;
        this.overlayCanvas.height = this.canvas.height;
        this.overlayCanvas.style.position = 'absolute';
        this.overlayCanvas.style.top = '0';
        this.overlayCanvas.style.left = '0';
        this.overlayCanvas.style.pointerEvents = 'none';
        this.overlayCanvas.style.zIndex = '100';
        this.overlayCanvas.style.background = 'transparent';
        this.overlayCanvas.id = 'symmetry-overlay';

        this.overlayCtx = this.overlayCanvas.getContext('2d', { alpha: true });

        // Insert overlay into canvas wrapper
        const wrapper = this.canvas.parentNode;
        wrapper.appendChild(this.overlayCanvas);
    }

    /**
     * Update overlay (symmetry guides)
     */
    updateOverlay() {
        this.overlayCtx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
        this.symmetryManager.drawGuides(this.overlayCtx);
        console.log('Overlay updated: enabled =', this.symmetryManager.enabled, ', mode =', this.symmetryManager.mode);
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

        // Apply symmetry (skip for bucket fill tool)
        if (tool.name === 'Bucket Fill') {
            tool.start(this.ctx, x, y);
        } else {
            const points = this.symmetryManager.getSymmetricalPoints(x, y);
            for (const point of points) {
                tool.start(this.ctx, point.x, point.y);
            }
        }
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

        // Apply symmetry (skip for bucket fill tool)
        if (tool.name === 'Bucket Fill') {
            tool.draw(this.ctx, this.lastX, this.lastY, x, y);
        } else {
            const currentPoints = this.symmetryManager.getSymmetricalPoints(x, y);
            const lastPoints = this.symmetryManager.getSymmetricalPoints(this.lastX, this.lastY);

            for (let i = 0; i < currentPoints.length; i++) {
                tool.draw(
                    this.ctx,
                    lastPoints[i].x,
                    lastPoints[i].y,
                    currentPoints[i].x,
                    currentPoints[i].y
                );
            }
        }

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
     * Load image with draggable resize handles
     * @param {Image} img - Image object
     * @returns {Promise}
     */
    async loadImageWithResizeHandles(img) {
        // Save current state
        this.saveState();

        // Initial size: fit to canvas
        const canvasAspect = this.canvas.width / this.canvas.height;
        const imgAspect = img.width / img.height;

        let width, height;
        if (imgAspect > canvasAspect) {
            width = this.canvas.width;
            height = this.canvas.width / imgAspect;
        } else {
            height = this.canvas.height;
            width = this.canvas.height * imgAspect;
        }

        const x = (this.canvas.width - width) / 2;
        const y = (this.canvas.height - height) / 2;

        // Image bounds
        const bounds = { x, y, width, height };

        // Create resize overlay
        this.createResizeOverlay(img, bounds);
    }

    /**
     * Create resize overlay with corner handles
     * @param {Image} img - Image to resize
     * @param {object} bounds - Initial bounds {x, y, width, height}
     */
    createResizeOverlay(img, bounds) {
        // Create overlay layer
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.zIndex = '1000';
        overlay.style.background = 'rgba(0,0,0,0.3)';
        overlay.id = 'resize-overlay';

        // Create image preview canvas
        const previewCanvas = document.createElement('canvas');
        previewCanvas.width = this.canvas.width;
        previewCanvas.height = this.canvas.height;
        previewCanvas.style.position = 'absolute';
        previewCanvas.style.top = '0';
        previewCanvas.style.left = '0';
        previewCanvas.style.pointerEvents = 'auto';
        previewCanvas.style.cursor = 'default';
        const previewCtx = previewCanvas.getContext('2d');

        overlay.appendChild(previewCanvas);

        // Create corner handles
        const handleSize = 20;
        const corners = ['nw', 'ne', 'sw', 'se'];
        const handles = {};

        corners.forEach(corner => {
            const handle = document.createElement('div');
            handle.className = 'resize-handle';
            handle.dataset.corner = corner;
            handle.style.position = 'absolute';
            handle.style.width = handleSize + 'px';
            handle.style.height = handleSize + 'px';
            handle.style.background = '#4ECDC4';
            handle.style.border = '2px solid white';
            handle.style.borderRadius = '50%';
            handle.style.cursor = corner + '-resize';
            handle.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
            handle.style.zIndex = '20';
            handle.style.pointerEvents = 'auto';
            overlay.appendChild(handle);
            handles[corner] = handle;
        });

        // Create confirm button
        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = '✓ Confirm';
        confirmBtn.style.position = 'absolute';
        confirmBtn.style.bottom = '20px';
        confirmBtn.style.left = '50%';
        confirmBtn.style.transform = 'translateX(-50%)';
        confirmBtn.style.padding = '12px 30px';
        confirmBtn.style.fontSize = '18px';
        confirmBtn.style.background = '#4ECDC4';
        confirmBtn.style.color = 'white';
        confirmBtn.style.border = 'none';
        confirmBtn.style.borderRadius = '8px';
        confirmBtn.style.cursor = 'pointer';
        confirmBtn.style.fontWeight = 'bold';
        confirmBtn.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        confirmBtn.style.zIndex = '10';
        confirmBtn.style.pointerEvents = 'auto';
        overlay.appendChild(confirmBtn);

        // Render function
        const render = () => {
            previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

            // Draw current canvas content first (so existing images are visible)
            previewCtx.drawImage(this.canvas, 0, 0);

            // Draw new image on top
            previewCtx.drawImage(img, bounds.x, bounds.y, bounds.width, bounds.height);

            // Update handle positions
            handles.nw.style.left = bounds.x - handleSize / 2 + 'px';
            handles.nw.style.top = bounds.y - handleSize / 2 + 'px';
            handles.ne.style.left = (bounds.x + bounds.width) - handleSize / 2 + 'px';
            handles.ne.style.top = bounds.y - handleSize / 2 + 'px';
            handles.sw.style.left = bounds.x - handleSize / 2 + 'px';
            handles.sw.style.top = (bounds.y + bounds.height) - handleSize / 2 + 'px';
            handles.se.style.left = (bounds.x + bounds.width) - handleSize / 2 + 'px';
            handles.se.style.top = (bounds.y + bounds.height) - handleSize / 2 + 'px';
        };

        // Initial render
        render();

        // Drag handling
        let dragCorner = null;
        let isDraggingImage = false;
        let dragStartX = 0;
        let dragStartY = 0;
        let initialBounds = null;

        const handleMouseDown = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;

            const canvasX = (e.clientX - rect.left) * scaleX;
            const canvasY = (e.clientY - rect.top) * scaleY;

            if (e.target.classList.contains('resize-handle')) {
                // Dragging corner handle
                dragCorner = e.target.dataset.corner;
                dragStartX = e.clientX;
                dragStartY = e.clientY;
                initialBounds = { ...bounds };
                e.preventDefault();
            } else if (canvasX >= bounds.x && canvasX <= bounds.x + bounds.width &&
                       canvasY >= bounds.y && canvasY <= bounds.y + bounds.height) {
                // Dragging image itself
                isDraggingImage = true;
                dragStartX = e.clientX;
                dragStartY = e.clientY;
                initialBounds = { ...bounds };
                previewCanvas.style.cursor = 'move';
                e.preventDefault();
            }
        };

        const handleMouseMove = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;

            const dx = e.clientX - dragStartX;
            const dy = e.clientY - dragStartY;
            const scaledDx = dx * scaleX;
            const scaledDy = dy * scaleY;

            if (dragCorner) {
                // Resize via corner handle
                switch (dragCorner) {
                    case 'nw':
                        bounds.x = initialBounds.x + scaledDx;
                        bounds.y = initialBounds.y + scaledDy;
                        bounds.width = initialBounds.width - scaledDx;
                        bounds.height = initialBounds.height - scaledDy;
                        break;
                    case 'ne':
                        bounds.y = initialBounds.y + scaledDy;
                        bounds.width = initialBounds.width + scaledDx;
                        bounds.height = initialBounds.height - scaledDy;
                        break;
                    case 'sw':
                        bounds.x = initialBounds.x + scaledDx;
                        bounds.width = initialBounds.width - scaledDx;
                        bounds.height = initialBounds.height + scaledDy;
                        break;
                    case 'se':
                        bounds.width = initialBounds.width + scaledDx;
                        bounds.height = initialBounds.height + scaledDy;
                        break;
                }

                // Enforce minimum size
                if (bounds.width < 50) bounds.width = 50;
                if (bounds.height < 50) bounds.height = 50;

                render();
            } else if (isDraggingImage) {
                // Move image
                bounds.x = initialBounds.x + scaledDx;
                bounds.y = initialBounds.y + scaledDy;
                render();
            } else {
                // Update cursor when hovering over image
                const canvasX = (e.clientX - rect.left) * scaleX;
                const canvasY = (e.clientY - rect.top) * scaleY;

                if (canvasX >= bounds.x && canvasX <= bounds.x + bounds.width &&
                    canvasY >= bounds.y && canvasY <= bounds.y + bounds.height) {
                    previewCanvas.style.cursor = 'move';
                } else {
                    previewCanvas.style.cursor = 'default';
                }
            }
        };

        const handleMouseUp = () => {
            dragCorner = null;
            isDraggingImage = false;
            previewCanvas.style.cursor = 'default';
        };

        // Confirm button
        confirmBtn.addEventListener('click', () => {
            // Draw to main canvas
            this.ctx.drawImage(img, bounds.x, bounds.y, bounds.width, bounds.height);
            this.saveState();

            // Remove overlay
            overlay.remove();

            // Cleanup
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        });

        // Attach events
        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        // Add to DOM
        this.canvas.parentElement.appendChild(overlay);
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

    /**
     * Toggle symmetry mode
     * @param {string} mode - 'mirror', 'quad', or 'kaleidoscope'
     */
    toggleSymmetry(mode) {
        this.symmetryManager.toggle(mode);
        this.updateOverlay();
    }

    /**
     * Get current symmetry mode
     * @returns {string}
     */
    getSymmetryMode() {
        return this.symmetryManager.mode;
    }

    /**
     * Check if symmetry is enabled
     * @returns {boolean}
     */
    isSymmetryEnabled() {
        return this.symmetryManager.enabled;
    }
}
