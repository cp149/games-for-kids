/**
 * Reaction Rules
 * Validates and identifies chemical reactions
 */

class ReactionRules {
  constructor(reactions) {
    this.reactions = reactions;
  }

  /**
   * Check if card types form a valid reaction
   * @param {Array<string>} cardTypes - Array of card type strings
   * @returns {Object|null} - Reaction data or null
   */
  checkReaction(cardTypes) {
    if (cardTypes.length === 0) {
      return null;
    }

    // Sort card types for consistent lookup
    const sortedTypes = [...cardTypes].sort();
    const reactionKey = sortedTypes.join('+');

    // Check if reaction exists
    if (this.reactions[reactionKey]) {
      return {
        key: reactionKey,
        ...this.reactions[reactionKey]
      };
    }

    return null;
  }

  /**
   * Get all possible reactions
   */
  getAllReactions() {
    return Object.keys(this.reactions);
  }

  /**
   * Check if reaction involves specific card type
   */
  reactionIncludesType(reactionKey, cardType) {
    return reactionKey.includes(cardType);
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.ReactionRules = ReactionRules;
}
