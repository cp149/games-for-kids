/**
 * PuzzleBoard - Manages the puzzle board, pieces, and game logic
 */

// Use unified config (BOARD_CONFIG alias for backward compatibility)
const BOARD_CONFIG = CONFIG.BOARD;

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

        // Adaptive snap distance based on difficulty
        this.snapDistance = BOARD_CONFIG.SNAP_DISTANCES[difficulty] || 60;

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
            containerHeight = window.innerHeight * 0.7;
        }

        // Use most of the container space
        const maxWidth = containerWidth - 16;
        const maxHeight = containerHeight - 16;

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

        // Ensure board dimensions are divisible by difficulty for perfect fit
        this.boardWidth = Math.floor(targetWidth / this.difficulty) * this.difficulty;
        this.boardHeight = Math.floor(targetHeight / this.difficulty) * this.difficulty;
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
        const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true, alpha: false });
        tempCtx.drawImage(this.image, 0, 0, this.boardWidth, this.boardHeight);

        // Read full image data once (more efficient than multiple getImageData calls)
        const fullImageData = tempCtx.getImageData(0, 0, this.boardWidth, this.boardHeight);
        const pieceW = Math.floor(this.pieceWidth);
        const pieceH = Math.floor(this.pieceHeight);

        let pieceId = 0;

        for (let row = 0; row < this.difficulty; row++) {
            for (let col = 0; col < this.difficulty; col++) {
                const x = col * this.pieceWidth;
                const y = row * this.pieceHeight;

                // Extract piece data from full image (memory operation, faster than getImageData)
                const pieceImageData = this.extractPieceData(fullImageData, Math.floor(x), Math.floor(y), pieceW, pieceH);

                const pieceCanvas = document.createElement('canvas');
                pieceCanvas.width = pieceW;
                pieceCanvas.height = pieceH;

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

    // Extract piece data from full image data using TypedArray.set() for better performance
    extractPieceData(fullImageData, startX, startY, pieceW, pieceH) {
        const pieceData = new ImageData(pieceW, pieceH);
        const fullWidth = fullImageData.width;
        const fullData = fullImageData.data;
        const pieceDataArray = pieceData.data;
        const rowBytes = pieceW * 4;

        // Use TypedArray.set() for row-by-row copy (30-50% faster than pixel-by-pixel)
        for (let py = 0; py < pieceH; py++) {
            const srcStart = ((startY + py) * fullWidth + startX) * 4;
            const destStart = py * rowBytes;
            // Extract source row as subarray and copy to destination
            pieceDataArray.set(
                fullData.subarray(srcStart, srcStart + rowBytes),
                destStart
            );
        }

        return pieceData;
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

            // Notify first piece placed
            if (this.piecesPlaced === 1 && this.onFirstPiecePlaced) {
                this.onFirstPiecePlaced();
            }

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

        // Show completion message using CSS class
        const message = document.createElement('div');
        message.className = 'completion-message';
        message.textContent = '🎉 Congratulations! 🎉';
        document.body.appendChild(message);

        setTimeout(() => {
            message.remove();
        }, BOARD_CONFIG.COMPLETION_MESSAGE_DURATION);

        // Fire callback
        if (this.onComplete) {
            setTimeout(() => {
                this.onComplete();
            }, BOARD_CONFIG.COMPLETION_CALLBACK_DELAY);
        }
    }

    async playSound(type) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        // Reuse or create audio context
        if (!this.audioContext) {
            this.audioContext = new AudioContext();
        }
        const ctx = this.audioContext;

        // Resume if suspended (browser autoplay policy) - properly await
        if (ctx.state === 'suspended') {
            try {
                await ctx.resume();
            } catch (e) {
                // Ignore resume errors (e.g., user gesture required)
                return;
            }
        }

        if (type === 'success') {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
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

        // Close audio context to free resources
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }

    showHint() {
        const unplacedPiece = this.pieces.find(p => !p.isPlaced);
        if (!unplacedPiece) return;

        const duration = BOARD_CONFIG.HINT_DURATION;

        // Highlight the piece
        this.highlightPiece(unplacedPiece, duration);

        // Show ghost preview on board
        this.showGhostPreview(unplacedPiece, duration);
    }

    // Scroll element into view if in sidebar
    scrollToElement(element, isInSidebar) {
        if (isInSidebar) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // Add a CSS class temporarily and remove after duration
    addTemporaryClass(element, className, duration) {
        element.classList.add(className);
        setTimeout(() => {
            element.classList.remove(className);
        }, duration);
    }

    // Highlight a piece with visual feedback
    highlightPiece(piece, duration) {
        this.scrollToElement(piece.canvas, piece.isInSidebar);
        this.addTemporaryClass(piece.canvas, 'hint-highlight', duration);
    }

    // Show ghost preview at correct position
    showGhostPreview(piece, duration) {
        const ghost = document.createElement('canvas');
        ghost.width = this.pieceWidth;
        ghost.height = this.pieceHeight;
        ghost.className = 'hint-ghost';
        ghost.style.left = piece.correctX + 'px';
        ghost.style.top = piece.correctY + 'px';

        // Draw piece preview with overlay
        const ctx = ghost.getContext('2d');
        ctx.putImageData(piece.imageData, 0, 0);
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
        ctx.fillRect(0, 0, ghost.width, ghost.height);

        this.boardContainer.appendChild(ghost);

        setTimeout(() => {
            ghost.remove();
        }, duration);
    }
}
