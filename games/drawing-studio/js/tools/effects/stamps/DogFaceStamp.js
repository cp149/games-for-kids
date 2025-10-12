import { StampEffect } from '../StampEffect.js';

/**
 * Dog face stamp - super simple and cute
 */
export class DogFaceStamp extends StampEffect {
    constructor() {
        super('dogFace', 'Dog Face', '🐶', 'Super simple and cute', true);
    }

    draw(ctx, x, y, size) {
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
