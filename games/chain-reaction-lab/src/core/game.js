/**
 * Main Game Class
 * Handles game loop, state management, and UI updates
 */

import i18n from '../utils/i18n.js';
import { AnimationManager } from '../utils/animation.js';
import { Renderer } from './renderer.js';
import { Button } from '../entities/button.js';
import { Door } from '../entities/door.js';
import { Relay } from '../entities/relay.js';
import { Player } from '../entities/player.js';
import { levels } from '../../data/levels.js';

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.renderer = new Renderer(this.canvas);
    this.animManager = new AnimationManager();

    this.currentLevel = 0;
    this.levels = levels;
    this.mechanisms = [];
    this.player = null;
    this.moves = 0;
    this.startTime = 0;
    this.elapsedTime = 0;
    this.isRunning = false;
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
    if (!this.isRunning) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked on a button
    this.mechanisms.forEach(mechanism => {
      if (mechanism.type === 'button' && mechanism.containsPoint(x, y)) {
        this.clickButton(mechanism);
      }
    });
  }

  handleMouseMove(e) {
    if (!this.isRunning) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if hovering over a button
    let isOverButton = false;
    this.mechanisms.forEach(mechanism => {
      if (mechanism.type === 'button' && mechanism.containsPoint(x, y)) {
        isOverButton = true;
      }
    });

    this.canvas.style.cursor = isOverButton ? 'pointer' : 'default';
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
    // Check if all doors are unlocked
    const doors = this.mechanisms.filter(m => m.type === 'door');
    const allUnlocked = doors.length > 0 && doors.every(d => !d.locked);

    if (allUnlocked) {
      this.winLevel();
    }
  }

  winLevel() {
    console.log('winLevel called, creating fireworks NOW');
    this.elapsedTime = Date.now() - this.startTime;

    // Create success fireworks - immediately!
    if (this.settings.particles) {
      const doors = this.mechanisms.filter(m => m.type === 'door');
      doors.forEach(door => {
        console.log('Creating fireworks at door:', door.x, door.y);
        // Create all confetti immediately in a burst
        for (let i = 0; i < 20; i++) {
          const angle = (Math.PI * 2 * i) / 20;
          this.renderer.createConfetti(door.x, door.y, angle);
        }
        // Extra explosion effect at door
        this.renderer.createExplosion(door.x, door.y, 30, '#00ff00');
      });
      console.log('Fireworks created, particle count:', this.renderer.particles.particles.length);
    }

    // Update success overlay data
    document.getElementById('successMoves').textContent = this.moves;
    document.getElementById('successTime').textContent = this.formatTime(this.elapsedTime);

    // Wait for fireworks to finish before showing success overlay
    console.log('Setting timeout for success overlay in 2000ms');
    setTimeout(() => {
      console.log('NOW showing success overlay');
      this.isRunning = false; // Stop game only when showing overlay
      document.getElementById('successOverlay').classList.remove('hidden');
    }, 2000);
  }

  loadLevel(levelIndex) {
    console.log('Loading level:', levelIndex);

    if (levelIndex >= this.levels.length) {
      console.error('Level index out of bounds:', levelIndex);
      return;
    }

    this.currentLevel = levelIndex;
    this.mechanisms = [];
    this.moves = 0;
    this.startTime = Date.now();
    this.isRunning = true;
    this.showInitialHint = (levelIndex === 0);

    const level = this.levels[levelIndex];

    // Update UI
    document.getElementById('levelBadge').textContent = `Level ${levelIndex + 1}`;
    document.getElementById('levelTitle').textContent = level.title || this.getLevelTitle(levelIndex);
    document.getElementById('goalValue').textContent = level.description || i18n.t('unlock_door');
    this.updateUI();

    // Ensure canvas is properly sized
    this.renderer.resize();

    // Create level from data
    this.createLevelFromData(level);

    // Start game loop if not running
    if (!this.frameId) {
      this.gameLoop();
    }
  }

  createLevelFromData(level) {
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Create mechanisms
    level.mechanisms.forEach((mechData, index) => {
      const x = mechData.x * w;
      const y = mechData.y * h;

      let mechanism;
      if (mechData.type === 'button') {
        mechanism = new Button(x, y, mechData.id || index);
      } else if (mechData.type === 'door') {
        mechanism = new Door(x, y);
        mechanism.setRequiredSignals(mechData.requiredSignals || 1);
      } else if (mechData.type === 'relay') {
        mechanism = new Relay(x, y, mechData.id || index);
      }

      if (mechanism) {
        this.mechanisms.push(mechanism);
      }
    });

    // Create connections
    level.connections.forEach(conn => {
      const fromMech = this.mechanisms[conn.from];
      const toMech = this.mechanisms[conn.to];

      if (fromMech && toMech) {
        fromMech.connect(toMech, conn.color || '#00ffff');
      }
    });
  }

  restartLevel() {
    // Hide overlays
    document.getElementById('successOverlay').classList.add('hidden');

    // Reload current level
    this.loadLevel(this.currentLevel);
  }

  nextLevel() {
    // Hide success overlay
    document.getElementById('successOverlay').classList.add('hidden');

    // Load next level
    const nextLevel = this.currentLevel + 1;
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
    if (this.isRunning) {
      this.mechanisms.forEach(m => m.update(deltaTime));
      if (this.player) this.player.update(deltaTime);
      this.renderer.updateParticles();
      this.updateUI();
    }

    // Render
    this.renderer.render({
      mechanisms: this.mechanisms,
      player: this.player,
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
