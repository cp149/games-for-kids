/**
 * Level - Represents a single game level
 * OOP design with support for 2-color and 3-color mixing
 */
class Level {
  /**
   * @param {object} config
   * @param {number} config.id - Level ID
   * @param {'mix'|'quiz'} config.type - Level type
   * @param {string} config.target - Target color name (e.g., 'ORANGE', 'BROWN')
   * @param {2|3} [config.slotCount=2] - Number of mixing slots
   * @param {string} [config.given] - Pre-filled color for quiz mode
   * @param {string} [config.missing] - Expected answer for quiz mode
   * @param {'easy'|'medium'|'hard'} [config.difficulty='easy'] - Difficulty level
   */
  constructor(config) {
    this.id = config.id;
    this.type = config.type || 'mix';
    this.target = config.target;
    this.slotCount = config.slotCount || 2;
    this.given = config.given || null;
    this.missing = config.missing || null;
    this.difficulty = config.difficulty || 'easy';
  }

  /**
   * Validate if player's result matches the target
   * @param {string} resultColorName - The mixed color name from MixingSystem
   * @returns {boolean}
   */
  validate(resultColorName) {
    return resultColorName === this.target;
  }

  /**
   * Check if this is a quiz level
   * @returns {boolean}
   */
  isQuiz() {
    return this.type === 'quiz';
  }

  /**
   * Check if this level uses 3 slots
   * @returns {boolean}
   */
  isThreeSlot() {
    return this.slotCount === 3;
  }

  /**
   * Get the hint colors for this level (what colors to use)
   * @param {object} mixingRules - CONFIG.MIXING_RULES
   * @returns {string[]} Array of color names
   */
  getHintColors(mixingRules) {
    // For quiz type, only return the missing color as hint
    if (this.type === 'quiz' && this.missing) {
      return [this.missing];
    }
    
    // For mix type, find colors that create target
    for (const [combo, result] of Object.entries(mixingRules)) {
      if (result === this.target) {
        return combo.split('+');
      }
    }
    return [];
  }
}

// Dual-export pattern
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Level };
}
if (typeof window !== 'undefined') {
  window.Level = Level;
}
