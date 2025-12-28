/**
 * Card Drop Manager
 * Handles card spawning and falling logic
 */

class CardDropManager {
  constructor(config, levelData) {
    this.config = config;
    this.levelData = levelData;

    // State
    this.cards = [];
    this.dropTimer = null;
    this.lastDropTime = 0;
    this.isPaused = false;

    // Drop zone bounds
    this.dropZoneWidth = config.CARDS.DROP_ZONE_WIDTH;
    this.dropZoneHeight = config.CARDS.DROP_ZONE_HEIGHT;
  }

  /**
   * Start dropping cards
   */
  start() {
    this.isPaused = false;
    this.lastDropTime = Date.now();
    this.scheduleNextDrop();
  }

  /**
   * Stop dropping cards
   */
  stop() {
    this.isPaused = true;
    if (this.dropTimer) {
      clearTimeout(this.dropTimer);
      this.dropTimer = null;
    }
  }

  /**
   * Schedule next card drop
   */
  scheduleNextDrop() {
    if (this.isPaused) return;

    const interval = this.levelData.dropInterval || this.config.CARDS.DROP_INTERVAL;
    this.dropTimer = setTimeout(() => {
      this.dropCard();
      this.scheduleNextDrop();
    }, interval);
  }

  /**
   * Drop a new card
   */
  dropCard() {
    // Don't generate cards if paused
    if (this.isPaused) {
      console.log('[CardDropMgr] dropCard() skipped: isPaused=true');
      return;
    }

    // Select random reagent type from level's card pool
    const cardTypes = this.levelData.cards || ['RED', 'BLUE'];
    console.log('[CardDropMgr] Card types:', cardTypes);
    const randomType = cardTypes[Math.floor(Math.random() * cardTypes.length)];

    // Random x position within drop zone
    const cardWidth = this.config.CARDS.CARD_WIDTH;
    const maxX = this.dropZoneWidth - cardWidth;
    const x = Math.random() * maxX;
    const y = 0;

    // Create card
    console.log(`[CardDropMgr] Dropping ${randomType} at (${x}, ${y})`);
    const card = new ReagentCard(randomType, x, y, this.config);
    this.cards.push(card);
    console.log(`[CardDropMgr] Total cards: ${this.cards.length}`);

    // Start expiration timer if level has expiration
    if (this.levelData.expirationTime) {
      card.startExpiration(this.levelData.expirationTime, (expiredCard) => {
        this.handleCardExpiration(expiredCard);
      });
    }

    return card;
  }

  /**
   * Handle card expiration
   */
  handleCardExpiration(card) {
    // Remove from cards array
    const index = this.cards.indexOf(card);
    if (index > -1) {
      this.cards.splice(index, 1);
    }

    // Destroy card
    card.destroy();

    // Trigger event (game will handle penalty)
    if (this.onCardExpired) {
      this.onCardExpired(card);
    }
  }

  /**
   * Update all cards (falling animation)
   */
  update(deltaTime) {
    if (this.isPaused) {
      console.log('[CardDropMgr] update() skipped: isPaused=true');
      return;
    }

    console.log(`[CardDropMgr] update() called with deltaTime=${deltaTime}, cards count=${this.cards.length}`);

    // Update cards and remove out-of-bounds ones
    this.cards = this.cards.filter(card => {
      const shouldRemove = card.update(deltaTime);
      if (shouldRemove && !card.isInSlot) {
        card.destroy();

        // Trigger missed card event
        if (this.onCardMissed) {
          this.onCardMissed(card);
        }
      }
      return !shouldRemove;
    });
  }

  /**
   * Remove card from manager
   */
  removeCard(card) {
    const index = this.cards.indexOf(card);
    if (index > -1) {
      this.cards.splice(index, 1);
    }
  }

  /**
   * Get card by ID
   */
  getCardById(id) {
    return this.cards.find(card => card.id === id);
  }

  /**
   * Clean up
   */
  destroy() {
    this.stop();

    // Destroy all cards
    this.cards.forEach(card => card.destroy());
    this.cards = [];
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.CardDropManager = CardDropManager;
}
