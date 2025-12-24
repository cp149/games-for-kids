/**
 * Background Music Manager - Universal Component
 * Random looping music player with robust error handling
 *
 * Features:
 * - Random track selection (avoid repeats)
 * - Graceful error handling (skip failed files)
 * - Autoplay policy handling
 * - Volume control
 * - Loop prevention for infinite retries
 *
 * Usage:
 *   import { BackgroundMusicManager } from '../lib/background-music.js';
 *
 *   const bgMusic = new BackgroundMusicManager({
 *     tracks: ['assets/sounds/1.mp3', 'assets/sounds/2.mp3'],
 *     volume: 0.3
 *   });
 *   bgMusic.start();
 *
 *   // Later
 *   bgMusic.stop();
 *   bgMusic.destroy();
 */

class BackgroundMusicManager {
  constructor(options = {}) {
    this.options = {
      // Music files to play
      tracks: options.tracks || [],

      // Volume (0.0 to 1.0)
      volume: options.volume !== undefined ? options.volume : 0.3,

      // Auto-enable on creation
      autoStart: options.autoStart !== undefined ? options.autoStart : false,

      // Auto-pause when tab is hidden (default: true)
      autoPauseOnTabHidden: options.autoPauseOnTabHidden !== undefined ? options.autoPauseOnTabHidden : true,

      // Logger (optional)
      logger: options.logger || console
    };

    // State
    this.audio = null;
    this.currentTrackIndex = -1;
    this.enabled = true;
    this.failedTracks = new Set();
    this.loadAttempts = 0;
    this.maxLoadAttempts = this.options.tracks.length * 2;

    // Event handlers (need to store for cleanup)
    this.handleTrackEnd = null;
    this.handleTrackError = null;
    this.handleVisibilityChange = null;

    // Tab visibility tracking
    this.musicWasPausedByTab = false;

    // Setup tab visibility handling
    if (this.options.autoPauseOnTabHidden) {
      this.setupTabVisibility();
    }

    // Auto-start if requested
    if (this.options.autoStart) {
      this.start();
    }
  }

  /**
   * Setup tab visibility change handler
   */
  setupTabVisibility() {
    this.handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab hidden - pause music if enabled and playing
        if (this.enabled && this.audio && !this.audio.paused) {
          // this.options.logger.info('[BackgroundMusic] Tab hidden - pausing music');
          this.stop();
          this.musicWasPausedByTab = true;
        }
      } else {
        // Tab visible - resume music if it was paused by tab
        // this.options.logger.info(`[BackgroundMusic] Tab visible - wasPausedByTab: ${this.musicWasPausedByTab}, enabled: ${this.enabled}`);
        if (this.musicWasPausedByTab && this.enabled) {
          // this.options.logger.info('[BackgroundMusic] Resuming music');
          this.start();
          this.musicWasPausedByTab = false;
        }
      }
    };

    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  /**
   * Start playing background music
   */
  start() {
    // this.options.logger.info(`[BackgroundMusic] start() called - enabled: ${this.enabled}, tracks: ${this.options.tracks.length}`);
    if (!this.enabled || this.options.tracks.length === 0) {
      // this.options.logger.warn('[BackgroundMusic] Cannot start - disabled or no tracks');
      return;
    }

    this.playNextTrack();
  }

  /**
   * Play next random track
   */
  playNextTrack() {
    if (!this.enabled || this.options.tracks.length === 0) {
      return;
    }

    // Check if all tracks have failed
    if (this.failedTracks.size >= this.options.tracks.length) {
      // this.options.logger.warn('[BackgroundMusic] All tracks failed to load. Disabling music.');
      this.enabled = false;
      return;
    }

    // Prevent infinite loops
    this.loadAttempts++;
    if (this.loadAttempts > this.maxLoadAttempts) {
      // this.options.logger.warn('[BackgroundMusic] Too many load attempts. Disabling music.');
      this.enabled = false;
      return;
    }

    // Stop current track
    this.cleanup();

    // Select random track (avoid repeats and failed tracks)
    const nextIndex = this.selectRandomTrack();
    if (nextIndex === -1) {
      // this.options.logger.warn('[BackgroundMusic] No valid tracks available.');
      this.enabled = false;
      return;
    }

    this.currentTrackIndex = nextIndex;

    // Create and configure audio
    const trackPath = this.options.tracks[nextIndex];
    this.audio = new Audio(trackPath);
    this.audio.volume = this.options.volume;

    // Handle track end - play next random track
    this.handleTrackEnd = () => {
      this.loadAttempts = 0; // Reset on successful playback
      this.playNextTrack();
    };
    this.audio.addEventListener('ended', this.handleTrackEnd);

    // Handle load errors
    this.handleTrackError = () => {
      // this.options.logger.warn(`[BackgroundMusic] Failed to load: ${trackPath}`);
      this.failedTracks.add(nextIndex);
      this.playNextTrack(); // Try next track
    };
    this.audio.addEventListener('error', this.handleTrackError);

    // Play (handle autoplay policy)
    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        // this.options.logger.warn('[BackgroundMusic] Autoplay blocked:', error.message);
        // Don't mark as failed - autoplay block is browser policy, not file error
      });
    }
  }

  /**
   * Select random track avoiding current and failed tracks
   * @returns {number} Track index or -1 if none available
   */
  selectRandomTrack() {
    const availableTracks = this.options.tracks.length;

    // Special case: only one track
    if (availableTracks === 1) {
      return this.failedTracks.has(0) ? -1 : 0;
    }

    let attempts = 0;
    let nextIndex;

    do {
      nextIndex = Math.floor(Math.random() * availableTracks);
      attempts++;

      // Prevent infinite loop
      if (attempts > availableTracks * 2) {
        return -1;
      }

      // Continue if same track or failed track
    } while (
      (nextIndex === this.currentTrackIndex || this.failedTracks.has(nextIndex)) &&
      this.failedTracks.size < availableTracks
    );

    return nextIndex;
  }

  /**
   * Stop background music
   */
  stop() {
    this.cleanup();
    this.loadAttempts = 0;
  }

  /**
   * Toggle music on/off
   * @returns {boolean} New enabled state
   */
  toggle() {
    this.enabled = !this.enabled;

    if (this.enabled) {
      this.start();
    } else {
      this.stop();
      // Clear tab pause flag when manually disabled
      this.musicWasPausedByTab = false;
    }

    return this.enabled;
  }

  /**
   * Set volume
   * @param {number} volume - Volume (0.0 to 1.0)
   */
  setVolume(volume) {
    this.options.volume = Math.max(0, Math.min(1, volume));

    if (this.audio) {
      this.audio.volume = this.options.volume;
    }
  }

  /**
   * Get current enabled state
   * @returns {boolean}
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Get current track info
   * @returns {object|null}
   */
  getCurrentTrack() {
    if (this.currentTrackIndex === -1) {
      return null;
    }

    return {
      index: this.currentTrackIndex,
      path: this.options.tracks[this.currentTrackIndex],
      paused: this.audio ? this.audio.paused : true,
      currentTime: this.audio ? this.audio.currentTime : 0
    };
  }

  /**
   * Cleanup current audio
   */
  cleanup() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;

      if (this.handleTrackEnd) {
        this.audio.removeEventListener('ended', this.handleTrackEnd);
      }

      if (this.handleTrackError) {
        this.audio.removeEventListener('error', this.handleTrackError);
      }

      this.audio = null;
    }

    // Reset track index so selectRandomTrack can choose any track (including the same one)
    this.currentTrackIndex = -1;
  }

  /**
   * Destroy and cleanup all resources
   */
  destroy() {
    this.stop();
    this.enabled = false;
    this.failedTracks.clear();

    // Remove visibility change listener
    if (this.handleVisibilityChange) {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
      this.handleVisibilityChange = null;
    }
  }
}

// Export for module usage (tests)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BackgroundMusicManager };
}

// Export for global browser usage
if (typeof window !== 'undefined') {
  window.BackgroundMusicManager = BackgroundMusicManager;
}
