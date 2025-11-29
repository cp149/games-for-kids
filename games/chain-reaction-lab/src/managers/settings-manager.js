/**
 * Settings Manager
 * Handles game settings persistence and management
 */

export class SettingsManager {
  constructor() {
    this.settings = {
      sound: true,
      music: true,
      particles: true,
      highQuality: true  // Visual effects (shadows, glows)
    };
  }

  /**
   * Load settings from localStorage
   */
  load() {
    const saved = localStorage.getItem('chainReactionLab_settings');
    if (saved) {
      this.settings = JSON.parse(saved);
    }
    return this.settings;
  }

  /**
   * Save settings to localStorage
   */
  save() {
    localStorage.setItem('chainReactionLab_settings', JSON.stringify(this.settings));
  }

  /**
   * Update a specific setting
   * @param {string} key - Setting key
   * @param {*} value - New value
   */
  update(key, value) {
    if (this.settings.hasOwnProperty(key)) {
      this.settings[key] = value;
      this.save();
    }
  }

  /**
   * Get setting value
   * @param {string} key - Setting key
   * @returns {*} Setting value
   */
  get(key) {
    return this.settings[key];
  }

  /**
   * Sync UI elements with current settings
   */
  syncUI() {
    document.getElementById('soundToggle').checked = this.settings.sound;
    document.getElementById('musicToggle').checked = this.settings.music;
    document.getElementById('particlesToggle').checked = this.settings.particles;

    const qualityToggle = document.getElementById('qualityToggle');
    if (qualityToggle) {
      qualityToggle.checked = this.settings.highQuality;
    }
  }
}
