/**
 * PuzzleBoard - Manages the puzzle board, pieces, and game logic
 */
class PuzzleBoard {
    constructor(container, image, difficulty = 3) {
        this.boardContainer = container;
        this.piecesContainer = null;
        this.image = image;
        this.difficulty = difficulty;
        this.pieces = [];
        this.pieceWidth = 0;
        this.pieceHeight = 0;
        this.boardWidth = 0;
        this.boardHeight = 0;

        // Adaptive snap distance based on difficulty (generous for better UX)
        const snapDistances = {
            2: 80,  // Easy: very forgiving
            3: 60,  // Medium: forgiving
            4: 50,  // Hard: moderate
            5: 40   // Expert: still reasonable
        };
        this.snapDistance = snapDistances[difficulty] || 60;

        this.piecesPlaced = 0;
        this.onComplete = null;

        this.init();
    }

    init() {
        this.piecesContainer = document.getElementById('pieces-area');

        if (!this.piecesContainer) {
            return;
        }

        this.boardContainer.innerHTML = '';
        this.piecesContainer.innerHTML = '';
        this.boardContainer.style.position = 'relative';

        requestAnimationFrame(() => {
            this.calculateAndCreatePuzzle();
        });
    }

    calculateAndCreatePuzzle() {
        const parentContainer = this.boardContainer.parentElement;

        let containerWidth = parentContainer.clientWidth;
        let containerHeight = parentContainer.clientHeight;

        if (!containerWidth || !containerHeight) {
            containerWidth = window.innerWidth * 0.7;
            containerHeight = window.innerHeight * 0.75;
        }

        // Minimal padding for maximum space usage
        const padding = 32;
        const maxWidth = containerWidth - padding;
        const maxHeight = containerHeight - padding;

        const imageAspect = this.image.width / this.image.height;

        // Calculate optimal size while maintaining aspect ratio
        let targetWidth = maxWidth;
        let targetHeight = maxWidth / imageAspect;

        if (targetHeight > maxHeight) {
            targetHeight = maxHeight;
            targetWidth = maxHeight * imageAspect;
        }

        // Ensure minimum size for playability
        const minSize = 300;
        if (targetWidth < minSize || targetHeight < minSize) {
            if (imageAspect > 1) {
                targetWidth = minSize;
                targetHeight = minSize / imageAspect;
            } else {
                targetHeight = minSize;
                targetWidth = minSize * imageAspect;
            }
        }

        this.boardWidth = Math.floor(targetWidth);
        this.boardHeight = Math.floor(targetHeight);
        this.pieceWidth = this.boardWidth / this.difficulty;
        this.pieceHeight = this.boardHeight / this.difficulty;

        this.boardContainer.style.width = this.boardWidth + 'px';
        this.boardContainer.style.height = this.boardHeight + 'px';

        this.createPieces();
        this.placePiecesInSidebar();
    }

    createPieces() {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.boardWidth;
        tempCanvas.height = this.boardHeight;
        const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
        tempCtx.drawImage(this.image, 0, 0, this.boardWidth, this.boardHeight);

        let pieceId = 0;

        for (let row = 0; row < this.difficulty; row++) {
            for (let col = 0; col < this.difficulty; col++) {
                const x = col * this.pieceWidth;
                const y = row * this.pieceHeight;

                const pieceImageData = tempCtx.getImageData(
                    Math.floor(x), Math.floor(y),
                    Math.floor(this.pieceWidth), Math.floor(this.pieceHeight)
                );

                const pieceCanvas = document.createElement('canvas');
                pieceCanvas.width = Math.floor(this.pieceWidth);
                pieceCanvas.height = Math.floor(this.pieceHeight);

                const piece = new PuzzlePiece(
                    pieceId++,
                    row,
                    col,
                    pieceImageData,
                    pieceCanvas,
                    x,
                    y
                );

                pieceCanvas.addEventListener('pieceDropped', (e) => {
                    this.handlePieceDrop(e.detail.piece);
                });

                this.pieces.push(piece);
            }
        }
    }

    placePiecesInSidebar() {
        const shuffledPieces = [...this.pieces];
        for (let i = shuffledPieces.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledPieces[i], shuffledPieces[j]] = [shuffledPieces[j], shuffledPieces[i]];
        }

        shuffledPieces.forEach((piece) => {
            piece.canvas.style.position = 'relative';
            piece.canvas.style.left = '0';
            piece.canvas.style.top = '0';
            piece.canvas.style.margin = '10px auto';
            piece.canvas.style.display = 'block';
            piece.currentX = 0;
            piece.currentY = 0;
            piece.isInSidebar = true;

            this.piecesContainer.appendChild(piece.canvas);
        });
    }

    handlePieceDrop(piece) {
        if (piece.isNearCorrectPosition(this.snapDistance)) {
            piece.snapToCorrectPosition();
            this.piecesPlaced++;

            this.updateProgress();

            this.playSound('success');

            if (this.piecesPlaced === this.pieces.length) {
                this.onPuzzleComplete();
            }
        }
    }

    updateProgress() {
        const progress = Math.round((this.piecesPlaced / this.pieces.length) * 100);
        const progressElement = document.getElementById('progress');
        if (progressElement) {
            progressElement.textContent = progress + '%';
        }
    }

    onPuzzleComplete() {
        // Add completion effect
        this.boardContainer.classList.add('puzzle-complete');

        // Play completion sound
        this.playSound('complete');

        // Show completion message
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 60px;
            border-radius: 20px;
            font-size: 32px;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            animation: popIn 0.5s ease-out;
        `;
        message.textContent = '🎉 Congratulations! 🎉';
        document.body.appendChild(message);

        // Add pop-in animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes popIn {
                0% { transform: translate(-50%, -50%) scale(0); }
                70% { transform: translate(-50%, -50%) scale(1.1); }
                100% { transform: translate(-50%, -50%) scale(1); }
            }
        `;
        document.head.appendChild(style);

        setTimeout(() => {
            message.remove();
            style.remove();
        }, 3000);

        // Fire callback
        if (this.onComplete) {
            setTimeout(() => {
                this.onComplete();
            }, 500);
        }
    }

    playSound(type) {
        const audioContext = window.AudioContext || window.webkitAudioContext;
        if (!audioContext) return;

        const ctx = new audioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        if (type === 'success') {
            oscillator.frequency.setValueAtTime(800, ctx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.1);
        } else if (type === 'complete') {
            const notes = [523, 659, 784, 1047];
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
                gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.15);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.2);
                osc.start(ctx.currentTime + i * 0.15);
                osc.stop(ctx.currentTime + i * 0.15 + 0.2);
            });
        }
    }

    reset() {
        this.piecesPlaced = 0;
        this.updateProgress();
        this.pieces.forEach(piece => {
            piece.isPlaced = false;
            piece.isInSidebar = true;
            piece.canvas.classList.remove('placed');
            piece.canvas.style.cursor = 'grab';
        });
        this.placePiecesInSidebar();
        this.boardContainer.classList.remove('puzzle-complete');
    }

    destroy() {
        this.pieces.forEach(piece => piece.destroy());
        this.pieces = [];
        this.boardContainer.innerHTML = '';
        this.piecesContainer.innerHTML = '';
    }

    showHint() {
        const unplacedPiece = this.pieces.find(p => !p.isPlaced);
        if (!unplacedPiece) return;

        // Scroll to piece if in sidebar
        if (unplacedPiece.isInSidebar) {
            unplacedPiece.canvas.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Enhanced highlight with pulse animation
        unplacedPiece.canvas.style.border = '4px solid #FFD700';
        unplacedPiece.canvas.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.8)';
        unplacedPiece.canvas.style.animation = 'hintPulse 0.5s ease-in-out 4';

        const style = document.createElement('style');
        style.textContent = `
            @keyframes hintPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
        `;
        document.head.appendChild(style);

        setTimeout(() => {
            unplacedPiece.canvas.style.border = '1px solid rgba(0, 0, 0, 0.1)';
            unplacedPiece.canvas.style.boxShadow = 'none';
            unplacedPiece.canvas.style.animation = '';
            style.remove();
        }, 2500);

        // Enhanced ghost with preview
        const ghost = document.createElement('canvas');
        ghost.width = this.pieceWidth;
        ghost.height = this.pieceHeight;
        const ctx = ghost.getContext('2d');
        ctx.putImageData(unplacedPiece.imageData, 0, 0);
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
        ctx.fillRect(0, 0, ghost.width, ghost.height);

        ghost.style.position = 'absolute';
        ghost.style.left = unplacedPiece.correctX + 'px';
        ghost.style.top = unplacedPiece.correctY + 'px';
        ghost.style.border = '4px dashed #FFD700';
        ghost.style.pointerEvents = 'none';
        ghost.style.opacity = '0.6';
        ghost.classList.add('hint-ghost');

        this.boardContainer.appendChild(ghost);
        setTimeout(() => {
            ghost.remove();
        }, 2500);
    }
}
