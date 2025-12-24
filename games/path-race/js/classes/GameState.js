/**
 * GameState - Centralized game state management
 * Manages all game state with validation and clear transitions
 */

class GameState {
    constructor() {
        this.logger = window.Logger;

        // Game flow state
        this.state = 'menu'; // menu, loading, countdown, racing, finished
        this.level = 1;
        this.grid = null;

        // Player state
        this.player = {
            startTime: null,
            finishTime: null,
            undoCount: 0
        };

        // AI state
        this.ai = {
            startTime: null,
            finishTime: null
        };
    }

    /**
     * Reset game state for new level
     */
    reset() {
        this.player.startTime = null;
        this.player.finishTime = null;
        this.player.undoCount = 0;
        this.ai.startTime = null;
        this.ai.finishTime = null;
        this.grid = null;

        this.logger.info('GameState: Reset for new level');
    }

    /**
     * Transition to new state with validation
     * @param {string} newState - Target state
     * @returns {boolean} True if transition is valid
     */
    transition(newState) {
        const validTransitions = {
            'menu': ['loading'],
            'loading': ['countdown'],
            'countdown': ['racing'],
            'racing': ['finished'],
            'finished': ['loading', 'menu']
        };

        const allowed = validTransitions[this.state];
        if (allowed && allowed.includes(newState)) {
            this.logger.info(`GameState: ${this.state} → ${newState}`);
            this.state = newState;
            return true;
        }

        this.logger.warn(`GameState: Invalid transition ${this.state} → ${newState}`);
        return false;
    }

    /**
     * Check if currently racing
     * @returns {boolean}
     */
    isRacing() {
        return this.state === 'racing';
    }

    /**
     * Check if player can move
     * @returns {boolean}
     */
    canPlayerMove() {
        return this.state === 'racing' && this.player.finishTime === null;
    }

    /**
     * Check if AI can move
     * @returns {boolean}
     */
    canAIMove() {
        return this.state === 'racing' && this.ai.finishTime === null;
    }

    /**
     * Get player elapsed time in seconds
     * @returns {number|null}
     */
    getPlayerTime() {
        if (!this.player.startTime) return null;
        const endTime = this.player.finishTime || Date.now();
        return Math.floor((endTime - this.player.startTime) / 1000);
    }

    /**
     * Mark player as finished
     */
    finishPlayer() {
        if (this.state === 'racing' && !this.player.finishTime) {
            this.player.finishTime = Date.now();
            this.logger.info(`GameState: Player finished in ${this.getPlayerTime()}s`);
        }
    }

    /**
     * Mark AI as finished
     */
    finishAI() {
        if (this.state === 'racing' && !this.ai.finishTime) {
            this.ai.finishTime = Date.now();
            this.logger.info('GameState: AI finished');
        }
    }

    /**
     * Increment undo count
     */
    incrementUndo() {
        this.player.undoCount++;
    }
}

// Module export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameState;
}
