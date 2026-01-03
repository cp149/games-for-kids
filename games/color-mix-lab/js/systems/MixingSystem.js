/**
 * MixingSystem - Pure color mixing logic
 * No DOM dependencies, fully testable
 */

class MixingSystem {
  constructor(config) {
    this.colors = config.COLORS;
    this.rules = config.MIXING_RULES;
    this.bowlColors = [];
  }

  /**
   * Add a color to the bowl
   * @param {string} colorName - Color name (RED, BLUE, YELLOW)
   * @returns {string} Current bowl color hex
   */
  addColor(colorName) {
    if (this.bowlColors.length >= 2) {
      this.bowlColors = [];
    }
    this.bowlColors.push(colorName);
    return this.getCurrentColor();
  }

  /**
   * Get current mixed color
   * @returns {string} Hex color value
   */
  getCurrentColor() {
    if (this.bowlColors.length === 0) {
      return this.colors.EMPTY;
    }
    if (this.bowlColors.length === 1) {
      return this.colors[this.bowlColors[0]];
    }
    return this.mix(this.bowlColors[0], this.bowlColors[1]);
  }

  /**
   * Mix two colors
   * @param {string} c1 - First color name
   * @param {string} c2 - Second color name
   * @returns {string} Hex color of result
   */
  mix(c1, c2) {
    const key = `${c1}+${c2}`;
    const resultName = this.rules[key];
    if (resultName) {
      return this.colors[resultName];
    }
    // Unknown combination = mud
    return this.colors.MUD;
  }

  /**
   * Check if current color matches target
   * @param {string} targetName - Target color name
   * @returns {boolean}
   */
  matchesTarget(targetName) {
    const current = this.getCurrentColor();
    const target = this.colors[targetName];
    return current === target;
  }

  /**
   * Get result color name
   * @returns {string|null} Color name or null
   */
  getResultName() {
    if (this.bowlColors.length < 2) return null;
    const key = `${this.bowlColors[0]}+${this.bowlColors[1]}`;
    return this.rules[key] || 'MUD';
  }

  /**
   * Reset the bowl
   */
  reset() {
    this.bowlColors = [];
  }

  /**
   * Clean up
   */
  destroy() {
    this.bowlColors = [];
  }
}

// Dual export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MixingSystem };
}
if (typeof window !== 'undefined') {
  window.MixingSystem = MixingSystem;
}
