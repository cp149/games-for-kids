/**
 * Candy Effect - Draws random candy shapes
 */

import { MagicEffect } from './MagicEffect.js';

export class CandyEffect extends MagicEffect {
    constructor() {
        super('candy', 'Candy', '🍬', 'Sweet candies');

        // Different candy types
        this.candyTypes = [
            'lollipop',      // Spiral lollipop
            'wrapped',       // Wrapped candy
            'gummy',         // Gummy bear shape
            'hard',          // Round hard candy
            'striped'        // Striped candy cane style
        ];

        // Candy color palettes
        this.candyColors = [
            ['#FF1744', '#FFFFFF'],  // Red & White
            ['#00E676', '#FFFFFF'],  // Green & White
            ['#FFEA00', '#FF6D00'],  // Yellow & Orange
            ['#E040FB', '#FFFFFF'],  // Purple & White
            ['#00B0FF', '#FFFFFF'],  // Blue & White
            ['#FF4081', '#FFEB3B'],  // Pink & Yellow
            ['#76FF03', '#00E5FF']   // Lime & Cyan
        ];
    }

    /**
     * Draw a random candy
     */
    draw(ctx, x, y, size, color) {
        ctx.save();

        const candySize = size * 1.6;

        // Random rotation
        const rotation = Math.random() * Math.PI * 2;
        ctx.translate(x, y);
        ctx.rotate(rotation);

        // Randomly choose candy type
        const candyType = this.candyTypes[Math.floor(Math.random() * this.candyTypes.length)];

        // Random color palette
        const colors = this.candyColors[Math.floor(Math.random() * this.candyColors.length)];

        switch (candyType) {
            case 'lollipop':
                this.drawLollipop(ctx, 0, 0, candySize, colors);
                break;
            case 'wrapped':
                this.drawWrappedCandy(ctx, 0, 0, candySize, colors);
                break;
            case 'gummy':
                this.drawGummyBear(ctx, 0, 0, candySize, colors[0]);
                break;
            case 'hard':
                this.drawHardCandy(ctx, 0, 0, candySize, colors);
                break;
            case 'striped':
                this.drawStripedCandy(ctx, 0, 0, candySize, colors);
                break;
        }

        ctx.restore();
    }

    /**
     * Draw spiral lollipop
     */
    drawLollipop(ctx, x, y, size, colors) {
        // Stick
        ctx.fillStyle = '#D2691E';
        ctx.fillRect(x - size * 0.05, y + size * 0.3, size * 0.1, size * 0.5);

        // Round candy part with spiral
        const radius = size * 0.3;

        // Background circle
        ctx.fillStyle = colors[0];
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Spiral pattern
        ctx.strokeStyle = colors[1];
        ctx.lineWidth = size * 0.08;
        ctx.lineCap = 'round';

        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            for (let angle = 0; angle < Math.PI * 4; angle += 0.1) {
                const r = (angle / (Math.PI * 4)) * radius * 0.9;
                const offsetAngle = angle + (i * Math.PI * 2 / 3);
                const px = x + Math.cos(offsetAngle) * r;
                const py = y + Math.sin(offsetAngle) * r;
                if (angle === 0) {
                    ctx.moveTo(px, py);
                } else {
                    ctx.lineTo(px, py);
                }
            }
            ctx.stroke();
        }

        // Shine effect
        const gradient = ctx.createRadialGradient(
            x - radius * 0.3, y - radius * 0.3, 0,
            x, y, radius
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Draw wrapped candy
     */
    drawWrappedCandy(ctx, x, y, size, colors) {
        // Main candy body (ellipse)
        ctx.fillStyle = colors[0];
        ctx.beginPath();
        ctx.ellipse(x, y, size * 0.35, size * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Stripes
        ctx.strokeStyle = colors[1];
        ctx.lineWidth = size * 0.04;
        for (let i = -3; i <= 3; i++) {
            ctx.beginPath();
            ctx.moveTo(x + i * size * 0.1, y - size * 0.2);
            ctx.lineTo(x + i * size * 0.1, y + size * 0.2);
            ctx.stroke();
        }

        // Wrapper twists
        ctx.fillStyle = colors[1];
        // Left twist
        ctx.beginPath();
        ctx.moveTo(x - size * 0.35, y);
        ctx.lineTo(x - size * 0.5, y - size * 0.15);
        ctx.lineTo(x - size * 0.5, y + size * 0.15);
        ctx.closePath();
        ctx.fill();

        // Right twist
        ctx.beginPath();
        ctx.moveTo(x + size * 0.35, y);
        ctx.lineTo(x + size * 0.5, y - size * 0.15);
        ctx.lineTo(x + size * 0.5, y + size * 0.15);
        ctx.closePath();
        ctx.fill();
    }

    /**
     * Draw gummy bear
     */
    drawGummyBear(ctx, x, y, size, color) {
        ctx.fillStyle = color;

        // Head
        ctx.beginPath();
        ctx.arc(x, y - size * 0.15, size * 0.25, 0, Math.PI * 2);
        ctx.fill();

        // Ears
        ctx.beginPath();
        ctx.arc(x - size * 0.2, y - size * 0.3, size * 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + size * 0.2, y - size * 0.3, size * 0.12, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.beginPath();
        ctx.ellipse(x, y + size * 0.15, size * 0.3, size * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();

        // Arms
        ctx.beginPath();
        ctx.arc(x - size * 0.35, y + size * 0.05, size * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + size * 0.35, y + size * 0.05, size * 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Legs
        ctx.beginPath();
        ctx.arc(x - size * 0.15, y + size * 0.5, size * 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + size * 0.15, y + size * 0.5, size * 0.12, 0, Math.PI * 2);
        ctx.fill();

        // Shine effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(x - size * 0.08, y, size * 0.15, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Draw hard candy (round with shine)
     */
    drawHardCandy(ctx, x, y, size, colors) {
        const radius = size * 0.3;

        // Main candy circle
        const gradient = ctx.createRadialGradient(
            x - radius * 0.3, y - radius * 0.3, 0,
            x, y, radius
        );
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(1, colors[1]);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Wrapper crinkles effect (circles)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(x, y, radius * (0.4 + i * 0.2), 0, Math.PI * 2);
            ctx.stroke();
        }

        // Bright shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.25, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Draw striped candy (candy cane style)
     */
    drawStripedCandy(ctx, x, y, size, colors) {
        // Main body
        ctx.fillStyle = colors[0];
        ctx.beginPath();
        ctx.ellipse(x, y, size * 0.15, size * 0.4, Math.PI * 0.25, 0, Math.PI * 2);
        ctx.fill();

        // Stripes
        ctx.strokeStyle = colors[1];
        ctx.lineWidth = size * 0.08;
        ctx.lineCap = 'round';

        for (let i = 0; i < 5; i++) {
            const offset = (i - 2) * size * 0.15;
            ctx.beginPath();
            ctx.moveTo(x - size * 0.2 + offset * 0.7, y - size * 0.3 + offset * 0.7);
            ctx.lineTo(x + size * 0.2 + offset * 0.7, y + size * 0.3 + offset * 0.7);
            ctx.stroke();
        }

        // Shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(x - size * 0.05, y - size * 0.1, size * 0.1, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Candies need moderate spacing
     */
    getSpacingMultiplier() {
        return 1.5;
    }
}
