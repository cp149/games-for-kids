/**
 * PuzzleBoard - Manages the puzzle board, pieces, and game logic
 */
class PuzzleBoard {
    constructor(container, image, difficulty = 3) {
        this.boardContainer = container;
        this.piecesContainer = null;
        this.image = image;
        this.difficulty = difficulty; // 2=Easy, 3=Medium, 4=Hard, 5=Expert
        this.pieces = [];
        this.pieceWidth = 0;
        this.pieceHeight = 0;
        this.boardWidth = 0;
        this.boardHeight = 0;
        this.snapDistance = 30;
        this.piecesPlaced = 0;
        this.onComplete = null;

        this.init();
    }

    init() {
        this.piecesContainer = document.getElementById('pieces-area');

        if (!this.piecesContainer) {
            console.error('pieces-area not found!');
            return;
        }

        this.boardContainer.innerHTML = '';
        this.piecesContainer.innerHTML = '';
        this.boardContainer.style.position = 'relative';

        // Wait for layout to complete before calculating size
        requestAnimationFrame(() => {
            this.calculateAndCreatePuzzle();
        });
    }

    calculateAndCreatePuzzle() {
        // Calculate board dimensions - use parent container size
        const parentContainer = this.boardContainer.parentElement;
        console.log('Parent container size:', parentContainer.clientWidth, 'x', parentContainer.clientHeight);

        // Use actual parent container size
        let containerWidth = parentContainer.clientWidth;
        let containerHeight = parentContainer.clientHeight;

        // If still 0, use window size as fallback
        if (!containerWidth || !containerHeight) {
            containerWidth = window.innerWidth * 0.6;
            containerHeight = window.innerHeight * 0.7;
        }

        console.log('Using container size:', containerWidth, 'x', containerHeight);

        // Use full container size with padding for borders and spacing
        const padding = 60; // Account for padding and borders
        const maxWidth = containerWidth - padding;
        const maxHeight = containerHeight - padding;

        console.log('Max size:', maxWidth, 'x', maxHeight);

        const imageAspect = this.image.width / this.image.height;

        // Calculate board size maintaining aspect ratio
        if (imageAspect > 1) {
            // Landscape image
            this.boardWidth = maxWidth;
            this.boardHeight = maxWidth / imageAspect;
            if (this.boardHeight > maxHeight) {
                this.boardHeight = maxHeight;
                this.boardWidth = maxHeight * imageAspect;
            }
        } else {
            // Portrait image
            this.boardHeight = maxHeight;
            this.boardWidth = maxHeight * imageAspect;
            if (this.boardWidth > maxWidth) {
                this.boardWidth = maxWidth;
                this.boardHeight = maxWidth / imageAspect;
            }
        }

        this.pieceWidth = this.boardWidth / this.difficulty;
        this.pieceHeight = this.boardHeight / this.difficulty;

        console.log('Board:', this.boardWidth, 'x', this.boardHeight);
        console.log('Piece:', this.pieceWidth, 'x', this.pieceHeight);
        console.log('Difficulty:', this.difficulty);

        this.boardContainer.style.width = this.boardWidth + 'px';
        this.boardContainer.style.height = this.boardHeight + 'px';

        this.createPieces();
        this.placePiecesInSidebar();
    }

    createPieces() {
        // Create temporary canvas to slice image
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

                console.log(`Getting imageData at (${x}, ${y}) size ${this.pieceWidth}x${this.pieceHeight}`);

                // Extract piece image data
                const pieceImageData = tempCtx.getImageData(
                    Math.floor(x), Math.floor(y),
                    Math.floor(this.pieceWidth), Math.floor(this.pieceHeight)
                );

                console.log(`Got imageData: ${pieceImageData.width}x${pieceImageData.height}`);

                // Create canvas for this piece
                const pieceCanvas = document.createElement('canvas');
                pieceCanvas.width = Math.floor(this.pieceWidth);
                pieceCanvas.height = Math.floor(this.pieceHeight);

                console.log(`Creating piece ${pieceId}: canvas ${pieceCanvas.width}x${pieceCanvas.height}, imageData ${pieceImageData.width}x${pieceImageData.height}`);

                // Create piece object
                const piece = new PuzzlePiece(
                    pieceId++,
                    row,
                    col,
                    pieceImageData,
                    pieceCanvas,
                    x,
                    y
                );

                // Listen for piece drop events
                pieceCanvas.addEventListener('pieceDropped', (e) => {
                    this.handlePieceDrop(e.detail.piece);
                });

                this.pieces.push(piece);
            }
        }
    }

    placePiecesInSidebar() {
        console.log('placePiecesInSidebar called, pieces count:', this.pieces.length);
        console.log('piecesContainer:', this.piecesContainer);

        // Shuffle pieces order
        const shuffledPieces = [...this.pieces];
        for (let i = shuffledPieces.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledPieces[i], shuffledPieces[j]] = [shuffledPieces[j], shuffledPieces[i]];
        }

        // Place pieces in sidebar
        shuffledPieces.forEach((piece, index) => {
            piece.canvas.style.position = 'relative';
            piece.canvas.style.left = '0';
            piece.canvas.style.top = '0';
            piece.canvas.style.margin = '10px auto';
            piece.canvas.style.display = 'block';
            piece.currentX = 0;
            piece.currentY = 0;
            piece.isInSidebar = true;

            console.log(`Adding piece ${index} to sidebar, canvas size:`, piece.canvas.width, 'x', piece.canvas.height);
            this.piecesContainer.appendChild(piece.canvas);
        });

        console.log('Sidebar children count:', this.piecesContainer.children.length);
    }

    handlePieceDrop(piece) {
        if (piece.isNearCorrectPosition(this.snapDistance)) {
            piece.snapToCorrectPosition();
            this.piecesPlaced++;

            // Play success sound
            this.playSound('success');

            // Check if puzzle is complete
            if (this.piecesPlaced === this.pieces.length) {
                this.onPuzzleComplete();
            }
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
        // Sound placeholder - can be implemented later
        if (type === 'success') {
            // Snap sound
        } else if (type === 'complete') {
            // Victory sound
        }
    }

    reset() {
        this.piecesPlaced = 0;
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
        // Find first unplaced piece
        const unplacedPiece = this.pieces.find(p => !p.isPlaced);
        if (unplacedPiece) {
            // Highlight the piece
            unplacedPiece.canvas.style.border = '3px solid yellow';
            unplacedPiece.canvas.style.boxShadow = '0 0 20px yellow';
            setTimeout(() => {
                unplacedPiece.canvas.style.border = '1px solid rgba(0, 0, 0, 0.1)';
                unplacedPiece.canvas.style.boxShadow = 'none';
            }, 2000);

            // Show ghost image at correct position on board
            const ghost = document.createElement('div');
            ghost.style.position = 'absolute';
            ghost.style.left = unplacedPiece.correctX + 'px';
            ghost.style.top = unplacedPiece.correctY + 'px';
            ghost.style.width = this.pieceWidth + 'px';
            ghost.style.height = this.pieceHeight + 'px';
            ghost.style.border = '3px dashed yellow';
            ghost.style.backgroundColor = 'rgba(255, 255, 0, 0.2)';
            ghost.style.pointerEvents = 'none';
            ghost.classList.add('hint-ghost');

            this.boardContainer.appendChild(ghost);
            setTimeout(() => {
                ghost.remove();
            }, 2000);
        }
    }
}
