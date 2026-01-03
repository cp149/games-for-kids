/**
 * ColorMixGame - Main game controller
 * Coordinates all managers and systems
 */

class ColorMixGame {
  constructor(containerId) {
    this.containerId = containerId;
    this.currentLevel = 0;
    this.score = 0;
    this.isProcessing = false;

    // Use shared Logger if available
    this.log = window.Logger || console;
    this.log.info('ColorMixGame initializing...');

    // Initialize performance monitor in dev mode
    if (window.PerformanceMonitor) {
      this.perfMonitor = new window.PerformanceMonitor({ position: 'top-left' });
      this.perfMonitor.init();
      this._startPerfLoop();
    }

    // Initialize managers
    this.ui = new UIManager(containerId);
    this.audio = new AudioManager(CONFIG);
    this.mixing = new MixingSystem(CONFIG);
    this.drag = new DragManager({
      threshold: CONFIG.UI.DRAG_THRESHOLD,
      onDragStart: this._onDragStart.bind(this),
      onDragEnd: this._onDragEnd.bind(this),
      onDrop: this._onDrop.bind(this)
    });

    this._setupInteractions();
    this._loadProgress();
    this._startLevel();
    this.log.info('ColorMixGame ready');
  }

  _setupInteractions() {
    // Make color sources draggable
    this.ui.getColorSources().forEach((source) => {
      const color = source.dataset.color;
      source.style.backgroundColor = CONFIG.COLORS[color];
      this.drag.makeDraggable(source, color);
    });

    // Register bowl as drop target
    this.drag.addDropTarget(this.ui.getBowl(), (colorName) => {
      this._handleColorDrop(colorName);
    });

    // Clear button
    this.ui.getClearButton().addEventListener('click', () => {
      this._resetBowl();
    });

    // Initialize audio
    this.audio.init();
  }

  _loadProgress() {
    try {
      const savedLevel = localStorage.getItem(CONFIG.STORAGE.LEVEL);
      const savedScore = localStorage.getItem(CONFIG.STORAGE.SCORE);
      if (savedLevel) this.currentLevel = parseInt(savedLevel, 10);
      if (savedScore) this.score = parseInt(savedScore, 10);
      this.log.debug('Progress loaded', { level: this.currentLevel, score: this.score });
    } catch (e) {
      this.log.warn('Storage not available');
    }
  }

  _saveProgress() {
    try {
      localStorage.setItem(CONFIG.STORAGE.LEVEL, this.currentLevel);
      localStorage.setItem(CONFIG.STORAGE.SCORE, this.score);
    } catch (e) {
      // Storage not available
    }
  }

  _startLevel() {
    const levelData = CONFIG.LEVELS[this.currentLevel % CONFIG.LEVELS.length];
    const targetColor = CONFIG.COLORS[levelData.target];

    this.log.info(`Starting level ${this.currentLevel + 1}`, { target: levelData.target });

    this.ui.updateLevel(this.currentLevel + 1);
    this.ui.updateScore(this.score);
    this.ui.setInstruction(levelData.hint);
    this.ui.setTargetColor(targetColor);
    this.ui.setBowlColor(CONFIG.COLORS.EMPTY);
    this.mixing.reset();
  }

  _handleColorDrop(colorName) {
    if (this.isProcessing) return;

    this.log.debug('Color dropped', colorName);
    this.audio.play('DROP');
    const newColor = this.mixing.addColor(colorName);
    this.ui.setBowlColor(newColor);

    // Check if we have a mix result
    const resultName = this.mixing.getResultName();
    if (resultName) {
      this._checkResult(resultName);
    }
  }

  _checkResult(resultName) {
    const levelData = CONFIG.LEVELS[this.currentLevel % CONFIG.LEVELS.length];

    this.log.debug('Checking result', { result: resultName, target: levelData.target });

    if (resultName === levelData.target) {
      this._onSuccess();
    } else if (resultName === 'MUD') {
      this._onWrongMix();
    }
  }

  _onSuccess() {
    this.isProcessing = true;
    this.log.info('Level complete!', { level: this.currentLevel + 1 });
    this.audio.play('SUCCESS');
    this.ui.playCelebration();
    this.ui.setChameleonColor(this.mixing.getCurrentColor());

    this.score += 100;
    this.ui.updateScore(this.score);

    setTimeout(() => {
      this.currentLevel++;
      this._saveProgress();
      this.ui.setChameleonColor('');
      this._startLevel();
      this.isProcessing = false;
    }, CONFIG.UI.CELEBRATION_DURATION);
  }

  _onWrongMix() {
    this.log.debug('Wrong mix - mud!');
    this.audio.play('WRONG');
    this.ui.playShake();
    setTimeout(() => this._resetBowl(), 500);
  }

  _resetBowl() {
    this.mixing.reset();
    this.ui.setBowlColor(CONFIG.COLORS.EMPTY);
  }

  _onDragStart(element, data) {
    element.classList.add('dragging');
  }

  _onDragEnd(data) {
    document.querySelectorAll('.dragging').forEach((el) => {
      el.classList.remove('dragging');
    });
  }

  _onDrop(data, target) {
    // Visual feedback handled elsewhere
  }

  _startPerfLoop() {
    const loop = () => {
      if (this.perfMonitor && this.perfMonitor.isEnabled()) {
        this.perfMonitor.update();
        this._perfRAF = requestAnimationFrame(loop);
      }
    };
    this._perfRAF = requestAnimationFrame(loop);
  }

  destroy() {
    if (this._perfRAF) cancelAnimationFrame(this._perfRAF);
    this.log.info('ColorMixGame destroying...');
    if (this.perfMonitor) this.perfMonitor.destroy();
    this.ui.destroy();
    this.audio.destroy();
    this.mixing.destroy();
    this.drag.destroy();
  }
}

// Dual export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ColorMixGame };
}
if (typeof window !== 'undefined') {
  window.ColorMixGame = ColorMixGame;
}
