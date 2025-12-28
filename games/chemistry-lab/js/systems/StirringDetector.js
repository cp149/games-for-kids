/**
 * StirringDetector - Detects circular stirring motion
 * Uses angular velocity accumulation to track rotations
 */

class StirringDetector {
  constructor(centerX, centerY, requiredRotations = 3) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.requiredRotations = requiredRotations;
    this.angleAccumulated = 0;
    this.lastAngle = null;
    this.isStirring = false;
    this.particles = [];
  }

  /**
   * Handle pointer move event
   * @param {number} pointerX - Pointer X position
   * @param {number} pointerY - Pointer Y position
   * @returns {Object} - Status {complete, progress, rotations}
   */
  onPointerMove(pointerX, pointerY) {
    // Calculate angle relative to pot center
    const dx = pointerX - this.centerX;
    const dy = pointerY - this.centerY;
    const currentAngle = Math.atan2(dy, dx);

    if (this.lastAngle !== null) {
      // Calculate angle increment (handle -π to π wrap)
      let deltaAngle = currentAngle - this.lastAngle;

      // Normalize delta to [-π, π]
      if (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
      if (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;

      // Accumulate absolute angle (direction doesn't matter)
      this.angleAccumulated += Math.abs(deltaAngle);

      // Create particle effect during stirring
      if (Math.random() < 0.3) { // 30% chance per frame
        this.particles.push({
          x: pointerX + (Math.random() - 0.5) * 20,
          y: pointerY + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 50,
          vy: (Math.random() - 0.5) * 50,
          life: 1.0,
          decay: 0.015
        });
      }
    }

    this.lastAngle = currentAngle;

    // Calculate progress
    const rotations = this.angleAccumulated / (2 * Math.PI);
    const progress = Math.min(rotations / this.requiredRotations, 1.0);
    const complete = rotations >= this.requiredRotations;

    return {
      complete,
      progress,
      rotations
    };
  }

  /**
   * Update particles
   * @param {number} dt - Delta time in seconds
   */
  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // Update position
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Decay life
      p.life -= p.decay;

      // Remove dead particles
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Render particles
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderParticles(ctx) {
    ctx.save();

    this.particles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = '#FFD700'; // Gold color
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  /**
   * Reset detector
   */
  reset() {
    this.angleAccumulated = 0;
    this.lastAngle = null;
    this.isStirring = false;
    this.particles = [];
  }

  /**
   * Start stirring session
   * @param {number} centerX - Center X position
   * @param {number} centerY - Center Y position
   */
  startStirring(centerX, centerY) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.isStirring = true;
    this.reset();
  }

  /**
   * Stop stirring session
   */
  stopStirring() {
    this.isStirring = false;
    this.reset();
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.particles = [];
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.StirringDetector = StirringDetector;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StirringDetector };
}
