/**
 * Audio Manager - Handles game audio and music
 */

class AudioManager {
  constructor(config) {
    this.config = config;
    this.bgMusicMgr = null;
    this.musicWasPausedByTab = false;

    // Sound effects state
    this.soundEnabled = this.loadSoundPreference();
    this.soundQueue = [];
    this.maxConcurrentSounds = 3;
    this.activeSounds = new Set();

    // Sound effect paths (placeholders)
    this.sounds = {
      cardDrop: 'assets/sounds/card-drop.mp3',      // Card placed in slot
      reactionRed: 'assets/sounds/reaction-red.mp3',    // Red explosion
      reactionBlue: 'assets/sounds/reaction-blue.mp3',  // Blue explosion
      reactionYellow: 'assets/sounds/reaction-yellow.mp3', // Yellow explosion
      reactionPurple: 'assets/sounds/reaction-purple.mp3', // Purple explosion
      reactionOrange: 'assets/sounds/reaction-orange.mp3', // Orange explosion
      reactionGreen: 'assets/sounds/reaction-green.mp3',  // Green explosion
      reactionRainbow: 'assets/sounds/reaction-rainbow.mp3', // Rainbow explosion
      catalystActivate: 'assets/sounds/catalyst.mp3',  // Catalyst activated
      stabilizerUse: 'assets/sounds/stabilizer.mp3',   // Stabilizer used
      levelComplete: 'assets/sounds/level-complete.mp3', // Level complete
      fail: 'assets/sounds/fail.mp3',                 // Time up / failed
      gentleSnore: 'assets/sounds/gentle-snore.mp3',  // Sleeping reagents
      alarmDing: 'assets/sounds/alarm-ding.mp3'       // Wake up alarm
    };

    // Initialize background music manager
    if (typeof BackgroundMusicManager !== 'undefined') {
      const musicEnabled = this.loadMusicPreference();
      this.bgMusicMgr = new BackgroundMusicManager({
        tracks: [
          // Placeholder - add music tracks here when available
          // 'assets/sounds/music1.mp3',
          // 'assets/sounds/music2.mp3'
        ],
        volume: 0.3,
        autoStart: false,
        autoPauseOnTabHidden: true
      });

      // Set initial state from localStorage
      if (!musicEnabled && this.bgMusicMgr) {
        this.bgMusicMgr.enabled = false;
      }
    }
  }

  /**
   * Load music preference from localStorage
   */
  loadMusicPreference() {
    const saved = localStorage.getItem('chemistry-lab-music-enabled');
    return saved === null ? true : saved === 'true';
  }

  /**
   * Save music preference to localStorage
   */
  saveMusicPreference(enabled) {
    localStorage.setItem('chemistry-lab-music-enabled', enabled.toString());
  }

  /**
   * Load sound preference from localStorage
   */
  loadSoundPreference() {
    const saved = localStorage.getItem('chemistry-lab-sound-enabled');
    return saved === null ? true : saved === 'true';
  }

  /**
   * Save sound preference to localStorage
   */
  saveSoundPreference(enabled) {
    localStorage.setItem('chemistry-lab-sound-enabled', enabled.toString());
  }

  /**
   * Start background music
   */
  start() {
    if (this.bgMusicMgr && this.bgMusicMgr.isEnabled()) {
      this.bgMusicMgr.start();
    }
  }

  /**
   * Stop background music
   */
  stop() {
    if (this.bgMusicMgr) {
      this.bgMusicMgr.stop();
    }
  }

  /**
   * Toggle music on/off
   */
  toggleMusic() {
    if (!this.bgMusicMgr) return false;

    const newState = this.bgMusicMgr.toggle();
    this.saveMusicPreference(newState);
    return newState;
  }

  /**
   * Toggle sound effects on/off
   */
  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    this.saveSoundPreference(this.soundEnabled);
    return this.soundEnabled;
  }

  /**
   * Check if music is enabled
   */
  isMusicEnabled() {
    return this.bgMusicMgr ? this.bgMusicMgr.isEnabled() : false;
  }

  /**
   * Check if sound is enabled
   */
  isSoundEnabled() {
    return this.soundEnabled;
  }

  /**
   * Handle tab visibility auto-pause
   */
  handleTabHidden() {
    // BackgroundMusicManager handles this automatically
  }

  /**
   * Handle tab visibility resume
   */
  handleTabVisible() {
    // BackgroundMusicManager handles this automatically
  }

  /**
   * Play sound effect with queue management
   * @param {string} soundKey - Key from this.sounds
   * @param {number} volume - Volume (0-1)
   */
  playSoundEffect(soundKey, volume = 0.7) {
    if (!this.soundEnabled) return;

    // Check if we have too many concurrent sounds
    if (this.activeSounds.size >= this.maxConcurrentSounds) {
      return;
    }

    const soundPath = this.sounds[soundKey];
    if (!soundPath) {
      console.warn(`Sound key not found: ${soundKey}`);
      return;
    }

    const audio = new Audio(soundPath);
    audio.volume = volume;

    // Track active sound
    this.activeSounds.add(audio);

    // Remove from active when finished
    audio.addEventListener('ended', () => {
      this.activeSounds.delete(audio);
    });

    // Remove on error
    audio.addEventListener('error', () => {
      this.activeSounds.delete(audio);
    });

    // Play with error handling
    audio.play().catch(() => {
      // Silently fail - audio files may not exist yet
      this.activeSounds.delete(audio);
    });
  }

  /**
   * Play card drop sound
   */
  playCardDrop() {
    this.playSoundEffect('cardDrop', 0.5);
  }

  /**
   * Play reaction sound based on result type
   * @param {string} reactionResult - Reaction result type (e.g., 'RED_EXPLOSION')
   */
  playReactionSound(reactionResult) {
    const soundMap = {
      'RED_EXPLOSION': 'reactionRed',
      'BLUE_EXPLOSION': 'reactionBlue',
      'YELLOW_EXPLOSION': 'reactionYellow',
      'PURPLE_EXPLOSION': 'reactionPurple',
      'ORANGE_EXPLOSION': 'reactionOrange',
      'GREEN_EXPLOSION': 'reactionGreen',
      'RAINBOW_EXPLOSION': 'reactionRainbow'
    };

    const soundKey = soundMap[reactionResult];
    if (soundKey) {
      this.playSoundEffect(soundKey, 0.8);
    }
  }

  /**
   * Play catalyst activation sound
   */
  playCatalystSound() {
    this.playSoundEffect('catalystActivate', 0.6);
  }

  /**
   * Play stabilizer use sound
   */
  playStabilizerSound() {
    this.playSoundEffect('stabilizerUse', 0.6);
  }

  /**
   * Play level complete sound
   */
  playLevelComplete() {
    this.playSoundEffect('levelComplete', 0.8);
  }

  /**
   * Play fail sound
   */
  playFail() {
    this.playSoundEffect('fail', 0.7);
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.stop();

    // Stop all active sounds
    this.activeSounds.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.activeSounds.clear();

    if (this.bgMusicMgr && typeof this.bgMusicMgr.destroy === 'function') {
      this.bgMusicMgr.destroy();
    }
    this.bgMusicMgr = null;
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.AudioManager = AudioManager;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AudioManager };
}
