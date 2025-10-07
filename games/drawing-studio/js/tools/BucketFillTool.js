/**
 * Drawing Studio - Bucket Fill Tool
 * Flood fill algorithm for coloring regions
 */

import { Tool } from '../core/ToolSystem.js';

export class BucketFillTool extends Tool {
    constructor() {
        super('Bucket Fill', 1);
        this.tolerance = 10; // Color matching tolerance
    }

    /**
     * Start fill on click
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} x
     * @param {number} y
     */
    start(ctx, x, y) {
        this.fill(ctx, Math.floor(x), Math.floor(y));
    }

    /**
     * Flood fill at point
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} startX
     * @param {number} startY
     */
    fill(ctx, startX, startY) {
        const canvas = ctx.canvas;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        // Get target color at start point
        const startPos = (startY * canvas.width + startX) * 4;
        const targetColor = {
            r: pixels[startPos],
            g: pixels[startPos + 1],
            b: pixels[startPos + 2],
            a: pixels[startPos + 3]
        };

        // Parse fill color
        const fillColor = this.hexToRgb(this.color);

        // Check if already same color
        if (this.colorsMatch(targetColor, fillColor, 0)) {
            return; // Already filled
        }

        // Flood fill using stack-based algorithm
        const stack = [[startX, startY]];
        const visited = new Set();

        while (stack.length > 0) {
            const [x, y] = stack.pop();

            // Bounds check
            if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
                continue;
            }

            const key = `${x},${y}`;
            if (visited.has(key)) {
                continue;
            }
            visited.add(key);

            const pos = (y * canvas.width + x) * 4;
            const currentColor = {
                r: pixels[pos],
                g: pixels[pos + 1],
                b: pixels[pos + 2],
                a: pixels[pos + 3]
            };

            // Check if color matches target
            if (!this.colorsMatch(currentColor, targetColor, this.tolerance)) {
                continue;
            }

            // Fill pixel
            pixels[pos] = fillColor.r;
            pixels[pos + 1] = fillColor.g;
            pixels[pos + 2] = fillColor.b;
            pixels[pos + 3] = 255;

            // Add neighbors to stack
            stack.push([x + 1, y]);
            stack.push([x - 1, y]);
            stack.push([x, y + 1]);
            stack.push([x, y - 1]);
        }

        // Put modified image data back
        ctx.putImageData(imageData, 0, 0);
    }

    /**
     * Convert hex color to RGB
     * @param {string} hex
     * @returns {{r: number, g: number, b: number}}
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    /**
     * Check if two colors match within tolerance
     * @param {{r,g,b,a}} color1
     * @param {{r,g,b,a}} color2
     * @param {number} tolerance
     * @returns {boolean}
     */
    colorsMatch(color1, color2, tolerance) {
        return Math.abs(color1.r - color2.r) <= tolerance &&
               Math.abs(color1.g - color2.g) <= tolerance &&
               Math.abs(color1.b - color2.b) <= tolerance &&
               Math.abs(color1.a - (color2.a || 255)) <= tolerance;
    }

    /**
     * No continuous drawing for bucket fill
     */
    draw() {
        // Do nothing - fill happens on click only
    }
}
