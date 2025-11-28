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
  }

  /**
   * Add a connection to another mechanism
   */
  connect(mechanism, color = '#00ffff') {
    this.connections.push({ mechanism, color });
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
   */
  propagateSignal(delay = 0) {
    setTimeout(() => {
      // Propagate to all connected mechanisms
      this.connections.forEach(({ mechanism, color }) => {
        mechanism.receiveSignal(this);

        // Trigger visual flow animation
        if (this.active && window.gameRenderer) {
          window.gameRenderer.createEnergyTrail(this.x, this.y, mechanism.x, mechanism.y, color);
        }
      });
    }, delay);
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
  renderConnections(ctx) {
    this.connections.forEach(({ mechanism, color }) => {
      this.drawConnection(ctx, this.x, this.y, mechanism.x, mechanism.y, color, this.active);
    });
  }

  /**
   * Draw a connection line with glow effect
   */
  drawConnection(ctx, x1, y1, x2, y2, color, active) {
    ctx.save();

    // Calculate control points for curved line
    const dx = x2 - x1;
    const dy = y2 - y1;
    const cx1 = x1 + dx * 0.25;
    const cy1 = y1 + dy * 0.25 + 20;
    const cx2 = x1 + dx * 0.75;
    const cy2 = y1 + dy * 0.75 + 20;

    // Draw glow if active - much stronger
    if (active) {
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
    ctx.shadowBlur = active ? 20 : 0;
    ctx.globalAlpha = active ? 1 : 0.4;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
    ctx.stroke();

    // Draw animated arrow along path when active
    if (active) {
      const progress = (Date.now() % 2000) / 2000;

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
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00ff88';
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
