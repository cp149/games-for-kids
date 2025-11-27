/**
 * DragDropHandler - Manages drag and drop interactions
 */
export class DragDropHandler {
  constructor(gameEngine, uiCallbacks) {
    this.gameEngine = gameEngine;
    this.callbacks = uiCallbacks;

    this.draggedBlock = null;
    this.draggedElement = null;
    this.isDragging = false;
    this.ghostElement = null;
    this.dropTargetTrack = null;
    this.dropTargetBeat = 0;
    this.ghostTimeout = null;

    // Use WeakMap to track event listeners for cleanup
    this.attachedListeners = new WeakMap();

    // Throttle state for dragover events (performance optimization)
    this._lastDragOverTime = 0;
    this._dragOverThrottleMs = 32; // ~30fps is sufficient for drag feedback

    // Cache timeline track elements to avoid repeated querySelectorAll
    this.cachedTrackElements = null;
  }

  /**
   * Initialize drag and drop for library blocks
   * @param {HTMLElement} element - Block element in library
   * @param {MusicBlock} block - The music block
   */
  initLibraryBlock(element, block) {
    element.draggable = true;

    // Create named handlers for cleanup
    const handlers = {
      dragstart: (e) => this.handleDragStart(e, block, element),
      dragend: (e) => this.handleDragEnd(e)
    };

    element.addEventListener('dragstart', handlers.dragstart);
    element.addEventListener('dragend', handlers.dragend);

    // Store handlers for cleanup
    this.attachedListeners.set(element, handlers);
  }

  /**
   * Remove event listeners from library block
   * @param {HTMLElement} element
   */
  removeLibraryBlock(element) {
    const handlers = this.attachedListeners.get(element);
    if (handlers) {
      element.removeEventListener('dragstart', handlers.dragstart);
      element.removeEventListener('dragend', handlers.dragend);
      this.attachedListeners.delete(element);
    }
  }

  /**
   * Initialize drag and drop for timeline blocks
   * @param {HTMLElement} element - Block element on timeline
   * @param {Object} placedBlock - Placed block data
   */
  initTimelineBlock(element, placedBlock) {
    element.draggable = true;

    // Create named handlers for cleanup
    const handlers = {
      dragstart: (e) => this.handleTimelineDragStart(e, placedBlock, element),
      dragend: (e) => this.handleDragEnd(e)
    };

    element.addEventListener('dragstart', handlers.dragstart);
    element.addEventListener('dragend', handlers.dragend);

    // Store handlers for cleanup
    this.attachedListeners.set(element, handlers);
  }

  /**
   * Remove event listeners from timeline block
   * @param {HTMLElement} element
   */
  removeTimelineBlock(element) {
    const handlers = this.attachedListeners.get(element);
    if (handlers) {
      element.removeEventListener('dragstart', handlers.dragstart);
      element.removeEventListener('dragend', handlers.dragend);
      this.attachedListeners.delete(element);
    }
  }

  /**
   * Initialize timeline track as drop target
   * @param {HTMLElement} trackElement
   * @param {string} trackName
   */
  initDropTarget(trackElement, trackName) {
    trackElement.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.handleDragOver(e, trackElement, trackName);
    });

    trackElement.addEventListener('dragleave', (e) => {
      this.handleDragLeave(e, trackElement);
    });

    trackElement.addEventListener('drop', (e) => {
      e.preventDefault();
      this.handleDrop(e, trackName);
    });

    // Invalidate cache when new track elements are initialized
    this.cachedTrackElements = null;
  }

  /**
   * Handle drag start from library
   */
  handleDragStart(e, block, element) {
    this.draggedBlock = block;
    this.draggedElement = element;
    this.isDragging = true;

    element.style.opacity = '0.5';

    // Set drag data
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', block.id);

    // Create ghost image
    this.createGhost(element);
  }

  /**
   * Handle drag start from timeline (move existing block)
   */
  handleTimelineDragStart(e, placedBlock, element) {
    this.draggedPlacedBlock = placedBlock;
    this.draggedElement = element;
    this.isDragging = true;

    element.style.opacity = '0.5';

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', placedBlock.id);

    // Mark block as being dragged instead of removing
    // This prevents data loss if user refreshes/closes during drag
    placedBlock.isDragging = true;
  }

  /**
   * Handle drag over timeline (throttled for performance)
   */
  handleDragOver(e, trackElement, trackName) {
    // Throttle: skip processing if called too frequently
    const now = performance.now();
    if (now - this._lastDragOverTime < this._dragOverThrottleMs) {
      return;
    }
    this._lastDragOverTime = now;

    const rect = trackElement.getBoundingClientRect();
    const x = e.clientX - rect.left;

    // Calculate beat position
    const trackWidth = rect.width;
    const maxBeats = this.gameEngine.timeline.maxBeats;
    const beat = Math.floor((x / trackWidth) * maxBeats);
    const snappedBeat = this.gameEngine.timeline.snapToGrid(beat);

    // Skip update if beat position hasn't changed
    if (this.dropTargetTrack === trackName && this.dropTargetBeat === snappedBeat) {
      return;
    }

    this.dropTargetTrack = trackName;
    this.dropTargetBeat = snappedBeat;

    // Visual feedback
    trackElement.classList.add('drag-over');

    // Show ghost preview if we have a block being dragged
    if (this.draggedBlock || this.draggedPlacedBlock) {
      this.updateGhostPosition(trackElement, this.dropTargetBeat);
    }
  }

  /**
   * Handle drag leave
   */
  handleDragLeave(e, trackElement) {
    trackElement.classList.remove('drag-over');
  }

  /**
   * Handle drop on timeline
   */
  handleDrop(e, trackName) {
    const block = this.draggedBlock || this.draggedPlacedBlock?.block;

    if (!block) return;

    // If moving existing block, remove it from old position first
    if (this.draggedPlacedBlock) {
      delete this.draggedPlacedBlock.isDragging;
      this.gameEngine.removeBlockFromTimeline(
        this.draggedPlacedBlock.trackName,
        this.draggedPlacedBlock.id
      );
    }

    // Try to add block at new position
    const success = this.gameEngine.addBlockToTimeline(
      trackName,
      block,
      this.dropTargetBeat
    );

    if (success) {
      // Update UI
      if (this.callbacks.onBlockPlaced) {
        this.callbacks.onBlockPlaced(trackName, this.dropTargetBeat);
      }
    } else {
      // If failed and was from timeline, restore to original position
      if (this.draggedPlacedBlock) {
        this.gameEngine.addBlockToTimeline(
          this.draggedPlacedBlock.trackName,
          this.draggedPlacedBlock.block,
          this.draggedPlacedBlock.startBeat
        );
      }

      // Show error feedback
      if (this.callbacks.onDropFailed) {
        this.callbacks.onDropFailed();
      }
    }

    this.handleDragEnd(e);
  }

  /**
   * Handle drag end
   */
  handleDragEnd(e) {
    if (this.draggedElement) {
      this.draggedElement.style.opacity = '1';
    }

    // If drag was cancelled and block was marked as dragging, restore it
    if (this.draggedPlacedBlock && this.draggedPlacedBlock.isDragging) {
      delete this.draggedPlacedBlock.isDragging;
      // Block still exists in timeline, just remove the flag
    }

    // Remove drag over states using cached elements
    this.getTrackElements().forEach(el => {
      el.classList.remove('drag-over');
    });

    // Remove ghost
    this.removeGhost();

    this.draggedBlock = null;
    this.draggedPlacedBlock = null;
    this.draggedElement = null;
    this.isDragging = false;
    this.dropTargetTrack = null;
  }

  /**
   * Get cached track elements (avoids repeated querySelectorAll)
   * @returns {Array<Element>}
   */
  getTrackElements() {
    if (!this.cachedTrackElements) {
      this.cachedTrackElements = Array.from(
        document.querySelectorAll('.timeline-track')
      );
    }
    return this.cachedTrackElements;
  }

  /**
   * Create ghost preview element
   */
  createGhost(sourceElement) {
    // Clean up any existing ghost first
    this.removeGhost();

    this.ghostElement = sourceElement.cloneNode(true);
    this.ghostElement.classList.add('block-ghost');
    this.ghostElement.style.position = 'absolute';
    this.ghostElement.style.pointerEvents = 'none';
    this.ghostElement.style.opacity = '0.5';
    this.ghostElement.style.display = 'none';

    document.body.appendChild(this.ghostElement);

    // Safety timeout: auto-remove ghost after 5 seconds
    this.ghostTimeout = setTimeout(() => {
      this.removeGhost();
    }, 5000);
  }

  /**
   * Update ghost position on timeline
   */
  updateGhostPosition(trackElement, beat) {
    if (!this.ghostElement) return;

    const rect = trackElement.getBoundingClientRect();
    const beatWidth = rect.width / this.gameEngine.timeline.maxBeats;
    const left = rect.left + (beat * beatWidth);

    this.ghostElement.style.display = 'block';
    this.ghostElement.style.left = left + 'px';
    this.ghostElement.style.top = rect.top + 'px';
  }

  /**
   * Remove ghost element
   */
  removeGhost() {
    // Clear safety timeout
    if (this.ghostTimeout) {
      clearTimeout(this.ghostTimeout);
      this.ghostTimeout = null;
    }

    if (this.ghostElement) {
      // Ensure element is removed from DOM
      if (this.ghostElement.parentNode) {
        this.ghostElement.parentNode.removeChild(this.ghostElement);
      }
      this.ghostElement = null;
    }
  }
}
