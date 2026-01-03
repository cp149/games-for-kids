/**
 * DragManager - Unified touch/mouse drag handling
 */

class DragManager {
  constructor(options = {}) {
    this.threshold = options.threshold || 10;
    this.onDragStart = options.onDragStart || (() => {});
    this.onDragMove = options.onDragMove || (() => {});
    this.onDragEnd = options.onDragEnd || (() => {});
    this.onDrop = options.onDrop || (() => {});

    this.isDragging = false;
    this.dragElement = null;
    this.startPos = { x: 0, y: 0 };
    this.currentPos = { x: 0, y: 0 };
    this.dropTargets = [];

    this._boundMove = this._onMove.bind(this);
    this._boundEnd = this._onEnd.bind(this);
  }

  /**
   * Make an element draggable
   * @param {HTMLElement} element
   * @param {*} data - Data to pass on drop
   */
  makeDraggable(element, data) {
    element.dataset.draggable = 'true';
    element._dragData = data;

    const startHandler = (e) => this._onStart(e, element);
    element.addEventListener('mousedown', startHandler);
    element.addEventListener('touchstart', startHandler, { passive: false });
    element._dragCleanup = () => {
      element.removeEventListener('mousedown', startHandler);
      element.removeEventListener('touchstart', startHandler);
    };
  }

  /**
   * Register a drop target
   * @param {HTMLElement} element
   * @param {Function} onDrop - Callback when dropped
   */
  addDropTarget(element, onDrop) {
    this.dropTargets.push({ element, onDrop });
  }

  _getPos(e) {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }

  _onStart(e, element) {
    e.preventDefault();
    this.startPos = this._getPos(e);
    this.currentPos = { ...this.startPos };
    this.dragElement = element;

    document.addEventListener('mousemove', this._boundMove);
    document.addEventListener('mouseup', this._boundEnd);
    document.addEventListener('touchmove', this._boundMove, { passive: false });
    document.addEventListener('touchend', this._boundEnd);
  }

  _onMove(e) {
    e.preventDefault();
    this.currentPos = this._getPos(e);

    const dx = this.currentPos.x - this.startPos.x;
    const dy = this.currentPos.y - this.startPos.y;

    if (!this.isDragging && Math.hypot(dx, dy) > this.threshold) {
      this.isDragging = true;
      this.onDragStart(this.dragElement, this.dragElement._dragData);
    }

    if (this.isDragging) {
      this.onDragMove(this.currentPos, this.dragElement._dragData);
    }
  }

  _onEnd(e) {
    document.removeEventListener('mousemove', this._boundMove);
    document.removeEventListener('mouseup', this._boundEnd);
    document.removeEventListener('touchmove', this._boundMove);
    document.removeEventListener('touchend', this._boundEnd);

    if (this.isDragging) {
      const dropTarget = this._findDropTarget(this.currentPos);
      if (dropTarget) {
        dropTarget.onDrop(this.dragElement._dragData);
        this.onDrop(this.dragElement._dragData, dropTarget.element);
      }
      this.onDragEnd(this.dragElement._dragData);
    }

    this.isDragging = false;
    this.dragElement = null;
  }

  _findDropTarget(pos) {
    for (const target of this.dropTargets) {
      const rect = target.element.getBoundingClientRect();
      if (pos.x >= rect.left && pos.x <= rect.right &&
          pos.y >= rect.top && pos.y <= rect.bottom) {
        return target;
      }
    }
    return null;
  }

  destroy() {
    document.querySelectorAll('[data-draggable]').forEach((el) => {
      if (el._dragCleanup) el._dragCleanup();
    });
    this.dropTargets = [];
  }
}

// Dual export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DragManager };
}
if (typeof window !== 'undefined') {
  window.DragManager = DragManager;
}
