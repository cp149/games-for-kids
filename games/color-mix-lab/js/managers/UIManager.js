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
    this.container.innerHTML = `
      <header class="game-header">
        <span class="level-display">🎨 <span class="level-num">1</span></span>
        <div class="header-buttons">
          <button class="recipe-btn">📖</button>
          <button class="reset-btn">🔄</button>
        </div>
        <span class="score-display">⭐ <span class="score-num">0</span></span>
      </header>
      <div class="recipe-book hidden">
        <div class="recipe-book-header">
          <span>📖 Recipe Book</span>
          <button class="close-btn">✕</button>
        </div>
        <div class="recipe-list"></div>
      </div>
      <main class="game-main">
        <div class="chameleon-area">
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
      bowl: this.container.querySelector('.bowl'),
      bowlLiquid: this.container.querySelector('.bowl-liquid'),
      formulaDisplay: this.container.querySelector('.formula-display'),
      clearBtn: this.container.querySelector('.clear-btn'),
      colorSources: this.container.querySelectorAll('.color-source'),
      recipeBtn: this.container.querySelector('.recipe-btn'),
      recipeBook: this.container.querySelector('.recipe-book'),
      recipeList: this.container.querySelector('.recipe-list'),
      closeBtn: this.container.querySelector('.close-btn'),
      resetBtn: this.container.querySelector('.reset-btn')
    };

    // Recipe book toggle
    this.elements.recipeBtn.addEventListener('click', () => this.toggleRecipeBook());
    this.elements.closeBtn.addEventListener('click', () => this.hideRecipeBook());
    
    // Reset button
    this.elements.resetBtn.addEventListener('click', () => this._confirmReset());
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

  showFormula(color1, color2, result) {
    const emoji = CONFIG.COLOR_EMOJI;
    const formula = `${emoji[color1]} + ${emoji[color2]} = ${emoji[result]}`;
    this.elements.formulaDisplay.textContent = formula;
    this.elements.formulaDisplay.classList.add('show');

    setTimeout(() => {
      this.elements.formulaDisplay.classList.remove('show');
    }, 2000);
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
        return `<div class="recipe-card discovered">
          ${emoji[recipe.colors[0]]} + ${emoji[recipe.colors[1]]} = ${emoji[recipe.result]}
        </div>`;
      } else {
        return `<div class="recipe-card locked">❓ + ❓ = ❓</div>`;
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
    if (confirm('Reset all progress? 重置所有进度？')) {
      localStorage.removeItem(CONFIG.STORAGE.LEVEL);
      localStorage.removeItem(CONFIG.STORAGE.SCORE);
      localStorage.removeItem(CONFIG.STORAGE.RECIPES);
      localStorage.removeItem(CONFIG.STORAGE.ACHIEVEMENTS);
      location.reload();
    }
  }

  setTargetColor(hex) {
    this.elements.targetPreview.style.backgroundColor = hex;
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
