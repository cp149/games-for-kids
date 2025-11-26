/**
 * ScoreManager - Handles scoring and level progression
 * Manages score calculation, combos, and difficulty
 */

class ScoreManager {
    constructor() {
        this.currentScore = 0;
        this.targetScore = 500;
        this.currentLevel = 1;
        this.comboCount = 0;
        this.difficulty = CONFIG.GAME.DEFAULT_DIFFICULTY;

        this.reset();
    }

    /**
     * Reset score manager
     */
    reset() {
        this.currentScore = 0;
        this.comboCount = 0;
        this.updateTarget();
    }

    /**
     * Update target score based on difficulty
     */
    updateTarget() {
        const difficultyConfig = CONFIG.GAME.DIFFICULTY[this.difficulty];
        this.targetScore = difficultyConfig.targetScore;
    }

    /**
     * Calculate score for matches
     */
    calculateScore(matchCount, isCascade = false) {
        let points = 0;

        // Base score by match count
        if (matchCount === 3) {
            points = CONFIG.GAME.SCORE.MATCH_3;
        } else if (matchCount === 4) {
            points = CONFIG.GAME.SCORE.MATCH_4;
        } else if (matchCount === 5) {
            points = CONFIG.GAME.SCORE.MATCH_5;
        } else if (matchCount >= 6) {
            points = CONFIG.GAME.SCORE.MATCH_6_PLUS;
        }

        // Add combo bonus for cascades
        if (isCascade) {
            this.comboCount++;
            points += this.comboCount * CONFIG.GAME.SCORE.COMBO_BONUS;
        } else {
            this.comboCount = 0;
        }

        return points;
    }

    /**
     * Add score
     */
    addScore(points) {
        this.currentScore += points;
        return this.currentScore;
    }

    /**
     * Add score for matches
     */
    addMatchScore(matchCount, isCascade = false) {
        const points = this.calculateScore(matchCount, isCascade);
        this.addScore(points);
        return points;
    }

    /**
     * Check if level is complete
     */
    isLevelComplete() {
        return this.currentScore >= this.targetScore;
    }

    /**
     * Get current score
     */
    getScore() {
        return this.currentScore;
    }

    /**
     * Get target score
     */
    getTarget() {
        return this.targetScore;
    }

    /**
     * Get current level
     */
    getLevel() {
        return this.currentLevel;
    }

    /**
     * Get progress percentage
     */
    getProgress() {
        return Math.min((this.currentScore / this.targetScore) * 100, 100);
    }

    /**
     * Get star rating based on performance
     */
    getStarRating() {
        const progress = this.currentScore / this.targetScore;

        if (progress >= 2.0) return 3; // 200%+ = 3 stars
        if (progress >= 1.5) return 2; // 150%+ = 2 stars
        if (progress >= 1.0) return 1; // 100%+ = 1 star

        return 0;
    }

    /**
     * Advance to next level
     */
    nextLevel() {
        this.currentLevel++;
        this.reset();
    }

    /**
     * Set difficulty
     */
    setDifficulty(difficulty) {
        if (CONFIG.GAME.DIFFICULTY[difficulty]) {
            this.difficulty = difficulty;
            this.updateTarget();
        }
    }

    /**
     * Get current difficulty
     */
    getDifficulty() {
        return this.difficulty;
    }

    /**
     * Get current combo count
     */
    getCombo() {
        return this.comboCount;
    }

    /**
     * Reset combo
     */
    resetCombo() {
        this.comboCount = 0;
    }

    /**
     * Get game statistics
     */
    getStats() {
        return {
            score: this.currentScore,
            target: this.targetScore,
            level: this.currentLevel,
            progress: this.getProgress(),
            stars: this.getStarRating(),
            combo: this.comboCount,
            difficulty: this.difficulty
        };
    }

    /**
     * Clean up resources
     */
    destroy() {
        // Nothing to clean up for score manager
    }
}
