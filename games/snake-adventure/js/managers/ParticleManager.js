/**
 * Particle Manager - Handles tail trail particles
 */

class ParticleManager {
    constructor() {
        this.particles = [];
    }

    /**
     * Spawn particle
     */
    spawn(x, y, color) {
        if (Math.random() > CONFIG.PARTICLES.TAIL_SPAWN_RATE) return;

        this.particles.push({
            x: x + MathUtils.random(-CONFIG.PARTICLES.SPREAD, CONFIG.PARTICLES.SPREAD),
            y: y + MathUtils.random(-CONFIG.PARTICLES.SPREAD, CONFIG.PARTICLES.SPREAD),
            life: CONFIG.PARTICLES.LIFETIME,
            maxLife: CONFIG.PARTICLES.LIFETIME,
            color: color,
            size: CONFIG.PARTICLES.SIZE
        });

        // Limit particle count
        if (this.particles.length > CONFIG.PARTICLES.POOL_SIZE) {
            this.particles.shift();
        }
    }

    /**
     * Update particles
     */
    update(deltaTime) {
        this.particles = this.particles.filter(p => {
            p.life -= deltaTime * CONFIG.PARTICLES.FADE_RATE;
            return p.life > 0;
        });
    }

    /**
     * Render particles
     */
    render(ctx, camera) {
        this.particles.forEach(p => {
            const alpha = p.life / p.maxLife;
            const x = p.x - camera.x;
            const y = p.y - camera.y;

            ctx.fillStyle = p.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
            ctx.beginPath();
            ctx.arc(x, y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    /**
     * Clear all particles
     */
    clear() {
        this.particles = [];
    }

    /**
     * Cleanup
     */
    destroy() {
        this.clear();
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ParticleManager;
}
