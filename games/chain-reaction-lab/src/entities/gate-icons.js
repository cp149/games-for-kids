/**
 * Logic Gate Icon Rendering
 * Visual representation of logic gates using IEEE standard symbols
 */

// Logic gate evaluation strategies
export const LOGIC_GATES = {
  'AND': (activeCount, totalInputs) => activeCount === totalInputs && totalInputs > 0,
  'OR': (activeCount, totalInputs) => activeCount > 0,
  'XOR': (activeCount, totalInputs) => activeCount === 1,
  'NOT': (activeCount, totalInputs) => totalInputs > 0 && activeCount === 0,
  'NAND': (activeCount, totalInputs) => totalInputs > 0 && !(activeCount === totalInputs),
  'NOR': (activeCount, totalInputs) => activeCount === 0 && totalInputs > 0
};

/**
 * Draw visual icon for a logic gate
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string} gateType - Type of gate (AND, OR, XOR, NOT, NAND, NOR)
 * @param {boolean} active - Whether gate is currently active
 * @param {boolean} highQuality - Enable shadow effects for better visual quality
 */
export const drawGateIcon = (ctx, gateType, active, highQuality = true) => {
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
