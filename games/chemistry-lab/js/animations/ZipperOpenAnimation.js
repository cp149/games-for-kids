/**
 * Zipper Open Animation
 * Animated separation effect for reversible reactions
 */

class ZipperOpenAnimation {
  constructor(canvas, config) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.config = config;

    this.duration = 800; // milliseconds
    this.startTime = null;
    this.isActive = false;

    this.sourceCard = null;
    this.targetCards = [];

    this.particles = [];
  }

  /**
   * Start zipper open animation
   */
  start(sourceCard, targetCardTypes, onComplete) {
    this.isActive = true;
    this.startTime = Date.now();
    this.sourceCard = sourceCard;
    this.onComplete = onComplete;

    // Create particle effect
    this.createZipperParticles(sourceCard);

    // Store target card types for creation
    this.targetCardTypes = targetCardTypes;
  }

  /**
   * Create zipper opening particle effect
   */
  createZipperParticles(card) {
    const rect = card.element.getBoundingClientRect();
    const canvasRect = this.canvas.getBoundingClientRect();

    const centerX = rect.left - canvasRect.left + rect.width / 2;
    const centerY = rect.top - canvasRect.top + rect.height / 2;

    // Create particles along zipper line
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const speed = 50 + Math.random() * 50;

      this.particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        color: '#FFD700'
      });
    }
  }

  /**
   * Update animation
   */
  update(deltaTime) {
    if (!this.isActive) return;

    const elapsed = Date.now() - this.startTime;
    const progress = Math.min(elapsed / this.duration, 1.0);

    // Update particles
    const dt = deltaTime / 1000;
    this.particles.forEach(particle => {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.life -= dt * 2;
    });

    // Remove dead particles
    this.particles = this.particles.filter(p => p.life > 0);

    // Check if animation complete
    if (progress >= 1.0 && this.particles.length === 0) {
      this.isActive = false;
      if (this.onComplete) {
        this.onComplete(this.targetCardTypes);
      }
    }
  }

  /**
   * Render animation
   */
  render(ctx) {
    if (!this.isActive) return;

    // Render particles
    this.particles.forEach(particle => {
      ctx.save();
      ctx.globalAlpha = particle.life;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Render zipper opening visual
    if (this.sourceCard && this.sourceCard.element) {
      const elapsed = Date.now() - this.startTime;
      const progress = Math.min(elapsed / this.duration, 1.0);

      const rect = this.sourceCard.element.getBoundingClientRect();
      const canvasRect = this.canvas.getBoundingClientRect();

      const x = rect.left - canvasRect.left;
      const y = rect.top - canvasRect.top;
      const width = rect.width;
      const height = rect.height;

      // Draw zipper opening line
      ctx.save();
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);

      const centerX = x + width / 2;
      const gapWidth = progress * width * 0.8;

      ctx.beginPath();
      ctx.moveTo(centerX - gapWidth / 2, y);
      ctx.lineTo(centerX - gapWidth / 2, y + height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(centerX + gapWidth / 2, y);
      ctx.lineTo(centerX + gapWidth / 2, y + height);
      ctx.stroke();

      ctx.restore();
    }
  }

  /**
   * Destroy animation
   */
  destroy() {
    this.isActive = false;
    this.particles = [];
    this.sourceCard = null;
    this.targetCards = [];
    this.onComplete = null;
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.ZipperOpenAnimation = ZipperOpenAnimation;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ZipperOpenAnimation };
}
