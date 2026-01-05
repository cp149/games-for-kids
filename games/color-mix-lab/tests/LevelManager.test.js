/**
 * LevelManager Unit Tests
 * Tests LevelManager state machine functionality
 */

const test = require('node:test');
const assert = require('node:assert');

// Mock localStorage
const mockStorage = {};
global.localStorage = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, value) => { mockStorage[key] = value; },
  removeItem: (key) => { delete mockStorage[key]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};

// Load classes
const { Level } = require('../js/classes/Level.js');
const { LevelManager } = require('../js/managers/LevelManager.js');

// Test level configs
const testLevelConfigs = [
  { id: 1, type: 'mix', target: 'ORANGE', slotCount: 2, difficulty: 'easy' },
  { id: 2, type: 'mix', target: 'GREEN', slotCount: 2, difficulty: 'easy' },
  { id: 3, type: 'quiz', target: 'PURPLE', given: 'RED', missing: 'BLUE', slotCount: 2, difficulty: 'medium' },
  { id: 4, type: 'mix', target: 'BROWN', slotCount: 3, difficulty: 'hard' }
];

const testStorageKeys = {
  LEVEL: 'test_level',
  COMPLETED_LEVELS: 'test_completed'
};

test('LevelManager - Constructor', async (t) => {
  await t.test('initializes with level configs', () => {
    localStorage.clear();
    const manager = new LevelManager(testLevelConfigs, testStorageKeys);

    assert.strictEqual(manager.levels.length, 4);
    assert.strictEqual(manager.currentIndex, 0);
    assert.ok(manager.completedLevels instanceof Set);
    assert.strictEqual(manager.completedLevels.size, 0);
  });

  await t.test('creates Level objects from configs', () => {
    localStorage.clear();
    const manager = new LevelManager(testLevelConfigs, testStorageKeys);

    assert.ok(manager.levels[0] instanceof Level);
    assert.strictEqual(manager.levels[0].target, 'ORANGE');
    assert.strictEqual(manager.levels[3].slotCount, 3);
  });

  await t.test('loads saved progress from localStorage', () => {
    localStorage.clear();
    // Stored as 1-based level number, so "3" means level 3 = index 2
    localStorage.setItem(testStorageKeys.LEVEL, '3');
    localStorage.setItem(testStorageKeys.COMPLETED_LEVELS, JSON.stringify([1, 2]));

    const manager = new LevelManager(testLevelConfigs, testStorageKeys);

    assert.strictEqual(manager.currentIndex, 2); // Level 3 = index 2
    assert.strictEqual(manager.completedLevels.size, 2);
    assert.ok(manager.completedLevels.has(1));
    assert.ok(manager.completedLevels.has(2));
  });
});

test('LevelManager - getCurrentLevel()', async (t) => {
  await t.test('returns current Level object', () => {
    localStorage.clear();
    const manager = new LevelManager(testLevelConfigs, testStorageKeys);

    const level = manager.getCurrentLevel();

    assert.ok(level instanceof Level);
    assert.strictEqual(level.id, 1);
    assert.strictEqual(level.target, 'ORANGE');
  });

  await t.test('returns correct level after progression', () => {
    localStorage.clear();
    const manager = new LevelManager(testLevelConfigs, testStorageKeys);
    manager.nextLevel();

    const level = manager.getCurrentLevel();

    assert.strictEqual(level.id, 2);
    assert.strictEqual(level.target, 'GREEN');
  });
});

test('LevelManager - hasNextLevel()', async (t) => {
  await t.test('returns true when not at last level', () => {
    localStorage.clear();
    const manager = new LevelManager(testLevelConfigs, testStorageKeys);

    assert.strictEqual(manager.hasNextLevel(), true);
  });

  await t.test('returns false at last level', () => {
    localStorage.clear();
    const manager = new LevelManager(testLevelConfigs, testStorageKeys);
    manager.currentIndex = 3; // Last level

    assert.strictEqual(manager.hasNextLevel(), false);
  });
});

test('LevelManager - nextLevel()', async (t) => {
  await t.test('advances to next level and returns Level', () => {
    localStorage.clear();
    const manager = new LevelManager(testLevelConfigs, testStorageKeys);

    const result = manager.nextLevel();

    assert.ok(result instanceof Level);
    assert.strictEqual(result.id, 2);
    assert.strictEqual(manager.currentIndex, 1);
  });

  await t.test('saves progress to localStorage', () => {
    localStorage.clear();
    const manager = new LevelManager(testLevelConfigs, testStorageKeys);
    manager.nextLevel();

    // Stored as 1-based (level 2 = index 1, stored as "2")
    assert.strictEqual(localStorage.getItem(testStorageKeys.LEVEL), '2');
  });

  await t.test('returns null at last level', () => {
    localStorage.clear();
    const manager = new LevelManager(testLevelConfigs, testStorageKeys);
    manager.currentIndex = 3;

    const result = manager.nextLevel();

    assert.strictEqual(result, null);
    assert.strictEqual(manager.currentIndex, 3);
  });
});

test('LevelManager - completeCurrentLevel()', async (t) => {
  await t.test('marks current level as completed', () => {
    localStorage.clear();
    const manager = new LevelManager(testLevelConfigs, testStorageKeys);

    manager.completeCurrentLevel();

    assert.ok(manager.completedLevels.has(1));
  });

  await t.test('saves completed levels to localStorage', () => {
    localStorage.clear();
    const manager = new LevelManager(testLevelConfigs, testStorageKeys);

    manager.completeCurrentLevel();

    const saved = JSON.parse(localStorage.getItem(testStorageKeys.COMPLETED_LEVELS));
    assert.ok(saved.includes(1));
  });

  await t.test('does not duplicate completed levels', () => {
    localStorage.clear();
    const manager = new LevelManager(testLevelConfigs, testStorageKeys);

    manager.completeCurrentLevel();
    manager.completeCurrentLevel();

    assert.strictEqual(manager.completedLevels.size, 1);
  });
});

test('LevelManager - isLevelCompleted()', async (t) => {
  await t.test('returns true for completed level', () => {
    localStorage.clear();
    const manager = new LevelManager(testLevelConfigs, testStorageKeys);
    manager.completeCurrentLevel();

    assert.strictEqual(manager.isLevelCompleted(1), true);
  });

  await t.test('returns false for uncompleted level', () => {
    localStorage.clear();
    const manager = new LevelManager(testLevelConfigs, testStorageKeys);

    assert.strictEqual(manager.isLevelCompleted(1), false);
    assert.strictEqual(manager.isLevelCompleted(2), false);
  });
});

test('LevelManager - getCompletedCount()', async (t) => {
  await t.test('returns 0 initially', () => {
    localStorage.clear();
    const manager = new LevelManager(testLevelConfigs, testStorageKeys);

    assert.strictEqual(manager.getCompletedCount(), 0);
  });

  await t.test('returns correct count after completions', () => {
    localStorage.clear();
    const manager = new LevelManager(testLevelConfigs, testStorageKeys);

    manager.completeCurrentLevel();
    manager.nextLevel();
    manager.completeCurrentLevel();

    assert.strictEqual(manager.getCompletedCount(), 2);
  });
});

test('LevelManager - getTotalLevels()', async (t) => {
  await t.test('returns total level count', () => {
    localStorage.clear();
    const manager = new LevelManager(testLevelConfigs, testStorageKeys);

    assert.strictEqual(manager.getTotalLevels(), 4);
  });
});

test('LevelManager - resetProgress()', async (t) => {
  await t.test('resets to initial state', () => {
    localStorage.clear();
    const manager = new LevelManager(testLevelConfigs, testStorageKeys);

    manager.nextLevel();
    manager.nextLevel();
    manager.completeCurrentLevel();
    manager.resetProgress();

    assert.strictEqual(manager.currentIndex, 0);
    assert.strictEqual(manager.completedLevels.size, 0);
  });

  await t.test('saves reset state to localStorage', () => {
    localStorage.clear();
    const manager = new LevelManager(testLevelConfigs, testStorageKeys);

    manager.nextLevel();
    manager.completeCurrentLevel();
    manager.resetProgress();

    // After reset, saves level 1 (index 0 + 1)
    assert.strictEqual(localStorage.getItem(testStorageKeys.LEVEL), '1');
    // Completed levels is empty array
    assert.strictEqual(localStorage.getItem(testStorageKeys.COMPLETED_LEVELS), '[]');
  });
});
