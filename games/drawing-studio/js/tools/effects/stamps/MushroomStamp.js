import { StampEffect } from '../StampEffect.js';

/**
 * Mushroom stamp
 */
export class MushroomStamp extends StampEffect {
    constructor() {
        super('mushroom', 'Mushroom', '🍄', 'Cute mushroom', false);
    }

    draw(ctx, x, y, size) {
        ctx.save();

        const scale = size * 2;

        // Random mushroom cap colors
        const capColors = [
            '#FF6B6B', // Red (classic)
            '#FF8C69', // Coral
            '#FFD93D', // Yellow
            '#FF69B4', // Hot pink
            '#9370DB', // Purple
            '#FF6347', // Tomato
            '#FFA07A', // Light salmon
            '#FF1493', // Deep pink
            '#FFB347', // Orange
            '#87CEEB'  // Sky blue
        ];
        const capColor = capColors[Math.floor(Math.random() * capColors.length)];

        // Stem (draw first, centered at x)
        ctx.fillStyle = '#F5F5DC';
        ctx.beginPath();
        ctx.roundRect(x - scale * 0.1, y, scale * 0.2, scale * 0.35, scale * 0.05);
        ctx.fill();

        // Stem shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(x + scale * 0.05, y, scale * 0.05, scale * 0.35);

        // Cap position (centered on stem, no random offset)
        const capX = x;
        const capY = y;

        // Cap
        ctx.fillStyle = capColor;
        ctx.beginPath();
        ctx.arc(capX, capY, scale * 0.35, 0, Math.PI, true);
        ctx.fill();

        // White spots on cap (3 fixed, 2 random small ones)
        ctx.fillStyle = '#FFFFFF';

        // 3 main fixed spots
        const fixedSpots = [
            { x: capX, y: capY - scale * 0.2, r: scale * 0.08 },
            { x: capX - scale * 0.2, y: capY - scale * 0.1, r: scale * 0.06 },
            { x: capX + scale * 0.18, y: capY - scale * 0.12, r: scale * 0.05 }
        ];

        fixedSpots.forEach(spot => {
            ctx.beginPath();
            ctx.arc(spot.x, spot.y, spot.r, 0, Math.PI * 2);
            ctx.fill();
        });

        // 2 random small spots on top
        for (let i = 0; i < 2; i++) {
            const angle = Math.PI * 0.3 + Math.random() * Math.PI * 0.4; // Top semicircle
            const dist = scale * (0.18 + Math.random() * 0.1);
            const spotX = capX - Math.cos(angle) * dist;
            const spotY = capY - Math.sin(angle) * dist;
            const spotSize = scale * 0.04;

            ctx.beginPath();
            ctx.arc(spotX, spotY, spotSize, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}
