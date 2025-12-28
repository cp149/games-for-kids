/**
 * UI Manager
 * Handles UI updates
 */

class UIManager {
  constructor(config, i18n) {
    this.config = config;
    this.i18n = i18n;

    // DOM elements - Labels
    this.levelLabel = document.getElementById('level-label');
    this.scoreLabel = document.getElementById('score-label');
    this.timerLabel = document.getElementById('timer-label');
    this.goalLabel = document.getElementById('goal-label');

    // DOM elements - Values
    this.levelNumber = document.getElementById('level-number');
    this.scoreValue = document.getElementById('score-value');
    this.timerValue = document.getElementById('timer-value');
    this.objectiveText = document.getElementById('objective-text');

    // Buttons
    this.mixButton = document.getElementById('mix-button');
    this.startButton = document.getElementById('start-button');
    this.musicToggle = document.getElementById('music-toggle');
    this.soundToggle = document.getElementById('sound-toggle');

    // Menu
    this.menuTitle = document.getElementById('menu-title');
    this.demoText = document.getElementById('demo-text');

    // Tutorial hints
    this.hint1 = document.getElementById('tutorial-hint-1');
    this.hint2 = document.getElementById('tutorial-hint-2');
    this.hint3 = document.getElementById('tutorial-hint-3');

    // Initialize UI text
    this.updateAllText();
  }

  /**
   * Update level display
   */
  updateLevel(level) {
    if (this.levelNumber) {
      this.levelNumber.textContent = level;
    }
  }

  /**
   * Update score display
   */
  updateScore(score) {
    if (this.scoreValue) {
      this.scoreValue.textContent = score;
    }
  }

  /**
   * Update timer display
   */
  updateTimer(seconds) {
    if (this.timerValue) {
      this.timerValue.textContent = Math.ceil(seconds);
    }
  }

  /**
   * Update objective display with graphical data
   */
  updateObjectiveDisplay(data) {
    if (!this.objectiveText) return;
    
    // Clear current content
    this.objectiveText.innerHTML = '';
    this.objectiveText.className = ''; // Reset classes

    if (!data) return;

    // Container for objective
    const container = document.createElement('div');
    container.className = 'objective-container';
    
    // Main objective line
    const mainLine = document.createElement('div');
    mainLine.className = 'objective-main';
    
    // Unified objective display format: emoji + progress
    const buildItem = (emoji, current, target) => {
      const complete = current >= target;
      const status = complete ? '✅' : `${current}/${target}`;
      return `<span class="obj-item ${complete ? 'complete' : ''}">${emoji}${status}</span>`;
    };

    switch (data.type) {
      case 'specific':
        if (data.recipe) {
          mainLine.innerHTML = buildItem(data.recipe.output, data.currentCount, data.targetCount);
        } else {
          mainLine.innerHTML = buildItem('🎯', data.currentCount, data.targetCount);
        }
        break;

      case 'count':
        mainLine.innerHTML = buildItem('✨', data.currentCount, data.targetCount);
        break;

      case 'score':
        // Visual star collection for children (e.g., 500 points = 10 stars)
        const starCount = 10;
        const pointsPerStar = data.targetScore / starCount;
        const filledStars = Math.min(starCount, Math.floor(data.currentScore / pointsPerStar));
        const stars = '⭐'.repeat(filledStars) + '☆'.repeat(starCount - filledStars);
        mainLine.innerHTML = `<span class="obj-item score-stars">${stars}</span>`;
        break;

      case 'catalyst':
        mainLine.innerHTML = buildItem('⭐', data.currentCount, data.targetCount);
        break;

      case 'multiple_specific':
        if (data.items && data.items.length > 0) {
          mainLine.innerHTML = data.items.map(item =>
            buildItem(item.emoji, item.current, item.target)
          ).join(' ');
        } else {
          mainLine.textContent = data.description;
        }
        break;

      default:
        mainLine.textContent = data.description;
    }
    
    container.insertBefore(mainLine, container.firstChild);
    this.objectiveText.appendChild(container);
  }

  /**
   * Update objective display (Legacy text)
   */
  updateObjective(text) {
    if (this.objectiveText) {
      this.objectiveText.textContent = text;
    }
  }

  /**
   * Enable/disable mix button
   */
  setMixButtonEnabled(enabled) {
    this.mixButton = document.getElementById('mix-button');
    if (this.mixButton) {
      this.mixButton.disabled = !enabled;
    }
  }

  /**
   * Update music toggle button
   */
  updateMusicToggle(enabled) {
    if (this.musicToggle) {
      this.musicToggle.textContent = enabled ? '🔊' : '🔇';
      this.musicToggle.setAttribute('aria-label',
        enabled ? this.i18n.t('music_on') : this.i18n.t('music_off')
      );
    }
  }

  /**
   * Update sound toggle button
   */
  updateSoundToggle(enabled) {
    if (this.soundToggle) {
      this.soundToggle.textContent = enabled ? '🔊' : '🔇';
      this.soundToggle.setAttribute('aria-label',
        enabled ? this.i18n.t('sound_on') : this.i18n.t('sound_off')
      );
    }
  }

  /**
   * Update all UI text with current language
   */
  updateAllText() {
    if (!this.i18n) return;

    // Labels
    if (this.levelLabel) {
      this.levelLabel.textContent = this.i18n.t('level_label');
    }
    if (this.scoreLabel) {
      this.scoreLabel.textContent = this.i18n.t('score_label') + ':';
    }
    if (this.timerLabel) {
      this.timerLabel.textContent = this.i18n.t('time_label') + ':';
    }
    if (this.goalLabel) {
      // Hide textual label for cleaner graphical UI
      this.goalLabel.textContent = '';
      this.goalLabel.style.display = 'none';
    }

    // Menu text
    if (this.menuTitle) {
      this.menuTitle.textContent = `🧪 ${this.i18n.t('game_title')}`;
    }
    if (this.demoText) {
      this.demoText.textContent = this.i18n.t('demo_text');
    }
    if (this.startButton) {
      this.startButton.textContent = this.i18n.t('start_button');
    }
    
    this.mixButton = document.getElementById('mix-button');
    if (this.mixButton) {
      this.mixButton.textContent = this.i18n.t('mix_button');
    }

    // Tutorial hints
    if (this.hint1) {
      this.hint1.textContent = this.i18n.t('hint_drag');
    }
    if (this.hint2) {
      this.hint2.textContent = this.i18n.t('hint_drop');
    }
    if (this.hint3) {
      this.hint3.textContent = this.i18n.t('hint_mix');
    }
  }

  /**
   * Show menu overlay
   */
  showMenu(message) {
    const menuOverlay = document.getElementById('menu-overlay');
    if (menuOverlay) {
      menuOverlay.classList.remove('hidden');

      // Update message
      if (this.menuTitle && message) {
        this.menuTitle.textContent = message;
      }
    }
  }

  /**
   * Hide menu overlay
   */
  hideMenu() {
    const menuOverlay = document.getElementById('menu-overlay');
    if (menuOverlay) {
      menuOverlay.classList.add('hidden');
    }
  }

  /**
   * Clean up
   */
  destroy() {
    // No resources to clean
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.UIManager = UIManager;
}
