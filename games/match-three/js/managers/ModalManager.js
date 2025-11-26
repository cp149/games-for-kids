/**
 * ModalManager - Handles modal dialogs
 * Manages victory, settings, and confirm modals
 *
 * Supports dependency injection for testability:
 * - doc: Document object (default: window.document)
 * - config: Configuration object (default: CONFIG)
 */

class ModalManager {
    /**
     * @param {HTMLElement} container - Container element
     * @param {Object} [options] - Optional dependencies
     * @param {Document} [options.doc] - Document object
     * @param {Object} [options.config] - Configuration object
     */
    constructor(container, options = {}) {
        this.container = container;
        this._doc = options.doc || (typeof document !== 'undefined' ? document : null);
        this._config = options.config || CONFIG;
        this.elements = {};
        this._confirmCallback = null;
    }

    /**
     * Create all modal elements
     */
    createModals() {
        this.createVictoryModal();
        this.createSettingsModal();
        this.createConfirmModal();
    }

    /**
     * Create victory modal
     */
    createVictoryModal() {
        const modal = this._doc.createElement('div');
        modal.className = 'modal';
        modal.id = 'victory-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Level Complete!</h2>
                <div id="final-score" class="final-score">Score: 0</div>
                <div id="star-rating" class="star-rating"></div>
                <button id="next-level-btn" class="game-btn primary">Next Level</button>
            </div>
        `;

        this.container.appendChild(modal);
        this.elements.victoryModal = modal;
    }

    /**
     * Create settings modal
     */
    createSettingsModal() {
        const modal = this._doc.createElement('div');
        modal.className = 'modal';
        modal.id = 'settings-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Settings</h2>
                <div class="setting-item">
                    <label>
                        <input type="checkbox" id="sound-effects" checked>
                        Sound Effects
                    </label>
                </div>
                <div class="setting-item">
                    <label>
                        Difficulty:
                        <select id="difficulty-select">
                            <option value="EASY">Easy (500)</option>
                            <option value="MEDIUM">Medium (1000)</option>
                            <option value="HARD">Hard (1500)</option>
                        </select>
                    </label>
                </div>
                <button id="close-settings-btn" class="game-btn">Close</button>
            </div>
        `;

        this.container.appendChild(modal);
        this.elements.settingsModal = modal;
    }

    /**
     * Create confirm modal for custom dialogs
     */
    createConfirmModal() {
        const modal = this._doc.createElement('div');
        modal.className = 'modal';
        modal.id = 'confirm-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'confirm-title');
        modal.innerHTML = `
            <div class="modal-content">
                <h2 id="confirm-title">Confirm</h2>
                <p id="confirm-message"></p>
                <div class="modal-buttons">
                    <button id="confirm-cancel-btn" class="game-btn">Cancel</button>
                    <button id="confirm-ok-btn" class="game-btn primary">OK</button>
                </div>
            </div>
        `;

        // Setup event listeners
        const okBtn = modal.querySelector('#confirm-ok-btn');
        const cancelBtn = modal.querySelector('#confirm-cancel-btn');

        okBtn.addEventListener('click', () => {
            this.hideConfirm();
            if (this._confirmCallback) {
                this._confirmCallback(true);
                this._confirmCallback = null;
            }
        });

        cancelBtn.addEventListener('click', () => {
            this.hideConfirm();
            if (this._confirmCallback) {
                this._confirmCallback(false);
                this._confirmCallback = null;
            }
        });

        this.container.appendChild(modal);
        this.elements.confirmModal = modal;
    }

    /**
     * Show confirm dialog
     * @param {Object} options - Dialog options
     * @param {string} options.title - Dialog title
     * @param {string} options.message - Dialog message
     * @param {string} [options.confirmText] - Confirm button text
     * @param {string} [options.cancelText] - Cancel button text
     * @param {Function} [options.onConfirm] - Callback when confirmed
     * @param {Function} [options.onCancel] - Callback when cancelled
     */
    showConfirm({ title, message, confirmText, cancelText, onConfirm, onCancel }) {
        const modal = this.elements.confirmModal;
        if (!modal) return;

        const texts = this._config.UI.TEXTS;

        // Update content
        const titleEl = modal.querySelector('#confirm-title');
        const messageEl = modal.querySelector('#confirm-message');
        const okBtn = modal.querySelector('#confirm-ok-btn');
        const cancelBtn = modal.querySelector('#confirm-cancel-btn');

        if (titleEl) titleEl.textContent = title || texts.CONFIRM_NEW_GAME_TITLE;
        if (messageEl) messageEl.textContent = message || '';
        if (okBtn) okBtn.textContent = confirmText || texts.CONFIRM_YES;
        if (cancelBtn) cancelBtn.textContent = cancelText || texts.CONFIRM_CANCEL;

        // Store callback
        this._confirmCallback = (confirmed) => {
            if (confirmed && onConfirm) {
                onConfirm();
            } else if (!confirmed && onCancel) {
                onCancel();
            }
        };

        modal.classList.add('show');

        // Focus confirm button for accessibility
        if (okBtn) okBtn.focus();
    }

    /**
     * Hide confirm dialog
     */
    hideConfirm() {
        if (this.elements.confirmModal) {
            this.elements.confirmModal.classList.remove('show');
        }
    }

    /**
     * Show victory modal with score and stars
     * @param {number} score - Final score
     * @param {number} stars - Star rating (1-3)
     * @param {EffectsManager} effectsManager - Effects manager for confetti
     */
    showVictory(score, stars, effectsManager) {
        const modal = this.elements.victoryModal;
        if (!modal) return;

        const finalScore = modal.querySelector('#final-score');
        const starRating = modal.querySelector('#star-rating');

        if (finalScore) {
            finalScore.textContent = `Score: ${score}`;
        }

        if (starRating) {
            starRating.textContent = '⭐'.repeat(stars);
        }

        modal.classList.add('show');

        // Show confetti if effects manager provided
        if (effectsManager) {
            effectsManager.showConfetti();
        }
    }

    /**
     * Hide victory modal
     */
    hideVictory() {
        if (this.elements.victoryModal) {
            this.elements.victoryModal.classList.remove('show');
        }
    }

    /**
     * Show settings modal
     */
    showSettings() {
        if (this.elements.settingsModal) {
            this.elements.settingsModal.classList.add('show');
        }
    }

    /**
     * Hide settings modal
     */
    hideSettings() {
        if (this.elements.settingsModal) {
            this.elements.settingsModal.classList.remove('show');
        }
    }

    /**
     * Get modal element by name
     * @param {string} name - Element name
     * @returns {HTMLElement|null}
     */
    getElement(name) {
        return this.elements[name];
    }

    /**
     * Clean up resources
     */
    destroy() {
        // Remove modals
        Object.values(this.elements).forEach(el => {
            if (el && el.parentNode) {
                el.remove();
            }
        });
        this.elements = {};
    }
}
