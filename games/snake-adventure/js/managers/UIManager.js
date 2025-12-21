/**
 * UI Manager - Handles all UI elements and overlays
 */

class UIManager {
    constructor(container) {
        this.container = container;
        this.eventListeners = new Map();

        // UI elements
        this.scoreEl = document.getElementById('score');
        this.lengthEl = document.getElementById('length');
        this.pauseBtn = document.getElementById('pause-btn');

        // State
        this.isPaused = false;
    }

    /**
     * Initialize UI
     */
    init() {
        this.updateScore(0);
        this.updateLength(CONFIG.SNAKE.INITIAL_LENGTH);
    }

    /**
     * Update score display
     */
    updateScore(score) {
        if (this.scoreEl) {
            this.scoreEl.textContent = I18N.t('score', { score });
        }
    }

    /**
     * Update length display
     */
    updateLength(length) {
        if (this.lengthEl) {
            this.lengthEl.textContent = I18N.t('length', { length });
        }
    }

    /**
     * Show toast notification
     */
    showToast(message, duration = 2000) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        this.container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, duration);
    }

    /**
     * Show game over modal
     */
    showGameOver(score, onRestart) {
        const modal = this.createModal(
            I18N.t('game_over'),
            I18N.t('your_score', { score }),
            [
                {
                    text: I18N.t('restart'),
                    onClick: () => {
                        modal.remove();
                        onRestart();
                    }
                }
            ]
        );
    }

    /**
     * Show start screen
     */
    showStartScreen(onStart) {
        const isMobile = 'ontouchstart' in window;
        const modal = this.createModal(
            I18N.t('game_title'),
            isMobile ? I18N.t('tap_to_start') : I18N.t('press_space'),
            [
                {
                    text: '▶ ' + I18N.t('resume'),
                    onClick: () => {
                        modal.remove();
                        onStart();
                    }
                }
            ]
        );
    }

    /**
     * Create modal overlay
     */
    createModal(title, text, buttons = []) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';

        const content = document.createElement('div');
        content.className = 'modal-content';

        const titleEl = document.createElement('div');
        titleEl.className = 'modal-title';
        titleEl.textContent = title;
        content.appendChild(titleEl);

        if (text) {
            const textEl = document.createElement('div');
            textEl.className = 'modal-text';
            textEl.textContent = text;
            content.appendChild(textEl);
        }

        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.className = 'modal-btn';
            button.textContent = btn.text;
            button.addEventListener('click', btn.onClick);
            content.appendChild(button);
        });

        overlay.appendChild(content);
        this.container.appendChild(overlay);

        return overlay;
    }

    /**
     * Update pause button
     */
    updatePauseButton(isPaused) {
        this.isPaused = isPaused;
        if (this.pauseBtn) {
            this.pauseBtn.textContent = isPaused ? '▶' : '⏸';
        }
    }

    /**
     * Add event listener (tracked for cleanup)
     */
    addEventListener(element, event, handler) {
        const boundHandler = handler.bind(this);
        element.addEventListener(event, boundHandler);
        this.eventListeners.set(`${element.id || 'element'}:${event}`, {
            element,
            event,
            handler: boundHandler
        });
    }

    /**
     * Cleanup
     */
    destroy() {
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners.clear();

        // Remove all modals and toasts
        this.container.querySelectorAll('.modal-overlay, .toast').forEach(el => el.remove());
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}
