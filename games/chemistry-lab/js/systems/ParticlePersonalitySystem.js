/**
 * ParticlePersonalitySystem - Micro-view particle state demonstration
 * Shows molecular behavior for solid, liquid, and gas states
 */
class ParticlePersonalitySystem {
  constructor(game, config) {
    this.game = game;
    this.config = config;
    this.canvas = game.canvas;
    this.ctx = game.ctx;

    // Zoom system
    this.zoomTransition = new ZoomTransition(this.canvas, config);

    // Particle system
    this.particles = [];
    this.particleCount = 20;

    // State
    this.isActive = false;
    this.currentState = null;
    this.demonstrationTimer = 0;
    this.demonstrationDuration = 2000; // 2 seconds demonstration

    // Tutorial flags (only show once per state transition)
    this.shownDemonstrations = new Set();

    // Setup zoom callbacks
    this.setupZoomCallbacks();
  }

  /**
   * Setup zoom transition callbacks
   */
  setupZoomCallbacks() {
    this.zoomTransition.onZoomStart = (from, to) => {
      console.log(`Zoom transition: ${from.toFixed(1)}x → ${to.toFixed(1)}x`);
    };

    this.zoomTransition.onZoomComplete = (scale) => {
      if (scale === 1.0) {
        // Exited micro view
        this.cleanup();
      }
    };
  }

  /**
   * Trigger micro-view demonstration for state transition
   * @param {string} transition - e.g., 'solid-to-liquid', 'liquid-to-gas'
   * @param {number} x - Focus X position
   * @param {number} y - Focus Y position
   */
  triggerDemonstration(transition, x, y) {
    // Only show each transition type once (tutorial mode)
    if (this.shownDemonstrations.has(transition)) {
      console.log(`Already shown ${transition} demo, skipping`);
      return;
    }

    console.log(`Triggering micro-view: ${transition}`);
    this.shownDemonstrations.add(transition);

    // Parse transition
    const [fromState, toState] = this.parseTransition(transition);

    // Create initial particles in fromState
    this.createParticles(fromState, x, y);

    // Start zoom animation
    this.currentState = fromState;
    this.isActive = true;
    this.demonstrationTimer = 0;
    this.zoomTransition.zoomIn(x, y, 1000);

    // Schedule state transition
    setTimeout(() => {
      this.transitionParticles(toState);
    }, 1000); // After zoom-in completes

    // Schedule zoom-out
    setTimeout(() => {
      this.zoomTransition.zoomOut(1000);
    }, this.demonstrationDuration + 1000);
  }

  /**
   * Parse transition string into states
   */
  parseTransition(transition) {
    const map = {
      'solid-to-liquid': ['solid', 'liquid'],
      'liquid-to-gas': ['liquid', 'gas'],
      'gas-to-liquid': ['gas', 'liquid'],
      'liquid-to-solid': ['liquid', 'solid']
    };
    return map[transition] || ['solid', 'liquid'];
  }

  /**
   * Create particles in initial state
   */
  createParticles(state, focusX, focusY) {
    this.particles = [];

    for (let i = 0; i < this.particleCount; i++) {
      // Position particles in a cluster
      const angle = (i / this.particleCount) * Math.PI * 2;
      const radius = state === 'solid' ? 20 : state === 'liquid' ? 40 : 60;

      const x = focusX + Math.cos(angle) * radius;
      const y = focusY + Math.sin(angle) * radius;

      const particle = new MicroParticle(x, y, state, {
        centerX: focusX,
        centerY: focusY,
        bounds: {
          left: focusX - 100,
          right: focusX + 100,
          top: focusY - 100,
          bottom: focusY + 100
        }
      });

      this.particles.push(particle);
    }
  }

  /**
   * Transition all particles to new state
   */
  transitionParticles(newState) {
    console.log(`Transitioning particles to ${newState}`);
    this.currentState = newState;

    this.particles.forEach(particle => {
      particle.transitionTo(newState, 2000);
    });
  }

  /**
   * Update particle system
   */
  update(dt) {
    if (!this.isActive) return;

    // Update zoom transition
    this.zoomTransition.update(dt);

    // Update all particles
    this.particles.forEach(particle => {
      particle.update(dt, this.particles);
    });

    // Update demonstration timer
    if (this.zoomTransition.isInMicroView()) {
      this.demonstrationTimer += dt * 1000;
    }
  }

  /**
   * Render particle system
   */
  render(ctx) {
    if (!this.isActive || this.particles.length === 0) return;

    // Apply zoom transformation
    this.zoomTransition.applyTransform(ctx);

    // Render all particles
    this.particles.forEach(particle => {
      particle.render(ctx);
    });

    // Restore transformation
    this.zoomTransition.restoreTransform(ctx);

    // Render UI overlay (state label)
    this.renderStateLabel(ctx);
  }

  /**
   * Render state label during demonstration
   */
  renderStateLabel(ctx) {
    if (!this.zoomTransition.isInMicroView()) return;

    const stateNames = {
      solid: 'Solid State (固态)',
      liquid: 'Liquid State (液态)',
      gas: 'Gas State (气态)'
    };

    const label = stateNames[this.currentState] || '';
    if (!label) return;

    ctx.save();
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(label, this.config.CANVAS.CENTER_X, 50);

    // Show emoji legend
    ctx.font = '16px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    const legends = {
      solid: '🥶 = Molecules vibrating in place',
      liquid: '🌊 = Molecules sliding past each other',
      gas: '🚀 = Molecules flying freely'
    };
    ctx.fillText(legends[this.currentState] || '', this.config.CANVAS.CENTER_X, 80);

    ctx.restore();
  }

  /**
   * Check if demonstration is active
   */
  isDemonstrating() {
    return this.isActive && this.zoomTransition.isActive();
  }

  /**
   * Cleanup particles and reset
   */
  cleanup() {
    this.particles.forEach(p => p.destroy());
    this.particles = [];
    this.isActive = false;
    this.demonstrationTimer = 0;
  }

  /**
   * Reset tutorial flags (for testing)
   */
  resetTutorial() {
    this.shownDemonstrations.clear();
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.cleanup();
    if (this.zoomTransition) {
      this.zoomTransition.destroy();
    }
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.ParticlePersonalitySystem = ParticlePersonalitySystem;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ParticlePersonalitySystem };
}
