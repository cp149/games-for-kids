/**
 * TutorialSystem - Handles game tutorials and hints
 * Supports three modes: handheld, image, none
 */

class TutorialSystem {
    constructor(config = null) {
        this.config = config || (typeof CONFIG !== 'undefined' ? CONFIG : null);
        if (!this.config) {
            throw new Error('TutorialSystem requires CONFIG');
        }

        this.currentLevel = 1;
        this.tutorialType = 'none';
        this.isActive = false;
        this.failureCount = 0;
        this.elements = {};
        this.animationTimeout = null;

        this.initElements();
    }

    /**
     * Initialize tutorial overlay elements
     */
    initElements() {
        // Create tutorial overlay container
        this.elements.overlay = document.createElement('div');
        this.elements.overlay.className = 'tutorial-overlay';
        this.elements.overlay.setAttribute('role', 'dialog');
        this.elements.overlay.setAttribute('aria-label', 'Tutorial');

        // Create hand cursor for handheld mode
        this.elements.hand = document.createElement('div');
        this.elements.hand.className = 'tutorial-hand';
        this.elements.hand.innerHTML = '👆';

        // Create formula display for image mode
        this.elements.formula = document.createElement('div');
        this.elements.formula.className = 'tutorial-formula';

        // Create hint bubble for failures
        this.elements.hint = document.createElement('div');
        this.elements.hint.className = 'tutorial-hint';

        // Add elements to overlay
        this.elements.overlay.appendChild(this.elements.hand);
        this.elements.overlay.appendChild(this.elements.formula);
        this.elements.overlay.appendChild(this.elements.hint);
    }

    /**
     * Set up tutorial for a specific level
     * @param {number} level - Level number
     */
    setupLevel(level) {
        this.currentLevel = level;
        this.failureCount = 0;

        const levelConfig = this.config.LEVELS[level];
        if (!levelConfig) {
            this.tutorialType = 'none';
            return;
        }

        this.tutorialType = levelConfig.tutorial || 'none';
    }

    /**
     * Start the tutorial for current level
     * @param {HTMLElement} container - Game container element
     */
    start(container) {
        if (!container || this.tutorialType === 'none') {
            return;
        }

        // Add overlay to container
        if (!this.elements.overlay.parentElement) {
            container.appendChild(this.elements.overlay);
        }

        this.isActive = true;
        this.elements.overlay.classList.add('visible');

        if (this.tutorialType === 'handheld') {
            this.showHandheldTutorial(container);
        } else if (this.tutorialType === 'image') {
            this.showImageTutorial();
        }
    }

    /**
     * Show handheld tutorial with animated hand
     * @param {HTMLElement} container - Game container element
     */
    showHandheldTutorial(container) {
        const levelConfig = this.config.LEVELS[this.currentLevel];
        if (!levelConfig) return;

        const colors = levelConfig.availableColors;
        if (!colors || colors.length < 2) return;

        // Get color source elements
        const firstSource = container.querySelector(`.${colors[0]}-source`);
        const secondSource = container.querySelector(`.${colors[1]}-source`);
        const bowl = container.querySelector('.bowl');

        if (!firstSource || !secondSource || !bowl) return;

        // Hide formula, show hand
        this.elements.formula.classList.remove('visible');
        this.elements.hand.classList.add('visible');

        // Animate hand: first color -> bowl -> second color -> bowl
        this.animateHandSequence(firstSource, secondSource, bowl);
    }

    /**
     * Animate hand through drag sequence
     * @param {HTMLElement} first - First color source
     * @param {HTMLElement} second - Second color source
     * @param {HTMLElement} bowl - Bowl element
     */
    animateHandSequence(first, second, bowl) {
        const hand = this.elements.hand;
        let step = 0;

        const animate = () => {
            if (!this.isActive) return;

            switch (step) {
                case 0: // Move to first color
                    this.moveHandTo(first);
                    step = 1;
                    this.animationTimeout = setTimeout(animate, 1000);
                    break;
                case 1: // Pulse at first color
                    hand.classList.add('pulse');
                    step = 2;
                    this.animationTimeout = setTimeout(() => {
                        hand.classList.remove('pulse');
                        animate();
                    }, 600);
                    break;
                case 2: // Move to bowl
                    this.moveHandTo(bowl);
                    step = 3;
                    this.animationTimeout = setTimeout(animate, 800);
                    break;
                case 3: // Move to second color
                    this.moveHandTo(second);
                    step = 4;
                    this.animationTimeout = setTimeout(animate, 1000);
                    break;
                case 4: // Pulse at second color
                    hand.classList.add('pulse');
                    step = 5;
                    this.animationTimeout = setTimeout(() => {
                        hand.classList.remove('pulse');
                        animate();
                    }, 600);
                    break;
                case 5: // Move to bowl again
                    this.moveHandTo(bowl);
                    step = 0; // Loop
                    this.animationTimeout = setTimeout(animate, 2000);
                    break;
            }
        };

        animate();
    }

    /**
     * Move hand element to target position
     * @param {HTMLElement} target - Target element
     */
    moveHandTo(target) {
        if (!target || !this.elements.hand) return;

        const rect = target.getBoundingClientRect();
        const containerRect = this.elements.overlay.getBoundingClientRect();

        const x = rect.left - containerRect.left + rect.width / 2;
        const y = rect.top - containerRect.top + rect.height / 2;

        this.elements.hand.style.left = `${x}px`;
        this.elements.hand.style.top = `${y}px`;
    }

    /**
     * Show image tutorial with color formula
     */
    showImageTutorial() {
        const levelConfig = this.config.LEVELS[this.currentLevel];
        if (!levelConfig) return;

        const goal = levelConfig.goal;
        if (!goal) return;

        // Hide hand, show formula
        this.elements.hand.classList.remove('visible');
        this.elements.formula.classList.add('visible');

        // Build formula based on goal color
        const formula = this.buildFormula(goal.color);
        this.elements.formula.innerHTML = formula;

        // Auto-hide after 3 seconds
        this.animationTimeout = setTimeout(() => {
            this.elements.formula.classList.remove('visible');
        }, 3000);
    }

    /**
     * Build visual formula for color combination
     * @param {string} targetColor - Target color to create
     * @returns {string} HTML formula string
     */
    buildFormula(targetColor) {
        const emojis = this.config.COLOR_EMOJIS;

        // Find which colors create the target
        const formulas = {
            orange: ['red', 'yellow'],
            green: ['yellow', 'blue'],
            purple: ['red', 'blue']
        };

        const colors = formulas[targetColor];
        if (!colors) return '';

        const [c1, c2] = colors;

        return `
            <span class="formula-color" style="background: ${this.config.COLORS.PRIMARY[c1]}">${emojis[c1]}</span>
            <span class="formula-plus">+</span>
            <span class="formula-color" style="background: ${this.config.COLORS.PRIMARY[c2]}">${emojis[c2]}</span>
            <span class="formula-equals">=</span>
            <span class="formula-result" style="background: ${this.config.COLORS.SECONDARY[targetColor]}">${emojis[targetColor]}</span>
        `;
    }

    /**
     * Record a failure (mud result)
     * Shows hint after 2 consecutive failures in levels 4-5
     */
    recordFailure() {
        this.failureCount++;

        // Only show hints in levels with no tutorial
        if (this.tutorialType !== 'none') {
            return;
        }

        // Show hint after 2 failures
        if (this.failureCount >= 2) {
            this.showHint();
        }
    }

    /**
     * Record a success (valid mix)
     * Resets failure count
     */
    recordSuccess() {
        this.failureCount = 0;
        this.hideHint();
    }

    /**
     * Show subtle hint after failures
     */
    showHint() {
        const levelConfig = this.config.LEVELS[this.currentLevel];
        if (!levelConfig) return;

        const goal = levelConfig.goal;
        let hintText = '';

        if (goal.type === 'secondary') {
            hintText = this.buildFormula(goal.color);
        } else if (goal.type === 'multiple' && goal.colors) {
            // Show hint for first color in list
            hintText = this.buildFormula(goal.colors[0]);
        }

        if (hintText) {
            this.elements.hint.innerHTML = hintText;
            this.elements.hint.classList.add('visible');

            // Auto-hide after 4 seconds
            this.animationTimeout = setTimeout(() => {
                this.hideHint();
            }, 4000);
        }
    }

    /**
     * Hide the hint
     */
    hideHint() {
        this.elements.hint.classList.remove('visible');
    }

    /**
     * Stop and hide the tutorial
     */
    stop() {
        this.isActive = false;

        if (this.animationTimeout) {
            clearTimeout(this.animationTimeout);
            this.animationTimeout = null;
        }

        // Handle already destroyed elements
        if (!this.elements || !this.elements.overlay) {
            return;
        }

        this.elements.overlay.classList.remove('visible');
        this.elements.hand.classList.remove('visible', 'pulse');
        this.elements.formula.classList.remove('visible');
    }

    /**
     * Check if tutorial is currently active
     * @returns {boolean} True if tutorial is active
     */
    isRunning() {
        return this.isActive;
    }

    /**
     * Get current tutorial type
     * @returns {string} Tutorial type (handheld, image, none)
     */
    getTutorialType() {
        return this.tutorialType;
    }

    /**
     * Get failure count
     * @returns {number} Number of consecutive failures
     */
    getFailureCount() {
        return this.failureCount;
    }

    /**
     * Clean up resources
     */
    destroy() {
        this.stop();

        if (this.elements.overlay && this.elements.overlay.parentElement) {
            this.elements.overlay.remove();
        }

        this.elements = {};
        this.config = null;
    }
}

// Export for Node.js tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TutorialSystem;
}

// Export for browser
if (typeof window !== 'undefined') {
    window.TutorialSystem = TutorialSystem;
}
