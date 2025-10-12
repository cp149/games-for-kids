import { StampEffect } from '../StampEffect.js';

/**
 * Dinosaur stamp
 */
export class DinosaurStamp extends StampEffect {
    constructor() {
        super('dinosaur', 'Dinosaur', '🦖', 'Cute dinosaur', true);
    }

    draw(ctx, x, y, size) {
        ctx.save();

        const scale = size * 2;
        const dinoColors = ['#90EE90', '#98D8C8', '#77DD77', '#B2D8B2'];
        const dinoColor = dinoColors[Math.floor(Math.random() * dinoColors.length)];

        // Body
        ctx.fillStyle = dinoColor;
        ctx.beginPath();
        ctx.ellipse(x, y + scale * 0.1, scale * 0.35, scale * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.beginPath();
        ctx.arc(x + scale * 0.25, y - scale * 0.15, scale * 0.25, 0, Math.PI * 2);
        ctx.fill();

        // Spikes on back
        for (let i = 0; i < 3; i++) {
            const spikeX = x - scale * 0.2 + i * scale * 0.15;
            ctx.beginPath();
            ctx.moveTo(spikeX, y - scale * 0.05);
            ctx.lineTo(spikeX - scale * 0.08, y - scale * 0.3);
            ctx.lineTo(spikeX + scale * 0.08, y - scale * 0.05);
            ctx.closePath();
            ctx.fill();
        }

        // Eye
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(x + scale * 0.3, y - scale * 0.2, scale * 0.05, 0, Math.PI * 2);
        ctx.fill();

        // Eye highlight
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x + scale * 0.32, y - scale * 0.22, scale * 0.02, 0, Math.PI * 2);
        ctx.fill();

        // Mouth
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = scale * 0.03;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.arc(x + scale * 0.35, y - scale * 0.1, scale * 0.08, 0.3, Math.PI - 0.3);
        ctx.stroke();

        // Tail
        ctx.fillStyle = dinoColor;
        ctx.beginPath();
        ctx.ellipse(x - scale * 0.35, y + scale * 0.15, scale * 0.15, scale * 0.08, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
