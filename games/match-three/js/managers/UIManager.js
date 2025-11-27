/**
 * UIManager - Core UI creation and updates
 * Manages header, score panel, game area, and coordinates with other managers
 *
 * Supports dependency injection for testability:
 * - context: GameContext instance (recommended)
 * - Or individual options: doc, config
 * - EffectsManagerClass: EffectsManager constructor
 * - ModalManagerClass: ModalManager constructor
 */

class UIManager {
    /**
     * @param {HTMLElement} container - Container element
     * @param {Object} [options] - Optional dependencies for testing
     * @param {GameContext} [options.context] - GameContext instance (preferred)
     * @param {Document} [options.doc] - Document object (legacy, use context)
     * @param {Object} [options.config] - Configuration object (legacy, use context)
     * @param {Function} [options.EffectsManagerClass] - EffectsManager constructor
     * @param {Function} [options.ModalManagerClass] - ModalManager constructor
     */
    constructor(container, options = {}) {
        this.container = container;
        // Support both GameContext and individual options (backward compatible)
        const ctx = options.context || null;
        this._doc = ctx?.doc || options.doc || (typeof document !== 'undefined' ? document : null);
        this._config = ctx?.config || options.config || CONFIG;

        // Injectable sub-manager classes
        this._EffectsManagerClass = options.EffectsManagerClass || EffectsManager;
        this._ModalManagerClass = options.ModalManagerClass || ModalManager;

        this.elements = {};
        this.handlers = new Map();

        // Sub-managers (initialized in createUI)
        this.effectsManager = null;
        this.modalManager = null;
    }

    /**
     * Create all UI elements
     */
    createUI() {
        this.container.innerHTML = '';
        this.container.className = 'game-container';

        // Initialize sub-managers with injected dependencies
        this.effectsManager = new this._EffectsManagerClass(this.container, {
            doc: this._doc,
            config: this._config
        });
        this.modalManager = new this._ModalManagerClass(this.container, {
            doc: this._doc,
            config: this._config
        });

        // Create UI components
        this.createHeader();
        this.createScorePanel();
        this.createGameArea();
        this.modalManager.createModals();
    }

    /**
     * Create header with title and controls
     */
    createHeader() {
        const header = this._doc.createElement('div');
        header.className = 'game-header';
        header.setAttribute('role', 'banner');
        const texts = this._config.UI.TEXTS;
        header.innerHTML = `
            <div class="header-left">
                <a href="../../index.html" class="btn-home" title="Back to Home">🏠</a>
                <h1>${texts.GAME_TITLE}</h1>
            </div>
            <div class="header-controls" role="toolbar" aria-label="Game controls">
                <button id="shuffle-btn" class="header-btn" title="${texts.BUTTON_SHUFFLE}" aria-label="Shuffle board">🔀</button>
                <button id="new-game-btn" class="header-btn" title="${texts.BUTTON_NEW_GAME}" aria-label="Start new game">🎮</button>
                <button id="music-toggle" class="icon-btn" title="${texts.BUTTON_MUSIC}" aria-label="Toggle music" aria-pressed="true">🔊</button>
                <button id="settings-btn" class="icon-btn" title="${texts.BUTTON_SETTINGS}" aria-label="Open settings">⚙️</button>
            </div>
        `;

        this.container.appendChild(header);
        this.elements.header = header;
        this.elements.musicToggle = header.querySelector('#music-toggle');
        this.elements.settingsBtn = header.querySelector('#settings-btn');
        this.elements.shuffleBtn = header.querySelector('#shuffle-btn');
        this.elements.newGameBtn = header.querySelector('#new-game-btn');
    }

    /**
     * Create score panel with score, target, level, and progress
     */
    createScorePanel() {
        const panel = this._doc.createElement('div');
        panel.className = 'score-panel';
        panel.setAttribute('role', 'status');
        panel.setAttribute('aria-label', 'Game status');
        panel.innerHTML = `
            <div class="score-item">
                <div class="score-label" id="score-label">Score</div>
                <div id="current-score" class="score-value" aria-labelledby="score-label" aria-live="polite">0</div>
            </div>
            <div class="score-item">
                <div class="score-label" id="target-label">Target</div>
                <div id="target-score" class="score-value" aria-labelledby="target-label">500</div>
            </div>
            <div class="score-item">
                <div class="score-label" id="level-label">Level</div>
                <div id="current-level" class="score-value" aria-labelledby="level-label" aria-live="polite">1</div>
            </div>
            <div class="progress-bar-container" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" aria-label="Level progress">
                <div id="progress-bar" class="progress-bar"></div>
            </div>
        `;

        this.container.appendChild(panel);
        this.elements.scorePanel = panel;
        this.elements.currentScore = panel.querySelector('#current-score');
        this.elements.targetScore = panel.querySelector('#target-score');
        this.elements.currentLevel = panel.querySelector('#current-level');
        this.elements.progressBar = panel.querySelector('#progress-bar');
    }

    /**
     * Create game area container
     */
    createGameArea() {
        const gameArea = this._doc.createElement('div');
        gameArea.className = 'game-area';
        gameArea.id = 'game-area';
        gameArea.setAttribute('role', 'application');
        gameArea.setAttribute('aria-label', 'Match three game board');
        gameArea.setAttribute('tabindex', '0');

        this.container.appendChild(gameArea);
        this.elements.gameArea = gameArea;
    }

    /**
     * Update score display
     * @param {number} score - Current score
     * @param {number} target - Target score
     */
    updateScore(score, target) {
        if (this.elements.currentScore) {
            this.elements.currentScore.textContent = score;
        }
        if (this.elements.targetScore) {
            this.elements.targetScore.textContent = target;
        }

        // Update progress bar
        if (this.elements.progressBar) {
            const progress = Math.min((score / target) * 100, 100);
            this.elements.progressBar.style.width = `${progress}%`;

            // Update ARIA for progress bar
            const container = this.elements.progressBar.parentElement;
            if (container) {
                container.setAttribute('aria-valuenow', Math.round(progress));
            }
        }
    }

    /**
     * Update level display
     * @param {number} level - Current level
     */
    updateLevel(level) {
        if (this.elements.currentLevel) {
            this.elements.currentLevel.textContent = level;
        }
    }

    /**
     * Toggle music icon
     * @param {boolean} isPlaying - Whether music is playing
     */
    setMusicIcon(isPlaying) {
        if (this.elements.musicToggle) {
            this.elements.musicToggle.textContent = isPlaying ? '🔊' : '🔇';
            this.elements.musicToggle.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
            this.elements.musicToggle.setAttribute('aria-label', isPlaying ? 'Mute music' : 'Play music');
        }
    }

    // ========== Delegate to EffectsManager ==========

    showToast(message, type = 'info') {
        this.effectsManager?.showToast(message, type);
    }

    showFloatingScore(points, x, y) {
        this.effectsManager?.showFloatingScore(points, x, y);
    }

    showCombo(comboCount) {
        this.effectsManager?.showCombo(comboCount);
    }

    showStarBurst(x, y, count) {
        this.effectsManager?.showStarBurst(x, y, count);
    }

    showConfetti() {
        this.effectsManager?.showConfetti();
    }

    // ========== Delegate to ModalManager ==========

    showVictory(score, stars) {
        this.modalManager?.showVictory(score, stars, this.effectsManager);
    }

    hideVictory() {
        this.modalManager?.hideVictory();
    }

    showSettings() {
        this.modalManager?.showSettings();
    }

    hideSettings() {
        this.modalManager?.hideSettings();
    }

    /**
     * Show confirm dialog
     * @param {Object} options - Dialog options
     */
    showConfirmDialog(options) {
        this.modalManager?.showConfirm(options);
    }

    /**
     * Get UI element by name
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
        // Remove all event listeners
        this.handlers.forEach((handler, key) => {
            const [element, event] = key.split(':');
            if (this.elements[element]) {
                this.elements[element].removeEventListener(event, handler);
            }
        });
        this.handlers.clear();

        // Destroy sub-managers
        this.effectsManager?.destroy();
        this.modalManager?.destroy();

        // Clear elements
        this.elements = {};

        // Clear container
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}
