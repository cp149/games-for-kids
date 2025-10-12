import { StampEffect } from '../StampEffect.js';

/**
 * Heart stamp
 */
export class HeartStamp extends StampEffect {
    constructor() {
        super('heart', 'Heart', '❤️', 'Colorful hearts', false);
    }

    draw(ctx, x, y, size) {
        ctx.save();

        const scale = size * 2;
        const hue = Math.random() * 360;
        const heartColor = `hsl(${hue}, 85%, 65%)`;

        // Random heart style
        const styles = ['solid', 'gradient', 'sparkle'];
        const style = styles[Math.floor(Math.random() * styles.length)];

        // Random heart shape style
        const shapeStyles = ['classic', 'round'];
        const shapeStyle = shapeStyles[Math.floor(Math.random() * shapeStyles.length)];

        ctx.beginPath();
        if (shapeStyle === 'round') {
            // Rounder, fuller heart shape (like emoji ❤️)
            // Use circles and smooth curves
            const topY = y - scale * 0.1;

            // Start from bottom point
            ctx.moveTo(x, y + scale * 0.3);

            // Left side - curve to left bump
            ctx.bezierCurveTo(
                x - scale * 0.15, y + scale * 0.15,
                x - scale * 0.35, y + scale * 0.05,
                x - scale * 0.25, topY
            );

            // Left top bump (circle arc)
            ctx.arc(x - scale * 0.15, topY, scale * 0.15, Math.PI, 0, false);

            // Top center
            ctx.lineTo(x, topY);

            // Right top bump (circle arc)
            ctx.arc(x + scale * 0.15, topY, scale * 0.15, Math.PI, 0, false);

            // Right side - curve back to bottom
            ctx.bezierCurveTo(
                x + scale * 0.35, y + scale * 0.05,
                x + scale * 0.15, y + scale * 0.15,
                x, y + scale * 0.3
            );

            ctx.closePath();
        } else {
            // Classic pointed heart shape
            ctx.moveTo(x, y + scale * 0.3);
            ctx.bezierCurveTo(x, y + scale * 0.1, x - scale * 0.5, y - scale * 0.3, x, y - scale * 0.1);
            ctx.bezierCurveTo(x + scale * 0.5, y - scale * 0.3, x, y + scale * 0.1, x, y + scale * 0.3);
            ctx.closePath();
        }

        if (style === 'solid') {
            // Solid color heart
            ctx.fillStyle = heartColor;
            ctx.fill();

            // Simple highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.arc(x - scale * 0.15, y - scale * 0.05, scale * 0.1, 0, Math.PI * 2);
            ctx.fill();

        } else if (style === 'gradient') {
            // Gradient heart
            const gradient = ctx.createRadialGradient(
                x - scale * 0.1, y - scale * 0.05, 0,
                x, y, scale * 0.5
            );
            gradient.addColorStop(0, `hsl(${hue}, 100%, 75%)`);
            gradient.addColorStop(0.5, heartColor);
            gradient.addColorStop(1, `hsl(${hue}, 70%, 50%)`);

            ctx.fillStyle = gradient;
            ctx.fill();

            // Bright highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.arc(x - scale * 0.15, y - scale * 0.08, scale * 0.08, 0, Math.PI * 2);
            ctx.fill();

        } else {
            // Sparkle heart with outline
            ctx.fillStyle = heartColor;
            ctx.fill();

            // Add glow/sparkle effect
            ctx.shadowColor = heartColor;
            ctx.shadowBlur = scale * 0.3;
            ctx.fill();

            // Multiple sparkle highlights
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

            // Top left sparkle
            ctx.beginPath();
            ctx.arc(x - scale * 0.15, y - scale * 0.08, scale * 0.06, 0, Math.PI * 2);
            ctx.fill();

            // Center sparkles
            for (let i = 0; i < 3; i++) {
                const sparkleX = x + (Math.random() - 0.5) * scale * 0.3;
                const sparkleY = y + (Math.random() - 0.5) * scale * 0.2;
                ctx.beginPath();
                ctx.arc(sparkleX, sparkleY, scale * 0.03, 0, Math.PI * 2);
                ctx.fill();
            }

            // Star-like sparkles
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.font = `${scale * 0.15}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('✨', x + scale * 0.2, y - scale * 0.15);
        }

        ctx.restore();
    }
}
