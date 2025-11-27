import { IClock } from '../../js/interfaces/IClock.js';

/**
 * MockClock - Controllable clock for testing
 * Allows manual time progression and synchronous timer testing
 */
export class MockClock extends IClock {
  constructor() {
    super();
    this.currentTime = 0;
    this.timers = new Map();
    this.nextTimerId = 1;
  }

  /**
   * Get current mock time
   * @returns {number}
   */
  now() {
    return this.currentTime;
  }

  /**
   * Schedule a callback to execute after delay
   * Does not auto-execute - requires tick() to progress time
   * @param {Function} callback
   * @param {number} delay
   * @returns {number}
   */
  setTimeout(callback, delay) {
    const timerId = this.nextTimerId++;
    const executeAt = this.currentTime + delay;

    this.timers.set(timerId, {
      callback,
      executeAt,
      cancelled: false
    });

    return timerId;
  }

  /**
   * Clear a scheduled timeout
   * @param {number} timerId
   */
  clearTimeout(timerId) {
    const timer = this.timers.get(timerId);
    if (timer) {
      timer.cancelled = true;
    }
  }

  /**
   * Advance time and execute all timers that should fire
   * @param {number} milliseconds - Amount of time to advance
   * @returns {number} Number of timers executed
   */
  tick(milliseconds) {
    const targetTime = this.currentTime + milliseconds;
    let executed = 0;

    // Sort timers by execution time
    const sortedTimers = Array.from(this.timers.entries())
      .filter(([_, timer]) => !timer.cancelled)
      .sort((a, b) => a[1].executeAt - b[1].executeAt);

    // Execute timers that should fire
    for (const [timerId, timer] of sortedTimers) {
      if (timer.executeAt <= targetTime) {
        this.currentTime = timer.executeAt;
        try {
          timer.callback();
          executed++;
        } catch (error) {
          console.error('Timer callback error:', error);
        }
        this.timers.delete(timerId);
      }
    }

    // Advance to target time
    this.currentTime = targetTime;

    return executed;
  }

  /**
   * Run all pending timers to completion
   * @param {number} maxIterations - Prevent infinite loops
   * @returns {number} Number of timers executed
   */
  runAll(maxIterations = 1000) {
    let executed = 0;
    let iterations = 0;

    while (this.timers.size > 0 && iterations < maxIterations) {
      const nextTimer = Array.from(this.timers.values())
        .filter(t => !t.cancelled)
        .sort((a, b) => a.executeAt - b.executeAt)[0];

      if (!nextTimer) break;

      const timeToAdvance = nextTimer.executeAt - this.currentTime;
      executed += this.tick(timeToAdvance);
      iterations++;
    }

    return executed;
  }

  /**
   * Reset clock to initial state
   */
  reset() {
    this.currentTime = 0;
    this.timers.clear();
    this.nextTimerId = 1;
  }

  /**
   * Get number of pending timers
   * @returns {number}
   */
  getPendingTimerCount() {
    return Array.from(this.timers.values()).filter(t => !t.cancelled).length;
  }

  /**
   * Get all pending timer execution times
   * @returns {number[]}
   */
  getPendingTimerTimes() {
    return Array.from(this.timers.values())
      .filter(t => !t.cancelled)
      .map(t => t.executeAt)
      .sort((a, b) => a - b);
  }
}
