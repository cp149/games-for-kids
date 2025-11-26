/**
 * UIManager - Core UI creation and updates
 * Manages header, score panel, game area, and coordinates with other managers
 */

class UIManager {
    constructor(container) {
        this.container = container;
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

        // Initialize sub-managers
        this.effectsManager = new EffectsManager(this.container);
        this.modalManager = new ModalManager(this.container);

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
        const header = document.createElement('div');
        header.className = 'game-header';
        header.innerHTML = `
            <h1>Match Three</h1>
            <div class="header-controls">
                <button id="shuffle-btn" class="header-btn" title="Shuffle">🔀</button>
                <button id="new-game-btn" class="header-btn" title="New Game">🎮</button>
                <button id="music-toggle" class="icon-btn" title="Toggle Music">🔊</button>
                <button id="settings-btn" class="icon-btn" title="Settings">⚙️</button>
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
        const panel = document.createElement('div');
        panel.className = 'score-panel';
        panel.innerHTML = `
            <div class="score-item">
                <div class="score-label">Score</div>
                <div id="current-score" class="score-value">0</div>
            </div>
            <div class="score-item">
                <div class="score-label">Target</div>
                <div id="target-score" class="score-value">500</div>
            </div>
            <div class="score-item">
                <div class="score-label">Level</div>
                <div id="current-level" class="score-value">1</div>
            </div>
            <div class="progress-bar-container">
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
        const gameArea = document.createElement('div');
        gameArea.className = 'game-area';
        gameArea.id = 'game-area';

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
