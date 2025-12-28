/**
 * Reagent Card - Draggable card representing a chemical reagent
 */

class ReagentCard {
  constructor(type, x, y, config) {
    this.id = `reagent_${Date.now()}_${Math.random()}`;
    this.type = type; // 'RED', 'BLUE', 'YELLOW', 'GREEN'
    this.x = x;
    this.y = y;
    this.config = config;

    // Reagent properties
    const reagentData = REAGENT_TYPES[type];
    this.emoji = reagentData.emoji;
    this.colorClass = reagentData.class;

    // State
    this.isDragging = false;
    this.isInSlot = false;
    this.slotIndex = -1;
    this.isExpiring = false;
    this.isStabilized = false;
    this.expirationTimer = null;

    // Create DOM element
    this.element = null;
    this.createDOM();
  }

  /**
   * Create DOM element
   */
  createDOM() {
    this.element = document.createElement('div');
    this.element.className = `reagent-card ${this.colorClass}`;
    this.element.textContent = this.emoji;
    this.element.draggable = true;
    this.element.dataset.cardId = this.id;
    this.element.dataset.cardType = this.type;

    // Set initial position
    this.updatePosition();

    // Add to drop zone
    const dropZone = document.getElementById('drop-zone');
    if (dropZone) {
      dropZone.appendChild(this.element);
    }
  }

  /**
   * Update DOM position
   */
  updatePosition() {
    if (this.element) {
      this.element.style.left = `${this.x}px`;
      this.element.style.top = `${this.y}px`;
    }
  }

  /**
   * Update card (falling animation)
   */
  update(deltaTime) {
    // DEBUG: Log update information
    console.log(`[Card ${this.id}] deltaTime: ${deltaTime}, y: ${this.y}, isInSlot: ${this.isInSlot}, isDragging: ${this.isDragging}`);

    if (!this.isInSlot && !this.isDragging) {
      // Fall down
      this.y += (this.config.CARDS.DROP_SPEED * deltaTime) / 1000;
      this.updatePosition();

      // DEBUG: Log new position
      console.log(`[Card ${this.id}] New y: ${this.y}, DROP_SPEED: ${this.config.CARDS.DROP_SPEED}`);

      // Check if out of bounds
      if (this.y > this.config.CARDS.DROP_ZONE_HEIGHT) {
        console.log(`[Card ${this.id}] Out of bounds, removing`);
        return true; // mark for removal
      }
    }

    return false; // keep card
  }

  /**
   * Start expiration timer
   */
  startExpiration(seconds, onExpire) {
    if (this.isStabilized) return; // stabilized cards don't expire

    this.isExpiring = true;
    this.expirationTime = seconds;
    this.expirationStartTime = Date.now();

    this.expirationTimer = setTimeout(() => {
      if (onExpire) onExpire(this);
    }, seconds * 1000);

    // Add visual warning
    if (this.element) {
      this.element.classList.add('expiring');

      // Create countdown display
      this.countdownElement = document.createElement('div');
      this.countdownElement.className = 'expiration-countdown';
      this.countdownElement.textContent = Math.ceil(seconds);
      this.element.appendChild(this.countdownElement);

      // Update countdown every second
      this.countdownInterval = setInterval(() => {
        this.updateCountdown();
      }, 100);
    }
  }

  /**
   * Update expiration countdown display
   */
  updateCountdown() {
    if (!this.isExpiring || this.isStabilized || !this.countdownElement) {
      return;
    }

    const elapsed = (Date.now() - this.expirationStartTime) / 1000;
    const remaining = Math.max(0, this.expirationTime - elapsed);

    this.countdownElement.textContent = Math.ceil(remaining);

    // Change color as time runs out
    if (remaining < 3) {
      this.countdownElement.style.color = '#ff4444';
    } else if (remaining < 5) {
      this.countdownElement.style.color = '#ffaa00';
    }
  }

  /**
   * Stabilize card (prevent expiration)
   */
  stabilize() {
    this.isStabilized = true;
    this.isExpiring = false;

    if (this.expirationTimer) {
      clearTimeout(this.expirationTimer);
      this.expirationTimer = null;
    }

    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }

    // Remove countdown display
    if (this.countdownElement) {
      this.countdownElement.remove();
      this.countdownElement = null;
    }

    // Add visual effect
    if (this.element) {
      this.element.classList.remove('expiring');
      this.element.classList.add('stabilized');

      // Add shield icon
      const shieldIcon = document.createElement('div');
      shieldIcon.className = 'stabilizer-icon';
      shieldIcon.textContent = '🛡️';
      this.element.appendChild(shieldIcon);
    }
  }

  /**
   * Set dragging state
   */
  setDragging(dragging) {
    this.isDragging = dragging;
    if (this.element) {
      if (dragging) {
        this.element.classList.add('dragging');
      } else {
        this.element.classList.remove('dragging');
      }
    }
  }

  /**
   * Move to slot
   */
  moveToSlot(slotIndex, slotElement) {
    this.isInSlot = true;
    this.slotIndex = slotIndex;

    if (this.element && slotElement) {
      // Move element to slot
      slotElement.appendChild(this.element);
      this.element.style.position = 'relative';
      this.element.style.left = '0';
      this.element.style.top = '0';
      this.element.draggable = false;
    }
  }

  /**
   * Remove from slot
   */
  removeFromSlot() {
    this.isInSlot = false;
    this.slotIndex = -1;

    if (this.element) {
      this.element.draggable = true;
    }
  }

  /**
   * Clean up
   */
  destroy() {
    if (this.expirationTimer) {
      clearTimeout(this.expirationTimer);
      this.expirationTimer = null;
    }

    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }

    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }

    this.element = null;
    this.countdownElement = null;
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.ReagentCard = ReagentCard;
}
