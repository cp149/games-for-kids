/**
 * DragManager - Handle drag and drop interactions
 * Supports both mouse and touch events with GPU-accelerated transforms
 */

import { CONFIG } from '../config.js';

export class DragManager {
    constructor(options = {}) {
        this.options = {
            threshold: CONFIG.DRAG.THRESHOLD,
            snapDistance: CONFIG.DRAG.SNAP_DISTANCE,
            onDragStart: options.onDragStart || (() => {}),
            onDragMove: options.onDragMove || (() => {}),
            onDragEnd: options.onDragEnd || (() => {})
        };

        this.dragState = {
            element: null,
            isDragging: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            offsetX: 0,
            offsetY: 0,
            originalParent: null,
            clone: null
        };

        this.eventListeners = new Map();
        this.lastMoveTime = 0;
        this.moveThrottle = 16; // ~60fps
        this.cachedSlots = null;
    }

    /**
     * Enable dragging for an element
     * @param {HTMLElement} element - Element to make draggable
     * @param {Object} data - Optional data to pass to callbacks
     */
    enableDrag(element, data = {}) {
        if (!element) return;

        element.style.cursor = 'grab';
        element.dataset.draggable = 'true';

        // Store data for callbacks
        element._dragData = data;

        // Mouse events
        const mouseDown = (e) => this.handleDragStart(e, element);
        element.addEventListener('mousedown', mouseDown);
        this.eventListeners.set(element, { mouseDown });

        // Touch events
        const touchStart = (e) => this.handleDragStart(e, element);
        element.addEventListener('touchstart', touchStart, { passive: false });
        this.eventListeners.set(element, {
            ...this.eventListeners.get(element),
            touchStart
        });

        // Keyboard accessibility
        const keyDown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.options.onDragStart(element, data);
            }
        };
        element.addEventListener('keydown', keyDown);
        this.eventListeners.set(element, {
            ...this.eventListeners.get(element),
            keyDown
        });
    }

    /**
     * Disable dragging for an element
     * @param {HTMLElement} element - Element to disable dragging
     */
    disableDrag(element) {
        if (!element) return;

        const listeners = this.eventListeners.get(element);
        if (listeners) {
            if (listeners.mouseDown) {
                element.removeEventListener('mousedown', listeners.mouseDown);
            }
            if (listeners.touchStart) {
                element.removeEventListener('touchstart', listeners.touchStart);
            }
            if (listeners.keyDown) {
                element.removeEventListener('keydown', listeners.keyDown);
            }
            this.eventListeners.delete(element);
        }

        element.style.cursor = '';
        delete element.dataset.draggable;
        delete element._dragData;
    }

    /**
     * Handle drag start
     * @param {Event} e - Mouse or touch event
     * @param {HTMLElement} element - Element being dragged
     */
    handleDragStart(e, element) {
        // Prevent if already dragging
        if (this.dragState.isDragging) return;

        // Find the actual draggable element (might be clicked on child)
        const draggable = element.closest('[data-draggable="true"]') || element;

        // Get touch or mouse coordinates
        const point = e.touches ? e.touches[0] : e;
        const rect = draggable.getBoundingClientRect();

        // Initialize drag state - use draggable element, not clicked child
        this.dragState.element = draggable;
        this.dragState.startX = point.clientX;
        this.dragState.startY = point.clientY;
        this.dragState.currentX = point.clientX;
        this.dragState.currentY = point.clientY;
        this.dragState.offsetX = point.clientX - rect.left;
        this.dragState.offsetY = point.clientY - rect.top;
        this.dragState.originalParent = draggable.parentElement;
        this.dragState.isDragging = false; // Will be set to true after threshold

        // Store original position for snap back
        this.dragState.originalRect = rect;

        // Attach global move and end listeners
        this.attachGlobalListeners();

        e.preventDefault();
    }

    /**
     * Handle drag move
     * @param {Event} e - Mouse or touch event
     */
    handleDragMove(e) {
        if (!this.dragState.element) return;

        const point = e.touches ? e.touches[0] : e;
        this.dragState.currentX = point.clientX;
        this.dragState.currentY = point.clientY;

        // Check if we've exceeded threshold to start dragging
        if (!this.dragState.isDragging) {
            const deltaX = Math.abs(point.clientX - this.dragState.startX);
            const deltaY = Math.abs(point.clientY - this.dragState.startY);

            if (deltaX > this.options.threshold || deltaY > this.options.threshold) {
                this.startDragging();
            } else {
                return; // Still within threshold
            }
        }

        // Throttle move updates to ~60fps
        const now = performance.now();
        if (now - this.lastMoveTime < this.moveThrottle) {
            e.preventDefault();
            return;
        }
        this.lastMoveTime = now;

        // Update position using GPU-accelerated transform
        const x = this.dragState.currentX - this.dragState.offsetX;
        const y = this.dragState.currentY - this.dragState.offsetY;

        if (this.dragState.clone) {
            this.dragState.clone.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        }

        // Reduced sparkle frequency (20% chance)
        if (this.dragState.element._dragData && this.dragState.element._dragData.color && Math.random() > 0.8) {
            const color = CONFIG.COLORS.PRIMARY[this.dragState.element._dragData.color];
            if (color) {
                this.createSparkle(this.dragState.currentX, this.dragState.currentY, color);
            }
        }

        // Notify callback
        this.options.onDragMove(this.dragState.element, {
            x: this.dragState.currentX,
            y: this.dragState.currentY,
            data: this.dragState.element._dragData
        });

        e.preventDefault();
    }

    /**
     * Create sparkle at position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {string} color - Sparkle color
     */
    createSparkle(x, y, color) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = (x - 6) + 'px';
        sparkle.style.top = (y - 6) + 'px';
        sparkle.style.background = `radial-gradient(circle, ${color} 0%, transparent 70%)`;
        sparkle.style.boxShadow = `0 0 8px ${color}`;
        document.body.appendChild(sparkle);

        // Remove after animation
        setTimeout(() => sparkle.remove(), 600);
    }

    /**
     * Start actual dragging (after threshold)
     */
    startDragging() {
        this.dragState.isDragging = true;
        const element = this.dragState.element;

        // Add pickup squish effect to original (jelly physics)
        element.classList.add('pickup-squish');
        setTimeout(() => element.classList.remove('pickup-squish'), 250);

        // Create clone for dragging
        const clone = element.cloneNode(true);
        clone.className = element.className + ' dragging';
        clone.style.position = 'fixed';
        clone.style.pointerEvents = 'none';
        clone.style.zIndex = CONFIG ? 3000 : '3000';
        clone.style.left = '0';
        clone.style.top = '0';
        clone.style.width = this.dragState.originalRect.width + 'px';
        clone.style.height = this.dragState.originalRect.height + 'px';

        // CRITICAL FIX: Remove transition immediately to prevent "springy" lag
        clone.style.transition = 'none';
        clone.style.webkitTransition = 'none';

        // Start with pickup squish, then transition to jelly wobble
        clone.classList.remove('dragging');
        clone.classList.add('pickup-squish');
        setTimeout(() => {
            clone.classList.remove('pickup-squish');
            clone.classList.add('jelly-wobble');
        }, 250);

        // Set initial position
        const x = this.dragState.currentX - this.dragState.offsetX;
        const y = this.dragState.currentY - this.dragState.offsetY;
        clone.style.transform = `translate(${x}px, ${y}px)`;

        document.body.appendChild(clone);
        this.dragState.clone = clone;

        // Hide original
        element.style.opacity = '0.3';

        // Notify callback
        this.options.onDragStart(element, element._dragData || {});
    }

    /**
     * Handle drag end
     * @param {Event} e - Mouse or touch event
     */
    handleDragEnd(e) {
        if (!this.dragState.element) return;

        const element = this.dragState.element;

        if (this.dragState.isDragging) {
            // Find drop target
            const dropTarget = this.findDropTarget(
                this.dragState.currentX,
                this.dragState.currentY
            );

            // Notify callback
            const result = this.options.onDragEnd(element, {
                x: this.dragState.currentX,
                y: this.dragState.currentY,
                dropTarget,
                data: element._dragData || {}
            });

            // Animate based on drop result
            if (result && dropTarget) {
                // Successful drop - add drop bounce effect
                element.classList.add('drop-bounce');
                setTimeout(() => element.classList.remove('drop-bounce'), 500);
            } else {
                // Failed drop - snap back with jelly return
                element.classList.add('jelly-return');
                setTimeout(() => element.classList.remove('jelly-return'), 400);
                this.snapBack();
            }

            // Clean up clone
            if (this.dragState.clone) {
                this.dragState.clone.remove();
                this.dragState.clone = null;
            }

            // Restore original
            element.style.opacity = '';
        }

        // Reset state
        this.dragState = {
            element: null,
            isDragging: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            offsetX: 0,
            offsetY: 0,
            originalParent: null,
            clone: null
        };

        // Remove global listeners
        this.removeGlobalListeners();

        e.preventDefault();
    }

    /**
     * Find valid drop target at coordinates using geometry-based detection
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    findDropTarget(x, y) {
        // Check bowl first (primary drop target)
        const bowl = document.querySelector('.bowl');
        if (bowl) {
            const rect = bowl.getBoundingClientRect();
            if (x >= rect.left && x <= rect.right &&
                y >= rect.top && y <= rect.bottom) {
                return bowl;
            }
        }

        // Check mixing slots as fallback
        const slots = document.querySelectorAll('.mixing-slot');
        for (const slot of slots) {
            const rect = slot.getBoundingClientRect();
            if (x >= rect.left && x <= rect.right &&
                y >= rect.top && y <= rect.bottom) {
                return slot;
            }
        }

        return null;
    }

    /**
     * Snap element back to original position
     */
    snapBack() {
        if (!this.dragState.clone) return;

        // Animate back to original position
        const clone = this.dragState.clone;
        const rect = this.dragState.originalRect;

        clone.style.transition = 'transform 0.3s ease-out';
        clone.style.transform = `translate(${rect.left}px, ${rect.top}px)`;

        setTimeout(() => {
            clone.remove();
            this.dragState.clone = null;
        }, 300);
    }

    /**
     * Attach global move and end listeners
     */
    attachGlobalListeners() {
        this.globalMove = (e) => this.handleDragMove(e);
        this.globalEnd = (e) => this.handleDragEnd(e);

        document.addEventListener('mousemove', this.globalMove);
        document.addEventListener('mouseup', this.globalEnd);
        document.addEventListener('touchmove', this.globalMove, { passive: false });
        document.addEventListener('touchend', this.globalEnd);
        document.addEventListener('touchcancel', this.globalEnd);
    }

    /**
     * Remove global move and end listeners
     */
    removeGlobalListeners() {
        if (this.globalMove) {
            document.removeEventListener('mousemove', this.globalMove);
            document.removeEventListener('touchmove', this.globalMove);
            this.globalMove = null;
        }

        if (this.globalEnd) {
            document.removeEventListener('mouseup', this.globalEnd);
            document.removeEventListener('touchend', this.globalEnd);
            document.removeEventListener('touchcancel', this.globalEnd);
            this.globalEnd = null;
        }
    }

    /**
     * Clean up all resources
     */
    destroy() {
        // Disable all draggable elements
        if (this.eventListeners) {
            this.eventListeners.forEach((listeners, element) => {
                this.disableDrag(element);
            });
            this.eventListeners.clear();
            this.eventListeners = null;
        }

        // Remove global listeners
        this.removeGlobalListeners();

        // Clean up clone if exists
        if (this.dragState && this.dragState.clone) {
            this.dragState.clone.remove();
        }

        // Reset state
        this.dragState = null;
        this.options = null;
    }
}

export default DragManager;
