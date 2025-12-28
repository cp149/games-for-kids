/**
 * Level 6: Reversible Reactions
 * Introduces reversible reaction concept with WATER <-> STEAM
 * + Micro-view demonstration (liquid-to-gas concept)
 */

class Level6 extends BaseLevel {
  constructor(game) {
    const config = {
      level: 6,
      name: 'Reversible Reactions',
      objective: {
        type: 'specific',
        target: { 'STEAM': 3 },
        description: 'Create 3 Steam clouds (swipe to reverse!)'
      },
      timer: 90,
      cards: ['RED', 'BLUE'],
      dropInterval: 1500,
      specialCards: []
    };

    super(game, config);
    this.hasShownReversibilityHint = false;
    this.hasShownMicroView = false;
  }

  /**
   * Initialize Level 6
   */
  initialize() {
    super.initialize();
    console.log('Level 6: Learn about reversible reactions!');
  }

  /**
   * Show hint about reversibility when first STEAM is created
   */
  onCardCreated(card) {
    super.onCardCreated(card);

    if (card.type === 'STEAM' && !this.hasShownReversibilityHint) {
      this.hasShownReversibilityHint = true;

      // Show NPC hint about swipe gesture
      setTimeout(() => {
        this.showReversibilityHint();
      }, 1000);
    }
  }

  /**
   * Show reversibility hint
   */
  showReversibilityHint() {
    const hint = document.createElement('div');
    hint.className = 'npc-hint';
    hint.style.animation = 'fadeIn 0.3s ease-out';

    const avatar = document.createElement('div');
    avatar.className = 'npc-avatar';
    avatar.textContent = '🧙‍♂️';

    const message = document.createElement('div');
    message.className = 'npc-message';
    message.innerHTML = `
      <strong>💡 Reversible Reactions!</strong><br>
      See the ⚡ zipper icon? This reaction can be reversed!<br>
      <em>Swipe horizontally across the STEAM card to separate it back into WATER and FIRE!</em>
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
   * Handle reaction (track STEAM creation)
   */
  onReaction(reactionResult) {
    super.onReaction(reactionResult);

    // Trigger micro-view on first STEAM creation (simulating liquid-to-gas)
    if (!this.hasShownMicroView &&
        (reactionResult.output === 'STEAM' || reactionResult.result === 'STEAM')) {

      this.hasShownMicroView = true;

      // Trigger particle personality demonstration
      if (this.game.particlePersonality) {
        console.log('🔬 Triggering micro-view: liquid-to-gas transition');

        // Use center of canvas as focus point
        const focusX = this.game.config.CANVAS.CENTER_X;
        const focusY = this.game.config.CANVAS.CENTER_Y + 50;

        this.game.particlePersonality.triggerDemonstration(
          'liquid-to-gas',
          focusX,
          focusY
        );
      }
    }

    const steamCount = this.progress.reactionsCompleted['STEAM'] || 0;
    const target = this.config.objective.target['STEAM'];

    if (steamCount > 0 && steamCount < target) {
      console.log(`💨 Steam created: ${steamCount}/${target}`);
    }
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.Level6 = Level6;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Level6 };
}
