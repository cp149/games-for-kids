/**
 * Visual Effects - Magical particle effects and animations
 */

export class VisualEffects {
    constructor() {
        this.effectsContainer = null;
        this.particles = [];
        this.animationFrame = null;
        this.isInitialized = false;
        this.particlePool = [];
        this.maxParticles = 100;
    }

    /**
     * Initialize visual effects system
     */
    init() {
        try {
            this.effectsContainer = document.getElementById('effects-container');
            if (!this.effectsContainer) {
                throw new Error('Effects container not found');
            }

            // Pre-create particle pool for performance
            this.initializeParticlePool();
            
            // Add CSS animations
            this.addAnimationStyles();
            
            this.isInitialized = true;
            console.log('✨ Visual Effects initialized');

        } catch (error) {
            console.error('Failed to initialize Visual Effects:', error);
            throw error;
        }
    }

    /**
     * Create particle pool for better performance
     */
    initializeParticlePool() {
        for (let i = 0; i < this.maxParticles; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.position = 'absolute';
            particle.style.pointerEvents = 'none';
            particle.style.borderRadius = '50%';
            particle.style.display = 'none';
            this.particlePool.push(particle);
        }
    }

    /**
     * Add CSS animation styles
     */
    addAnimationStyles() {
        if (document.getElementById('visual-effects-styles')) return;

        const style = document.createElement('style');
        style.id = 'visual-effects-styles';
        style.textContent = `
            .key-ripple {
                animation: ripple 0.6s linear;
            }

            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }

            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% {
                    transform: translateY(0);
                }
                40% {
                    transform: translateY(-10px);
                }
                60% {
                    transform: translateY(-5px);
                }
            }

            @keyframes pulse {
                0% {
                    transform: scale(1);
                    opacity: 1;
                }
                50% {
                    transform: scale(1.1);
                    opacity: 0.7;
                }
                100% {
                    transform: scale(1);
                    opacity: 1;
                }
            }

            @keyframes sparkle {
                0%, 100% {
                    opacity: 0;
                    transform: scale(0);
                }
                50% {
                    opacity: 1;
                    transform: scale(1);
                }
            }

            @keyframes noteFloat {
                0% {
                    opacity: 1;
                    transform: translateY(0) rotate(0deg);
                }
                100% {
                    opacity: 0;
                    transform: translateY(-100px) rotate(360deg);
                }
            }

            .musical-note {
                animation: noteFloat 2s ease-out forwards;
                font-size: 24px;
                color: #FFD700;
                text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Create magical particles when a key is pressed
     */
    createParticles(x, y, note) {
        if (!this.isInitialized) return;

        const noteColor = this.getNoteColor(note);
        const particleCount = 8 + Math.floor(Math.random() * 5);

        for (let i = 0; i < particleCount; i++) {
            this.createSingleParticle(x, y, noteColor, note);
        }

        // Create special musical note symbol
        this.createMusicalNote(x, y, note);
    }

    /**
     * Create a single particle
     */
    createSingleParticle(startX, startY, color, note) {
        const particle = this.getParticleFromPool();
        if (!particle) return;

        // Random particle properties
        const size = 4 + Math.random() * 8;
        const velocity = {
            x: (Math.random() - 0.5) * 100,
            y: -Math.random() * 150 - 50
        };
        const rotation = Math.random() * 360;
        const lifetime = 1000 + Math.random() * 1000;

        // Style the particle
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.background = `radial-gradient(circle, ${color}, ${this.adjustColor(color, -20)})`;
        particle.style.left = `${startX - size / 2}px`;
        particle.style.top = `${startY - size / 2}px`;
        particle.style.transform = `rotate(${rotation}deg)`;
        particle.style.display = 'block';
        particle.style.opacity = '1';
        particle.style.boxShadow = `0 0 ${size * 2}px ${color}`;

        // Add to container
        this.effectsContainer.appendChild(particle);

        // Animate the particle
        this.animateParticle(particle, velocity, lifetime);
    }

    /**
     * Animate a particle
     */
    animateParticle(particle, velocity, lifetime) {
        const startTime = Date.now();
        const startX = parseFloat(particle.style.left);
        const startY = parseFloat(particle.style.top);
        const gravity = 200; // pixels per second squared

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / lifetime;

            if (progress >= 1) {
                this.returnParticleToPool(particle);
                return;
            }

            // Physics calculation
            const t = elapsed / 1000; // time in seconds
            const x = startX + velocity.x * t;
            const y = startY + velocity.y * t + 0.5 * gravity * t * t;
            
            // Update position
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            
            // Fade out
            particle.style.opacity = `${1 - progress}`;
            
            // Scale down
            const scale = 1 - progress * 0.5;
            particle.style.transform = `${particle.style.transform} scale(${scale})`;

            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }

    /**
     * Create musical note symbol
     */
    createMusicalNote(x, y, note) {
        const noteSymbols = ['♪', '♫', '♬', '♩', '♮'];
        const symbol = noteSymbols[Math.floor(Math.random() * noteSymbols.length)];
        
        const noteElement = document.createElement('div');
        noteElement.className = 'musical-note';
        noteElement.textContent = symbol;
        noteElement.style.position = 'absolute';
        noteElement.style.left = `${x - 12}px`;
        noteElement.style.top = `${y - 20}px`;
        noteElement.style.pointerEvents = 'none';
        noteElement.style.fontSize = `${20 + Math.random() * 10}px`;
        noteElement.style.color = this.getNoteColor(note);
        
        this.effectsContainer.appendChild(noteElement);
        
        // Remove after animation
        setTimeout(() => {
            if (noteElement.parentNode) {
                noteElement.parentNode.removeChild(noteElement);
            }
        }, 2000);
    }

    /**
     * Create sparkle effect
     */
    createSparkles(x, y, count = 6) {
        if (!this.isInitialized) return;

        for (let i = 0; i < count; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            
            const size = 3 + Math.random() * 4;
            const offsetX = (Math.random() - 0.5) * 60;
            const offsetY = (Math.random() - 0.5) * 60;
            const delay = Math.random() * 0.5;
            
            sparkle.style.position = 'absolute';
            sparkle.style.width = `${size}px`;
            sparkle.style.height = `${size}px`;
            sparkle.style.background = '#FFD700';
            sparkle.style.borderRadius = '50%';
            sparkle.style.left = `${x + offsetX}px`;
            sparkle.style.top = `${y + offsetY}px`;
            sparkle.style.pointerEvents = 'none';
            sparkle.style.animation = `sparkle 1s ease-in-out ${delay}s`;
            sparkle.style.boxShadow = '0 0 10px #FFD700';
            
            this.effectsContainer.appendChild(sparkle);
            
            setTimeout(() => {
                if (sparkle.parentNode) {
                    sparkle.parentNode.removeChild(sparkle);
                }
            }, 1000 + delay * 1000);
        }
    }

    /**
     * Create burst effect for special events
     */
    createBurst(x, y, color = '#FFD700') {
        if (!this.isInitialized) return;

        const burstCount = 12;
        const radius = 80;

        for (let i = 0; i < burstCount; i++) {
            const angle = (i / burstCount) * Math.PI * 2;
            const endX = x + Math.cos(angle) * radius;
            const endY = y + Math.sin(angle) * radius;
            
            this.createBurstParticle(x, y, endX, endY, color);
        }
    }

    /**
     * Create individual burst particle
     */
    createBurstParticle(startX, startY, endX, endY, color) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.background = color;
        particle.style.borderRadius = '50%';
        particle.style.left = `${startX}px`;
        particle.style.top = `${startY}px`;
        particle.style.pointerEvents = 'none';
        particle.style.boxShadow = `0 0 8px ${color}`;
        
        this.effectsContainer.appendChild(particle);
        
        // Animate to end position
        particle.style.transition = 'all 0.8s ease-out';
        particle.style.opacity = '0';
        particle.style.transform = 'scale(0)';
        
        setTimeout(() => {
            particle.style.left = `${endX}px`;
            particle.style.top = `${endY}px`;
        }, 10);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 800);
    }

    /**
     * Get particle from pool
     */
    getParticleFromPool() {
        for (const particle of this.particlePool) {
            if (particle.style.display === 'none') {
                return particle;
            }
        }
        return null; // Pool exhausted
    }

    /**
     * Return particle to pool
     */
    returnParticleToPool(particle) {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
        
        // Reset particle state
        particle.style.display = 'none';
        particle.style.opacity = '1';
        particle.style.transform = '';
        particle.style.boxShadow = '';
    }

    /**
     * Get color for a note
     */
    getNoteColor(note) {
        const noteColors = {
            'C': '#FF6B6B',   // Red
            'C#': '#FF8E53',  // Orange-red
            'D': '#FF8E53',   // Orange
            'D#': '#FFB84D',  // Orange-yellow
            'E': '#FFD93D',   // Yellow
            'F': '#6BCF7F',   // Green
            'F#': '#4ECDC4',  // Teal
            'G': '#45B7D1',   // Blue
            'G#': '#6C5CE7',  // Purple
            'A': '#A29BFE',   // Light purple
            'A#': '#FD79A8', // Pink
            'B': '#E17055'    // Brown-orange
        };
        
        const noteName = note.replace(/[0-9]/g, '');
        return noteColors[noteName] || '#FFFFFF';
    }

    /**
     * Adjust color brightness
     */
    adjustColor(color, amount) {
        // Simple color adjustment (this is a basic implementation)
        const hex = color.replace('#', '');
        const num = parseInt(hex, 16);
        const r = Math.max(0, Math.min(255, (num >> 16) + amount));
        const g = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amount));
        const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
        return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    }

    /**
     * Create rainbow trail effect
     */
    createRainbowTrail(startX, startY, endX, endY) {
        if (!this.isInitialized) return;

        const distance = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
        const steps = Math.floor(distance / 10);
        
        for (let i = 0; i < steps; i++) {
            const progress = i / steps;
            const x = startX + (endX - startX) * progress;
            const y = startY + (endY - startY) * progress;
            const hue = (progress * 360) % 360;
            const color = `hsl(${hue}, 100%, 60%)`;
            
            setTimeout(() => {
                this.createSingleParticle(x, y, color, 'C4');
            }, i * 50);
        }
    }

    /**
     * Create success celebration
     */
    createCelebration(centerX, centerY) {
        if (!this.isInitialized) return;

        // Multiple bursts
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.createBurst(centerX, centerY, '#FFD700');
                this.createSparkles(centerX, centerY, 10);
            }, i * 200);
        }
    }

    /**
     * Clear all effects
     */
    clearEffects() {
        if (!this.effectsContainer) return;
        
        // Return all particles to pool
        const particles = this.effectsContainer.querySelectorAll('.particle');
        particles.forEach(particle => {
            this.returnParticleToPool(particle);
        });
        
        // Remove other elements
        const otherElements = this.effectsContainer.querySelectorAll(':not(.particle)');
        otherElements.forEach(element => {
            element.remove();
        });
    }

    /**
     * Set effects intensity (for performance scaling)
     */
    setIntensity(intensity) {
        this.intensity = Math.max(0.1, Math.min(1, intensity));
        console.log(`Visual effects intensity set to ${this.intensity}`);
    }

    /**
     * Clean up resources
     */
    destroy() {
        this.clearEffects();
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        this.particles = [];
        this.particlePool = [];
        this.effectsContainer = null;
        this.isInitialized = false;
        
        // Remove styles
        const styles = document.getElementById('visual-effects-styles');
        if (styles) {
            styles.remove();
        }
        
        console.log('✨ Visual Effects destroyed');
    }
}