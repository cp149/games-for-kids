import { StampEffect } from '../StampEffect.js';

/**
 * Snowflake stamp
 */
export class SnowflakeStamp extends StampEffect {
    constructor() {
        super('snowflake', 'Snowflake', '❄️', 'Beautiful snowflake', false);
    }

    draw(ctx, x, y, size, color) {
        ctx.save();

        const scale = size * 2;

        // Snowflake colors - cool tones and pastels
        const snowflakeColors = [
            '#87CEEB', // Sky blue
            '#B0E0E6', // Powder blue
            '#ADD8E6', // Light blue
            '#E0FFFF', // Light cyan
            '#F0F8FF', // Alice blue
            '#E6E6FA', // Lavender
            '#D8BFD8', // Thistle
            '#DDA0DD', // Plum
            '#FFB6C1', // Light pink
            '#F0E68C'  // Khaki
        ];

        let snowColor;

        // If color is provided, use it with random variation
        if (color && color !== '#000000') {
            let baseR, baseG, baseB;

            // Parse the selected color
            if (color.startsWith('#')) {
                baseR = parseInt(color.substr(1, 2), 16);
                baseG = parseInt(color.substr(3, 2), 16);
                baseB = parseInt(color.substr(5, 2), 16);
            } else if (color.startsWith('rgb')) {
                const matches = color.match(/\d+/g);
                baseR = parseInt(matches[0]);
                baseG = parseInt(matches[1]);
                baseB = parseInt(matches[2]);
            } else {
                baseR = 135;
                baseG = 206;
                baseB = 235;
            }

            // Generate random variation (±40)
            const variation = 40;
            const r = Math.max(0, Math.min(255, baseR + (Math.random() - 0.5) * variation * 2));
            const g = Math.max(0, Math.min(255, baseG + (Math.random() - 0.5) * variation * 2));
            const b = Math.max(0, Math.min(255, baseB + (Math.random() - 0.5) * variation * 2));
            snowColor = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
        } else {
            // Default: use random color from palette
            snowColor = snowflakeColors[Math.floor(Math.random() * snowflakeColors.length)];
        }

        ctx.strokeStyle = snowColor;
        ctx.lineWidth = scale * 0.06;
        ctx.lineCap = 'round';

        // 6 main branches
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const endX = x + Math.cos(angle) * scale * 0.4;
            const endY = y + Math.sin(angle) * scale * 0.4;

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            // Side branches
            const midX = x + Math.cos(angle) * scale * 0.25;
            const midY = y + Math.sin(angle) * scale * 0.25;

            const sideAngle1 = angle + Math.PI / 4;
            const sideAngle2 = angle - Math.PI / 4;

            ctx.beginPath();
            ctx.moveTo(midX, midY);
            ctx.lineTo(midX + Math.cos(sideAngle1) * scale * 0.15, midY + Math.sin(sideAngle1) * scale * 0.15);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(midX, midY);
            ctx.lineTo(midX + Math.cos(sideAngle2) * scale * 0.15, midY + Math.sin(sideAngle2) * scale * 0.15);
            ctx.stroke();
        }

        // Center
        ctx.fillStyle = snowColor;
        ctx.beginPath();
        ctx.arc(x, y, scale * 0.08, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
