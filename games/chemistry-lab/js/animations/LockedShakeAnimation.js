/**
 * Locked Shake Animation
 * Rejection animation for irreversible reactions
 */

class LockedShakeAnimation {
  constructor(config) {
    this.config = config;

    this.duration = 300; // milliseconds
    this.maxRotation = 5; // degrees
  }

  /**
   * Animate card shake when swipe is rejected
   */
  animateReject(cardElement, onComplete) {
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / this.duration;

      if (progress >= 1.0) {
        // Reset transform
        cardElement.style.transform = '';
        if (onComplete) {
          onComplete();
        }
        return;
      }

      // Calculate shake rotation (sine wave)
      const frequency = 4; // oscillations
      const rotation = Math.sin(progress * Math.PI * 2 * frequency) *
                       this.maxRotation * (1 - progress);

      cardElement.style.transform = `rotate(${rotation}deg)`;

      requestAnimationFrame(animate);
    };

    animate();
  }

  /**
   * Create visual "locked" pulse effect
   */
  showLockedPulse(cardElement) {
    // Add temporary class for CSS animation
    cardElement.classList.add('locked-pulse');

    setTimeout(() => {
      cardElement.classList.remove('locked-pulse');
    }, 500);
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.LockedShakeAnimation = LockedShakeAnimation;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LockedShakeAnimation };
}
