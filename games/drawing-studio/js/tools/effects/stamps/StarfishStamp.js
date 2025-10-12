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
        const starfishColors = ['#FFA07A', '#FF7F50', '#FFB6C1', '#FFD700', '#FF6347', '#FFA500'];
        const baseColor = starfishColors[Math.floor(Math.random() * starfishColors.length)];

        // Convert hex to RGB for gradients
        const hexToRgb = (hex) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : { r: 255, g: 160, b: 122 };
        };

        const rgb = hexToRgb(baseColor);
        const lightColor = `rgb(${Math.min(255, rgb.r + 40)}, ${Math.min(255, rgb.g + 40)}, ${Math.min(255, rgb.b + 40)})`;
        const darkColor = `rgb(${Math.max(0, rgb.r - 50)}, ${Math.max(0, rgb.g - 50)}, ${Math.max(0, rgb.b - 50)})`;

        // 5-pointed starfish with curved arms
        const arms = 5;
        const outerRadius = scale * 0.4;
        const innerRadius = scale * 0.18;

        // Draw shadow first for depth
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.beginPath();
        for (let i = 0; i < arms * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / arms - Math.PI / 2;
            const px = x + Math.cos(angle) * radius + scale * 0.03;
            const py = y + Math.sin(angle) * radius + scale * 0.03;

            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
        ctx.fill();

        // Main body with gradient
        const gradient = ctx.createRadialGradient(
            x - scale * 0.1, y - scale * 0.1, 0,
            x, y, outerRadius
        );
        gradient.addColorStop(0, lightColor);
        gradient.addColorStop(0.5, baseColor);
        gradient.addColorStop(1, darkColor);

        ctx.fillStyle = gradient;
        ctx.beginPath();
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

        // Add texture with darker spots along arms
        ctx.fillStyle = darkColor;
        for (let i = 0; i < arms; i++) {
            const angle = (i * Math.PI * 2) / arms - Math.PI / 2;

            // Multiple dots along each arm
            for (let j = 0; j < 3; j++) {
                const dist = scale * (0.15 + j * 0.08);
                const dotX = x + Math.cos(angle) * dist;
                const dotY = y + Math.sin(angle) * dist;

                ctx.beginPath();
                ctx.arc(dotX, dotY, scale * 0.03, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Highlight dots in center
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5;
            const dotX = x + Math.cos(angle) * scale * 0.08;
            const dotY = y + Math.sin(angle) * scale * 0.08;

            ctx.beginPath();
            ctx.arc(dotX, dotY, scale * 0.025, 0, Math.PI * 2);
            ctx.fill();
        }

        // Center highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(x - scale * 0.05, y - scale * 0.05, scale * 0.06, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
