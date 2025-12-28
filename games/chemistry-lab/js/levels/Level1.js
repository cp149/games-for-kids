/**
 * Level 1: Red Magic 🔴
 * Teaching: Drag & mix basics with same-color pairing
 * Design: Pure sensory awakening - red explosion feedback
 */

class Level1 extends BaseLevel {
  constructor(game) {
    const config = {
      level: 1,
      name: 'Red Magic',
      objective: {
        type: 'specific',
        target: { 'RED_BOOM': 3 },
        description: '🔴 + 🔴 = 💥 (×3)'
      },
      timer: null, // unlimited time for tutorial
      cards: ['RED'], // Only red cards
      dropInterval: 2500, // Slow for beginners
      specialCards: []
    };

    super(game, config);

    // Tutorial state
    this.hasCompletedFirst = false;
  }

  /**
   * Initialize Level 1
   * Show subtle visual guidance
   */
  initialize() {
    super.initialize();
    console.log('🔴 Level 1: Red Magic - Learn to drag and mix!');

    // Gentle hint: slots pulse with breathing animation
    this.enableSlotPulseHint();
  }

  /**
   * Enable slot pulsing hint
   */
  enableSlotPulseHint() {
    if (this.game.slotMgr && this.game.slotMgr.slots) {
      this.game.slotMgr.slots.forEach(slot => {
        if (slot && slot.element) {
          slot.element.classList.add('tutorial-pulse');
        }
      });
    }
  }

  /**
   * Disable slot pulsing hint
   */
  disableSlotPulseHint() {
    if (this.game.slotMgr && this.game.slotMgr.slots) {
      this.game.slotMgr.slots.forEach(slot => {
        if (slot && slot.element) {
          slot.element.classList.remove('tutorial-pulse');
        }
      });
    }
  }

  /**
   * Handle reaction completion for Level 1
   * @param {Object} reactionResult - Reaction result
   */
  onReaction(reactionResult) {
    super.onReaction(reactionResult);

    // First reaction celebration
    if (!this.hasCompletedFirst &&
        (reactionResult.result === 'RED_BOOM' || reactionResult.output === 'RED_BOOM')) {
      this.hasCompletedFirst = true;
      this.disableSlotPulseHint();
      console.log('💥 Amazing! You created your first reaction!');

      // Vibration feedback (if supported)
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    }

    // Progress feedback
    const redBoomCount = this.progress.specificReactions['RED_BOOM'] || 0;
    const target = this.config.objective.target['RED_BOOM'];

    if (redBoomCount > 0 && redBoomCount < target) {
      console.log(`🔴 Red Booms: ${redBoomCount}/${target}`);
    }
  }

  /**
   * Custom cleanup for Level 1
   */
  cleanup() {
    this.disableSlotPulseHint();
    super.cleanup();
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.Level1 = Level1;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Level1 };
}
