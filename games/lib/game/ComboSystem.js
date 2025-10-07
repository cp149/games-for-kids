/**
 * Combo System for KAPLAY games
 * Tracks combos, multipliers, and provides callbacks for combo events
 */

export class ComboSystem {
    constructor(k, config = {}) {
        this.k = k;
        this.combo = 0;
        this.comboTimer = 0;
        this.timeout = config.timeout || 3; // seconds

        // Multiplier tiers [minCombo, multiplier]
        this.tiers = config.tiers || [
            { min: 0, multiplier: 1 },
            { min: 5, multiplier: 1.5 },
            { min: 10, multiplier: 2 },
            { min: 20, multiplier: 3 }
        ];

        // Color tiers [minCombo, [r, g, b]]
        this.colors = config.colors || [
            { min: 0, color: [255, 255, 255] },   // white
            { min: 5, color: [255, 255, 0] },     // yellow
            { min: 10, color: [255, 165, 0] },    // orange
            { min: 20, color: [255, 0, 0] }       // red
        ];

        // Callbacks
        this.onComboChange = null;  // (combo, multiplier) => void
        this.onLevelUp = null;      // (level) => void
        this.onComboEnd = null;     // () => void
    }

    /**
     * Get current multiplier based on combo count
     */
    getMultiplier() {
        for (let i = this.tiers.length - 1; i >= 0; i--) {
            if (this.combo >= this.tiers[i].min) {
                return this.tiers[i].multiplier;
            }
        }
        return 1;
    }

    /**
     * Get current combo color
     */
    getColor() {
        for (let i = this.colors.length - 1; i >= 0; i--) {
            if (this.combo >= this.colors[i].min) {
                return this.colors[i].color;
            }
        }
        return [255, 255, 255];
    }

    /**
     * Get current combo level (tier index)
     */
    getLevel() {
        for (let i = this.tiers.length - 1; i >= 0; i--) {
            if (this.combo >= this.tiers[i].min) {
                return i;
            }
        }
        return 0;
    }

    /**
     * Increment combo by 1
     * @returns {number} Current multiplier
     */
    increment() {
        const oldLevel = this.getLevel();
        this.combo++;
        this.comboTimer = 0;
        const newLevel = this.getLevel();

        if (this.onComboChange) {
            this.onComboChange(this.combo, this.getMultiplier());
        }

        if (newLevel > oldLevel && this.onLevelUp) {
            this.onLevelUp(newLevel);
        }

        return this.getMultiplier();
    }

    /**
     * Update combo timer (call every frame)
     */
    update(dt) {
        if (this.combo > 0) {
            this.comboTimer += dt;
            if (this.comboTimer >= this.timeout) {
                this.reset();
                if (this.onComboEnd) {
                    this.onComboEnd();
                }
            }
        }
    }

    /**
     * Reset combo to 0
     */
    reset() {
        this.combo = 0;
        this.comboTimer = 0;
        if (this.onComboChange) {
            this.onComboChange(0, 1);
        }
    }

    /**
     * Get time remaining until combo expires
     */
    getTimeLeft() {
        return Math.max(0, this.timeout - this.comboTimer);
    }

    /**
     * Get progress percentage (0-1) of time remaining
     */
    getProgress() {
        return this.combo > 0 ? this.getTimeLeft() / this.timeout : 0;
    }

    /**
     * Get current combo count
     */
    getCombo() {
        return this.combo;
    }

    /**
     * Set combo to specific value (useful for loading/debugging)
     */
    setCombo(value) {
        this.combo = Math.max(0, value);
        this.comboTimer = 0;
        if (this.onComboChange) {
            this.onComboChange(this.combo, this.getMultiplier());
        }
    }
}
