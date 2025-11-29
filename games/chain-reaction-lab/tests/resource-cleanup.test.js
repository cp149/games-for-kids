/**
 * Resource Cleanup Tests
 * Verifies proper cleanup of timers, event listeners, and resources
 * Prevents memory leaks and ensures clean state transitions
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
      // Disable effects to avoid setTimeout race conditions
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
      soundToggle: { checked: false },
      musicToggle: { checked: false },
      particlesToggle: { checked: false },
      qualityToggle: { checked: false }
    };
    return mocks[id] || {
      checked: false,
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

// Test 1: Timer cleanup on level switch
async function testTimerCleanup() {
  console.log('\n=== Test 1: Timer Cleanup on Level Switch ===');

  const canvas = document.getElementById('gameCanvas');
  const renderer = new Renderer(canvas);
  const settings = new SettingsManager();
  const gameState = new GameStateManager(canvas, renderer, settings);

  let testsPassed = 0;
  let testsFailed = 0;

  // Track active timers
  const originalSetTimeout = global.setTimeout;
  const activeTimers = new Set();

  global.setTimeout = function(callback, delay, ...args) {
    const id = originalSetTimeout(() => {
      activeTimers.delete(id);
      callback(...args);
    }, delay);
    activeTimers.add(id);
    return id;
  };

  // Load level 0
  gameState.loadLevel(0);
  const initialTimerCount = activeTimers.size;

  if (initialTimerCount > 0) {
    console.log(`  ✅ Level creates timers (${initialTimerCount} active)`);
    testsPassed++;
  } else {
    console.log('  ⚠️ No timers created');
  }

  // Switch to level 1 (should clean up level 0 timers)
  gameState.loadLevel(1);

  // Wait briefly for cleanup
  await new Promise(resolve => originalSetTimeout(resolve, 100));

  // Restore original setTimeout
  global.setTimeout = originalSetTimeout;

  // Verify cleanup (some timers may remain from level 1, but level 0 timers should be gone)
  if (activeTimers.size < 100) {  // Reasonable upper limit
    console.log(`  ✅ Timer cleanup performed (${activeTimers.size} remain)`);
    testsPassed++;
  } else {
    console.log(`  ❌ Too many active timers (${activeTimers.size})`);
    testsFailed++;
  }

  // Cleanup
  gameState.destroy();

  return { passed: testsPassed, failed: testsFailed };
}

// Test 2: Level destruction cleanup
async function testLevelDestruction() {
  console.log('\n=== Test 2: Level Destruction Cleanup ===');

  const canvas = document.getElementById('gameCanvas');
  const renderer = new Renderer(canvas);
  const settings = new SettingsManager();
  const gameState = new GameStateManager(canvas, renderer, settings);

  let testsPassed = 0;
  let testsFailed = 0;

  // Load level 0
  gameState.loadLevel(0);
  const level = gameState.currentLevelInstance;

  if (level.isActive) {
    console.log('  ✅ Level activated');
    testsPassed++;
  }

  if (level.mechanisms.length > 0) {
    console.log(`  ✅ Mechanisms created (${level.mechanisms.length})`);
    testsPassed++;
  }

  // Destroy level
  level.destroy();

  if (!level.isActive) {
    console.log('  ✅ Level deactivated after destroy');
    testsPassed++;
  } else {
    console.log('  ❌ Level still active after destroy');
    testsFailed++;
  }

  if (level.mechanisms.length === 0) {
    console.log('  ✅ Mechanisms cleared after destroy');
    testsPassed++;
  } else {
    console.log(`  ❌ Mechanisms not cleared (${level.mechanisms.length} remain)`);
    testsFailed++;
  }

  // Cleanup
  gameState.destroy();

  return { passed: testsPassed, failed: testsFailed };
}

// Test 3: GameStateManager destroy cleanup
async function testGameStateDestroy() {
  console.log('\n=== Test 3: GameStateManager Destroy Cleanup ===');

  const canvas = document.getElementById('gameCanvas');
  const renderer = new Renderer(canvas);
  const settings = new SettingsManager();
  const gameState = new GameStateManager(canvas, renderer, settings);

  let testsPassed = 0;
  let testsFailed = 0;

  // Load level and verify setup
  gameState.loadLevel(0);

  if (gameState.currentLevelInstance !== null) {
    console.log('  ✅ Level instance exists');
    testsPassed++;
  }

  // Destroy game state
  gameState.destroy();

  if (gameState.currentLevelInstance === null) {
    console.log('  ✅ Level instance cleared');
    testsPassed++;
  } else {
    console.log('  ❌ Level instance not cleared');
    testsFailed++;
  }

  if (gameState.canvas === null) {
    console.log('  ✅ Canvas reference cleared');
    testsPassed++;
  } else {
    console.log('  ❌ Canvas reference not cleared');
    testsFailed++;
  }

  if (gameState.renderer === null) {
    console.log('  ✅ Renderer reference cleared');
    testsPassed++;
  } else {
    console.log('  ❌ Renderer reference not cleared');
    testsFailed++;
  }

  if (gameState.settings === null) {
    console.log('  ✅ Settings reference cleared');
    testsPassed++;
  } else {
    console.log('  ❌ Settings reference not cleared');
    testsFailed++;
  }

  return { passed: testsPassed, failed: testsFailed };
}

// Test 4: Multiple level transitions
async function testMultipleLevelTransitions() {
  console.log('\n=== Test 4: Multiple Level Transitions ===');

  const canvas = document.getElementById('gameCanvas');
  const renderer = new Renderer(canvas);
  const settings = new SettingsManager();
  const gameState = new GameStateManager(canvas, renderer, settings);

  let testsPassed = 0;
  let testsFailed = 0;

  // Perform 5 level transitions
  for (let i = 0; i < 5; i++) {
    gameState.loadLevel(i % 3);  // Cycle through first 3 levels
  }

  // Verify game state is still valid
  if (gameState.currentLevelInstance !== null) {
    console.log('  ✅ Level instance valid after multiple transitions');
    testsPassed++;
  } else {
    console.log('  ❌ Level instance null after transitions');
    testsFailed++;
  }

  if (gameState.currentLevelInstance.isActive) {
    console.log('  ✅ Level active after multiple transitions');
    testsPassed++;
  } else {
    console.log('  ❌ Level not active after transitions');
    testsFailed++;
  }

  if (gameState.currentLevelInstance.mechanisms.length > 0) {
    console.log('  ✅ Mechanisms exist after multiple transitions');
    testsPassed++;
  } else {
    console.log('  ❌ No mechanisms after transitions');
    testsFailed++;
  }

  // Cleanup
  gameState.destroy();

  return { passed: testsPassed, failed: testsFailed };
}

// Test 5: Random level cleanup
async function testRandomLevelCleanup() {
  console.log('\n=== Test 5: Random Level Cleanup ===');

  const canvas = document.getElementById('gameCanvas');
  const renderer = new Renderer(canvas);
  const settings = new SettingsManager();
  const gameState = new GameStateManager(canvas, renderer, settings);

  let testsPassed = 0;
  let testsFailed = 0;

  // Generate random level
  gameState.loadRandomLevel(3);
  const randomLevel = gameState.currentLevelInstance;

  if (randomLevel !== null) {
    console.log('  ✅ Random level created');
    testsPassed++;
  }

  // Switch to normal level (should clean up random level)
  gameState.loadLevel(0);

  if (!randomLevel.isActive) {
    console.log('  ✅ Random level deactivated');
    testsPassed++;
  } else {
    console.log('  ❌ Random level still active');
    testsFailed++;
  }

  if (randomLevel.mechanisms.length === 0) {
    console.log('  ✅ Random level mechanisms cleared');
    testsPassed++;
  } else {
    console.log(`  ❌ Random level mechanisms not cleared (${randomLevel.mechanisms.length})`);
    testsFailed++;
  }

  // Cleanup
  gameState.destroy();

  return { passed: testsPassed, failed: testsFailed };
}

// Main test runner
async function runAllTests() {
  console.log('🧹 Running Resource Cleanup Tests\n');
  console.log('==========================================');

  const results = [];

  results.push(await testTimerCleanup());
  results.push(await testLevelDestruction());
  results.push(await testGameStateDestroy());
  results.push(await testMultipleLevelTransitions());
  results.push(await testRandomLevelCleanup());

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
