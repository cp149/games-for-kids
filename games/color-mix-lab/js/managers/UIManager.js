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
        <span class="level-display">Level 1</span>
        <span class="score-display">Score: 0</span>
      </header>
      <main class="game-main">
        <div class="chameleon-area">
          <div class="chameleon">🦎</div>
          <div class="speech-bubble">Make me orange!</div>
          <div class="target-preview"></div>
        </div>
        <div class="bowl-area">
          <div class="bowl">
            <div class="bowl-liquid"></div>
          </div>
          <button class="clear-btn">Clear</button>
        </div>
        <div class="palette-area">
          <div class="color-source" data-color="RED"></div>
          <div class="color-source" data-color="BLUE"></div>
          <div class="color-source" data-color="YELLOW"></div>
        </div>
      </main>
    `;

    this.elements = {
      levelDisplay: this.container.querySelector('.level-display'),
      scoreDisplay: this.container.querySelector('.score-display'),
      chameleon: this.container.querySelector('.chameleon'),
      speechBubble: this.container.querySelector('.speech-bubble'),
      targetPreview: this.container.querySelector('.target-preview'),
      bowl: this.container.querySelector('.bowl'),
      bowlLiquid: this.container.querySelector('.bowl-liquid'),
      clearBtn: this.container.querySelector('.clear-btn'),
      colorSources: this.container.querySelectorAll('.color-source')
    };
  }

  updateLevel(level) {
    this.elements.levelDisplay.textContent = `Level ${level}`;
  }

  updateScore(score) {
    this.elements.scoreDisplay.textContent = `Score: ${score}`;
  }

  setInstruction(text) {
    this.elements.speechBubble.textContent = text;
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
