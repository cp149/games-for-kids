/**
 * Level Unit Tests
 * Tests Level class OOP functionality
 */

const test = require('node:test');
const assert = require('node:assert');

// Load Level class
const { Level } = require('../js/classes/Level.js');

test('Level - Constructor', async (t) => {
  await t.test('creates level with default properties', () => {
    const level = new Level({ id: 1, target: 'ORANGE' });

    assert.strictEqual(level.id, 1);
    assert.strictEqual(level.type, 'mix');
    assert.strictEqual(level.target, 'ORANGE');
    assert.strictEqual(level.slotCount, 2);
    assert.strictEqual(level.difficulty, 'easy');
    assert.strictEqual(level.given, null);
    assert.strictEqual(level.missing, null);
  });

  await t.test('creates quiz level with all properties', () => {
    const level = new Level({
      id: 5,
      type: 'quiz',
      target: 'GREEN',
      given: 'YELLOW',
      missing: 'BLUE',
      slotCount: 2,
      difficulty: 'medium'
    });

    assert.strictEqual(level.id, 5);
    assert.strictEqual(level.type, 'quiz');
    assert.strictEqual(level.target, 'GREEN');
    assert.strictEqual(level.given, 'YELLOW');
    assert.strictEqual(level.missing, 'BLUE');
    assert.strictEqual(level.slotCount, 2);
    assert.strictEqual(level.difficulty, 'medium');
  });

  await t.test('creates 3-slot level', () => {
    const level = new Level({
      id: 10,
      type: 'mix',
      target: 'BROWN',
      slotCount: 3,
      difficulty: 'hard'
    });

    assert.strictEqual(level.slotCount, 3);
    assert.strictEqual(level.difficulty, 'hard');
  });
});

test('Level - validate()', async (t) => {
  await t.test('returns true for matching color', () => {
    const level = new Level({ id: 1, target: 'ORANGE' });
    assert.strictEqual(level.validate('ORANGE'), true);
  });

  await t.test('returns false for non-matching color', () => {
    const level = new Level({ id: 1, target: 'ORANGE' });
    assert.strictEqual(level.validate('GREEN'), false);
    assert.strictEqual(level.validate('PURPLE'), false);
    assert.strictEqual(level.validate('MUD'), false);
  });

  await t.test('validates 3-color targets', () => {
    const level = new Level({ id: 10, target: 'BROWN', slotCount: 3 });
    assert.strictEqual(level.validate('BROWN'), true);
    assert.strictEqual(level.validate('ORANGE'), false);
  });
});

test('Level - isQuiz()', async (t) => {
  await t.test('returns true for quiz type', () => {
    const level = new Level({ id: 1, type: 'quiz', target: 'GREEN', given: 'YELLOW' });
    assert.strictEqual(level.isQuiz(), true);
  });

  await t.test('returns false for mix type', () => {
    const level = new Level({ id: 1, type: 'mix', target: 'ORANGE' });
    assert.strictEqual(level.isQuiz(), false);
  });

  await t.test('returns false for default type', () => {
    const level = new Level({ id: 1, target: 'ORANGE' });
    assert.strictEqual(level.isQuiz(), false);
  });
});

test('Level - isThreeSlot()', async (t) => {
  await t.test('returns true for 3-slot level', () => {
    const level = new Level({ id: 10, target: 'BROWN', slotCount: 3 });
    assert.strictEqual(level.isThreeSlot(), true);
  });

  await t.test('returns false for 2-slot level', () => {
    const level = new Level({ id: 1, target: 'ORANGE', slotCount: 2 });
    assert.strictEqual(level.isThreeSlot(), false);
  });

  await t.test('returns false for default slot count', () => {
    const level = new Level({ id: 1, target: 'ORANGE' });
    assert.strictEqual(level.isThreeSlot(), false);
  });
});

test('Level - getHintColors()', async (t) => {
  // Use same format as CONFIG.MIXING_RULES (sorted keys)
  const mockMixingRules = {
    'RED+YELLOW': 'ORANGE',
    'BLUE+YELLOW': 'GREEN',
    'BLUE+RED': 'PURPLE',
    'BLUE+RED+YELLOW': 'BROWN'
  };

  await t.test('returns colors for 2-color mix level', () => {
    const level = new Level({ id: 1, target: 'ORANGE' });
    const hints = level.getHintColors(mockMixingRules);

    assert.ok(Array.isArray(hints));
    assert.strictEqual(hints.length, 2);
    assert.ok(hints.includes('RED'));
    assert.ok(hints.includes('YELLOW'));
  });

  await t.test('returns colors for 3-color mix level', () => {
    const level = new Level({ id: 10, target: 'BROWN', slotCount: 3 });
    const hints = level.getHintColors(mockMixingRules);

    assert.ok(Array.isArray(hints));
    assert.strictEqual(hints.length, 3);
    assert.ok(hints.includes('RED'));
    assert.ok(hints.includes('BLUE'));
    assert.ok(hints.includes('YELLOW'));
  });

  await t.test('returns missing color for quiz level', () => {
    const level = new Level({
      id: 5,
      type: 'quiz',
      target: 'GREEN',
      given: 'YELLOW',
      missing: 'BLUE'
    });
    const hints = level.getHintColors(mockMixingRules);

    assert.ok(Array.isArray(hints));
    assert.strictEqual(hints.length, 1);
    assert.strictEqual(hints[0], 'BLUE');
  });

  await t.test('returns empty array for unknown target', () => {
    const level = new Level({ id: 1, target: 'UNKNOWN_COLOR' });
    const hints = level.getHintColors(mockMixingRules);

    assert.ok(Array.isArray(hints));
    assert.strictEqual(hints.length, 0);
  });
});
