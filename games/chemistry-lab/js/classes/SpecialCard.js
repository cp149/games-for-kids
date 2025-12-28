/**
 * Special Card - Catalyst, Stabilizer, etc.
 */

class SpecialCard {
  constructor(type, config) {
    this.id = `special_${Date.now()}_${Math.random()}`;
    this.type = type; // 'CATALYST', 'STABILIZER'
    this.config = config;

    // Special card properties
    const specialData = SPECIAL_TYPES[type];
    this.emoji = specialData.emoji;
    this.name = specialData.name;
    this.colorClass = specialData.class;

    // State
    this.isUsed = false;

    // Create DOM element
    this.element = null;
    this.createDOM();
  }

  /**
   * Create DOM element
   */
  createDOM() {
    this.element = document.createElement('div');
    this.element.className = `special-card ${this.colorClass}`;
    this.element.draggable = true;
    this.element.dataset.cardId = this.id;
    this.element.dataset.cardType = this.type;

    // Emoji
    const emoji = document.createElement('div');
    emoji.textContent = this.emoji;
    this.element.appendChild(emoji);

    // Label
    const label = document.createElement('div');
    label.className = 'card-label';
    label.textContent = this.name;
    this.element.appendChild(label);
  }

  /**
   * Mark as used
   */
  use() {
    this.isUsed = true;

    if (this.type === 'STABILIZER') {
      // Stabilizers are consumed
      this.destroy();
    } else if (this.type === 'CATALYST') {
      // Catalysts return to hand (reusable)
      // Visual feedback that it was used
      if (this.element) {
        this.element.style.opacity = '0.7';
        setTimeout(() => {
          if (this.element) {
            this.element.style.opacity = '1';
          }
        }, 500);
      }
    }
  }

  /**
   * Reset used state (for catalysts)
   */
  reset() {
    if (this.type === 'CATALYST') {
      this.isUsed = false;
    }
  }

  /**
   * Clean up
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.SpecialCard = SpecialCard;
}
