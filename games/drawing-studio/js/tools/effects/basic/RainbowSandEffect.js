import { MagicEffect } from '../MagicEffect.js';

/**
 * Rainbow sand effect - colorful sand particles
 */
export class RainbowSandEffect extends MagicEffect {
    constructor() {
        super('rainbowSand', 'Rainbow Sand', '🌈🏖️', 'Colorful sand particles');
    }

    draw(ctx, x, y, size) {
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

    getSpacingMultiplier() {
        return 3.5;
    }
}
