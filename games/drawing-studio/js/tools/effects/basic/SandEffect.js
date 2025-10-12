import { MagicEffect } from '../MagicEffect.js';

/**
 * Sand effect - fine sand particles with customizable color
 */
export class SandEffect extends MagicEffect {
    constructor() {
        super('sand', 'Sand', '🏖️', 'Fine sand particles');
    }

    draw(ctx, x, y, size, color) {
        ctx.save();

        // Get current color from tool system
        const currentColor = color || '#F4E4BC';

        // Convert hex to RGB for color variations
        const hexToRgb = (hex) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        };

        const baseRgb = hexToRgb(currentColor);
        if (!baseRgb) return;

        // Number of sand particles scales with brush size
        const particleCount = Math.floor(size * 5 + Math.random() * size * 3);

        for (let i = 0; i < particleCount; i++) {
            // Random position within brush area
            const scatterRadius = size * 1.5;
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * scatterRadius;

            const particleX = x + Math.cos(angle) * distance;
            const particleY = y + Math.sin(angle) * distance;

            // Fine sand particle size - much smaller, scales with brush size
            const minSize = Math.max(0.5, size * 0.05);
            const maxSize = Math.max(1.5, size * 0.15);
            const particleSize = Math.random() * (maxSize - minSize) + minSize;

            // Create color variations based on selected color
            const colorVariation = 0.15; // 15% variation
            const r = Math.max(0, Math.min(255, baseRgb.r + (Math.random() - 0.5) * 255 * colorVariation));
            const g = Math.max(0, Math.min(255, baseRgb.g + (Math.random() - 0.5) * 255 * colorVariation));
            const b = Math.max(0, Math.min(255, baseRgb.b + (Math.random() - 0.5) * 255 * colorVariation));

            // Create sand grain with slight transparency
            const alpha = 0.3 + Math.random() * 0.5; // 0.3 to 0.8
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;

            // Draw circular sand grain
            ctx.beginPath();
            ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
            ctx.fill();
        }

        // Add some concentrated sand in the center
        const centerCount = Math.floor(size * 2 + Math.random() * size);
        for (let i = 0; i < centerCount; i++) {
            const centerRadius = size * 0.5;
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * centerRadius;

            const particleX = x + Math.cos(angle) * distance;
            const particleY = y + Math.sin(angle) * distance;

            // Very fine particles in center
            const particleSize = Math.random() * 1 + 0.3;

            // Higher opacity in center
            const alpha = 0.5 + Math.random() * 0.4;
            ctx.fillStyle = `rgba(${baseRgb.r}, ${baseRgb.g}, ${baseRgb.b}, ${alpha})`;

            ctx.beginPath();
            ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
            ctx.fill();
        }

        // Add falling sand effect with finer particles
        const fallingCount = Math.floor(size * 1.5 + Math.random() * size);
        for (let i = 0; i < fallingCount; i++) {
            // Particles fall in a downward direction
            const fallX = x + (Math.random() - 0.5) * size;
            const fallY = y + Math.random() * size * 2 + size * 0.5;
            const fallSize = Math.random() * 1 + 0.2;

            // Create slight color variation for falling particles
            const r = Math.max(0, Math.min(255, baseRgb.r + (Math.random() - 0.5) * 30));
            const g = Math.max(0, Math.min(255, baseRgb.g + (Math.random() - 0.5) * 30));
            const b = Math.max(0, Math.min(255, baseRgb.b + (Math.random() - 0.5) * 30));

            const fallAlpha = 0.15 + Math.random() * 0.25; // More transparent
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${fallAlpha})`;

            ctx.beginPath();
            ctx.arc(fallX, fallY, fallSize, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    getSpacingMultiplier() {
        return 3.5;
    }
}
