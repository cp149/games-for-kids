/**
 * Swipe Gesture Detector
 * Detects horizontal swipe gestures on cards for reversible reaction separation
 */

class SwipeGestureDetector {
  constructor(config) {
    this.config = config;

    // Gesture thresholds
    this.minSwipeVelocity = 200; // pixels per second
    this.minSwipeDistance = 30;  // pixels
    this.maxVerticalDeviation = 50; // pixels

    // Tracking state
    this.isTracking = false;
    this.startX = 0;
    this.startY = 0;
    this.startTime = 0;
    this.currentCard = null;

    // Event listeners tracking
    this.boundHandlers = new Map();
  }

  /**
   * Attach swipe detection to a card element
   */
  attachToCard(cardElement, onSwipe) {
    // Mouse/touch start
    const startHandler = (event) => {
      this.handleStart(event, cardElement);
    };

    // Mouse/touch move
    const moveHandler = (event) => {
      this.handleMove(event);
    };

    // Mouse/touch end
    const endHandler = (event) => {
      this.handleEnd(event, onSwipe);
    };

    // Add event listeners
    cardElement.addEventListener('mousedown', startHandler);
    cardElement.addEventListener('touchstart', startHandler, { passive: false });

    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('touchmove', moveHandler, { passive: false });

    document.addEventListener('mouseup', endHandler);
    document.addEventListener('touchend', endHandler);

    // Store handlers for cleanup
    this.boundHandlers.set(cardElement, {
      start: startHandler,
      move: moveHandler,
      end: endHandler
    });
  }

  /**
   * Detach swipe detection from a card element
   */
  detachFromCard(cardElement) {
    const handlers = this.boundHandlers.get(cardElement);
    if (!handlers) return;

    cardElement.removeEventListener('mousedown', handlers.start);
    cardElement.removeEventListener('touchstart', handlers.start);

    document.removeEventListener('mousemove', handlers.move);
    document.removeEventListener('touchmove', handlers.move);

    document.removeEventListener('mouseup', handlers.end);
    document.removeEventListener('touchend', handlers.end);

    this.boundHandlers.delete(cardElement);
  }

  /**
   * Handle start of gesture
   */
  handleStart(event, cardElement) {
    // Only track if card is in a slot (not falling)
    if (!cardElement.classList.contains('reagent-card')) return;

    const point = this.getEventPoint(event);
    if (!point) return;

    this.isTracking = true;
    this.startX = point.x;
    this.startY = point.y;
    this.startTime = Date.now();
    this.currentCard = cardElement;

    event.preventDefault();
  }

  /**
   * Handle movement during gesture
   */
  handleMove(event) {
    if (!this.isTracking) return;

    const point = this.getEventPoint(event);
    if (!point) return;

    // Show visual feedback for swipe direction
    const deltaX = point.x - this.startX;
    if (Math.abs(deltaX) > 10) {
      this.currentCard.style.transform = `translateX(${deltaX * 0.2}px)`;
    }
  }

  /**
   * Handle end of gesture
   */
  handleEnd(event, onSwipe) {
    if (!this.isTracking) return;

    const point = this.getEventPoint(event);
    if (!point) {
      this.resetTracking();
      return;
    }

    const deltaX = point.x - this.startX;
    const deltaY = point.y - this.startY;
    const deltaTime = (Date.now() - this.startTime) / 1000; // seconds

    // Reset visual feedback
    this.currentCard.style.transform = '';

    // Check if gesture qualifies as swipe
    const distance = Math.abs(deltaX);
    const velocity = distance / deltaTime;
    const isHorizontal = Math.abs(deltaY) < this.maxVerticalDeviation;

    if (distance >= this.minSwipeDistance &&
        velocity >= this.minSwipeVelocity &&
        isHorizontal) {

      // Valid swipe detected
      const direction = deltaX > 0 ? 'right' : 'left';
      onSwipe(this.currentCard, direction, velocity);
    }

    this.resetTracking();
  }

  /**
   * Get point coordinates from mouse or touch event
   */
  getEventPoint(event) {
    if (event.type.startsWith('touch')) {
      if (event.touches.length > 0) {
        return {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY
        };
      } else if (event.changedTouches.length > 0) {
        return {
          x: event.changedTouches[0].clientX,
          y: event.changedTouches[0].clientY
        };
      }
      return null;
    } else {
      return {
        x: event.clientX,
        y: event.clientY
      };
    }
  }

  /**
   * Reset tracking state
   */
  resetTracking() {
    this.isTracking = false;
    this.currentCard = null;
    this.startX = 0;
    this.startY = 0;
    this.startTime = 0;
  }

  /**
   * Destroy detector (cleanup)
   */
  destroy() {
    // Detach all card listeners
    this.boundHandlers.forEach((handlers, cardElement) => {
      this.detachFromCard(cardElement);
    });

    this.boundHandlers.clear();
    this.resetTracking();
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.SwipeGestureDetector = SwipeGestureDetector;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SwipeGestureDetector };
}
