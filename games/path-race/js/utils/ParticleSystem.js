/**
 * ParticleSystem - Visual Effects System
 * Creates confetti, sparks, and other particle effects
 */

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.container = document.body;
    }

    /**
     * Create confetti explosion
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} count - Number of confetti pieces
     */
    createConfetti(x = window.innerWidth / 2, y = 100, count = 30) {
        const colors = ['#FFD700', '#4CAF50', '#2196F3', '#FF9800', '#F44336', '#9C27B0'];

        for (let i = 0; i < count; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.cssText = `
                --confetti-color: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${x}px;
                top: ${y}px;
                animation-delay: ${Math.random() * 0.3}s;
                animation-duration: ${2 + Math.random() * 2}s;
            `;

            this.container.appendChild(confetti);
            this.particles.push(confetti);

            // Remove after animation
            setTimeout(() => {
                confetti.remove();
                this.particles = this.particles.filter(p => p !== confetti);
            }, 5000);
        }
    }

    /**
     * Create particle burst
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} color - Particle color
     * @param {number} count - Number of particles
     */
    createBurst(x, y, color = '#4CAF50', count = 12) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const distance = 50 + Math.random() * 50;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;

            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                --particle-color: ${color};
                --tx: ${tx}px;
                --ty: ${ty}px;
                left: ${x}px;
                top: ${y}px;
            `;

            this.container.appendChild(particle);
            this.particles.push(particle);

            setTimeout(() => {
                particle.remove();
                this.particles = this.particles.filter(p => p !== particle);
            }, 1000);
        }
    }

    /**
     * Create success sparkles
     * @param {HTMLElement} element - Element to sparkle around
     */
    createSparkles(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        this.createBurst(centerX, centerY, '#FFD700', 8);
    }

    /**
     * Show toast notification
     * @param {string} message - Message text
     * @param {string} type - Type: success, error, info
     * @param {number} duration - Duration in ms
     */
    showToast(message, type = 'info', duration = 2000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        this.container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 500);
        }, duration);
    }

    /**
     * Create ripple effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} color - Ripple color
     */
    createRipple(x, y, color = 'rgba(33, 150, 243, 0.5)') {
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: ${color};
            pointer-events: none;
            transform: translate(-50%, -50%);
            z-index: 1000;
        `;
        ripple.classList.add('ripple-effect');

        this.container.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    }

    /**
     * Clear all particles
     */
    clear() {
        this.particles.forEach(p => p.remove());
        this.particles = [];
    }

    /**
     * Cleanup
     */
    destroy() {
        this.clear();
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ParticleSystem;
}
