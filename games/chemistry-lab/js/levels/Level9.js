/**
 * Level 9: Irreversible Reactions
 * Demonstrates irreversible reactions with LAVA -> OBSIDIAN
 */

class Level9 extends BaseLevel {
  constructor(game) {
    const config = {
      level: 9,
      name: 'Irreversible Reactions',
      objective: {
        type: 'specific',
        target: { 'OBSIDIAN': 2 },
        description: 'Create 2 Obsidian (permanent reactions!)'
      },
      timer: 120,
      cards: ['RED', 'BLUE', 'YELLOW'],
      dropInterval: 1500,
      specialCards: []
    };

    super(game, config);
    this.hasShownIrreversibilityHint = false;
  }

  /**
   * Initialize Level 9
   */
  initialize() {
    super.initialize();
    console.log('Level 9: Learn about irreversible reactions!');
  }

  /**
   * Show hint about irreversibility when LAVA is created
   */
  onCardCreated(card) {
    super.onCardCreated(card);

    if (card.type === 'LAVA' && !this.hasShownIrreversibilityHint) {
      this.hasShownIrreversibilityHint = true;

      // Show NPC hint about irreversible reactions
      setTimeout(() => {
        this.showIrreversibilityHint();
      }, 1000);
    }

    // Handle LAVA cooling to OBSIDIAN automatically after delay
    if (card.type === 'LAVA') {
      this.scheduleLavaCooling(card);
    }
  }

  /**
   * Schedule LAVA cooling to OBSIDIAN
   */
  scheduleLavaCooling(lavaCard) {
    setTimeout(() => {
      // Check if card still exists and is in a slot
      if (!lavaCard.destroyed && lavaCard.isInSlot) {
        this.coolLavaToObsidian(lavaCard);
      }
    }, 3000); // Cool after 3 seconds
  }

  /**
   * Cool LAVA to OBSIDIAN (irreversible transformation)
   */
  coolLavaToObsidian(lavaCard) {
    const slotIndex = lavaCard.slotIndex;

    // Remove LAVA card
    this.game.slotMgr.removeCardFromSlot(slotIndex);
    this.game.cardDropMgr.removeCard(lavaCard);
    lavaCard.destroy();

    // Create OBSIDIAN card
    const obsidianCard = this.game.cardFactory.createReagentCard('OBSIDIAN', 0, 0);
    this.game.cardDropMgr.cards.push(obsidianCard);

    // Add irreversibility indicator
    if (this.game.reversibilitySystem) {
      this.game.reversibilitySystem.addReversibilityIndicator(
        obsidianCard.element,
        'LAVA_OBSIDIAN'
      );
    }

    // Place in slot
    this.game.slotMgr.placeCardInSlot(obsidianCard, slotIndex);

    // Update progress
    this.progress.reactionsCompleted['OBSIDIAN'] = (this.progress.reactionsCompleted['OBSIDIAN'] || 0) + 1;

    // Check completion
    this.checkCompletion();

    console.log('🌋 → 🪨 LAVA cooled to OBSIDIAN (irreversible!)');
  }

  /**
   * Show irreversibility hint
   */
  showIrreversibilityHint() {
    const hint = document.createElement('div');
    hint.className = 'npc-hint';
    hint.style.animation = 'fadeIn 0.3s ease-out';

    const avatar = document.createElement('div');
    avatar.className = 'npc-avatar';
    avatar.textContent = '🧙‍♂️';

    const message = document.createElement('div');
    message.className = 'npc-message';
    message.innerHTML = `
      <strong>🔒 Irreversible Reactions!</strong><br>
      LAVA will cool to OBSIDIAN in 3 seconds.<br>
      <em>See the 🔒 lock icon? This reaction is permanent - you cannot reverse it!</em>
    `;

    hint.appendChild(avatar);
    hint.appendChild(message);
    document.body.appendChild(hint);

    // Remove after 5 seconds
    setTimeout(() => {
      hint.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => hint.remove(), 300);
    }, 5000);
  }

  /**
   * Handle reaction (track LAVA creation)
   */
  onReaction(reactionResult) {
    super.onReaction(reactionResult);
  }

  /**
   * Level 9 completion
   */
  completeLevel() {
    super.completeLevel();
    console.log('🏆 You understand reversible AND irreversible reactions!');
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.Level9 = Level9;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Level9 };
}
