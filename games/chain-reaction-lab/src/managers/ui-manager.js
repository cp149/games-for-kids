/**
 * UI Manager
 * Handles all UI panel visibility and updates
 */

import i18n from '../utils/i18n.js';

export class UIManager {
  constructor() {
    this.tutorialStep = 0;
  }

  /**
   * Update moves and time display
   * @param {number} moves - Current move count
   * @param {number} elapsedMs - Elapsed time in milliseconds
   */
  updateStats(moves, elapsedMs) {
    document.getElementById('movesValue').textContent = moves;
    document.getElementById('timeValue').textContent = this.formatTime(elapsedMs);
  }

  /**
   * Update level information display
   * @param {number|string} badge - Level badge text
   * @param {string} title - Level title
   * @param {string} description - Level description/goal
   */
  updateLevelInfo(badge, title, description) {
    document.getElementById('levelBadge').textContent = badge;
    document.getElementById('levelTitle').textContent = title;
    document.getElementById('goalValue').textContent = description;
  }

  /**
   * Update success overlay with completion stats
   * @param {number} moves - Total moves
   * @param {number} time - Completion time in ms
   */
  updateSuccessOverlay(moves, time) {
    document.getElementById('successMoves').textContent = moves;
    document.getElementById('successTime').textContent = this.formatTime(time);
  }

  // ==================== Panel Visibility ====================

  showHint() {
    document.getElementById('hintPanel').classList.remove('hidden');
  }

  hideHint() {
    document.getElementById('hintPanel').classList.add('hidden');
  }

  showSettings() {
    document.getElementById('settingsPanel').classList.remove('hidden');
  }

  hideSettings() {
    document.getElementById('settingsPanel').classList.add('hidden');
  }

  showDifficulty() {
    document.getElementById('difficultyPanel').classList.remove('hidden');
  }

  hideDifficulty() {
    document.getElementById('difficultyPanel').classList.add('hidden');
  }

  showGameComplete() {
    document.getElementById('gameCompletePanel').classList.remove('hidden');
  }

  hideGameComplete() {
    document.getElementById('gameCompletePanel').classList.add('hidden');
  }

  showSuccess() {
    document.getElementById('successOverlay').classList.remove('hidden');
  }

  hideSuccess() {
    document.getElementById('successOverlay').classList.add('hidden');
  }

  showLoadingIndicator() {
    let indicator = document.getElementById('generatingOverlay');
    if (!indicator) {
      // Create loading indicator if it doesn't exist
      indicator = document.createElement('div');
      indicator.id = 'generatingOverlay';
      indicator.className = 'overlay';
      indicator.innerHTML = `
        <div style="text-align: center; color: #fff;">
          <div class="loading-spinner"></div>
          <p style="margin-top: 20px; font-size: 1.2em;">Generating level...</p>
        </div>
      `;
      document.body.appendChild(indicator);
    }
    indicator.classList.remove('hidden');
  }

  hideLoadingIndicator() {
    const indicator = document.getElementById('generatingOverlay');
    if (indicator) {
      indicator.classList.add('hidden');
      // Remove from DOM after transition to prevent memory leak
      setTimeout(() => {
        if (indicator.parentNode) {
          indicator.parentNode.removeChild(indicator);
        }
      }, 300); // Match CSS transition duration
    }
  }

  // ==================== Tutorial Management ====================

  showTutorial() {
    document.getElementById('tutorialOverlay').classList.remove('hidden');
    this.tutorialStep = 0;
    this.updateTutorialStep();
  }

  hideTutorial() {
    document.getElementById('tutorialOverlay').classList.add('hidden');
    localStorage.setItem('chainReactionLab_tutorialComplete', 'true');
  }

  nextTutorialStep() {
    this.tutorialStep++;

    if (this.tutorialStep > 2) {
      return true; // Tutorial complete
    } else {
      this.updateTutorialStep();
      return false;
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

  isTutorialComplete() {
    return localStorage.getItem('chainReactionLab_tutorialComplete') === 'true';
  }

  // ==================== Utilities ====================

  /**
   * Format milliseconds to MM:SS
   * @param {number} ms - Milliseconds
   * @returns {string} Formatted time string
   */
  formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * Get level title by index
   * @param {number} index - Level index
   * @returns {string} Level title
   */
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

  hideLoadingScreen() {
    document.getElementById('loadingScreen').classList.add('hidden');
    document.getElementById('gameContainer').classList.remove('hidden');
  }
}
