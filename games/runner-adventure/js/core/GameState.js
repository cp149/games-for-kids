/**
 * Game State Manager
 * Manages game state including score, speed, power-ups, combos, etc.
 */

import { GAME_CONFIG, COLORS } from './config.js';

export class GameState {
    constructor() {
        this.score = 0;
        this.gameSpeed = 1;
        this.highScore = parseInt(localStorage.getItem('runnerHighScore') || '0');

        // Combo system
        this.combo = 0;
        this.comboTimer = 0;

        // Power-up system
        this.activePowerUp = null;
        this.powerUpTimer = 0;
        this.speedMultiplier = 1;
        this.jumpMultiplier = 1;

        // Invincibility
        this.invincible = false;
        this.invincibleTimer = 0;
    }

    /**
     * Update game speed based on score
     */
    updateSpeed() {
        if (!this.activePowerUp) {
            this.gameSpeed = Math.min(
                GAME_CONFIG.MAX_GAME_SPEED,
                1 + Math.floor(this.score / GAME_CONFIG.SPEED_INCREASE_SCORE) * GAME_CONFIG.SPEED_INCREASE_AMOUNT
            );
        }
    }

    /**
     * Update power-up timer
     */
    updatePowerUp(dt) {
        if (this.activePowerUp) {
            this.powerUpTimer -= dt;
            if (this.powerUpTimer <= 0) {
                this.deactivatePowerUp();
            }
        }
    }

    /**
     * Activate a power-up
     */
    activatePowerUp(type, duration) {
        this.activePowerUp = type;
        this.powerUpTimer = duration;

        if (type === "speed-boost") {
            this.speedMultiplier = 1.5;
            this.gameSpeed = 1.5;
        } else if (type === "slow-motion") {
            this.speedMultiplier = 0.6;
            this.gameSpeed = 0.6;
        } else if (type === "super-jump") {
            this.jumpMultiplier = 1.6;
        }
    }

    /**
     * Deactivate power-up
     */
    deactivatePowerUp() {
        this.activePowerUp = null;
        this.speedMultiplier = 1;
        this.jumpMultiplier = 1;
        // Reset to natural speed progression
        this.updateSpeed();
    }

    /**
     * Update combo timer
     */
    updateCombo(dt) {
        if (this.combo > 0) {
            this.comboTimer += dt;
            if (this.comboTimer >= GAME_CONFIG.COMBO_TIMEOUT) {
                this.resetCombo();
            }
        }
    }

    /**
     * Increment combo
     */
    incrementCombo() {
        this.combo++;
        this.comboTimer = 0;
    }

    /**
     * Reset combo
     */
    resetCombo() {
        this.combo = 0;
        this.comboTimer = 0;
    }

    /**
     * Get combo multiplier
     */
    getComboMultiplier() {
        if (this.combo < 5) return 1;
        if (this.combo < 10) return 1.5;
        if (this.combo < 20) return 2;
        return 3;
    }

    /**
     * Get combo color
     */
    getComboColor() {
        if (this.combo < 5) return COLORS.COMBO_WHITE;
        if (this.combo < 10) return COLORS.COMBO_YELLOW;
        if (this.combo < 20) return COLORS.COMBO_ORANGE;
        return COLORS.COMBO_RED;
    }

    /**
     * Add score with combo multiplier
     */
    addScore(baseScore) {
        const multiplier = this.getComboMultiplier();
        const points = Math.floor(baseScore * multiplier);
        this.score += points;
        return points;
    }

    /**
     * Update high score
     */
    updateHighScore() {
        if (Math.floor(this.score) > this.highScore) {
            this.highScore = Math.floor(this.score);
            localStorage.setItem('runnerHighScore', this.highScore.toString());
            return true;
        }
        return false;
    }

    /**
     * Get current state as object
     */
    getState() {
        return {
            score: this.score,
            gameSpeed: this.gameSpeed,
            highScore: this.highScore,
            combo: this.combo,
            activePowerUp: this.activePowerUp,
            jumpMultiplier: this.jumpMultiplier,
            invincible: this.invincible
        };
    }
}
