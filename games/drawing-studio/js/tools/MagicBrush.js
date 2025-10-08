/**
 * Magic Brush Tool - Special effects brushes
 */

import { Tool } from '../core/ToolSystem.js';

export class MagicBrush extends Tool {
    constructor() {
        super('Magic Brush', 12); // Default 12px for magic effects
        this.currentEffect = 'rainbow'; // rainbow, star, firework, coin
        this.hue = 0; // For rainbow effect
        this.coinRotation = 0; // For coin animation
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
            star: '⭐ Star',
            coin: '💎 Gem'
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

        // Different interpolation for star and gem effects (less dense)
        let stepMultiplier = (this.currentEffect === 'star' || this.currentEffect === 'coin') ? 2.0 : 0.3;

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
            case 'coin':
                this.drawCoin(ctx, x, y, size);
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

    /**
     * Coin brush - beautiful glowing gems and crystals
     */
    drawCoin(ctx, x, y, size) {
        ctx.save();

        // Create beautiful gem/crystal shapes
        const shapes = ['diamond', 'hexagon', 'star', 'flower'];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        
        // Random vibrant colors with sparkle
        this.hue = (this.hue + Math.random() * 30 + 5) % 360;
        const baseColor = `hsl(${this.hue}, 90%, 60%)`;
        const lightColor = `hsl(${this.hue}, 100%, 80%)`;
        const darkColor = `hsl(${this.hue}, 80%, 40%)`;

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
        ctx.strokeStyle = `hsl(${this.hue}, 100%, 90%)`;
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
}
