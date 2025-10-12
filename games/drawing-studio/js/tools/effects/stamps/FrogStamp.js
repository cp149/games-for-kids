import { StampEffect } from '../StampEffect.js';

/**
 * Frog stamp
 */
export class FrogStamp extends StampEffect {
    constructor() {
        super('frog', 'Frog', '🐸', 'Colorful frogs', false);
    }

    draw(ctx, x, y, size) {
        ctx.save();

        const scale = size * 2;

        // Random vibrant frog colors - frogs can be many colors!
        const frogColors = [
            '#90EE90', // Light green (classic)
            '#3CB371', // Medium sea green
            '#32CD32', // Lime green
            '#00CED1', // Dark turquoise (blue frog)
            '#FFD700', // Gold (golden frog)
            '#FF6347', // Tomato (red frog)
            '#FF69B4', // Hot pink (pink frog)
            '#9370DB', // Medium purple (purple frog)
            '#FFA500', // Orange (orange frog)
            '#87CEEB'  // Sky blue (blue frog)
        ];
        const frogColor = frogColors[Math.floor(Math.random() * frogColors.length)];

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
