import { MagicEffect } from '../MagicEffect.js';

/**
 * Coin effect - beautiful glowing gems and crystals
 */
export class CoinEffect extends MagicEffect {
    constructor() {
        super('coin', 'Gem', '💎', 'Glowing gems and crystals');
        this.hue = 0;
    }

    /**
     * Draw diamond shape
     */
    drawDiamond(ctx, x, y, size) {
        ctx.moveTo(x, y - size);
        ctx.lineTo(x + size * 0.6, y);
        ctx.lineTo(x, y + size);
        ctx.lineTo(x - size * 0.6, y);
        ctx.closePath();
    }

    /**
     * Draw hexagon shape
     */
    drawHexagon(ctx, x, y, size) {
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI / 3);
            const px = x + Math.cos(angle) * size;
            const py = y + Math.sin(angle) * size;
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
    }

    /**
     * Draw 8-pointed star
     */
    drawGemStar(ctx, x, y, size) {
        const spikes = 8;
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? size : size * 0.5;
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
    }

    /**
     * Draw flower shape
     */
    drawFlower(ctx, x, y, size) {
        const petals = 6;
        for (let i = 0; i < petals; i++) {
            const angle = (i * Math.PI * 2 / petals);
            const petalX = x + Math.cos(angle) * size * 0.7;
            const petalY = y + Math.sin(angle) * size * 0.7;

            ctx.ellipse(petalX, petalY, size * 0.4, size * 0.2, angle, 0, Math.PI * 2);
        }
        // Center circle
        ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
    }

    /**
     * Get gem colors based on base color with random variations
     */
    getGemColors(baseColor) {
        if (!baseColor) {
            // Random vibrant colors with sparkle
            this.hue = (this.hue + Math.random() * 30 + 5) % 360;
            return {
                base: `hsl(${this.hue}, 90%, 60%)`,
                light: `hsl(${this.hue}, 100%, 80%)`,
                dark: `hsl(${this.hue}, 80%, 40%)`,
                hue: this.hue
            };
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
        if (!rgb) {
            this.hue = (this.hue + Math.random() * 30 + 5) % 360;
            return {
                base: `hsl(${this.hue}, 90%, 60%)`,
                light: `hsl(${this.hue}, 100%, 80%)`,
                dark: `hsl(${this.hue}, 80%, 40%)`,
                hue: this.hue
            };
        }

        // Use base color with random variations
        const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
        const hueShift = (Math.random() - 0.5) * 40; // ±20

        return {
            base: `rgb(${Math.max(0, Math.min(255, rgb.r * randomFactor + hueShift))}, ${Math.max(0, Math.min(255, rgb.g * randomFactor + hueShift))}, ${Math.max(0, Math.min(255, rgb.b * randomFactor + hueShift))})`,
            light: `rgb(${Math.min(255, rgb.r + 60 + Math.random() * 40)}, ${Math.min(255, rgb.g + 60 + Math.random() * 40)}, ${Math.min(255, rgb.b + 60 + Math.random() * 40)})`,
            dark: `rgb(${Math.max(0, rgb.r - 40 - Math.random() * 40)}, ${Math.max(0, rgb.g - 40 - Math.random() * 40)}, ${Math.max(0, rgb.b - 40 - Math.random() * 40)})`,
            hue: 0
        };
    }

    draw(ctx, x, y, size, color) {
        ctx.save();

        // Create beautiful gem/crystal shapes
        const shapes = ['diamond', 'hexagon', 'star', 'flower'];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];

        // Get colors - always use random for amazing effect
        const colors = this.getGemColors(null);
        const baseColor = colors.base;
        const lightColor = colors.light;
        const darkColor = colors.dark;

        const radius = size * 1.5;

        // Draw different gem shapes
        ctx.beginPath();
        if (shape === 'diamond') {
            this.drawDiamond(ctx, x, y, radius);
        } else if (shape === 'hexagon') {
            this.drawHexagon(ctx, x, y, radius);
        } else if (shape === 'star') {
            this.drawGemStar(ctx, x, y, radius);
        } else {
            this.drawFlower(ctx, x, y, radius);
        }

        // Multi-layer gradient for depth
        const gradient = ctx.createRadialGradient(
            x - radius * 0.3, y - radius * 0.3, 0,
            x, y, radius * 1.2
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(0.2, lightColor);
        gradient.addColorStop(0.6, baseColor);
        gradient.addColorStop(1, darkColor);

        ctx.fillStyle = gradient;
        ctx.fill();

        // Sparkling outline
        ctx.strokeStyle = colors.hue ? `hsl(${colors.hue}, 100%, 90%)` : lightColor;
        ctx.lineWidth = size * 0.1;
        ctx.shadowColor = baseColor;
        ctx.shadowBlur = radius * 0.8;
        ctx.stroke();

        // Add inner sparkles
        for (let i = 0; i < 3; i++) {
            const sparkleX = x + (Math.random() - 0.5) * radius * 0.8;
            const sparkleY = y + (Math.random() - 0.5) * radius * 0.8;
            const sparkleSize = Math.random() * radius * 0.2 + radius * 0.1;

            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2);
            ctx.fill();
        }

        // Outer glow
        ctx.shadowColor = baseColor;
        ctx.shadowBlur = radius * 1.5;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.fill();

        ctx.restore();
    }

    getSpacingMultiplier() {
        return 3.5;
    }
}
