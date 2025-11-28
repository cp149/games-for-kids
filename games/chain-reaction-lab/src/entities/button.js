/**
 * Button Mechanism
 * Interactive button that can be clicked to activate/deactivate
 */

import { Mechanism } from './mechanism.js';

export class Button extends Mechanism {
  constructor(x, y, id) {
    super(x, y, 'button');
    this.id = id;
    this.size = 40;
    this.glowIntensity = 0;
    this.clickAnimProgress = 0;
  }

  onToggle() {
    this.clickAnimProgress = 1;
    this.propagateSignal(200); // Delay for visual effect
  }

  update(deltaTime) {
    // Glow pulse animation when active
    if (this.active) {
      this.glowIntensity = 0.5 + Math.sin(Date.now() * 0.003) * 0.5;
    } else {
      this.glowIntensity *= 0.9; // Fade out
    }

    // Click animation decay
    if (this.clickAnimProgress > 0) {
      this.clickAnimProgress -= deltaTime * 0.003;
      if (this.clickAnimProgress < 0) this.clickAnimProgress = 0;
    }
  }

  render(ctx) {
    const centerX = this.x;
    const centerY = this.y;
    const radius = this.size / 2;

    // Pulse animation - larger when active
    const pulseScale = this.active
      ? 1.15 + Math.sin(Date.now() * 0.003) * 0.05
      : 1 + Math.sin(Date.now() * 0.002) * 0.03;
    const scale = (1 - this.clickAnimProgress * 0.1) * pulseScale;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);

    // Strong glow when active
    if (this.active && this.glowIntensity > 0) {
      ctx.shadowBlur = 50 * this.glowIntensity;
      ctx.shadowColor = '#00ff00';
    }

    // Outer ring - bright colors
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = this.active ? '#00ff00' : '#2a4f7c';
    ctx.fill();

    // Thick border
    ctx.strokeStyle = this.active ? '#00ff88' : '#4a6f9c';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Inner circle
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = this.active ? '#ffffff' : '#1a2f4c';
    ctx.fill();

    // Strong highlight when active
    if (this.active) {
      ctx.beginPath();
      ctx.arc(0, -radius * 0.3, radius * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fill();

      // Particles around button
      for (let i = 0; i < 4; i++) {
        const angle = Date.now() * 0.001 + (Math.PI * 2 * i / 4);
        const dist = radius * 1.3;
        const px = Math.cos(angle) * dist;
        const py = Math.sin(angle) * dist;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#00ff88';
        ctx.fill();
      }
    }

    ctx.restore();
  }

  getSize() {
    return this.size;
  }
}

export default Button;
