/**
 * Level 11: Magic Spoon Catalyst
 * Introduction to drag-stir-flyback catalyst mechanic
 */

class Level11 extends BaseLevel {
  constructor(game) {
    const config = {
      level: 11,
      name: 'Magic Spoon',
      objective: {
        type: 'catalyst_count',
        target: 3,
        description: 'Stir mixtures with magic spoon 3 times'
      },
      timer: 120,
      cards: ['RED', 'BLUE', 'YELLOW', 'GREEN'],
      dropInterval: 1500,
      specialCards: [], // No hand cards - using spoon instead
      useMagicSpoon: true // Flag to enable magic spoon system
    };

    super(game, config);
    this.catalystManager = null;
  }

  /**
   * Initialize Level 11
   */
  initialize() {
    super.initialize();
    console.log('Level 11: Learn to use the Magic Spoon!');

    // Create and initialize catalyst manager
    this.catalystManager = new CatalystManager(this.game.config, this.game);
    this.catalystManager.initialize();

    // Store reference in game for rendering
    this.game.catalystManager = this.catalystManager;
  }

  /**
   * Update level logic
   * @param {number} deltaTime - Time since last frame in milliseconds
   */
  update(deltaTime) {
    super.update(deltaTime);

    // Update catalyst manager
    if (this.catalystManager) {
      this.catalystManager.update(deltaTime);
    }
  }

  /**
   * Handle catalyst usage
   */
  onCatalystUsed() {
    super.onCatalystUsed();
    console.log('🥄 Magic Spoon stirred! Reaction accelerated!');

    // Show visual feedback
    if (this.game.particleSystem) {
      this.game.particleSystem.createBurst(
        this.game.config.CANVAS.CENTER_X,
        this.game.config.CANVAS.CENTER_Y,
        '#FFD700',
        30
      );
    }
  }

  /**
   * Get localized objective text
   * @returns {string} - Formatted objective text
   */
  getObjectiveText() {
    const i18n = this.game.i18n;
    return i18n.t('objective_magic_spoon', { count: this.config.objective.target });
  }

  /**
   * Clean up level resources
   */
  destroy() {
    super.destroy();

    // Destroy catalyst manager
    if (this.catalystManager) {
      this.catalystManager.destroy();
      this.catalystManager = null;
    }

    // Remove reference from game
    if (this.game.catalystManager) {
      this.game.catalystManager = null;
    }
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.Level11 = Level11;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Level11 };
}
