/**
 * RenderManager - Handles all rendering operations
 * Optimized with caching for boundary and background elements
 */
class RenderManager {
    constructor(canvas, cameraManager, logger) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cameraManager = cameraManager;
        this.logger = logger || console;

        // Background stars
        this.stars = this.generateStars(150);

        // Cached boundary (offscreen canvas for optimization)
        this.boundaryCacheCanvas = null;
        this.boundaryCacheCtx = null;
        this.isBoundaryCached = false;
    }

    /**
     * Generate background stars
     */
    generateStars(count) {
        const stars = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * CONFIG.GAME.CANVAS_SIZE,
                y: Math.random() * CONFIG.GAME.CANVAS_SIZE,
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.5 + 0.3,
                twinkleSpeed: Math.random() * 2 + 1,
                twinklePhase: Math.random() * Math.PI * 2
            });
        }
        return stars;
    }

    /**
     * Update star twinkle animations
     */
    updateStars(deltaTime) {
        for (const star of this.stars) {
            star.twinklePhase += star.twinkleSpeed * deltaTime;
        }
    }

    /**
     * Cache boundary rendering to offscreen canvas (one-time optimization)
     */
    cacheBoundary() {
        if (this.isBoundaryCached) return;

        // Create offscreen canvas
        this.boundaryCacheCanvas = document.createElement('canvas');
        if (!this.boundaryCacheCanvas) {
            this.logger.warn('Failed to create boundary cache canvas');
            return;
        }

        this.boundaryCacheCanvas.width = CONFIG.GAME.CANVAS_SIZE;
        this.boundaryCacheCanvas.height = CONFIG.GAME.CANVAS_SIZE;
        this.boundaryCacheCtx = this.boundaryCacheCanvas.getContext('2d');

        if (!this.boundaryCacheCtx) {
            this.logger.warn('Failed to get boundary cache context');
            return;
        }

        const ctx = this.boundaryCacheCtx;

        // Base boundary line
        ctx.strokeStyle = CONFIG.GAME.BOUNDARY_COLOR;
        ctx.lineWidth = CONFIG.GAME.BOUNDARY_WIDTH;
        ctx.shadowBlur = CONFIG.GAME.BOUNDARY_GLOW;
        ctx.shadowColor = CONFIG.GAME.BOUNDARY_COLOR;
        ctx.strokeRect(0, 0, CONFIG.GAME.CANVAS_SIZE, CONFIG.GAME.CANVAS_SIZE);

        // Draw spikes
        const spikeSize = 30;
        const spikeSpacing = 50;
        ctx.fillStyle = CONFIG.GAME.BOUNDARY_COLOR;

        // Top spikes (pointing down)
        for (let x = 0; x < CONFIG.GAME.CANVAS_SIZE; x += spikeSpacing) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x + spikeSize / 2, spikeSize);
            ctx.lineTo(x + spikeSize, 0);
            ctx.closePath();
            ctx.fill();
        }

        // Bottom spikes (pointing up)
        for (let x = 0; x < CONFIG.GAME.CANVAS_SIZE; x += spikeSpacing) {
            const y = CONFIG.GAME.CANVAS_SIZE;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + spikeSize / 2, y - spikeSize);
            ctx.lineTo(x + spikeSize, y);
            ctx.closePath();
            ctx.fill();
        }

        // Left spikes (pointing right)
        for (let y = 0; y < CONFIG.GAME.CANVAS_SIZE; y += spikeSpacing) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(spikeSize, y + spikeSize / 2);
            ctx.lineTo(0, y + spikeSize);
            ctx.closePath();
            ctx.fill();
        }

        // Right spikes (pointing left)
        for (let y = 0; y < CONFIG.GAME.CANVAS_SIZE; y += spikeSpacing) {
            const x = CONFIG.GAME.CANVAS_SIZE;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x - spikeSize, y + spikeSize / 2);
            ctx.lineTo(x, y + spikeSize);
            ctx.closePath();
            ctx.fill();
        }

        ctx.shadowBlur = 0;
        this.isBoundaryCached = true;

        this.logger.log('✅ Boundary cached to offscreen canvas');
    }

    /**
     * Render animated stars in background
     */
    renderStars() {
        // Validate camera
        if (!this.cameraManager || typeof this.cameraManager.getX !== 'function' || typeof this.cameraManager.getY !== 'function') {
            return;
        }

        const cameraX = this.cameraManager.getX();
        const cameraY = this.cameraManager.getY();

        // Skip if invalid camera coordinates
        if (!isFinite(cameraX) || !isFinite(cameraY)) {
            return;
        }

        this.stars.forEach(star => {
            const x = star.x - cameraX;
            const y = star.y - cameraY;

            // Skip if outside viewport
            if (x < -100 || x > this.canvas.width + 100 ||
                y < -100 || y > this.canvas.height + 100) {
                return;
            }

            // Calculate twinkle opacity
            const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7;
            const opacity = star.opacity * twinkle;

            // Render star with glow
            this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.3})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, star.size * 2, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    /**
     * Render world boundary (using cached canvas)
     */
    renderBoundary() {
        // Validate camera
        if (!this.cameraManager || typeof this.cameraManager.getX !== 'function' || typeof this.cameraManager.getY !== 'function') {
            return;
        }

        // Cache boundary on first render
        if (!this.isBoundaryCached) {
            this.cacheBoundary();
        }

        // Validate cached canvas
        if (!this.boundaryCacheCanvas) {
            return;
        }

        // Draw cached boundary at camera position
        const left = -this.cameraManager.getX();
        const top = -this.cameraManager.getY();

        // Validate coordinates
        if (!isFinite(left) || !isFinite(top)) {
            return;
        }

        this.ctx.drawImage(this.boundaryCacheCanvas, left, top);
    }

    /**
     * Render magnet range indicator
     */
    renderMagnetRange(playerSnake, magnetRange) {
        if (!playerSnake || !playerSnake.isAlive || magnetRange <= 0) return;

        // Validate camera
        if (!this.cameraManager || typeof this.cameraManager.getX !== 'function' || typeof this.cameraManager.getY !== 'function') {
            return;
        }

        const head = playerSnake.getHead();
        if (!head) return;

        const screenX = head.x - this.cameraManager.getX();
        const screenY = head.y - this.cameraManager.getY();

        // Validate coordinates
        if (!isFinite(screenX) || !isFinite(screenY)) {
            return;
        }

        // Draw pulsing magnet range circle
        const pulse = Math.sin(performance.now() / 200) * 0.1 + 0.9;
        const gradient = this.ctx.createRadialGradient(
            screenX, screenY, 0,
            screenX, screenY, magnetRange * pulse
        );
        gradient.addColorStop(0, 'rgba(138, 43, 226, 0)');
        gradient.addColorStop(0.7, 'rgba(138, 43, 226, 0.15)');
        gradient.addColorStop(1, 'rgba(138, 43, 226, 0.3)');

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY, magnetRange * pulse, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw range circle outline
        this.ctx.strokeStyle = 'rgba(138, 43, 226, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 5]);
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY, magnetRange, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    /**
     * Render combo counter
     */
    renderCombo(comboCount) {
        if (comboCount < 3) return;

        const centerX = this.canvas.width / 2;
        const centerY = 180;

        // Combo background
        const pulseSize = 1 + Math.sin(performance.now() / 100) * 0.05;
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.scale(pulseSize, pulseSize);

        // Glow effect
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#ff6600';

        // Combo text
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // Outline
        const comboText = I18N.t('combo', { count: comboCount });
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 6;
        this.ctx.strokeText(comboText, 0, 0);

        // Fill with gradient
        const gradient = this.ctx.createLinearGradient(0, -30, 0, 30);
        gradient.addColorStop(0, '#ffff00');
        gradient.addColorStop(0.5, '#ff8800');
        gradient.addColorStop(1, '#ff3300');
        this.ctx.fillStyle = gradient;
        this.ctx.fillText(comboText, 0, 0);

        this.ctx.shadowBlur = 0;
        this.ctx.restore();
    }

    /**
     * Render pause overlay
     */
    renderPauseOverlay() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // Semi-transparent dark overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // "PAUSED" text with glow effect
        this.ctx.save();
        this.ctx.shadowBlur = 30;
        this.ctx.shadowColor = '#00ffff';

        // Main text
        this.ctx.font = 'bold 80px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // Outline
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 8;
        this.ctx.strokeText(I18N.t('paused'), centerX, centerY - 50);

        // Fill with gradient
        const gradient = this.ctx.createLinearGradient(0, centerY - 100, 0, centerY);
        gradient.addColorStop(0, '#00ffff');
        gradient.addColorStop(1, '#0088ff');
        this.ctx.fillStyle = gradient;
        this.ctx.fillText(I18N.t('paused'), centerX, centerY - 50);

        // Instruction text
        this.ctx.shadowBlur = 15;
        this.ctx.font = 'bold 28px Arial';
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 5;
        this.ctx.strokeText(I18N.t('right_click_to_resume'), centerX, centerY + 40);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(I18N.t('right_click_to_resume'), centerX, centerY + 40);

        this.ctx.restore();
    }

    /**
     * Main render method
     */
    render(state, playerSnake, buffManager, particleManager, snakeManager, foodManager,
           leaderboardManager, killFeedManager) {
        // Clear
        this.ctx.fillStyle = CONFIG.GAME.BACKGROUND_COLOR;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Render animated stars
        this.renderStars();

        // Draw boundary (cached, single draw call)
        this.renderBoundary();

        // Render game objects (with null checks)
        if (particleManager && typeof particleManager.render === 'function') {
            particleManager.render(this.ctx, this.cameraManager);
        }
        if (snakeManager && typeof snakeManager.render === 'function') {
            snakeManager.render(this.ctx, this.cameraManager);
        }
        if (foodManager && typeof foodManager.render === 'function') {
            foodManager.render(this.ctx, this.cameraManager);
        }

        // Render magnet range indicator if active
        if (buffManager && typeof buffManager.hasMagnet === 'function' && buffManager.hasMagnet()) {
            this.renderMagnetRange(playerSnake, buffManager.getMagnetRange());
        }

        // Render combo counter if active
        if (buffManager && typeof buffManager.hasCombo === 'function' && buffManager.hasCombo()) {
            this.renderCombo(buffManager.getComboCount());
        }

        // Render UI overlays (in screen space, not world space)
        if (leaderboardManager && typeof leaderboardManager.render === 'function') {
            leaderboardManager.render(this.ctx, this.canvas);
        }
        if (killFeedManager && typeof killFeedManager.render === 'function') {
            killFeedManager.render(this.ctx);
        }

        // Render pause overlay
        if (state === 'paused') {
            this.renderPauseOverlay();
        }
    }

    /**
     * Cleanup method
     */
    destroy() {
        // Release cached canvas
        if (this.boundaryCacheCanvas) {
            this.boundaryCacheCanvas.width = 0;
            this.boundaryCacheCanvas.height = 0;
            this.boundaryCacheCanvas = null;
            this.boundaryCacheCtx = null;
        }
    }
}

// Export for ES6 modules (testing)
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = { RenderManager };
}
