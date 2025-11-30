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

    // Pre-calculate Bezier coefficients for arrow position (performance optimization)
    // Bezier formula: P(t) = (1-t)³×P0 + 3(1-t)²t×P1 + 3(1-t)t²×P2 + t³×P3
    // We can expand this to: P(t) = a×t³ + b×t² + c×t + d
    const x1 = this.x, y1 = this.y;
    const x2 = mechanism.x, y2 = mechanism.y;

    // Bezier coefficients for X (P(t) = ax*t³ + bx*t² + cx_coef*t + dx_coef)
    const ax = x2 - 3*cx2 + 3*cx1 - x1;
    const bx = 3*cx2 - 6*cx1 + 3*x1;
    const cx_coef = 3*cx1 - 3*x1;
    const dx_coef = x1;

    // Bezier coefficients for Y
    const ay = y2 - 3*cy2 + 3*cy1 - y1;
    const by = 3*cy2 - 6*cy1 + 3*y1;
    const cy_coef = 3*cy1 - 3*y1;
    const dy_coef = y1;

    // Cache arrow angle (constant for each connection)
    const angle = Math.atan2(y2 - y1, x2 - x1);

    this.connections.push({
      mechanism,
      color,
      // Cache control points (for Canvas bezierCurveTo)
      cx1, cy1, cx2, cy2,
      // Cache Bezier coefficients for fast arrow position calculation
      ax, bx, cx_coef, dx_coef,
      ay, by, cy_coef, dy_coef,
      // Cache arrow angle
      angle
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

    // Propagate to all connected mechanisms (use for loop for performance)
    for (let i = 0, len = this.connections.length; i < len; i++) {
      const conn = this.connections[i];
      conn.mechanism.receiveSignal(this);

      // Trigger visual flow animation
      if (this.active && window.ChainReactionLab?.renderer) {
        window.ChainReactionLab.renderer.createEnergyTrail(this.x, this.y, conn.mechanism.x, conn.mechanism.y, conn.color);
      }
    }
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
      this.drawConnection(ctx, conn, this.active, timestamp);
    }
  }

  /**
   * Draw a connection line with glow effect (using cached control points and coefficients)
   */
  drawConnection(ctx, conn, active, timestamp = 0) {
    const x1 = this.x, y1 = this.y;
    const x2 = conn.mechanism.x, y2 = conn.mechanism.y;
    const { cx1, cy1, cx2, cy2, color, ax, bx, cx_coef, dx_coef, ay, by, cy_coef, dy_coef, angle } = conn;
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
      const t = ((timestamp % 2000) / 2000);

      // Fast Bezier calculation using pre-cached coefficients
      // P(t) = a×t³ + b×t² + c×t + d (4 multiplications + 3 additions per coordinate)
      // vs original: 16 multiplications + 3 additions per coordinate
      const t2 = t * t;
      const t3 = t2 * t;
      const arrowX = ax*t3 + bx*t2 + cx_coef*t + dx_coef;
      const arrowY = ay*t3 + by*t2 + cy_coef*t + dy_coef;

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
