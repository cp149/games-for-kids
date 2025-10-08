/**
 * Magic Brush Tool - Special effects brushes
 */

import { Tool } from '../core/ToolSystem.js';

export class MagicBrush extends Tool {
    constructor() {
        super('Magic Brush', 12); // Default 12px for magic effects
        this.currentEffect = 'rainbow'; // rainbow, star, firework
        this.hue = 0; // For rainbow effect
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
     * Switch magic effect
     */
    setEffect(effect) {
        this.currentEffect = effect;
        console.log(`Magic effect changed to: ${effect}`);
    }

    /**
     * Get current effect name
     */
    getEffectName() {
        const names = {
            rainbow: '🌈 Rainbow',
            firework: '🎆 Firework',
            star: '⭐ Star'
        };
        return names[this.currentEffect] || 'Rainbow';
    }

    /**
     * Start drawing with magic effect
     */
    start(ctx, x, y) {
        this.drawEffect(ctx, x, y, this.lineWidth);
    }

    /**
     * Continue drawing with magic effect
     */
    draw(ctx, fromX, fromY, toX, toY) {
        // Calculate distance between points
        const dx = toX - fromX;
        const dy = toY - fromY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Different interpolation for star effect (less dense)
        let stepMultiplier = this.currentEffect === 'star' ? 2.0 : 0.3;

        // Interpolate points for smooth line (no gaps when drawing fast)
        const steps = Math.max(1, Math.ceil(distance / (this.lineWidth * stepMultiplier)));

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = fromX + dx * t;
            const y = fromY + dy * t;
            this.drawEffect(ctx, x, y, this.lineWidth);
        }
    }

    /**
     * Draw with current magic effect
     */
    drawEffect(ctx, x, y, size) {
        switch (this.currentEffect) {
            case 'rainbow':
                this.drawRainbow(ctx, x, y, size);
                break;
            case 'firework':
                this.drawFirework(ctx, x, y, size);
                break;
            case 'star':
                this.drawStar(ctx, x, y, size);
                break;
            default:
                this.drawRainbow(ctx, x, y, size);
        }
    }

    /**
     * Rainbow brush - colors cycle through spectrum with smooth gradients
     */
    drawRainbow(ctx, x, y, size) {
        ctx.save();

        // Slowly cycle hue from 0 to 360 (smoother color transition)
        this.hue = (this.hue + 0.8) % 360;

        // Draw multiple layered gradients for smoother effect
        const layers = 3;

        for (let i = 0; i < layers; i++) {
            const layerSize = size * (1 - i * 0.2);
            const hueOffset = i * 20;
            const alphaBase = 0.4 - i * 0.1;

            // Create smooth radial gradient
            const gradient = ctx.createRadialGradient(
                x, y, 0,
                x, y, layerSize
            );

            // Multi-stop gradient for smoother color blending
            gradient.addColorStop(0, `hsla(${(this.hue + hueOffset) % 360}, 100%, 65%, ${alphaBase})`);
            gradient.addColorStop(0.3, `hsla(${(this.hue + hueOffset + 15) % 360}, 95%, 60%, ${alphaBase * 0.8})`);
            gradient.addColorStop(0.6, `hsla(${(this.hue + hueOffset + 35) % 360}, 90%, 55%, ${alphaBase * 0.5})`);
            gradient.addColorStop(0.85, `hsla(${(this.hue + hueOffset + 60) % 360}, 85%, 50%, ${alphaBase * 0.2})`);
            gradient.addColorStop(1, `hsla(${(this.hue + hueOffset + 90) % 360}, 80%, 45%, 0)`);

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, layerSize, 0, Math.PI * 2);
            ctx.fill();
        }

        // Add soft glow effect
        ctx.globalCompositeOperation = 'lighter';
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 1.3);
        glowGradient.addColorStop(0, `hsla(${this.hue}, 100%, 70%, 0.15)`);
        glowGradient.addColorStop(0.5, `hsla(${(this.hue + 45) % 360}, 100%, 65%, 0.08)`);
        glowGradient.addColorStop(1, `hsla(${(this.hue + 90) % 360}, 100%, 60%, 0)`);

        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x, y, size * 1.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();
    }

    /**
     * Firework brush - explosion effect
     */
    drawFirework(ctx, x, y, size) {
        ctx.save();

        // Draw explosion particles
        const particleCount = 12;
        const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#9400D3'];

        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = size * 1.5;
            const px = x + Math.cos(angle) * distance;
            const py = y + Math.sin(angle) * distance;

            const gradient = ctx.createRadialGradient(px, py, 0, px, py, size * 0.5);
            const color = colors[i % colors.length];
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, color + '00');

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

    /**
     * Star brush - random colored stars (no connecting lines)
     */
    drawStar(ctx, x, y, size) {
        ctx.save();

        // Generate a completely random color for each star
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
}
