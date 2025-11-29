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
  'NOT': (activeCount, totalInputs) => activeCount === 0, // Fixed: works even with 0 inputs
  'NAND': (activeCount, totalInputs) => totalInputs > 0 && !(activeCount === totalInputs),
  'NOR': (activeCount, totalInputs) => activeCount === 0 && totalInputs > 0
};

// Draw visual icons for each gate type (child-friendly graphics)
const drawGateIcon = (ctx, gateType, active, highQuality = true) => {
  const color = active ? '#ffffff' : '#8a9aaa';
  const glowColor = active ? '#ffffff' : color;

  switch(gateType) {
    case 'AND':
      // Standard AND gate shape: D shape with input/output lines
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      if (highQuality) {
        ctx.shadowBlur = active ? 10 : 0;
        ctx.shadowColor = glowColor;
      }
      ctx.beginPath();
      // Top input line
      ctx.moveTo(-12, -6);
      ctx.lineTo(-6, -6);
      // Bottom input line
      ctx.moveTo(-12, 6);
      ctx.lineTo(-6, 6);
      // Gate body - left flat side
      ctx.moveTo(-6, -8);
      ctx.lineTo(-6, 8);
      // Bottom curve
      ctx.lineTo(0, 8);
      // Right curved side (arc)
      ctx.arc(0, 0, 8, Math.PI/2, -Math.PI/2, true);
      // Top curve back to start
      ctx.lineTo(-6, -8);
      // Output line
      ctx.moveTo(8, 0);
      ctx.lineTo(12, 0);
      ctx.stroke();
      if (highQuality) {
        ctx.shadowBlur = 0;
      }
      break;

    case 'OR':
      // Standard OR gate shape: curved arrow shape with input/output lines
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      if (highQuality) {
        ctx.shadowBlur = active ? 10 : 0;
        ctx.shadowColor = glowColor;
      }
      ctx.beginPath();
      // Top input line
      ctx.moveTo(-12, -6);
      ctx.lineTo(-8, -6);
      // Bottom input line
      ctx.moveTo(-12, 6);
      ctx.lineTo(-8, 6);
      // Left curved input side
      ctx.moveTo(-8, -8);
      ctx.quadraticCurveTo(-2, 0, -8, 8);
      // Bottom curved side
      ctx.moveTo(-8, 8);
      ctx.quadraticCurveTo(0, 6, 6, 0);
      // Top curved side
      ctx.moveTo(-8, -8);
      ctx.quadraticCurveTo(0, -6, 6, 0);
      // Output line
      ctx.moveTo(6, 0);
      ctx.lineTo(12, 0);
      ctx.stroke();
      if (highQuality) {
        ctx.shadowBlur = 0;
      }
      break;

    case 'XOR':
      // Standard XOR gate shape: OR gate with extra curved line and I/O lines
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      if (highQuality) {
        ctx.shadowBlur = active ? 10 : 0;
        ctx.shadowColor = glowColor;
      }
      ctx.beginPath();
      // Top input line
      ctx.moveTo(-12, -6);
      ctx.lineTo(-6, -6);
      // Bottom input line
      ctx.moveTo(-12, 6);
      ctx.lineTo(-6, 6);
      // Extra curved line on the left (XOR indicator)
      ctx.moveTo(-10, -8);
      ctx.quadraticCurveTo(-4, 0, -10, 8);
      // Main OR gate shape - left curved side
      ctx.moveTo(-6, -8);
      ctx.quadraticCurveTo(0, 0, -6, 8);
      // Bottom curved side
      ctx.moveTo(-6, 8);
      ctx.quadraticCurveTo(2, 6, 6, 0);
      // Top curved side
      ctx.moveTo(-6, -8);
      ctx.quadraticCurveTo(2, -6, 6, 0);
      // Output line
      ctx.moveTo(6, 0);
      ctx.lineTo(12, 0);
      ctx.stroke();
      if (highQuality) {
        ctx.shadowBlur = 0;
      }
      break;

    case 'NOT':
      // Standard NOT gate shape: triangle with bubble and I/O lines
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      if (highQuality) {
        ctx.shadowBlur = active ? 10 : 0;
        ctx.shadowColor = glowColor;
      }
      ctx.beginPath();
      // Input line
      ctx.moveTo(-12, 0);
      ctx.lineTo(-8, 0);
      // Triangle
      ctx.moveTo(-8, -7);
      ctx.lineTo(-8, 7);
      ctx.lineTo(5, 0);
      ctx.closePath();
      ctx.stroke();
      // Small bubble at output (inversion indicator)
      ctx.beginPath();
      ctx.arc(8, 0, 3, 0, Math.PI * 2);
      ctx.stroke();
      // Output line
      ctx.beginPath();
      ctx.moveTo(11, 0);
      ctx.lineTo(12, 0);
      ctx.stroke();
      if (highQuality) {
        ctx.shadowBlur = 0;
      }
      break;

    case 'NAND':
      // Standard NAND gate: AND gate with bubble at output and I/O lines
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      if (highQuality) {
        ctx.shadowBlur = active ? 10 : 0;
        ctx.shadowColor = glowColor;
      }
      ctx.beginPath();
      // Top input line
      ctx.moveTo(-12, -6);
      ctx.lineTo(-8, -6);
      // Bottom input line
      ctx.moveTo(-12, 6);
      ctx.lineTo(-8, 6);
      // Gate body - left flat side
      ctx.moveTo(-8, -7);
      ctx.lineTo(-8, 7);
      // Bottom
      ctx.lineTo(-2, 7);
      // Right curved side (arc)
      ctx.arc(-2, 0, 7, Math.PI/2, -Math.PI/2, true);
      // Top
      ctx.lineTo(-8, -7);
      ctx.stroke();
      // Bubble at output (inversion indicator)
      ctx.beginPath();
      ctx.arc(8, 0, 3, 0, Math.PI * 2);
      ctx.stroke();
      // Output line
      ctx.beginPath();
      ctx.moveTo(11, 0);
      ctx.lineTo(12, 0);
      ctx.stroke();
      if (highQuality) {
        ctx.shadowBlur = 0;
      }
      break;

    case 'NOR':
      // Standard NOR gate: OR gate with bubble at output and I/O lines
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      if (highQuality) {
        ctx.shadowBlur = active ? 10 : 0;
        ctx.shadowColor = glowColor;
      }
      ctx.beginPath();
      // Top input line
      ctx.moveTo(-12, -6);
      ctx.lineTo(-8, -6);
      // Bottom input line
      ctx.moveTo(-12, 6);
      ctx.lineTo(-8, 6);
      // Left curved input side
      ctx.moveTo(-8, -7);
      ctx.quadraticCurveTo(-2, 0, -8, 7);
      // Bottom curved side
      ctx.moveTo(-8, 7);
      ctx.quadraticCurveTo(0, 5, 5, 0);
      // Top curved side
      ctx.moveTo(-8, -7);
      ctx.quadraticCurveTo(0, -5, 5, 0);
      ctx.stroke();
      // Bubble at output (inversion indicator)
      ctx.beginPath();
      ctx.arc(8, 0, 3, 0, Math.PI * 2);
      ctx.stroke();
      // Output line
      ctx.beginPath();
      ctx.moveTo(11, 0);
      ctx.lineTo(12, 0);
      ctx.stroke();
      if (highQuality) {
        ctx.shadowBlur = 0;
      }
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
    const highQuality = window.gameSettings?.get('highQuality') ?? true;

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
