import { MagicEffect } from '../MagicEffect.js';

/**
 * Rainbow effect - colors cycle through spectrum with smooth gradients
 */
export class RainbowEffect extends MagicEffect {
    constructor() {
        super('rainbow', 'Rainbow', '🌈', 'Smooth color gradient');
        this.hue = 0;
    }

    draw(ctx, x, y, size) {
        ctx.save();

        // Slowly cycle hue from 0 to 360 (smoother color transition)
        this.hue = (this.hue + 0.8) % 360;

        // Draw multiple layered gradients for smoother effect
        const layers = 3;

        for (let i = 0; i < layers; i++) {
            const layerSize = size * (1 - i * 0.2);
            const hueOffset = i * 20;
            const alphaBase = 0.4 - i * 0.1;

            // Create smooth radial gradient
            const gradient = ctx.createRadialGradient(
                x, y, 0,
                x, y, layerSize
            );

            // Multi-stop gradient for smoother color blending
            gradient.addColorStop(0, `hsla(${(this.hue + hueOffset) % 360}, 100%, 65%, ${alphaBase})`);
            gradient.addColorStop(0.3, `hsla(${(this.hue + hueOffset + 15) % 360}, 95%, 60%, ${alphaBase * 0.8})`);
            gradient.addColorStop(0.6, `hsla(${(this.hue + hueOffset + 35) % 360}, 90%, 55%, ${alphaBase * 0.5})`);
            gradient.addColorStop(0.85, `hsla(${(this.hue + hueOffset + 60) % 360}, 85%, 50%, ${alphaBase * 0.2})`);
            gradient.addColorStop(1, `hsla(${(this.hue + hueOffset + 90) % 360}, 80%, 45%, 0)`);

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, layerSize, 0, Math.PI * 2);
            ctx.fill();
        }

        // Add soft glow effect
        ctx.globalCompositeOperation = 'lighter';
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 1.3);
        glowGradient.addColorStop(0, `hsla(${this.hue}, 100%, 70%, 0.15)`);
        glowGradient.addColorStop(0.5, `hsla(${(this.hue + 45) % 360}, 100%, 65%, 0.08)`);
        glowGradient.addColorStop(1, `hsla(${(this.hue + 90) % 360}, 100%, 60%, 0)`);

        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x, y, size * 1.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();
    }
}
