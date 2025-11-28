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

  /**
   * Wait for specified milliseconds
   */
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Particle effect generator
 */
export class ParticleSystem {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.particles = [];
  }

  createExplosion(x, y, count = 20, color = '#00ffff') {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 2 + Math.random() * 3;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.02 + Math.random() * 0.02,
        size: 2 + Math.random() * 3,
        color
      });
    }
  }

  createTrail(x1, y1, x2, y2, count = 10, color = '#00ffff') {
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const x = x1 + (x2 - x1) * t;
      const y = y1 + (y2 - y1) * t;

      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        life: 1,
        decay: 0.02 + Math.random() * 0.01,
        size: 1 + Math.random() * 2,
        color
      });
    }
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  render() {
    this.particles.forEach(p => {
      this.ctx.save();
      this.ctx.globalAlpha = p.life;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
  }

  clear() {
    this.particles = [];
  }
}

export default AnimationManager;
