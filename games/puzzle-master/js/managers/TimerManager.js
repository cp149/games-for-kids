/**
 * TimerManager - Handles game timer with pause/resume support
 */
class TimerManager {
    constructor() {
        this.startTime = 0;
        this.timerInterval = null;
        this.elapsedBeforePause = 0;
        this.wasPaused = false;
    }

    /**
     * Start the timer
     * @param {boolean} resume - If true, resume from paused time
     */
    start(resume = false) {
        this.stop(false);  // Don't save elapsed when starting

        if (resume && this.elapsedBeforePause > 0) {
            // Resume from paused time
            this.startTime = Date.now() - this.elapsedBeforePause;
        } else {
            // Fresh start
            this.startTime = Date.now();
            this.elapsedBeforePause = 0;
        }

        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            const timerEl = document.getElementById('timer');
            if (timerEl) {
                timerEl.textContent = `${minutes}:${seconds}`;
            }
        }, 1000);
    }

    /**
     * Stop the timer
     * @param {boolean} saveElapsed - If true, save elapsed time for resume
     */
    stop(saveElapsed = true) {
        if (this.timerInterval) {
            if (saveElapsed) {
                this.elapsedBeforePause = Date.now() - this.startTime;
            }
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * Reset the timer display
     */
    reset() {
        this.elapsedBeforePause = 0;
        const timerEl = document.getElementById('timer');
        if (timerEl) {
            timerEl.textContent = '00:00';
        }
    }

    /**
     * Get the current time display string
     */
    getCurrentTime() {
        const timerEl = document.getElementById('timer');
        return timerEl ? timerEl.textContent : '00:00';
    }

    /**
     * Check if timer is running
     */
    isRunning() {
        return this.timerInterval !== null;
    }

    /**
     * Cleanup resources
     */
    destroy() {
        this.stop(false);
        this.elapsedBeforePause = 0;
    }
}
