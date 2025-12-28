/**
 * MicroParticle - Individual particle for micro-view state demonstration
 * Represents a single molecule with state-based behavior
 */
class MicroParticle {
  constructor(x, y, state, config) {
    this.x = x;
    this.y = y;
    this.state = state; // 'solid', 'liquid', 'gas'
    this.config = config;

    // Physics properties
    this.vx = 0;
    this.vy = 0;
    this.targetX = x;
    this.targetY = y;

    // Visual properties
    this.emoji = this.getEmojiForState(state);
    this.size = 20;
    this.opacity = 1;

    // Animation properties
    this.vibrateOffset = 0;
    this.rotationAngle = 0;

    // Transition state
    this.isTransitioning = false;
    this.transitionProgress = 0;
    this.targetState = null;
  }

  /**
   * Get emoji representation for state
   */
  getEmojiForState(state) {
    const stateEmojis = {
      solid: '🥶',
      liquid: '🌊',
      gas: '🚀'
    };
    return stateEmojis[state] || '⚪';
  }

  /**
   * Update particle physics based on state
   */
  update(dt, allParticles) {
    if (this.isTransitioning) {
      this.updateTransition(dt);
      return;
    }

    switch (this.state) {
      case 'solid':
        this.updateSolidBehavior(dt, allParticles);
        break;
      case 'liquid':
        this.updateLiquidBehavior(dt, allParticles);
        break;
      case 'gas':
        this.updateGasBehavior(dt);
        break;
    }

    // Update position
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Update animation timers
    this.vibrateOffset += dt * 10;
    this.rotationAngle += dt * 2;
  }

  /**
   * Solid behavior: huddle together, vibrate in place
   */
  updateSolidBehavior(dt, allParticles) {
    // Find center of mass
    const centerX = this.config.centerX;
    const centerY = this.config.centerY;

    // Pull towards center (strong cohesion)
    const dx = centerX - this.x;
    const dy = centerY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Strong attraction to center
    const attractionStrength = 200;
    this.vx += (dx / dist) * attractionStrength * dt;
    this.vy += (dy / dist) * attractionStrength * dt;

    // Damping (friction)
    this.vx *= 0.9;
    this.vy *= 0.9;

    // Limit max speed
    const maxSpeed = 20;
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > maxSpeed) {
      this.vx = (this.vx / speed) * maxSpeed;
      this.vy = (this.vy / speed) * maxSpeed;
    }

    // Add vibration (thermal motion)
    this.vx += (Math.random() - 0.5) * 50 * dt;
    this.vy += (Math.random() - 0.5) * 50 * dt;
  }

  /**
   * Liquid behavior: slide over each other, slow random walk
   */
  updateLiquidBehavior(dt, allParticles) {
    // Moderate attraction to center
    const centerX = this.config.centerX;
    const centerY = this.config.centerY;

    const dx = centerX - this.x;
    const dy = centerY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Weaker attraction than solid
    const attractionStrength = 50;
    this.vx += (dx / dist) * attractionStrength * dt;
    this.vy += (dy / dist) * attractionStrength * dt;

    // Random walk component (stronger than solid)
    this.vx += (Math.random() - 0.5) * 100 * dt;
    this.vy += (Math.random() - 0.5) * 100 * dt;

    // Damping
    this.vx *= 0.85;
    this.vy *= 0.85;

    // Limit speed
    const maxSpeed = 30;
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > maxSpeed) {
      this.vx = (this.vx / speed) * maxSpeed;
      this.vy = (this.vy / speed) * maxSpeed;
    }

    // Collision with other particles (slide past)
    allParticles.forEach(other => {
      if (other === this || other.state !== 'liquid') return;

      const dx = other.x - this.x;
      const dy = other.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this.size && dist > 0) {
        // Push apart gently
        const pushStrength = 20;
        this.vx -= (dx / dist) * pushStrength * dt;
        this.vy -= (dy / dist) * pushStrength * dt;
      }
    });
  }

  /**
   * Gas behavior: fast straight-line motion, bounce off boundaries
   */
  updateGasBehavior(dt) {
    // Maintain high speed
    const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);

    if (currentSpeed < 100) {
      // Accelerate randomly
      const angle = Math.random() * Math.PI * 2;
      this.vx += Math.cos(angle) * 200 * dt;
      this.vy += Math.sin(angle) * 200 * dt;
    }

    // Limit max speed
    const maxSpeed = 150;
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > maxSpeed) {
      this.vx = (this.vx / speed) * maxSpeed;
      this.vy = (this.vy / speed) * maxSpeed;
    }

    // Bounce off boundaries
    const bounds = this.config.bounds;
    if (this.x < bounds.left || this.x > bounds.right) {
      this.vx *= -1;
      this.x = Math.max(bounds.left, Math.min(bounds.right, this.x));
    }
    if (this.y < bounds.top || this.y > bounds.bottom) {
      this.vy *= -1;
      this.y = Math.max(bounds.top, Math.min(bounds.bottom, this.y));
    }
  }

  /**
   * Start state transition animation
   */
  transitionTo(newState, duration = 2000) {
    this.isTransitioning = true;
    this.targetState = newState;
    this.transitionProgress = 0;
    this.transitionDuration = duration;
  }

  /**
   * Update transition animation
   */
  updateTransition(dt) {
    this.transitionProgress += dt * 1000; // Convert to ms

    if (this.transitionProgress >= this.transitionDuration) {
      // Transition complete
      this.state = this.targetState;
      this.emoji = this.getEmojiForState(this.state);
      this.isTransitioning = false;
      this.transitionProgress = 0;
      return;
    }

    // Interpolate emoji (simple cross-fade handled in render)
    const progress = this.transitionProgress / this.transitionDuration;

    // Gradually change behavior during transition
    if (progress > 0.5) {
      // Already switched emoji at midpoint
      if (this.emoji !== this.getEmojiForState(this.targetState)) {
        this.emoji = this.getEmojiForState(this.targetState);
      }
    }
  }

  /**
   * Render particle
   */
  render(ctx) {
    ctx.save();
    ctx.globalAlpha = this.opacity;

    // Position with vibration for solid state
    let renderX = this.x;
    let renderY = this.y;

    if (this.state === 'solid' && !this.isTransitioning) {
      // Add vibration offset
      renderX += Math.sin(this.vibrateOffset) * 2;
      renderY += Math.cos(this.vibrateOffset * 1.3) * 2;
    }

    // Draw emoji
    ctx.font = `${this.size}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.emoji, renderX, renderY);

    // Draw jetpack trail for gas state
    if (this.state === 'gas' && !this.isTransitioning) {
      ctx.globalAlpha = this.opacity * 0.3;
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(renderX - this.vx * 0.02, renderY - this.vy * 0.02, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Get render data for debugging
   */
  getRenderData() {
    return {
      x: this.x,
      y: this.y,
      emoji: this.emoji,
      state: this.state,
      vx: this.vx,
      vy: this.vy
    };
  }

  /**
   * Clean up resources
   */
  destroy() {
    // No resources to clean for now
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.MicroParticle = MicroParticle;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MicroParticle };
}
