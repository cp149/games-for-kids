/**
 * Card Factory
 * Creates different types of cards
 */

class CardFactory {
  constructor(config) {
    this.config = config;
  }

  /**
   * Create reagent card
   */
  createReagentCard(type, x, y) {
    return new ReagentCard(type, x, y, this.config);
  }

  /**
   * Create special card
   */
  createSpecialCard(type) {
    return new SpecialCard(type, this.config);
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.CardFactory = CardFactory;
}
