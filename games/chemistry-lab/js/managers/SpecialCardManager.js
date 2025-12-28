/**
 * Special Card Manager
 * Manages catalyst and stabilizer cards
 */

class SpecialCardManager {
  constructor(config, cardFactory) {
    this.config = config;
    this.cardFactory = cardFactory;

    // State
    this.activeCatalyst = null;
    this.specialCards = [];

    // Callbacks
    this.onCatalystActivated = null;
    this.onStabilizerUsed = null;
  }

  /**
   * Create special cards for level
   */
  createSpecialCards(levelData) {
    const handArea = document.getElementById('hand-cards');
    if (!handArea) return;

    // Clear existing cards
    handArea.innerHTML = '';
    this.specialCards = [];

    if (!levelData.specialCards) return;

    // Create special cards
    levelData.specialCards.forEach(cardConfig => {
      for (let i = 0; i < cardConfig.count; i++) {
        const card = this.cardFactory.createSpecialCard(cardConfig.type);
        if (card.element) {
          handArea.appendChild(card.element);
          this.specialCards.push(card);
        }
      }
    });
  }

  /**
   * Handle catalyst dropped on slot
   */
  activateCatalyst(cardId) {
    const handArea = document.getElementById('hand-cards');
    if (!handArea) return false;

    const cardElement = handArea.querySelector(`[data-card-id="${cardId}"]`);
    if (!cardElement) return false;

    const cardType = cardElement.dataset.cardType;
    if (cardType !== 'CATALYST') return false;

    // Store active catalyst
    this.activeCatalyst = cardId;

    // Visual feedback
    cardElement.style.opacity = '0.5';
    cardElement.style.border = '3px solid #FFD700';

    // Trigger callback
    if (this.onCatalystActivated) {
      this.onCatalystActivated(cardId);
    }

    return true;
  }

  /**
   * Return catalyst to hand
   */
  returnCatalyst() {
    if (!this.activeCatalyst) return;

    const handArea = document.getElementById('hand-cards');
    if (!handArea) return;

    const cardElement = handArea.querySelector(`[data-card-id="${this.activeCatalyst}"]`);
    if (cardElement) {
      // Reset visual state
      cardElement.style.opacity = '1';
      cardElement.style.border = '3px solid #fff';

      // Play return animation
      cardElement.style.transform = 'scale(1.2)';
      setTimeout(() => {
        cardElement.style.transform = 'scale(1)';
      }, 300);
    }

    // Clear active catalyst
    this.activeCatalyst = null;
  }

  /**
   * Check if catalyst is active
   */
  hasCatalyst() {
    return this.activeCatalyst !== null;
  }

  /**
   * Use stabilizer on card
   */
  useStabilizer(stabilizerCardId, targetCard) {
    if (!targetCard) return false;

    const handArea = document.getElementById('hand-cards');
    if (!handArea) return false;

    const stabilizerElement = handArea.querySelector(`[data-card-id="${stabilizerCardId}"]`);
    if (!stabilizerElement) return false;

    const cardType = stabilizerElement.dataset.cardType;
    if (cardType !== 'STABILIZER') return false;

    // Stabilize the card
    targetCard.stabilize();

    // Remove stabilizer from hand (consumed)
    stabilizerElement.parentNode.removeChild(stabilizerElement);

    // Remove from tracking
    const index = this.specialCards.findIndex(c => c.id === stabilizerCardId);
    if (index > -1) {
      this.specialCards.splice(index, 1);
    }

    // Trigger callback
    if (this.onStabilizerUsed) {
      this.onStabilizerUsed(targetCard);
    }

    return true;
  }

  /**
   * Clear all special cards
   */
  clear() {
    this.specialCards.forEach(card => card.destroy());
    this.specialCards = [];
    this.activeCatalyst = null;

    const handArea = document.getElementById('hand-cards');
    if (handArea) {
      handArea.innerHTML = '';
    }
  }

  /**
   * Clean up
   */
  destroy() {
    this.clear();
    this.onCatalystActivated = null;
    this.onStabilizerUsed = null;
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.SpecialCardManager = SpecialCardManager;
}
