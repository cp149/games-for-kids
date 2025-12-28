/**
 * Level 8: Stable Science
 * Complex reaction with expiration - requires stabilizer strategy
 * Features dangerous LAVA cards with hiccup warning system
 */

class Level8 extends BaseLevel {
  constructor(game) {
    const config = {
      level: 8,
      name: 'Stable Science',
      objective: {
        type: 'specific',
        target: { 'RAINBOW_EXPLOSION': 1 },
        description: 'Make 1 rainbow explosion (use stabilizers wisely)'
      },
      timer: 120,
      cards: ['RED', 'BLUE', 'YELLOW'],
      dropInterval: 1800,
      expirationTime: 10,
      specialCards: [
        { type: 'STABILIZER', count: 4 }
      ]
    };

    super(game, config);

    // Dangerous card tracking
    this.lavaSpawnChance = 0.15; // 15% chance to spawn LAVA instead of MUD
  }

  /**
   * Initialize Level 8
   */
  initialize() {
    super.initialize();
    console.log('Level 8: Create a RAINBOW (🔴+🔵+🟡) - watch out for dangerous LAVA!');

    // Initialize dangerous card manager if not already present
    if (!this.game.dangerousCardMgr) {
      this.game.dangerousCardMgr = new DangerousCardManager(this.game);
    }
  }

  /**
   * Override card drop to include LAVA cards
   * Called by CardDropManager when creating new cards
   */
  onCardCreated(card) {
    // Check if MUD was created (BLUE+YELLOW synthesis)
    // Replace with LAVA 15% of the time
    if (card.type === 'MUD' && Math.random() < this.lavaSpawnChance) {
      // Transform to LAVA
      card.type = 'LAVA';
      card.emoji = '🌋';
      if (card.element) {
        card.element.textContent = '🌋';
        card.element.className = 'reagent-card lava';
      }

      // Register with dangerous card manager
      if (this.game.dangerousCardMgr) {
        this.game.dangerousCardMgr.registerDangerousCard(card);
      }

      console.log('🌋 LAVA card spawned! Be careful!');
    }
  }

  /**
   * Update level (called every frame)
   */
  update(deltaTime) {
    super.update(deltaTime);

    // Update dangerous card manager
    if (this.game.dangerousCardMgr) {
      this.game.dangerousCardMgr.update(deltaTime);
    }
  }

  /**
   * Handle reaction
   */
  onReaction(reactionResult) {
    super.onReaction(reactionResult);

    const isRainbow = reactionResult.result === 'RAINBOW_EXPLOSION' ||
                      reactionResult.output === 'RAINBOW_EXPLOSION';

    if (isRainbow) {
      console.log('🌈 RAINBOW EXPLOSION! Level complete!');
    } else if (reactionResult.output === 'LAVA') {
      console.log('⚠️ LAVA created! Watch out - it will explode in 5 seconds!');
    } else {
      console.log('Remember: RAINBOW = Red + Blue + Yellow (3 cards)');
    }
  }

  /**
   * Clean up level resources
   */
  cleanup() {
    if (this.game.dangerousCardMgr) {
      this.game.dangerousCardMgr.destroy();
      this.game.dangerousCardMgr = null;
    }
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.Level8 = Level8;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Level8 };
}
