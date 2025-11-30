/**
 * Animation utilities for smooth effects
 */

export class AnimationManager {
  constructor() {
    this.activeAnimations = new Map();
    this.frameId = null;
  }

  /**
   * Animate a value over time
   */
  animate(key, from, to, duration, callback, easing = 'easeInOutCubic') {
    const startTime = performance.now();
    const easingFn = this.getEasingFunction(easing);

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easingFn(progress);
      const currentValue = from + (to - from) * easedProgress;

      callback(currentValue, progress);

      if (progress < 1) {
        this.activeAnimations.set(key, requestAnimationFrame(animate));
      } else {
        this.activeAnimations.delete(key);
      }
    };

    // Cancel existing animation with same key
    this.cancel(key);

    // Start new animation
    this.activeAnimations.set(key, requestAnimationFrame(animate));
  }

  /**
   * Cancel an animation by key
   */
  cancel(key) {
    const frameId = this.activeAnimations.get(key);
    if (frameId) {
      cancelAnimationFrame(frameId);
      this.activeAnimations.delete(key);
    }
  }

  /**
   * Cancel all animations
   */
  cancelAll() {
    this.activeAnimations.forEach((frameId) => {
      cancelAnimationFrame(frameId);
    });
    this.activeAnimations.clear();
  }

  /**
   * Get easing function
   */
  getEasingFunction(name) {
    const easings = {
      linear: t => t,
      easeInQuad: t => t * t,
      easeOutQuad: t => t * (2 - t),
      easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
      easeInCubic: t => t * t * t,
      easeOutCubic: t => (--t) * t * t + 1,
      easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
      easeInElastic: t => {
        if (t === 0 || t === 1) return t;
        const p = 0.3;
        return -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1 - p / 4) * (2 * Math.PI) / p);
      },
      easeOutElastic: t => {
        if (t === 0 || t === 1) return t;
        const p = 0.3;
        return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
      },
      easeInBounce: t => 1 - easings.easeOutBounce(1 - t),
      easeOutBounce: t => {
        if (t < 1 / 2.75) {
          return 7.5625 * t * t;
        } else if (t < 2 / 2.75) {
          return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
        } else if (t < 2.5 / 2.75) {
          return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
        } else {
          return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
        }
      }
    };

    return easings[name] || easings.linear;
  }

  /**
   * Lerp (linear interpolation)
   */
  lerp(start, end, t) {
    return start + (end - start) * t;
  }
}

/**
 * Particle effect generator with object pooling
 */
export class ParticleSystem {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.particles = [];
    this.maxParticles = 500; // Hard limit to prevent memory leak

    // Object pool to reduce GC pressure
    this.pool = [];
    this.poolSize = 500;

    // Pre-allocate particle objects
    for (let i = 0; i < this.poolSize; i++) {
      this.pool.push(this.createParticleObject());
    }
  }

  /**
   * Create a particle object template
   */
  createParticleObject() {
    return {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      decay: 0,
      size: 0,
      color: ''
    };
  }

  /**
   * Acquire a particle from pool or create new one
   */
  acquireParticle() {
    return this.pool.pop() || this.createParticleObject();
  }

  /**
   * Release particle back to pool
   */
  releaseParticle(particle) {
    if (this.pool.length < this.poolSize) {
      this.pool.push(particle);
    }
  }

  createExplosion(x, y, count = 20, color = '#00ffff') {
    // Limit total particle count
    const availableSlots = this.maxParticles - this.particles.length;
    const actualCount = Math.min(count, availableSlots);

    for (let i = 0; i < actualCount; i++) {
      const angle = (Math.PI * 2 * i) / actualCount;
      const speed = 2 + Math.random() * 3;

      // Acquire particle from pool and configure it
      const particle = this.acquireParticle();
      particle.x = x;
      particle.y = y;
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed;
      particle.life = 1;
      particle.decay = 0.02 + Math.random() * 0.02;
      particle.size = 2 + Math.random() * 3;
      particle.color = color;

      this.particles.push(particle);
    }
  }

  createTrail(x1, y1, x2, y2, count = 10, color = '#00ffff') {
    // Limit total particle count
    const availableSlots = this.maxParticles - this.particles.length;
    const actualCount = Math.min(count, availableSlots);

    for (let i = 0; i < actualCount; i++) {
      const t = i / actualCount;
      const px = x1 + (x2 - x1) * t;
      const py = y1 + (y2 - y1) * t;

      // Acquire particle from pool and configure it
      const particle = this.acquireParticle();
      particle.x = px;
      particle.y = py;
      particle.vx = (Math.random() - 0.5) * 0.5;
      particle.vy = (Math.random() - 0.5) * 0.5;
      particle.life = 1;
      particle.decay = 0.02 + Math.random() * 0.01;
      particle.size = 1 + Math.random() * 2;
      particle.color = color;

      this.particles.push(particle);
    }
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;

      if (p.life <= 0) {
        // Return particle to pool before removing
        this.releaseParticle(p);
        this.particles.splice(i, 1);
      }
    }
  }

  render() {
    // Use for loop instead of forEach for better performance
    const len = this.particles.length;
    for (let i = 0; i < len; i++) {
      const p = this.particles[i];
      this.ctx.save();
      this.ctx.globalAlpha = p.life;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  clear() {
    // Return all particles to pool before clearing
    for (let i = 0, len = this.particles.length; i < len; i++) {
      this.releaseParticle(this.particles[i]);
    }
    this.particles = [];
  }
}

export default AnimationManager;
