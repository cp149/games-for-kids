/**
 * Game Flow Integration Tests
 * Tests complete game lifecycle: load → interact → win → next level
 */

// Mock localStorage FIRST (before any imports)
global.localStorage = {
  data: {},
  getItem(key) { return this.data[key] || null; },
  setItem(key, value) { this.data[key] = value; },
  removeItem(key) { delete this.data[key]; },
  clear() { this.data = {}; }
};

// Mock browser APIs for Node.js environment
global.window = {
  gameRenderer: null,
  gameInstance: null,
  gameSettings: {
    get: (key) => {
      // Disable particles in tests to avoid setTimeout race conditions
      const defaults = { sound: false, music: false, particles: false, highQuality: false };
      return defaults[key];
    }
  },
  addEventListener: () => {},
  removeEventListener: () => {}
};

global.navigator = {
  language: 'en-US',
  userLanguage: 'en-US'
};

global.document = {
  getElementById: (id) => {
    const mocks = {
      gameCanvas: {
        width: 800,
        height: 600,
        parentElement: { getBoundingClientRect: () => ({ width: 800, height: 600 }) },
        getContext: () => mockCanvasContext()
      },
      soundToggle: { checked: true },
      musicToggle: { checked: true },
      particlesToggle: { checked: true },
      qualityToggle: { checked: true }
    };
    return mocks[id] || {
      checked: true,
      style: {},
      classList: { add: () => {}, remove: () => {}, contains: () => false },
      textContent: '',
      innerHTML: ''
    };
  },
  createElement: (tag) => {
    if (tag === 'canvas') {
      return {
        width: 800,
        height: 600,
        getContext: () => mockCanvasContext()
      };
    }
    return { style: {}, classList: { add: () => {}, remove: () => {} } };
  },
  addEventListener: () => {},
  removeEventListener: () => {},
  querySelectorAll: () => []
};

global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);
global.performance = { now: () => Date.now() };
global.Image = class Image {
  constructor() { this.src = ''; }
};
global.Audio = class Audio {
  constructor() { this.src = ''; }
  play() { return Promise.resolve(); }
};

// Mock canvas context
function mockCanvasContext() {
  return {
    save: () => {},
    restore: () => {},
    clearRect: () => {},
    fillRect: () => {},
    strokeRect: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    arc: () => {},
    ellipse: () => {},
    bezierCurveTo: () => {},
    fill: () => {},
    stroke: () => {},
    closePath: () => {},
    translate: () => {},
    rotate: () => {},
    scale: () => {},
    fillText: () => {},
    createLinearGradient: () => ({
      addColorStop: () => {}
    }),
    drawImage: () => {},
    // Properties
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: '',
    textBaseline: '',
    shadowBlur: 0,
    shadowColor: '',
    globalAlpha: 1
  };
}

// Import game modules
import { Level } from '../src/core/level.js';
import { GameStateManager } from '../src/managers/game-state-manager.js';
import { SettingsManager } from '../src/managers/settings-manager.js';
import { Renderer } from '../src/core/renderer.js';
import { levels } from '../data/levels.js';

// Test 1: Level loading and basic state
async function testLevelLoading() {
  console.log('\n=== Test 1: Level Loading ===');

  const canvas = document.getElementById('gameCanvas');
  const renderer = new Renderer(canvas);
  const settings = new SettingsManager();
  const gameState = new GameStateManager(canvas, renderer, settings);

  let testsPassed = 0;
  let testsFailed = 0;

  // Test loading level 0
  gameState.loadLevel(0);

  if (gameState.currentLevelIndex === 0) {
    console.log('  ✅ Level index set correctly');
    testsPassed++;
  } else {
    console.log('  ❌ Level index incorrect:', gameState.currentLevelIndex);
    testsFailed++;
  }

  if (gameState.currentLevelInstance !== null) {
    console.log('  ✅ Level instance created');
    testsPassed++;
  } else {
    console.log('  ❌ Level instance not created');
    testsFailed++;
  }

  if (gameState.currentLevelInstance.isActive) {
    console.log('  ✅ Level activated');
    testsPassed++;
  } else {
    console.log('  ❌ Level not activated');
    testsFailed++;
  }

  if (gameState.moves === 0) {
    console.log('  ✅ Moves reset to 0');
    testsPassed++;
  } else {
    console.log('  ❌ Moves not reset:', gameState.moves);
    testsFailed++;
  }

  if (gameState.currentLevelInstance.mechanisms.length > 0) {
    console.log(`  ✅ Mechanisms created (${gameState.currentLevelInstance.mechanisms.length} total)`);
    testsPassed++;
  } else {
    console.log('  ❌ No mechanisms created');
    testsFailed++;
  }

  // Cleanup
  gameState.destroy();

  return { passed: testsPassed, failed: testsFailed };
}

// Test 2: Button interaction and signal propagation
async function testButtonInteraction() {
  console.log('\n=== Test 2: Button Interaction ===');

  const canvas = document.getElementById('gameCanvas');
  const renderer = new Renderer(canvas);
  const settings = new SettingsManager();
  const gameState = new GameStateManager(canvas, renderer, settings);

  let testsPassed = 0;
  let testsFailed = 0;

  // Load level 0 (simple level)
  gameState.loadLevel(0);

  const level = gameState.currentLevelInstance;
  const buttons = level.mechanisms.filter(m => m.type === 'button');

  if (buttons.length > 0) {
    const button = buttons[0];
    const initialState = button.active;

    // Click button using GameStateManager API (increments move counter)
    gameState.clickButton(button);

    if (button.active !== initialState) {
      console.log('  ✅ Button toggles state');
      testsPassed++;
    } else {
      console.log('  ❌ Button state unchanged');
      testsFailed++;
    }

    if (gameState.moves === 1) {
      console.log('  ✅ Move counter incremented');
      testsPassed++;
    } else {
      console.log('  ❌ Move counter not incremented:', gameState.moves);
      testsFailed++;
    }
  } else {
    console.log('  ⚠️ No buttons in level 0');
    testsFailed++;
  }

  // Wait for particle effects and win condition check to complete
  await new Promise(resolve => setTimeout(resolve, 700));

  // Cleanup
  gameState.destroy();

  return { passed: testsPassed, failed: testsFailed };
}

// Test 3: Win condition detection
async function testWinCondition() {
  console.log('\n=== Test 3: Win Condition Detection ===');

  const canvas = document.getElementById('gameCanvas');
  const renderer = new Renderer(canvas);
  const settings = new SettingsManager();
  const gameState = new GameStateManager(canvas, renderer, settings);

  let testsPassed = 0;
  let testsFailed = 0;

  // Create simple test level with 1 button → 1 door
  const testLevelData = {
    title: 'Test Level',
    mechanisms: [
      { type: 'button', x: 0.3, y: 0.5, id: 0 },
      { type: 'door', x: 0.7, y: 0.5, requiredSignals: 1 }
    ],
    connections: [
      { from: 0, to: 1, color: '#00ffff' }
    ]
  };

  const testLevel = new Level(testLevelData, canvas);
  testLevel.activate();
  gameState.currentLevelInstance = testLevel;

  // Initial state - should not win
  const initialWin = testLevel.checkWinCondition();
  if (!initialWin) {
    console.log('  ✅ Initial state: not won');
    testsPassed++;
  } else {
    console.log('  ❌ Initial state: incorrectly detected as won');
    testsFailed++;
  }

  // Click button
  const button = testLevel.mechanisms[0];
  button.toggle();

  // Wait for signal propagation
  await new Promise(resolve => setTimeout(resolve, 300));

  // Check win condition
  const afterClick = testLevel.checkWinCondition();
  if (afterClick) {
    console.log('  ✅ After button click: win detected');
    testsPassed++;
  } else {
    console.log('  ❌ After button click: win not detected');
    const door = testLevel.mechanisms[1];
    console.log('     Door locked:', door.locked);
    console.log('     Door signals:', door.receivedSignals.size, '/', door.requiredSignals);
    testsFailed++;
  }

  // Cleanup
  testLevel.destroy();
  gameState.destroy();

  return { passed: testsPassed, failed: testsFailed };
}

// Test 4: Level restart
async function testLevelRestart() {
  console.log('\n=== Test 4: Level Restart ===');

  const canvas = document.getElementById('gameCanvas');
  const renderer = new Renderer(canvas);
  const settings = new SettingsManager();
  const gameState = new GameStateManager(canvas, renderer, settings);

  let testsPassed = 0;
  let testsFailed = 0;

  // Load level 0
  gameState.loadLevel(0);

  const initialMechanismCount = gameState.currentLevelInstance.mechanisms.length;

  // Click some buttons
  const buttons = gameState.currentLevelInstance.mechanisms.filter(m => m.type === 'button');
  if (buttons.length > 0) {
    buttons[0].toggle();
    if (buttons.length > 1) buttons[1].toggle();
  }

  // Restart level
  gameState.restartLevel();

  if (gameState.moves === 0) {
    console.log('  ✅ Moves reset to 0 after restart');
    testsPassed++;
  } else {
    console.log('  ❌ Moves not reset:', gameState.moves);
    testsFailed++;
  }

  if (gameState.currentLevelInstance.mechanisms.length === initialMechanismCount) {
    console.log('  ✅ Mechanism count preserved');
    testsPassed++;
  } else {
    console.log('  ❌ Mechanism count changed:',
      initialMechanismCount, '→', gameState.currentLevelInstance.mechanisms.length);
    testsFailed++;
  }

  const allInactive = gameState.currentLevelInstance.mechanisms.every(m => !m.active);
  if (allInactive) {
    console.log('  ✅ All mechanisms reset to inactive');
    testsPassed++;
  } else {
    console.log('  ❌ Some mechanisms still active');
    testsFailed++;
  }

  // Cleanup
  gameState.destroy();

  return { passed: testsPassed, failed: testsFailed };
}

// Test 5: Level progression
async function testLevelProgression() {
  console.log('\n=== Test 5: Level Progression ===');

  const canvas = document.getElementById('gameCanvas');
  const renderer = new Renderer(canvas);
  const settings = new SettingsManager();
  const gameState = new GameStateManager(canvas, renderer, settings);

  let testsPassed = 0;
  let testsFailed = 0;

  // Load level 0
  gameState.loadLevel(0);

  if (gameState.currentLevelIndex === 0) {
    console.log('  ✅ Started at level 0');
    testsPassed++;
  }

  // Move to next level
  gameState.nextLevel();

  if (gameState.currentLevelIndex === 1) {
    console.log('  ✅ Advanced to level 1');
    testsPassed++;
  } else {
    console.log('  ❌ Level index not advanced:', gameState.currentLevelIndex);
    testsFailed++;
  }

  if (gameState.moves === 0) {
    console.log('  ✅ Moves reset on level change');
    testsPassed++;
  } else {
    console.log('  ❌ Moves not reset:', gameState.moves);
    testsFailed++;
  }

  // Test game completion
  let gameCompleted = false;
  gameState.onWin = (result) => {
    if (result.gameComplete) {
      gameCompleted = true;
    }
  };

  gameState.loadLevel(levels.length - 1);
  gameState.nextLevel();

  // Should trigger game complete via onWin callback
  if (gameCompleted) {
    console.log('  ✅ Game completion detected');
    testsPassed++;
  } else {
    console.log('  ❌ Game completion not detected');
    testsFailed++;
  }

  // Cleanup
  gameState.destroy();

  return { passed: testsPassed, failed: testsFailed };
}

// Test 6: Random level generation
async function testRandomLevelGeneration() {
  console.log('\n=== Test 6: Random Level Generation ===');

  const canvas = document.getElementById('gameCanvas');
  const renderer = new Renderer(canvas);
  const settings = new SettingsManager();
  const gameState = new GameStateManager(canvas, renderer, settings);

  let testsPassed = 0;
  let testsFailed = 0;

  // Test each difficulty level
  for (let difficulty = 1; difficulty <= 5; difficulty++) {
    gameState.loadRandomLevel(difficulty);

    if (gameState.currentLevelInstance !== null) {
      console.log(`  ✅ Difficulty ${difficulty}: level generated`);
      testsPassed++;
    } else {
      console.log(`  ❌ Difficulty ${difficulty}: level not generated`);
      testsFailed++;
      continue;
    }

    if (gameState.isRandomMode) {
      testsPassed++;
    } else {
      console.log(`  ❌ Difficulty ${difficulty}: not in random mode`);
      testsFailed++;
    }

    if (gameState.currentDifficulty === difficulty) {
      testsPassed++;
    } else {
      console.log(`  ❌ Difficulty ${difficulty}: difficulty not set correctly`);
      testsFailed++;
    }
  }

  console.log(`  ✅ All difficulty levels (1-5) generate valid levels`);

  // Cleanup
  gameState.destroy();

  return { passed: testsPassed, failed: testsFailed };
}

// Test 7: Resource cleanup on level switch
async function testResourceCleanup() {
  console.log('\n=== Test 7: Resource Cleanup ===');

  const canvas = document.getElementById('gameCanvas');
  const renderer = new Renderer(canvas);
  const settings = new SettingsManager();
  const gameState = new GameStateManager(canvas, renderer, settings);

  let testsPassed = 0;
  let testsFailed = 0;

  // Load level 0
  gameState.loadLevel(0);
  const firstLevel = gameState.currentLevelInstance;

  // Activate some mechanisms
  const buttons = firstLevel.mechanisms.filter(m => m.type === 'button');
  if (buttons.length > 0) {
    buttons[0].toggle();
  }

  // Load level 1 (should destroy level 0)
  gameState.loadLevel(1);

  // Check first level cleanup
  if (!firstLevel.isActive) {
    console.log('  ✅ Previous level deactivated');
    testsPassed++;
  } else {
    console.log('  ❌ Previous level still active');
    testsFailed++;
  }

  if (firstLevel.mechanisms.length === 0) {
    console.log('  ✅ Previous level mechanisms cleared');
    testsPassed++;
  } else {
    console.log('  ❌ Previous level mechanisms not cleared');
    testsFailed++;
  }

  // Check new level
  if (gameState.currentLevelInstance !== firstLevel) {
    console.log('  ✅ New level instance created');
    testsPassed++;
  } else {
    console.log('  ❌ Level instance not replaced');
    testsFailed++;
  }

  if (gameState.currentLevelInstance.isActive) {
    console.log('  ✅ New level activated');
    testsPassed++;
  } else {
    console.log('  ❌ New level not activated');
    testsFailed++;
  }

  // Cleanup
  gameState.destroy();

  return { passed: testsPassed, failed: testsFailed };
}

// Main test runner
async function runAllTests() {
  console.log('🧪 Running Game Flow Integration Tests\n');
  console.log('==========================================');

  const results = [];

  results.push(await testLevelLoading());
  results.push(await testButtonInteraction());
  results.push(await testWinCondition());
  results.push(await testLevelRestart());
  results.push(await testLevelProgression());
  results.push(await testRandomLevelGeneration());
  results.push(await testResourceCleanup());

  console.log('\n==========================================');
  console.log('📊 Test Summary:');

  const totalPassed = results.reduce((sum, r) => sum + r.passed, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
  const totalTests = totalPassed + totalFailed;

  console.log(`  Total: ${totalTests} tests`);
  console.log(`  ✅ Passed: ${totalPassed}`);
  console.log(`  ❌ Failed: ${totalFailed}`);
  console.log(`  Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);

  if (totalFailed === 0) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log(`\n⚠️  ${totalFailed} test(s) failed`);
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(console.error);
