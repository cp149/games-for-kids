import { MagicEffect } from '../MagicEffect.js';

/**
 * Firework effect - explosion effect
 */
export class FireworkEffect extends MagicEffect {
    constructor() {
        super('firework', 'Firework', '🎆', 'Explosion effect');
    }

    /**
     * Get color palette based on base color with random variations
     */
    getColorPalette(baseColor) {
        if (!baseColor) {
            // Default rainbow palette
            return ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#9400D3'];
        }

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
        if (!rgb) return ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#9400D3'];

        // Generate palette with random variations around base color
        const palette = [];
        for (let i = 0; i < 6; i++) {
            // Random brightness factor
            const brightnessFactor = 0.7 + Math.random() * 0.7; // 0.7 to 1.4

            // Random hue shift in RGB space
            const hueShift = (Math.random() - 0.5) * 60; // ±30 per channel

            const r = Math.max(0, Math.min(255, rgb.r * brightnessFactor + hueShift));
            const g = Math.max(0, Math.min(255, rgb.g * brightnessFactor + hueShift));
            const b = Math.max(0, Math.min(255, rgb.b * brightnessFactor + hueShift));

            palette.push(`rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`);
        }
        return palette;
    }

    draw(ctx, x, y, size, color) {
        ctx.save();

        // Draw explosion particles - always use rainbow palette for amazing effect
        const particleCount = 12;
        const colors = this.getColorPalette(null);

        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = size * 1.5;
            const px = x + Math.cos(angle) * distance;
            const py = y + Math.sin(angle) * distance;

            const gradient = ctx.createRadialGradient(px, py, 0, px, py, size * 0.5);
            const particleColor = colors[i % colors.length];
            gradient.addColorStop(0, particleColor);
            gradient.addColorStop(1, particleColor + '00');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(px, py, size * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw center burst
        const centerGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        centerGradient.addColorStop(0, '#FFFFFF');
        centerGradient.addColorStop(0.5, '#FFFF00');
        centerGradient.addColorStop(1, '#FF000000');

        ctx.fillStyle = centerGradient;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    getSpacingMultiplier() {
        return 3.5;
    }
}
