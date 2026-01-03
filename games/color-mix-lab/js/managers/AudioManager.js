/**
 * AudioManager - Sound effects and music
 */

class AudioManager {
  constructor(config) {
    this.config = config;
    this.sounds = {};
    this.muted = false;
    this.loaded = false;
  }

  async init() {
    try {
      const audioFiles = this.config.AUDIO;
      for (const [name, path] of Object.entries(audioFiles)) {
        this.sounds[name] = new Audio(path);
        this.sounds[name].preload = 'auto';
      }
      this.loaded = true;
    } catch (err) {
      console.warn('AudioManager: Could not load sounds', err);
    }
  }

  play(soundName) {
    if (this.muted || !this.loaded) return;
    const sound = this.sounds[soundName];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(() => {});
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  destroy() {
    Object.values(this.sounds).forEach((audio) => {
      audio.pause();
      audio.src = '';
    });
    this.sounds = {};
  }
}

// Dual export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AudioManager };
}
if (typeof window !== 'undefined') {
  window.AudioManager = AudioManager;
}
