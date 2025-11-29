/**
 * Position Manager
 * Handles position allocation and collision detection for mechanisms
 */

export class PositionManager {
  constructor() {
    this.usedPositions = [];
  }

  /**
   * Reset position tracking
   */
  reset() {
    this.usedPositions = [];
  }

  /**
   * Get a unique position with distance-based collision detection
   * @param {number} minX - Minimum X coordinate (normalized 0-1)
   * @param {number} maxX - Maximum X coordinate (normalized 0-1)
   * @param {number} minY - Minimum Y coordinate (default 0.2)
   * @param {number} maxY - Maximum Y coordinate (default 0.8)
   * @param {number} minDistance - Minimum distance between positions (default 0.12)
   * @returns {Object} Position {x, y}
   */
  getUniquePosition(minX, maxX, minY = 0.2, maxY = 0.8, minDistance = 0.12) {
    let attempts = 0;
    const maxAttempts = 200;

    while (attempts < maxAttempts) {
      const x = minX + Math.random() * (maxX - minX);
      const y = minY + Math.random() * (maxY - minY);

      if (this.isPositionValid(x, y, minDistance)) {
        this.usedPositions.push({ x, y });
        return { x, y };
      }
      attempts++;
    }

    // Fallback: try with reduced distance requirement
    const reducedDistance = minDistance * 0.7;
    for (let i = 0; i < 50; i++) {
      const x = minX + Math.random() * (maxX - minX);
      const y = minY + Math.random() * (maxY - minY);

      if (this.isPositionValid(x, y, reducedDistance)) {
        this.usedPositions.push({ x, y });
        return { x, y };
      }
    }

    // Last resort: return position even if it might be close
    const x = minX + Math.random() * (maxX - minX);
    const y = minY + Math.random() * (maxY - minY);
    this.usedPositions.push({ x, y });
    return { x, y };
  }

  /**
   * Check if a position is valid (not too close to existing positions)
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} minDistance - Minimum allowed distance
   * @returns {boolean} True if position is valid
   */
  isPositionValid(x, y, minDistance) {
    for (const pos of this.usedPositions) {
      const dx = x - pos.x;
      const dy = y - pos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < minDistance) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get current used positions
   * @returns {Array} Array of {x, y} positions
   */
  getUsedPositions() {
    return [...this.usedPositions];
  }
}
