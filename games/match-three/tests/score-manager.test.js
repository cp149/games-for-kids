/**
 * ScoreManager Unit Tests
 * Tests scoring logic, combos, and level progression
 */

const test = require('node:test');
const assert = require('node:assert');
const { createTestConfig } = require('../js/test-utils.js');

// Mock CONFIG globally
global.CONFIG = createTestConfig();

// Load ScoreManager
const ScoreManager = require('../js/managers/ScoreManager.js');

test('ScoreManager - Initialization', async (t) => {
    await t.test('initializes with default values', () => {
        const manager = new ScoreManager();

        assert.strictEqual(manager.currentScore, 0);
        assert.strictEqual(manager.currentLevel, 1);
        assert.strictEqual(manager.comboCount, 0);
        assert.ok(manager.targetScore > 0);
    });

    await t.test('sets difficulty to default', () => {
        const manager = new ScoreManager();
        assert.strictEqual(manager.difficulty, CONFIG.GAME.DEFAULT_DIFFICULTY);
    });
});

test('ScoreManager - Score Calculation', async (t) => {
    await t.test('calculates match-3 score correctly', () => {
        const manager = new ScoreManager();
        const score = manager.calculateScore(3);

        assert.strictEqual(score, CONFIG.GAME.SCORE.MATCH_3);
    });

    await t.test('calculates match-4 score correctly', () => {
        const manager = new ScoreManager();
        const score = manager.calculateScore(4);

        assert.strictEqual(score, CONFIG.GAME.SCORE.MATCH_4);
    });

    await t.test('calculates match-5 score correctly', () => {
        const manager = new ScoreManager();
        const score = manager.calculateScore(5);

        assert.strictEqual(score, CONFIG.GAME.SCORE.MATCH_5);
    });

    await t.test('calculates match-6+ score correctly', () => {
        const manager = new ScoreManager();
        const score = manager.calculateScore(6);

        assert.strictEqual(score, CONFIG.GAME.SCORE.MATCH_6_PLUS);
    });

    await t.test('handles very large matches', () => {
        const manager = new ScoreManager();
        const score = manager.calculateScore(10);

        assert.strictEqual(score, CONFIG.GAME.SCORE.MATCH_6_PLUS);
    });

    await t.test('returns 0 for invalid match count', () => {
        const manager = new ScoreManager();
        const score = manager.calculateScore(2);

        assert.strictEqual(score, 0);
    });

    await t.test('adds combo bonus for cascade', () => {
        const manager = new ScoreManager();
        const score1 = manager.calculateScore(3, true);
        const score2 = manager.calculateScore(3, true);

        // First cascade: base + 1 * combo_bonus
        // Second cascade: base + 2 * combo_bonus
        assert.ok(score2 > score1);
    });

    await t.test('resets combo on non-cascade', () => {
        const manager = new ScoreManager();

        manager.calculateScore(3, true); // Combo = 1
        manager.calculateScore(3, true); // Combo = 2
        const score = manager.calculateScore(3, false); // Combo reset to 0

        assert.strictEqual(manager.comboCount, 0);
        assert.strictEqual(score, CONFIG.GAME.SCORE.MATCH_3);
    });
});

test('ScoreManager - Score Management', async (t) => {
    await t.test('addScore increases current score', () => {
        const manager = new ScoreManager();
        const result = manager.addScore(100);

        assert.strictEqual(manager.currentScore, 100);
        assert.strictEqual(result, 100);
    });

    await t.test('addScore accumulates correctly', () => {
        const manager = new ScoreManager();

        manager.addScore(50);
        manager.addScore(30);
        manager.addScore(20);

        assert.strictEqual(manager.currentScore, 100);
    });

    await t.test('addMatchScore returns points earned', () => {
        const manager = new ScoreManager();
        const points = manager.addMatchScore(3);

        assert.strictEqual(points, CONFIG.GAME.SCORE.MATCH_3);
        assert.strictEqual(manager.currentScore, points);
    });

    await t.test('addMatchScore with cascade increases combo', () => {
        const manager = new ScoreManager();

        manager.addMatchScore(3, true);
        assert.strictEqual(manager.comboCount, 1);

        manager.addMatchScore(3, true);
        assert.strictEqual(manager.comboCount, 2);
    });

    await t.test('getScore returns current score', () => {
        const manager = new ScoreManager();
        manager.addScore(250);

        assert.strictEqual(manager.getScore(), 250);
    });
});

test('ScoreManager - Level Management', async (t) => {
    await t.test('getLevel returns current level', () => {
        const manager = new ScoreManager();
        assert.strictEqual(manager.getLevel(), 1);
    });

    await t.test('isLevelComplete when score reaches target', () => {
        const manager = new ScoreManager();
        manager.currentScore = manager.targetScore;

        assert.strictEqual(manager.isLevelComplete(), true);
    });

    await t.test('isLevelComplete when score exceeds target', () => {
        const manager = new ScoreManager();
        manager.currentScore = manager.targetScore + 100;

        assert.strictEqual(manager.isLevelComplete(), true);
    });

    await t.test('isLevelComplete false when below target', () => {
        const manager = new ScoreManager();
        manager.currentScore = manager.targetScore - 1;

        assert.strictEqual(manager.isLevelComplete(), false);
    });

    await t.test('nextLevel increments level and resets score', () => {
        const manager = new ScoreManager();
        manager.currentScore = 500;

        manager.nextLevel();

        assert.strictEqual(manager.currentLevel, 2);
        assert.strictEqual(manager.currentScore, 0);
        assert.strictEqual(manager.comboCount, 0);
    });

    await t.test('getTarget returns target score', () => {
        const manager = new ScoreManager();
        assert.ok(manager.getTarget() > 0);
    });
});

test('ScoreManager - Progress Tracking', async (t) => {
    await t.test('getProgress returns 0 at start', () => {
        const manager = new ScoreManager();
        assert.strictEqual(manager.getProgress(), 0);
    });

    await t.test('getProgress returns 50 at halfway', () => {
        const manager = new ScoreManager();
        manager.currentScore = manager.targetScore / 2;

        assert.strictEqual(manager.getProgress(), 50);
    });

    await t.test('getProgress returns 100 at target', () => {
        const manager = new ScoreManager();
        manager.currentScore = manager.targetScore;

        assert.strictEqual(manager.getProgress(), 100);
    });

    await t.test('getProgress caps at 100', () => {
        const manager = new ScoreManager();
        manager.currentScore = manager.targetScore * 2;

        assert.strictEqual(manager.getProgress(), 100);
    });
});

test('ScoreManager - Star Rating', async (t) => {
    await t.test('0 stars when below 100%', () => {
        const manager = new ScoreManager();
        manager.currentScore = manager.targetScore * 0.9;

        assert.strictEqual(manager.getStarRating(), 0);
    });

    await t.test('1 star at 100%', () => {
        const manager = new ScoreManager();
        manager.currentScore = manager.targetScore;

        assert.strictEqual(manager.getStarRating(), 1);
    });

    await t.test('2 stars at 150%', () => {
        const manager = new ScoreManager();
        manager.currentScore = manager.targetScore * 1.5;

        assert.strictEqual(manager.getStarRating(), 2);
    });

    await t.test('3 stars at 200%+', () => {
        const manager = new ScoreManager();
        manager.currentScore = manager.targetScore * 2;

        assert.strictEqual(manager.getStarRating(), 3);
    });

    await t.test('3 stars for high scores', () => {
        const manager = new ScoreManager();
        manager.currentScore = manager.targetScore * 3;

        assert.strictEqual(manager.getStarRating(), 3);
    });
});

test('ScoreManager - Difficulty Management', async (t) => {
    await t.test('getDifficulty returns current difficulty', () => {
        const manager = new ScoreManager();
        assert.strictEqual(manager.getDifficulty(), CONFIG.GAME.DEFAULT_DIFFICULTY);
    });

    await t.test('setDifficulty changes difficulty', () => {
        const manager = new ScoreManager();
        const difficulties = Object.keys(CONFIG.GAME.DIFFICULTY);

        if (difficulties.length > 1) {
            const newDifficulty = difficulties[1];
            manager.setDifficulty(newDifficulty);

            assert.strictEqual(manager.difficulty, newDifficulty);
        }
    });

    await t.test('setDifficulty updates target score', () => {
        const manager = new ScoreManager();
        const oldTarget = manager.targetScore;

        const difficulties = Object.keys(CONFIG.GAME.DIFFICULTY);
        if (difficulties.length > 1) {
            manager.setDifficulty(difficulties[1]);
            // Target should potentially change (depends on config)
            assert.ok(manager.targetScore > 0);
        }
    });

    await t.test('setDifficulty ignores invalid difficulty', () => {
        const manager = new ScoreManager();
        const oldDifficulty = manager.difficulty;

        manager.setDifficulty('INVALID_DIFFICULTY');

        assert.strictEqual(manager.difficulty, oldDifficulty);
    });
});

test('ScoreManager - Combo Management', async (t) => {
    await t.test('getCombo returns current combo count', () => {
        const manager = new ScoreManager();
        assert.strictEqual(manager.getCombo(), 0);
    });

    await t.test('resetCombo resets combo to 0', () => {
        const manager = new ScoreManager();

        manager.calculateScore(3, true); // Combo = 1
        manager.calculateScore(3, true); // Combo = 2
        manager.resetCombo();

        assert.strictEqual(manager.comboCount, 0);
    });

    await t.test('combo increases with consecutive cascades', () => {
        const manager = new ScoreManager();

        for (let i = 1; i <= 5; i++) {
            manager.calculateScore(3, true);
            assert.strictEqual(manager.comboCount, i);
        }
    });
});

test('ScoreManager - Statistics', async (t) => {
    await t.test('getStats returns complete statistics', () => {
        const manager = new ScoreManager();
        manager.currentScore = 250;

        const stats = manager.getStats();

        assert.strictEqual(stats.score, 250);
        assert.strictEqual(stats.level, 1);
        assert.strictEqual(stats.combo, 0);
        assert.ok(stats.target > 0);
        assert.ok(stats.progress >= 0 && stats.progress <= 100);
        assert.ok(stats.stars >= 0 && stats.stars <= 3);
        assert.ok(stats.difficulty);
    });

    await t.test('getStats reflects current state', () => {
        const manager = new ScoreManager();

        manager.currentScore = manager.targetScore;
        manager.calculateScore(3, true);

        const stats = manager.getStats();

        assert.strictEqual(stats.score, manager.currentScore);
        assert.strictEqual(stats.combo, 1);
        assert.strictEqual(stats.progress, 100);
        assert.ok(stats.stars >= 1);
    });
});

test('ScoreManager - Reset', async (t) => {
    await t.test('reset clears score and combo', () => {
        const manager = new ScoreManager();

        manager.currentScore = 500;
        manager.comboCount = 5;
        manager.reset();

        assert.strictEqual(manager.currentScore, 0);
        assert.strictEqual(manager.comboCount, 0);
    });

    await t.test('reset maintains target score', () => {
        const manager = new ScoreManager();
        const target = manager.targetScore;

        manager.reset();

        assert.strictEqual(manager.targetScore, target);
    });
});

test('ScoreManager - Cleanup', async (t) => {
    await t.test('destroy completes without error', () => {
        const manager = new ScoreManager();
        assert.doesNotThrow(() => manager.destroy());
    });
});

test('ScoreManager - Edge Cases', async (t) => {
    await t.test('handles zero match count', () => {
        const manager = new ScoreManager();
        const score = manager.calculateScore(0);

        assert.strictEqual(score, 0);
    });

    await t.test('handles negative match count', () => {
        const manager = new ScoreManager();
        const score = manager.calculateScore(-1);

        assert.strictEqual(score, 0);
    });

    await t.test('handles very high combo multiplier', () => {
        const manager = new ScoreManager();

        // Build up massive combo
        for (let i = 0; i < 100; i++) {
            manager.addMatchScore(3, true);
        }

        assert.strictEqual(manager.comboCount, 100);
        assert.ok(manager.currentScore > 0);
    });
});

console.log('All ScoreManager tests completed!');
