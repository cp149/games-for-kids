/**
 * Main Game Class
 * Handles game loop, state management, and UI updates
 */

import i18n from '../utils/i18n.js';
import { AnimationManager } from '../utils/animation.js';
import { Renderer } from './renderer.js';
import { Level } from './level.js';
import { levels } from '../../data/levels.js';

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.renderer = new Renderer(this.canvas);
    this.animManager = new AnimationManager();

    this.currentLevelIndex = 0;
    this.levels = levels;
    this.currentLevelInstance = null; // Current Level instance
    this.moves = 0;
    this.startTime = 0;
    this.elapsedTime = 0;
    this.showInitialHint = false;

    this.settings = {
      sound: true,
      music: true,
      particles: true
    };

    this.lastFrameTime = 0;
    this.frameId = null;
  }

  async init() {
    console.log('Initializing Chain Reaction Lab...');

    // Make renderer and game globally accessible
    window.gameRenderer = this.renderer;
    window.gameInstance = this;

    // Setup event listeners
    this.setupEventListeners();

    // Resize canvas
    this.renderer.resize();
    window.addEventListener('resize', () => this.renderer.resize());

    // Load settings
    this.loadSettings();

    // Initialize i18n
    i18n.updateUI();

    // Hide loading screen
    setTimeout(() => {
      document.getElementById('loadingScreen').classList.add('hidden');
      document.getElementById('gameContainer').classList.remove('hidden');

      // Show tutorial for first time
      if (!localStorage.getItem('chainReactionLab_tutorialComplete')) {
        this.showTutorial();
      } else {
        // Load first level
        this.loadLevel(0);
      }
    }, 2000);
  }

  setupEventListeners() {
    // Canvas click and touch
    this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const clickEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY
      };
      this.handleCanvasClick(clickEvent);
    });

    // Mouse move for cursor changes
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));

    // Top bar buttons
    document.getElementById('btnRestart').addEventListener('click', () => this.restartLevel());
    document.getElementById('btnHint').addEventListener('click', () => this.showHint());
    document.getElementById('btnSettings').addEventListener('click', () => this.showSettings());

    // Settings
    document.getElementById('btnCloseSettings').addEventListener('click', () => this.hideSettings());
    document.getElementById('languageSelect').addEventListener('change', (e) => {
      i18n.setLanguage(e.target.value);
    });
    document.getElementById('soundToggle').addEventListener('change', (e) => {
      this.settings.sound = e.target.checked;
      this.saveSettings();
    });
    document.getElementById('musicToggle').addEventListener('change', (e) => {
      this.settings.music = e.target.checked;
      this.saveSettings();
    });
    document.getElementById('particlesToggle').addEventListener('change', (e) => {
      this.settings.particles = e.target.checked;
      this.saveSettings();
    });

    // Tutorial
    document.getElementById('btnTutorialNext').addEventListener('click', () => this.nextTutorialStep());

    // Success screen
    document.getElementById('btnReplay').addEventListener('click', () => this.restartLevel());
    document.getElementById('btnNextLevel').addEventListener('click', () => this.nextLevel());
  }

  handleCanvasClick(e) {
    if (!this.currentLevelInstance || !this.currentLevelInstance.isActive) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked on a button
    const button = this.currentLevelInstance.handleClick(x, y);
    if (button) {
      this.clickButton(button);
    }
  }

  handleMouseMove(e) {
    if (!this.currentLevelInstance || !this.currentLevelInstance.isActive) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if hovering over a button
    const button = this.currentLevelInstance.handleClick(x, y);
    this.canvas.style.cursor = button ? 'pointer' : 'default';
  }

  clickButton(button) {
    button.toggle();
    this.moves++;
    this.showInitialHint = false;
    this.updateUI();

    // Create ripple effect
    if (this.settings.particles) {
      this.renderer.createExplosion(button.x, button.y, button.active ? '#00ff00' : '#3a4f6c');

      // Triple ripple rings
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          this.renderer.createRing(button.x, button.y, 60 + i * 20, '#00ff88');
        }, i * 100);
      }
    }

    // Check win condition after signal propagation completes
    setTimeout(() => this.checkWinCondition(), 600);
  }

  checkWinCondition() {
    if (!this.currentLevelInstance) return;

    if (this.currentLevelInstance.checkWinCondition()) {
      this.winLevel();
    }
  }

  winLevel() {
    if (!this.currentLevelInstance) return;

    this.elapsedTime = Date.now() - this.startTime;

    // Deactivate level to prevent further clicks
    this.currentLevelInstance.deactivate();

    // Create success fireworks - immediately!
    if (this.settings.particles) {
      const doors = this.currentLevelInstance.mechanisms.filter(m => m.type === 'door');
      doors.forEach(door => {
        // Create all confetti immediately in a burst
        for (let i = 0; i < 20; i++) {
          const angle = (Math.PI * 2 * i) / 20;
          this.renderer.createConfetti(door.x, door.y, angle);
        }
        // Extra explosion effect at door
        this.renderer.createExplosion(door.x, door.y, 30, '#00ff00');
      });
    }

    // Update success overlay data
    document.getElementById('successMoves').textContent = this.moves;
    document.getElementById('successTime').textContent = this.formatTime(this.elapsedTime);

    // Wait for fireworks to finish before showing success overlay
    setTimeout(() => {
      document.getElementById('successOverlay').classList.remove('hidden');
    }, 2000);
  }

  loadLevel(levelIndex) {
    if (levelIndex >= this.levels.length) {
      console.error('Level index out of bounds:', levelIndex);
      return;
    }

    console.log(`[LEVEL] Loading level ${levelIndex + 1}`);

    // Destroy old level instance completely
    if (this.currentLevelInstance) {
      this.currentLevelInstance.destroy();
      this.currentLevelInstance = null;
    }

    // Reset state
    this.currentLevelIndex = levelIndex;
    this.moves = 0;
    this.startTime = Date.now();
    this.showInitialHint = (levelIndex === 0);

    const levelData = this.levels[levelIndex];

    // Update UI
    document.getElementById('levelBadge').textContent = `Level ${levelIndex + 1}`;
    document.getElementById('levelTitle').textContent = levelData.title || this.getLevelTitle(levelIndex);
    document.getElementById('goalValue').textContent = levelData.description || i18n.t('unlock_door');
    this.updateUI();

    // Ensure canvas is properly sized
    this.renderer.resize();

    // Create new level instance
    this.currentLevelInstance = new Level(levelData, this.canvas);
    this.currentLevelInstance.activate();

    console.log(`[LEVEL] Level ${levelIndex + 1} loaded and activated`);

    // Start game loop if not running
    if (!this.frameId) {
      this.gameLoop();
    }
  }


  restartLevel() {
    // Hide overlays
    document.getElementById('successOverlay').classList.add('hidden');

    // Reload current level
    this.loadLevel(this.currentLevelIndex);
  }

  nextLevel() {
    // Hide success overlay
    document.getElementById('successOverlay').classList.add('hidden');

    // Load next level
    const nextLevel = this.currentLevelIndex + 1;
    if (nextLevel < this.levels.length) {
      this.loadLevel(nextLevel);
    } else {
      // Game complete
      alert('Congratulations! You completed all levels!');
      // Restart from beginning
      this.loadLevel(0);
    }
  }

  showHint() {
    // TODO: Implement hint system
    alert('Hint: Try clicking the buttons to see what happens!');
  }

  showSettings() {
    document.getElementById('settingsPanel').classList.remove('hidden');
  }

  hideSettings() {
    document.getElementById('settingsPanel').classList.add('hidden');
  }

  showTutorial() {
    document.getElementById('tutorialOverlay').classList.remove('hidden');
    this.tutorialStep = 0;
    this.updateTutorialStep();
  }

  hideTutorial() {
    document.getElementById('tutorialOverlay').classList.add('hidden');
    localStorage.setItem('chainReactionLab_tutorialComplete', 'true');
    this.loadLevel(0);
  }

  nextTutorialStep() {
    this.tutorialStep++;

    if (this.tutorialStep > 2) {
      this.hideTutorial();
    } else {
      this.updateTutorialStep();
    }
  }

  updateTutorialStep() {
    const steps = [
      {
        title: i18n.t('tutorial_welcome'),
        text: i18n.t('tutorial_1'),
        icon: '⚡'
      },
      {
        title: 'Chain Reactions',
        text: i18n.t('tutorial_2'),
        icon: '🔗'
      },
      {
        title: 'Solve Puzzles',
        text: i18n.t('tutorial_3'),
        icon: '🧩'
      }
    ];

    const step = steps[this.tutorialStep];
    document.getElementById('tutorialStep').textContent = `Step ${this.tutorialStep + 1}/${steps.length}`;
    document.getElementById('tutorialTitle').textContent = step.title;
    document.getElementById('tutorialText').textContent = step.text;
    document.querySelector('.tutorial-icon').textContent = step.icon;
  }

  updateUI() {
    document.getElementById('movesValue').textContent = this.moves;
    document.getElementById('timeValue').textContent = this.formatTime(Date.now() - this.startTime);
  }

  formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  getLevelTitle(index) {
    const titles = [
      'First Connection',
      'Double Trigger',
      'Chain Link',
      'Power Grid',
      'Synchronized',
      'Network Flow',
      'Circuit Board',
      'Energy Web',
      'Master Link',
      'Final Test'
    ];
    return titles[index] || `Level ${index + 1}`;
  }

  gameLoop(timestamp = 0) {
    const deltaTime = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;

    // Update
    if (this.currentLevelInstance) {
      this.currentLevelInstance.update(deltaTime);
      this.renderer.updateParticles();
      this.updateUI();
    }

    // Render
    this.renderer.render({
      level: this.currentLevelInstance,
      showInitialHint: this.showInitialHint
    });

    // Continue loop
    this.frameId = requestAnimationFrame((t) => this.gameLoop(t));
  }

  loadSettings() {
    const saved = localStorage.getItem('chainReactionLab_settings');
    if (saved) {
      this.settings = JSON.parse(saved);
    }

    // Update UI
    document.getElementById('soundToggle').checked = this.settings.sound;
    document.getElementById('musicToggle').checked = this.settings.music;
    document.getElementById('particlesToggle').checked = this.settings.particles;
  }

  saveSettings() {
    localStorage.setItem('chainReactionLab_settings', JSON.stringify(this.settings));
  }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  game.init();
});

export default Game;
