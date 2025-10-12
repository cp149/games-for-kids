import { StampEffect } from '../StampEffect.js';

/**
 * Frog stamp
 */
export class FrogStamp extends StampEffect {
    constructor() {
        super('frog', 'Frog', '🐸', 'Green frog', false);
    }

    draw(ctx, x, y, size) {
        ctx.save();

        const scale = size * 2;
        const frogColor = '#90EE90';

        // Body
        ctx.fillStyle = frogColor;
        ctx.beginPath();
        ctx.arc(x, y, scale * 0.35, 0, Math.PI * 2);
        ctx.fill();

        // Eyes (on top)
        ctx.fillStyle = frogColor;
        ctx.beginPath();
        ctx.arc(x - scale * 0.2, y - scale * 0.3, scale * 0.15, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x + scale * 0.2, y - scale * 0.3, scale * 0.15, 0, Math.PI * 2);
        ctx.fill();

        // Eye pupils
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(x - scale * 0.2, y - scale * 0.3, scale * 0.08, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x + scale * 0.2, y - scale * 0.3, scale * 0.08, 0, Math.PI * 2);
        ctx.fill();

        // Eye highlights
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x - scale * 0.18, y - scale * 0.33, scale * 0.03, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x + scale * 0.22, y - scale * 0.33, scale * 0.03, 0, Math.PI * 2);
        ctx.fill();

        // Mouth
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = scale * 0.04;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.arc(x, y + scale * 0.05, scale * 0.15, 0.2, Math.PI - 0.2);
        ctx.stroke();

        ctx.restore();
    }
}
