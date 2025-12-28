/**
 * Input Manager
 * Handles all user input including audio controls and mix button
 */

class InputManager {
  constructor(game) {
    this.game = game;
    this.mixButton = null;
  }

  /**
   * Setup all input handlers
   */
  setupAllHandlers() {
    this.setupAudioControls();
    this.setupMixButton();
  }

  /**
   * Setup audio controls
   */
  setupAudioControls() {
    const musicToggle = document.getElementById('music-toggle');
    const soundToggle = document.getElementById('sound-toggle');

    // Initialize button states
    this.game.uiMgr.updateMusicToggle(this.game.audioMgr.isMusicEnabled());
    this.game.uiMgr.updateSoundToggle(this.game.audioMgr.isSoundEnabled());

    // Music toggle
    if (musicToggle) {
      musicToggle.addEventListener('click', () => {
        const enabled = this.game.audioMgr.toggleMusic();
        this.game.uiMgr.updateMusicToggle(enabled);
      });
    }

    // Sound toggle
    if (soundToggle) {
      soundToggle.addEventListener('click', () => {
        const enabled = this.game.audioMgr.toggleSound();
        this.game.uiMgr.updateSoundToggle(enabled);
      });
    }
  }

  /**
   * Setup mix button
   */
  setupMixButton() {
    const mixButton = document.getElementById('mix-button');
    if (mixButton) {
      // Remove existing listener
      const newButton = mixButton.cloneNode(true);
      mixButton.parentNode.replaceChild(newButton, mixButton);

      // Add new listener
      newButton.addEventListener('click', () => {
        this.handleMixButtonClick();
      });

      this.mixButton = newButton;
    }
  }

  /**
   * Handle mix button click
   */
  handleMixButtonClick() {
    // Get cards in slots
    const cardTypes = this.game.slotMgr.getSlotCardTypes();

    if (cardTypes.length === 0) {
      return;
    }

    // Check for valid reaction
    const reaction = this.game.reactionRules.checkReaction(cardTypes);

    if (reaction) {
      this.game.performReaction(reaction);
    } else {
      // Feedback for invalid reaction
      this.game.audioMgr.playFail();
      
      const table = document.getElementById('experiment-table');
      if (table) {
        table.classList.add('invalid-reaction');
        setTimeout(() => {
          table.classList.remove('invalid-reaction');
        }, 500);
      }
      
      console.log('No reaction!');
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    // Remove event listeners
    const musicToggle = document.getElementById('music-toggle');
    const soundToggle = document.getElementById('sound-toggle');

    if (musicToggle) {
      const newMusicToggle = musicToggle.cloneNode(true);
      musicToggle.parentNode.replaceChild(newMusicToggle, musicToggle);
    }

    if (soundToggle) {
      const newSoundToggle = soundToggle.cloneNode(true);
      soundToggle.parentNode.replaceChild(newSoundToggle, soundToggle);
    }

    if (this.mixButton) {
      const newMixButton = this.mixButton.cloneNode(true);
      this.mixButton.parentNode.replaceChild(newMixButton, this.mixButton);
    }

    this.mixButton = null;
    this.game = null;
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.InputManager = InputManager;
}
