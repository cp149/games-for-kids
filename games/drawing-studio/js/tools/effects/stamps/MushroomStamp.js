import { StampEffect } from '../StampEffect.js';

/**
 * Mushroom stamp
 */
export class MushroomStamp extends StampEffect {
    constructor() {
        super('mushroom', 'Mushroom', '🍄', 'Cute mushroom', false);
    }

    draw(ctx, x, y, size) {
        ctx.save();

        const scale = size * 2;

        // Stem
        ctx.fillStyle = '#F5F5DC';
        ctx.beginPath();
        ctx.roundRect(x - scale * 0.1, y, scale * 0.2, scale * 0.35, scale * 0.05);
        ctx.fill();

        // Cap
        ctx.fillStyle = '#FF6B6B';
        ctx.beginPath();
        ctx.arc(x, y, scale * 0.35, 0, Math.PI, true);
        ctx.fill();

        // White spots on cap
        ctx.fillStyle = '#FFFFFF';
        const spots = [
            { x: x, y: y - scale * 0.2, r: scale * 0.08 },
            { x: x - scale * 0.2, y: y - scale * 0.1, r: scale * 0.06 },
            { x: x + scale * 0.18, y: y - scale * 0.12, r: scale * 0.05 },
            { x: x - scale * 0.1, y: y - scale * 0.25, r: scale * 0.04 },
            { x: x + scale * 0.08, y: y - scale * 0.28, r: scale * 0.04 }
        ];

        spots.forEach(spot => {
            ctx.beginPath();
            ctx.arc(spot.x, spot.y, spot.r, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }
}
