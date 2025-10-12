import { StampEffect } from '../StampEffect.js';

/**
 * Snowflake stamp
 */
export class SnowflakeStamp extends StampEffect {
    constructor() {
        super('snowflake', 'Snowflake', '❄️', 'Beautiful snowflake', false);
    }

    draw(ctx, x, y, size) {
        ctx.save();

        const scale = size * 2;

        ctx.strokeStyle = '#87CEEB';
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
        ctx.fillStyle = '#87CEEB';
        ctx.beginPath();
        ctx.arc(x, y, scale * 0.08, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
