import { MagicEffect } from '../MagicEffect.js';

/**
 * Star effect - random colored stars
 */
export class StarEffect extends MagicEffect {
    constructor() {
        super('star', 'Star', '⭐', 'Random colored stars');
    }

    /**
     * Generate a random vibrant color (including metallic colors)
     */
    getRandomStarColor() {
        // 20% chance for metallic colors (gold, silver, etc)
        if (Math.random() < 0.2) {
            const metallics = [
                '#C0C0C0', // Silver
                '#E8E8E8', // Bright silver
                '#FFD700', // Gold
                '#FFA500', // Orange gold
                '#FFDF00', // Golden yellow
                '#E5E4E2', // Platinum
                '#B87333'  // Copper
            ];
            return metallics[Math.floor(Math.random() * metallics.length)];
        }

        // 80% chance for regular vibrant colors
        const hue = Math.floor(Math.random() * 360);
        const saturation = 80 + Math.floor(Math.random() * 20); // 80-100%
        const lightness = 50 + Math.floor(Math.random() * 20);  // 50-70%
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

    /**
     * Get color variation based on base color with random shifts
     */
    getColorVariation(baseColor) {
        // Convert hex to RGB
        const hexToRgb = (hex) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        };

        const rgb = hexToRgb(baseColor);
        if (!rgb) return baseColor;

        // Convert RGB to HSL for better color manipulation
        const r = rgb.r / 255;
        const g = rgb.g / 255;
        const b = rgb.b / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }

        // Add random variation to hue (±30 degrees), saturation and lightness
        h = (h + (Math.random() - 0.5) * 0.08) % 1; // ±30 degrees
        s = Math.max(0.5, Math.min(1, s + (Math.random() - 0.5) * 0.3)); // Keep vibrant
        l = Math.max(0.4, Math.min(0.7, l + (Math.random() - 0.5) * 0.2));

        return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
    }

    draw(ctx, x, y, size, color) {
        ctx.save();

        // Always use random color for more amazing effect
        const starColor = this.getRandomStarColor();

        // Draw 5-pointed star
        const spikes = 5;
        const outerRadius = size * 1.5;
        const innerRadius = size * 0.6;

        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI / spikes) - Math.PI / 2;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;

            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();

        // Fill star with solid color
        ctx.fillStyle = starColor;
        ctx.fill();

        // Add glow effect
        ctx.shadowColor = starColor;
        ctx.shadowBlur = size * 1.2;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.fill();

        ctx.restore();
    }

    getSpacingMultiplier() {
        return 3.5;
    }
}
