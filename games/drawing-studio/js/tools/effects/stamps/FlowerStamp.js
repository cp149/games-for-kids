import { StampEffect } from '../StampEffect.js';

/**
 * Flower stamp - cute flower
 */
export class FlowerStamp extends StampEffect {
    constructor() {
        super('flower', 'Flower', '🌸', 'Cute flower', false);
    }

    draw(ctx, x, y, size) {
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
}
