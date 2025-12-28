/**
 * CatalystManager - Manages Magic Spoon catalyst system
 * Handles drag-stir-flyback workflow
 */

class CatalystManager {
  constructor(config, game) {
    this.config = config;
    this.game = game;
    this.spoon = null;
    this.stirringDetector = null;
    this.isActive = false;
    this.isDraggingSpoon = false;
    this.currentSlotIndex = null;

    // Spoon rack position (bottom-left corner)
    this.rackPosition = {
      x: 80,
      y: config.CANVAS.HEIGHT - 80
    };

    // Create spoon at rack
    this.spoon = new MagicSpoon(
      this.rackPosition.x,
      this.rackPosition.y,
      this.rackPosition
    );

    // Create stirring detector
    this.stirringDetector = new StirringDetector(0, 0, 3);

    // Bind event handlers
    this.boundHandlers = new Map();
  }

  /**
   * Initialize catalyst system (called when level has catalyst)
   */
  initialize() {
    this.isActive = true;
    this.attachEventListeners();
  }

  /**
   * Attach input event listeners
   */
  attachEventListeners() {
    const canvas = this.game.canvas;

    const onPointerDown = (e) => this.handlePointerDown(e);
    const onPointerMove = (e) => this.handlePointerMove(e);
    const onPointerUp = (e) => this.handlePointerUp(e);

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);

    this.boundHandlers.set('pointerdown', { element: canvas, event: 'pointerdown', handler: onPointerDown });
    this.boundHandlers.set('pointermove', { element: canvas, event: 'pointermove', handler: onPointerMove });
    this.boundHandlers.set('pointerup', { element: canvas, event: 'pointerup', handler: onPointerUp });
  }

  /**
   * Handle pointer down event
   * @param {PointerEvent} e - Pointer event
   */
  handlePointerDown(e) {
    if (!this.isActive) return;

    const rect = this.game.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on spoon
    if (this.spoon.containsPoint(x, y) && !this.spoon.isFlying) {
      this.isDraggingSpoon = true;
      this.game.audioMgr.playCardDrop(); // Reuse card drop sound (clink)
      e.preventDefault();
    }
  }

  /**
   * Handle pointer move event
   * @param {PointerEvent} e - Pointer event
   */
  handlePointerMove(e) {
    if (!this.isActive || !this.isDraggingSpoon) return;

    const rect = this.game.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update spoon position
    this.spoon.x = x;
    this.spoon.y = y;

    // Check if over a filled slot
    const slotIndex = this.getSlotIndexAtPosition(x, y);

    if (slotIndex !== null && this.game.slotMgr.isSlotFilled(slotIndex)) {
      // Start stirring if not already started
      if (!this.stirringDetector.isStirring) {
        this.currentSlotIndex = slotIndex;
        const slotPos = this.getSlotCenterPosition(slotIndex);
        this.stirringDetector.startStirring(slotPos.x, slotPos.y);
      }

      // Track stirring motion
      if (this.currentSlotIndex === slotIndex) {
        const result = this.stirringDetector.onPointerMove(x, y);

        // Check if stirring complete
        if (result.complete) {
          this.completeStirring(slotIndex);
        }
      }
    } else {
      // Left the slot, reset stirring
      if (this.stirringDetector.isStirring) {
        this.stirringDetector.stopStirring();
        this.currentSlotIndex = null;
      }
    }

    e.preventDefault();
  }

  /**
   * Handle pointer up event
   * @param {PointerEvent} e - Pointer event
   */
  handlePointerUp(e) {
    if (!this.isActive) return;

    if (this.isDraggingSpoon) {
      this.isDraggingSpoon = false;

      // If not over valid slot or stirring incomplete, fly back
      if (!this.stirringDetector.isStirring || this.currentSlotIndex === null) {
        this.flySpoonBackToRack();
      }

      e.preventDefault();
    }
  }

  /**
   * Complete stirring and trigger catalyst effect
   * @param {number} slotIndex - Slot index
   */
  completeStirring(slotIndex) {
    console.log('Stirring complete! Catalyst activated on slot:', slotIndex);

    // Activate catalyst effect on the slot's card
    this.game.specialCardMgr.activateCatalyst(null); // Use existing catalyst system

    // Play success sound
    this.game.audioMgr.playCatalystSound();

    // Visual feedback
    if (this.game.particleSystem) {
      const slotPos = this.getSlotCenterPosition(slotIndex);
      this.game.particleSystem.createBurst(slotPos.x, slotPos.y, '#FFD700', 20);
    }

    // Fly spoon back
    this.flySpoonBackToRack();

    // Stop dragging
    this.isDraggingSpoon = false;
    this.stirringDetector.stopStirring();
    this.currentSlotIndex = null;
  }

  /**
   * Fly spoon back to rack
   */
  flySpoonBackToRack() {
    const startPos = { x: this.spoon.x, y: this.spoon.y };
    this.spoon.flyBackToRack(startPos, this.rackPosition);

    // Play whoosh sound (reuse existing sound)
    // Could be added to AudioManager if specific sound needed
  }

  /**
   * Get slot index at position
   * @param {number} x - X position
   * @param {number} y - Y position
   * @returns {number|null} - Slot index or null
   */
  getSlotIndexAtPosition(x, y) {
    const slots = document.querySelectorAll('.experiment-slot');

    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const rect = slot.getBoundingClientRect();
      const canvasRect = this.game.canvas.getBoundingClientRect();

      const slotX = rect.left - canvasRect.left;
      const slotY = rect.top - canvasRect.top;
      const slotW = rect.width;
      const slotH = rect.height;

      if (x >= slotX && x <= slotX + slotW &&
          y >= slotY && y <= slotY + slotH) {
        return i;
      }
    }

    return null;
  }

  /**
   * Get center position of slot
   * @param {number} slotIndex - Slot index
   * @returns {Object} - Position {x, y}
   */
  getSlotCenterPosition(slotIndex) {
    const slot = document.querySelector(`.experiment-slot[data-slot="${slotIndex}"]`);
    if (!slot) return { x: 0, y: 0 };

    const rect = slot.getBoundingClientRect();
    const canvasRect = this.game.canvas.getBoundingClientRect();

    return {
      x: (rect.left - canvasRect.left) + rect.width / 2,
      y: (rect.top - canvasRect.top) + rect.height / 2
    };
  }

  /**
   * Update catalyst system
   * @param {number} deltaTime - Delta time in milliseconds
   */
  update(deltaTime) {
    if (!this.isActive) return;

    const dt = deltaTime / 1000; // Convert to seconds
    const now = performance.now();

    // Update spoon flying animation
    if (this.spoon.isFlying) {
      this.spoon.update(now);
    }

    // Update stirring particles
    if (this.stirringDetector.isStirring) {
      this.stirringDetector.updateParticles(dt);
    }
  }

  /**
   * Render catalyst system
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    if (!this.isActive) return;

    // Render stirring particles
    if (this.stirringDetector.isStirring) {
      this.stirringDetector.renderParticles(ctx);

      // Render progress indicator
      this.renderStirringProgress(ctx);
    }

    // Render spoon
    this.spoon.render(ctx);

    // Render glow effect when spoon is available
    if (!this.isDraggingSpoon && !this.spoon.isFlying) {
      this.renderSpoonGlow(ctx);
    }
  }

  /**
   * Render stirring progress indicator
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderStirringProgress(ctx) {
    if (this.currentSlotIndex === null) return;

    const slotPos = this.getSlotCenterPosition(this.currentSlotIndex);
    const rotations = this.stirringDetector.angleAccumulated / (2 * Math.PI);
    const progress = Math.min(rotations / this.stirringDetector.requiredRotations, 1.0);

    ctx.save();

    // Draw progress circle
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(slotPos.x, slotPos.y, 40, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
    ctx.stroke();

    // Draw rotation count
    ctx.fillStyle = '#FFD700';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.floor(rotations)}/3`, slotPos.x, slotPos.y - 60);

    ctx.restore();
  }

  /**
   * Render spoon glow effect
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderSpoonGlow(ctx) {
    const time = performance.now() / 1000;
    const pulse = Math.sin(time * 2) * 0.3 + 0.7; // 0.4 to 1.0

    ctx.save();
    ctx.globalAlpha = pulse * 0.5;
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(this.spoon.x, this.spoon.y, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * Deactivate catalyst system
   */
  deactivate() {
    this.isActive = false;
    this.isDraggingSpoon = false;
    this.stirringDetector.stopStirring();
    this.currentSlotIndex = null;
  }

  /**
   * Clean up resources
   */
  destroy() {
    // Remove event listeners
    this.boundHandlers.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.boundHandlers.clear();

    // Destroy components
    if (this.spoon) this.spoon.destroy();
    if (this.stirringDetector) this.stirringDetector.destroy();

    this.spoon = null;
    this.stirringDetector = null;
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.CatalystManager = CatalystManager;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CatalystManager };
}
