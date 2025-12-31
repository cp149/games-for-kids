/**
 * ModalManager - Dialog and Overlay System
 * Handles sticker book, formula overlay, and level complete dialogs
 *
 * Extracted from UIManager to follow Single Responsibility Principle
 */

export class ModalManager {
    /**
     * @param {Object} options
     * @param {HTMLElement} options.container - Game container element
     * @param {Function} options.setTimeout - Safe setTimeout wrapper
     * @param {Function} options.clearTimeout - Safe clearTimeout wrapper
     * @param {Function} options.t - i18n translation function
     */
    constructor(options = {}) {
        this.container = options.container || null;
        this._setTimeout = options.setTimeout || ((fn, ms) => setTimeout(fn, ms));
        this._clearTimeout = options.clearTimeout || ((id) => clearTimeout(id));
        this.t = options.t || ((key) => key);

        // Modal references
        this.stickerBookModal = null;
        this.stickerGrid = null;
        this.stickerBookKeyHandler = null;

        this.formulaOverlay = null;
        this.formulaKeyHandler = null;
        this.formulaTimeout = null;
        this.onFormulaClose = null;
    }

    /**
     * Update container reference
     * @param {HTMLElement} container
     */
    setContainer(container) {
        this.container = container;
    }

    /**
     * Update translation function
     * @param {Function} t
     */
    setTranslation(t) {
        this.t = t;
    }

    // ===== Sticker Book Modal =====

    /**
     * Create sticker book modal structure
     */
    createStickerBook() {
        if (this.stickerBookModal) return;

        // Create modal container
        this.stickerBookModal = document.createElement('div');
        this.stickerBookModal.className = 'sticker-book-modal';
        this.stickerBookModal.setAttribute('role', 'dialog');
        this.stickerBookModal.setAttribute('aria-label', this.t('sticker_book'));
        this.stickerBookModal.setAttribute('aria-modal', 'true');

        // Create modal content
        const content = document.createElement('div');
        content.className = 'sticker-book-content';

        // Header with close button
        const header = document.createElement('div');
        header.className = 'sticker-book-header';
        header.innerHTML = `
            <h2 class="sticker-book-title">📖 ${this.t('sticker_book')}</h2>
            <button class="sticker-book-close" aria-label="Close">&times;</button>
        `;

        // Stickers grid
        this.stickerGrid = document.createElement('div');
        this.stickerGrid.className = 'sticker-book-grid';

        content.appendChild(header);
        content.appendChild(this.stickerGrid);
        this.stickerBookModal.appendChild(content);

        // Add to container
        this.container.appendChild(this.stickerBookModal);

        // Close button event
        const closeBtn = header.querySelector('.sticker-book-close');
        closeBtn.addEventListener('click', () => this.hideStickerBook());

        // Close on backdrop click
        this.stickerBookModal.addEventListener('click', (e) => {
            if (e.target === this.stickerBookModal) {
                this.hideStickerBook();
            }
        });

        // Close on Escape key
        this.stickerBookKeyHandler = (e) => {
            if (e.key === 'Escape' && this.stickerBookModal.classList.contains('visible')) {
                this.hideStickerBook();
            }
        };
        document.addEventListener('keydown', this.stickerBookKeyHandler);
    }

    /**
     * Show sticker book with earned stickers
     * @param {string[]} earnedStickers - Array of earned sticker IDs
     * @param {Object} stickerConfig - Sticker definitions
     * @param {string[]} newStickers - Newly earned sticker IDs
     */
    showStickerBook(earnedStickers = [], stickerConfig = {}, newStickers = []) {
        this.createStickerBook();

        // Clear and populate grid
        this.stickerGrid.innerHTML = '';

        // Get all sticker definitions
        const allStickers = Object.entries(stickerConfig);
        const totalCount = allStickers.length;
        const earnedCount = earnedStickers.length;

        // Add stats header
        const statsDiv = document.createElement('div');
        statsDiv.className = 'sticker-book-stats';
        statsDiv.innerHTML = `
            <span class="stats-icon">🌟</span>
            <span class="stats-text">
                <span class="stats-earned">${earnedCount}</span>
                <span>/ ${totalCount}</span>
            </span>
            <span class="stats-icon">📖</span>
        `;
        this.stickerGrid.appendChild(statsDiv);

        // Check for empty state
        if (allStickers.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'sticker-book-empty';
            emptyDiv.innerHTML = `
                <div class="empty-icon">📚</div>
                <div class="empty-text">${this.t('no_stickers') || 'No stickers available yet!'}</div>
            `;
            this.stickerGrid.appendChild(emptyDiv);
        } else {
            allStickers.forEach(([stickerId, info]) => {
                const isEarned = earnedStickers.includes(stickerId);
                const isNew = newStickers.includes(stickerId);
                const stickerItem = document.createElement('div');

                let className = 'sticker-item';
                if (isEarned) className += ' earned';
                if (!isEarned) className += ' locked';
                if (isNew) className += ' new-earned';

                stickerItem.className = className;
                stickerItem.setAttribute('role', 'img');
                stickerItem.setAttribute('aria-label',
                    isEarned ? `${info.name} sticker earned` : `${info.name} sticker locked`);

                if (isEarned) {
                    stickerItem.innerHTML = `
                        <span class="sticker-emoji">${info.emoji}</span>
                        <span class="sticker-name">${info.name}</span>
                    `;
                } else {
                    stickerItem.innerHTML = `
                        <span class="sticker-emoji locked">🔒</span>
                        <span class="sticker-name">${this.t('level', { '0': info.level })}</span>
                    `;
                }

                this.stickerGrid.appendChild(stickerItem);
            });
        }

        // Show modal
        this.stickerBookModal.classList.add('visible');
        this.stickerBookModal.querySelector('.sticker-book-close').focus();
    }

    /**
     * Hide sticker book modal
     */
    hideStickerBook() {
        if (this.stickerBookModal) {
            this.stickerBookModal.classList.remove('visible');
        }
    }

    // ===== Formula Overlay =====

    /**
     * Create formula overlay structure
     */
    createFormulaOverlay() {
        if (this.formulaOverlay) return;

        this.formulaOverlay = document.createElement('div');
        this.formulaOverlay.className = 'formula-overlay';
        this.formulaOverlay.setAttribute('role', 'dialog');
        this.formulaOverlay.setAttribute('aria-modal', 'true');
        this.formulaOverlay.setAttribute('aria-label', 'Color mixing formula');

        // Close on click anywhere
        this.formulaOverlay.addEventListener('click', () => {
            this.hideFormulaOverlay();
        });

        // Close on escape key
        this.formulaKeyHandler = (e) => {
            if (e.key === 'Escape' && this.formulaOverlay.classList.contains('active')) {
                this.hideFormulaOverlay();
            }
        };
        document.addEventListener('keydown', this.formulaKeyHandler);

        document.body.appendChild(this.formulaOverlay);
    }

    /**
     * Show formula overlay with color combination
     * @param {string} color1 - First color name
     * @param {string} color2 - Second color name
     * @param {string} resultColor - Result color name
     */
    showFormulaOverlay(color1, color2, resultColor) {
        if (typeof document === 'undefined') return;

        this.createFormulaOverlay();

        // Get localized color names
        const color1Name = this.t(color1) || color1;
        const color2Name = this.t(color2) || color2;
        const resultName = this.t(resultColor) || resultColor;

        // Build formula HTML
        this.formulaOverlay.innerHTML = `
            <div class="formula-card">
                <div class="formula-title">${this.t('formula_title') || 'Color Magic!'}</div>
                <div class="formula-equation">
                    <div class="formula-color">
                        <div class="formula-color-circle ${color1}"></div>
                        <span class="formula-color-name">${color1Name}</span>
                    </div>
                    <span class="formula-operator">+</span>
                    <div class="formula-color">
                        <div class="formula-color-circle ${color2}"></div>
                        <span class="formula-color-name">${color2Name}</span>
                    </div>
                    <span class="formula-operator">=</span>
                    <div class="formula-color formula-result">
                        <div class="formula-color-circle ${resultColor}"></div>
                        <span class="formula-color-name">${resultName}</span>
                    </div>
                </div>
                <div class="formula-celebration">🎉✨🌈</div>
                <div class="formula-tap-hint">${this.t('tap_to_continue') || 'Tap anywhere to continue'}</div>
            </div>
        `;

        // Show overlay
        this.formulaOverlay.classList.add('active');

        // Auto-hide after delay
        this.formulaTimeout = this._setTimeout(() => {
            this.hideFormulaOverlay();
        }, 4000);
    }

    /**
     * Hide formula overlay
     */
    hideFormulaOverlay() {
        if (!this.formulaOverlay) return;

        if (this.formulaTimeout) {
            this._clearTimeout(this.formulaTimeout);
            this.formulaTimeout = null;
        }

        this.formulaOverlay.classList.remove('active');

        // Notify game to continue
        if (this.onFormulaClose) {
            this.onFormulaClose();
        }
    }

    /**
     * Set callback for formula overlay close
     * @param {Function} callback
     */
    setFormulaCloseCallback(callback) {
        this.onFormulaClose = callback;
    }

    // ===== Level Complete =====

    /**
     * Show level complete celebration
     */
    showLevelComplete() {
        this.container.classList.add('level-complete');

        // Add celebration flash
        const flash = document.createElement('div');
        flash.className = 'celebration-flash';
        document.body.appendChild(flash);
        this._setTimeout(() => flash.remove(), 500);

        // Create enhanced confetti particles
        const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#9944FF', '#44DD44', '#FF99CC', '#66CCFF'];
        const shapes = ['square', 'rectangle', 'circle', 'star'];
        const confettiCount = 80;

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            confetti.className = `confetti-piece ${shape}`;

            // Random position across screen width
            confetti.style.left = Math.random() * window.innerWidth + 'px';
            confetti.style.top = '-20px';

            // Random color
            confetti.style.setProperty('--confetti-color', colors[Math.floor(Math.random() * colors.length)]);

            // Random drift direction (-60px to 60px)
            confetti.style.setProperty('--confetti-drift', (Math.random() * 120 - 60) + 'px');

            // Staggered animation delay
            confetti.style.setProperty('--confetti-delay', (Math.random() * 0.8) + 's');

            // Varied duration
            confetti.style.setProperty('--confetti-duration', (2.5 + Math.random() * 1.5) + 's');

            document.body.appendChild(confetti);
            this._setTimeout(() => confetti.remove(), 4500);
        }

        this._setTimeout(() => {
            if (this.container) {
                this.container.classList.remove('level-complete');
            }
        }, 3000);
    }

    /**
     * Cleanup all modals and resources
     */
    destroy() {
        // Remove sticker book
        if (this.stickerBookKeyHandler) {
            document.removeEventListener('keydown', this.stickerBookKeyHandler);
            this.stickerBookKeyHandler = null;
        }
        if (this.stickerBookModal && this.stickerBookModal.parentElement) {
            this.stickerBookModal.remove();
        }
        this.stickerBookModal = null;
        this.stickerGrid = null;

        // Remove formula overlay
        if (this.formulaKeyHandler) {
            document.removeEventListener('keydown', this.formulaKeyHandler);
            this.formulaKeyHandler = null;
        }
        if (this.formulaTimeout) {
            this._clearTimeout(this.formulaTimeout);
            this.formulaTimeout = null;
        }
        if (this.formulaOverlay && this.formulaOverlay.parentElement) {
            this.formulaOverlay.remove();
        }
        this.formulaOverlay = null;
        this.onFormulaClose = null;

        // Remove any lingering celebration elements
        document.querySelectorAll('.celebration-flash, .confetti-piece').forEach(el => el.remove());

        this.container = null;
    }
}

// Dual export pattern for browser and Node.js
if (typeof window !== 'undefined') {
    window.ModalManager = ModalManager;
}

export default ModalManager;
