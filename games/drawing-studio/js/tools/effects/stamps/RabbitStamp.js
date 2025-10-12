import { StampEffect } from '../StampEffect.js';

/**
 * Rabbit stamp
 */
export class RabbitStamp extends StampEffect {
    constructor() {
        super('rabbit', 'Rabbit', '🐰', 'Cute rabbit', true);
    }

    draw(ctx, x, y, size) {
        ctx.save();

        const scale = size * 2;
        const rabbitColors = ['#FFB6C1', '#FFFFFF', '#F5F5DC', '#FFE4E1', '#FFF0F5'];
        const faceColor = rabbitColors[Math.floor(Math.random() * rabbitColors.length)];

        // Face
        ctx.fillStyle = faceColor;
        ctx.beginPath();
        ctx.arc(x, y, scale * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Long ears
        ctx.beginPath();
        ctx.ellipse(x - scale * 0.25, y - scale * 0.5, scale * 0.12, scale * 0.35, -Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(x + scale * 0.25, y - scale * 0.5, scale * 0.12, scale * 0.35, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();

        // Inner ears (pink)
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.ellipse(x - scale * 0.25, y - scale * 0.5, scale * 0.06, scale * 0.25, -Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(x + scale * 0.25, y - scale * 0.5, scale * 0.06, scale * 0.25, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(x - scale * 0.12, y - scale * 0.05, scale * 0.05, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x + scale * 0.12, y - scale * 0.05, scale * 0.05, 0, Math.PI * 2);
        ctx.fill();

        // Pink nose
        ctx.fillStyle = '#FF69B4';
        ctx.beginPath();
        ctx.arc(x, y + scale * 0.08, scale * 0.04, 0, Math.PI * 2);
        ctx.fill();

        // Mouth (Y shape)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = scale * 0.03;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(x, y + scale * 0.1);
        ctx.lineTo(x - scale * 0.06, y + scale * 0.18);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x, y + scale * 0.1);
        ctx.lineTo(x + scale * 0.06, y + scale * 0.18);
        ctx.stroke();

        // Cheeks
        ctx.fillStyle = 'rgba(255, 105, 180, 0.3)';
        ctx.beginPath();
        ctx.arc(x - scale * 0.25, y + scale * 0.1, scale * 0.08, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x + scale * 0.25, y + scale * 0.1, scale * 0.08, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
