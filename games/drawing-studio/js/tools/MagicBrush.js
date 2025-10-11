/**
 * Magic Brush Tool - Special effects brushes
 */

import { Tool } from '../core/ToolSystem.js';

export class MagicBrush extends Tool {
    constructor() {
        super('Magic Brush', 12); // Default 12px for magic effects
        this.currentEffect = 'rainbow'; // rainbow, star, firework, coin, sand, rainbowSand, butterfly, flower, catFace, dogFace
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
            coin: '💎 Gem',
            sand: '🏖️ Sand',
            rainbowSand: '🌈🏖️ Rainbow Sand',
            butterfly: '🦋 Butterfly',
            flower: '🌸 Flower',
            catFace: '🐱 Cat Face',
            dogFace: '🐶 Dog Face'
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

        // Stamps should be more sparse - bigger multiplier = more spacing
        const isStamp = ['star', 'coin', 'sand', 'rainbowSand', 'butterfly', 'flower', 'catFace', 'dogFace'].includes(this.currentEffect);
        // Butterfly needs even more spacing due to its wing span
        const isBigStamp = ['butterfly', 'catFace', 'dogFace'].includes(this.currentEffect);
        let stepMultiplier = isBigStamp ? 5.0 : (isStamp ? 3.5 : 0.3);

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
            case 'sand':
                this.drawSand(ctx, x, y, size);
                break;
            case 'rainbowSand':
                this.drawRainbowSand(ctx, x, y, size);
                break;
            case 'butterfly':
                this.drawButterfly(ctx, x, y, size);
                break;
            case 'flower':
                this.drawFlowerStamp(ctx, x, y, size);
                break;
            case 'catFace':
                this.drawCatFace(ctx, x, y, size);
                break;
            case 'dogFace':
                this.drawDogFace(ctx, x, y, size);
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

    /**
     * Sand brush - fine sand particles with customizable color
     */
    drawSand(ctx, x, y, size) {
        ctx.save();

        // Get current color from tool system
        const currentColor = this.color || '#F4E4BC';
        
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

    /**
     * Rainbow sand brush - colorful sand particles
     */
    drawRainbowSand(ctx, x, y, size) {
        ctx.save();

        // Rainbow colors for sand
        const rainbowColors = [
            '#FF0000', // Red
            '#FF7F00', // Orange
            '#FFFF00', // Yellow
            '#00FF00', // Green
            '#0000FF', // Blue
            '#4B0082', // Indigo
            '#9400D3', // Violet
            '#FF69B4', // Hot Pink
            '#00CED1', // Dark Turquoise
            '#FFD700', // Gold
            '#FF1493', // Deep Pink
            '#32CD32', // Lime Green
            '#FF4500', // Orange Red
            '#1E90FF', // Dodger Blue
            '#FF00FF', // Magenta
            '#00FFFF', // Cyan
            '#FFA500', // Orange
            '#ADFF2F', // Green Yellow
            '#FF6347', // Tomato
            '#7FFF00'  // Chartreuse
        ];

        // Number of sand particles scales with brush size
        const particleCount = Math.floor(size * 6 + Math.random() * size * 4);
        
        for (let i = 0; i < particleCount; i++) {
            // Random position within brush area
            const scatterRadius = size * 1.5;
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * scatterRadius;
            
            const particleX = x + Math.cos(angle) * distance;
            const particleY = y + Math.sin(angle) * distance;

            // Fine sand particle size - scales with brush size
            const minSize = Math.max(0.5, size * 0.05);
            const maxSize = Math.max(1.8, size * 0.18);
            const particleSize = Math.random() * (maxSize - minSize) + minSize;
            
            // Pick random rainbow color for each particle
            const particleColor = rainbowColors[Math.floor(Math.random() * rainbowColors.length)];
            
            // Convert to RGB for slight variations
            const hexToRgb = (hex) => {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                } : null;
            };
            
            const rgb = hexToRgb(particleColor);
            if (!rgb) continue;
            
            // Add slight variation to make it more natural
            const variation = 0.1;
            const r = Math.max(0, Math.min(255, rgb.r + (Math.random() - 0.5) * 255 * variation));
            const g = Math.max(0, Math.min(255, rgb.g + (Math.random() - 0.5) * 255 * variation));
            const b = Math.max(0, Math.min(255, rgb.b + (Math.random() - 0.5) * 255 * variation));
            
            // Create sand grain with transparency
            const alpha = 0.4 + Math.random() * 0.5; // 0.4 to 0.9
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            
            // Draw circular sand grain
            ctx.beginPath();
            ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
            ctx.fill();
        }

        // Add concentrated colorful sand in center
        const centerCount = Math.floor(size * 3 + Math.random() * size * 2);
        for (let i = 0; i < centerCount; i++) {
            const centerRadius = size * 0.6;
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * centerRadius;
            
            const particleX = x + Math.cos(angle) * distance;
            const particleY = y + Math.sin(angle) * distance;
            
            // Slightly larger particles in center
            const particleSize = Math.random() * 1.2 + 0.4;
            
            // Pick vibrant color
            const particleColor = rainbowColors[Math.floor(Math.random() * rainbowColors.length)];
            
            // Higher opacity in center
            const alpha = 0.6 + Math.random() * 0.4;
            ctx.fillStyle = particleColor + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            
            ctx.beginPath();
            ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
            ctx.fill();
        }

        // Add falling rainbow sand effect
        const fallingCount = Math.floor(size * 2 + Math.random() * size * 1.5);
        for (let i = 0; i < fallingCount; i++) {
            // Particles fall in a downward direction
            const fallX = x + (Math.random() - 0.5) * size;
            const fallY = y + Math.random() * size * 2.5 + size * 0.5;
            const fallSize = Math.random() * 1.2 + 0.3;
            
            // Random rainbow color for falling particles
            const fallColor = rainbowColors[Math.floor(Math.random() * rainbowColors.length)];
            const fallAlpha = 0.2 + Math.random() * 0.3;
            
            ctx.fillStyle = fallColor + Math.floor(fallAlpha * 255).toString(16).padStart(2, '0');
            ctx.beginPath();
            ctx.arc(fallX, fallY, fallSize, 0, Math.PI * 2);
            ctx.fill();
        }

        // Add some sparkles for magical effect
        const sparkleCount = Math.floor(size * 0.5 + Math.random() * 3);
        for (let i = 0; i < sparkleCount; i++) {
            const sparkleX = x + (Math.random() - 0.5) * size * 2;
            const sparkleY = y + (Math.random() - 0.5) * size * 2;
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(sparkleX, sparkleY, 0.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    /**
     * Butterfly stamp - colorful butterfly
     */
    drawButterfly(ctx, x, y, size) {
        ctx.save();

        const scale = size * 2;

        // Random vibrant colors for wings
        const hue = Math.random() * 360;
        const wingColor1 = `hsl(${hue}, 85%, 60%)`;
        const wingColor2 = `hsl(${(hue + 30) % 360}, 85%, 65%)`;
        const bodyColor = '#2C1810';

        // Body
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.ellipse(x, y, scale * 0.15, scale * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Left upper wing
        ctx.fillStyle = wingColor1;
        ctx.beginPath();
        ctx.ellipse(x - scale * 0.4, y - scale * 0.2, scale * 0.35, scale * 0.5, -Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();

        // Right upper wing
        ctx.beginPath();
        ctx.ellipse(x + scale * 0.4, y - scale * 0.2, scale * 0.35, scale * 0.5, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();

        // Left lower wing
        ctx.fillStyle = wingColor2;
        ctx.beginPath();
        ctx.ellipse(x - scale * 0.35, y + scale * 0.3, scale * 0.25, scale * 0.35, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // Right lower wing
        ctx.beginPath();
        ctx.ellipse(x + scale * 0.35, y + scale * 0.3, scale * 0.25, scale * 0.35, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // Wing patterns
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(x - scale * 0.4, y - scale * 0.2, scale * 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + scale * 0.4, y - scale * 0.2, scale * 0.12, 0, Math.PI * 2);
        ctx.fill();

        // Antennae
        ctx.strokeStyle = bodyColor;
        ctx.lineWidth = scale * 0.05;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(x, y - scale * 0.35);
        ctx.lineTo(x - scale * 0.15, y - scale * 0.55);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x, y - scale * 0.35);
        ctx.lineTo(x + scale * 0.15, y - scale * 0.55);
        ctx.stroke();

        // Antenna tips
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.arc(x - scale * 0.15, y - scale * 0.55, scale * 0.06, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + scale * 0.15, y - scale * 0.55, scale * 0.06, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * Flower stamp - cute flower
     */
    drawFlowerStamp(ctx, x, y, size) {
        ctx.save();

        const scale = size * 2;

        // Random petal color
        const hue = Math.random() * 360;
        const petalColor = `hsl(${hue}, 80%, 65%)`;
        const centerColor = '#FFD700';

        // Draw petals
        const petalCount = 5;
        const petalRadius = scale * 0.3;

        for (let i = 0; i < petalCount; i++) {
            const angle = (i * Math.PI * 2 / petalCount) - Math.PI / 2;
            const petalX = x + Math.cos(angle) * scale * 0.35;
            const petalY = y + Math.sin(angle) * scale * 0.35;

            ctx.fillStyle = petalColor;
            ctx.beginPath();
            ctx.ellipse(petalX, petalY, petalRadius, petalRadius * 0.6, angle, 0, Math.PI * 2);
            ctx.fill();

            // Petal highlights
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.ellipse(petalX, petalY, petalRadius * 0.4, petalRadius * 0.3, angle, 0, Math.PI * 2);
            ctx.fill();
        }

        // Center
        ctx.fillStyle = centerColor;
        ctx.beginPath();
        ctx.arc(x, y, scale * 0.25, 0, Math.PI * 2);
        ctx.fill();

        // Center details
        ctx.fillStyle = '#FFA500';
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * scale * 0.15;
            const dotX = x + Math.cos(angle) * dist;
            const dotY = y + Math.sin(angle) * dist;

            ctx.beginPath();
            ctx.arc(dotX, dotY, scale * 0.05, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    /**
     * Cat face stamp - super cute round style
     */
    drawCatFace(ctx, x, y, size) {
        ctx.save();

        const scale = size * 2;

        // Random pastel colors
        const catColors = ['#FFB6C1', '#FFD700', '#FFA07A', '#98D8C8', '#DDA0DD'];
        const faceColor = catColors[Math.floor(Math.random() * catColors.length)];

        // Main face circle
        ctx.fillStyle = faceColor;
        ctx.beginPath();
        ctx.arc(x, y, scale * 0.45, 0, Math.PI * 2);
        ctx.fill();

        // Round ears (half circles on top)
        ctx.beginPath();
        ctx.arc(x - scale * 0.28, y - scale * 0.32, scale * 0.18, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x + scale * 0.28, y - scale * 0.32, scale * 0.18, 0, Math.PI * 2);
        ctx.fill();

        // Inner ear pink
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.arc(x - scale * 0.28, y - scale * 0.32, scale * 0.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x + scale * 0.28, y - scale * 0.32, scale * 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Simple dot eyes
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(x - scale * 0.15, y - scale * 0.05, scale * 0.06, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x + scale * 0.15, y - scale * 0.05, scale * 0.06, 0, Math.PI * 2);
        ctx.fill();

        // Simple round nose
        ctx.fillStyle = '#FF69B4';
        ctx.beginPath();
        ctx.arc(x, y + scale * 0.08, scale * 0.05, 0, Math.PI * 2);
        ctx.fill();

        // Simple smile - just curves
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = scale * 0.04;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.arc(x - scale * 0.08, y + scale * 0.16, scale * 0.08, 0.3, Math.PI - 0.3);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x + scale * 0.08, y + scale * 0.16, scale * 0.08, 0.3, Math.PI - 0.3);
        ctx.stroke();

        // Simple rosy cheeks
        ctx.fillStyle = 'rgba(255, 105, 180, 0.3)';
        ctx.beginPath();
        ctx.arc(x - scale * 0.28, y + scale * 0.08, scale * 0.08, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x + scale * 0.28, y + scale * 0.08, scale * 0.08, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * Dog face stamp - super simple and cute
     */
    drawDogFace(ctx, x, y, size) {
        ctx.save();

        const scale = size * 2;

        // Random pastel dog colors
        const dogColors = ['#F4A460', '#DEB887', '#D2B48C', '#FFE4B5', '#FFDAB9'];
        const faceColor = dogColors[Math.floor(Math.random() * dogColors.length)];

        // Main face circle
        ctx.fillStyle = faceColor;
        ctx.beginPath();
        ctx.arc(x, y, scale * 0.45, 0, Math.PI * 2);
        ctx.fill();

        // Simple round floppy ears
        ctx.beginPath();
        ctx.arc(x - scale * 0.42, y - scale * 0.1, scale * 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x + scale * 0.42, y - scale * 0.1, scale * 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Simple dot eyes
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(x - scale * 0.15, y - scale * 0.08, scale * 0.06, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x + scale * 0.15, y - scale * 0.08, scale * 0.06, 0, Math.PI * 2);
        ctx.fill();

        // Simple round nose
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(x, y + scale * 0.1, scale * 0.08, 0, Math.PI * 2);
        ctx.fill();

        // Simple smile - just a curve
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = scale * 0.04;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.arc(x, y + scale * 0.18, scale * 0.12, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // Pink tongue
        ctx.fillStyle = '#FF69B4';
        ctx.beginPath();
        ctx.arc(x, y + scale * 0.28, scale * 0.06, 0, Math.PI * 2);
        ctx.fill();

        // Simple rosy cheeks
        ctx.fillStyle = 'rgba(255, 105, 180, 0.3)';
        ctx.beginPath();
        ctx.arc(x - scale * 0.28, y + scale * 0.1, scale * 0.08, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x + scale * 0.28, y + scale * 0.1, scale * 0.08, 0, Math.PI * 2);
        ctx.fill();

        // Optional spot on head
        if (Math.random() > 0.6) {
            ctx.fillStyle = 'rgba(139, 69, 19, 0.3)';
            ctx.beginPath();
            ctx.arc(x + scale * 0.15, y - scale * 0.3, scale * 0.12, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}
