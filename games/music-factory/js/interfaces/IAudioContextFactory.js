/**
 * IAudioContextFactory - Interface for creating AudioContext
 * Allows testing without real Web Audio API
 */
export class IAudioContextFactory {
  /**
   * Create an AudioContext instance
   * @returns {AudioContext|MockAudioContext}
   */
  createAudioContext() {
    throw new Error('createAudioContext() must be implemented by subclass');
  }
}
