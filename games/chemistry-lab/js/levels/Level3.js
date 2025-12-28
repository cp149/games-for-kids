/**
 * Level 3: Speed Lab ⏱️
 * Teaching: Time pressure after mastering all colors
 * Design: Complete reactions quickly with all known recipes
 * Note: Used at position 4 in LevelManager (after Yellow Awakening)
 */

class Level3 extends BaseLevel {
  constructor(game) {
    const config = {
      level: 4, // Display as L4
      name: 'Speed Lab',
      objective: {
        type: 'count',
        target: 5,
        description: 'Complete 5 reactions in 60s'
      },
      timer: 60, // First timed level
      cards: ['RED', 'BLUE', 'YELLOW'], // All colors available
      dropInterval: 1800, // Faster drops
      specialCards: []
    };

    super(game, config);
  }

  /**
   * Initialize Level 3 (Speed Lab)
   */
  initialize() {
    super.initialize();
    console.log('⏱️ Level 4: Speed Lab - Race against time!');
    console.log('💡 Use any recipe you know!');
  }

  /**
   * Handle reaction completion
   */
  onReaction(reactionResult) {
    super.onReaction(reactionResult);

    // Progress feedback
    const count = this.progress.reactionsCompleted;
    const target = this.config.objective.target;

    if (count > 0 && count < target) {
      console.log(`⏱️ Reactions: ${count}/${target}`);
    }

    // Encourage on halfway
    if (count === Math.floor(target / 2)) {
      console.log('🔥 Halfway there! Keep going!');
    }
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.Level3 = Level3;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Level3 };
}
