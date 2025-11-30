/**
 * Base Mechanism Class
 * Parent class for all interactive mechanisms (buttons, doors, etc.)
 */

export class Mechanism {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.active = false;
    this.connections = [];
    this.animationProgress = 0;
    this.isDestroyed = false; // Safety flag for cleanup
  }

  /**
   * Add a connection to another mechanism
   */
  connect(mechanism, color = '#00ffff') {
    // Pre-calculate bezier curve control points for performance
    const dx = mechanism.x - this.x;
    const dy = mechanism.y - this.y;
    const cx1 = this.x + dx * 0.25;
    const cy1 = this.y + dy * 0.25 + 20;
    const cx2 = this.x + dx * 0.75;
    const cy2 = this.y + dy * 0.75 + 20;

    this.connections.push({
      mechanism,
      color,
      // Cache control points
      cx1, cy1, cx2, cy2
    });
  }

  /**
   * Toggle activation state
   */
  toggle() {
    this.active = !this.active;
    this.onToggle();
  }

  /**
   * Activate the mechanism
   */
  activate() {
    if (!this.active) {
      this.active = true;
      this.onActivate();
    }
  }

  /**
   * Deactivate the mechanism
   */
  deactivate() {
    if (this.active) {
      this.active = false;
      this.onDeactivate();
    }
  }

  /**
   * Called when mechanism is toggled
   */
  onToggle() {
    // Override in child classes
  }

  /**
   * Called when mechanism is activated
   */
  onActivate() {
    // Override in child classes
    this.propagateSignal();
  }

  /**
   * Called when mechanism is deactivated
   */
  onDeactivate() {
    // Override in child classes
  }

  /**
   * Propagate activation signal to connected mechanisms
   * Note: Delay is now handled by individual mechanisms (Relay, LogicGate)
   * This method executes immediately
   */
  propagateSignal() {
    // Safety check: prevent execution if already destroyed
    if (this.isDestroyed) {
      return;
    }

    // Propagate to all connected mechanisms
    this.connections.forEach(({ mechanism, color }) => {
      mechanism.receiveSignal(this);

      // Trigger visual flow animation
      if (this.active && window.ChainReactionLab?.renderer) {
        window.ChainReactionLab.renderer.createEnergyTrail(this.x, this.y, mechanism.x, mechanism.y, color);
      }
    });
  }

  /**
   * Clean up resources
   */
  destroy() {
    // Mark as destroyed to prevent execution
    this.isDestroyed = true;

    // Clear connections
    this.connections = [];
  }

  /**
   * Receive signal from another mechanism
   */
  receiveSignal(from) {
    // Override in child classes
    this.toggle();
  }

  /**
   * Update animation
   */
  update(deltaTime) {
    // Override in child classes
  }

  /**
   * Render the mechanism
   */
  render(ctx) {
    // Override in child classes
  }

  /**
   * Render connections to other mechanisms
   */
  renderConnections(ctx, timestamp = 0) {
    // Use for loop for better performance
    for (let i = 0, len = this.connections.length; i < len; i++) {
      const conn = this.connections[i];
      this.drawConnection(
        ctx,
        this.x, this.y,
        conn.mechanism.x, conn.mechanism.y,
        conn.cx1, conn.cy1, conn.cx2, conn.cy2,
        conn.color,
        this.active,
        timestamp
      );
    }
  }

  /**
   * Draw a connection line with glow effect (using cached control points)
   */
  drawConnection(ctx, x1, y1, x2, y2, cx1, cy1, cx2, cy2, color, active, timestamp = 0) {
    const highQuality = window.ChainReactionLab?.settings?.get('highQuality') ?? true;
    ctx.save();

    // Draw glow if active - much stronger
    if (active && highQuality) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 12;
      ctx.shadowBlur = 35;
      ctx.shadowColor = color;
      ctx.globalAlpha = 0.4;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
      ctx.stroke();
    }

    // Draw main line - thicker
    ctx.strokeStyle = active ? color : 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = active ? 6 : 3;
    if (highQuality) {
      ctx.shadowBlur = active ? 20 : 0;
    }
    ctx.globalAlpha = active ? 1 : 0.4;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
    ctx.stroke();

    // Draw animated arrow along path when active
    if (active) {
      const progress = ((timestamp % 2000) / 2000);

      // Calculate position along bezier curve
      const t = progress;
      const mt = 1 - t;
      const arrowX = mt*mt*mt*x1 + 3*mt*mt*t*cx1 + 3*mt*t*t*cx2 + t*t*t*x2;
      const arrowY = mt*mt*mt*y1 + 3*mt*mt*t*cy1 + 3*mt*t*t*cy2 + t*t*t*y2;

      // Calculate angle
      const angle = Math.atan2(y2 - y1, x2 - x1);

      ctx.save();
      ctx.translate(arrowX, arrowY);
      ctx.rotate(angle);

      ctx.fillStyle = '#00ff88';
      if (highQuality) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00ff88';
      }
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-20, -10);
      ctx.lineTo(-20, 10);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * Check if point is inside mechanism bounds
   */
  containsPoint(px, py) {
    const size = this.getSize();
    return (
      px >= this.x - size / 2 &&
      px <= this.x + size / 2 &&
      py >= this.y - size / 2 &&
      py <= this.y + size / 2
    );
  }

  /**
   * Get mechanism size
   */
  getSize() {
    return 40; // Default size, override in child classes
  }
}

export default Mechanism;
