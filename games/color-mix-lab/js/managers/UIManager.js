/**
 * UIManager - UI state management for existing DOM elements
 * Works with pre-built HTML structure from index.html
 * Juicy & Text-Free Edition - Icons only, minimal text
 */

import { CONFIG } from '../config.js';
import { getI18n } from '../i18n/index.js';

export class UIManager {
    constructor(containerId, i18n = null) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container element '${containerId}' not found`);
        }

        this.i18n = i18n || (typeof getI18n === 'function' ? getI18n() : null);
        this.elements = {};
        this.toastTimeout = null;
        this.init();
    }

    /**
     * Translate a key using i18n
     * @param {string} key - Translation key
     * @param {Object} params - Parameters for interpolation
     * @returns {string} Translated text or key
     */
    t(key, params = {}) {
        if (this.i18n) {
            return this.i18n.t(key, params);
        }
        return key;
    }

    /**
     * Initialize by querying existing DOM elements
     */
    init() {
        // Query existing elements from index.html
        this.elements = {
            // Header elements
            stickerBookBtn: this.container.querySelector('.sticker-book-btn'),
            settingsBtn: this.container.querySelector('.settings-btn'),
            soundBtn: this.container.querySelector('.sound-btn'),
            freePlayBtn: this.container.querySelector('.free-play-btn'),

            // Chameleon area
            targetLeaf: this.container.querySelector('.target-leaf'),
            chameleon: this.container.querySelector('.chameleon'),
            chameleonBody: this.container.querySelector('.chameleon-body'),
            chameleonEyes: this.container.querySelector('.chameleon-eyes'),
            progressStars: this.container.querySelector('.progress-stars'),
            stars: this.container.querySelectorAll('.progress-stars .star'),

            // Mixing area
            bowl: this.container.querySelector('.bowl'),
            liquid: this.container.querySelector('.liquid'),
            particles: this.container.querySelector('.particles'),
            undoBtn: this.container.querySelector('.undo-btn'),
            clearBtn: this.container.querySelector('.clear-btn'),

            // Palette area
            paletteArea: this.container.querySelector('.palette-area'),
            colorSources: this.container.querySelectorAll('.color-source')
        };

        // Set initial states
        if (this.elements.clearBtn) {
            this.elements.clearBtn.disabled = true;
        }

        // Create chameleon eyes for tracking
        this.createChameleonEyes();

        // Start eye tracking (follows cursor/touch)
        this.startEyeTracking();
    }


    /**
     * Create chameleon eyes for tracking
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
     * Start tracking cursor/touch for eye movement
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
     * Update pupil positions based on cursor location
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
     * Update eye tracking to follow a position
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
     * Reset eye tracking to center
     */
    resetEyeTracking() {
        if (!this.pupils) return;
        this.pupils.forEach(pupil => {
            pupil.style.transform = 'translate(-50%, -50%)';
        });
    }

    /**
     * Get color sources for drag setup
     * @returns {NodeList} Color source elements
     */
    getColorSources() {
        return this.elements.colorSources;
    }

    /**
     * Set available colors for current level
     * @param {string[]} availableColors - Array of color names (e.g., ['red', 'yellow'])
     */
    setAvailableColors(availableColors) {
        if (!this.elements.colorSources) return;

        this.elements.colorSources.forEach(source => {
            const color = source.dataset.color;
            if (availableColors.includes(color)) {
                source.classList.remove('hidden');
                source.setAttribute('aria-hidden', 'false');
                source.setAttribute('tabindex', '0');
            } else {
                source.classList.add('hidden');
                source.setAttribute('aria-hidden', 'true');
                source.setAttribute('tabindex', '-1');
            }
        });
    }

    /**
     * Get bowl element for drop target
     * @returns {HTMLElement} Bowl element
     */
    getBowl() {
        return this.elements.bowl;
    }

    /**
     * Update level display (using stars)
     * @param {number} level - Current level
     */
    updateLevel(level) {
        // Update aria label for accessibility
        if (this.elements.progressStars) {
            this.elements.progressStars.setAttribute('aria-label', this.t('level', { '0': level }));
        }
    }

    /**
     * Update goal display - Visual stars
     * @param {number} current - Current progress
     * @param {number} total - Total goal
     */
    updateGoal(current, total) {
        const stars = this.elements.stars;
        if (!stars || stars.length === 0) return;

        stars.forEach((star, index) => {
            if (index < current) {
                star.classList.add('filled');
                star.textContent = '⭐';
            } else {
                star.classList.remove('filled');
                star.textContent = '☆';
            }
        });

        if (this.elements.progressStars) {
            this.elements.progressStars.setAttribute('aria-label',
                this.t('goal_progress', { '0': current, '1': total }));
        }
    }

    /**
     * Set chameleon body color
     * @param {string} color - Color hex code
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
     * Set goal color in thought bubble
     * @param {string|null} color - Color hex code or null to hide
     */
    setChameleonTarget(color) {
        // Set target color on the leaf (chameleon tries to camouflage)
        if (this.elements.targetLeaf) {
            if (color) {
                this.elements.targetLeaf.style.setProperty('--target-color', color);
            }
        }
    }

    /**
     * Set chameleon mood animation
     * @param {string} mood - Mood type (happy, sad, confused)
     */
    setChameleonMood(mood) {
        const chameleon = this.elements.chameleon;
        if (!chameleon) return;

        // Remove all mood classes
        chameleon.classList.remove('celebrating', 'disgust', 'sad-wiggle', 'eager', 'confused', 'watching');

        switch (mood) {
            case 'happy':
                chameleon.classList.add('celebrating');
                setTimeout(() => {
                    chameleon.classList.remove('celebrating');
                }, CONFIG.UI.CELEBRATION_DURATION);
                break;

            case 'sad':
                chameleon.classList.add('sad-wiggle');
                chameleon.classList.add('disgust');
                setTimeout(() => {
                    chameleon.classList.remove('sad-wiggle');
                    chameleon.classList.remove('disgust');
                }, 800);
                break;

            case 'eager':
                chameleon.classList.add('eager');
                break;

            case 'confused':
                chameleon.classList.add('confused');
                setTimeout(() => {
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
     * Update bowl liquid color
     * @param {string} color - Color hex code or null to clear
     */
    setBowlColor(color) {
        if (this.elements.liquid) {
            if (color) {
                this.elements.liquid.style.backgroundColor = color;
                this.elements.liquid.style.opacity = '1';
            } else {
                this.elements.liquid.style.backgroundColor = 'transparent';
                this.elements.liquid.style.opacity = '0';
            }
        }
    }

    /**
     * Show swirl effect in bowl during mixing
     * @param {string} color - The result color hex
     */
    showSwirlEffect(color) {
        if (!this.elements.bowl) return;

        // Create swirl element
        const swirl = document.createElement('div');
        swirl.className = 'swirl';
        swirl.style.color = color;

        // Add to bowl
        this.elements.bowl.appendChild(swirl);

        // Trigger animation
        requestAnimationFrame(() => {
            swirl.classList.add('active');
        });

        // Remove after animation
        setTimeout(() => {
            if (swirl.parentElement) {
                swirl.remove();
            }
        }, 900);
    }

    /**
     * Show firefly hint on a color source
     * @param {string} colorName - Color to highlight (red, blue, yellow)
     */
    showFireflyHint(colorName) {
        if (!this.elements.paletteArea) return;

        // Find the color source
        const colorSource = this.elements.paletteArea.querySelector(`.${colorName}-source`);
        if (!colorSource) return;

        // Check if already has hint
        if (colorSource.querySelector('.firefly-hint')) return;

        // Add hint-active class for pulse effect
        colorSource.classList.add('hint-active');

        // Create firefly container
        const fireflyHint = document.createElement('div');
        fireflyHint.className = 'firefly-hint';

        // Add 3 fireflies
        for (let i = 0; i < 3; i++) {
            const firefly = document.createElement('div');
            firefly.className = 'firefly';
            fireflyHint.appendChild(firefly);
        }

        // Position above the color source
        colorSource.appendChild(fireflyHint);

        // Store reference for cleanup
        this.activeFireflyHint = { element: fireflyHint, colorSource };
    }

    /**
     * Hide firefly hint
     */
    hideFireflyHint() {
        if (this.activeFireflyHint) {
            if (this.activeFireflyHint.element && this.activeFireflyHint.element.parentElement) {
                this.activeFireflyHint.element.remove();
            }
            if (this.activeFireflyHint.colorSource) {
                this.activeFireflyHint.colorSource.classList.remove('hint-active');
            }
            this.activeFireflyHint = null;
        }

        // Also remove any orphaned hints
        if (this.elements.paletteArea) {
            this.elements.paletteArea.querySelectorAll('.firefly-hint').forEach(h => h.remove());
            this.elements.paletteArea.querySelectorAll('.hint-active').forEach(el => {
                el.classList.remove('hint-active');
            });
        }
    }

    /**
     * Show the undo button
     */
    showUndoButton() {
        if (this.elements.undoBtn) {
            this.elements.undoBtn.classList.remove('hidden');
        }
    }

    /**
     * Hide the undo button
     */
    hideUndoButton() {
        if (this.elements.undoBtn) {
            this.elements.undoBtn.classList.add('hidden');
        }
    }

    /**
     * Get the undo button element
     * @returns {HTMLElement|null}
     */
    getUndoButton() {
        return this.elements.undoBtn;
    }

    /**
     * Add color to bowl (mixing animation)
     * @param {string} color - Color name
     */
    addColorToBowl(color) {
        const colorHex = CONFIG.COLORS.PRIMARY[color];
        if (!colorHex) return;

        // Add bowl squish animation (jelly physics)
        if (this.elements.bowl) {
            this.elements.bowl.classList.add('squish');
            setTimeout(() => this.elements.bowl.classList.remove('squish'), 300);
        }

        // Create splash particle
        if (this.elements.particles) {
            const particle = document.createElement('div');
            particle.className = 'color-particle';
            particle.style.backgroundColor = colorHex;
            this.elements.particles.appendChild(particle);

            setTimeout(() => particle.remove(), 1000);
        }

        // Update clear button
        this.updateClearButton(true);
    }

    /**
     * Clear bowl
     */
    clearBowl() {
        this.setBowlColor(null);
        if (this.elements.particles) {
            this.elements.particles.innerHTML = '';
        }
        this.updateClearButton(false);
    }

    /**
     * Update clear button state
     * @param {boolean} hasColors - Whether bowl has colors
     */
    updateClearButton(hasColors) {
        if (this.elements.clearBtn) {
            this.elements.clearBtn.disabled = !hasColors;
        }
    }

    /**
     * Show toast notification
     * @param {string} message - Message to display
     * @param {string} type - Toast type (success, info, mud)
     */
    showToast(message, type = 'info') {
        // Cancel existing timeout
        if (this.toastTimeout) {
            clearTimeout(this.toastTimeout);
        }

        // Reuse existing toast if available
        let toast = document.querySelector('.toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.setAttribute('role', 'status');
            toast.setAttribute('aria-live', 'polite');
            document.body.appendChild(toast);
        }

        // Update content
        toast.className = `toast ${type}`;
        toast.textContent = message;

        // Auto-remove after duration
        this.toastTimeout = setTimeout(() => {
            toast.remove();
            this.toastTimeout = null;
        }, CONFIG.UI.TOAST_DURATION);
    }

    /**
     * Show splash icon effect for successful mix
     * @param {string} emoji - Emoji to display
     * @param {string} colorHex - Hex color code
     */
    showSplashIcon(emoji, colorHex) {
        // Remove existing splash
        const existing = document.querySelector('.splash-text');
        if (existing) existing.remove();

        const splash = document.createElement('div');
        splash.className = 'splash-text'; // Keep class for animation
        splash.textContent = emoji;
        splash.style.color = colorHex;
        splash.style.fontSize = '120px'; // Make it huge
        splash.style.textShadow = '0 10px 30px rgba(0,0,0,0.3)';
        document.body.appendChild(splash);

        // Sparkle particles
        this.createSparkles(window.innerWidth / 2, window.innerHeight / 2, colorHex);

        // Remove after animation
        setTimeout(() => splash.remove(), 1400);
    }

    /**
     * Create sparkle particles for success
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {string} color - Particle color
     */
    createSparkles(x, y, color) {
        const particleCount = 20;
        for (let i = 0; i < particleCount; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.left = x + 'px';
            sparkle.style.top = y + 'px';
            sparkle.style.background = color;

            // Random direction
            const angle = (Math.PI * 2 * i) / particleCount;
            const distance = 80 + Math.random() * 40;
            const targetX = x + Math.cos(angle) * distance;
            const targetY = y + Math.sin(angle) * distance;

            sparkle.style.setProperty('--target-x', targetX + 'px');
            sparkle.style.setProperty('--target-y', targetY + 'px');

            document.body.appendChild(sparkle);

            setTimeout(() => sparkle.remove(), 800);
        }
    }

    /**
     * Show mud splat overlay effect
     * @param {number} x - X coordinate of splat center
     * @param {number} y - Y coordinate of splat center
     */
    showMudSplat(x, y) {
        // Remove existing splat
        const existing = document.querySelector('.mud-splat-overlay');
        if (existing) existing.remove();

        const splat = document.createElement('div');
        splat.className = 'mud-splat-overlay';
        splat.style.setProperty('--splat-x', (x / window.innerWidth * 100) + '%');
        splat.style.setProperty('--splat-y', (y / window.innerHeight * 100) + '%');
        document.body.appendChild(splat);

        // Remove after animation
        setTimeout(() => splat.remove(), 2500);
    }

    /**
     * Show confetti for level complete
     */
    showLevelComplete() {
        this.container.classList.add('level-complete');

        // Add celebration flash
        const flash = document.createElement('div');
        flash.className = 'celebration-flash';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 500);

        // Create enhanced confetti particles
        const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#9944FF', '#44DD44', '#FF99CC', '#66CCFF'];
        const shapes = ['square', 'rectangle', 'circle', 'star'];
        const confettiCount = 80;

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            confetti.className = `confetti-piece ${shape}`;

            // Random position across screen width
            confetti.style.left = Math.random() * window.innerWidth + 'px';
            confetti.style.top = '-20px';

            // Random color
            confetti.style.setProperty('--confetti-color', colors[Math.floor(Math.random() * colors.length)]);

            // Random drift direction (-60px to 60px)
            confetti.style.setProperty('--confetti-drift', (Math.random() * 120 - 60) + 'px');

            // Staggered animation delay
            confetti.style.setProperty('--confetti-delay', (Math.random() * 0.8) + 's');

            // Varied duration
            confetti.style.setProperty('--confetti-duration', (2.5 + Math.random() * 1.5) + 's');

            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 4500);
        }

        setTimeout(() => {
            this.container.classList.remove('level-complete');
        }, 3000);
    }


    /**
     * Show mini celebration burst when matching a goal (not level complete)
     * @param {number} centerX - Center X position for burst
     * @param {number} centerY - Center Y position for burst
     * @param {string} color - Primary color for confetti (optional)
     */
    showMiniCelebration(centerX, centerY, color = null) {
        const colors = color ?
            [color, '#FFE66D', '#FFFFFF'] :
            ['#FF6B6B', '#4ECDC4', '#FFE66D', '#9944FF', '#44DD44'];
        const shapes = ['circle', 'square'];
        const confettiCount = 20;

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            confetti.className = `confetti-piece ${shape}`;

            // Position at burst center
            confetti.style.left = centerX + 'px';
            confetti.style.top = centerY + 'px';

            // Random color
            confetti.style.setProperty('--confetti-color', colors[Math.floor(Math.random() * colors.length)]);

            // Burst direction - spread outward in all directions
            const angle = (i / confettiCount) * Math.PI * 2;
            const distance = 80 + Math.random() * 60;
            const burstX = Math.cos(angle) * distance;
            const burstY = Math.sin(angle) * distance;
            confetti.style.setProperty('--burst-x', burstX + 'px');
            confetti.style.setProperty('--burst-y', burstY + 'px');

            // Use burst animation
            confetti.style.setProperty('--confetti-anim', 'confetti-burst');
            confetti.style.setProperty('--confetti-duration', (1 + Math.random() * 0.5) + 's');
            confetti.style.setProperty('--confetti-delay', (Math.random() * 0.1) + 's');

            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 2000);
        }
    }

    /**
     * Create sticker book modal
     * @private
     */
    createStickerBook() {
        if (this.stickerBookModal) return;

        // Create modal container
        this.stickerBookModal = document.createElement('div');
        this.stickerBookModal.className = 'sticker-book-modal';
        this.stickerBookModal.setAttribute('role', 'dialog');
        this.stickerBookModal.setAttribute('aria-label', this.t('sticker_book'));
        this.stickerBookModal.setAttribute('aria-modal', 'true');

        // Create modal content
        const content = document.createElement('div');
        content.className = 'sticker-book-content';

        // Header with close button
        const header = document.createElement('div');
        header.className = 'sticker-book-header';
        header.innerHTML = `
            <h2 class="sticker-book-title">📖 ${this.t('sticker_book')}</h2>
            <button class="sticker-book-close" aria-label="Close">&times;</button>
        `;

        // Stickers grid
        this.stickerGrid = document.createElement('div');
        this.stickerGrid.className = 'sticker-book-grid';

        content.appendChild(header);
        content.appendChild(this.stickerGrid);
        this.stickerBookModal.appendChild(content);

        // Add to container
        this.container.appendChild(this.stickerBookModal);

        // Close button event
        const closeBtn = header.querySelector('.sticker-book-close');
        closeBtn.addEventListener('click', () => this.hideStickerBook());

        // Close on backdrop click
        this.stickerBookModal.addEventListener('click', (e) => {
            if (e.target === this.stickerBookModal) {
                this.hideStickerBook();
            }
        });

        // Close on Escape key
        this.stickerBookKeyHandler = (e) => {
            if (e.key === 'Escape' && this.stickerBookModal.classList.contains('visible')) {
                this.hideStickerBook();
            }
        };
        document.addEventListener('keydown', this.stickerBookKeyHandler);
    }

    /**
     * Show sticker book modal
     * @param {string[]} earnedStickers - Array of earned sticker IDs
     * @param {Object} stickerConfig - Sticker configuration from CONFIG.STICKERS
     * @param {string[]} newStickers - Array of newly earned sticker IDs (for "NEW" badge)
     */
    showStickerBook(earnedStickers = [], stickerConfig = {}, newStickers = []) {
        this.createStickerBook();

        // Clear and populate grid
        this.stickerGrid.innerHTML = '';

        // Get all sticker definitions
        const allStickers = Object.entries(stickerConfig);
        const totalCount = allStickers.length;
        const earnedCount = earnedStickers.length;

        // Add stats header
        const statsDiv = document.createElement('div');
        statsDiv.className = 'sticker-book-stats';
        statsDiv.innerHTML = `
            <span class="stats-icon">🌟</span>
            <span class="stats-text">
                <span class="stats-earned">${earnedCount}</span>
                <span>/ ${totalCount}</span>
            </span>
            <span class="stats-icon">📖</span>
        `;
        this.stickerGrid.appendChild(statsDiv);

        // Check for empty state
        if (allStickers.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'sticker-book-empty';
            emptyDiv.innerHTML = `
                <div class="empty-icon">📚</div>
                <div class="empty-text">${this.t('no_stickers') || 'No stickers available yet!'}</div>
            `;
            this.stickerGrid.appendChild(emptyDiv);
        } else {
            allStickers.forEach(([stickerId, info]) => {
                const isEarned = earnedStickers.includes(stickerId);
                const isNew = newStickers.includes(stickerId);
                const stickerItem = document.createElement('div');

                let className = 'sticker-item';
                if (isEarned) className += ' earned';
                if (!isEarned) className += ' locked';
                if (isNew) className += ' new-earned';

                stickerItem.className = className;
                stickerItem.setAttribute('role', 'img');
                stickerItem.setAttribute('aria-label',
                    isEarned ? `${info.name} sticker earned` : `${info.name} sticker locked`);

                if (isEarned) {
                    stickerItem.innerHTML = `
                        <span class="sticker-emoji">${info.emoji}</span>
                        <span class="sticker-name">${info.name}</span>
                    `;
                } else {
                    stickerItem.innerHTML = `
                        <span class="sticker-emoji locked">🔒</span>
                        <span class="sticker-name">${this.t('level', { '0': info.level })}</span>
                    `;
                }

                this.stickerGrid.appendChild(stickerItem);
            });
        }

        // Show modal
        this.stickerBookModal.classList.add('visible');
        this.stickerBookModal.querySelector('.sticker-book-close').focus();
    }

    /**
     * Hide sticker book modal
     */
    hideStickerBook() {
        if (this.stickerBookModal) {
            this.stickerBookModal.classList.remove('visible');
        }
    }

    /**
     * Show/hide free play button
     * @param {boolean} show - Whether to show the button
     */
    showFreePlayButton(show) {
        if (this.elements.freePlayBtn) {
            if (show) {
                this.elements.freePlayBtn.classList.remove('hidden');
                this.elements.freePlayBtn.classList.add('unlocked');
            } else {
                this.elements.freePlayBtn.classList.add('hidden');
            }
        }
    }

    /**
     * Set free play mode UI state
     * @param {boolean} enabled - Whether free play is active
     */
    setFreePlayMode(enabled) {
        if (this.container) {
            this.container.classList.toggle('free-play-mode', enabled);
        }

        // Update free play button appearance
        if (this.elements.freePlayBtn) {
            this.elements.freePlayBtn.classList.toggle('active', enabled);
            const icon = this.elements.freePlayBtn.querySelector('.icon-free-play');
            if (icon) {
                icon.textContent = enabled ? '📚' : '🎨';
            }
        }

        // Hide target leaf and stars in free play
        if (this.elements.targetLeaf) {
            this.elements.targetLeaf.classList.toggle('hidden', enabled);
        }
        if (this.elements.progressStars) {
            this.elements.progressStars.classList.toggle('hidden', enabled);
        }
    }

    /**
     * Get element reference
     * @param {string} name - Element name
     */
    getElement(name) {
        return this.elements[name];
    }

    // ===== Educational Formula Overlay =====

    /**
     * Create the formula overlay DOM element
     */
    createFormulaOverlay() {
        if (this.formulaOverlay) return;

        this.formulaOverlay = document.createElement('div');
        this.formulaOverlay.className = 'formula-overlay';
        this.formulaOverlay.setAttribute('role', 'dialog');
        this.formulaOverlay.setAttribute('aria-modal', 'true');
        this.formulaOverlay.setAttribute('aria-label', 'Color mixing formula');

        // Close on click anywhere
        this.formulaOverlay.addEventListener('click', () => {
            this.hideFormulaOverlay();
        });

        // Close on escape key
        this.formulaKeyHandler = (e) => {
            if (e.key === 'Escape' && this.formulaOverlay.classList.contains('active')) {
                this.hideFormulaOverlay();
            }
        };
        document.addEventListener('keydown', this.formulaKeyHandler);

        document.body.appendChild(this.formulaOverlay);
    }

    /**
     * Show educational formula overlay
     * @param {string} color1 - First color name
     * @param {string} color2 - Second color name
     * @param {string} resultColor - Result color name
     */
    showFormulaOverlay(color1, color2, resultColor) {
        if (typeof document === 'undefined') return;

        this.createFormulaOverlay();

        // Get localized color names
        const color1Name = this.t(color1) || color1;
        const color2Name = this.t(color2) || color2;
        const resultName = this.t(resultColor) || resultColor;

        // Build formula HTML
        this.formulaOverlay.innerHTML = `
            <div class="formula-card">
                <div class="formula-title">${this.t('formula_title') || 'Color Magic!'}</div>
                <div class="formula-equation">
                    <div class="formula-color">
                        <div class="formula-color-circle ${color1}"></div>
                        <span class="formula-color-name">${color1Name}</span>
                    </div>
                    <span class="formula-operator">+</span>
                    <div class="formula-color">
                        <div class="formula-color-circle ${color2}"></div>
                        <span class="formula-color-name">${color2Name}</span>
                    </div>
                    <span class="formula-operator">=</span>
                    <div class="formula-color formula-result">
                        <div class="formula-color-circle ${resultColor}"></div>
                        <span class="formula-color-name">${resultName}</span>
                    </div>
                </div>
                <div class="formula-celebration">🎉✨🌈</div>
                <div class="formula-tap-hint">${this.t('tap_to_continue') || 'Tap anywhere to continue'}</div>
            </div>
        `;

        // Show overlay
        this.formulaOverlay.classList.add('active');

        // Auto-hide after delay
        this.formulaTimeout = setTimeout(() => {
            this.hideFormulaOverlay();
        }, 4000);
    }

    /**
     * Hide formula overlay
     */
    hideFormulaOverlay() {
        if (!this.formulaOverlay) return;

        if (this.formulaTimeout) {
            clearTimeout(this.formulaTimeout);
            this.formulaTimeout = null;
        }

        this.formulaOverlay.classList.remove('active');

        // Notify game to continue
        if (this.onFormulaClose) {
            this.onFormulaClose();
        }
    }

    /**
     * Set callback for when formula overlay closes
     * @param {Function} callback - Callback function
     */
    setFormulaCloseCallback(callback) {
        this.onFormulaClose = callback;
    }

    /**
     * Clean up resources
     */
    destroy() {
        if (this.toastTimeout) {
            clearTimeout(this.toastTimeout);
            this.toastTimeout = null;
        }

        // Clean up eye tracking
        if (this.eyeTrackHandler && typeof document !== 'undefined') {
            document.removeEventListener('mousemove', this.eyeTrackHandler);
            document.removeEventListener('touchmove', this.eyeTrackHandler);
            this.eyeTrackHandler = null;
        }
        this.pupils = null;

        // Clean up sticker book
        if (this.stickerBookKeyHandler) {
            document.removeEventListener('keydown', this.stickerBookKeyHandler);
            this.stickerBookKeyHandler = null;
        }
        if (this.stickerBookModal && this.stickerBookModal.parentElement) {
            this.stickerBookModal.remove();
        }
        this.stickerBookModal = null;
        this.stickerGrid = null;

        // Clean up formula overlay
        if (this.formulaTimeout) {
            clearTimeout(this.formulaTimeout);
            this.formulaTimeout = null;
        }
        if (this.formulaKeyHandler && typeof document !== 'undefined') {
            document.removeEventListener('keydown', this.formulaKeyHandler);
            this.formulaKeyHandler = null;
        }
        if (this.formulaOverlay && this.formulaOverlay.parentElement) {
            this.formulaOverlay.remove();
        }
        this.formulaOverlay = null;
        this.onFormulaClose = null;

        // Remove all toasts and effects
        if (typeof document !== 'undefined') {
            document.querySelectorAll('.toast, .splash-text, .mud-splat-overlay, .sparkle, .confetti-piece').forEach(el => el.remove());
        }

        this.elements = null;
        this.container = null;
    }
}

export default UIManager;
