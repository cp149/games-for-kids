/**
 * PuzzlePiece - Represents a single draggable puzzle piece
 */
class PuzzlePiece {
    constructor(id, row, col, imageData, canvas, correctX, correctY) {
        this.id = id;
        this.row = row;
        this.col = col;
        this.imageData = imageData;
        this.canvas = canvas;
        this.correctX = correctX;
        this.correctY = correctY;
        this.currentX = 0;
        this.currentY = 0;
        this.isDragging = false;
        this.isPlaced = false;
        this.isInSidebar = true;
        this.zIndex = 1;
        this.boardContainer = null;

        this.dragStartX = 0;
        this.dragStartY = 0;

        // Bind event handlers once
        this.handleDragStart = this.onDragStart.bind(this);
        this.handleDragMove = this.onDragMove.bind(this);
        this.handleDragEnd = this.onDragEnd.bind(this);

        this.setupCanvas();
        this.attachEventListeners();
    }

    setupCanvas() {
        this.canvas.style.cursor = 'grab';
        this.canvas.style.zIndex = this.zIndex;
        this.canvas.classList.add('puzzle-piece');

        const ctx = this.canvas.getContext('2d');
        ctx.putImageData(this.imageData, 0, 0);
    }

    attachEventListeners() {
        // Only attach canvas-specific mousedown/touchstart
        // Move and end events will be attached dynamically during drag
        this.canvas.addEventListener('mousedown', this.handleDragStart);
        this.canvas.addEventListener('touchstart', this.handleDragStart, { passive: false });
    }

    removeEventListeners() {
        this.canvas.removeEventListener('mousedown', this.handleDragStart);
        this.canvas.removeEventListener('touchstart', this.handleDragStart);
        this.removeDragListeners();
    }

    attachDragListeners() {
        document.addEventListener('mousemove', this.handleDragMove);
        document.addEventListener('mouseup', this.handleDragEnd);
        document.addEventListener('touchmove', this.handleDragMove, { passive: false });
        document.addEventListener('touchend', this.handleDragEnd);
    }

    removeDragListeners() {
        document.removeEventListener('mousemove', this.handleDragMove);
        document.removeEventListener('mouseup', this.handleDragEnd);
        document.removeEventListener('touchmove', this.handleDragMove);
        document.removeEventListener('touchend', this.handleDragEnd);
    }

    onDragStart(e) {
        if (this.isPlaced) return;

        e.preventDefault();
        this.isDragging = true;
        this.canvas.style.cursor = 'grabbing';
        this.zIndex = 9999;
        this.canvas.style.zIndex = this.zIndex;

        // Attach drag listeners dynamically
        this.attachDragListeners();

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const rect = this.canvas.getBoundingClientRect();
        this.dragStartX = clientX - rect.left;
        this.dragStartY = clientY - rect.top;

        this.boardContainer = document.getElementById('puzzle-board');
        if (this.isInSidebar) {
            this.isInSidebar = false;
        }

        // Use CSS transform for better performance
        this.canvas.style.position = 'fixed';
        this.canvas.style.left = rect.left + 'px';
        this.canvas.style.top = rect.top + 'px';
        this.canvas.style.margin = '0';
        this.canvas.style.willChange = 'transform';
        document.body.appendChild(this.canvas);
    }

    onDragMove(e) {
        if (!this.isDragging) return;

        e.preventDefault();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        // If using fixed position (during drag), position directly
        if (this.canvas.style.position === 'fixed') {
            this.canvas.style.left = (clientX - this.dragStartX) + 'px';
            this.canvas.style.top = (clientY - this.dragStartY) + 'px';
        } else {
            const container = this.canvas.parentElement;
            const containerRect = container.getBoundingClientRect();

            this.currentX = clientX - containerRect.left - this.dragStartX;
            this.currentY = clientY - containerRect.top - this.dragStartY;

            this.updatePosition();
        }
    }

    onDragEnd(e) {
        if (!this.isDragging) return;

        this.isDragging = false;
        this.canvas.style.cursor = 'grab';
        this.zIndex = 1;
        this.canvas.style.zIndex = this.zIndex;
        this.canvas.style.willChange = 'auto';

        // Remove drag listeners immediately
        this.removeDragListeners();

        const rect = this.canvas.getBoundingClientRect();
        const boardRect = this.boardContainer.getBoundingClientRect();

        // Use piece center for more forgiving detection
        const pieceCenterX = rect.left + rect.width / 2;
        const pieceCenterY = rect.top + rect.height / 2;

        // Check if piece center is inside or near board (with margin)
        const margin = 50; // Allow some overflow
        const isNearBoard = (
            pieceCenterX >= boardRect.left - margin &&
            pieceCenterX <= boardRect.right + margin &&
            pieceCenterY >= boardRect.top - margin &&
            pieceCenterY <= boardRect.bottom + margin
        );

        if (isNearBoard && this.boardContainer) {
            // Calculate position relative to board
            this.currentX = rect.left - boardRect.left;
            this.currentY = rect.top - boardRect.top;

            // Clamp to board bounds
            this.currentX = Math.max(0, Math.min(this.currentX, boardRect.width - rect.width));
            this.currentY = Math.max(0, Math.min(this.currentY, boardRect.height - rect.height));

            this.canvas.style.position = 'absolute';
            this.boardContainer.appendChild(this.canvas);
            this.updatePosition();
        } else {
            this.returnToSidebar();
        }

        const event = new CustomEvent('pieceDropped', {
            detail: { piece: this }
        });
        this.canvas.dispatchEvent(event);
    }

    updatePosition() {
        this.canvas.style.left = this.currentX + 'px';
        this.canvas.style.top = this.currentY + 'px';
    }

    moveTo(x, y) {
        this.currentX = x;
        this.currentY = y;
        this.updatePosition();
    }

    returnToSidebar() {
        // Return piece to sidebar
        const piecesArea = document.getElementById('pieces-area');
        if (piecesArea) {
            // Reset all drag-related styles
            this.canvas.style.position = 'relative';
            this.canvas.style.left = 'auto';
            this.canvas.style.top = 'auto';
            this.canvas.style.margin = '10px auto';
            this.canvas.style.transform = 'none';
            this.canvas.style.pointerEvents = 'auto';
            this.canvas.style.cursor = 'grab';

            piecesArea.appendChild(this.canvas);
            this.isInSidebar = true;
            this.isDragging = false;

            // Ensure event listeners are attached
            this.canvas.removeEventListener('mousedown', this.handleDragStart);
            this.canvas.removeEventListener('touchstart', this.handleDragStart);
            this.canvas.addEventListener('mousedown', this.handleDragStart);
            this.canvas.addEventListener('touchstart', this.handleDragStart, { passive: false });
        }
    }

    snapToCorrectPosition() {
        this.currentX = this.correctX;
        this.currentY = this.correctY;
        this.isPlaced = true;
        this.canvas.style.cursor = 'default';
        this.canvas.classList.add('placed');
        this.updatePosition();

        // Add glow effect
        this.canvas.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.8)';
        setTimeout(() => {
            this.canvas.style.boxShadow = 'none';
        }, 500);
    }

    isNearCorrectPosition(snapDistance = 30) {
        const dx = Math.abs(this.currentX - this.correctX);
        const dy = Math.abs(this.currentY - this.correctY);
        return dx < snapDistance && dy < snapDistance;
    }

    destroy() {
        this.removeEventListeners();
        this.canvas.remove();
    }
}
