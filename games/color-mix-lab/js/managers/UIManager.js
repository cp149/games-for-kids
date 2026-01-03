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
        <span class="score-display">⭐ <span class="score-num">0</span></span>
      </header>
      <main class="game-main">
        <div class="chameleon-area">
          <div class="chameleon">🦎</div>
          <div class="target-preview"></div>
        </div>
        <div class="bowl-area">
          <div class="bowl">
            <div class="bowl-liquid"></div>
          </div>
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
      clearBtn: this.container.querySelector('.clear-btn'),
      colorSources: this.container.querySelectorAll('.color-source')
    };
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

  setTargetColor(hex) {
    this.elements.targetPreview.style.backgroundColor = hex;
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
