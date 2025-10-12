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
  }

  /**
   * Initialize drag and drop for library blocks
   * @param {HTMLElement} element - Block element in library
   * @param {MusicBlock} block - The music block
   */
  initLibraryBlock(element, block) {
    element.draggable = true;

    element.addEventListener('dragstart', (e) => {
      this.handleDragStart(e, block, element);
    });

    element.addEventListener('dragend', (e) => {
      this.handleDragEnd(e);
    });

    // Click to preview
    element.addEventListener('click', () => {
      this.gameEngine.previewBlock(block);
    });
  }

  /**
   * Initialize drag and drop for timeline blocks
   * @param {HTMLElement} element - Block element on timeline
   * @param {Object} placedBlock - Placed block data
   */
  initTimelineBlock(element, placedBlock) {
    element.draggable = true;

    element.addEventListener('dragstart', (e) => {
      this.handleTimelineDragStart(e, placedBlock, element);
    });

    element.addEventListener('dragend', (e) => {
      this.handleDragEnd(e);
    });
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

    // Remove from timeline temporarily
    this.gameEngine.removeBlockFromTimeline(
      placedBlock.trackName,
      placedBlock.id
    );
  }

  /**
   * Handle drag over timeline
   */
  handleDragOver(e, trackElement, trackName) {
    const rect = trackElement.getBoundingClientRect();
    const x = e.clientX - rect.left;

    // Calculate beat position
    const trackWidth = rect.width;
    const maxBeats = this.gameEngine.timeline.maxBeats;
    const beat = Math.floor((x / trackWidth) * maxBeats);

    this.dropTargetTrack = trackName;
    this.dropTargetBeat = this.gameEngine.timeline.snapToGrid(beat);

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

    // Try to add block
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
      // If failed and was from timeline, put it back
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

    // Remove drag over states
    document.querySelectorAll('.timeline-track').forEach(el => {
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
   * Create ghost preview element
   */
  createGhost(sourceElement) {
    this.ghostElement = sourceElement.cloneNode(true);
    this.ghostElement.classList.add('block-ghost');
    this.ghostElement.style.position = 'absolute';
    this.ghostElement.style.pointerEvents = 'none';
    this.ghostElement.style.opacity = '0.5';
    this.ghostElement.style.display = 'none';

    document.body.appendChild(this.ghostElement);
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
    if (this.ghostElement) {
      this.ghostElement.remove();
      this.ghostElement = null;
    }
  }
}
