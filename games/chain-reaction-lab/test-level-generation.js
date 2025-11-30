/**
 * Level Generation Quality Tests
 * Ensures no orphaned nodes and strategic complexity
 */

import { LevelGenerator } from './src/utils/level-generator.js';
import { SolvabilityValidator } from './src/utils/solvability-validator.js';

const gen = new LevelGenerator();

function testDifficulty(difficulty, testCount = 20) {
  console.log(`\nTesting Difficulty ${difficulty} (${testCount} levels)...`);

  const stats = {
    passed: 0,
    failed: 0,
    errors: {
      unsolvable: 0,
      orphanButtons: 0,
      orphanGates: 0,
      orphanRelays: 0,
      notStrategic: 0
    }
  };

  for (let i = 0; i < testCount; i++) {
    try {
      const level = gen.generateLevel(difficulty);
      let failed = false;

      // Test 1: Solvability
      if (!SolvabilityValidator.isSolvable(level.mechanisms, level.connections, { difficulty })) {
        stats.errors.unsolvable++;
        failed = true;
      }

      // Test 2: No orphan buttons
      const buttons = level.mechanisms.filter(m => m.type === 'button');
      const orphanButtons = buttons.filter(b => {
        const btnIdx = level.mechanisms.indexOf(b);
        return level.connections.filter(c => c.from === btnIdx).length === 0;
      });
      if (orphanButtons.length > 0) {
        stats.errors.orphanButtons++;
        failed = true;
      }

      // Test 3: No orphan gates (with inputs but no outputs)
      const gates = level.mechanisms.filter(m => m.type === 'logic-gate');
      const orphanGates = gates.filter(gate => {
        const gateIdx = level.mechanisms.indexOf(gate);
        const inputs = level.connections.filter(c => c.to === gateIdx);
        const outputs = level.connections.filter(c => c.from === gateIdx);
        return inputs.length > 0 && outputs.length === 0;
      });
      if (orphanGates.length > 0) {
        stats.errors.orphanGates++;
        failed = true;
      }

      // Test 4: No orphan relays
      const relays = level.mechanisms.filter(m => m.type === 'relay');
      const orphanRelays = relays.filter(relay => {
        const relayIdx = level.mechanisms.indexOf(relay);
        const inputs = level.connections.filter(c => c.to === relayIdx);
        const outputs = level.connections.filter(c => c.from === relayIdx);
        return inputs.length === 0 || outputs.length === 0;
      });
      if (orphanRelays.length > 0) {
        stats.errors.orphanRelays++;
        failed = true;
      }

      // Test 5: Requires strategic thinking
      if (!SolvabilityValidator.requiresStrategicThinking(level.mechanisms, level.connections, { difficulty })) {
        stats.errors.notStrategic++;
        failed = true;
      }

      if (failed) {
        stats.failed++;
      } else {
        stats.passed++;
      }

    } catch (error) {
      console.error(`  Error generating level ${i + 1}:`, error.message);
      stats.failed++;
    }
  }

  // Report
  const passRate = (stats.passed / testCount * 100).toFixed(1);
  console.log(`  Results: ${stats.passed}/${testCount} passed (${passRate}%)`);

  if (stats.failed > 0) {
    console.log(`  Failures:`);
    if (stats.errors.unsolvable > 0) console.log(`    - Unsolvable: ${stats.errors.unsolvable}`);
    if (stats.errors.orphanButtons > 0) console.log(`    - Orphan buttons: ${stats.errors.orphanButtons}`);
    if (stats.errors.orphanGates > 0) console.log(`    - Orphan gates: ${stats.errors.orphanGates}`);
    if (stats.errors.orphanRelays > 0) console.log(`    - Orphan relays: ${stats.errors.orphanRelays}`);
    if (stats.errors.notStrategic > 0) console.log(`    - Not strategic: ${stats.errors.notStrategic}`);
  }

  return stats.passed === testCount;
}

// Run all tests
console.log('='.repeat(50));
console.log('Level Generation Quality Tests');
console.log('='.repeat(50));

const results = {
  diff3: testDifficulty(3),
  diff4: testDifficulty(4),
  diff5: testDifficulty(5)
};

console.log('\n' + '='.repeat(50));
console.log('Final Results:');
console.log(`  Difficulty 3: ${results.diff3 ? '✅ PASS' : '❌ FAIL'}`);
console.log(`  Difficulty 4: ${results.diff4 ? '✅ PASS' : '❌ FAIL'}`);
console.log(`  Difficulty 5: ${results.diff5 ? '✅ PASS' : '❌ FAIL'}`);

const allPassed = results.diff3 && results.diff4 && results.diff5;
console.log(`\nOverall: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
console.log('='.repeat(50));

process.exit(allPassed ? 0 : 1);
