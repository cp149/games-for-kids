/**
 * Dangerous Card Manager - Manages dangerous cards (LAVA) with hiccup warning
 * Handles explosion, cooling mechanics, and NPC assistant hints
 */

class DangerousCardManager {
  constructor(game) {
    this.game = game;
    this.dangerousCards = new Map(); // card.id -> { card, hiccup, audio }
    this.hasShownFirstHint = false;
    this.recoveryTime = 1000; // 1 second recovery after explosion
    this.isRecovering = false;

    // Config
    this.fuseTime = 5000; // 5 seconds until explosion
    this.dangerousTypes = ['LAVA']; // Can add more dangerous types
  }

  /**
   * Register a dangerous card (LAVA)
   * @param {ReagentCard} card - The card to monitor
   */
  registerDangerousCard(card) {
    if (!this.isDangerousType(card.type)) return;

    // Create hiccup animation
    const hiccup = new HiccuppingPot(card, this.fuseTime);
    hiccup.onExplosion = (explodedCard) => {
      this.handleExplosion(explodedCard);
    };

    // Create audio sync
    const audio = new HiccupAudioSync(this.game.audioMgr);
    audio.start(this.fuseTime);

    // Track
    this.dangerousCards.set(card.id, {
      card: card,
      hiccup: hiccup,
      audio: audio
    });

    console.log(`Registered dangerous card: ${card.type} (${card.id})`);
  }

  /**
   * Unregister a dangerous card (removed from game)
   * @param {ReagentCard} card - The card to stop monitoring
   */
  unregisterDangerousCard(card) {
    const data = this.dangerousCards.get(card.id);
    if (!data) return;

    // Clean up
    data.hiccup.destroy();
    data.audio.destroy();
    this.dangerousCards.delete(card.id);
  }

  /**
   * Cool down a dangerous card (dragged to ice/cooling zone)
   * Converts LAVA → OBSIDIAN
   * @param {ReagentCard} card - The card to cool
   */
  coolDownCard(card) {
    const data = this.dangerousCards.get(card.id);
    if (!data) return;

    console.log(`Cooling down ${card.type} → OBSIDIAN`);

    // Cancel hiccup and audio
    data.hiccup.cancel();
    data.audio.stop();

    // Transform card type (if OBSIDIAN reagent exists in config)
    // For now, just mark as safe
    card.type = 'OBSIDIAN';
    card.emoji = '🪨';
    if (card.element) {
      card.element.textContent = '🪨';
      card.element.className = 'reagent-card obsidian';
    }

    // Unregister
    this.unregisterDangerousCard(card);

    // Optional: Play cooling sound
    // this.game.audioMgr.playCoolingSound();
  }

  /**
   * Handle card explosion
   * @param {ReagentCard} card - The exploded card
   */
  handleExplosion(card) {
    console.log(`LAVA EXPLOSION: ${card.id}`);

    // Remove from tracking
    this.unregisterDangerousCard(card);

    // Remove card from game
    if (this.game.cardDropMgr) {
      this.game.cardDropMgr.removeCard(card);
    }

    // Remove from slot if in one
    if (card.isInSlot && this.game.slotMgr) {
      this.game.slotMgr.removeCardFromSlot(card.slotIndex);
    }

    // Destroy card
    card.destroy();

    // Apply penalty (1 second freeze instead of 3 seconds)
    this.applyExplosionPenalty();

    // Show NPC hint (first time only)
    if (!this.hasShownFirstHint) {
      this.showNPCHint();
      this.hasShownFirstHint = true;
    }

    // Play explosion sound
    if (this.game.audioMgr) {
      this.game.audioMgr.playSoundEffect('fail', 0.7);
    }
  }

  /**
   * Apply explosion penalty (1 second recovery)
   */
  applyExplosionPenalty() {
    if (this.isRecovering) return;

    this.isRecovering = true;

    // Pause card dropping
    if (this.game.cardDropMgr) {
      this.game.cardDropMgr.isPaused = true;
    }

    // Visual feedback
    this.showRecoveryOverlay();

    // Resume after 1 second
    setTimeout(() => {
      this.isRecovering = false;
      if (this.game.cardDropMgr) {
        this.game.cardDropMgr.isPaused = false;
      }
      this.hideRecoveryOverlay();
    }, this.recoveryTime);
  }

  /**
   * Show NPC assistant hint
   */
  showNPCHint() {
    const hintText = this.game.i18n.t('lava_hint') ||
      'Careful! Lava cards explode after 5 seconds. Drag them to a cooling zone or use them quickly!';

    // Create hint overlay
    const hint = document.createElement('div');
    hint.id = 'lava-hint';
    hint.className = 'npc-hint';
    hint.innerHTML = `
      <div class="npc-avatar">👩‍🔬</div>
      <div class="npc-message">${hintText}</div>
    `;
    hint.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 20px;
      border-radius: 10px;
      max-width: 400px;
      z-index: 1000;
      display: flex;
      gap: 15px;
      align-items: center;
      animation: fadeIn 0.3s ease-in;
    `;

    document.getElementById('game-container').appendChild(hint);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      hint.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => hint.remove(), 300);
    }, 4000);
  }

  /**
   * Show recovery overlay
   */
  showRecoveryOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'recovery-overlay';
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 0, 0, 0.3);
      z-index: 500;
      pointer-events: none;
      animation: pulse 1s ease-in-out;
    `;
    document.getElementById('game-container').appendChild(overlay);
  }

  /**
   * Hide recovery overlay
   */
  hideRecoveryOverlay() {
    const overlay = document.getElementById('recovery-overlay');
    if (overlay) {
      overlay.remove();
    }
  }

  /**
   * Update all dangerous cards
   * @param {number} deltaTime - Time since last frame
   */
  update(deltaTime) {
    if (this.isRecovering) return;

    this.dangerousCards.forEach(data => {
      data.hiccup.update();
    });
  }

  /**
   * Check if card type is dangerous
   * @param {string} type - Card type
   * @returns {boolean}
   */
  isDangerousType(type) {
    return this.dangerousTypes.includes(type);
  }

  /**
   * Get all active dangerous cards
   * @returns {Array} - Array of dangerous cards
   */
  getActiveDangerousCards() {
    return Array.from(this.dangerousCards.values()).map(d => d.card);
  }

  /**
   * Check if any dangerous cards are in warning phase
   * @returns {boolean}
   */
  hasWarningCards() {
    for (const data of this.dangerousCards.values()) {
      if (data.hiccup.isInWarningPhase()) {
        return true;
      }
    }
    return false;
  }

  /**
   * Clean up all dangerous cards
   */
  destroy() {
    this.dangerousCards.forEach(data => {
      data.hiccup.destroy();
      data.audio.destroy();
    });
    this.dangerousCards.clear();
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.DangerousCardManager = DangerousCardManager;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DangerousCardManager };
}
