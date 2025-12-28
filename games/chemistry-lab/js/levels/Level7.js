/**
 * Level 7: Time Pressure
 * Introduction to card expiration and stabilizers
 */

class Level7 extends BaseLevel {
  constructor(game) {
    const config = {
      level: 7,
      name: 'Time Pressure',
      objective: {
        type: 'count',
        target: 5,
        description: 'Complete 5 reactions (cards expire in 10s)'
      },
      timer: 90,
      cards: ['RED', 'BLUE', 'YELLOW'],
      dropInterval: 1500,
      expirationTime: 10,
      specialCards: [
        { type: 'STABILIZER', count: 3 }
      ]
    };

    super(game, config);
  }

  /**
   * Initialize Level 7
   */
  initialize() {
    super.initialize();
    console.log('Level 7: Cards expire! Use stabilizers to freeze time!');
  }

  /**
   * Handle reaction
   */
  onReaction(reactionResult) {
    super.onReaction(reactionResult);

    const remaining = this.config.objective.target - this.progress.reactionsCompleted;
    if (remaining > 0) {
      console.log(`${remaining} more reaction${remaining > 1 ? 's' : ''} needed!`);
    }
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.Level7 = Level7;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Level7 };
}
