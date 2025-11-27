import { describe, it, expect, beforeEach } from 'vitest';
import { AudioEngine } from '../js/audio/AudioEngine.js';
import { MockAudioContextFactory, MockAudioBuffer } from './mocks/MockAudioContext.js';
import { MockClock } from './mocks/MockClock.js';

/**
 * AudioEngine Unit Tests
 * Tests the AudioEngine class with mock Web Audio API and controllable clock
 */
describe('AudioEngine', () => {
  let audioEngine;
  let audioContextFactory;
  let clock;
  let mockAudioContext;

  beforeEach(async () => {
    // Create mocks
    audioContextFactory = new MockAudioContextFactory();
    clock = new MockClock();

    // Create engine with mocks
    audioEngine = new AudioEngine({
      audioContextFactory,
      clock,
      tempo: 120
    });

    // Initialize to create audio context
    await audioEngine.initialize();
    mockAudioContext = audioEngine.audioContext;
  });

  describe('Constructor', () => {
    it('should initialize with default configuration', () => {
      const defaultEngine = new AudioEngine();
      expect(defaultEngine.tempo).toBe(120);
      expect(defaultEngine.initialized).toBe(false);
    });

    it('should accept custom tempo', () => {
      const customEngine = new AudioEngine({ tempo: 140 });
      expect(customEngine.tempo).toBe(140);
    });

    it('should inject dependencies', () => {
      expect(audioEngine.audioContextFactory).toBe(audioContextFactory);
      expect(audioEngine.clock).toBe(clock);
    });
  });

  describe('initialize', () => {
    it('should create audio context and master gain', async () => {
      const engine = new AudioEngine({ audioContextFactory, clock });
      await engine.initialize();

      expect(engine.audioContext).toBeDefined();
      expect(engine.masterGain).toBeDefined();
      expect(engine.initialized).toBe(true);
    });

    it('should set default master volume', async () => {
      const engine = new AudioEngine({ audioContextFactory, clock });
      await engine.initialize();

      expect(engine.masterGain.gain.value).toBe(0.7);
    });

    it('should create preview gain node', async () => {
      const engine = new AudioEngine({ audioContextFactory, clock });
      await engine.initialize();

      expect(engine.previewGain).toBeDefined();
      expect(engine.previewGain.connectedTo).toContain(engine.masterGain);
    });

    it('should not reinitialize if already initialized', async () => {
      const engine = new AudioEngine({ audioContextFactory, clock });
      await engine.initialize();
      const firstContext = engine.audioContext;

      await engine.initialize();
      expect(engine.audioContext).toBe(firstContext);
    });
  });

  describe('getBeatDuration', () => {
    it('should calculate beat duration correctly', () => {
      audioEngine.tempo = 120;
      expect(audioEngine.getBeatDuration()).toBe(0.5); // 60/120 = 0.5s

      audioEngine.tempo = 60;
      expect(audioEngine.getBeatDuration()).toBe(1.0); // 60/60 = 1.0s

      audioEngine.tempo = 180;
      expect(audioEngine.getBeatDuration()).toBeCloseTo(0.333, 2); // 60/180
    });
  });

  describe('beatsToSeconds', () => {
    it('should convert beats to seconds', () => {
      audioEngine.tempo = 120;
      expect(audioEngine.beatsToSeconds(4)).toBe(2.0); // 4 beats * 0.5s
      expect(audioEngine.beatsToSeconds(8)).toBe(4.0); // 8 beats * 0.5s
    });

    it('should handle different tempos', () => {
      audioEngine.tempo = 60;
      expect(audioEngine.beatsToSeconds(4)).toBe(4.0); // 4 beats * 1.0s
    });
  });

  describe('playBlockPreview', () => {
    it('should play preview with reusable gain node', () => {
      const mockBuffer = new MockAudioBuffer({ duration: 2.0 });

      audioEngine.playBlockPreview(mockBuffer, 0.8);

      expect(audioEngine.previewSource).toBeDefined();
      expect(audioEngine.previewSource.buffer).toBe(mockBuffer);
      expect(audioEngine.previewGain.gain.value).toBe(0.8);
      expect(audioEngine.previewSource.started).toBe(true);
    });

    it('should stop previous preview before starting new one', () => {
      const buffer1 = new MockAudioBuffer({ duration: 1.0 });
      const buffer2 = new MockAudioBuffer({ duration: 1.0 });

      audioEngine.playBlockPreview(buffer1);
      const firstSource = audioEngine.previewSource;

      audioEngine.playBlockPreview(buffer2);
      const secondSource = audioEngine.previewSource;

      expect(firstSource.stopped).toBe(true);
      expect(firstSource.disconnected).toBe(true);
      expect(secondSource).not.toBe(firstSource);
      expect(secondSource.buffer).toBe(buffer2);
    });

    it('should handle missing buffer gracefully', () => {
      // Should not throw
      audioEngine.playBlockPreview(null);
      expect(audioEngine.previewSource).toBeNull();
    });
  });

  describe('scheduleBlock', () => {
    it('should schedule a block for playback', () => {
      const mockBlock = {
        isLoaded: true,
        audioBuffer: new MockAudioBuffer({ duration: 2.0 }),
        category: 'drums',
        getAudioSegment: () => mockBlock.audioBuffer
      };

      const scheduleTime = mockAudioContext.currentTime + 1.0;
      audioEngine.scheduleBlock(mockBlock, scheduleTime);

      expect(audioEngine.activeSources.length).toBe(1);
      const sourceEntry = audioEngine.activeSources[0];
      expect(sourceEntry.source.buffer).toBe(mockBlock.audioBuffer);
      expect(sourceEntry.source.started).toBe(true);
    });

    it('should create safety timeout for cleanup', () => {
      const mockBlock = {
        isLoaded: true,
        audioBuffer: new MockAudioBuffer({ duration: 2.0 }),
        category: 'drums',
        getAudioSegment: () => mockBlock.audioBuffer
      };

      audioEngine.scheduleBlock(mockBlock, mockAudioContext.currentTime);

      const sourceEntry = audioEngine.activeSources[0];
      expect(sourceEntry.timeoutId).toBeDefined();
      expect(clock.getPendingTimerCount()).toBe(1);

      // Safety timeout should be ~3s (2.0s * 1.5 + 0.5)
      const expectedMs = (2.0 * 1.5 + 0.5) * 1000;
      expect(clock.getPendingTimerTimes()[0]).toBeCloseTo(expectedMs, 0);
    });

    it('should not schedule unloaded blocks', () => {
      const mockBlock = {
        isLoaded: false,
        audioBuffer: null,
        category: 'drums',
        getAudioSegment: () => null
      };

      audioEngine.scheduleBlock(mockBlock, mockAudioContext.currentTime);

      expect(audioEngine.activeSources.length).toBe(0);
    });

    it('should call connectCallback if provided', () => {
      const mockBlock = {
        isLoaded: true,
        audioBuffer: new MockAudioBuffer({ duration: 1.0 }),
        category: 'drums',
        getAudioSegment: () => mockBlock.audioBuffer
      };

      let callbackCalled = false;
      let callbackGainNode = null;
      let callbackCategory = null;

      const connectCallback = (gainNode, category) => {
        callbackCalled = true;
        callbackGainNode = gainNode;
        callbackCategory = category;
      };

      audioEngine.scheduleBlock(mockBlock, mockAudioContext.currentTime, connectCallback);

      expect(callbackCalled).toBe(true);
      expect(callbackGainNode).toBeDefined();
      expect(callbackCategory).toBe('drums');
    });
  });

  describe('stopPlayback', () => {
    it('should stop all active sources', () => {
      const mockBlock = {
        isLoaded: true,
        audioBuffer: new MockAudioBuffer({ duration: 1.0 }),
        category: 'drums',
        getAudioSegment: () => mockBlock.audioBuffer
      };

      audioEngine.scheduleBlock(mockBlock, mockAudioContext.currentTime);
      audioEngine.scheduleBlock(mockBlock, mockAudioContext.currentTime);

      expect(audioEngine.activeSources.length).toBe(2);

      audioEngine.stopPlayback();

      expect(audioEngine.activeSources.length).toBe(0);
      expect(audioEngine.isPlaying).toBe(false);
      expect(audioEngine.pausedAt).toBe(0);
    });

    it('should clear safety timeouts', () => {
      const mockBlock = {
        isLoaded: true,
        audioBuffer: new MockAudioBuffer({ duration: 1.0 }),
        category: 'drums',
        getAudioSegment: () => mockBlock.audioBuffer
      };

      audioEngine.scheduleBlock(mockBlock, mockAudioContext.currentTime);
      expect(clock.getPendingTimerCount()).toBe(1);

      audioEngine.stopPlayback();
      expect(clock.getPendingTimerCount()).toBe(0);
    });

    it('should calculate safety timeout correctly for future-scheduled blocks', () => {
      const mockBlock = {
        name: 'Test Block',
        isLoaded: true,
        audioBuffer: new MockAudioBuffer({ duration: 2.0 }),
        category: 'drums',
        getAudioSegment: () => mockBlock.audioBuffer
      };

      const now = mockAudioContext.currentTime; // 0
      const scheduleTime = now + 5.0; // Schedule 5 seconds in the future

      audioEngine.scheduleBlock(mockBlock, scheduleTime);

      // Safety timeout should be: delay (5s) + duration (2s) * 1.5 + buffer (0.5s) = 8.5s
      const expectedTimeoutMs = (5.0 + 2.0 * 1.5 + 0.5) * 1000; // 8500ms

      // Advance time to just before timeout should trigger
      clock.tick(8400); // 8.4s - should NOT trigger yet
      expect(audioEngine.activeSources.length).toBe(1);

      // Advance to trigger timeout
      clock.tick(200); // Total 8.6s - should trigger now
      expect(audioEngine.activeSources.length).toBe(0);
    });

    it('should not reset position when resetPosition=false', () => {
      audioEngine.pausedAt = 10.0;
      audioEngine.stopPlayback(false);

      expect(audioEngine.pausedAt).toBe(10.0);
    });
  });

  describe('pausePlayback', () => {
    it('should save current playback position', () => {
      audioEngine.isPlaying = true;
      audioEngine.startedAt = mockAudioContext.currentTime - 5.0;

      audioEngine.pausePlayback();

      expect(audioEngine.pausedAt).toBeCloseTo(5.0, 1);
      expect(audioEngine.isPlaying).toBe(false);
    });

    it('should do nothing if not playing', () => {
      audioEngine.isPlaying = false;
      audioEngine.pausedAt = 0;

      audioEngine.pausePlayback();

      expect(audioEngine.pausedAt).toBe(0);
    });
  });

  describe('getCurrentBeat', () => {
    it('should return 0 when stopped', () => {
      audioEngine.isPlaying = false;
      audioEngine.pausedAt = 0;

      expect(audioEngine.getCurrentBeat()).toBe(0);
    });

    it('should return paused position when paused', () => {
      audioEngine.tempo = 120; // 0.5s per beat
      audioEngine.isPlaying = false;
      audioEngine.pausedAt = 2.0; // 2 seconds

      expect(audioEngine.getCurrentBeat()).toBe(4); // 2s / 0.5s = 4 beats
    });

    it('should calculate current beat when playing', () => {
      audioEngine.tempo = 120; // 0.5s per beat
      audioEngine.isPlaying = true;
      audioEngine.startedAt = mockAudioContext.currentTime - 3.0;

      const currentBeat = audioEngine.getCurrentBeat();
      expect(currentBeat).toBeCloseTo(6, 0); // 3s / 0.5s = 6 beats
    });
  });

  describe('setMasterVolume', () => {
    it('should set master gain value', () => {
      audioEngine.setMasterVolume(0.5);
      expect(audioEngine.masterGain.gain.value).toBe(0.5);
    });

    it('should clamp volume to 0-1 range', () => {
      audioEngine.setMasterVolume(1.5);
      expect(audioEngine.masterGain.gain.value).toBe(1.0);

      audioEngine.setMasterVolume(-0.5);
      expect(audioEngine.masterGain.gain.value).toBe(0.0);
    });
  });

  describe('setTempo', () => {
    it('should set tempo within valid range', () => {
      audioEngine.setTempo(140);
      expect(audioEngine.tempo).toBe(140);
    });

    it('should clamp tempo to 60-200 range', () => {
      audioEngine.setTempo(250);
      expect(audioEngine.tempo).toBe(200);

      audioEngine.setTempo(30);
      expect(audioEngine.tempo).toBe(60);
    });
  });

  describe('isPaused', () => {
    it('should return true when paused', () => {
      audioEngine.pausedAt = 5.0;
      audioEngine.isPlaying = false;

      expect(audioEngine.isPaused()).toBe(true);
    });

    it('should return false when not paused', () => {
      audioEngine.pausedAt = 0;
      audioEngine.isPlaying = false;

      expect(audioEngine.isPaused()).toBe(false);
    });

    it('should return false when playing', () => {
      audioEngine.pausedAt = 5.0;
      audioEngine.isPlaying = true;

      expect(audioEngine.isPaused()).toBe(false);
    });
  });

  describe('cleanup', () => {
    it('should stop playback', async () => {
      const mockBlock = {
        isLoaded: true,
        audioBuffer: new MockAudioBuffer({ duration: 1.0 }),
        category: 'drums',
        getAudioSegment: () => mockBlock.audioBuffer
      };

      audioEngine.scheduleBlock(mockBlock, mockAudioContext.currentTime);
      expect(audioEngine.activeSources.length).toBe(1);

      await audioEngine.cleanup();

      expect(audioEngine.activeSources.length).toBe(0);
    });

    it('should disconnect all nodes', async () => {
      const masterGain = audioEngine.masterGain;
      const previewGain = audioEngine.previewGain;

      await audioEngine.cleanup();

      expect(masterGain.disconnected).toBe(true);
      expect(previewGain.disconnected).toBe(true);
    });

    it('should close audio context', async () => {
      await audioEngine.cleanup();

      expect(mockAudioContext.state).toBe('closed');
      expect(audioEngine.audioContext).toBeNull();
      expect(audioEngine.initialized).toBe(false);
    });
  });

  describe('Integration: Safety Timeout Cleanup', () => {
    it('should auto-cleanup source after safety timeout', () => {
      const mockBlock = {
        isLoaded: true,
        audioBuffer: new MockAudioBuffer({ duration: 2.0 }),
        category: 'drums',
        getAudioSegment: () => mockBlock.audioBuffer
      };

      audioEngine.scheduleBlock(mockBlock, mockAudioContext.currentTime);
      expect(audioEngine.activeSources.length).toBe(1);

      // Advance time past safety timeout (2.0s * 1.5 + 0.5 = 3.5s)
      clock.tick(4000);

      expect(audioEngine.activeSources.length).toBe(0);
    });

    it('should not double-cleanup if onended fires before timeout', () => {
      const mockBlock = {
        isLoaded: true,
        audioBuffer: new MockAudioBuffer({ duration: 1.0 }),
        category: 'drums',
        getAudioSegment: () => mockBlock.audioBuffer
      };

      audioEngine.scheduleBlock(mockBlock, mockAudioContext.currentTime);
      const sourceEntry = audioEngine.activeSources[0];

      // Manually trigger onended
      sourceEntry.source.onended();

      expect(audioEngine.activeSources.length).toBe(0);

      // Advance time to safety timeout - should not cause error
      clock.tick(2000);

      // Still no sources (no double cleanup error)
      expect(audioEngine.activeSources.length).toBe(0);
    });
  });
});
