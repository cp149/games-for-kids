/**
 * Renderer for Chain Reaction Lab
 * Handles all canvas drawing with beautiful effects
 */

import { ParticleSystem } from '../utils/animation.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = new ParticleSystem(canvas, this.ctx);
    this.gridSize = 50;
    this.gridColor = 'rgba(0, 255, 255, 0.05)';
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawBackground() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Dark gradient background
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#0a0a1a');
    gradient.addColorStop(0.5, '#12121e');
    gradient.addColorStop(1, '#1a1a2e');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = this.gridColor;
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x < w; x += this.gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y < h; y += this.gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }

  drawGlowingTile(x, y, size, color, intensity = 1) {
    const ctx = this.ctx;

    ctx.save();
    ctx.shadowBlur = 20 * intensity;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.1 * intensity;

    ctx.fillRect(
      x - size / 2,
      y - size / 2,
      size,
      size
    );

    ctx.restore();
  }

  renderConnections(mechanisms) {
    mechanisms.forEach(mechanism => {
      mechanism.renderConnections(this.ctx);
    });
  }

  renderMechanisms(mechanisms) {
    mechanisms.forEach(mechanism => {
      mechanism.render(this.ctx);
    });
  }

  renderPlayer(player) {
    player.render(this.ctx);
  }

  renderParticles() {
    this.particles.render();
  }

  updateParticles() {
    this.particles.update();
  }

  createExplosion(x, y, color = '#00ffff') {
    this.particles.createExplosion(x, y, 20, color);
  }

  createEnergyTrail(x1, y1, x2, y2, color = '#00ffff') {
    this.particles.createTrail(x1, y1, x2, y2, 10, color);
  }

  createRing(x, y, radius, color = '#00ff88') {
    const particleCount = 30;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      this.particles.particles.push({
        x: px,
        y: py,
        vx: Math.cos(angle) * 2,
        vy: Math.sin(angle) * 2,
        color: color,
        life: 0.5,
        decay: 0.02,
        size: 4
      });
    }
  }

  createConfetti(x, y, angle) {
    const colors = ['#ffff00', '#ff00ff', '#00ffff', '#00ff00', '#ff0000'];
    for (let i = 0; i < 3; i++) {
      const speed = 3 + Math.random() * 2;
      this.particles.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.5,
        decay: 0.01,
        size: 5 + Math.random() * 3
      });
    }
  }

  drawHintArrow(x, y) {
    const ctx = this.ctx;
    const bounceY = Math.sin(Date.now() * 0.004) * 15;

    ctx.save();
    ctx.font = '70px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Glow effect
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#ffff00';
    ctx.fillStyle = '#ffff00';
    ctx.fillText('👆', x, y - 80 + bounceY);

    ctx.restore();
  }

  /**
   * Render complete frame
   */
  render(gameState) {
    this.clear();
    this.drawBackground();

    // Render level if it exists
    if (gameState.level) {
      gameState.level.render(this.ctx);
    }

    // Render particles (on top)
    this.renderParticles();

    // Render hint arrow on first button (Level 1 only)
    if (gameState.showInitialHint && gameState.level) {
      const firstButton = gameState.level.mechanisms.find(m => m.type === 'button');
      if (firstButton) {
        this.drawHintArrow(firstButton.x, firstButton.y);
      }
    }
  }

  /**
   * Resize canvas to fill container
   */
  resize() {
    const container = this.canvas.parentElement;
    const rect = container.getBoundingClientRect();

    // Ensure minimum size
    const width = Math.max(rect.width, 600);
    const height = Math.max(rect.height, 600);

    this.canvas.width = width;
    this.canvas.height = height;
  }
}

export default Renderer;
