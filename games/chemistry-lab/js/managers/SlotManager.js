/**
 * Slot Manager
 * Manages experiment table slots
 */

class SlotManager {
  constructor(config) {
    this.config = config;

    // Slots array (4 slots)
    this.slots = [null, null, null, null];

    // DOM elements
    this.slotElements = [];
    this.initializeSlots();
  }

  /**
   * Initialize slot DOM references
   */
  initializeSlots() {
    const slotEls = document.querySelectorAll('.experiment-slot');
    slotEls.forEach((el, index) => {
      this.slotElements[index] = el;
    });
  }

  /**
   * Place card in slot
   */
  placeCardInSlot(card, slotIndex) {
    if (slotIndex < 0 || slotIndex >= this.slots.length) {
      return false;
    }

    // Check if slot is empty in logical state
    if (this.slots[slotIndex] !== null) {
      return false;
    }
    
    // Safety check: DOM state
    const slotEl = this.slotElements[slotIndex];
    if (slotEl.children.length > 0) {
      // Slot logically empty but DOM has children - clean up ghost elements
      console.warn(`Slot ${slotIndex} desync detected. Cleaning up ghost elements.`);
      while (slotEl.firstChild) {
        slotEl.removeChild(slotEl.firstChild);
      }
    }

    // Place card
    this.slots[slotIndex] = card;
    card.moveToSlot(slotIndex, slotEl);

    // Update slot visual
    slotEl.classList.add('filled');

    return true;
  }

  /**
   * Remove card from slot
   */
  removeCardFromSlot(slotIndex) {
    if (slotIndex < 0 || slotIndex >= this.slots.length) {
      return null;
    }

    const card = this.slots[slotIndex];
    if (card) {
      card.removeFromSlot();
      this.slots[slotIndex] = null;

      // Update slot visual
      this.slotElements[slotIndex].classList.remove('filled');
    }

    return card;
  }

  /**
   * Clear all slots
   */
  clearAllSlots() {
    for (let i = 0; i < this.slots.length; i++) {
      this.removeCardFromSlot(i);
    }
  }

  /**
   * Get cards in slots
   */
  getSlotCards() {
    return this.slots.filter(card => card !== null);
  }

  /**
   * Get card types in slots
   */
  getSlotCardTypes() {
    return this.slots
      .filter(card => card !== null)
      .map(card => card.type);
  }

  /**
   * Check if slot is filled
   */
  isSlotFilled(slotIndex) {
    return this.slots[slotIndex] !== null;
  }

  /**
   * Check if any slots are filled
   */
  hasFilledSlots() {
    return this.slots.some(card => card !== null);
  }

  /**
   * Get filled slot count
   */
  getFilledSlotCount() {
    return this.slots.filter(card => card !== null).length;
  }

  /**
   * Clean up
   */
  destroy() {
    this.clearAllSlots();
    this.slotElements = [];
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.SlotManager = SlotManager;
}
