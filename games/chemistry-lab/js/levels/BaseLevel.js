/**
 * BaseLevel - Abstract base class for all levels
 * Defines the lifecycle and interface for specific level implementations.
 */

class BaseLevel {
  constructor(game, config) {
    this.game = game;
    this.config = config;
    this.id = config.level;
    this.name = config.name;
    this.isComplete = false;
    
    // Level-specific state
    this.progress = {
      reactionsCompleted: 0,
      catalystUsed: 0,
      specificReactions: {}
    };
  }

  /**
   * Initialize the level
   * Called when level is loaded
   */
  initialize() {
    console.log(`Initializing Level ${this.id}: ${this.name}`);
    this.resetProgress();
    // Subclasses can override to set up specific mechanics
  }

  /**
   * Reset level progress
   */
  resetProgress() {
    this.progress = {
      reactionsCompleted: 0,
      catalystUsed: 0,
      specificReactions: {}
    };
    this.isComplete = false;
  }

  /**
   * Update level logic
   * Called every frame
   * @param {number} deltaTime - Time since last frame
   */
  update(deltaTime) {
    // Subclasses can override for custom update logic (e.g. moving hazards)
  }

  /**
   * Handle reaction event
   * Called when a reaction occurs
   * @param {Object} reactionResult - The result of the reaction
   */
  onReaction(reactionResult) {
    this.progress.reactionsCompleted++;
    
    // Track specific reaction types (using both result key and output name)
    const keys = [reactionResult.result];
    if (reactionResult.output) {
      keys.push(reactionResult.output);
    }

    keys.forEach(key => {
      if (!this.progress.specificReactions[key]) {
        this.progress.specificReactions[key] = 0;
      }
      this.progress.specificReactions[key]++;
    });

    // Check completion after every reaction
    this.checkCompletion();
  }

  /**
   * Handle catalyst usage
   */
  onCatalystUsed() {
    this.progress.catalystUsed++;
    this.checkCompletion();
  }

  /**
   * Check if level objective is met
   * @returns {boolean} - True if complete
   */
  checkCompletion() {
    if (this.isComplete) return true;

    // Default implementation uses the config-based objective check
    // Subclasses can override 'checkObjectiveMet' for custom logic
    if (this.checkObjectiveMet()) {
      this.completeLevel();
      return true;
    }
    return false;
  }

  /**
   * Core objective check logic (Config-driven fallback)
   */
  checkObjectiveMet() {
    const objective = this.config.objective;
    if (!objective) return false;

    switch (objective.type) {
      case 'count':
        return this.progress.reactionsCompleted >= objective.target;

      case 'score':
        return this.game.score >= objective.target;

      case 'specific':
        return Object.entries(objective.target).every(([type, count]) => {
          return (this.progress.specificReactions[type] || 0) >= count;
        });

      case 'multiple_specific':
        // Same as 'specific' - check all targets are met
        return Object.entries(objective.target).every(([type, count]) => {
          return (this.progress.specificReactions[type] || 0) >= count;
        });

      case 'catalyst_count':
        return this.progress.catalystUsed >= objective.target;

      default:
        return false;
    }
  }

  /**
   * Complete the level
   */
  completeLevel() {
    if (this.isComplete) return;
    
    this.isComplete = true;
    console.log(`Level ${this.id} Complete!`);
    
    // Notify Game/LevelManager
    if (this.game.handleLevelComplete) {
      this.game.handleLevelComplete();
    }
  }

  /**
   * Get formatted objective data for UI
   * @returns {Object} - Data structure for UIManager
   */
  getObjectiveData() {
    if (!this.config) return null;

    const objective = this.config.objective;
    const progress = this.progress;
    const currentScore = this.game.score;

    switch (objective.type) {
      case 'specific': {
        const targetKey = Object.keys(objective.target)[0];
        const count = objective.target[targetKey];
        const current = progress.specificReactions[targetKey] || 0;
        const recipe = this.findRecipe(targetKey);

        return {
          type: 'specific',
          targetKey,
          targetCount: count,
          currentCount: current,
          recipe,
          description: objective.description
        };
      }

      case 'count': {
        let sampleRecipe = null;
        // Level 1 shows a sample recipe for teaching
        if (this.id === 1) {
          sampleRecipe = this.findRecipe('RED_EXPLOSION') || this.findRecipe('BLUE_EXPLOSION');
        }

        return {
          type: 'count',
          targetCount: objective.target,
          currentCount: progress.reactionsCompleted,
          recipe: sampleRecipe,
          description: this.getObjectiveText()
        };
      }

      case 'score':
        return {
          type: 'score',
          targetScore: objective.target,
          currentScore: currentScore || 0,
          description: this.getObjectiveText()
        };

      case 'catalyst_count':
        return {
          type: 'catalyst',
          targetCount: objective.target,
          currentCount: progress.catalystUsed,
          description: this.getObjectiveText()
        };

      case 'multiple_specific': {
        // Build progress display for multiple targets
        const targets = Object.entries(objective.target);
        const items = targets.map(([type, count]) => {
          const current = progress.specificReactions[type] || 0;
          const recipe = this.findRecipe(type);
          return {
            type,
            target: count,
            current,
            emoji: recipe ? recipe.output : '❓',
            complete: current >= count
          };
        });

        return {
          type: 'multiple_specific',
          items,
          description: objective.description
        };
      }

      default:
        return {
          type: 'unknown',
          description: objective.description
        };
    }
  }

  /**
   * Find recipe for a target output
   * @param {string} targetOutput - Target reaction output
   * @returns {Object|null} - Recipe data or null
   */
  findRecipe(targetOutput) {
    if (typeof REACTIONS === 'undefined') return null;

    for (const [key, reaction] of Object.entries(REACTIONS)) {
      if (reaction.output === targetOutput || reaction.result === targetOutput) {
        const ingredients = key.split('+').map(type => {
          const rType = REAGENT_TYPES[type];
          return rType ? rType.emoji : '❓';
        });

        return {
          inputs: ingredients,
          output: reaction.emoji,
          outputName: reaction.output || reaction.result
        };
      }
    }
    return null;
  }

  /**
   * Get localized objective text
   * @returns {string} - Formatted objective text
   */
  getObjectiveText() {
    if (!this.config || !this.game.i18n) return '';

    const objective = this.config.objective;
    const timer = this.config.timer;
    const expiration = this.config.expirationTime;
    const i18n = this.game.i18n;

    switch (objective.type) {
      case 'count':
        if (timer && expiration) {
          return i18n.t('objective_expiring_cards', {
            count: objective.target,
            expire: expiration
          });
        } else if (timer) {
          return i18n.t('objective_timed_count', {
            count: objective.target,
            time: timer
          });
        } else {
          return i18n.t('objective_count', { count: objective.target });
        }

      case 'score':
        return i18n.t('objective_score', { score: objective.target });

      case 'specific':
        const reactionType = Object.keys(objective.target)[0];
        const count = objective.target[reactionType];

        if (reactionType === 'PURPLE_EXPLOSION') {
          return i18n.t('objective_specific_purple', { count });
        } else if (reactionType === 'STEAM') {
          return i18n.t('objective_specific_steam', { count });
        } else if (reactionType === 'RAINBOW_EXPLOSION') {
          if (expiration) {
            return i18n.t('objective_rainbow_stable', { count });
          }
          return i18n.t('objective_specific_rainbow', { count });
        }
        return objective.description;

      case 'catalyst_count':
        if (timer) {
          return i18n.t('objective_timed_catalyst', {
            count: objective.target,
            time: timer
          });
        } else {
          const key = objective.target === 1 ? 'objective_catalyst' : 'objective_catalyst_plural';
          return i18n.t(key, { count: objective.target });
        }

      default:
        return objective.description;
    }
  }

  /**
   * Clean up level resources
   * Called when switching levels
   */
  destroy() {
    console.log(`Destroying Level ${this.id}`);
    // Subclasses should cleanup any custom event listeners or timers here
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.BaseLevel = BaseLevel;
}
