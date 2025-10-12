import { StampEffect } from '../StampEffect.js';

/**
 * Heart stamp
 */
export class HeartStamp extends StampEffect {
    constructor() {
        super('heart', 'Heart', '❤️', 'Colorful heart', false);
    }

    draw(ctx, x, y, size) {
        ctx.save();

        const scale = size * 2;
        const hue = Math.random() * 360;
        const heartColor = `hsl(${hue}, 85%, 65%)`;

        ctx.fillStyle = heartColor;
        ctx.beginPath();
        ctx.moveTo(x, y + scale * 0.3);
        ctx.bezierCurveTo(x, y + scale * 0.1, x - scale * 0.5, y - scale * 0.3, x, y - scale * 0.1);
        ctx.bezierCurveTo(x + scale * 0.5, y - scale * 0.3, x, y + scale * 0.1, x, y + scale * 0.3);
        ctx.fill();

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(x - scale * 0.15, y - scale * 0.05, scale * 0.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
