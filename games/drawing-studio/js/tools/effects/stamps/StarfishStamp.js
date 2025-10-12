import { StampEffect } from '../StampEffect.js';

/**
 * Starfish stamp
 */
export class StarfishStamp extends StampEffect {
    constructor() {
        super('starfish', 'Starfish', '⭐', 'Colorful starfish', false);
    }

    draw(ctx, x, y, size) {
        ctx.save();

        const scale = size * 2;
        const starfishColors = ['#FFA07A', '#FF7F50', '#FFB6C1', '#FFD700'];
        const starfishColor = starfishColors[Math.floor(Math.random() * starfishColors.length)];

        ctx.fillStyle = starfishColor;
        ctx.beginPath();

        // 5-pointed starfish
        const arms = 5;
        const outerRadius = scale * 0.4;
        const innerRadius = scale * 0.18;

        for (let i = 0; i < arms * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / arms - Math.PI / 2;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;

            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }

        ctx.closePath();
        ctx.fill();

        // Dots on starfish
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5;
            const dotX = x + Math.cos(angle) * scale * 0.15;
            const dotY = y + Math.sin(angle) * scale * 0.15;

            ctx.beginPath();
            ctx.arc(dotX, dotY, scale * 0.04, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}
