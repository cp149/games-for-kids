/**
 * LevelManager - Manages level progression and persistence
 * OOP singleton pattern for game level management
 */

// Node.js environment support for testing
/* eslint-disable no-undef */
const _LevelClass = (typeof module !== 'undefined' && module.exports)
  ? require('../classes/Level.js').Level
  : (typeof Level !== 'undefined' ? Level : null);
/* eslint-enable no-undef */

class LevelManager {
  /**
   * @param {object[]} levelConfigs - Array of level config objects
   * @param {object} storageKeys - Storage keys for persistence
   */
  constructor(levelConfigs, storageKeys) {
    const LevelCtor = _LevelClass || Level;
    this.levels = levelConfigs.map(config => new LevelCtor(config));
    this.storageKeys = storageKeys;
    this.currentIndex = 0;
    this.completedLevels = new Set();
    
    this._loadProgress();
  }

  /**
   * Get current level
   * @returns {Level}
   */
  getCurrentLevel() {
    return this.levels[this.currentIndex] || this.levels[0];
  }

  /**
   * Get level by ID
   * @param {number} id
   * @returns {Level|null}
   */
  getLevelById(id) {
    return this.levels.find(level => level.id === id) || null;
  }

  /**
   * Get current level number (1-based)
   * @returns {number}
   */
  getCurrentLevelNumber() {
    return this.currentIndex + 1;
  }

  /**
   * Get total number of levels
   * @returns {number}
   */
  getTotalLevels() {
    return this.levels.length;
  }

  /**
   * Check if there's a next level
   * @returns {boolean}
   */
  hasNextLevel() {
    return this.currentIndex < this.levels.length - 1;
  }

  /**
   * Move to next level
   * @returns {Level|null} The next level, or null if at end
   */
  nextLevel() {
    if (this.hasNextLevel()) {
      this.currentIndex++;
      this._saveProgress();
      return this.getCurrentLevel();
    }
    return null;
  }

  /**
   * Go to specific level by index
   * @param {number} index - 0-based index
   * @returns {Level|null}
   */
  goToLevel(index) {
    if (index >= 0 && index < this.levels.length) {
      this.currentIndex = index;
      this._saveProgress();
      return this.getCurrentLevel();
    }
    return null;
  }

  /**
   * Mark current level as completed
   */
  completeCurrentLevel() {
    const level = this.getCurrentLevel();
    if (level) {
      this.completedLevels.add(level.id);
      this._saveProgress();
    }
  }

  /**
   * Check if a level is completed
   * @param {number} levelId
   * @returns {boolean}
   */
  isLevelCompleted(levelId) {
    return this.completedLevels.has(levelId);
  }

  /**
   * Get count of completed levels
   * @returns {number}
   */
  getCompletedCount() {
    return this.completedLevels.size;
  }

  /**
   * Get all levels by difficulty
   * @param {string} difficulty - 'easy', 'medium', or 'hard'
   * @returns {Level[]}
   */
  getLevelsByDifficulty(difficulty) {
    return this.levels.filter(level => level.difficulty === difficulty);
  }

  /**
   * Get all 3-slot levels
   * @returns {Level[]}
   */
  getThreeSlotLevels() {
    return this.levels.filter(level => level.slotCount === 3);
  }

  /**
   * Get progress percentage
   * @returns {number} 0-100
   */
  getProgressPercent() {
    return Math.round((this.completedLevels.size / this.levels.length) * 100);
  }

  /**
   * Reset all progress
   */
  resetProgress() {
    this.currentIndex = 0;
    this.completedLevels.clear();
    this._saveProgress();
  }

  /**
   * Load progress from localStorage
   * @private
   */
  _loadProgress() {
    try {
      const savedLevel = localStorage.getItem(this.storageKeys.LEVEL);
      if (savedLevel) {
        const levelNum = parseInt(savedLevel, 10);
        // Convert 1-based level number to 0-based index
        this.currentIndex = Math.max(0, Math.min(levelNum - 1, this.levels.length - 1));
      }
      
      const savedCompleted = localStorage.getItem(this.storageKeys.COMPLETED_LEVELS);
      if (savedCompleted) {
        const completedIds = JSON.parse(savedCompleted);
        this.completedLevels = new Set(completedIds);
      }
    } catch (e) {
      console.warn('LevelManager: Failed to load progress', e);
    }
  }

  /**
   * Save progress to localStorage
   * @private
   */
  _saveProgress() {
    try {
      // Save as 1-based level number for backward compatibility
      localStorage.setItem(this.storageKeys.LEVEL, String(this.currentIndex + 1));
      localStorage.setItem(
        this.storageKeys.COMPLETED_LEVELS, 
        JSON.stringify([...this.completedLevels])
      );
    } catch (e) {
      console.warn('LevelManager: Failed to save progress', e);
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    this.levels = [];
    this.completedLevels.clear();
  }
}

// Dual-export pattern
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LevelManager };
}
if (typeof window !== 'undefined') {
  window.LevelManager = LevelManager;
}
