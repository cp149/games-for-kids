/**
 * Cloud Effect - Draws fluffy cloud shapes
 */

import { MagicEffect } from './MagicEffect.js';

export class CloudEffect extends MagicEffect {
    constructor() {
        super('cloud', 'Cloud', '☁️', 'Fluffy clouds');
    }

    /**
     * Draw cloud using three-layer particle system (CSHorde blog approach)
     * Core → Inner Fluff → Outer Fluff for realistic cloud generation
     */
    draw(ctx, x, y, size, color) {
        ctx.save();

        const s = size * 1.5;

        // Convert color to RGB
        let r = 255, g = 255, b = 255;
        if (color && color.startsWith('#')) {
            r = parseInt(color.slice(1, 3), 16);
            g = parseInt(color.slice(3, 5), 16);
            b = parseInt(color.slice(5, 7), 16);
        }

        // Make color lighter for cloud
        const lightR = Math.min(255, r + (255 - r) * 0.8);
        const lightG = Math.min(255, g + (255 - g) * 0.8);
        const lightB = Math.min(255, b + (255 - b) * 0.8);

        const particles = [];

        // Phase 1: Create core particles
        const numCores = 2 + Math.floor(Math.random() * 2); // 2-3 cores
        const cores = [];

        for (let i = 0; i < numCores; i++) {
            const core = {
                x: x + (Math.random() - 0.5) * s * 0.6,
                y: y + (Math.random() - 0.5) * s * 0.4,
                r: s * (0.25 + Math.random() * 0.15),
                layer: 'core'
            };
            cores.push(core);
            particles.push(core);
        }

        // Phase 2: Generate inner fluff around each core
        const innerDensity = 8; // Particles per core
        const innerRange = s * 0.5;

        cores.forEach(core => {
            for (let i = 0; i < innerDensity; i++) {
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * innerRange;

                particles.push({
                    x: core.x + Math.cos(angle) * distance,
                    y: core.y + Math.sin(angle) * distance,
                    r: s * (0.15 + Math.random() * 0.2),
                    layer: 'inner'
                });
            }
        });

        // Phase 3: Generate outer fluff around inner particles
        const outerDensity = 3; // Particles per inner particle
        const innerParticles = particles.filter(p => p.layer === 'inner');

        innerParticles.forEach(inner => {
            for (let i = 0; i < outerDensity; i++) {
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * inner.r;

                particles.push({
                    x: inner.x + Math.cos(angle) * distance,
                    y: inner.y + Math.sin(angle) * distance,
                    r: s * (0.08 + Math.random() * 0.15),
                    layer: 'outer'
                });
            }
        });

        // Sort: draw large particles first, then small (for proper layering)
        particles.sort((a, b) => b.r - a.r);

        // Draw all particles with gradients
        particles.forEach(particle => {
            const gradient = ctx.createRadialGradient(
                particle.x - particle.r * 0.25,
                particle.y - particle.r * 0.25,
                0,
                particle.x,
                particle.y,
                particle.r
            );

            // Opacity based on layer
            let baseOpacity;
            if (particle.layer === 'core') baseOpacity = 0.9;
            else if (particle.layer === 'inner') baseOpacity = 0.7;
            else baseOpacity = 0.5;

            // Slight brightness variation
            const brightness = 0.95 + Math.random() * 0.1;
            const br = Math.min(255, lightR * brightness);
            const bg = Math.min(255, lightG * brightness);
            const bb = Math.min(255, lightB * brightness);

            gradient.addColorStop(0, `rgba(${br}, ${bg}, ${bb}, ${baseOpacity})`);
            gradient.addColorStop(0.6, `rgba(${br - 8}, ${bg - 8}, ${bb - 8}, ${baseOpacity * 0.7})`);
            gradient.addColorStop(1, `rgba(${br - 15}, ${bg - 15}, ${bb - 15}, 0)`);

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }

    /**
     * Clouds need more spacing between draws
     */
    getSpacingMultiplier() {
        return 3.0; // Wide spacing for distinct clouds
    }
}
