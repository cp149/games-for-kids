/**
 * Camera Manager - Handles viewport following
 */

class CameraManager {
    constructor(viewportWidth, viewportHeight, worldSize) {
        this.x = worldSize / 2 - viewportWidth / 2;
        this.y = worldSize / 2 - viewportHeight / 2;
        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;
        this.worldSize = worldSize;
    }

    /**
     * Follow target (snake head)
     */
    follow(target) {
        const targetX = target.x - this.viewportWidth / 2;
        const targetY = target.y - this.viewportHeight / 2;

        // Smooth lerp
        this.x = MathUtils.lerp(this.x, targetX, CONFIG.CAMERA.LERP_SPEED);
        this.y = MathUtils.lerp(this.y, targetY, CONFIG.CAMERA.LERP_SPEED);

        // Clamp to world bounds
        this.x = MathUtils.clamp(this.x, 0, this.worldSize - this.viewportWidth);
        this.y = MathUtils.clamp(this.y, 0, this.worldSize - this.viewportHeight);
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
    module.exports = CameraManager;
}
