/**
 * Cloud Effect - Draws fluffy cloud shapes
 */

import { MagicEffect } from './MagicEffect.js';

export class CloudEffect extends MagicEffect {
    constructor() {
        super('cloud', 'Cloud', '☁️', 'Fluffy clouds');
    }

    /**
     * Draw a simple cute cloud - classic cartoon style
     */
    draw(ctx, x, y, size, color) {
        ctx.save();

        const s = size * 1.6;

        // Convert color to RGB
        let r = 255, g = 255, b = 255;
        if (color && color.startsWith('#')) {
            r = parseInt(color.slice(1, 3), 16);
            g = parseInt(color.slice(3, 5), 16);
            b = parseInt(color.slice(5, 7), 16);
        }

        // Make color lighter for cloud effect (pastel)
        const lightR = Math.min(255, r + (255 - r) * 0.6);
        const lightG = Math.min(255, g + (255 - g) * 0.6);
        const lightB = Math.min(255, b + (255 - b) * 0.6);

        // Even lighter for edge
        const edgeR = Math.min(255, r + (255 - r) * 0.8);
        const edgeG = Math.min(255, g + (255 - g) * 0.8);
        const edgeB = Math.min(255, b + (255 - b) * 0.8);

        // Draw cloud with slight gradient for depth
        const puffs = [
            { x: -0.6, y: 0, r: 0.5 },      // Left
            { x: 0.6, y: 0, r: 0.5 },       // Right
            { x: -0.3, y: -0.35, r: 0.55 }, // Top left
            { x: 0.3, y: -0.35, r: 0.55 },  // Top right
            { x: 0, y: -0.2, r: 0.65 }      // Center (biggest)
        ];

        puffs.forEach(puff => {
            const gradient = ctx.createRadialGradient(
                x + puff.x * s - s * puff.r * 0.2,
                y + puff.y * s - s * puff.r * 0.2,
                0,
                x + puff.x * s,
                y + puff.y * s,
                s * puff.r
            );

            gradient.addColorStop(0, `rgb(${lightR}, ${lightG}, ${lightB})`);
            gradient.addColorStop(0.7, `rgba(${lightR}, ${lightG}, ${lightB}, 0.95)`);
            gradient.addColorStop(1, `rgba(${edgeR}, ${edgeG}, ${edgeB}, 0.6)`);

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x + puff.x * s, y + puff.y * s, s * puff.r, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }

    /**
     * Clouds need more spacing between draws
     */
    getSpacingMultiplier() {
        return 3.0; // Wide spacing for distinct clouds
    }
}
