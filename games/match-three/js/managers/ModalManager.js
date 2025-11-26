/**
 * ModalManager - Handles modal dialogs
 * Manages victory and settings modals
 */

class ModalManager {
    constructor(container) {
        this.container = container;
        this.elements = {};
    }

    /**
     * Create all modal elements
     */
    createModals() {
        this.createVictoryModal();
        this.createSettingsModal();
    }

    /**
     * Create victory modal
     */
    createVictoryModal() {
        const modal = document.createElement('div');
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
        const modal = document.createElement('div');
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
