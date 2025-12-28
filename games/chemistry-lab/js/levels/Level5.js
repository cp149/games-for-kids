/**
 * Level 5: Boosted Reactions
 * Score-based objective with catalysts
 * + First micro-view demonstration (solid-to-liquid concept)
 */

class Level5 extends BaseLevel {
  constructor(game) {
    const config = {
      level: 5,
      name: 'Boosted Reactions',
      objective: {
        type: 'score',
        target: 500,
        description: 'Reach 500 points'
      },
      timer: 120,
      cards: ['RED', 'BLUE', 'YELLOW'],
      dropInterval: 1500,
      specialCards: [
        { type: 'CATALYST', count: 3 }
      ]
    };

    super(game, config);

    // Track micro-view demonstration
    this.hasShownMicroView = false;
  }

  /**
   * Initialize Level 5
   */
  initialize() {
    super.initialize();
    console.log('Level 5: Use catalysts strategically to reach 500 points!');
    console.log('Watch for a special demonstration on your first STEAM reaction!');
  }

  /**
   * Handle reaction
   */
  onReaction(reactionResult) {
    super.onReaction(reactionResult);

    // Trigger micro-view on first STEAM synthesis (simulating solid-to-liquid)
    if (!this.hasShownMicroView &&
        (reactionResult.output === 'STEAM' || reactionResult.result === 'STEAM')) {

      this.hasShownMicroView = true;

      // Trigger particle personality demonstration
      if (this.game.particlePersonality) {
        console.log('🔬 Triggering micro-view: solid-to-liquid transition');

        // Use center of canvas as focus point
        const focusX = this.game.config.CANVAS.CENTER_X;
        const focusY = this.game.config.CANVAS.CENTER_Y + 50;

        this.game.particlePersonality.triggerDemonstration(
          'solid-to-liquid',
          focusX,
          focusY
        );
      }
    }

    const remaining = this.config.objective.target - this.game.score;
    if (remaining > 0 && remaining <= 100) {
      console.log(`${remaining} more points to go!`);
    }
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.Level5 = Level5;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Level5 };
}
