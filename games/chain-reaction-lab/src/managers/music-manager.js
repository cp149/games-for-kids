/**
 * Music Manager
 * Handles background music playback with playlist support
 */

export class MusicManager {
  constructor(settings) {
    this.settings = settings;
    this.playlist = [
      'assets/sounds/01.mp3',
      'assets/sounds/02.mp3',
      'assets/sounds/03.mp3',
      'assets/sounds/04.mp3'
    ];
    this.currentTrack = 0;
    this.audio = null;
    this.isInitialized = false;
    this.endedHandler = null;
  }

  /**
   * Initialize audio (call after user interaction)
   */
  init() {
    if (this.isInitialized) return;

    this.audio = new Audio();
    this.audio.volume = 0.3; // 30% volume for background music
    this.audio.loop = false; // Don't loop single track

    // Auto-play next track when current ends
    this.endedHandler = () => {
      this.playNext();
    };
    this.audio.addEventListener('ended', this.endedHandler);

    this.isInitialized = true;
  }

  /**
   * Start playing music if enabled
   */
  play() {
    if (!this.isInitialized) {
      this.init();
    }

    if (!this.settings.get('music')) {
      return;
    }

    if (this.audio && this.audio.paused) {
      this.audio.src = this.playlist[this.currentTrack];
      this.audio.play().catch(() => {
        // Autoplay prevented by browser - this is expected behavior
      });
    }
  }

  /**
   * Pause music
   */
  pause() {
    if (this.audio && !this.audio.paused) {
      this.audio.pause();
    }
  }

  /**
   * Play next track in playlist
   */
  playNext() {
    this.currentTrack = (this.currentTrack + 1) % this.playlist.length;
    this.play();
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  setVolume(volume) {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Toggle music on/off based on settings
   */
  updateFromSettings() {
    if (this.settings.get('music')) {
      this.play();
    } else {
      this.pause();
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.audio) {
      // Remove event listener to prevent memory leak
      if (this.endedHandler) {
        this.audio.removeEventListener('ended', this.endedHandler);
      }
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
    this.endedHandler = null;
    this.isInitialized = false;
  }
}

export default MusicManager;
