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
    }

    createUI() {
        this.container.innerHTML = `
            <div class="puzzle-game">
                <header class="game-header">
                    <h1>🧩 Puzzle Master</h1>
                    <div class="game-stats">
                        <span class="timer">⏱️ <span id="timer">00:00</span></span>
                        <span class="moves">🔄 <span id="moves">0</span> moves</span>
                    </div>
                </header>

                <div class="controls-panel">
                    <div class="difficulty-selector">
                        <label>Difficulty:</label>
                        <button class="diff-btn" data-difficulty="2">Easy (4)</button>
                        <button class="diff-btn active" data-difficulty="3">Medium (9)</button>
                        <button class="diff-btn" data-difficulty="4">Hard (16)</button>
                        <button class="diff-btn" data-difficulty="5">Expert (25)</button>
                    </div>

                    <div class="image-controls">
                        <button class="control-btn" id="load-file-btn">📁 Load Image</button>
                        <button class="control-btn" id="load-camera-btn">📷 Camera</button>
                        <button class="control-btn" id="shuffle-btn">🔀 Shuffle</button>
                        <button class="control-btn" id="hint-btn">💡 Hint</button>
                        <button class="control-btn" id="toggle-reference">👁️ Reference</button>
                        <button class="control-btn" id="music-btn">🎵 Music</button>
                    </div>

                    <input type="file" id="file-input" accept="image/*" capture="environment" style="display: none;">
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
        // Difficulty buttons
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentDifficulty = parseInt(e.target.dataset.difficulty);
                this.startNewPuzzle();
            });
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
            this.imageLoader.loadFromCamera()
                .then(img => this.startNewPuzzle(img))
                .catch(err => {
                    if (!err.message.includes('cancelled')) {
                        alert('Camera error: ' + err.message);
                    }
                });
        });

        // Game controls
        document.getElementById('shuffle-btn').addEventListener('click', () => {
            if (this.puzzleBoard) {
                this.puzzleBoard.reset();
                this.resetStats();
            }
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
        // Create a colorful default image
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');

        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, 400, 400);
        gradient.addColorStop(0, '#FF6B6B');
        gradient.addColorStop(0.5, '#4ECDC4');
        gradient.addColorStop(1, '#45B7D1');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 400, 400);

        // Add some shapes
        ctx.fillStyle = '#FFE66D';
        ctx.beginPath();
        ctx.arc(100, 100, 60, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#A8E6CF';
        ctx.fillRect(250, 80, 100, 100);

        ctx.fillStyle = '#FF8B94';
        ctx.beginPath();
        ctx.moveTo(200, 300);
        ctx.lineTo(300, 300);
        ctx.lineTo(250, 220);
        ctx.closePath();
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

        // Destroy existing puzzle
        if (this.puzzleBoard) {
            this.puzzleBoard.destroy();
        }

        // Create new puzzle
        const boardContainer = document.getElementById('puzzle-board');
        this.puzzleBoard = new PuzzleBoard(boardContainer, img, this.currentDifficulty);

        // Set completion callback
        this.puzzleBoard.onComplete = () => {
            this.onPuzzleComplete();
        };

        // Update reference image
        document.getElementById('reference-img').src = img.src;

        // Reset stats
        this.resetStats();
        this.startTimer();

        // Auto-start music
        this.autoStartMusic();
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

        // Add celebration effect with stats
        this.showCelebration(time, moves);
    }

    showCelebration(time, moves) {
        // Create confetti effect - more confetti across whole screen
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.cssText = `
                position: fixed;
                width: ${5 + Math.random() * 10}px;
                height: ${5 + Math.random() * 10}px;
                background: hsl(${Math.random() * 360}, 100%, 50%);
                left: ${Math.random() * 100}%;
                top: -20px;
                border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                animation: fall ${2 + Math.random() * 2}s linear;
                z-index: 9999;
            `;
            document.body.appendChild(confetti);

            setTimeout(() => confetti.remove(), 4000);
        }

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
            this.bgMusic.play().catch(err => {
                console.log('Audio play failed:', err);
            });
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
            }).catch(err => {
                // Browser may block autoplay, user needs to click music button
                console.log('Autoplay blocked, user interaction required:', err);
            });
        }
    }
}
