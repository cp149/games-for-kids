import { StampEffect } from '../StampEffect.js';

/**
 * Parrot stamp - colorful tropical parrot
 */
export class ParrotStamp extends StampEffect {
    constructor() {
        super('bird', 'Parrot', '🦜', 'Colorful tropical parrot', false);
    }

    draw(ctx, x, y, size) {
        ctx.save();

        const scale = size * 2;

        // Vibrant parrot colors
        const parrotBodyColors = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#6BCF7F', '#A78BFA'];
        const bodyColor = parrotBodyColors[Math.floor(Math.random() * parrotBodyColors.length)];
        const wingColor = `hsl(${Math.random() * 360}, 80%, 60%)`;

        // Body
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.ellipse(x, y, scale * 0.28, scale * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head (slightly larger)
        ctx.beginPath();
        ctx.arc(x + scale * 0.18, y - scale * 0.25, scale * 0.22, 0, Math.PI * 2);
        ctx.fill();

        // Colorful wing
        ctx.fillStyle = wingColor;
        ctx.beginPath();
        ctx.ellipse(x - scale * 0.22, y + scale * 0.05, scale * 0.28, scale * 0.18, -Math.PI / 3, 0, Math.PI * 2);
        ctx.fill();

        // Wing details (feathers)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = scale * 0.04;
        ctx.lineCap = 'round';
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(x - scale * 0.22, y + scale * 0.05);
            ctx.lineTo(x - scale * 0.35 - i * scale * 0.05, y + scale * 0.1 + i * scale * 0.05);
            ctx.stroke();
        }

        // Eye with white background
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x + scale * 0.22, y - scale * 0.28, scale * 0.08, 0, Math.PI * 2);
        ctx.fill();

        // Eye pupil
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(x + scale * 0.22, y - scale * 0.28, scale * 0.05, 0, Math.PI * 2);
        ctx.fill();

        // Eye highlight
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x + scale * 0.24, y - scale * 0.3, scale * 0.02, 0, Math.PI * 2);
        ctx.fill();

        // Curved parrot beak (characteristic)
        ctx.fillStyle = '#FFB84D';
        ctx.beginPath();
        ctx.moveTo(x + scale * 0.32, y - scale * 0.2);
        ctx.quadraticCurveTo(x + scale * 0.48, y - scale * 0.2, x + scale * 0.42, y - scale * 0.12);
        ctx.lineTo(x + scale * 0.32, y - scale * 0.15);
        ctx.closePath();
        ctx.fill();

        // Beak highlight
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.moveTo(x + scale * 0.35, y - scale * 0.19);
        ctx.lineTo(x + scale * 0.42, y - scale * 0.19);
        ctx.lineTo(x + scale * 0.38, y - scale * 0.16);
        ctx.closePath();
        ctx.fill();

        // Colorful tail feathers
        const tailColors = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#A78BFA'];
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = tailColors[i % tailColors.length];
            ctx.beginPath();
            ctx.moveTo(x - scale * 0.25, y + scale * 0.2);
            ctx.lineTo(x - scale * 0.45 - i * scale * 0.08, y + scale * 0.3 + i * scale * 0.05);
            ctx.lineTo(x - scale * 0.4 - i * scale * 0.08, y + scale * 0.15 + i * scale * 0.05);
            ctx.closePath();
            ctx.fill();
        }

        // Belly accent
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.ellipse(x + scale * 0.05, y + scale * 0.15, scale * 0.15, scale * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
