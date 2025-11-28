/**
 * Relay Mechanism
 * Passes signals through with optional delay
 */

import { Mechanism } from './mechanism.js';

export class Relay extends Mechanism {
  constructor(x, y, id) {
    super(x, y, 'relay');
    this.id = id;
    this.size = 35;
    this.pulsePhase = 0;
    this.delay = 200; // ms
  }

  receiveSignal(from) {
    // Relay activates/deactivates based on input
    setTimeout(() => {
      if (from.active) {
        this.activate();
      } else {
        this.deactivate();
      }
    }, this.delay);
  }

  onActivate() {
    this.propagateSignal(this.delay);
  }

  onDeactivate() {
    this.propagateSignal(0);
  }

  update(deltaTime) {
    // Pulse animation when active
    if (this.active) {
      this.pulsePhase += deltaTime * 0.005;
    } else {
      this.pulsePhase = 0;
    }
  }

  render(ctx) {
    const centerX = this.x;
    const centerY = this.y;
    const radius = this.size / 2;
    const pulse = Math.sin(this.pulsePhase) * 0.2 + 1;

    ctx.save();
    ctx.translate(centerX, centerY);

    // Glow effect when active
    if (this.active) {
      ctx.shadowBlur = 25 * pulse;
      ctx.shadowColor = '#ffaa00';
    }

    // Draw diamond shape
    ctx.beginPath();
    ctx.moveTo(0, -radius);
    ctx.lineTo(radius, 0);
    ctx.lineTo(0, radius);
    ctx.lineTo(-radius, 0);
    ctx.closePath();

    ctx.fillStyle = this.active ? '#ffaa00' : '#4a5a6a';
    ctx.fill();

    ctx.strokeStyle = this.active ? '#ffcc44' : '#6a7a8a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner arrows showing direction
    const arrowSize = radius * 0.3;
    ctx.fillStyle = this.active ? '#ffffff' : '#8a9aaa';

    // Arrow pointing right
    ctx.beginPath();
    ctx.moveTo(-arrowSize, -arrowSize * 0.5);
    ctx.lineTo(arrowSize, 0);
    ctx.lineTo(-arrowSize, arrowSize * 0.5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  getSize() {
    return this.size;
  }
}

export default Relay;
