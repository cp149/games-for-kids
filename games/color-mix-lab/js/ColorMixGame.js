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
    this.discoveredRecipes = [];
    this.earnedAchievements = [];
    this.hintTimer = null;
    this.hintShown = false;
    this.combo = 0;
    this.maxCombo = 0;
    this.freeplayMode = false;

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
    // Make color sources draggable AND clickable
    this.ui.getColorSources().forEach((source) => {
      const color = source.dataset.color;
      source.style.backgroundColor = CONFIG.COLORS[color];
      this.drag.makeDraggable(source, color);

      // Click to add color (easier than dragging)
      source.addEventListener('click', () => {
        source.classList.add('clicked');
        setTimeout(() => source.classList.remove('clicked'), 300);
        this._handleColorDrop(color);
      });
    });

    // Register bowl as drop target
    this.drag.addDropTarget(this.ui.getBowl(), (colorName) => {
      this._handleColorDrop(colorName);
    });

    // Clear button
    this.ui.getClearButton().addEventListener('click', () => {
      this._resetBowl();
    });

    // Free play toggle
    this.ui.getFreeplayButton().addEventListener('click', () => {
      this._toggleFreeplay();
    });

    // Initialize audio
    this.audio.init();
  }

  _toggleFreeplay() {
    this.freeplayMode = !this.freeplayMode;
    this.ui.setFreeplayMode(this.freeplayMode);
    this._clearHintTimer();
    this._resetBowl();

    if (this.freeplayMode) {
      this.log.info('Entering Free Play mode');
      this.ui.hideQuizQuestion();
    } else {
      this.log.info('Returning to Level mode');
      this._startLevel();
    }
  }

  _loadProgress() {
    try {
      const savedLevel = localStorage.getItem(CONFIG.STORAGE.LEVEL);
      const savedScore = localStorage.getItem(CONFIG.STORAGE.SCORE);
      const savedRecipes = localStorage.getItem(CONFIG.STORAGE.RECIPES);
      const savedAchievements = localStorage.getItem(CONFIG.STORAGE.ACHIEVEMENTS);
      if (savedLevel) this.currentLevel = parseInt(savedLevel, 10);
      if (savedScore) this.score = parseInt(savedScore, 10);
      if (savedRecipes) this.discoveredRecipes = JSON.parse(savedRecipes);
      if (savedAchievements) this.earnedAchievements = JSON.parse(savedAchievements);
      this.ui.updateRecipeBook(this.discoveredRecipes);
      this.log.debug('Progress loaded', { level: this.currentLevel, score: this.score });
    } catch (e) {
      this.log.warn('Storage not available');
    }
  }

  _saveProgress() {
    try {
      localStorage.setItem(CONFIG.STORAGE.LEVEL, this.currentLevel);
      localStorage.setItem(CONFIG.STORAGE.SCORE, this.score);
      localStorage.setItem(CONFIG.STORAGE.RECIPES, JSON.stringify(this.discoveredRecipes));
      localStorage.setItem(CONFIG.STORAGE.ACHIEVEMENTS, JSON.stringify(this.earnedAchievements));
    } catch (e) {
      // Storage not available
    }
  }

  _startLevel() {
    const levelData = CONFIG.LEVELS[this.currentLevel % CONFIG.LEVELS.length];
    this.currentLevelData = levelData;

    this.log.info(`Starting level ${this.currentLevel + 1}`, levelData);

    this.ui.updateLevel(this.currentLevel + 1);
    this.ui.updateScore(this.score);
    this.ui.hideQuizQuestion();
    this.ui.setBowlColor(CONFIG.COLORS.EMPTY);
    this.mixing.reset();

    if (levelData.type === 'quiz') {
      // Quiz mode: show question, pre-fill one color
      this.ui.setTargetColor(CONFIG.COLORS[levelData.result]);
      this.ui.showQuizQuestion(levelData.given, levelData.result);
      // Pre-add the given color to the bowl
      this.mixing.addColor(levelData.given);
      this.ui.setBowlColor(CONFIG.COLORS[levelData.given]);
    } else {
      // Standard mix mode
      this.ui.setTargetColor(CONFIG.COLORS[levelData.target]);
    }

    // Start hint timer
    this._startHintTimer();
  }

  _startHintTimer() {
    this._clearHintTimer();
    this.hintShown = false;
    this.ui.clearHint();
    this.hintTimer = setTimeout(() => {
      this._showHint();
    }, 5000);
  }

  _clearHintTimer() {
    if (this.hintTimer) {
      clearTimeout(this.hintTimer);
      this.hintTimer = null;
    }
  }

  _showHint() {
    if (this.isProcessing || this.hintShown) return;
    this.hintShown = true;

    const levelData = this.currentLevelData;
    const currentColors = this.mixing.getColors();
    let hintColor = null;

    if (levelData.type === 'quiz') {
      // Quiz mode: hint is the missing color
      hintColor = levelData.missing;
    } else {
      // Mix mode: find a valid next color
      const recipe = CONFIG.RECIPES.find(r => r.result === levelData.target);
      if (recipe) {
        hintColor = recipe.colors.find(c => !currentColors.includes(c));
      }
    }

    if (hintColor) {
      this.ui.showHint(hintColor);
    }
  }

  _handleColorDrop(colorName) {
    if (this.isProcessing) return;

    // Reset hint timer on any action
    this._startHintTimer();

    this.log.debug('Color dropped', colorName);
    this.audio.play('DROP');

    // Show splash effect with the dropped color
    this.ui.showSplash(CONFIG.COLORS[colorName]);

    const newColor = this.mixing.addColor(colorName);
    this.ui.setBowlColor(newColor);

    // Check if we have a mix result
    const resultName = this.mixing.getResultName();
    if (resultName) {
      this._checkResult(resultName);
    }
  }

  _checkResult(resultName) {
    const colors = this.mixing.getColors();

    this.log.debug('Checking result', { result: resultName, colors, freeplay: this.freeplayMode });

    // Free play mode: show formula after each mix, allow continued mixing
    if (this.freeplayMode) {
      // Show formula with current colors
      if (colors.length >= 2) {
        this.ui.showFormula(colors, resultName);
      }

      // Update chameleon color
      this.ui.setChameleonColor(this.mixing.getCurrentColor());

      if (resultName === 'MUD') {
        this.audio.play('WRONG');
        this.ui.showMudMonster();
        setTimeout(() => {
          this.ui.setChameleonColor('');
          this._resetBowl();
        }, 1000);
      } else if (this.mixing.isFull()) {
        // Bowl is full (4 colors) - show final result and reset
        this.audio.play('SUCCESS');
        this._discoverRecipe(colors, resultName);
        setTimeout(() => {
          this.ui.setChameleonColor('');
          this._resetBowl();
        }, 2000);
      }
      // Otherwise, let player continue adding colors
      return;
    }

    // Level mode: show formula at 2 colors
    if (colors.length === 2) {
      this.ui.hideQuizQuestion();
      this.ui.showFormula(colors, resultName);
    }

    // Level mode: check against target
    const levelData = this.currentLevelData;
    const target = levelData.type === 'quiz' ? levelData.result : levelData.target;

    if (resultName === target) {
      this._onSuccess();
    } else if (resultName === 'MUD') {
      this._onWrongMix();
    } else if (levelData.type === 'quiz') {
      // Wrong answer in quiz mode
      this._onWrongMix();
    }
  }

  _onSuccess() {
    this.isProcessing = true;
    this.log.info('Level complete!', { level: this.currentLevel + 1 });
    this.audio.play('SUCCESS');
    this.ui.playCelebration();
    this.ui.setChameleonColor(this.mixing.getCurrentColor());

    // Discover recipe
    const colors = this.mixing.getColors();
    const resultName = this.mixing.getResultName();
    this._discoverRecipe(colors, resultName);

    // Combo system
    this.combo++;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;

    // Calculate score with combo multiplier
    const basePoints = 100;
    const multiplier = Math.min(this.combo, 5); // Max 5x
    const bonusPoints = basePoints * multiplier;

    this.score += bonusPoints;
    this.ui.updateScore(this.score);

    // Show combo feedback
    if (this.combo >= 2) {
      this.ui.showCombo(this.combo, bonusPoints);
    }

    setTimeout(() => {
      this.currentLevel++;
      this._saveProgress();
      this._checkAchievements();
      this.ui.setChameleonColor('');
      this._startLevel();
      this.isProcessing = false;
    }, CONFIG.UI.CELEBRATION_DURATION);
  }


  _checkAchievements() {
    const stats = {
      levels: this.currentLevel,
      recipes: this.discoveredRecipes.length,
      score: this.score
    };

    CONFIG.ACHIEVEMENTS.forEach(achievement => {
      if (this.earnedAchievements.includes(achievement.id)) return;

      let earned = false;
      if (achievement.condition === 'levels >= 1' && stats.levels >= 1) earned = true;
      if (achievement.condition === 'recipes >= 3' && stats.recipes >= 3) earned = true;
      if (achievement.condition === 'levels >= 10' && stats.levels >= 10) earned = true;
      if (achievement.condition === 'score >= 1000' && stats.score >= 1000) earned = true;

      if (earned) {
        this.earnedAchievements.push(achievement.id);
        this.ui.showAchievement(achievement.icon, achievement.name);
        this.log.info('Achievement earned!', achievement);
      }
    });
  }

  _discoverRecipe(colors, result) {
    const recipe = CONFIG.RECIPES.find(r => r.result === result);
    if (recipe && !this.discoveredRecipes.includes(recipe.id)) {
      this.discoveredRecipes.push(recipe.id);
      this.ui.updateRecipeBook(this.discoveredRecipes);
      this.ui.showNewRecipe();
    }
  }

  _onWrongMix() {
    this.log.debug('Wrong mix - mud!');
    this.audio.play('WRONG');
    this.ui.showMudMonster();

    // Reset combo on wrong answer
    if (this.combo > 0) {
      this.ui.showComboBreak();
    }
    this.combo = 0;

    setTimeout(() => this._resetBowl(), 1000);
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
