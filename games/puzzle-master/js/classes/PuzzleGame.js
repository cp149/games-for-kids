/**
 * PuzzleGame - Main game controller
 */
class PuzzleGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.imageLoader = new ImageLoader();
        this.puzzleBoard = null;
        this.currentDifficulty = 3;
        this.startTime = 0;
        this.timerInterval = null;
        this.moveCount = 0;
        this.winCount = 0;  // Track wins for auto difficulty upgrade

        // Background music
        this.bgMusic = null;
        this.currentMusicIndex = 0;
        this.musicFiles = ['assets/sounds/m1.mp3', 'assets/sounds/m2.mp3'];
        this.isMusicPlaying = false;

        this.init();
    }

    init() {
        this.createUI();
        this.setupEventListeners();
        this.loadDefaultImage();
        this.showTutorialIfNeeded();
    }

    showTutorialIfNeeded() {
        const hasSeenTutorial = localStorage.getItem('puzzleMasterTutorialSeen');
        if (!hasSeenTutorial) {
            setTimeout(() => {
                this.showTutorial();
                localStorage.setItem('puzzleMasterTutorialSeen', 'true');
            }, 1000);
        }
    }

    showTutorial() {
        const tutorial = document.createElement('div');
        tutorial.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 50px rgba(0,0,0,0.3);
            z-index: 10001;
            max-width: 400px;
            text-align: center;
            animation: slideIn 0.3s ease-out;
        `;

        tutorial.innerHTML = `
            <h2 style="color: #667eea; margin-bottom: 20px;">Welcome to Puzzle Master! 🧩</h2>
            <div style="text-align: left; margin: 20px 0; line-height: 1.6;">
                <p><strong>How to Play:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Drag pieces from the right to the board</li>
                    <li>Pieces snap when close to correct position</li>
                    <li>Use <strong>H</strong> key for hints</li>
                    <li>Use <strong>R</strong> key to shuffle</li>
                    <li>Press <strong>Space</strong> to view reference image</li>
                </ul>
            </div>
            <button id="tutorial-close" style="
                padding: 12px 30px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                margin-top: 10px;
            ">Got it!</button>
        `;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
                to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 10000;
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(tutorial);

        document.getElementById('tutorial-close').onclick = () => {
            tutorial.remove();
            overlay.remove();
            style.remove();
        };

        overlay.onclick = () => {
            tutorial.remove();
            overlay.remove();
            style.remove();
        };
    }

    createUI() {
        this.container.innerHTML = `
            <div class="puzzle-game">
                <header class="game-header">
                    <h1>🧩 Puzzle Master</h1>
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

    setupEventListeners() {
        // Difficulty slider
        const slider = document.getElementById('difficulty-slider');
        slider.addEventListener('input', (e) => {
            this.currentDifficulty = parseInt(e.target.value);
            this.updateDifficultyLabel();
        });
        slider.addEventListener('change', () => {
            this.startNewPuzzle();
        });

        // Image loading
        document.getElementById('load-file-btn').addEventListener('click', () => {
            document.getElementById('file-input').click();
        });

        document.getElementById('file-input').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.imageLoader.loadFromFile(file)
                    .then(img => this.startNewPuzzle(img))
                    .catch(err => alert('Failed to load image: ' + err.message));
            }
        });

        document.getElementById('load-camera-btn').addEventListener('click', () => {
            document.getElementById('camera-input').click();
        });

        document.getElementById('camera-input').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.imageLoader.loadFromFile(file)
                    .then(img => this.startNewPuzzle(img))
                    .catch(err => alert('Failed to load image: ' + err.message));
            }
        });

        // Game controls - Shuffle creates new puzzle with current difficulty
        document.getElementById('shuffle-btn').addEventListener('click', () => {
            this.startNewPuzzle();
        });

        document.getElementById('hint-btn').addEventListener('click', () => {
            if (this.puzzleBoard) {
                this.puzzleBoard.showHint();
            }
        });

        // Reference toggle
        document.getElementById('toggle-reference').addEventListener('click', () => {
            const modal = document.getElementById('reference-modal');
            modal.style.display = 'flex';
        });

        document.getElementById('close-modal').addEventListener('click', () => {
            document.getElementById('reference-modal').style.display = 'none';
        });

        document.getElementById('reference-modal').addEventListener('click', (e) => {
            if (e.target.id === 'reference-modal') {
                document.getElementById('reference-modal').style.display = 'none';
            }
        });

        // Track moves
        document.addEventListener('pieceDropped', () => {
            this.moveCount++;
            document.getElementById('moves').textContent = this.moveCount;
        });

        // Music control
        document.getElementById('music-btn').addEventListener('click', () => {
            this.toggleMusic();
        });
    }

    loadDefaultImage() {
        // Load a random background image from shared lib
        const bgImages = [
            '../lib/images/background/2.png',
            '../lib/images/background/3.png'
        ];
        const randomBg = bgImages[Math.floor(Math.random() * bgImages.length)];

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = randomBg;
        img.onload = () => {
            this.startNewPuzzle(img);
        };
        img.onerror = () => {
            // Fallback to generated image if loading fails
            this.loadGeneratedImage();
        };
    }

    loadGeneratedImage() {
        // Fallback: Create a colorful generated image
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');

        const gradient = ctx.createLinearGradient(0, 0, 400, 400);
        gradient.addColorStop(0, '#FF6B6B');
        gradient.addColorStop(0.5, '#4ECDC4');
        gradient.addColorStop(1, '#45B7D1');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 400, 400);

        ctx.fillStyle = '#FFE66D';
        ctx.beginPath();
        ctx.arc(100, 100, 60, 0, Math.PI * 2);
        ctx.fill();

        const img = new Image();
        img.src = canvas.toDataURL();
        img.onload = () => {
            this.startNewPuzzle(img);
        };
    }

    startNewPuzzle(image = null) {
        const img = image || this.imageLoader.getCurrentImage();
        if (!img) return;

        // Save current image for shuffle functionality
        if (image) {
            this.imageLoader.currentImage = image;
        }

        // Stop timer and cleanup before starting new puzzle
        this.stopTimer();

        // Destroy existing puzzle
        if (this.puzzleBoard) {
            this.puzzleBoard.destroy();
        }

        // Clear any existing confetti
        document.querySelectorAll('.confetti').forEach(c => c.remove());

        // Create new puzzle
        const boardContainer = document.getElementById('puzzle-board');
        this.puzzleBoard = new PuzzleBoard(boardContainer, img, this.currentDifficulty);

        this.puzzleBoard.onComplete = () => {
            this.onPuzzleComplete();
        };

        this.puzzleBoard.onFirstPiecePlaced = () => {
            if (!this.isMusicPlaying) {
                this.autoStartMusic();
            }
        };

        document.getElementById('reference-img').src = img.src;

        this.resetStats();
        this.startTimer();
    }

    startTimer() {
        this.stopTimer();
        this.startTime = Date.now();

        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            document.getElementById('timer').textContent = `${minutes}:${seconds}`;
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    resetStats() {
        this.moveCount = 0;
        document.getElementById('moves').textContent = '0';
        document.getElementById('timer').textContent = '00:00';
    }

    onPuzzleComplete() {
        this.stopTimer();

        const time = document.getElementById('timer').textContent;
        const moves = this.moveCount;

        // Track wins and auto upgrade difficulty
        this.winCount++;
        if (this.winCount % 2 === 0 && this.currentDifficulty < 5) {
            this.currentDifficulty++;
            this.updateDifficultyUI();
        }

        // Add celebration effect with stats
        this.showCelebration(time, moves);
    }

    updateDifficultyLabel() {
        const labels = {
            2: 'Easy (4)',
            3: 'Medium (9)',
            4: 'Hard (16)',
            5: 'Expert (25)'
        };
        document.getElementById('difficulty-label').textContent = labels[this.currentDifficulty];
    }

    updateDifficultyUI() {
        document.getElementById('difficulty-slider').value = this.currentDifficulty;
        this.updateDifficultyLabel();
    }

    showCelebration(time, moves) {
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            const size = 5 + Math.random() * 10;
            confetti.style.width = size + 'px';
            confetti.style.height = size + 'px';
            confetti.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-20px';
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            confetti.style.animationDuration = (2 + Math.random() * 2) + 's';

            fragment.appendChild(confetti);
        }

        document.body.appendChild(fragment);

        setTimeout(() => {
            document.querySelectorAll('.confetti').forEach(c => c.remove());
        }, 4000);

        // Show stats in a nice banner after a short delay
        setTimeout(() => {
            const statsBanner = document.createElement('div');
            statsBanner.style.cssText = `
                position: fixed;
                bottom: 30px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(255, 255, 255, 0.95);
                padding: 20px 40px;
                border-radius: 15px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                z-index: 10001;
                font-size: 18px;
                text-align: center;
                animation: slideUp 0.5s ease-out;
            `;
            statsBanner.innerHTML = `
                <div style="color: #667eea; font-weight: bold; margin-bottom: 10px;">Puzzle Complete!</div>
                <div style="color: #666;">⏱️ Time: ${time} | 🔄 Moves: ${moves}</div>
            `;

            const slideUpStyle = document.createElement('style');
            slideUpStyle.textContent = `
                @keyframes slideUp {
                    from { transform: translateX(-50%) translateY(100px); opacity: 0; }
                    to { transform: translateX(-50%) translateY(0); opacity: 1; }
                }
            `;
            document.head.appendChild(slideUpStyle);
            document.body.appendChild(statsBanner);

            setTimeout(() => {
                statsBanner.remove();
                slideUpStyle.remove();
            }, 4000);
        }, 1500);
    }

    initMusic() {
        if (!this.bgMusic) {
            this.bgMusic = new Audio(this.musicFiles[this.currentMusicIndex]);
            this.bgMusic.loop = false;
            this.bgMusic.volume = 0.4;

            // Auto-switch to next music when current ends
            this.bgMusic.addEventListener('ended', () => {
                this.currentMusicIndex = (this.currentMusicIndex + 1) % this.musicFiles.length;
                this.bgMusic.src = this.musicFiles[this.currentMusicIndex];
                if (this.isMusicPlaying) {
                    this.bgMusic.play();
                }
            });
        }
    }

    toggleMusic() {
        this.initMusic();
        const btn = document.getElementById('music-btn');

        if (this.isMusicPlaying) {
            this.bgMusic.pause();
            this.isMusicPlaying = false;
            btn.textContent = '🎵 Music';
            btn.style.opacity = '0.7';
        } else {
            this.bgMusic.play().catch(() => {});
            this.isMusicPlaying = true;
            btn.textContent = '🔇 Music';
            btn.style.opacity = '1';
        }
    }

    stopMusic() {
        if (this.bgMusic && this.isMusicPlaying) {
            this.bgMusic.pause();
            this.isMusicPlaying = false;
            const btn = document.getElementById('music-btn');
            if (btn) {
                btn.textContent = '🎵 Music';
                btn.style.opacity = '0.7';
            }
        }
    }

    autoStartMusic() {
        // Only auto-start if music is not already playing
        if (!this.isMusicPlaying) {
            this.initMusic();
            this.bgMusic.play().then(() => {
                this.isMusicPlaying = true;
                const btn = document.getElementById('music-btn');
                if (btn) {
                    btn.textContent = '🔇 Music';
                    btn.style.opacity = '1';
                }
            }).catch(() => {});
        }
    }
}
