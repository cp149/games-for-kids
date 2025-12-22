/**
 * BuffManager - Handles all buff/power-up logic
 * Manages score multipliers, speed boosts, magnet effects, and combo system
 */
class BuffManager {
    constructor(logger) {
        this.logger = logger || console;

        // Buff states
        this.scoreMultiplier = 1;
        this.scoreMultiplierTimer = 0;
        this.speedBoostTimer = 0;
        this.originalSpeed = 0;
        this.magnetTimer = 0;
        this.magnetRange = 0;

        // Combo system
        this.comboCount = 0;
        this.comboTimer = 0;
        this.comboTimeWindow = 2.0; // 2 seconds to maintain combo
    }

    /**
     * Reset all buffs and combo
     */
    reset() {
        this.scoreMultiplier = 1;
        this.scoreMultiplierTimer = 0;
        this.speedBoostTimer = 0;
        this.originalSpeed = 0;
        this.magnetTimer = 0;
        this.magnetRange = 0;
        this.comboCount = 0;
        this.comboTimer = 0;
    }

    /**
     * Update all buff timers
     * @param {number} deltaTime - Time since last frame in seconds
     * @param {Snake} playerSnake - Player snake for buff effects
     * @param {Array} foods - Food array for magnet effect
     */
    update(deltaTime, playerSnake, foods) {
        // Update score multiplier timer
        if (this.scoreMultiplierTimer > 0) {
            this.scoreMultiplierTimer -= deltaTime;
            if (this.scoreMultiplierTimer <= 0) {
                this.scoreMultiplier = 1;
                this.logger.log('💎 Score multiplier expired');
            }
        }

        // Update speed boost timer
        if (this.speedBoostTimer > 0) {
            this.speedBoostTimer -= deltaTime;
            if (this.speedBoostTimer <= 0 && this.originalSpeed > 0) {
                if (playerSnake) {
                    playerSnake.speed = this.originalSpeed;
                }
                this.originalSpeed = 0;
                this.logger.log('⚡ Speed boost expired');
            }
        }

        // Update magnet timer and apply magnet effect
        if (this.magnetTimer > 0) {
            this.magnetTimer -= deltaTime;
            if (this.magnetTimer <= 0) {
                this.magnetRange = 0;
                this.logger.log('🧲 Magnet expired');
            } else {
                // Magnet effect - pull nearby food towards player
                this.applyMagnetEffect(playerSnake, foods, deltaTime);
            }
        }

        // Update combo timer
        if (this.comboTimer > 0) {
            this.comboTimer -= deltaTime;
            if (this.comboTimer <= 0) {
                if (this.comboCount >= 3) {
                    // Combo ended - return event
                    const count = this.comboCount;
                    this.comboCount = 0;
                    return { comboEnded: true, count: count };
                }
                this.comboCount = 0;
            }
        }

        return null;
    }

    /**
     * Apply magnet effect to pull food towards player
     */
    applyMagnetEffect(playerSnake, foods, deltaTime) {
        if (!playerSnake || playerSnake.isAlive === false) return;
        if (!foods || !Array.isArray(foods)) return;

        const head = playerSnake.getHead();
        if (!head) return;

        for (const food of foods) {
            if (!food || typeof food.x !== 'number' || typeof food.y !== 'number') continue;
            if (!isFinite(food.x) || !isFinite(food.y)) continue;

            const dist = MathUtils.distance(head.x, head.y, food.x, food.y);
            if (!isFinite(dist)) continue;

            if (dist < this.magnetRange && dist > CONFIG.FOOD.COLLECTION_RADIUS) {
                // Pull food towards player
                const angle = Math.atan2(head.y - food.y, head.x - food.x);
                const pullSpeed = 300 * deltaTime; // Pull speed
                const dx = Math.cos(angle) * pullSpeed;
                const dy = Math.sin(angle) * pullSpeed;

                if (isFinite(dx) && isFinite(dy)) {
                    food.x += dx;
                    food.y += dy;
                }
            }
        }
    }

    /**
     * Activate speed boost
     */
    activateSpeedBoost(playerSnake, duration) {
        if (!playerSnake) return;

        if (this.speedBoostTimer <= 0) {
            this.originalSpeed = playerSnake.speed;
        }
        playerSnake.speed = playerSnake.speed * 1.5;
        this.speedBoostTimer = duration / 1000; // Convert to seconds
        this.logger.log('⚡ Speed boost activated:', duration, 'ms');
    }

    /**
     * Activate score multiplier
     */
    activateScoreMultiplier(multiplier, duration) {
        this.scoreMultiplier = multiplier;
        this.scoreMultiplierTimer = duration / 1000; // Convert to seconds
        this.logger.log('💎 Score multiplier activated:', multiplier, 'x for', duration, 'ms');
    }

    /**
     * Activate magnet
     */
    activateMagnet(range, duration) {
        this.magnetRange = range;
        this.magnetTimer = duration / 1000; // Convert to seconds
        this.logger.info('🧲 Magnet activated! Range:', range);
    }

    /**
     * Increment combo count
     */
    incrementCombo() {
        this.comboCount++;
        this.comboTimer = this.comboTimeWindow;
    }

    /**
     * Get combo multiplier for scoring
     */
    getComboMultiplier() {
        if (this.comboCount >= 10) return 3;
        if (this.comboCount >= 5) return 2;
        if (this.comboCount >= 3) return 1.5;
        return 1;
    }

    /**
     * Calculate score with all multipliers
     */
    calculateScore(baseScore) {
        const comboMultiplier = this.getComboMultiplier();
        return Math.floor(baseScore * this.scoreMultiplier * comboMultiplier);
    }

    /**
     * Check if magnet is active
     */
    hasMagnet() {
        return this.magnetTimer > 0;
    }

    /**
     * Get magnet range for rendering
     */
    getMagnetRange() {
        return this.magnetRange;
    }

    /**
     * Check if combo is active
     */
    hasCombo() {
        return this.comboCount > 0;
    }

    /**
     * Get current combo count
     */
    getComboCount() {
        return this.comboCount;
    }
}

// Export for ES6 modules (testing)
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = { BuffManager };
}
