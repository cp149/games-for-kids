/**
 * Recipe Memory System
 * Shows ghost trails of parent reagents when long-pressing complex products
 */

class RecipeMemorySystem {
  constructor(config, reactions) {
    this.config = config;
    this.reactions = reactions;

    // State
    this.activeGhost = null; // { card, parents, alpha }
    this.targetAlpha = 0;
    this.currentAlpha = 0;
    this.fadeStartTime = 0;
    this.fadeDuration = 300; // milliseconds

    // Touch/mouse tracking for long press
    this.pressStartTime = 0;
    this.pressedCard = null;
    this.longPressDuration = 500; // milliseconds
    this.isPressing = false;

    // Arrow renderer for visual hints
    this.arrowRenderer = new ArrowRenderer();

    // Build parent element mapping from reactions
    this.parentMap = this.buildParentMap();
  }

  /**
   * Build parent element mapping from reaction rules
   * @returns {Map} Map of product -> parent reagents
   */
  buildParentMap() {
    const map = new Map();

    // Iterate through all reactions
    Object.entries(this.reactions).forEach(([key, reaction]) => {
      // Only process synthesis reactions (they create new products)
      if (reaction.type === 'synthesis' && reaction.output) {
        const ingredients = key.split('+');

        // Store parent ingredients for this product
        if (!map.has(reaction.output)) {
          map.set(reaction.output, []);
        }

        // Add this recipe's ingredients
        map.get(reaction.output).push({
          ingredients: ingredients,
          emoji: reaction.emoji,
          reactionKey: key
        });
      }
    });

    return map;
  }

  /**
   * Get parent reagents for a card type
   * @param {string} cardType - Card type (e.g., 'STEAM', 'CLOUD')
   * @returns {Array|null} Array of parent ingredient types or null
   */
  getParents(cardType) {
    const recipes = this.parentMap.get(cardType);

    if (!recipes || recipes.length === 0) {
      return null;
    }

    // Return the first recipe's ingredients
    // (Could be enhanced to show multiple recipes)
    return recipes[0].ingredients;
  }

  /**
   * Handle pointer down event (start of potential long press)
   * @param {Object} card - Card being pressed
   * @param {number} x - Pointer x position
   * @param {number} y - Pointer y position
   */
  onPointerDown(card, x, y) {
    // Check if card has parents (is a synthesized product)
    const parents = this.getParents(card.type);

    if (!parents) {
      return; // Card has no recipe history
    }

    this.pressedCard = card;
    this.pressStartTime = Date.now();
    this.isPressing = true;
  }

  /**
   * Handle pointer up event (cancel long press)
   */
  onPointerUp() {
    this.isPressing = false;

    // If ghost is active, fade it out
    if (this.activeGhost) {
      this.fadeOut();
    }
  }

  /**
   * Update system state
   * @param {number} deltaTime - Time since last update (seconds)
   */
  update(deltaTime) {
    // Update arrow animation
    this.arrowRenderer.update(deltaTime);

    // Check for long press activation
    if (this.isPressing && this.pressedCard && !this.activeGhost) {
      const elapsed = Date.now() - this.pressStartTime;

      if (elapsed >= this.longPressDuration) {
        // Long press threshold reached - show ghost
        this.showGhost(this.pressedCard);
      }
    }

    // Update fade animation
    this.updateFade();
  }

  /**
   * Show ghost trail for a card
   * @param {Object} card - Card to show parents for
   */
  showGhost(card) {
    const parents = this.getParents(card.type);

    if (!parents) return;

    // Create ghost data
    this.activeGhost = {
      card: card,
      parentTypes: parents,
      positions: [] // Will be calculated during render
    };

    // Start fade in
    this.fadeIn();
  }

  /**
   * Start fade in animation
   */
  fadeIn() {
    this.targetAlpha = 0.4;
    this.fadeStartTime = Date.now();
  }

  /**
   * Start fade out animation
   */
  fadeOut() {
    this.targetAlpha = 0;
    this.fadeStartTime = Date.now();
  }

  /**
   * Update fade animation
   */
  updateFade() {
    if (this.currentAlpha === this.targetAlpha) {
      // Animation complete
      if (this.targetAlpha === 0 && this.activeGhost) {
        // Fade out complete - remove ghost
        this.activeGhost = null;
      }
      return;
    }

    const elapsed = Date.now() - this.fadeStartTime;
    const t = Math.min(elapsed / this.fadeDuration, 1);

    // Ease-out cubic easing
    const eased = 1 - Math.pow(1 - t, 3);

    // Interpolate alpha
    const startAlpha = this.targetAlpha === 0.4 ? 0 : 0.4;
    this.currentAlpha = startAlpha + (this.targetAlpha - startAlpha) * eased;
  }

  /**
   * Render ghost trails and arrows
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    if (!this.activeGhost || this.currentAlpha <= 0) {
      return;
    }

    const card = this.activeGhost.card;
    const parentTypes = this.activeGhost.parentTypes;

    // Get card position (works for both DOM-based and canvas-based cards)
    let cardX, cardY, cardWidth, cardHeight;

    if (card.element && card.isInSlot) {
      // Card is in DOM slot - get position from element
      const rect = card.element.getBoundingClientRect();
      const canvasRect = ctx.canvas.getBoundingClientRect();
      cardX = rect.left - canvasRect.left + rect.width / 2;
      cardY = rect.top - canvasRect.top + rect.height / 2;
      cardWidth = rect.width;
      cardHeight = rect.height;
    } else {
      // Falling card - use card's x/y position
      cardX = card.x + (this.config.CARDS.CARD_WIDTH / 2);
      cardY = card.y + (this.config.CARDS.CARD_HEIGHT / 2);
      cardWidth = this.config.CARDS.CARD_WIDTH;
      cardHeight = this.config.CARDS.CARD_HEIGHT;
    }

    ctx.save();

    // Set transparency
    ctx.globalAlpha = this.currentAlpha;

    // Calculate ghost positions (above the card)
    const ghostSpacing = 80;
    const positions = [];

    parentTypes.forEach((parentType, index) => {
      const ghostX = cardX;
      const ghostY = cardY - ghostSpacing * (index + 1);

      positions.push({ x: ghostX, y: ghostY, type: parentType });

      // Get parent emoji
      const reagentData = window.REAGENT_TYPES[parentType];
      if (reagentData) {
        // Draw parent emoji
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(reagentData.emoji, ghostX, ghostY);
      }
    });

    ctx.restore();

    // Draw flowing arrows from ghosts to card
    ctx.save();
    ctx.globalAlpha = this.currentAlpha;

    positions.forEach(pos => {
      this.arrowRenderer.drawFlowingArrow(
        ctx,
        { x: pos.x, y: pos.y + 30 }, // From ghost (below emoji)
        { x: cardX, y: cardY - (cardHeight / 2) - 10 }, // To card (above card)
        `rgba(255, 255, 255, ${this.currentAlpha * 1.2})`
      );
    });

    ctx.restore();
  }

  /**
   * Check if system is currently showing a ghost
   * @returns {boolean}
   */
  isActive() {
    return this.activeGhost !== null;
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.activeGhost = null;
    if (this.arrowRenderer) {
      this.arrowRenderer.destroy();
    }
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.RecipeMemorySystem = RecipeMemorySystem;
}
