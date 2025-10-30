/**
 * PuzzlePiece - Represents a single draggable puzzle piece
 */
class PuzzlePiece {
    constructor(id, row, col, imageData, canvas, correctX, correctY) {
        this.id = id;
        this.row = row;
        this.col = col;
        this.imageData = imageData; // Canvas image data for this piece
        this.canvas = canvas; // Individual canvas element for this piece
        this.correctX = correctX;
        this.correctY = correctY;
        this.currentX = 0;
        this.currentY = 0;
        this.isDragging = false;
        this.isPlaced = false;
        this.isInSidebar = true;
        this.zIndex = 1;

        this.dragStartX = 0;
        this.dragStartY = 0;

        this.setupCanvas();
        this.attachEventListeners();
    }

    setupCanvas() {
        // Don't set position here - will be set by placePiecesInSidebar or onDragStart
        this.canvas.style.cursor = 'grab';
        this.canvas.style.zIndex = this.zIndex;
        this.canvas.classList.add('puzzle-piece');

        console.log(`PuzzlePiece ${this.id} setupCanvas: canvas ${this.canvas.width}x${this.canvas.height}, imageData ${this.imageData.width}x${this.imageData.height}`);

        // Draw the piece image
        const ctx = this.canvas.getContext('2d');
        ctx.putImageData(this.imageData, 0, 0);

        console.log(`After putImageData: canvas ${this.canvas.width}x${this.canvas.height}`);
    }

    attachEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.onDragStart(e));
        document.addEventListener('mousemove', (e) => this.onDragMove(e));
        document.addEventListener('mouseup', (e) => this.onDragEnd(e));

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => this.onDragStart(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.onDragMove(e), { passive: false });
        document.addEventListener('touchend', (e) => this.onDragEnd(e));
    }

    onDragStart(e) {
        if (this.isPlaced) return;

        e.preventDefault();
        this.isDragging = true;
        this.canvas.style.cursor = 'grabbing';
        this.zIndex = 100;
        this.canvas.style.zIndex = this.zIndex;

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const rect = this.canvas.getBoundingClientRect();
        this.dragStartX = clientX - rect.left;
        this.dragStartY = clientY - rect.top;

        // If piece is in sidebar, move it to board container
        if (this.isInSidebar) {
            const boardContainer = document.getElementById('puzzle-board');
            this.canvas.style.position = 'absolute';
            this.canvas.style.margin = '0';

            // Position piece where it was clicked relative to board
            const boardRect = boardContainer.getBoundingClientRect();
            this.currentX = clientX - boardRect.left - this.dragStartX;
            this.currentY = clientY - boardRect.top - this.dragStartY;

            boardContainer.appendChild(this.canvas);
            this.updatePosition();
            this.isInSidebar = false;
        }
    }

    onDragMove(e) {
        if (!this.isDragging) return;

        e.preventDefault();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const container = this.canvas.parentElement;
        const containerRect = container.getBoundingClientRect();

        this.currentX = clientX - containerRect.left - this.dragStartX;
        this.currentY = clientY - containerRect.top - this.dragStartY;

        this.updatePosition();
    }

    onDragEnd(e) {
        if (!this.isDragging) return;

        this.isDragging = false;
        this.canvas.style.cursor = 'grab';
        this.zIndex = 1;
        this.canvas.style.zIndex = this.zIndex;

        // Fire custom event for snap detection
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
        this.canvas.remove();
    }
}
