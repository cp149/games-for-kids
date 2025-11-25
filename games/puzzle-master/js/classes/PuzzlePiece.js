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

        // Touch intent detection (to distinguish drag vs scroll)
        this.touchStartPos = null;
        this.dragThreshold = 10;  // Minimum movement to trigger drag

        // Bind event handlers once
        this.handleDragStart = this.onDragStart.bind(this);
        this.handleDragMove = this.onDragMove.bind(this);
        this.handleDragEnd = this.onDragEnd.bind(this);

        this.setupCanvas();
        this.attachEventListeners();
    }

    // Helper to extract client coordinates from mouse/touch events
    getClientCoordinates(e) {
        return {
            x: e.touches ? e.touches[0].clientX : e.clientX,
            y: e.touches ? e.touches[0].clientY : e.clientY
        };
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

        const { x: clientX, y: clientY } = this.getClientCoordinates(e);

        // Store touch start position for intent detection
        this.touchStartPos = { x: clientX, y: clientY };
        this.dragConfirmed = false;

        // Don't preventDefault immediately - allow scroll detection
        // Only for mouse events, prevent default immediately
        if (!e.touches) {
            e.preventDefault();
            this.startDrag(e, clientX, clientY);
        } else {
            // For touch, attach listeners but wait for movement threshold
            this.attachDragListeners();

            const rect = this.canvas.getBoundingClientRect();
            this.dragStartX = clientX - rect.left;
            this.dragStartY = clientY - rect.top;
            this.pendingDragRect = rect;
        }
    }

    // Actually start the drag operation
    startDrag(e, clientX, clientY) {
        this.isDragging = true;
        this.dragConfirmed = true;
        this.canvas.style.cursor = 'grabbing';
        this.zIndex = 9999;
        this.canvas.style.zIndex = this.zIndex;

        // Attach drag listeners dynamically (if not already attached for touch)
        if (!e.touches) {
            this.attachDragListeners();
        }

        const rect = this.pendingDragRect || this.canvas.getBoundingClientRect();
        this.dragStartX = clientX - rect.left;
        this.dragStartY = clientY - rect.top;

        this.boardContainer = document.getElementById('puzzle-board');
        if (this.isInSidebar) {
            this.isInSidebar = false;
        }

        // Use CSS transform for better performance (GPU accelerated)
        this.canvas.style.position = 'fixed';
        this.canvas.style.left = rect.left + 'px';
        this.canvas.style.top = rect.top + 'px';
        this.canvas.style.margin = '0';
        this.canvas.style.willChange = 'transform';
        this.canvas.style.transform = 'translate(0, 0)';
        this.initialLeft = rect.left;
        this.initialTop = rect.top;
        document.body.appendChild(this.canvas);
    }

    onDragMove(e) {
        const { x: clientX, y: clientY } = this.getClientCoordinates(e);

        // Touch intent detection - check if movement exceeds threshold
        if (this.touchStartPos && !this.dragConfirmed) {
            const dx = Math.abs(clientX - this.touchStartPos.x);
            const dy = Math.abs(clientY - this.touchStartPos.y);

            // If movement is below threshold, allow scrolling
            if (dx < this.dragThreshold && dy < this.dragThreshold) {
                return;  // Don't prevent scroll
            }

            // Movement exceeds threshold - start actual drag
            this.startDrag(e, clientX, clientY);
        }

        if (!this.isDragging) return;

        // Only preventDefault when actually dragging (not scrolling)
        if (e.cancelable) {
            e.preventDefault();
        }

        // Use transform for GPU-accelerated positioning
        if (this.canvas.style.position === 'fixed') {
            const translateX = clientX - this.dragStartX - this.initialLeft;
            const translateY = clientY - this.dragStartY - this.initialTop;
            this.canvas.style.transform = `translate(${translateX}px, ${translateY}px)`;
        } else {
            const container = this.canvas.parentElement;
            const containerRect = container.getBoundingClientRect();

            this.currentX = clientX - containerRect.left - this.dragStartX;
            this.currentY = clientY - containerRect.top - this.dragStartY;

            this.updatePosition();
        }
    }

    onDragEnd(e) {
        // Reset touch tracking
        this.touchStartPos = null;
        this.pendingDragRect = null;

        // Remove drag listeners immediately
        this.removeDragListeners();

        // If drag was never confirmed (touch didn't exceed threshold), just cleanup
        if (!this.dragConfirmed) {
            return;
        }

        // IMPORTANT: Get rect BEFORE resetting transform (transform affects getBoundingClientRect)
        const rect = this.canvas.getBoundingClientRect();
        const boardRect = this.boardContainer.getBoundingClientRect();

        this.isDragging = false;
        this.dragConfirmed = false;
        this.canvas.style.cursor = 'grab';
        this.zIndex = 1;
        this.canvas.style.zIndex = this.zIndex;
        this.canvas.style.willChange = 'auto';
        this.canvas.style.transform = 'none';

        // Use piece center for more forgiving detection
        const pieceCenterX = rect.left + rect.width / 2;
        const pieceCenterY = rect.top + rect.height / 2;

        // Check if piece center is inside or near board (with margin)
        const margin = CONFIG.PIECE.DROP_MARGIN;
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
            // Note: Event listeners remain attached to canvas element
            // regardless of DOM position, no need to re-attach
        }
    }

    snapToCorrectPosition() {
        this.currentX = this.correctX;
        this.currentY = this.correctY;
        this.isPlaced = true;
        this.canvas.style.cursor = 'default';
        this.canvas.classList.add('placed');
        this.updatePosition();

        // Add brief glow effect then clear
        this.canvas.style.boxShadow = '0 0 20px rgba(76, 175, 80, 0.8)';
        setTimeout(() => {
            this.canvas.style.boxShadow = '';
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
