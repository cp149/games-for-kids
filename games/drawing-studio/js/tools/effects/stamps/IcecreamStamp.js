import { StampEffect } from '../StampEffect.js';

/**
 * Ice cream stamp
 */
export class IcecreamStamp extends StampEffect {
    constructor() {
        super('icecream', 'Ice Cream', '🍦', 'Delicious ice cream', false);
    }

    draw(ctx, x, y, size) {
        ctx.save();

        const scale = size * 2;

        // Cone
        ctx.fillStyle = '#D2B48C';
        ctx.beginPath();
        ctx.moveTo(x, y + scale * 0.4);
        ctx.lineTo(x - scale * 0.2, y + scale * 0.05);
        ctx.lineTo(x + scale * 0.2, y + scale * 0.05);
        ctx.closePath();
        ctx.fill();

        // Cone pattern
        ctx.strokeStyle = '#8B7355';
        ctx.lineWidth = scale * 0.02;

        for (let i = 0; i < 3; i++) {
            const yPos = y + scale * 0.15 + i * scale * 0.1;
            ctx.beginPath();
            ctx.moveTo(x - scale * 0.15 + i * scale * 0.05, yPos);
            ctx.lineTo(x + scale * 0.15 - i * scale * 0.05, yPos);
            ctx.stroke();
        }

        // Ice cream scoops
        const scoopColors = ['#FFB6C1', '#87CEEB', '#FFD700'];
        const topColor = scoopColors[Math.floor(Math.random() * scoopColors.length)];
        const bottomColor = scoopColors[Math.floor(Math.random() * scoopColors.length)];

        // Bottom scoop
        ctx.fillStyle = bottomColor;
        ctx.beginPath();
        ctx.arc(x, y + scale * 0.05, scale * 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Top scoop
        ctx.fillStyle = topColor;
        ctx.beginPath();
        ctx.arc(x, y - scale * 0.15, scale * 0.18, 0, Math.PI * 2);
        ctx.fill();

        // Cherry on top
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(x, y - scale * 0.3, scale * 0.06, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
