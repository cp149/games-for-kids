/**
 * DragInteractionHandler - Drag Event Callbacks
 * Handles visual feedback and game logic during drag operations
 *
 * Extracted from ColorMixGame to follow Single Responsibility Principle
 */

export class DragInteractionHandler {
    /**
     * @param {Object} options
     * @param {Object} options.ui - UIManager instance
     * @param {Object} options.audio - AudioManager instance
     * @param {Object} options.tutorial - TutorialSystem instance
     * @param {Function} options.checkIfColorHelpsGoal - Goal checking function
     * @param {Function} options.addColorToBowl - Add color to bowl function
     * @param {Function} options.startIdleHintTimer - Reset idle timer function
     * @param {Function} options.feedChameleon - Feed color to chameleon (remove from tray)
     */
    constructor(options = {}) {
        this.ui = options.ui || null;
        this.audio = options.audio || null;
        this.tutorial = options.tutorial || null;
        this.checkIfColorHelpsGoal = options.checkIfColorHelpsGoal || (() => false);
        this.addColorToBowl = options.addColorToBowl || (() => {});
        this.startIdleHintTimer = options.startIdleHintTimer || (() => {});
        this.feedChameleon = options.feedChameleon || null;
    }

    /**
     * Handle drag start event
     * @param {HTMLElement} element - Dragged element
     * @param {Object} data - Drag data with color info
     */
    onDragStart(element, data) {
        // Hide any firefly hints and reset timer
        if (this.ui) {
            this.ui.hideFireflyHint();
        }
        this.startIdleHintTimer();

        // Play musical note for the color (educational audio feedback)
        if (this.audio && data.color) {
            // First try musical note, fallback to pickup sound
            const CONFIG = window.CONFIG;
            const colorNote = CONFIG?.COLOR_NOTES?.[data.color];
            if (colorNote?.frequency) {
                this.audio.playTone(colorNote.frequency, 0.15);
            } else {
                this.audio.play(`pickup_${data.color}`);
            }
        }

        // Visual feedback
        element.style.cursor = 'grabbing';

        // Chameleon starts watching
        if (this.ui) {
            this.ui.setChameleonMood('watching');
        }

        // Stop tutorial when user starts interacting
        if (this.tutorial && this.tutorial.isRunning()) {
            this.tutorial.stop();
        }
    }

    /**
     * Handle drag move event
     * @param {HTMLElement} element - Dragged element
     * @param {Object} data - Drag data with position and color info
     */
    onDragMove(element, data) {
        if (!this.ui) return;

        // Eye tracking - chameleon watches the dragged color
        this.ui.updateEyeTracking(data.x, data.y);

        // Check if over bowl
        const bowl = this.ui.getBowl();
        if (!bowl) return;

        const rect = bowl.getBoundingClientRect();
        const isOverBowl = data.x >= rect.left && data.x <= rect.right &&
                          data.y >= rect.top && data.y <= rect.bottom;

        bowl.classList.toggle('drag-over', isOverBowl);

        // Emotional feedback: eager if color could help reach goal
        if (isOverBowl && data.data?.color) {
            const wouldHelp = this.checkIfColorHelpsGoal(data.data.color);
            if (wouldHelp) {
                this.ui.setChameleonMood('eager');
            }
        }
    }

    /**
     * Handle drag end event
     * @param {HTMLElement} element - Dragged element
     * @param {Object} data - Drag data with final position and color info
     * @returns {boolean} True if dropped on valid target
     */
    onDragEnd(element, data) {
        // Remove cursor style
        element.style.cursor = '';

        // Reset chameleon to neutral
        if (this.ui) {
            this.ui.setChameleonMood('neutral');
        }

        // Remove drag-over highlight
        const bowl = this.ui?.getBowl();
        if (bowl) {
            bowl.classList.remove('drag-over');
        }

        // Check if dropped on chameleon (to remove/feed)
        const chameleon = this.ui?.getChameleon?.();
        if (chameleon && data.data?.isMixedColor) {
            const chameleonRect = chameleon.getBoundingClientRect();
            const isOverChameleon = data.x >= chameleonRect.left && data.x <= chameleonRect.right &&
                                   data.y >= chameleonRect.top && data.y <= chameleonRect.bottom;
            
            if (isOverChameleon && this.feedChameleon) {
                this.feedChameleon(element, data.data);
                return true;
            }
        }

        // Check if dropped on bowl
        if (bowl && data.data?.color) {
            const rect = bowl.getBoundingClientRect();
            const isOverBowl = data.x >= rect.left && data.x <= rect.right &&
                              data.y >= rect.top && data.y <= rect.bottom;

            if (isOverBowl) {
                // Trigger bowl jelly impact animation
                if (this.ui?.triggerBowlJelly) {
                    this.ui.triggerBowlJelly();
                }

                // Pass full data object for chain mixing support
                this.addColorToBowl(data.data.colorData || data.data.color);
                return true;
            }
        }

        return false;
    }

    /**
     * Cleanup resources
     */
    destroy() {
        this.ui = null;
        this.audio = null;
        this.tutorial = null;
        this.checkIfColorHelpsGoal = null;
        this.addColorToBowl = null;
        this.startIdleHintTimer = null;
    }
}

// Dual export pattern for browser and Node.js
if (typeof window !== 'undefined') {
    window.DragInteractionHandler = DragInteractionHandler;
}

export default DragInteractionHandler;
