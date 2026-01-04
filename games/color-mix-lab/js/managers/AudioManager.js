/**
 * AudioManager - Web Audio API synthesized sounds
 * No external files needed - generates fun sounds programmatically
 */

class AudioManager {
  constructor(config) {
    this.config = config;
    this.muted = false;
    this.ctx = null;
  }

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (err) {
      console.warn('AudioManager: Web Audio not supported');
    }
  }

  _ensureContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  play(soundName) {
    if (this.muted || !this.ctx) return;
    this._ensureContext();

    switch (soundName) {
      case 'DROP':
        this._playDrop();
        break;
      case 'SUCCESS':
        this._playSuccess();
        break;
      case 'WRONG':
        this._playWrong();
        break;
      case 'CLICK':
        this._playClick();
        break;
    }
  }

  _playDrop() {
    // Bubbly drop sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.15);
  }

  _playSuccess() {
    // Happy ascending melody
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'triangle';
      osc.frequency.value = freq;

      const startTime = this.ctx.currentTime + i * 0.1;
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

      osc.start(startTime);
      osc.stop(startTime + 0.2);
    });
  }

  _playWrong() {
    // Descending "uh oh" sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.3);
  }

  _playClick() {
    // Short click sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'square';
    osc.frequency.value = 800;

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.05);
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  destroy() {
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

// Dual export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AudioManager };
}
if (typeof window !== 'undefined') {
  window.AudioManager = AudioManager;
}
