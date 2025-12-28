/**
 * Level Manager - Manages level instances and progression
 * Pure OOP implementation - all levels use class hierarchy
 */

class LevelManager {
  constructor(config, levels, i18n, game) {
    this.config = config;
    this.i18n = i18n;
    this.game = game;

    // Level class registry
    // Note: L3/L4 swapped - teach colors before speed
    this.levelClasses = [
      Level1,
      Level2,
      Level4, // Yellow Awakening (was L4, now L3)
      Level3, // Speed Lab (was L3, now L4)
      Level5,
      Level6,
      Level7,
      Level8,
      Level9,
      null, // Level 10 placeholder
      Level11
    ];

    this.currentLevel = null;
    this.currentLevelNumber = 1;

    // Callbacks
    this.onLevelComplete = null;
    this.onLevelLoad = null;
  }

  /**
   * Load level by number
   * Creates level instance from class
   */
  loadLevel(levelNumber) {
    const LevelClass = this.levelClasses[levelNumber - 1];

    if (!LevelClass) {
      console.error('Level class not found:', levelNumber);
      return null;
    }

    // Create new level instance
    this.currentLevel = new LevelClass(this.game);
    this.currentLevelNumber = levelNumber;

    // Initialize the level
    this.currentLevel.initialize();

    // Trigger callback with level data
    if (this.onLevelLoad) {
      this.onLevelLoad(this.currentLevel.config);
    }

    return this.currentLevel.config;
  }

  /**
   * Get current level data
   */
  getCurrentLevelData() {
    return this.currentLevel ? this.currentLevel.config : null;
  }

  /**
   * Get current level number
   */
  getCurrentLevel() {
    return this.currentLevelNumber;
  }

  /**
   * Update reaction progress
   * Delegates to level instance
   */
  updateReactionProgress(reactionType) {
    if (this.currentLevel) {
      this.currentLevel.onReaction({
        result: reactionType,
        output: reactionType
      });
    }
  }

  /**
   * Update catalyst usage progress
   * Delegates to level instance
   */
  updateCatalystProgress() {
    if (this.currentLevel) {
      this.currentLevel.onCatalystUsed();
    }
  }

  /**
   * Check if level objective is complete
   * Delegates to level instance
   */
  checkLevelCompletion(score) {
    if (this.currentLevel) {
      return this.currentLevel.checkCompletion();
    }
    return false;
  }

  /**
   * Check if there are more levels
   */
  hasNextLevel() {
    return this.currentLevelNumber < this.config.GAME.MAX_LEVEL;
  }

  /**
   * Show tutorial hints (legacy - disabled)
   */
  showTutorialHints(levelNumber) {
    // Tutorial hints disabled per user request
    const hint1 = document.getElementById('tutorial-hint-1');
    const hint2 = document.getElementById('tutorial-hint-2');
    const hint3 = document.getElementById('tutorial-hint-3');

    if (hint1) hint1.classList.add('hidden');
    if (hint2) hint2.classList.add('hidden');
    if (hint3) hint3.classList.add('hidden');
  }

  /**
   * Get level progress for display
   * Delegates to level instance
   */
  getProgress() {
    return this.currentLevel ? { ...this.currentLevel.progress } : {};
  }

  /**
   * Get structured objective data for UI
   * Delegates to level instance
   */
  getObjectiveData(currentScore) {
    return this.currentLevel ? this.currentLevel.getObjectiveData() : null;
  }

  /**
   * Get localized objective text for current level
   * Delegates to level instance
   */
  getObjectiveText() {
    return this.currentLevel ? this.currentLevel.getObjectiveText() : '';
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.currentLevel && this.currentLevel.destroy) {
      this.currentLevel.destroy();
    }
    this.onLevelComplete = null;
    this.onLevelLoad = null;
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.LevelManager = LevelManager;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LevelManager };
}
