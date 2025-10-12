/**
 * MusicBlock - Represents a single music block/loop
 */
export class MusicBlock {
  /**
   * @param {Object} config - Block configuration
   * @param {string} config.id - Unique identifier
   * @param {string} config.name - Display name
   * @param {string} config.category - Category (drums, bass, melody, fx)
   * @param {string} config.audioPath - Path to audio file
   * @param {number} config.duration - Duration in beats (4 or 8)
   * @param {string} config.mood - Mood emoji
   * @param {string} config.color - Display color
   * @param {number} [config.startTime] - Start time in source audio (seconds)
   * @param {number} [config.endTime] - End time in source audio (seconds)
   */
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.category = config.category;
    this.audioPath = config.audioPath;
    this.duration = config.duration; // in beats
    this.mood = config.mood;
    this.color = config.color;
    this.startTime = config.startTime || 0;
    this.endTime = config.endTime || null;

    this.audioBuffer = null; // Loaded AudioBuffer
    this.isLoaded = false;
  }

  /**
   * Load the audio file
   * @param {AudioContext} audioContext - Web Audio API context
   * @returns {Promise<void>}
   */
  async load(audioContext) {
    try {
      console.log(`Loading audio for block ${this.id} from ${this.audioPath}`);
      const response = await fetch(this.audioPath);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      console.log(`Decoding audio for block ${this.id}, size: ${arrayBuffer.byteLength} bytes`);

      this.audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // If no end time specified, use full buffer duration
      if (this.endTime === null) {
        this.endTime = this.audioBuffer.duration;
      }

      this.isLoaded = true;
      console.log(`✅ Block ${this.id} loaded successfully, duration: ${this.audioBuffer.duration}s`);
    } catch (error) {
      console.error(`❌ Failed to load audio for block ${this.id}:`, error);
      throw error;
    }
  }

  /**
   * Get the actual audio segment (sliced if needed)
   * @param {AudioContext} audioContext - Web Audio API context
   * @returns {AudioBuffer}
   */
  getAudioSegment(audioContext) {
    if (!this.isLoaded || !this.audioBuffer) {
      throw new Error(`Block ${this.id} not loaded`);
    }

    // If using full buffer, return as-is
    if (this.startTime === 0 && this.endTime >= this.audioBuffer.duration) {
      return this.audioBuffer;
    }

    // Slice the audio buffer
    const sampleRate = this.audioBuffer.sampleRate;
    const startSample = Math.floor(this.startTime * sampleRate);
    const endSample = Math.floor(this.endTime * sampleRate);
    const segmentLength = endSample - startSample;
    const numberOfChannels = this.audioBuffer.numberOfChannels;

    const segmentBuffer = audioContext.createBuffer(
      numberOfChannels,
      segmentLength,
      sampleRate
    );

    // Copy audio data
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sourceData = this.audioBuffer.getChannelData(channel);
      const segmentData = segmentBuffer.getChannelData(channel);

      for (let i = 0; i < segmentLength; i++) {
        segmentData[i] = sourceData[startSample + i];
      }
    }

    return segmentBuffer;
  }

  /**
   * Clone this block (for placing multiple instances)
   * @returns {MusicBlock}
   */
  clone() {
    const cloned = new MusicBlock({
      id: this.id + '_' + Date.now(),
      name: this.name,
      category: this.category,
      audioPath: this.audioPath,
      duration: this.duration,
      mood: this.mood,
      color: this.color,
      startTime: this.startTime,
      endTime: this.endTime
    });

    // Share the loaded audio buffer
    cloned.audioBuffer = this.audioBuffer;
    cloned.isLoaded = this.isLoaded;

    return cloned;
  }
}
