/**
 * EffectsManager - Visual Effects System
 * Handles sparkles, celebrations, mud splat, swirl, and hint effects
 *
 * Extracted from UIManager to follow Single Responsibility Principle
 */

export class EffectsManager {
    /**
     * @param {Object} options
     * @param {Object} options.elements - DOM element references
     * @param {Function} options.setTimeout - Safe setTimeout wrapper
     */
    constructor(options = {}) {
        this.elements = options.elements || {};
        this._setTimeout = options.setTimeout || ((fn, ms) => setTimeout(fn, ms));
        this.activeFireflyHint = null;
    }

    /**
     * Update element references (called when UIManager elements change)
     * @param {Object} elements - DOM element references
     */
    setElements(elements) {
        this.elements = elements;
    }

    /**
     * Create sparkle particles at position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {string} color - CSS color value
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

            this._setTimeout(() => sparkle.remove(), 800);
        }
    }

    /**
     * Show splash icon with sparkle effect
     * Uses CSS-styled ball instead of emoji for consistent coloring
     * @param {string} emoji - Emoji (unused, kept for API compatibility)
     * @param {string} colorHex - Color for the ball and sparkles
     */
    showSplashIcon(emoji, colorHex) {
        // Remove existing splash
        const existing = document.querySelector('.splash-text');
        if (existing) existing.remove();

        // Create a CSS-styled colored ball instead of emoji
        // (Emojis have their own inherent colors that cannot be overridden by CSS)
        const splash = document.createElement('div');
        splash.className = 'splash-text';

        // Create inner ball element with actual color
        const ball = document.createElement('div');
        ball.className = 'splash-ball';
        ball.style.width = '100px';
        ball.style.height = '100px';
        ball.style.borderRadius = '50%';
        ball.style.background = `radial-gradient(circle at 35% 35%, ${this.lightenColor(colorHex, 40)}, ${colorHex} 60%, ${this.darkenColor(colorHex, 20)})`;
        ball.style.boxShadow = `0 10px 30px rgba(0,0,0,0.3), inset 0 -5px 15px rgba(0,0,0,0.2), inset 0 5px 15px rgba(255,255,255,0.3)`;

        splash.appendChild(ball);
        document.body.appendChild(splash);

        // Sparkle particles
        this.createSparkles(window.innerWidth / 2, window.innerHeight / 2, colorHex);

        // Remove after animation
        this._setTimeout(() => splash.remove(), 1400);
    }

    /**
     * Lighten a hex color by percentage
     * @param {string} hex - Hex color
     * @param {number} percent - Percentage to lighten (0-100)
     * @returns {string} Lightened hex color
     */
    lightenColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
    }

    /**
     * Darken a hex color by percentage
     * @param {string} hex - Hex color
     * @param {number} percent - Percentage to darken (0-100)
     * @returns {string} Darkened hex color
     */
    darkenColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
    }

    /**
     * Show mud splat effect at position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
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
        this._setTimeout(() => splat.remove(), 2500);
    }

    /**
     * Show confetti celebration effect
     * @param {number} centerX - Center X coordinate
     * @param {number} centerY - Center Y coordinate
     * @param {string|null} color - Optional primary color
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
            this._setTimeout(() => confetti.remove(), 2000);
        }
    }

    /**
     * Show swirl animation in bowl
     * @param {string} color - CSS color value
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
        this._setTimeout(() => {
            if (swirl.parentElement) {
                swirl.remove();
            }
        }, 900);
    }

    /**
     * Show firefly hint on color source
     * @param {string} colorName - Color name (red, blue, yellow)
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
     * Cleanup all effects
     */
    destroy() {
        this.hideFireflyHint();

        // Remove any lingering effect elements
        document.querySelectorAll('.sparkle, .splash-text, .mud-splat-overlay, .confetti-piece, .swirl').forEach(el => el.remove());

        this.elements = {};
        this.activeFireflyHint = null;
    }
}

// Dual export pattern for browser and Node.js
if (typeof window !== 'undefined') {
    window.EffectsManager = EffectsManager;
}

export default EffectsManager;
