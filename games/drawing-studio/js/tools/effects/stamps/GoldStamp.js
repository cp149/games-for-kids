import { StampEffect } from '../StampEffect.js';

/**
 * Gold stamp - Chinese gold ingot (元宝)
 */
export class GoldStamp extends StampEffect {
    constructor() {
        super('gold', 'Gold', '💰', 'Chinese gold ingot', false);
    }

    draw(ctx, x, y, size) {
        ctx.save();

        const scale = size * 2;

        // Gold color palette
        const goldColors = {
            bright: '#FFD700',
            medium: '#FFA500',
            dark: '#DAA520',
            shine: '#FFFFE0'
        };

        // Draw Chinese gold ingot (元宝) - traditional shape
        // Bottom is wide and flat, two ends curl up, middle has waist

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        // Bottom flat part
        ctx.moveTo(x - scale * 0.4 + scale * 0.04, y + scale * 0.2 + scale * 0.04);
        ctx.lineTo(x + scale * 0.4 + scale * 0.04, y + scale * 0.2 + scale * 0.04);
        // Right side curls up
        ctx.quadraticCurveTo(
            x + scale * 0.45 + scale * 0.04, y + scale * 0.1 + scale * 0.04,
            x + scale * 0.35 + scale * 0.04, y - scale * 0.15 + scale * 0.04
        );
        // Right top
        ctx.quadraticCurveTo(
            x + scale * 0.3 + scale * 0.04, y - scale * 0.25 + scale * 0.04,
            x + scale * 0.15 + scale * 0.04, y - scale * 0.2 + scale * 0.04
        );
        // Top waist (concave)
        ctx.quadraticCurveTo(
            x + scale * 0.04, y - scale * 0.3 + scale * 0.04,
            x - scale * 0.15 + scale * 0.04, y - scale * 0.2 + scale * 0.04
        );
        // Left top
        ctx.quadraticCurveTo(
            x - scale * 0.3 + scale * 0.04, y - scale * 0.25 + scale * 0.04,
            x - scale * 0.35 + scale * 0.04, y - scale * 0.15 + scale * 0.04
        );
        // Left side curls up
        ctx.quadraticCurveTo(
            x - scale * 0.45 + scale * 0.04, y + scale * 0.1 + scale * 0.04,
            x - scale * 0.4 + scale * 0.04, y + scale * 0.2 + scale * 0.04
        );
        ctx.closePath();
        ctx.fill();

        // Main body - left half (darker)
        ctx.fillStyle = goldColors.medium;
        ctx.beginPath();
        ctx.moveTo(x - scale * 0.4, y + scale * 0.2);
        ctx.lineTo(x, y + scale * 0.2);
        ctx.lineTo(x, y - scale * 0.3);
        ctx.quadraticCurveTo(
            x - scale * 0.3, y - scale * 0.25,
            x - scale * 0.35, y - scale * 0.15
        );
        ctx.quadraticCurveTo(
            x - scale * 0.45, y + scale * 0.1,
            x - scale * 0.4, y + scale * 0.2
        );
        ctx.closePath();
        ctx.fill();

        // Main body - right half (lighter)
        const gradient = ctx.createLinearGradient(
            x, y - scale * 0.3,
            x + scale * 0.4, y + scale * 0.2
        );
        gradient.addColorStop(0, goldColors.shine);
        gradient.addColorStop(0.3, goldColors.bright);
        gradient.addColorStop(0.7, goldColors.medium);
        gradient.addColorStop(1, goldColors.dark);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(x, y + scale * 0.2);
        ctx.lineTo(x + scale * 0.4, y + scale * 0.2);
        ctx.quadraticCurveTo(
            x + scale * 0.45, y + scale * 0.1,
            x + scale * 0.35, y - scale * 0.15
        );
        ctx.quadraticCurveTo(
            x + scale * 0.3, y - scale * 0.25,
            x + scale * 0.15, y - scale * 0.2
        );
        ctx.quadraticCurveTo(
            x, y - scale * 0.3,
            x, y + scale * 0.2
        );
        ctx.closePath();
        ctx.fill();

        // Top waist curve
        ctx.fillStyle = goldColors.bright;
        ctx.beginPath();
        ctx.moveTo(x - scale * 0.15, y - scale * 0.2);
        ctx.quadraticCurveTo(
            x, y - scale * 0.3,
            x + scale * 0.15, y - scale * 0.2
        );
        ctx.quadraticCurveTo(
            x, y - scale * 0.25,
            x - scale * 0.15, y - scale * 0.2
        );
        ctx.closePath();
        ctx.fill();

        // Outline
        ctx.strokeStyle = goldColors.dark;
        ctx.lineWidth = scale * 0.02;
        ctx.beginPath();
        ctx.moveTo(x - scale * 0.4, y + scale * 0.2);
        ctx.lineTo(x + scale * 0.4, y + scale * 0.2);
        ctx.quadraticCurveTo(
            x + scale * 0.45, y + scale * 0.1,
            x + scale * 0.35, y - scale * 0.15
        );
        ctx.quadraticCurveTo(
            x + scale * 0.3, y - scale * 0.25,
            x + scale * 0.15, y - scale * 0.2
        );
        ctx.quadraticCurveTo(
            x, y - scale * 0.3,
            x - scale * 0.15, y - scale * 0.2
        );
        ctx.quadraticCurveTo(
            x - scale * 0.3, y - scale * 0.25,
            x - scale * 0.35, y - scale * 0.15
        );
        ctx.quadraticCurveTo(
            x - scale * 0.45, y + scale * 0.1,
            x - scale * 0.4, y + scale * 0.2
        );
        ctx.stroke();

        // Highlight shine (random position for variety)
        const shineX = x + scale * (0.05 + Math.random() * 0.25);
        const shineY = y + scale * (-0.15 + Math.random() * 0.2);
        const shineWidth = scale * (0.12 + Math.random() * 0.08);
        const shineHeight = scale * (0.08 + Math.random() * 0.05);
        const shineRotation = Math.random() * Math.PI * 0.5;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.ellipse(shineX, shineY, shineWidth, shineHeight, shineRotation, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
