/**
 * Player class
 * Represents the player avatar (minimal for now)
 */

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 30;
    this.targetX = x;
    this.targetY = y;
    this.moveSpeed = 5;
  }

  moveTo(x, y) {
    this.targetX = x;
    this.targetY = y;
  }

  update(deltaTime) {
    // Smooth movement towards target
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 1) {
      const speed = Math.min(this.moveSpeed, distance);
      this.x += (dx / distance) * speed;
      this.y += (dy / distance) * speed;
    }
  }

  render(ctx) {
    ctx.save();

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + this.size / 2 + 5, this.size / 2, this.size / 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Player circle
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00ffff';
    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
    ctx.fill();

    // Inner glow
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.x, this.y - this.size / 6, this.size / 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

export default Player;
