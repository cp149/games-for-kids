import { IAudioContextFactory } from '../interfaces/IAudioContextFactory.js';

/**
 * WebAudioContextFactory - Production implementation using Web Audio API
 */
export class WebAudioContextFactory extends IAudioContextFactory {
  /**
   * Create a real Web Audio API AudioContext
   * @returns {AudioContext}
   */
  createAudioContext() {
    return new (window.AudioContext || window.webkitAudioContext)();
  }
}
