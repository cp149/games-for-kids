/**
 * UIManager - DOM creation and manipulation
 */

class UIManager {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.elements = {};
    this._createUI();
  }

  _createUI() {
    // Get i18n instance
    this.i18n = window.i18n;

    this.container.innerHTML = `
      <header class="game-header">
        <span class="level-display">🎨 <span class="level-num">1</span></span>
        <div class="header-buttons">
          <button class="home-btn">🏠</button>
          <button class="lang-btn">🌐</button>
          <button class="freeplay-btn">🎪</button>
          <button class="recipe-btn">📖</button>
          <button class="reset-btn">🔄</button>
        </div>
        <span class="score-display">⭐ <span class="score-num">0</span></span>
      </header>
      <div class="recipe-book hidden">
        <div class="recipe-book-header">
          <span class="recipe-title"></span>
          <button class="close-btn">✕</button>
        </div>
        <div class="recipe-list"></div>
      </div>
      <main class="game-main">
        <div class="chameleon-area">
          <div class="story-bubble">
            <span class="story-char"></span>
            <span class="story-text"></span>
          </div>
          <div class="chameleon">🦎</div>
          <div class="target-preview"></div>
        </div>
        <div class="bowl-area">
          <div class="bowl">
            <div class="bowl-liquid"></div>
          </div>
          <div class="formula-display"></div>
          <button class="clear-btn">🗑️</button>
        </div>
        <div class="palette-area">
          <div class="color-source" data-color="RED"></div>
          <div class="color-source" data-color="BLUE"></div>
          <div class="color-source" data-color="YELLOW"></div>
        </div>
      </main>
    `;

    this.elements = {
      levelNum: this.container.querySelector('.level-num'),
      scoreNum: this.container.querySelector('.score-num'),
      chameleon: this.container.querySelector('.chameleon'),
      targetPreview: this.container.querySelector('.target-preview'),
      storyBubble: this.container.querySelector('.story-bubble'),
      storyChar: this.container.querySelector('.story-char'),
      storyText: this.container.querySelector('.story-text'),
      bowl: this.container.querySelector('.bowl'),
      bowlLiquid: this.container.querySelector('.bowl-liquid'),
      formulaDisplay: this.container.querySelector('.formula-display'),
      clearBtn: this.container.querySelector('.clear-btn'),
      colorSources: this.container.querySelectorAll('.color-source'),
      recipeBtn: this.container.querySelector('.recipe-btn'),
      recipeBook: this.container.querySelector('.recipe-book'),
      recipeList: this.container.querySelector('.recipe-list'),
      recipeTitle: this.container.querySelector('.recipe-title'),
      closeBtn: this.container.querySelector('.close-btn'),
      resetBtn: this.container.querySelector('.reset-btn'),
      freeplayBtn: this.container.querySelector('.freeplay-btn'),
      levelDisplay: this.container.querySelector('.level-display'),
      langBtn: this.container.querySelector('.lang-btn'),
      homeBtn: this.container.querySelector('.home-btn')
    };

    // Recipe book toggle
    this.elements.recipeBtn.addEventListener('click', () => this.toggleRecipeBook());
    this.elements.closeBtn.addEventListener('click', () => this.hideRecipeBook());
    
    // Reset button
    this.elements.resetBtn.addEventListener('click', () => this._confirmReset());

    // Home button - return to game list
    this.elements.homeBtn.addEventListener('click', () => {
      window.location.href = '../../index.html';
    });

    // Language toggle
    this.elements.langBtn.addEventListener('click', () => this._toggleLanguage());

    // Apply i18n texts
    this._updateI18nTexts();

    // Listen for language changes
    if (this.i18n) {
      this.i18n.onLanguageChange(() => this._updateI18nTexts());
    }
  }

  updateLevel(level) {
    this.elements.levelNum.textContent = level;
  }

  updateScore(score) {
    this.elements.scoreNum.textContent = score;
  }

  setInstruction(text) {
    // No longer using text instructions - visual only
  }

  showFormula(colors, result) {
    const emoji = CONFIG.COLOR_EMOJI;
    // Handle both old 2-arg style and new array style
    if (typeof colors === 'string') {
      // Old style: showFormula(color1, color2, result) - result is 3rd arg
      const color1 = colors;
      const color2 = result;
      const actualResult = arguments[2];
      colors = [color1, color2];
      result = actualResult;
    }
    const colorEmojis = colors.map(c => emoji[c]).join(' + ');
    const formula = `${colorEmojis} = ${emoji[result] || '?'}`;
    this.elements.formulaDisplay.textContent = formula;
    this.elements.formulaDisplay.classList.add('show');

    setTimeout(() => {
      this.elements.formulaDisplay.classList.remove('show');
    }, 2500);
  }

  hideFormula() {
    this.elements.formulaDisplay.classList.remove('show');
    this.elements.formulaDisplay.textContent = '';
  }

  toggleRecipeBook() {
    this.elements.recipeBook.classList.toggle('hidden');
  }

  hideRecipeBook() {
    this.elements.recipeBook.classList.add('hidden');
  }

  updateRecipeBook(discoveredIds) {
    const emoji = CONFIG.COLOR_EMOJI;
    const html = CONFIG.RECIPES.map(recipe => {
      const discovered = discoveredIds.includes(recipe.id);
      if (discovered) {
        const colorEmojis = recipe.colors.map(c => emoji[c]).join(' + ');
        return `<div class="recipe-card discovered">
          ${colorEmojis} = ${emoji[recipe.result]}
        </div>`;
      } else {
        const questionMarks = recipe.colors.map(() => '❓').join(' + ');
        return `<div class="recipe-card locked">${questionMarks} = ❓</div>`;
      }
    }).join('');
    this.elements.recipeList.innerHTML = html;
  }


  showNewRecipe() {
    // Flash the recipe button to indicate new discovery
    this.elements.recipeBtn.classList.add('new-recipe');
    setTimeout(() => {
      this.elements.recipeBtn.classList.remove('new-recipe');
    }, 1500);
  }

  showMudMonster() {
    // Create mud monster overlay
    const monster = document.createElement('div');
    monster.className = 'mud-monster';
    monster.textContent = '💩';
    this.container.appendChild(monster);

    // Animate and remove
    setTimeout(() => {
      monster.classList.add('splat');
    }, 50);

    setTimeout(() => {
      monster.remove();
    }, 1200);
  }


  showAchievement(icon, name) {
    const badge = document.createElement('div');
    badge.className = 'achievement-badge';
    badge.innerHTML = `<span class="achievement-icon">${icon}</span><span class="achievement-name">${name}</span>`;
    this.container.appendChild(badge);

    setTimeout(() => {
      badge.classList.add('show');
    }, 50);

    setTimeout(() => {
      badge.classList.remove('show');
      setTimeout(() => badge.remove(), 500);
    }, 2500);
  }


  _confirmReset() {
    localStorage.removeItem(CONFIG.STORAGE.LEVEL);
    localStorage.removeItem(CONFIG.STORAGE.SCORE);
    localStorage.removeItem(CONFIG.STORAGE.RECIPES);
    localStorage.removeItem(CONFIG.STORAGE.ACHIEVEMENTS);
    location.reload();
  }

  setTargetColor(hex) {
    this.elements.targetPreview.style.backgroundColor = hex;
  }

  /**
   * Show story bubble with character and target color (visual only, no text)
   * @param {object} storyData - { char: emoji }
   * @param {string} targetColorHex - target color hex value
   */
  updateStory(storyData, targetColorHex) {
    if (!storyData || !storyData.char) {
      this.hideStory();
      return;
    }
    
    this.elements.storyChar.textContent = storyData.char;
    // Show target color as visual indicator instead of text
    this.elements.storyText.innerHTML = `<span class="story-color" style="background-color: ${targetColorHex || '#ccc'}"></span>`;
    
    // Show with animation
    this.elements.storyBubble.classList.remove('show');
    // Force reflow for animation restart
    void this.elements.storyBubble.offsetWidth;
    this.elements.storyBubble.classList.add('show');
  }

  /**
   * Hide story bubble
   */
  hideStory() {
    this.elements.storyBubble.classList.remove('show');
  }

  showQuizQuestion(givenColor, resultColor) {
    const emoji = CONFIG.COLOR_EMOJI;
    const question = `${emoji[givenColor]} + ❓ = ${emoji[resultColor]}`;
    this.elements.formulaDisplay.textContent = question;
    this.elements.formulaDisplay.classList.add('show', 'quiz-mode');
  }

  hideQuizQuestion() {
    this.elements.formulaDisplay.classList.remove('show', 'quiz-mode');
    this.elements.formulaDisplay.textContent = '';
  }

  setBowlColor(hex) {
    this.elements.bowlLiquid.style.backgroundColor = hex;
  }

  setChameleonColor(hex) {
    this.elements.chameleon.style.color = hex;
  }

  playCelebration() {
    this.elements.chameleon.classList.add('celebrating');
    setTimeout(() => {
      this.elements.chameleon.classList.remove('celebrating');
    }, 1500);
  }

  playShake() {
    this.elements.bowl.classList.add('shaking');
    setTimeout(() => {
      this.elements.bowl.classList.remove('shaking');
    }, 300);
  }

  getColorSources() {
    return this.elements.colorSources;
  }

  getBowl() {
    return this.elements.bowl;
  }

  getClearButton() {
    return this.elements.clearBtn;
  }

  getFreeplayButton() {
    return this.elements.freeplayBtn;
  }

  setFreeplayMode(enabled) {
    if (enabled) {
      const freeText = this.i18n ? this.i18n.t('free') : 'Free';
      this.elements.levelDisplay.innerHTML = `🎪 <span class="level-num">${freeText}</span>`;
      this.elements.targetPreview.style.display = 'none';
      this.elements.freeplayBtn.classList.add('active');
    } else {
      this.elements.targetPreview.style.display = '';
      this.elements.freeplayBtn.classList.remove('active');
    }
  }


  /**
   * Set the number of mixing slots (2 or 3)
   * Updates UI to show visual indicator for multi-color mixing
   * @param {2|3} count - Number of slots
   */
  setSlotCount(count) {
    this.currentSlotCount = count;
    const bowl = this.elements.bowl;
    
    // Update bowl class for styling
    bowl.classList.remove('slots-2', 'slots-3');
    bowl.classList.add(`slots-${count}`);
    
    // Create or update slot indicator
    let indicator = this.container.querySelector('.slot-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'slot-indicator';
      this.elements.bowl.parentElement.insertBefore(indicator, this.elements.bowl);
      this.elements.slotIndicator = indicator;
    }
    
    // Show dots for required colors
    const dots = Array(count).fill('○').join(' ');
    indicator.innerHTML = `<span class="slot-dots">${dots}</span>`;
    indicator.dataset.slotCount = count;
  }

  /**
   * Update slot indicator to show filled colors
   * @param {number} filledCount - Number of colors added
   */
  updateSlotProgress(filledCount) {
    const indicator = this.elements.slotIndicator;
    if (!indicator) return;
    
    const total = this.currentSlotCount || 2;
    const dots = [];
    for (let i = 0; i < total; i++) {
      dots.push(i < filledCount ? '●' : '○');
    }
    indicator.innerHTML = `<span class="slot-dots">${dots.join(' ')}</span>`;
  }

  /**
   * Get current slot count
   * @returns {number}
   */
  getSlotCount() {
    return this.currentSlotCount || 2;
  }

  showHint(colorName) {
    // Find the color source with matching color
    this.elements.colorSources.forEach(source => {
      if (source.dataset.color === colorName) {
        source.classList.add('hint-pulse');
      }
    });
  }

  clearHint() {
    this.elements.colorSources.forEach(source => {
      source.classList.remove('hint-pulse');
    });
  }

  showCombo(count, points) {
    const combo = document.createElement('div');
    combo.className = 'combo-popup';
    combo.innerHTML = `<span class="combo-count">${count}x</span><span class="combo-points">+${points}</span>`;
    this.container.appendChild(combo);

    setTimeout(() => {
      combo.classList.add('show');
    }, 50);

    setTimeout(() => {
      combo.classList.remove('show');
      setTimeout(() => combo.remove(), 300);
    }, 1200);
  }

  showComboBreak() {
    const breakEl = document.createElement('div');
    breakEl.className = 'combo-break';
    breakEl.textContent = this.i18n ? this.i18n.t('comboBreak') : 'Combo Break!';
    this.container.appendChild(breakEl);

    setTimeout(() => {
      breakEl.classList.add('show');
    }, 50);

    setTimeout(() => {
      breakEl.classList.remove('show');
      setTimeout(() => breakEl.remove(), 300);
    }, 800);
  }

  showSplash(colorHex) {
    // Create splash particles
    const bowl = this.elements.bowl;
    const rect = bowl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 3;

    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('div');
      particle.className = 'splash-particle';
      particle.style.backgroundColor = colorHex;
      particle.style.left = centerX + 'px';
      particle.style.top = centerY + 'px';

      // Random direction
      const angle = (i / 8) * Math.PI * 2;
      const distance = 40 + Math.random() * 30;
      particle.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
      particle.style.setProperty('--ty', Math.sin(angle) * distance - 20 + 'px');

      document.body.appendChild(particle);

      // Remove after animation
      setTimeout(() => particle.remove(), 600);
    }
  }

  /**
   * Show confetti celebration for level completion
   * @param {number} count - Number of confetti pieces (default 30)
   */
  showConfetti(count = 30) {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);

    const colors = ['#FF4136', '#0074D9', '#FFDC00', '#2ECC40', '#FF851B', '#B10DC9'];
    const shapes = ['circle', 'square'];

    for (let i = 0; i < count; i++) {
      const confetti = document.createElement('div');
      confetti.className = `confetti ${shapes[Math.floor(Math.random() * shapes.length)]}`;
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.animationDelay = `${Math.random() * 0.5}s`;
      confetti.style.animationDuration = `${1 + Math.random() * 1}s`;
      container.appendChild(confetti);
    }

    // Remove container after animation
    setTimeout(() => container.remove(), 2500);

    // Trigger haptic feedback if supported
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }
  }

  /**
   * Show level complete celebration overlay
   * @param {number} level - Completed level number
   * @param {number} stars - Stars earned (1-3)
   */
  showLevelComplete(level, stars = 3) {
    const overlay = document.createElement('div');
    overlay.className = 'level-complete-overlay';
    overlay.innerHTML = `
      <span class="level-complete-emoji">🎉</span>
      <span class="level-complete-stars">${'⭐'.repeat(stars)}</span>
    `;
    document.body.appendChild(overlay);

    // Trigger confetti
    this.showConfetti(40);

    // Show overlay
    setTimeout(() => overlay.classList.add('show'), 100);

    // Hide and remove
    setTimeout(() => {
      overlay.classList.remove('show');
      setTimeout(() => overlay.remove(), 400);
    }, 1800);
  }


  _updateI18nTexts() {
    if (!this.i18n) return;

    // Update button titles
    this.elements.homeBtn.title = this.i18n.t('home');
    this.elements.langBtn.title = this.i18n.t('language');
    this.elements.freeplayBtn.title = this.i18n.t('freePlayBtn');
    this.elements.recipeBtn.title = this.i18n.t('recipeBook');
    this.elements.resetBtn.title = this.i18n.t('resetProgress');
    this.elements.clearBtn.title = this.i18n.t('clear');
    this.elements.closeBtn.title = this.i18n.t('close');

    // Update recipe book title
    this.elements.recipeTitle.textContent = '📖 ' + this.i18n.t('recipeBookTitle');
  }

  _toggleLanguage() {
    if (!this.i18n) return;

    const current = this.i18n.getLanguage();
    const newLang = current === 'en' ? 'zh' : 'en';

    this.i18n.setLanguage(newLang);
    localStorage.setItem('colorMixLab_language', newLang);
  }

  destroy() {
    this.container.innerHTML = '';
    this.elements = {};
  }
}

// Dual export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { UIManager };
}
if (typeof window !== 'undefined') {
  window.UIManager = UIManager;
}
