import { IAudioContextFactory } from '../../js/interfaces/IAudioContextFactory.js';

/**
 * MockAudioNode - Base class for mock audio nodes
 */
export class MockAudioNode {
  constructor() {
    this.connectedTo = [];
    this.disconnected = false;
  }

  connect(destination) {
    if (!this.disconnected) {
      this.connectedTo.push(destination);
    }
    return destination;
  }

  disconnect() {
    this.disconnected = true;
    this.connectedTo = [];
  }
}

/**
 * MockGainNode - Mock implementation of GainNode
 */
export class MockGainNode extends MockAudioNode {
  constructor() {
    super();
    this.gain = {
      value: 1.0
    };
  }
}

/**
 * MockAnalyserNode - Mock implementation of AnalyserNode
 */
export class MockAnalyserNode extends MockAudioNode {
  constructor() {
    super();
    this.fftSize = 2048;
    this.frequencyBinCount = 1024;
    this._frequencyData = new Uint8Array(this.frequencyBinCount);
    this._timeDomainData = new Uint8Array(this.fftSize);
  }

  getByteFrequencyData(array) {
    array.set(this._frequencyData);
  }

  getByteTimeDomainData(array) {
    array.set(this._timeDomainData);
  }

  // Test helper to simulate frequency data
  setFrequencyData(data) {
    this._frequencyData.set(data);
  }
}

/**
 * MockAudioBufferSourceNode - Mock implementation of AudioBufferSourceNode
 */
export class MockAudioBufferSourceNode extends MockAudioNode {
  constructor(audioContext) {
    super();
    this.audioContext = audioContext;
    this.buffer = null;
    this.loop = false;
    this.playbackRate = { value: 1.0 };
    this.started = false;
    this.stopped = false;
    this.startTime = 0;
    this.onended = null;
  }

  start(when = 0, offset = 0, duration) {
    this.started = true;
    this.startTime = when;

    // Simulate onended callback after duration
    if (this.onended && this.buffer) {
      const scheduledDuration = duration || this.buffer.duration;
      const delay = (when - this.audioContext.currentTime + scheduledDuration) * 1000;

      if (delay > 0) {
        setTimeout(() => {
          if (!this.stopped && this.onended) {
            this.onended();
          }
        }, delay);
      }
    }
  }

  stop(when = 0) {
    this.stopped = true;
  }
}

/**
 * MockAudioBuffer - Mock implementation of AudioBuffer
 */
export class MockAudioBuffer {
  constructor(options = {}) {
    this.length = options.length || 44100;
    this.duration = options.duration || 1.0;
    this.sampleRate = options.sampleRate || 44100;
    this.numberOfChannels = options.numberOfChannels || 2;
  }

  getChannelData(channel) {
    return new Float32Array(this.length);
  }
}

/**
 * MockAudioContext - Mock implementation of AudioContext
 */
export class MockAudioContext {
  constructor() {
    this.state = 'running';
    this.sampleRate = 44100;
    this.currentTime = 0;
    this.destination = new MockAudioNode();
    this._nodes = [];

    // Auto-increment current time for realistic simulation
    this._timeInterval = setInterval(() => {
      if (this.state === 'running') {
        this.currentTime += 0.1; // Increment by 100ms
      }
    }, 100);
  }

  createGain() {
    const node = new MockGainNode();
    this._nodes.push(node);
    return node;
  }

  createAnalyser() {
    const node = new MockAnalyserNode();
    this._nodes.push(node);
    return node;
  }

  createBufferSource() {
    const node = new MockAudioBufferSourceNode(this);
    this._nodes.push(node);
    return node;
  }

  createBuffer(numberOfChannels, length, sampleRate) {
    return new MockAudioBuffer({ numberOfChannels, length, sampleRate });
  }

  decodeAudioData(arrayBuffer) {
    return Promise.resolve(new MockAudioBuffer({ duration: 2.0 }));
  }

  async suspend() {
    this.state = 'suspended';
  }

  async resume() {
    this.state = 'running';
  }

  async close() {
    this.state = 'closed';
    clearInterval(this._timeInterval);
    this._nodes = [];
  }

  // Test helper to manually advance time
  advanceTime(seconds) {
    this.currentTime += seconds;
  }

  // Test helper to get all created nodes
  getNodes() {
    return this._nodes;
  }
}

/**
 * MockAudioContextFactory - Factory for creating MockAudioContext
 */
export class MockAudioContextFactory extends IAudioContextFactory {
  createAudioContext() {
    return new MockAudioContext();
  }
}
