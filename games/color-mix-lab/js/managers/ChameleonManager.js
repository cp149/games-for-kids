/**
 * ChameleonManager - Chameleon Character System
 * Handles chameleon animations, eye tracking, moods, and color changes
 *
 * Extracted from UIManager to follow Single Responsibility Principle
 */

import CONFIG from '../config.js';

export class ChameleonManager {
    /**
     * @param {Object} options
     * @param {Object} options.elements - DOM element references
     * @param {Function} options.setTimeout - Safe setTimeout wrapper
     */
    constructor(options = {}) {
        this.elements = options.elements || {};
        this._setTimeout = options.setTimeout || ((fn, ms) => setTimeout(fn, ms));
        this.pupils = [];
        this.eyeTrackHandler = null;
    }

    /**
     * Update element references
     * @param {Object} elements - DOM element references
     */
    setElements(elements) {
        this.elements = elements;
    }

    /**
     * Create chameleon eyes with pupils for tracking
     */
    createChameleonEyes() {
        const eyesContainer = this.elements.chameleonEyes;
        if (!eyesContainer) return;

        // Clear existing content
        eyesContainer.innerHTML = '';

        // Create left eye
        const leftEye = document.createElement('div');
        leftEye.className = 'chameleon-eye';
        const leftPupil = document.createElement('div');
        leftPupil.className = 'chameleon-pupil';
        leftEye.appendChild(leftPupil);

        // Create right eye
        const rightEye = document.createElement('div');
        rightEye.className = 'chameleon-eye';
        const rightPupil = document.createElement('div');
        rightPupil.className = 'chameleon-pupil';
        rightEye.appendChild(rightPupil);

        eyesContainer.appendChild(leftEye);
        eyesContainer.appendChild(rightEye);

        // Store pupils for tracking
        this.pupils = [leftPupil, rightPupil];
    }

    /**
     * Start tracking cursor with eyes
     */
    startEyeTracking() {
        // Skip in non-browser environments (Node.js tests)
        if (typeof document === 'undefined' || typeof document.addEventListener !== 'function') {
            return;
        }

        // Create bound handler for cleanup
        this.eyeTrackHandler = (e) => {
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            this.updateEyePosition(clientX, clientY);
        };

        // Listen to mouse and touch events
        document.addEventListener('mousemove', this.eyeTrackHandler);
        document.addEventListener('touchmove', this.eyeTrackHandler, { passive: true });
    }

    /**
     * Update eye/pupil position based on cursor
     * @param {number} cursorX - Cursor X position
     * @param {number} cursorY - Cursor Y position
     */
    updateEyePosition(cursorX, cursorY) {
        if (!this.pupils || this.pupils.length === 0) return;

        this.pupils.forEach(pupil => {
            const eye = pupil.parentElement;
            if (!eye) return;

            const eyeRect = eye.getBoundingClientRect();
            const eyeCenterX = eyeRect.left + eyeRect.width / 2;
            const eyeCenterY = eyeRect.top + eyeRect.height / 2;

            // Calculate angle and distance to cursor
            const dx = cursorX - eyeCenterX;
            const dy = cursorY - eyeCenterY;
            const angle = Math.atan2(dy, dx);
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Max pupil movement (6px from center)
            const maxMove = 6;
            const moveDistance = Math.min(distance / 30, maxMove);

            // Calculate pupil offset
            const pupilX = Math.cos(angle) * moveDistance;
            const pupilY = Math.sin(angle) * moveDistance;

            // Apply transform (center pupil + offset)
            pupil.style.transform = `translate(calc(-50% + ${pupilX}px), calc(-50% + ${pupilY}px))`;
        });
    }

    /**
     * Update eye tracking to look at specific position
     * @param {number} x - Target X position
     * @param {number} y - Target Y position
     */
    updateEyeTracking(x, y) {
        if (!this.pupils || !this.elements.chameleon) return;

        const chameleonRect = this.elements.chameleon.getBoundingClientRect();
        const chameleonCenterX = chameleonRect.left + chameleonRect.width / 2;
        const chameleonCenterY = chameleonRect.top + chameleonRect.height / 2;

        // Calculate angle and distance
        const dx = x - chameleonCenterX;
        const dy = y - chameleonCenterY;
        const angle = Math.atan2(dy, dx);
        const distance = Math.min(Math.sqrt(dx * dx + dy * dy) / 100, 1);

        // Move pupils (max 6px offset)
        const maxOffset = 6;
        const offsetX = Math.cos(angle) * distance * maxOffset;
        const offsetY = Math.sin(angle) * distance * maxOffset;

        this.pupils.forEach(pupil => {
            pupil.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;
        });
    }

    /**
     * Reset eyes to center position
     */
    resetEyeTracking() {
        if (!this.pupils) return;
        this.pupils.forEach(pupil => {
            pupil.style.transform = 'translate(-50%, -50%)';
        });
    }

    /**
     * Set chameleon body color
     * @param {string} color - CSS color value
     */
    setChameleonColor(color) {
        if (this.elements.chameleonBody) {
            this.elements.chameleonBody.style.setProperty('--chameleon-color', color);
        }
        // Also set on parent chameleon for fallback
        if (this.elements.chameleon) {
            this.elements.chameleon.style.setProperty('--chameleon-color', color);
        }
    }

    /**
     * Set target color on leaf
     * @param {string} color - CSS color value
     */
    setChameleonTarget(color) {
        if (this.elements.targetLeaf) {
            if (color) {
                this.elements.targetLeaf.style.setProperty('--target-color', color);
            }
        }
    }

    /**
     * Set chameleon mood/animation
     * @param {string} mood - Mood name (happy, sad, eager, confused, watching, neutral)
     */
    setChameleonMood(mood) {
        const chameleon = this.elements.chameleon;
        if (!chameleon) return;

        // Remove all mood classes
        chameleon.classList.remove('celebrating', 'disgust', 'sad-wiggle', 'eager', 'confused', 'watching');

        switch (mood) {
            case 'happy':
                chameleon.classList.add('celebrating');
                this._setTimeout(() => {
                    chameleon.classList.remove('celebrating');
                }, CONFIG.UI.CELEBRATION_DURATION);
                break;

            case 'sad':
                chameleon.classList.add('sad-wiggle');
                chameleon.classList.add('disgust');
                this._setTimeout(() => {
                    chameleon.classList.remove('sad-wiggle');
                    chameleon.classList.remove('disgust');
                }, 800);
                break;

            case 'eager':
                chameleon.classList.add('eager');
                break;

            case 'confused':
                chameleon.classList.add('confused');
                this._setTimeout(() => {
                    chameleon.classList.remove('confused');
                }, 600);
                break;

            case 'watching':
                chameleon.classList.add('watching');
                break;

            case 'neutral':
            default:
                // Just remove all moods, return to default animation
                this.resetEyeTracking();
                break;
        }
    }

    /**
     * Cleanup resources
     */
    destroy() {
        // Remove event listeners
        if (this.eyeTrackHandler) {
            if (typeof document !== 'undefined') {
                document.removeEventListener('mousemove', this.eyeTrackHandler);
                document.removeEventListener('touchmove', this.eyeTrackHandler);
            }
            this.eyeTrackHandler = null;
        }

        this.pupils = [];
        this.elements = {};
    }
}

// Dual export pattern for browser and Node.js
if (typeof window !== 'undefined') {
    window.ChameleonManager = ChameleonManager;
}

export default ChameleonManager;
