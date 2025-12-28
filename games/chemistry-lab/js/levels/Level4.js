/**
 * Level 4: Yellow Awakening 🟡
 * Teaching: Complete three-primary-color mixing system
 * Design: Master all color combinations (Red+Yellow=Orange, Blue+Yellow=Green)
 * Note: Used at position 3 in LevelManager (before Speed Lab)
 */

class Level4 extends BaseLevel {
  constructor(game) {
    const config = {
      level: 3, // Display as L3
      name: 'Yellow Awakening',
      objective: {
        type: 'multiple_specific',
        target: {
          'ORANGE': 1,
          'GREEN': 1,
          'YELLOW_SPARK': 1
        },
        description: '🔴🟡=🍊 | 🔵🟡=💚 | 🟡🟡=⚡'
      },
      timer: null, // No timer - learning phase
      cards: ['RED', 'BLUE', 'YELLOW'], // All three primary colors
      dropInterval: 2000, // Relaxed speed for learning
      specialCards: []
    };

    super(game, config);

    // Track discoveries
    this.discoveredRecipes = new Set();
  }

  /**
   * Initialize Level 4
   */
  initialize() {
    super.initialize();
    console.log('🟡 Level 3: Yellow Awakening - Master all colors!');
    console.log('🎨 Goal: Create Orange, Green, and Yellow Spark');
    console.log('💡 Hint: Yellow + Red = ?, Yellow + Blue = ?, Yellow + Yellow = ?');
  }

  /**
   * Handle reaction completion for Level 4
   * @param {Object} reactionResult - Reaction result
   */
  onReaction(reactionResult) {
    super.onReaction(reactionResult);

    const resultType = reactionResult.result || reactionResult.output;

    // First-time discovery celebrations
    if (resultType && !this.discoveredRecipes.has(resultType)) {
      this.discoveredRecipes.add(resultType);

      switch (resultType) {
        case 'YELLOW_SPARK':
          console.log('⚡ Yellow + Yellow = Yellow Spark!');
          break;
        case 'ORANGE':
          console.log('🍊 Red + Yellow = Orange! Beautiful!');
          break;
        case 'GREEN':
          console.log('💚 Blue + Yellow = Green! Amazing!');
          break;
        case 'PURPLE':
          console.log('🟣 You remembered Purple from Level 2!');
          break;
      }
    }

    // Progress tracking
    const orangeCount = this.progress.specificReactions['ORANGE'] || 0;
    const greenCount = this.progress.specificReactions['GREEN'] || 0;
    const yellowSparkCount = this.progress.specificReactions['YELLOW_SPARK'] || 0;

    const orangeTarget = this.config.objective.target['ORANGE'];
    const greenTarget = this.config.objective.target['GREEN'];
    const yellowSparkTarget = this.config.objective.target['YELLOW_SPARK'];

    // Show progress
    const completed = [];
    if (orangeCount >= orangeTarget) completed.push('🍊 Orange');
    if (greenCount >= greenTarget) completed.push('💚 Green');
    if (yellowSparkCount >= yellowSparkTarget) completed.push('⚡ Yellow Spark');

    if (completed.length > 0) {
      console.log(`✅ Completed: ${completed.join(', ')}`);
    }

    // Milestone message
    if (this.discoveredRecipes.size === 3 && !this.hasShownMilestone) {
      this.hasShownMilestone = true;
      console.log('🎉 Congratulations! You\'ve mastered the three primary colors!');
      console.log('🎨 Red, Blue, Yellow → All color combinations unlocked!');
    }
  }

  /**
   * Check if objective is complete
   */
  checkObjectiveComplete() {
    const orangeDone = (this.progress.specificReactions['ORANGE'] || 0) >=
                       this.config.objective.target['ORANGE'];
    const greenDone = (this.progress.specificReactions['GREEN'] || 0) >=
                      this.config.objective.target['GREEN'];
    const yellowDone = (this.progress.specificReactions['YELLOW_SPARK'] || 0) >=
                       this.config.objective.target['YELLOW_SPARK'];

    return orangeDone && greenDone && yellowDone;
  }

  /**
   * Override isComplete to use custom check
   */
  isComplete() {
    return this.checkObjectiveComplete();
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.Level4 = Level4;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Level4 };
}
