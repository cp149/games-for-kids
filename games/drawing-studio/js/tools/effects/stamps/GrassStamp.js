import { StampEffect } from '../StampEffect.js';

/**
 * Grass stamp - cute grass blades
 */
export class GrassStamp extends StampEffect {
    constructor() {
        super('grass', 'Grass', '🌱', 'Fresh green grass', false);
    }

    draw(ctx, x, y, size) {
        ctx.save();

        const scale = size * 2;

        // Green color variations
        const greenShades = [
            '#90EE90', // Light green
            '#32CD32', // Lime green
            '#3CB371', // Medium sea green
            '#228B22', // Forest green
            '#7FFF00', // Chartreuse
            '#00FF00', // Pure green
            '#ADFF2F', // Green yellow
            '#9ACD32'  // Yellow green
        ];

        // Draw multiple grass blades
        const bladeCount = 5 + Math.floor(Math.random() * 4);

        for (let i = 0; i < bladeCount; i++) {
            const offsetX = (i - bladeCount / 2) * scale * 0.15;
            const bladeHeight = scale * (0.4 + Math.random() * 0.3);
            const bladeWidth = scale * 0.06;
            const bendOffset = (Math.random() - 0.5) * scale * 0.2;

            // Random green shade
            const greenShade = greenShades[Math.floor(Math.random() * greenShades.length)];

            // Darker green for base
            const darkGreen = '#228B22';

            // Draw grass blade with gradient
            const gradient = ctx.createLinearGradient(
                x + offsetX, y,
                x + offsetX + bendOffset, y - bladeHeight
            );
            gradient.addColorStop(0, darkGreen);
            gradient.addColorStop(0.6, greenShade);
            gradient.addColorStop(1, '#ADFF2F');

            ctx.fillStyle = gradient;

            // Blade shape using bezier curves
            ctx.beginPath();
            ctx.moveTo(x + offsetX - bladeWidth / 2, y);

            // Left side
            ctx.quadraticCurveTo(
                x + offsetX - bladeWidth / 2 + bendOffset * 0.5,
                y - bladeHeight * 0.6,
                x + offsetX + bendOffset,
                y - bladeHeight
            );

            // Right side
            ctx.quadraticCurveTo(
                x + offsetX + bladeWidth / 2 + bendOffset * 0.5,
                y - bladeHeight * 0.6,
                x + offsetX + bladeWidth / 2,
                y
            );

            ctx.closePath();
            ctx.fill();

            // Add center line for detail
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = scale * 0.01;
            ctx.beginPath();
            ctx.moveTo(x + offsetX, y);
            ctx.quadraticCurveTo(
                x + offsetX + bendOffset * 0.5,
                y - bladeHeight * 0.6,
                x + offsetX + bendOffset,
                y - bladeHeight
            );
            ctx.stroke();
        }

        // Add small flowers occasionally
        if (Math.random() < 0.3) {
            const flowerX = x + (Math.random() - 0.5) * scale * 0.3;
            const flowerY = y - scale * 0.3;
            const flowerSize = scale * 0.08;

            // Flower colors
            const flowerColors = ['#FFFF00', '#FFFFFF', '#FFB6C1', '#FF69B4', '#87CEEB'];
            const flowerColor = flowerColors[Math.floor(Math.random() * flowerColors.length)];

            // Simple flower
            for (let i = 0; i < 5; i++) {
                const angle = (i * Math.PI * 2 / 5);
                const petalX = flowerX + Math.cos(angle) * flowerSize;
                const petalY = flowerY + Math.sin(angle) * flowerSize;

                ctx.fillStyle = flowerColor;
                ctx.beginPath();
                ctx.arc(petalX, petalY, flowerSize * 0.4, 0, Math.PI * 2);
                ctx.fill();
            }

            // Flower center
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(flowerX, flowerY, flowerSize * 0.3, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}
