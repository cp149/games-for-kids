import { StampEffect } from '../StampEffect.js';

/**
 * Lightning stamp - colorful lightning bolts
 */
export class LightningStamp extends StampEffect {
    constructor() {
        super('lightning', 'Lightning', '⚡', 'Electric lightning bolts', false);
    }

    draw(ctx, x, y, size) {
        ctx.save();

        const scale = size * 2;

        // Random lightning colors - electric/vibrant colors
        const lightningColors = [
            { main: '#FFFF00', glow: '#FFD700' }, // Yellow
            { main: '#00FFFF', glow: '#00CED1' }, // Cyan
            { main: '#FF00FF', glow: '#FF69B4' }, // Magenta
            { main: '#FFFFFF', glow: '#E0E0E0' }, // White
            { main: '#FFA500', glow: '#FF8C00' }, // Orange
            { main: '#7FFF00', glow: '#32CD32' }, // Chartreuse
            { main: '#FF1493', glow: '#FF69B4' }, // Deep Pink
            { main: '#00FF00', glow: '#00FA9A' }, // Green
            { main: '#1E90FF', glow: '#4169E1' }, // Dodger Blue
            { main: '#FFD700', glow: '#FFA500' }  // Gold
        ];
        const colorScheme = lightningColors[Math.floor(Math.random() * lightningColors.length)];

        // Draw lightning bolt shape (classic zigzag like ⚡ emoji)
        // Main body path
        const points = [
            { x: x + scale * 0.15, y: y - scale * 0.5 },        // Top right
            { x: x - scale * 0.05, y: y - scale * 0.1 },        // Left middle top
            { x: x + scale * 0.1, y: y - scale * 0.08 },        // Right middle
            { x: x - scale * 0.2, y: y + scale * 0.5 },         // Bottom left
            { x: x + scale * 0.05, y: y + scale * 0.05 },       // Middle bottom
            { x: x - scale * 0.05, y: y + scale * 0.03 },       // Left middle bottom
            { x: x + scale * 0.2, y: y - scale * 0.45 }         // Back to top
        ];

        // Outer glow layer
        ctx.shadowColor = colorScheme.glow;
        ctx.shadowBlur = scale * 0.6;
        ctx.fillStyle = colorScheme.glow;
        ctx.strokeStyle = colorScheme.glow;
        ctx.lineWidth = scale * 0.12;
        ctx.lineJoin = 'miter';
        ctx.lineCap = 'butt';

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();
        ctx.fill();

        // Main lightning color
        ctx.shadowBlur = scale * 0.4;
        ctx.fillStyle = colorScheme.main;
        ctx.strokeStyle = colorScheme.main;
        ctx.lineWidth = scale * 0.06;

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();
        ctx.fill();

        // Inner bright core (white highlights)
        ctx.shadowBlur = scale * 0.3;
        ctx.fillStyle = '#FFFFFF';

        // Top half highlight
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(points[1].x, points[1].y);
        ctx.lineTo(points[2].x - scale * 0.05, points[2].y);
        ctx.lineTo(points[6].x - scale * 0.08, points[6].y);
        ctx.closePath();
        ctx.fill();

        // Add electric sparkles
        ctx.shadowBlur = scale * 0.4;
        for (let i = 0; i < 6; i++) {
            const sparkleX = x + (Math.random() - 0.5) * scale * 0.5;
            const sparkleY = y + (Math.random() - 0.5) * scale * 0.8;
            const sparkleSize = Math.random() * scale * 0.06 + scale * 0.03;

            ctx.fillStyle = colorScheme.main;
            ctx.beginPath();
            ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2);
            ctx.fill();
        }

        // Add white hot spots
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        for (let i = 0; i < 3; i++) {
            const hotX = x + (Math.random() - 0.5) * scale * 0.3;
            const hotY = y + (Math.random() - 0.5) * scale * 0.6;
            const hotSize = Math.random() * scale * 0.04 + scale * 0.02;

            ctx.beginPath();
            ctx.arc(hotX, hotY, hotSize, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}
