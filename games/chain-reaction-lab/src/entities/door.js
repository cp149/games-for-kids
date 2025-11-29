/**
 * Door Mechanism
 * Locks and unlocks based on signal from connected mechanisms
 */

import { Mechanism } from './mechanism.js';

export class Door extends Mechanism {
  constructor(x, y) {
    super(x, y, 'door');
    this.width = 60;
    this.height = 80;
    this.locked = true;
    this.openProgress = 0;
    this.requiredSignals = 1;
    this.receivedSignals = new Set();
    this.animationFrameId = null; // Store animation frame ID for cleanup
  }

  receiveSignal(from) {
    // Track signal from this mechanism
    if (from.active) {
      this.receivedSignals.add(from);
    } else {
      this.receivedSignals.delete(from);
    }
    this.checkUnlock();
  }

  checkUnlock() {
    // Count active signals
    const activeSignals = Array.from(this.receivedSignals).filter(m => m.active).length;

    if (activeSignals >= this.requiredSignals) {
      this.unlock();
    } else {
      this.lock();
    }
  }

  unlock() {
    if (this.locked) {
      this.locked = false;
      this.active = true;
      this.animateOpen();

      // Trigger win check immediately
      const timerId = setTimeout(() => {
        // Safety check: prevent execution if already destroyed
        if (this.isDestroyed) {
          return;
        }

        // Remove from active timers after execution
        const index = this.activeTimers.indexOf(timerId);
        if (index > -1) {
          this.activeTimers.splice(index, 1);
        }

        if (window.gameInstance) {
          window.gameInstance.checkWinCondition();
        }
      }, 100);

      this.activeTimers.push(timerId);
    }
  }

  lock() {
    if (!this.locked) {
      this.locked = true;
      this.active = false;
      // Don't clear receivedSignals - let receiveSignal() manage the Set
      this.animateClose();
    }
  }

  animateOpen() {
    // Cancel previous animation
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    const startTime = Date.now();
    const duration = 500;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function
      this.openProgress = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      if (progress < 1) {
        this.animationFrameId = requestAnimationFrame(animate);
      } else {
        this.animationFrameId = null; // Animation complete
      }
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  animateClose() {
    // Cancel previous animation
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    const startTime = Date.now();
    const duration = 300;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      this.openProgress = 1 - progress;

      if (progress < 1) {
        this.animationFrameId = requestAnimationFrame(animate);
      } else {
        this.animationFrameId = null; // Animation complete
      }
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  /**
   * Clean up resources
   */
  destroy() {
    // Cancel animation
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Clear received signals
    this.receivedSignals.clear();

    // Call parent destroy
    super.destroy();
  }

  update(deltaTime) {
    // Update handled by animation functions
  }

  render(ctx) {
    const centerX = this.x;
    const centerY = this.y;
    const highQuality = window.gameSettings?.get('highQuality') ?? true;

    ctx.save();

    // Door frame
    ctx.fillStyle = '#2a3a4a';
    ctx.strokeStyle = '#4a5a6a';
    ctx.lineWidth = 3;
    ctx.fillRect(
      centerX - this.width / 2 - 5,
      centerY - this.height / 2 - 5,
      this.width + 10,
      this.height + 10
    );
    ctx.strokeRect(
      centerX - this.width / 2 - 5,
      centerY - this.height / 2 - 5,
      this.width + 10,
      this.height + 10
    );

    // Signal indicator dots above door
    const activeSignals = Array.from(this.receivedSignals).filter(m => m.active).length;
    for (let i = 0; i < this.requiredSignals; i++) {
      const filled = i < activeSignals;
      const dotX = centerX - (this.requiredSignals - 1) * 12 + i * 24;
      const dotY = centerY - this.height/2 - 20;

      ctx.beginPath();
      ctx.arc(dotX, dotY, 8, 0, Math.PI * 2);
      ctx.fillStyle = filled ? '#00ff00' : '#333';
      ctx.fill();
      ctx.strokeStyle = filled ? '#00ff88' : '#666';
      ctx.lineWidth = 3;
      ctx.stroke();

      if (filled && highQuality) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00ff00';
        ctx.fill();
      }
    }

    // Door bars (locked state)
    if (this.openProgress < 1) {
      const barHeight = this.height * (1 - this.openProgress);
      const barCount = 4;
      const barSpacing = this.height / barCount;

      ctx.fillStyle = this.locked ? '#ff0000' : '#00ff00';
      if (highQuality) {
        ctx.shadowBlur = this.locked ? 30 : 20;
        ctx.shadowColor = this.locked ? '#ff0000' : '#00ff00';
      }

      for (let i = 0; i < barCount; i++) {
        const barY = centerY - this.height / 2 + i * barSpacing;
        if (barY < centerY - this.height / 2 + barHeight) {
          ctx.fillRect(
            centerX - this.width / 2,
            barY,
            this.width,
            barSpacing * 0.6
          );
        }
      }
    }

    // Lock icon - bigger
    if (this.locked) {
      if (highQuality) {
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#ff0000';
      }
      ctx.fillStyle = '#ff0000';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔒', centerX, centerY);
    } else if (this.openProgress === 1) {
      if (highQuality) {
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#00ff00';
      }
      ctx.fillStyle = '#00ff00';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✓', centerX, centerY);
    }

    ctx.restore();
  }

  getSize() {
    return Math.max(this.width, this.height);
  }

  setRequiredSignals(count) {
    this.requiredSignals = count;
  }
}

export default Door;
