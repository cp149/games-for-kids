import { StampEffect } from '../StampEffect.js';

/**
 * Butterfly stamp - colorful butterfly
 */
export class ButterflyStamp extends StampEffect {
    constructor() {
        super('butterfly', 'Butterfly', '🦋', 'Colorful butterfly', true);
    }

    draw(ctx, x, y, size) {
        ctx.save();

        const scale = size * 2;

        // Random vibrant colors for wings
        const hue = Math.random() * 360;
        const wingColor1 = `hsl(${hue}, 85%, 60%)`;
        const wingColor2 = `hsl(${(hue + 30) % 360}, 85%, 65%)`;
        const bodyColor = '#2C1810';

        // Body
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.ellipse(x, y, scale * 0.15, scale * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Left upper wing
        ctx.fillStyle = wingColor1;
        ctx.beginPath();
        ctx.ellipse(x - scale * 0.4, y - scale * 0.2, scale * 0.35, scale * 0.5, -Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();

        // Right upper wing
        ctx.beginPath();
        ctx.ellipse(x + scale * 0.4, y - scale * 0.2, scale * 0.35, scale * 0.5, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();

        // Left lower wing
        ctx.fillStyle = wingColor2;
        ctx.beginPath();
        ctx.ellipse(x - scale * 0.35, y + scale * 0.3, scale * 0.25, scale * 0.35, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // Right lower wing
        ctx.beginPath();
        ctx.ellipse(x + scale * 0.35, y + scale * 0.3, scale * 0.25, scale * 0.35, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // Wing patterns
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(x - scale * 0.4, y - scale * 0.2, scale * 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + scale * 0.4, y - scale * 0.2, scale * 0.12, 0, Math.PI * 2);
        ctx.fill();

        // Antennae
        ctx.strokeStyle = bodyColor;
        ctx.lineWidth = scale * 0.05;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(x, y - scale * 0.35);
        ctx.lineTo(x - scale * 0.15, y - scale * 0.55);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x, y - scale * 0.35);
        ctx.lineTo(x + scale * 0.15, y - scale * 0.55);
        ctx.stroke();

        // Antenna tips
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.arc(x - scale * 0.15, y - scale * 0.55, scale * 0.06, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + scale * 0.15, y - scale * 0.55, scale * 0.06, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
