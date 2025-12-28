/**
 * ParticlePool - Object pool for particles to eliminate GC pauses
 * Pre-allocates particles and reuses them for 60fps stability
 */
class ParticlePool {
  constructor(size = 50) {
    this.pool = [];
    this.active = [];
    this.poolSize = size;

    // Pre-allocate particles
    for (let i = 0; i < size; i++) {
      this.pool.push(this.createParticle());
    }
  }

  /**
   * Create a new particle object
   */
  createParticle() {
    return {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      opacity: 1,
      lifespan: 1000,
      age: 0,
      type: 'default',
      active: false,

      reset(x, y, type, vx = 0, vy = 0, lifespan = 1000) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.opacity = 1;
        this.lifespan = lifespan;
        this.age = 0;
        this.type = type;
        this.active = true;
        return this;
      }
    };
  }

  /**
   * Spawn a particle from the pool
   */
  spawn(x, y, type, vx = 0, vy = 0, lifespan = 1000) {
    let particle;

    if (this.pool.length > 0) {
      // Get from pool
      particle = this.pool.pop();
      particle.reset(x, y, type, vx, vy, lifespan);
    } else {
      // Pool exhausted - create new (with warning)
      console.warn('ParticlePool exhausted, creating new particle');
      particle = this.createParticle();
      particle.reset(x, y, type, vx, vy, lifespan);
    }

    this.active.push(particle);
    return particle;
  }

  /**
   * Update all active particles
   */
  update(dt) {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const particle = this.active[i];

      // Update age
      particle.age += dt * 1000; // Convert to ms

      // Update position
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;

      // Update opacity (fade out)
      particle.opacity = 1 - (particle.age / particle.lifespan);

      // Apply gravity (optional)
      particle.vy += 100 * dt; // 100 px/s^2 downward

      // Check if particle is dead
      if (particle.age >= particle.lifespan) {
        // Return to pool
        particle.active = false;
        this.active.splice(i, 1);
        this.pool.push(particle);
      }
    }
  }

  /**
   * Render all active particles
   */
  render(ctx) {
    this.active.forEach(particle => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, particle.opacity);

      // Different rendering based on type
      if (particle.type === 'spark') {
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (particle.type === 'smoke') {
        ctx.fillStyle = '#888';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Default particle
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }

  /**
   * Get pool statistics
   */
  getStats() {
    return {
      active: this.active.length,
      pooled: this.pool.length,
      total: this.poolSize,
      utilization: (this.active.length / this.poolSize * 100).toFixed(1) + '%'
    };
  }

  /**
   * Clear all active particles
   */
  clear() {
    // Return all active particles to pool
    this.active.forEach(p => {
      p.active = false;
      this.pool.push(p);
    });
    this.active = [];
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.clear();
    this.pool = [];
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.ParticlePool = ParticlePool;
}

// Export for Node.js tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ParticlePool;
}
