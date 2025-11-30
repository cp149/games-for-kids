/**
 * Difficulty Configuration
 * Defines level parameters for each difficulty level
 */

import i18n from './i18n.js';

export class DifficultyConfig {
  /**
   * Get configuration based on difficulty level
   * @param {number} difficulty - Level difficulty (1-5)
   * @returns {Object} Configuration object
   */
  static getConfig(difficulty) {
    const configs = {
      1: {
        difficulty: 1,
        buttons: 1,
        gates: 0,
        relays: 0,
        usedGates: [],
        multiConnect: false,
        minSignals: 1,
        maxLayers: 0
      },
      2: {
        difficulty: 2,
        buttons: 2,
        gates: 1,
        relays: 1,
        usedGates: ['AND', 'OR', 'NOT'],
        multiConnect: false,
        minSignals: 1,
        maxLayers: 0
      },
      3: {
        difficulty: 3,
        buttons: 4,
        gates: 2,
        relays: 2,
        usedGates: ['AND', 'OR', 'NOT'],
        multiConnect: true,
        minSignals: 2,
        maxLayers: 1
      },
      4: {
        difficulty: 4,
        buttons: 5,
        gates: 4,
        relays: 3,
        usedGates: ['AND', 'OR', 'NOT'],
        multiConnect: true,
        minSignals: 3,
        maxLayers: 2
      },
      5: {
        difficulty: 5,
        buttons: 6,
        gates: 6,
        relays: 4,
        usedGates: ['AND', 'OR', 'NOT'],
        multiConnect: true,
        minSignals: 4,
        maxLayers: 3
      },
      6: {
        difficulty: 6,
        buttons: 7,
        gates: 8,
        relays: 5,
        usedGates: ['AND', 'OR', 'NOT'],
        multiConnect: true,
        minSignals: 5,
        maxLayers: 3
      },
      7: {
        difficulty: 7,
        buttons: 8,
        gates: 10,
        relays: 6,
        usedGates: ['AND', 'OR', 'NOT'],
        multiConnect: true,
        minSignals: 6,
        maxLayers: 3
      },
      8: {
        difficulty: 8,
        buttons: 9,
        gates: 12,
        relays: 7,
        usedGates: ['AND', 'OR', 'NOT'],
        multiConnect: true,
        minSignals: 7,
        maxLayers: 3
      },
      9: {
        difficulty: 9,
        buttons: 10,
        gates: 14,
        relays: 8,
        usedGates: ['AND', 'OR', 'NOT'],
        multiConnect: true,
        minSignals: 8,
        maxLayers: 3
      },
      10: {
        difficulty: 10,
        buttons: 12,
        gates: 16,
        relays: 9,
        usedGates: ['AND', 'OR', 'NOT'],
        multiConnect: true,
        minSignals: 9,
        maxLayers: 3
      }
    };
    return configs[difficulty] || configs[5];
  }

  /**
   * Generate level title based on difficulty
   * @param {Object} config - Difficulty configuration
   * @returns {string} Level title
   */
  static generateTitle(config) {
    if (config.gates === 0) {
      return i18n.t('random_title_simple');
    }

    const titleKey = `random_title_${config.gates}`;
    const title = i18n.t(titleKey);

    // Fallback if translation not found
    if (title === titleKey) {
      return i18n.t('random_title_default');
    }

    return title;
  }

  /**
   * Generate level description based on difficulty
   * @param {Object} config - Difficulty configuration
   * @returns {string} Level description
   */
  static generateDescription(config) {
    if (config.multiConnect) {
      return i18n.t('random_desc_multi', { count: config.minSignals });
    }
    return i18n.t('random_desc_default');
  }
}
