/**
 * Drag Manager
 * Handles HTML5 drag and drop interactions
 */

class DragManager {
  constructor(game, config) {
    this.game = game;
    this.config = config;

    // Access managers from game instance
    this.cardDropManager = game.cardDropMgr;
    this.slotManager = game.slotMgr;

    // Drag state
    this.draggedCard = null;
    this.draggedElement = null;

    // Event listeners
    this.eventListeners = new Map();

    // Slot guidance system (set externally after initialization)
    this.slotGuidanceSystem = null;

    this.setupEventListeners();
  }

  /**
   * Setup drag & drop event listeners
   */
  setupEventListeners() {
    // Drop zone events (for reagent cards drop targets)
    const dropZone = document.getElementById('drop-zone');
    if (dropZone) {
      const dragoverHandler = this.handleDragOver.bind(this);
      const dropHandler = this.handleReagentCardDrop.bind(this);

      dropZone.addEventListener('dragover', dragoverHandler);
      dropZone.addEventListener('drop', dropHandler, true);

      this.eventListeners.set('dropzone-dragover', { element: dropZone, event: 'dragover', handler: dragoverHandler });
      this.eventListeners.set('dropzone-drop', { element: dropZone, event: 'drop', handler: dropHandler });
    }

    // Hand area events (for special cards)
    const handArea = document.getElementById('hand-area');
    if (handArea) {
      const dragstartHandler = this.handleSpecialCardDragStart.bind(this);
      const dragendHandler = this.handleDragEnd.bind(this);

      handArea.addEventListener('dragstart', dragstartHandler, true);
      handArea.addEventListener('dragend', dragendHandler, true);

      this.eventListeners.set('handarea-dragstart', { element: handArea, event: 'dragstart', handler: dragstartHandler });
      this.eventListeners.set('handarea-dragend', { element: handArea, event: 'dragend', handler: dragendHandler });
    }

    // Experiment slots events
    const slots = document.querySelectorAll('.experiment-slot');
    slots.forEach((slot, index) => {
      const dragoverHandler = this.handleSlotDragOver.bind(this);
      const dropHandler = this.handleSlotDrop.bind(this);
      const dragleaveHandler = this.handleSlotDragLeave.bind(this);
      const keydownHandler = this.handleSlotKeydown.bind(this);
      const clickHandler = this.handleSlotClick.bind(this);

      slot.addEventListener('dragover', dragoverHandler);
      slot.addEventListener('drop', dropHandler);
      slot.addEventListener('dragleave', dragleaveHandler);
      slot.addEventListener('keydown', keydownHandler);
      slot.addEventListener('click', clickHandler);

      this.eventListeners.set(`slot-${index}-dragover`, { element: slot, event: 'dragover', handler: dragoverHandler });
      this.eventListeners.set(`slot-${index}-drop`, { element: slot, event: 'drop', handler: dropHandler });
      this.eventListeners.set(`slot-${index}-dragleave`, { element: slot, event: 'dragleave', handler: dragleaveHandler });
      this.eventListeners.set(`slot-${index}-keydown`, { element: slot, event: 'keydown', handler: keydownHandler });
      this.eventListeners.set(`slot-${index}-click`, { element: slot, event: 'click', handler: clickHandler });
    });

    // Delegation for dynamically created cards
    if (dropZone) {
      const dragstartHandler = this.handleDragStart.bind(this);
      const dragendHandler = this.handleDragEnd.bind(this);

      dropZone.addEventListener('dragstart', dragstartHandler, true);
      dropZone.addEventListener('dragend', dragendHandler, true);

      this.eventListeners.set('dropzone-dragstart', { element: dropZone, event: 'dragstart', handler: dragstartHandler });
      this.eventListeners.set('dropzone-dragend', { element: dropZone, event: 'dragend', handler: dragendHandler });
    }

    // Global keyboard shortcuts
    const keyboardHandler = this.handleKeyboard.bind(this);
    document.addEventListener('keydown', keyboardHandler);
    this.eventListeners.set('document-keydown', { element: document, event: 'keydown', handler: keyboardHandler });
  }

  /**
   * Handle slot click (to remove card)
   */
  handleSlotClick(event) {
    const slot = event.currentTarget;
    const slotIndex = parseInt(slot.dataset.slot);
    
    // Delegate to Game instance
    this.game.discardSlotCard(slotIndex);
  }

  /**
   * Handle keyboard navigation for slots
   */
  handleSlotKeydown(event) {
    const slot = event.target;
    const slotIndex = parseInt(slot.dataset.slot);

    // Enter or Space to remove card from slot
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      
      // Delegate to Game instance
      this.game.discardSlotCard(slotIndex);
    }

    // Arrow keys for slot navigation
    const slots = document.querySelectorAll('.experiment-slot');
    if (event.key === 'ArrowRight' && slotIndex < slots.length - 1) {
      event.preventDefault();
      slots[slotIndex + 1].focus();
    } else if (event.key === 'ArrowLeft' && slotIndex > 0) {
      event.preventDefault();
      slots[slotIndex - 1].focus();
    }
  }

  /**
   * Handle global keyboard shortcuts
   */
  handleKeyboard(event) {
    // M key to trigger mix button
    if (event.key === 'm' || event.key === 'M') {
      const mixButton = document.getElementById('mix-button');
      if (mixButton && !mixButton.disabled) {
        mixButton.click();
      }
    }

    // Escape to pause (if pause functionality exists)
    if (event.key === 'Escape') {
      // Could trigger pause menu if implemented
    }
  }

  /**
   * Handle drag start (reagent cards)
   */
  handleDragStart(event) {
    const element = event.target;
    if (!element.classList.contains('reagent-card')) return;

    const cardId = element.dataset.cardId;
    this.draggedCard = this.cardDropManager.getCardById(cardId);
    this.draggedElement = element;
    this.draggedType = 'reagent';

    if (this.draggedCard) {
      this.draggedCard.setDragging(true);
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', cardId);
      event.dataTransfer.setData('cardType', 'reagent');

      // Activate slot guidance system
      if (this.slotGuidanceSystem) {
        this.slotGuidanceSystem.startDrag(this.draggedCard.type);
      }
    }
  }

  /**
   * Handle drag start (special cards)
   */
  handleSpecialCardDragStart(event) {
    const element = event.target;
    if (!element.classList.contains('special-card')) return;

    const cardId = element.dataset.cardId;
    this.draggedElement = element;
    this.draggedType = 'special';

    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', cardId);
    event.dataTransfer.setData('cardType', 'special');
  }

  /**
   * Handle drag end
   */
  handleDragEnd(event) {
    if (this.draggedCard) {
      this.draggedCard.setDragging(false);
    }

    // Deactivate slot guidance system
    if (this.slotGuidanceSystem) {
      this.slotGuidanceSystem.endDrag();
    }

    this.draggedCard = null;
    this.draggedElement = null;
    this.draggedType = null;

    // Remove all drag-over classes
    document.querySelectorAll('.experiment-slot').forEach(slot => {
      slot.classList.remove('drag-over');
    });
  }

  /**
   * Handle drag over drop zone
   */
  handleDragOver(event) {
    event.preventDefault();
  }

  /**
   * Handle drop on reagent card (for stabilizer)
   */
  handleReagentCardDrop(event) {
    // Check if dropping special card on reagent card
    const target = event.target;
    if (!target.classList.contains('reagent-card')) return;

    const cardType = event.dataTransfer.getData('cardType');
    if (cardType !== 'special') return;

    event.preventDefault();
    event.stopPropagation();

    const specialCardId = event.dataTransfer.getData('text/plain');
    const reagentCardId = target.dataset.cardId;

    // Trigger stabilizer drop event
    if (this.onStabilizerDroppedOnCard) {
      this.onStabilizerDroppedOnCard(specialCardId, reagentCardId);
    }
  }

  /**
   * Handle drag over slot
   */
  handleSlotDragOver(event) {
    event.preventDefault();
    const slot = event.currentTarget;

    // Update slot guidance system with cursor position
    if (this.slotGuidanceSystem && this.slotGuidanceSystem.isDraggingActive()) {
      this.slotGuidanceSystem.updateDragPosition(event.clientX, event.clientY);
    }

    // Check if slot is empty
    const slotIndex = parseInt(slot.dataset.slot);
    if (!this.slotManager.isSlotFilled(slotIndex)) {
      slot.classList.add('drag-over');
      event.dataTransfer.dropEffect = 'move';
    } else {
      event.dataTransfer.dropEffect = 'none';
    }
  }

  /**
   * Handle drag leave slot
   */
  handleSlotDragLeave(event) {
    const slot = event.currentTarget;
    slot.classList.remove('drag-over');
  }

  /**
   * Handle drop on slot
   */
  handleSlotDrop(event) {
    event.preventDefault();
    const slot = event.currentTarget;
    slot.classList.remove('drag-over');

    const cardId = event.dataTransfer.getData('text/plain');
    const cardType = event.dataTransfer.getData('cardType');

    if (cardType === 'reagent') {
      // Handle reagent card
      const card = this.cardDropManager.getCardById(cardId);

      if (card) {
        const slotIndex = parseInt(slot.dataset.slot);
        
        // Strictly check if slot is already filled before attempting to place
        if (this.slotManager.isSlotFilled(slotIndex)) {
          return;
        }

        // Try to place card in slot
        const success = this.slotManager.placeCardInSlot(card, slotIndex);

        if (success) {
          // Trigger slot change event
          if (this.onSlotChanged) {
            this.onSlotChanged();
          }
        }
      }
    } else if (cardType === 'special') {
      // Handle special card (catalyst)
      // Special cards go to catalyst slot (not handled by SlotManager)
      if (this.onSpecialCardDropped) {
        this.onSpecialCardDropped(cardId);
      }
    }
  }

  /**
   * Set slot guidance system
   * @param {SlotGuidanceSystem} guidanceSystem - Guidance system instance
   */
  setSlotGuidanceSystem(guidanceSystem) {
    this.slotGuidanceSystem = guidanceSystem;
  }

  /**
   * Clean up
   */
  destroy() {
    // Remove all event listeners
    this.eventListeners.forEach((data, key) => {
      const { element, event, handler } = data;
      element.removeEventListener(event, handler);
    });
    this.eventListeners.clear();

    // Clean up guidance system
    if (this.slotGuidanceSystem) {
      this.slotGuidanceSystem.destroy();
      this.slotGuidanceSystem = null;
    }
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.DragManager = DragManager;
}
