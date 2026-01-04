/**
 * MixingSystem - Ratio-based color mixing logic
 * Supports gradient colors through color counting
 */

class MixingSystem {
  constructor(config) {
    this.config = config;
    this.colors = config.COLORS;
    this.rules = config.MIXING_RULES;
    this.maxColors = 4; // Max colors allowed in bowl
    this.bowlColors = [];
    this.colorCounts = { RED: 0, BLUE: 0, YELLOW: 0 };
  }

  /**
   * Add a color to the bowl
   * @param {string} colorName - Color name (RED, BLUE, YELLOW)
   * @returns {string} Current bowl color hex
   */
  addColor(colorName) {
    // Max 4 colors
    if (this.bowlColors.length >= this.maxColors) {
      return this.getCurrentColor();
    }

    this.bowlColors.push(colorName);
    this.colorCounts[colorName]++;

    return this.getCurrentColor();
  }

  /**
   * Get current mixed color based on ratios
   * @returns {string} Hex color value
   */
  getCurrentColor() {
    const total = this.bowlColors.length;

    if (total === 0) {
      return this.colors.EMPTY;
    }
    if (total === 1) {
      return this.colors[this.bowlColors[0]];
    }

    return this.colors[this._calculateResult()];
  }

  /**
   * Calculate result color name based on color counts
   * @returns {string} Result color name
   */
  _calculateResult() {
    const r = this.colorCounts.RED;
    const b = this.colorCounts.BLUE;
    const y = this.colorCounts.YELLOW;
    const total = r + b + y;

    // Single color (all same)
    if (r === total) return 'RED';
    if (b === total) return 'BLUE';
    if (y === total) return 'YELLOW';

    // Two-color mixes
    if (y === 0) {
      // Red + Blue combinations
      if (r === b) return 'PURPLE';
      if (r > b) return 'RED_PURPLE';
      return 'BLUE_PURPLE';
    }
    if (b === 0) {
      // Red + Yellow combinations
      if (r === y) return 'ORANGE';
      if (r > y) return 'RED_ORANGE';
      return 'YELLOW_ORANGE';
    }
    if (r === 0) {
      // Blue + Yellow combinations
      if (b === y) return 'GREEN';
      if (b > y) return 'BLUE_GREEN';
      return 'YELLOW_GREEN';
    }

    // Three-color mixes
    if (r === 1 && b === 1 && y === 1) {
      return 'BROWN'; // Perfect 1:1:1
    }

    // Unbalanced 3-color = MUD
    return 'MUD';
  }

  /**
   * Get result color name (for level checking)
   * @returns {string|null} Color name or null if not enough colors
   */
  getResultName() {
    if (this.bowlColors.length < 2) return null;
    return this._calculateResult();
  }

  /**
   * Get current colors in bowl
   * @returns {string[]} Array of color names
   */
  getColors() {
    return [...this.bowlColors];
  }

  /**
   * Get color counts
   * @returns {object} Counts of each color
   */
  getColorCounts() {
    return { ...this.colorCounts };
  }

  /**
   * Check if bowl is full
   * @returns {boolean}
   */
  isFull() {
    return this.bowlColors.length >= this.maxColors;
  }

  /**
   * Reset the bowl
   */
  reset() {
    this.bowlColors = [];
    this.colorCounts = { RED: 0, BLUE: 0, YELLOW: 0 };
  }

  /**
   * Clean up
   */
  destroy() {
    this.bowlColors = [];
    this.colorCounts = { RED: 0, BLUE: 0, YELLOW: 0 };
  }
}

// Dual export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MixingSystem };
}
if (typeof window !== 'undefined') {
  window.MixingSystem = MixingSystem;
}
