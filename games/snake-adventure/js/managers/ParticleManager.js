/**
 * Particle Manager - Enhanced particle system with multiple types
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
            vx: MathUtils.random(-20, 20),
            vy: MathUtils.random(-20, 20),
            life: CONFIG.PARTICLES.LIFETIME,
            maxLife: CONFIG.PARTICLES.LIFETIME,
            color: color,
            size: CONFIG.PARTICLES.SIZE,
            type: 'trail'
        });

        // Limit particle count
        if (this.particles.length > CONFIG.PARTICLES.POOL_SIZE) {
            this.particles.shift();
        }
    }

    /**
     * Spawn explosion particles (for death/collision)
     */
    spawnExplosion(x, y, color, count = 20) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = MathUtils.random(CONFIG.PARTICLES.DEATH_PARTICLE_SPEED * 0.5, CONFIG.PARTICLES.DEATH_PARTICLE_SPEED);

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: CONFIG.PARTICLES.DEATH_PARTICLE_LIFETIME,
                maxLife: CONFIG.PARTICLES.DEATH_PARTICLE_LIFETIME,
                color: color,
                size: MathUtils.random(4, 10),
                type: 'explosion'
            });
        }
    }

    /**
     * Spawn food collection particles
     */
    spawnFoodCollect(x, y, color, count = 15) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = MathUtils.random(50, 150);

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.6,
                maxLife: 0.6,
                color: color,
                size: MathUtils.random(3, 8),
                type: 'collect',
                sparkle: true
            });
        }
    }

    /**
     * Spawn power-up effect particles
     */
    spawnPowerUp(x, y, color, count = 30) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = MathUtils.random(100, 200);
            const lifetime = MathUtils.random(0.8, 1.5);

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 50, // Upward bias
                life: lifetime,
                maxLife: lifetime,
                color: color,
                size: MathUtils.random(4, 12),
                type: 'powerup',
                sparkle: true,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: MathUtils.random(-5, 5)
            });
        }
    }

    /**
     * Update particles
     */
    update(deltaTime) {
        this.particles = this.particles.filter(p => {
            p.life -= deltaTime * CONFIG.PARTICLES.FADE_RATE;

            // Update position based on velocity
            if (p.vx !== undefined) {
                p.x += p.vx * deltaTime;
                p.y += p.vy * deltaTime;

                // Apply gravity to explosion/powerup particles
                if (p.type === 'explosion' || p.type === 'powerup') {
                    p.vy += 200 * deltaTime; // Gravity
                }

                // Air resistance
                p.vx *= 0.98;
                p.vy *= 0.98;
            }

            // Update rotation for sparkle particles
            if (p.rotation !== undefined) {
                p.rotation += p.rotationSpeed * deltaTime;
            }

            return p.life > 0;
        });
    }

    /**
     * Render particles with enhanced effects
     */
    render(ctx, camera) {
        this.particles.forEach(p => {
            const alpha = p.life / p.maxLife;
            const x = p.x - camera.getX();
            const y = p.y - camera.getY();

            ctx.save();

            if (p.type === 'explosion') {
                // Explosion particles with glow
                const glow = ctx.createRadialGradient(x, y, 0, x, y, p.size * 2);
                glow.addColorStop(0, this.addAlpha(p.color, alpha));
                glow.addColorStop(1, 'transparent');

                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(x, y, p.size * 2, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = this.addAlpha(p.color, alpha);
                ctx.beginPath();
                ctx.arc(x, y, p.size, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.type === 'collect' || p.type === 'powerup') {
                // Sparkle particles
                if (p.sparkle) {
                    ctx.translate(x, y);
                    if (p.rotation !== undefined) {
                        ctx.rotate(p.rotation);
                    }

                    // Glow
                    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 3);
                    glow.addColorStop(0, this.addAlpha(p.color, alpha * 0.8));
                    glow.addColorStop(1, 'transparent');

                    ctx.fillStyle = glow;
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size * 3, 0, Math.PI * 2);
                    ctx.fill();

                    // Star shape
                    ctx.fillStyle = this.addAlpha('#ffffff', alpha);
                    ctx.beginPath();
                    for (let i = 0; i < 4; i++) {
                        const angle = (Math.PI / 2) * i;
                        const outerDist = p.size;
                        if (i === 0) {
                            ctx.moveTo(Math.cos(angle) * outerDist, Math.sin(angle) * outerDist);
                        } else {
                            ctx.lineTo(Math.cos(angle) * outerDist, Math.sin(angle) * outerDist);
                        }
                    }
                    ctx.closePath();
                    ctx.fill();
                } else {
                    ctx.fillStyle = this.addAlpha(p.color, alpha);
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else {
                // Trail particles (original style)
                const glow = ctx.createRadialGradient(x, y, 0, x, y, p.size * 2);
                glow.addColorStop(0, this.addAlpha(p.color, alpha * 0.8));
                glow.addColorStop(1, 'transparent');

                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(x, y, p.size * 2, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = this.addAlpha(p.color, alpha);
                ctx.beginPath();
                ctx.arc(x, y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        });
    }

    /**
     * Add alpha to color string
     */
    addAlpha(color, alpha) {
        // Handle hex colors
        if (color.startsWith('#')) {
            const c = parseInt(color.slice(1), 16);
            const r = (c >> 16) & 255;
            const g = (c >> 8) & 255;
            const b = c & 255;
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        // Handle rgb/rgba colors
        if (color.startsWith('rgb')) {
            return color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
        }
        return color;
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
