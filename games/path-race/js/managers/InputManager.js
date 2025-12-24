/**
 * InputManager - Handle all user input
 * Manages canvas clicks, keyboard, and button interactions
 */

class InputManager {
    constructor(game) {
        this.logger = window.Logger;
        this.game = game;
        this.eventListeners = new Map();
    }

    /**
     * Setup all event listeners
     */
    setupListeners() {
        this.addListener('#start-game-btn', 'click', () => this.game.startGame());
        this.addListener('#home-btn', 'click', () => this.game.goHome());
        this.addListener('#restart-btn', 'click', () => this.game.restartLevel());
        this.addListener('#undo-btn', 'click', () => this.handleUndo());
        this.addListener('#music-btn', 'click', () => this.game.audioManager.toggleMusic());
        this.addListener('#lang-btn', 'click', () => I18N.cycleLanguage());
        this.addListener('#retry-btn', 'click', () => this.game.retryLevel());
        this.addListener('#next-level-btn', 'click', () => this.game.nextLevel());
        this.addListener('#player-canvas', 'click', (e) => this.handlePlayerClick(e));
        this.addListener(document, 'keydown', (e) => this.handleKeyboard(e));

        this.logger.info('InputManager: Listeners setup complete');
    }

    /**
     * Add event listener and track for cleanup
     */
    addListener(target, event, handler) {
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        if (element) {
            element.addEventListener(event, handler);
            if (!this.eventListeners.has(element)) {
                this.eventListeners.set(element, []);
            }
            this.eventListeners.get(element).push({ event, handler });
        }
    }

    /**
     * Handle player canvas click
     */
    handlePlayerClick(event) {
        if (this.game.state.state !== 'racing') {
            this.logger.warn(`InputManager: Click ignored - state is ${this.game.state.state}`);
            return;
        }

        const rect = this.game.playerCanvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        this.logger.info(`InputManager: Click at (${x.toFixed(0)}, ${y.toFixed(0)})`);

        const dot = this.getClickedDot(x, y);

        if (dot) {
            this.logger.info(`InputManager: Clicked dot at (${dot.gridX}, ${dot.gridY}) type=${dot.type}`);
            const success = this.game.pathManager.addMove(dot);

            if (success) {
                this.game.audioManager.playSound('click_valid');
                this.game.setNeedsRender();

                // Check if complete
                if (this.game.pathManager.isPathComplete()) {
                    this.game.playerFinish();
                }
            } else {
                this.logger.warn('InputManager: Move rejected by PathManager');
                this.game.audioManager.playSound('click_invalid');
                this.game.uiManager.showCanvasError(this.game.playerCanvas);
            }
        } else {
            this.logger.info('InputManager: No dot found at click position');
        }
    }

    /**
     * Get clicked dot from canvas coordinates
     */
    getClickedDot(x, y) {
        const clickRadius = CONFIG.PLAYER.CLICK_RADIUS;

        for (const dot of this.game.state.grid.dots) {
            const pos = this.game.renderManager.getDotScreenPos(dot);
            const dist = MathUtils.distance({ x, y }, pos);

            if (dist <= clickRadius) {
                return dot;
            }
        }

        return null;
    }

    /**
     * Handle undo button
     */
    handleUndo() {
        if (this.game.state.state !== 'racing') return;

        const undone = this.game.pathManager.undo();
        if (undone) {
            this.game.state.incrementUndo();
            this.game.audioManager.playSound('undo');
            this.game.setNeedsRender();
        }
    }

    /**
     * Handle keyboard input
     */
    handleKeyboard(event) {
        switch(event.key) {
            case 'Escape':
                this.game.goHome();
                break;
            case 'r':
            case 'R':
                this.game.restartLevel();
                break;
            case 'u':
            case 'U':
                this.handleUndo();
                break;
        }
    }

    /**
     * Cleanup
     */
    destroy() {
        this.eventListeners.forEach((listeners, element) => {
            listeners.forEach(({ event, handler }) => {
                element.removeEventListener(event, handler);
            });
        });
        this.eventListeners.clear();
        this.logger.info('InputManager: Cleaned up');
    }
}

// Module export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InputManager;
}
