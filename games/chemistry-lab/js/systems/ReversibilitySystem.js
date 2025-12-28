/**
 * Reversibility System
 * Manages visual distinction between reversible and irreversible reactions
 */

class ReversibilitySystem {
  constructor(config) {
    this.config = config;

    // Track reversible reactions
    this.reversibleReactions = new Set([
      'WATER_STEAM', // Water <-> Steam (L6)
      'STEAM_WATER'  // Reverse direction
    ]);

    // Track irreversible reactions
    this.irreversibleReactions = new Set([
      'LAVA_OBSIDIAN' // Lava -> Obsidian (L9, cannot be reversed)
    ]);
  }

  /**
   * Check if a reaction is reversible
   */
  isReversible(reactionKey) {
    return this.reversibleReactions.has(reactionKey);
  }

  /**
   * Check if a reaction is irreversible
   */
  isIrreversible(reactionKey) {
    return this.irreversibleReactions.has(reactionKey);
  }

  /**
   * Add visual indicators to a card based on reversibility
   */
  addReversibilityIndicator(cardElement, reactionKey) {
    // Remove any existing indicators
    this.removeReversibilityIndicator(cardElement);

    if (this.isReversible(reactionKey)) {
      // Add zipper icon for reversible reactions
      const zipperIcon = document.createElement('div');
      zipperIcon.className = 'reversibility-indicator zipper-icon';
      zipperIcon.textContent = '⚡';
      zipperIcon.setAttribute('title', 'Swipe to separate');
      cardElement.appendChild(zipperIcon);

      // Add zipper texture class
      cardElement.classList.add('reversible-card');
    } else if (this.isIrreversible(reactionKey)) {
      // Add lock icon for irreversible reactions
      const lockIcon = document.createElement('div');
      lockIcon.className = 'reversibility-indicator lock-icon';
      lockIcon.textContent = '🔒';
      lockIcon.setAttribute('title', 'Cannot be separated');
      cardElement.appendChild(lockIcon);

      // Add locked texture class
      cardElement.classList.add('irreversible-card');
    }
  }

  /**
   * Remove reversibility indicators from a card
   */
  removeReversibilityIndicator(cardElement) {
    const indicators = cardElement.querySelectorAll('.reversibility-indicator');
    indicators.forEach(indicator => indicator.remove());
    cardElement.classList.remove('reversible-card', 'irreversible-card');
  }

  /**
   * Get reaction key from card type
   */
  getReactionKey(cardType) {
    // Map card types to reaction keys
    const reactionMap = {
      'STEAM': 'WATER_STEAM',
      'OBSIDIAN': 'LAVA_OBSIDIAN'
    };

    return reactionMap[cardType] || null;
  }

  /**
   * Destroy system (cleanup)
   */
  destroy() {
    this.reversibleReactions.clear();
    this.irreversibleReactions.clear();
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.ReversibilitySystem = ReversibilitySystem;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ReversibilitySystem };
}
