/**
 * UIManager - Handles UI creation and display components
 */
class UIManager {
    constructor(container) {
        this.container = container;
    }

    /**
     * Create the main game UI structure
     */
    createUI() {
        this.container.innerHTML = `
            <div class="puzzle-game">
                <header class="game-header">
                    <div class="header-left">
                        <a href="../../index.html" class="btn-home" title="Back to Home">🏠</a>
                        <h1>🧩 Puzzle Master</h1>
                    </div>
                    <div class="game-stats">
                        <span class="timer">⏱️ <span id="timer">00:00</span></span>
                        <span class="moves">🔄 <span id="moves">0</span> moves</span>
                        <span class="progress">🧩 <span id="progress">0%</span></span>
                    </div>
                </header>

                <div class="controls-panel">
                    <div class="difficulty-selector">
                        <label>Difficulty:</label>
                        <input type="range" id="difficulty-slider" min="2" max="5" value="3" class="difficulty-slider">
                        <span id="difficulty-label" class="difficulty-label">Medium (9)</span>
                        <button class="control-btn" id="shuffle-btn">🔀 New</button>
                    </div>

                    <div class="image-controls">
                        <button class="control-btn" id="load-file-btn">📁 Image</button>
                        <button class="control-btn" id="load-camera-btn">📷 Camera</button>
                        <button class="control-btn" id="hint-btn">💡 Hint</button>
                        <button class="control-btn" id="toggle-reference">👁️ Ref</button>
                        <button class="control-btn" id="music-btn">🎵</button>
                    </div>

                    <input type="file" id="file-input" accept="image/*" style="display: none;">
                    <input type="file" id="camera-input" accept="image/*" capture="environment" style="display: none;">
                </div>

                <div class="game-area">
                    <div class="board-container">
                        <div class="puzzle-board" id="puzzle-board"></div>
                    </div>
                    <div class="pieces-container">
                        <h3>Puzzle Pieces</h3>
                        <div class="pieces-area" id="pieces-area"></div>
                    </div>
                </div>

                <div class="reference-modal" id="reference-modal" style="display: none;">
                    <div class="modal-content">
                        <button class="close-modal" id="close-modal">✕</button>
                        <img id="reference-img" alt="Reference">
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Show tutorial if user hasn't seen it
     */
    showTutorialIfNeeded() {
        const hasSeenTutorial = localStorage.getItem('puzzleMasterTutorialSeen');
        if (!hasSeenTutorial) {
            setTimeout(() => {
                this.showTutorial();
                localStorage.setItem('puzzleMasterTutorialSeen', 'true');
            }, CONFIG.GAME.TUTORIAL_DELAY);
        }
    }

    /**
     * Display the tutorial modal
     */
    showTutorial() {
        const tutorial = document.createElement('div');
        tutorial.className = 'tutorial-modal';
        tutorial.innerHTML = `
            <h2>Welcome to Puzzle Master! 🧩</h2>
            <div class="tutorial-content">
                <p><strong>How to Play:</strong></p>
                <ul>
                    <li>Drag pieces from the right to the board</li>
                    <li>Pieces snap when close to correct position</li>
                    <li>Use <strong>H</strong> key for hints</li>
                    <li>Use <strong>R</strong> key to shuffle</li>
                    <li>Press <strong>Space</strong> to view reference image</li>
                </ul>
            </div>
            <button class="tutorial-btn" id="tutorial-close">Got it!</button>
        `;

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';

        document.body.appendChild(overlay);
        document.body.appendChild(tutorial);

        const closeTutorial = () => {
            tutorial.remove();
            overlay.remove();
        };

        document.getElementById('tutorial-close').onclick = closeTutorial;
        overlay.onclick = closeTutorial;
    }

    /**
     * Show celebration effect with confetti and stats
     */
    showCelebration(time, moves) {
        const fragment = document.createDocumentFragment();
        const confettiCount = CONFIG.GAME.CONFETTI_COUNT;

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            const size = 8 + Math.random() * 12;
            confetti.style.setProperty('--confetti-size', `${size}px`);
            confetti.style.setProperty('--confetti-color', `hsl(${Math.random() * 360}, 100%, 50%)`);
            confetti.style.setProperty('--confetti-left', `${Math.random() * 100}%`);
            confetti.style.setProperty('--confetti-radius', Math.random() > 0.5 ? '50%' : '0');
            confetti.style.setProperty('--confetti-duration', `${2 + Math.random() * 2}s`);
            fragment.appendChild(confetti);
        }

        document.body.appendChild(fragment);

        setTimeout(() => {
            document.querySelectorAll('.confetti').forEach(c => c.remove());
        }, CONFIG.GAME.CONFETTI_DURATION);

        // Show stats banner after delay
        setTimeout(() => {
            const statsBanner = document.createElement('div');
            statsBanner.className = 'stats-banner';
            statsBanner.innerHTML = `
                <div class="stats-title">Puzzle Complete!</div>
                <div class="stats-details">⏱️ Time: ${time} | 🔄 Moves: ${moves}</div>
            `;

            document.body.appendChild(statsBanner);

            setTimeout(() => {
                statsBanner.remove();
            }, CONFIG.GAME.STATS_DISPLAY_DURATION);
        }, CONFIG.GAME.CELEBRATION_DELAY);
    }

    /**
     * Show a toast notification
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, CONFIG.GAME.TOAST_DURATION);
    }

    /**
     * Update difficulty label display
     */
    updateDifficultyLabel(difficulty) {
        const label = document.getElementById('difficulty-label');
        if (label) {
            label.textContent = CONFIG.GAME.DIFFICULTY_LABELS[difficulty];
        }
    }

    /**
     * Update difficulty slider and label
     */
    updateDifficultyUI(difficulty) {
        const slider = document.getElementById('difficulty-slider');
        if (slider) {
            slider.value = difficulty;
        }
        this.updateDifficultyLabel(difficulty);
    }

    /**
     * Cleanup all temporary DOM elements
     */
    cleanupTemporaryElements() {
        const selectors = ['.confetti', '.toast', '.tutorial-modal', '.modal-overlay', '.stats-banner'];
        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => el.remove());
        });
    }
}
