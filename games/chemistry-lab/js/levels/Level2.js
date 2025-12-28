/**
 * Level 2: Potion Class 🟣
 * Teaching: First A+B=C synthesis (color mixing)
 * Design: Red + Blue = Purple (no distractors)
 */

class Level2 extends BaseLevel {
  constructor(game) {
    const config = {
      level: 2,
      name: 'Potion Class',
      objective: {
        type: 'specific',
        target: { 'PURPLE': 2 },
        description: '🔴 + 🔵 = 🟣 (×2)'
      },
      timer: null, // No time pressure - learning phase
      cards: ['RED', 'BLUE'], // Only needed colors, no distractors
      dropInterval: 2000,
      specialCards: []
    };

    super(game, config);

    // Track discovery
    this.hasDiscoveredPurple = false;
  }

  /**
   * Initialize Level 2
   */
  initialize() {
    super.initialize();
    console.log('🟣 Level 2: Potion Class - Mix colors!');
    console.log('💡 Hint: Try combining red and blue...');
  }

  /**
   * Handle reaction completion for Level 2
   */
  onReaction(reactionResult) {
    super.onReaction(reactionResult);

    const resultType = reactionResult.result || reactionResult.output;

    // First purple discovery celebration
    if (resultType === 'PURPLE' && !this.hasDiscoveredPurple) {
      this.hasDiscoveredPurple = true;
      console.log('🟣✨ AMAZING! You made a Magic Potion!');
      console.log('🎨 Red + Blue = Purple!');
    }

    // Progress feedback
    const purpleCount = this.progress.specificReactions['PURPLE'] || 0;
    const target = this.config.objective.target['PURPLE'];

    if (purpleCount > 0 && purpleCount < target) {
      console.log(`🟣 Magic Potions: ${purpleCount}/${target}`);
    }
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.Level2 = Level2;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Level2 };
}
