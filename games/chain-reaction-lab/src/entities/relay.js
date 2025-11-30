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

    // Frame-based delay system (no setTimeout needed)
    this.pendingSignal = null; // null | true | false
    this.signalDelayTimer = 0;
  }

  receiveSignal(from) {
    // Queue signal for delayed activation
    this.pendingSignal = from.active;
    this.signalDelayTimer = 0;
  }

  onActivate() {
    this.propagateSignal(0);
  }

  onDeactivate() {
    this.propagateSignal(0);
  }

  update(deltaTime) {
    // Process pending signal with frame-based delay
    if (this.pendingSignal !== null) {
      this.signalDelayTimer += deltaTime;

      if (this.signalDelayTimer >= this.delay) {
        // Execute delayed signal
        if (this.pendingSignal) {
          this.activate();
        } else {
          this.deactivate();
        }

        // Clear pending signal
        this.pendingSignal = null;
        this.signalDelayTimer = 0;
      }
    }

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
    const highQuality = window.ChainReactionLab?.settings?.get('highQuality') ?? true;

    ctx.save();
    ctx.translate(centerX, centerY);

    // Glow effect when active (only in high quality mode)
    if (this.active && highQuality) {
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
