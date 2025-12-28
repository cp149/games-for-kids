/**
 * Reaction Manager
 * Handles reaction validation, triggering, and effects
 */

class ReactionManager {
  constructor(config, reactionRules, particleSystem) {
    this.config = config;
    this.reactionRules = reactionRules;
    this.particleSystem = particleSystem;

    // State
    this.reactions = [];
    this.catalystActive = false;
    this.catalystCard = null;
  }

  /**
   * Check and perform reaction with cards
   * @param {Array<ReagentCard>} cards - Cards to react
   * @param {boolean} hasCatalyst - Whether catalyst is used
   * @returns {Object|null} - Reaction result or null
   */
  performReaction(cards, hasCatalyst = false) {
    if (cards.length === 0) {
      return null;
    }

    // Get card types
    const cardTypes = cards.map(card => card.type);

    // Check for valid reaction
    const reactionData = this.reactionRules.checkReaction(cardTypes);

    if (!reactionData) {
      return {
        success: false,
        message: 'No valid reaction'
      };
    }

    // Calculate score with catalyst bonus
    let points = reactionData.points;
    if (hasCatalyst) {
      // Catalyst: 2x points multiplier
      points = points * 2;
    }

    // Create reaction animation
    const x = this.config.CANVAS.CENTER_X;
    const y = this.config.CANVAS.CENTER_Y + 100;
    const reaction = new Reaction(reactionData, x, y, this.config);
    this.reactions.push(reaction);

    // Create particle effect
    if (this.particleSystem) {
      const particleCount = hasCatalyst ? 30 : 20;
      const color = hasCatalyst ? '#FFD700' : reactionData.color;
      this.particleSystem.createBurst(x, y, color, particleCount);

      // Add confetti for combo reactions
      if (points >= 20) {
        this.particleSystem.createConfetti(x, y, 15);
      }
    }

    return {
      success: true,
      reaction: reactionData,
      points: points,
      hasCatalyst: hasCatalyst
    };
  }

  /**
   * Update all reactions (animation)
   * @param {number} deltaTime - Time since last frame
   */
  update(deltaTime) {
    this.reactions = this.reactions.filter(reaction => {
      return !reaction.update(deltaTime);
    });
  }

  /**
   * Get active reactions (for rendering)
   */
  getActiveReactions() {
    return this.reactions;
  }

  /**
   * Clear all reactions
   */
  clearReactions() {
    this.reactions.forEach(r => r.destroy());
    this.reactions = [];
  }

  /**
   * Clean up
   */
  destroy() {
    this.clearReactions();
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.ReactionManager = ReactionManager;
}
