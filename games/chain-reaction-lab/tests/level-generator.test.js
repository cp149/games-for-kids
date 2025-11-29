/**
 * Unit tests for LevelGenerator
 * Tests position collision, button distribution, and solvability
 */

import { LevelGenerator } from '../src/utils/level-generator.js';

const generator = new LevelGenerator();

// Test 1: Position collision detection
function testPositionCollision() {
  console.log('\n=== Test 1: Position Collision Detection ===');

  let allPass = true;

  for (let difficulty = 1; difficulty <= 5; difficulty++) {
    const level = generator.generateLevel(difficulty);
    const mechanisms = level.mechanisms;

    let minDistance = Infinity;
    let closestPair = null;

    for (let i = 0; i < mechanisms.length; i++) {
      for (let j = i + 1; j < mechanisms.length; j++) {
        const dx = mechanisms[i].x - mechanisms[j].x;
        const dy = mechanisms[i].y - mechanisms[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < minDistance) {
          minDistance = distance;
          closestPair = [i, j];
        }
      }
    }

    const passed = minDistance >= 0.10;
    console.log(`  Difficulty ${difficulty}: min distance = ${minDistance.toFixed(3)} ${passed ? '✅' : '❌'}`);

    if (!passed) {
      console.log(`    Closest: ${mechanisms[closestPair[0]].type} <-> ${mechanisms[closestPair[1]].type}`);
      allPass = false;
    }
  }

  return allPass;
}

// Test 2: Button distribution (sliding window)
function testButtonDistribution() {
  console.log('\n=== Test 2: Button Distribution (MultiConnect) ===');

  let allPass = true;

  // Test difficulty 3: 4 buttons, 2 gates
  console.log('  Difficulty 3 (4 buttons, 2 gates):');
  for (let i = 0; i < 5; i++) {
    const level = generator.generateLevel(3);
    const mechanisms = level.mechanisms;
    const connections = level.connections;

    const gates = mechanisms.filter(m => m.type === 'logic-gate');

    for (const gate of gates) {
      const gateIdx = mechanisms.indexOf(gate);
      const inputs = connections.filter(c => c.to === gateIdx);

      // Each gate should have at least 2 inputs (can have more to use all buttons)
      if (inputs.length < 2) {
        console.log(`    ❌ Gate has ${inputs.length} inputs (expected ≥2)`);
        allPass = false;
      }

      // Inputs should be unique (no duplicate buttons)
      const inputIds = inputs.map(c => mechanisms[c.from].id);
      const uniqueInputs = new Set(inputIds);
      if (uniqueInputs.size !== inputIds.length) {
        console.log(`    ❌ Gate has duplicate inputs: ${inputIds.join(', ')}`);
        allPass = false;
      }
    }
  }

  if (allPass) {
    console.log('    ✅ All gates have ≥2 unique inputs');
  }

  return allPass;
}

// Test 3: No gate chaining in multiConnect mode
function testNoGateChaining() {
  console.log('\n=== Test 3: No Gate Chaining (MultiConnect) ===');

  let allPass = true;

  for (let difficulty = 3; difficulty <= 5; difficulty++) {
    let chainFound = false;

    for (let i = 0; i < 5; i++) {
      const level = generator.generateLevel(difficulty);
      const mechanisms = level.mechanisms;
      const connections = level.connections;

      const gates = mechanisms.filter(m => m.type === 'logic-gate');
      const gateIndices = gates.map(g => mechanisms.indexOf(g));

      // Check if any gate connects to another gate
      for (const conn of connections) {
        if (gateIndices.includes(conn.from) && gateIndices.includes(conn.to)) {
          chainFound = true;
          console.log(`  Difficulty ${difficulty}: ❌ Gate chaining found: gate → gate`);
          allPass = false;
          break;
        }
      }

      if (chainFound) break;
    }

    if (!chainFound) {
      console.log(`  Difficulty ${difficulty}: ✅ No gate chaining`);
    }
  }

  return allPass;
}

// Test 4: Door signal requirements match connections
function testDoorSignalRequirements() {
  console.log('\n=== Test 4: Door Signal Requirements ===');

  let allPass = true;

  const expected = {
    1: 1,
    2: 1,
    3: 2,
    4: 3,
    5: 4
  };

  for (let difficulty = 1; difficulty <= 5; difficulty++) {
    for (let i = 0; i < 3; i++) {
      const level = generator.generateLevel(difficulty);
      const mechanisms = level.mechanisms;
      const connections = level.connections;

      const door = mechanisms.find(m => m.type === 'door');
      const doorIdx = mechanisms.indexOf(door);

      // Count connections to door
      const doorConnections = connections.filter(c => c.to === doorIdx);

      if (door.requiredSignals !== expected[difficulty]) {
        console.log(`  Difficulty ${difficulty}: ❌ Door requires ${door.requiredSignals}, expected ${expected[difficulty]}`);
        allPass = false;
      }

      if (doorConnections.length !== expected[difficulty]) {
        console.log(`  Difficulty ${difficulty}: ❌ ${doorConnections.length} connections to door, expected ${expected[difficulty]}`);
        allPass = false;
      }
    }
  }

  if (allPass) {
    console.log('  ✅ All door requirements match expected values');
  }

  return allPass;
}

// Test 5: Level solvability
function testLevelSolvability() {
  console.log('\n=== Test 5: Level Solvability ===');

  let allPass = true;

  for (let difficulty = 1; difficulty <= 5; difficulty++) {
    let solvable = 0;
    const testCount = 10;

    for (let i = 0; i < testCount; i++) {
      const level = generator.generateLevel(difficulty);
      const mechanisms = level.mechanisms;
      const connections = level.connections;

      // BFS to check if door is reachable from buttons
      const buttons = mechanisms.filter(m => m.type === 'button');
      const door = mechanisms.find(m => m.type === 'door');

      const reachable = new Set();
      buttons.forEach(b => reachable.add(mechanisms.indexOf(b)));

      let changed = true;
      while (changed) {
        changed = false;
        for (const conn of connections) {
          if (reachable.has(conn.from) && !reachable.has(conn.to)) {
            reachable.add(conn.to);
            changed = true;
          }
        }
      }

      if (reachable.has(mechanisms.indexOf(door))) {
        solvable++;
      }
    }

    const pass = solvable === testCount;
    console.log(`  Difficulty ${difficulty}: ${solvable}/${testCount} solvable ${pass ? '✅' : '❌'}`);

    if (!pass) {
      allPass = false;
    }
  }

  return allPass;
}

// Test 6: Gate input types (no gate-to-gate in multiConnect)
function testGateInputTypes() {
  console.log('\n=== Test 6: Gate Input Types ===');

  let allPass = true;

  for (let difficulty = 3; difficulty <= 5; difficulty++) {
    for (let i = 0; i < 5; i++) {
      const level = generator.generateLevel(difficulty);
      const mechanisms = level.mechanisms;
      const connections = level.connections;

      const gates = mechanisms.filter(m => m.type === 'logic-gate');

      for (const gate of gates) {
        const gateIdx = mechanisms.indexOf(gate);
        const inputs = connections.filter(c => c.to === gateIdx);

        // In multiConnect mode, all gate inputs should be buttons
        const inputTypes = inputs.map(c => mechanisms[c.from].type);
        const hasGateInput = inputTypes.includes('logic-gate');

        if (hasGateInput) {
          console.log(`  Difficulty ${difficulty}: ❌ Gate receives input from another gate`);
          allPass = false;
        }
      }
    }
  }

  if (allPass) {
    console.log('  ✅ All gates receive inputs only from buttons (multiConnect mode)');
  }

  return allPass;
}

// Test 7: NOT gate logic consistency
function testNOTGateLogic() {
  console.log('\n=== Test 7: NOT Gate Logic Consistency ===');

  let allPass = true;

  for (let difficulty = 3; difficulty <= 5; difficulty++) {
    console.log(`  Difficulty ${difficulty}:`);
    let notLevelCount = 0;
    let conflictCount = 0;
    let sharedCount = 0;

    for (let i = 0; i < 20; i++) {
      const level = generator.generateLevel(difficulty);
      const mechanisms = level.mechanisms;
      const connections = level.connections;

      const gates = mechanisms.filter(m => m.type === 'logic-gate');
      const notGates = gates.filter(g => g.gateType === 'NOT');

      if (notGates.length > 0) {
        notLevelCount++;

        // Get NOT gate button IDs
        const notButtonIds = new Set();
        notGates.forEach(notGate => {
          const notGateIdx = mechanisms.indexOf(notGate);
          connections.filter(c => c.to === notGateIdx)
            .forEach(c => notButtonIds.add(mechanisms[c.from].id));
        });

        // Check other gates for conflicts
        const otherGates = gates.filter(g => g.gateType !== 'NOT');
        let hasSharing = false;
        let hasConflict = false;

        otherGates.forEach(gate => {
          const gateIdx = mechanisms.indexOf(gate);
          const gateButtons = connections
            .filter(c => c.to === gateIdx)
            .map(c => mechanisms[c.from].id);

          // Check button sharing
          const sharedButtons = gateButtons.filter(id => notButtonIds.has(id));
          if (sharedButtons.length > 0) {
            hasSharing = true;

            // AND gate sharing with NOT gate = conflict
            if (gate.gateType === 'AND') {
              hasConflict = true;
            }
          }
        });

        if (hasSharing) sharedCount++;
        if (hasConflict) conflictCount++;
      }
    }

    console.log(`    NOT gates: ${notLevelCount}/20 levels`);
    console.log(`    Button sharing (OR+NOT): ${sharedCount}/${notLevelCount}`);

    const noConflicts = conflictCount === 0;
    console.log(`    Logic conflicts: ${conflictCount}/${notLevelCount} ${noConflicts ? '✅' : '❌'}`);

    if (!noConflicts) {
      allPass = false;
    }
  }

  return allPass;
}

// Test 8: Strategic difficulty (cannot win by pressing all buttons)
function testStrategicDifficulty() {
  console.log('\n=== Test 8: Strategic Difficulty (Anti-Bruteforce) ===');

  let allPass = true;

  for (let difficulty = 3; difficulty <= 5; difficulty++) {
    let winByPressingAll = 0;

    for (let i = 0; i < 20; i++) {
      const level = generator.generateLevel(difficulty);
      const mechanisms = level.mechanisms;
      const connections = level.connections;

      const buttons = mechanisms.filter(m => m.type === 'button');
      const gates = mechanisms.filter(m => m.type === 'logic-gate');
      const door = mechanisms.find(m => m.type === 'door');

      // Simulate: press all buttons (all ON)
      const buttonStates = {};
      buttons.forEach(btn => { buttonStates[btn.id] = true; });

      // Calculate gate outputs
      let activeSignals = 0;
      gates.forEach(gate => {
        const gateIdx = mechanisms.indexOf(gate);
        const inputs = connections.filter(c => c.to === gateIdx)
          .map(c => buttonStates[mechanisms[c.from].id]);

        let output = false;
        if (gate.gateType === 'AND') {
          output = inputs.every(v => v === true);
        } else if (gate.gateType === 'OR') {
          output = inputs.some(v => v === true);
        } else if (gate.gateType === 'NOT') {
          output = inputs.every(v => v === false);
        }

        if (output) activeSignals++;
      });

      // Check if door opens
      if (activeSignals >= door.requiredSignals) {
        winByPressingAll++;
      }
    }

    const percentage = (winByPressingAll / 20 * 100).toFixed(0);
    const pass = winByPressingAll <= 4; // Allow max 20% bruteforce success
    console.log(`  Difficulty ${difficulty}: ${winByPressingAll}/20 (${percentage}%) can win by pressing all ${pass ? '✅' : '❌'}`);

    if (!pass) {
      allPass = false;
    }
  }

  return allPass;
}

// Test 9: All buttons connected (no orphaned buttons)
function testAllButtonsConnected() {
  console.log('\n=== Test 9: All Buttons Connected ===');

  let allPass = true;

  for (let difficulty = 3; difficulty <= 5; difficulty++) {
    let orphanedCount = 0;

    for (let i = 0; i < 20; i++) {
      const level = generator.generateLevel(difficulty);
      const mechanisms = level.mechanisms;
      const connections = level.connections;

      const buttons = mechanisms.filter(m => m.type === 'button');

      // Check each button is connected to at least one gate/door
      for (const button of buttons) {
        const buttonIdx = mechanisms.indexOf(button);
        const isConnected = connections.some(c => c.from === buttonIdx);

        if (!isConnected) {
          orphanedCount++;
          const gates = mechanisms.filter(m => m.type === 'logic-gate');
          const pattern = gates.map(g => g.gateType).sort().join('+');
          console.log(`  Difficulty ${difficulty}: ❌ Orphaned button in pattern ${pattern}`);
          allPass = false;
          break;
        }
      }
    }

    if (orphanedCount === 0) {
      console.log(`  Difficulty ${difficulty}: ✅ All buttons connected (0/20 orphaned)`);
    } else {
      console.log(`  Difficulty ${difficulty}: ❌ ${orphanedCount}/20 levels have orphaned buttons`);
    }
  }

  return allPass;
}

// Test 10: Pattern diversity (avoid single-pattern monotony)
function testPatternDiversity() {
  console.log('\n=== Test 10: Pattern Diversity ===');

  let allPass = true;

  for (let difficulty = 3; difficulty <= 5; difficulty++) {
    const patterns = {};
    const sampleSize = 50;

    for (let i = 0; i < sampleSize; i++) {
      const level = generator.generateLevel(difficulty);
      const gates = level.mechanisms.filter(m => m.type === 'logic-gate');

      // Create pattern signature (sorted gate types)
      const pattern = gates.map(g => g.gateType).sort().join('+');
      patterns[pattern] = (patterns[pattern] || 0) + 1;
    }

    const uniquePatterns = Object.keys(patterns).length;
    const sortedPatterns = Object.entries(patterns).sort((a, b) => b[1] - a[1]);
    const mostCommonPercentage = (sortedPatterns[0][1] / sampleSize * 100).toFixed(0);

    // Requirements:
    // - At least 2 different patterns
    // - Most common pattern should not exceed 80%
    const minPatterns = 2;
    const maxDominance = 80;

    const hasVariety = uniquePatterns >= minPatterns;
    const notTooDominant = parseInt(mostCommonPercentage) <= maxDominance;
    const pass = hasVariety && notTooDominant;

    console.log(`  Difficulty ${difficulty}:`);
    console.log(`    Unique patterns: ${uniquePatterns} (min ${minPatterns}) ${hasVariety ? '✅' : '❌'}`);
    console.log(`    Most common: ${sortedPatterns[0][0]} (${mostCommonPercentage}%, max ${maxDominance}%) ${notTooDominant ? '✅' : '❌'}`);

    // Show all patterns
    sortedPatterns.forEach(([pattern, count]) => {
      const pct = (count / sampleSize * 100).toFixed(0);
      console.log(`      ${pattern}: ${count}/${sampleSize} (${pct}%)`);
    });

    if (!pass) {
      allPass = false;
    }
  }

  return allPass;
}

// Run all tests
console.log('🧪 Running LevelGenerator Tests\n');

const results = {
  'Position Collision': testPositionCollision(),
  'Button Distribution': testButtonDistribution(),
  'No Gate Chaining': testNoGateChaining(),
  'Door Requirements': testDoorSignalRequirements(),
  'Level Solvability': testLevelSolvability(),
  'Gate Input Types': testGateInputTypes(),
  'NOT Gate Logic': testNOTGateLogic(),
  'Strategic Difficulty': testStrategicDifficulty(),
  'All Buttons Connected': testAllButtonsConnected(),
  'Pattern Diversity': testPatternDiversity()
};

console.log('\n' + '='.repeat(50));
console.log('📊 Test Summary:');
let passed = 0;
let total = 0;

for (const [name, result] of Object.entries(results)) {
  console.log(`  ${result ? '✅' : '❌'} ${name}`);
  if (result) passed++;
  total++;
}

console.log(`\n${passed}/${total} test suites passed`);

if (passed === total) {
  console.log('\n🎉 All tests passed!');
  process.exit(0);
} else {
  console.log('\n❌ Some tests failed');
  process.exit(1);
}
