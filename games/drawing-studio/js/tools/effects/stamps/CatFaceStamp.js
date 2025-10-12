import { StampEffect } from '../StampEffect.js';

/**
 * Cat face stamp - super cute round style
 */
export class CatFaceStamp extends StampEffect {
    constructor() {
        super('catFace', 'Cat Face', '🐱', 'Super cute cat face', true);
    }

    draw(ctx, x, y, size) {
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
}
