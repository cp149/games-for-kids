/**
 * Game State Manager
 * Manages game state, level loading, and win conditions
 */

import { Level } from '../core/level.js';
import { levels } from '../../data/levels.js';
import { LevelGenerator } from '../utils/level-generator.js';
import i18n from '../utils/i18n.js';
import { VISUAL_CONSTANTS } from '../config/visual-constants.js';
import logger from '../utils/logger.js';

export class GameStateManager {
  constructor(canvas, renderer, settings) {
    this.canvas = canvas;
    this.renderer = renderer;
    this.settings = settings;
    this.levelGenerator = new LevelGenerator();

    // State
    this.currentLevelIndex = 0;
    this.levels = levels;
    this.currentLevelInstance = null;
    this.moves = 0;
    this.startTime = 0;
    this.elapsedTime = 0;
    this.showInitialHint = false;
    this.isRandomMode = false;
    this.currentDifficulty = 3;
    this.activeTimers = []; // Track timers for cleanup
    this.isDestroyed = false; // Prevent race conditions

    // Callbacks (set by Game)
    this.onLevelLoaded = null;
    this.onWin = null;
  }

  /**
   * Load a specific level by index
   * @param {number} levelIndex - Level index
   */
  loadLevel(levelIndex) {
    if (levelIndex >= this.levels.length) {
      logger.error('Level index out of bounds:', levelIndex);
      return;
    }

    // Cleanup old level
    this.destroyCurrentLevel();

    // Reset state
    this.currentLevelIndex = levelIndex;
    this.moves = 0;
    this.startTime = Date.now();
    this.showInitialHint = (levelIndex === 0);
    this.isRandomMode = false;

    const levelData = this.levels[levelIndex];

    // Create new level instance
    this.currentLevelInstance = new Level(levelData, this.canvas);
    this.currentLevelInstance.activate();

    // Notify game
    if (this.onLevelLoaded) {
      this.onLevelLoaded({
        badge: `${i18n.t('level')} ${levelIndex + 1}`,
        title: this.getLevelTitle(levelIndex),
        description: i18n.t(`level_desc_${levelIndex}`)
      });
    }
  }

  /**
   * Load a randomly generated level
   * @param {number} difficulty - Difficulty level (1-5)
   */
  loadRandomLevel(difficulty = 3) {
    // Cleanup old level
    this.destroyCurrentLevel();

    // Generate random level
    const randomLevelData = this.levelGenerator.generateLevel(difficulty);

    // Reset state
    this.moves = 0;
    this.startTime = Date.now();
    this.showInitialHint = false;
    this.isRandomMode = true;
    this.currentDifficulty = difficulty;

    // Create level instance
    this.currentLevelInstance = new Level(randomLevelData, this.canvas);
    this.currentLevelInstance.activate();

    // Notify game
    if (this.onLevelLoaded) {
      this.onLevelLoaded({
        badge: `${i18n.t('random')} ${difficulty}⭐`,
        title: randomLevelData.title,
        description: randomLevelData.description
      });
    }
  }

  /**
   * Restart current level
   */
  restartLevel() {
    if (this.isRandomMode) {
      this.loadRandomLevel(this.currentDifficulty);
    } else {
      this.loadLevel(this.currentLevelIndex);
    }
  }

  /**
   * Load next level
   */
  nextLevel() {
    if (this.isRandomMode) {
      this.loadRandomLevel(this.currentDifficulty);
      return;
    }

    const nextLevel = this.currentLevelIndex + 1;
    if (nextLevel < this.levels.length) {
      this.loadLevel(nextLevel);
    } else {
      // Game complete - notify via callback
      if (this.onWin) {
        this.onWin({ gameComplete: true });
      }
    }
  }

  /**
   * Handle button click
   * @param {Object} button - Button object
   */
  clickButton(button) {
    button.toggle();
    this.moves++;
    this.showInitialHint = false;

    // Create visual effects
    if (this.settings.get('particles')) {
      this.renderer.createExplosion(button.x, button.y, button.active ? '#00ff00' : '#3a4f6c');

      // Triple ripple rings with tracked timers
      for (let i = 0; i < VISUAL_CONSTANTS.RIPPLE_EFFECT_COUNT; i++) {
        const timerId = setTimeout(() => {
          if (this.isDestroyed) return;

          const index = this.activeTimers.indexOf(timerId);
          if (index > -1) {
            this.activeTimers.splice(index, 1);
          }

          const radius = VISUAL_CONSTANTS.RIPPLE_BASE_RADIUS + i * VISUAL_CONSTANTS.RIPPLE_RADIUS_INCREMENT;
          this.renderer.createRing(button.x, button.y, radius, '#00ff88');
        }, i * VISUAL_CONSTANTS.RIPPLE_EFFECT_DELAY_MS);
        this.activeTimers.push(timerId);
      }
    }

    // Check win condition after signal propagation (tracked timer)
    const winCheckTimer = setTimeout(() => {
      if (this.isDestroyed) return;

      const index = this.activeTimers.indexOf(winCheckTimer);
      if (index > -1) {
        this.activeTimers.splice(index, 1);
      }

      this.checkWinCondition();
    }, VISUAL_CONSTANTS.SIGNAL_PROPAGATION_DELAY_MS);
    this.activeTimers.push(winCheckTimer);
  }

  /**
   * Check if level is won
   */
  checkWinCondition() {
    if (!this.currentLevelInstance) return;

    if (this.currentLevelInstance.checkWinCondition()) {
      this.winLevel();
    }
  }

  /**
   * Handle level win
   */
  winLevel() {
    if (!this.currentLevelInstance) return;

    this.elapsedTime = Date.now() - this.startTime;

    // Deactivate level
    this.currentLevelInstance.deactivate();

    // Create success fireworks
    if (this.settings.get('particles')) {
      const doors = this.currentLevelInstance.mechanisms.filter(m => m.type === 'door');
      doors.forEach(door => {
        // Create confetti burst
        for (let i = 0; i < VISUAL_CONSTANTS.CONFETTI_COUNT; i++) {
          const angle = (Math.PI * 2 * i) / VISUAL_CONSTANTS.CONFETTI_COUNT;
          this.renderer.createConfetti(door.x, door.y, angle);
        }
        // Explosion effect
        this.renderer.createExplosion(door.x, door.y, VISUAL_CONSTANTS.SUCCESS_EXPLOSION_PARTICLES, '#00ff00');
      });
    }

    // Notify game
    if (this.onWin) {
      this.onWin({
        gameComplete: false,
        moves: this.moves,
        time: this.elapsedTime
      });
    }
  }

  /**
   * Destroy current level instance
   */
  destroyCurrentLevel() {
    // Cancel all pending timers from this manager
    this.activeTimers.forEach(timerId => clearTimeout(timerId));
    this.activeTimers = [];

    if (this.currentLevelInstance) {
      this.currentLevelInstance.destroy();
      this.currentLevelInstance = null;
    }
  }

  /**
   * Get button at canvas coordinates
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {Object|null} Button object or null
   */
  getButtonAt(x, y) {
    if (!this.currentLevelInstance || !this.currentLevelInstance.isActive) {
      return null;
    }
    return this.currentLevelInstance.handleClick(x, y);
  }

  /**
   * Update level
   * @param {number} deltaTime - Time delta
   * @param {number} timestamp - Current timestamp
   */
  update(deltaTime, timestamp = 0) {
    if (this.currentLevelInstance) {
      this.currentLevelInstance.update(deltaTime, timestamp);
    }
  }

  /**
   * Get level title by index
   * @param {number} index - Level index
   * @returns {string} Level title
   */
  getLevelTitle(index) {
    // Use i18n for level titles
    const titleKey = `level_title_${index}`;
    const translatedTitle = i18n.t(titleKey);

    // Fallback to key if translation not found
    if (translatedTitle === titleKey) {
      return `${i18n.t('level')} ${index + 1}`;
    }

    return translatedTitle;
  }

  /**
   * Get current elapsed time
   * @returns {number} Elapsed time in milliseconds
   */
  getElapsedTime() {
    return Date.now() - this.startTime;
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.isDestroyed = true;
    this.destroyCurrentLevel();

    // Cancel any remaining timers
    this.activeTimers.forEach(timerId => clearTimeout(timerId));
    this.activeTimers = [];

    // Clear references
    this.canvas = null;
    this.renderer = null;
    this.settings = null;
    this.levelGenerator = null;
  }
}
