/**
 * Logic Gate Base Class
 * Abstract logic operations (AND, OR, XOR, NOT)
 */

import { Mechanism } from './mechanism.js';
import { LOGIC_GATES, drawGateIcon } from './gate-icons.js';
import logger from '../utils/logger.js';

export class LogicGate extends Mechanism {
  constructor(x, y, gateType, id) {
    super(x, y, 'logic-gate');
    this.gateType = gateType;
    this.id = id;
    this.size = 55; // Larger size for better visibility
    this.receivedSignals = new Set();
    this.pulsePhase = 0;

    // Frame-based signal propagation delay
    this.pendingPropagation = false;
    this.propagationTimer = 0;
    this.propagationDelay = 100; // ms

    // Get logic function for this gate type
    this.evaluateFunction = LOGIC_GATES[gateType];
    if (!this.evaluateFunction) {
      logger.error(`Unknown gate type: ${gateType}`);
      this.evaluateFunction = () => false;
    }
  }

  receiveSignal(from) {
    // Always track all input sources (regardless of active state)
    this.receivedSignals.add(from);
    this.evaluateLogic();
  }

  evaluateLogic() {
    const activeCount = Array.from(this.receivedSignals).filter(m => m.active).length;
    const totalInputs = this.receivedSignals.size;

    const shouldActivate = this.evaluateFunction(activeCount, totalInputs);

    if (shouldActivate && !this.active) {
      this.activate();
    } else if (!shouldActivate && this.active) {
      this.deactivate();
    }
  }

  onActivate() {
    // Queue signal propagation with delay
    this.pendingPropagation = true;
    this.propagationTimer = 0;
  }

  onDeactivate() {
    // Immediate propagation on deactivate
    this.propagateSignal();
  }

  update(deltaTime) {
    // Process pending signal propagation with frame-based delay
    if (this.pendingPropagation) {
      this.propagationTimer += deltaTime;

      if (this.propagationTimer >= this.propagationDelay) {
        // Execute delayed propagation
        this.propagateSignal();

        // Clear pending propagation
        this.pendingPropagation = false;
        this.propagationTimer = 0;
      }
    }

    // Pulse animation
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
      ctx.shadowColor = this.getGateColor();
    }

    // Draw hexagon shape
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();

    ctx.fillStyle = this.active ? this.getGateColor() : '#3a4a5a';
    ctx.fill();

    ctx.strokeStyle = this.active ? this.getGateColor(0.9) : '#6a7a8a';
    ctx.lineWidth = 4; // Thicker border for better visibility
    ctx.stroke();

    // Draw gate icon
    drawGateIcon(ctx, this.gateType, this.active, highQuality);

    ctx.restore();
  }

  getGateColor(brightness = 1.0) {
    const colors = {
      'AND': `rgba(255, 100, 100, ${brightness})`,    // Red
      'OR': `rgba(100, 200, 255, ${brightness})`,     // Blue
      'XOR': `rgba(200, 100, 255, ${brightness})`,    // Purple
      'NOT': `rgba(255, 200, 100, ${brightness})`,    // Orange
      'NAND': `rgba(255, 150, 150, ${brightness})`,   // Light red
      'NOR': `rgba(150, 220, 255, ${brightness})`     // Light blue
    };
    return colors[this.gateType] || `rgba(100, 255, 100, ${brightness})`;
  }

  getSize() {
    return this.size;
  }
}

export default LogicGate;
