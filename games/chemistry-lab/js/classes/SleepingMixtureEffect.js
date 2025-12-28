/**
 * SleepingMixtureEffect - Manages sleeping/waking states for reagents without catalyst
 */

class SleepingMixtureEffect {
  constructor(game) {
    this.game = game;
    this.slotStates = new Map(); // slotIndex -> { state, animation }
    this.STATES = {
      AWAKE: 'awake',
      SLEEPING: 'sleeping',
      WAKING: 'waking'
    };
  }

  /**
   * Initialize a slot's sleeping state
   * @param {number} slotIndex - Slot index
   */
  initializeSlot(slotIndex) {
    if (!this.slotStates.has(slotIndex)) {
      this.slotStates.set(slotIndex, {
        state: this.STATES.AWAKE,
        sleepAnimation: null,
        wakeAnimation: null,
        cardOpacity: 1.0
      });
    }
  }

  /**
   * Check if slot should sleep (has reagents but no catalyst)
   * @param {number} slotIndex - Slot index
   * @returns {boolean}
   */
  shouldSlotSleep(slotIndex) {
    const slot = this.game.slotMgr.slots[slotIndex];
    if (!slot || slot.cards.length === 0) return false;

    // Check if level requires catalyst for this mixture
    const currentLevel = this.game.levelMgr?.currentLevel;
    if (!currentLevel || !currentLevel.requiresCatalyst) return false;

    // Check if slot has catalyst applied
    const hasCatalyst = slot.cards.some(card => card.isCatalyzed);
    return !hasCatalyst;
  }

  /**
   * Put slot to sleep
   * @param {number} slotIndex - Slot index
   */
  putToSleep(slotIndex) {
    this.initializeSlot(slotIndex);
    const slotState = this.slotStates.get(slotIndex);

    if (slotState.state === this.STATES.SLEEPING) return;

    // Update state
    slotState.state = this.STATES.SLEEPING;
    slotState.cardOpacity = 0.6;

    // Create sleep animation
    const slotPos = this.getSlotCenterPosition(slotIndex);
    slotState.sleepAnimation = new SleepAnimation(slotPos.x, slotPos.y);

    // Play gentle snore sound
    if (this.game.audioMgr) {
      this.game.audioMgr.playSoundEffect('gentleSnore', 0.3);
    }

    // Add visual hint to Magic Spoon
    this.pulseMagicSpoon();
  }

  /**
   * Wake up slot
   * @param {number} slotIndex - Slot index
   */
  wakeUp(slotIndex) {
    this.initializeSlot(slotIndex);
    const slotState = this.slotStates.get(slotIndex);

    if (slotState.state === this.STATES.AWAKE) return;

    // Update state
    slotState.state = this.STATES.WAKING;

    // Stop sleep animation
    if (slotState.sleepAnimation) {
      slotState.sleepAnimation.stop();
      slotState.sleepAnimation = null;
    }

    // Create wake animation
    const slotPos = this.getSlotCenterPosition(slotIndex);
    slotState.wakeAnimation = new WakeUpAnimation(slotPos.x, slotPos.y);

    // Play alarm sound
    if (this.game.audioMgr) {
      this.game.audioMgr.playSoundEffect('alarmDing', 0.6);
    }

    // Create sparkle particles
    if (this.game.particleSystem) {
      this.game.particleSystem.createBurst(slotPos.x, slotPos.y, '#FFD700', 15);
    }

    // Transition to awake after animation completes
    setTimeout(() => {
      slotState.state = this.STATES.AWAKE;
      slotState.cardOpacity = 1.0;
      slotState.wakeAnimation = null;
    }, 500);
  }

  /**
   * Update all slot states
   * @param {number} deltaTime - Delta time in seconds
   */
  update(deltaTime) {
    this.slotStates.forEach((slotState, slotIndex) => {
      // Update sleep animation
      if (slotState.sleepAnimation) {
        slotState.sleepAnimation.update(deltaTime);
      }

      // Check if slot should transition states
      const shouldSleep = this.shouldSlotSleep(slotIndex);

      if (shouldSleep && slotState.state === this.STATES.AWAKE) {
        this.putToSleep(slotIndex);
      } else if (!shouldSleep && slotState.state === this.STATES.SLEEPING) {
        // Slot was woken up externally (catalyst applied)
        this.wakeUp(slotIndex);
      }
    });
  }

  /**
   * Render sleeping effects
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    this.slotStates.forEach((slotState, slotIndex) => {
      // Render sleep animation
      if (slotState.sleepAnimation) {
        slotState.sleepAnimation.render(ctx);
      }

      // Render wake animation
      if (slotState.wakeAnimation) {
        slotState.wakeAnimation.render(ctx);
      }

      // Darken cards if sleeping
      if (slotState.state === this.STATES.SLEEPING) {
        this.renderSleepingCardOverlay(ctx, slotIndex, slotState.cardOpacity);
      }

      // Apply bounce scale if waking
      if (slotState.wakeAnimation) {
        this.applyWakeScale(ctx, slotIndex, slotState.wakeAnimation);
      }
    });
  }

  /**
   * Render sleeping card overlay (darken effect)
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} slotIndex - Slot index
   * @param {number} opacity - Target opacity
   */
  renderSleepingCardOverlay(ctx, slotIndex, opacity) {
    const slotElement = document.querySelector(`.experiment-slot[data-slot="${slotIndex}"]`);
    if (!slotElement) return;

    const rect = slotElement.getBoundingClientRect();
    const canvasRect = this.game.canvas.getBoundingClientRect();

    const x = rect.left - canvasRect.left;
    const y = rect.top - canvasRect.top;

    ctx.save();
    ctx.globalAlpha = 1 - opacity;
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y, rect.width, rect.height);
    ctx.restore();
  }

  /**
   * Apply wake-up bounce scale (visual feedback only)
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} slotIndex - Slot index
   * @param {WakeUpAnimation} wakeAnimation - Wake animation instance
   */
  applyWakeScale(ctx, slotIndex, wakeAnimation) {
    // This is handled by CSS transform in updateSlotVisuals
    // Canvas rendering is for alarm icon only
  }

  /**
   * Pulse Magic Spoon to indicate it's needed
   */
  pulseMagicSpoon() {
    if (!this.game.catalystMgr || !this.game.catalystMgr.spoon) return;

    // Add pulsing class to spoon rack area (if implemented)
    // This is a visual hint that the spoon can be used
  }

  /**
   * Update slot element visuals based on state
   * @param {number} slotIndex - Slot index
   */
  updateSlotVisuals(slotIndex) {
    const slotElement = document.querySelector(`.experiment-slot[data-slot="${slotIndex}"]`);
    if (!slotElement) return;

    const slotState = this.slotStates.get(slotIndex);
    if (!slotState) return;

    // Apply sleeping state
    if (slotState.state === this.STATES.SLEEPING) {
      slotElement.classList.add('sleeping');
    } else {
      slotElement.classList.remove('sleeping');
    }

    // Apply wake scale
    if (slotState.wakeAnimation) {
      const scale = slotState.wakeAnimation.getCurrentScale();
      slotElement.style.transform = `scale(${scale})`;
    } else {
      slotElement.style.transform = '';
    }
  }

  /**
   * Get slot center position
   * @param {number} slotIndex - Slot index
   * @returns {Object} - Position {x, y}
   */
  getSlotCenterPosition(slotIndex) {
    const slotElement = document.querySelector(`.experiment-slot[data-slot="${slotIndex}"]`);
    if (!slotElement) return { x: 0, y: 0 };

    const rect = slotElement.getBoundingClientRect();
    const canvasRect = this.game.canvas.getBoundingClientRect();

    return {
      x: (rect.left - canvasRect.left) + rect.width / 2,
      y: (rect.top - canvasRect.top) + rect.height / 2
    };
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.slotStates.forEach(slotState => {
      if (slotState.sleepAnimation) slotState.sleepAnimation.destroy();
      if (slotState.wakeAnimation) slotState.wakeAnimation.destroy();
    });
    this.slotStates.clear();
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.SleepingMixtureEffect = SleepingMixtureEffect;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SleepingMixtureEffect };
}
