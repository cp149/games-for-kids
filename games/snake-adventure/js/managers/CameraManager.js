/**
 * Camera Manager - Enhanced viewport following with smooth tracking
 */

class CameraManager {
    constructor(viewportWidth, viewportHeight, worldSize) {
        this.x = worldSize / 2 - viewportWidth / 2;
        this.y = worldSize / 2 - viewportHeight / 2;
        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;
        this.worldSize = worldSize;

        // Camera shake
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.shakeX = 0;
        this.shakeY = 0;
    }

    /**
     * Follow target (snake head) with enhanced smoothing
     */
    follow(target) {
        // Validate target
        if (!target || typeof target.x !== 'number' || typeof target.y !== 'number') {
            return;
        }

        const targetX = target.x - this.viewportWidth / 2;
        const targetY = target.y - this.viewportHeight / 2;

        // Adaptive lerp based on distance (faster when far, smoother when close)
        const distance = Math.sqrt(
            Math.pow(targetX - this.x, 2) + Math.pow(targetY - this.y, 2)
        );
        const adaptiveLerp = MathUtils.clamp(
            CONFIG.CAMERA.LERP_SPEED + (distance / 1000) * 0.05,
            CONFIG.CAMERA.LERP_SPEED,
            0.15
        );

        // Smooth lerp with adaptive speed
        this.x = MathUtils.lerp(this.x, targetX, adaptiveLerp);
        this.y = MathUtils.lerp(this.y, targetY, adaptiveLerp);

        // Clamp to world bounds
        this.x = MathUtils.clamp(this.x, 0, this.worldSize - this.viewportWidth);
        this.y = MathUtils.clamp(this.y, 0, this.worldSize - this.viewportHeight);
    }

    /**
     * Trigger camera shake effect
     */
    shake(intensity = 10, duration = 0.3) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
    }

    /**
     * Update camera shake
     */
    update(deltaTime) {
        if (this.shakeDuration > 0) {
            this.shakeDuration -= deltaTime;

            // Random shake offset
            const angle = Math.random() * Math.PI * 2;
            const intensity = this.shakeIntensity * (this.shakeDuration / 0.3);
            this.shakeX = Math.cos(angle) * intensity;
            this.shakeY = Math.sin(angle) * intensity;

            if (this.shakeDuration <= 0) {
                this.shakeX = 0;
                this.shakeY = 0;
            }
        }
    }

    /**
     * Get camera position with shake applied
     */
    getX() {
        const x = this.x + this.shakeX;
        return isFinite(x) ? x : 0;
    }

    getY() {
        const y = this.y + this.shakeY;
        return isFinite(y) ? y : 0;
    }

    /**
     * Update viewport size
     */
    resize(width, height) {
        this.viewportWidth = width;
        this.viewportHeight = height;
    }

    /**
     * Cleanup
     */
    destroy() {
        // No cleanup needed
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CameraManager };
}
