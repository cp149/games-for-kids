/**
 * Logic Gate Base Class
 * Abstract logic operations (AND, OR, XOR, NOT)
 */

import { Mechanism } from './mechanism.js';

// Logic gate evaluation strategies
const LOGIC_GATES = {
  'AND': (activeCount, totalInputs) => activeCount === totalInputs && totalInputs > 0,
  'OR': (activeCount, totalInputs) => activeCount > 0,
  'XOR': (activeCount, totalInputs) => activeCount === 1,
  'NOT': (activeCount, totalInputs) => totalInputs > 0 && activeCount === 0,
  'NAND': (activeCount, totalInputs) => totalInputs > 0 && !(activeCount === totalInputs),
  'NOR': (activeCount, totalInputs) => activeCount === 0 && totalInputs > 0
};

// Draw visual icons for each gate type (child-friendly graphics)
const drawGateIcon = (ctx, gateType, active) => {
  const color = active ? '#ffffff' : '#8a9aaa';
  const glowColor = active ? '#ffffff' : color;

  switch(gateType) {
    case 'AND':
      // Two large dots - both must be lit
      ctx.fillStyle = color;
      ctx.shadowBlur = active ? 8 : 0;
      ctx.shadowColor = glowColor;
      ctx.beginPath();
      ctx.arc(-10, 0, 5, 0, Math.PI * 2);
      ctx.arc(10, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      break;

    case 'OR':
      // Three large dots in triangle - any can be lit
      ctx.fillStyle = color;
      ctx.shadowBlur = active ? 8 : 0;
      ctx.shadowColor = glowColor;
      ctx.beginPath();
      ctx.arc(0, -8, 5, 0, Math.PI * 2);
      ctx.arc(-8, 5, 5, 0, Math.PI * 2);
      ctx.arc(8, 5, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      break;

    case 'XOR':
      // Large dot with bold circle - only one
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.shadowBlur = active ? 10 : 0;
      ctx.shadowColor = glowColor;
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      break;

    case 'NOT':
      // Bold X mark
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.shadowBlur = active ? 8 : 0;
      ctx.shadowColor = glowColor;
      ctx.beginPath();
      ctx.moveTo(-8, -8);
      ctx.lineTo(8, 8);
      ctx.moveTo(8, -8);
      ctx.lineTo(-8, 8);
      ctx.stroke();
      ctx.shadowBlur = 0;
      break;

    case 'NAND':
      // AND with slash
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(-10, 0, 4, 0, Math.PI * 2);
      ctx.arc(10, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-12, -10);
      ctx.lineTo(12, 10);
      ctx.stroke();
      break;

    case 'NOR':
      // OR with slash
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, -6, 3, 0, Math.PI * 2);
      ctx.arc(-6, 4, 3, 0, Math.PI * 2);
      ctx.arc(6, 4, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-10, -8);
      ctx.lineTo(10, 8);
      ctx.stroke();
      break;
  }
};

export class LogicGate extends Mechanism {
  constructor(x, y, gateType, id) {
    super(x, y, 'logic-gate');
    this.gateType = gateType;
    this.id = id;
    this.size = 55; // Larger size for better visibility
    this.receivedSignals = new Set();
    this.pulsePhase = 0;

    // Get logic function for this gate type
    this.evaluateFunction = LOGIC_GATES[gateType];
    if (!this.evaluateFunction) {
      console.error(`Unknown gate type: ${gateType}`);
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
    this.propagateSignal(100);
  }

  onDeactivate() {
    this.propagateSignal(0);
  }

  update(deltaTime) {
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
    drawGateIcon(ctx, this.gateType, this.active);

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
