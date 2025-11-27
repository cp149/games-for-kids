import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameEngine } from '../js/core/GameEngine.js';
import { AudioEngine } from '../js/audio/AudioEngine.js';
import { Timeline } from '../js/core/Timeline.js';
import { MockAudioContextFactory } from './mocks/MockAudioContext.js';
import { MockClock } from './mocks/MockClock.js';
import { MockStorage } from './mocks/MockStorage.js';
import { SequentialIDGenerator } from '../js/implementations/SequentialIDGenerator.js';

/**
 * GameEngine Integration Tests
 * Tests the GameEngine class with mocked dependencies
 */
describe('GameEngine', () => {
  let gameEngine;
  let audioEngine;
  let timeline;
  let clock;
  let storage;
  let mockBlockLibrary;
  let mockVisualizer;

  beforeEach(async () => {
    // Create mocked dependencies
    const audioContextFactory = new MockAudioContextFactory();
    clock = new MockClock();
    storage = new MockStorage();

    // Create audio engine with mocks
    audioEngine = new AudioEngine({
      audioContextFactory,
      clock,
      tempo: 120
    });

    // Create timeline with deterministic IDs
    const idGenerator = new SequentialIDGenerator();
    timeline = new Timeline({ idGenerator });

    // Mock BlockLibrary
    mockBlockLibrary = {
      initialize: vi.fn(),
      loadAll: vi.fn().mockResolvedValue(),
      getBlockById: vi.fn((id) => ({
        id,
        name: `Block ${id}`,
        duration: 4,
        category: 'drums',
        isLoaded: true,
        audioBuffer: { duration: 1.0 },
        clone: function() { return { ...this }; },
        getAudioSegment: () => this.audioBuffer
      })),
      getAllBlocks: vi.fn(() => {
        // Generate mock blocks for testing randomization
        const mockBlocks = [];
        const categories = ['drums', 'bass', 'melody', 'fx'];
        const durations = [2, 4];

        for (let i = 0; i < 20; i++) {
          const category = categories[i % categories.length];
          const duration = durations[i % durations.length];

          mockBlocks.push({
            id: `mock_${category}_${i}`,
            name: `Mock ${category} ${i}`,
            duration,
            category,
            isLoaded: true,
            audioBuffer: { duration: duration / 2 },
            clone: function() { return { ...this }; },
            getAudioSegment: () => this.audioBuffer
          });
        }

        return mockBlocks;
      })
    };

    // Mock AudioVisualizer
    mockVisualizer = {
      initialize: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      connectToTrack: vi.fn(),
      destroy: vi.fn()
    };

    // Create GameEngine with all mocks
    gameEngine = new GameEngine({
      audioEngine,
      timeline,
      blockLibrary: mockBlockLibrary,
      visualizer: mockVisualizer,
      clock,
      storage
    });

    // Initialize
    await gameEngine.initialize();
  });

  describe('Constructor', () => {
    it('should initialize with default dependencies', () => {
      const defaultEngine = new GameEngine();
      expect(defaultEngine.audioEngine).toBeDefined();
      expect(defaultEngine.timeline).toBeDefined();
      expect(defaultEngine.blockLibrary).toBeDefined();
    });

    it('should accept injected dependencies', () => {
      expect(gameEngine.audioEngine).toBe(audioEngine);
      expect(gameEngine.timeline).toBe(timeline);
      expect(gameEngine.clock).toBe(clock);
      expect(gameEngine.storage).toBe(storage);
    });

    it('should initialize with default state', () => {
      const newEngine = new GameEngine({ audioEngine, blockLibrary: mockBlockLibrary, visualizer: mockVisualizer });
      // Before initialize
      expect(newEngine.isLooping).toBe(false);
      expect(newEngine.isReady).toBe(false);
      expect(newEngine.playbackInterval).toBeNull();
    });
  });

  describe('initialize', () => {
    it('should initialize audio engine', async () => {
      const newEngine = new GameEngine({ audioEngine, blockLibrary: mockBlockLibrary, visualizer: mockVisualizer });
      await newEngine.initialize();

      expect(audioEngine.initialized).toBe(true);
    });

    it('should initialize block library', async () => {
      expect(mockBlockLibrary.initialize).toHaveBeenCalled();
    });

    it('should load all audio files', async () => {
      expect(mockBlockLibrary.loadAll).toHaveBeenCalledWith(audioEngine.audioContext);
    });

    it('should mark as ready', () => {
      expect(gameEngine.isReady).toBe(true);
    });

    it('should not create visualizer if provided', async () => {
      // Visualizer was provided in beforeEach, so it shouldn't create a new one
      expect(gameEngine.visualizer).toBe(mockVisualizer);
    });
  });

  describe('addBlockToTimeline / removeBlockFromTimeline', () => {
    it('should add block to timeline', () => {
      const mockBlock = {
        id: 'test-block',
        duration: 4,
        clone: vi.fn().mockReturnValue({ id: 'test-block', duration: 4 })
      };

      const success = gameEngine.addBlockToTimeline('drums', mockBlock, 0);

      expect(success).toBe(true);
      expect(mockBlock.clone).toHaveBeenCalled();
      expect(timeline.tracks.drums.length).toBe(1);
    });

    it('should remove block from timeline', () => {
      const mockBlock = {
        id: 'test-block',
        duration: 4,
        clone: vi.fn().mockReturnValue({ id: 'test-block', duration: 4 })
      };

      gameEngine.addBlockToTimeline('drums', mockBlock, 0);
      const placedId = timeline.tracks.drums[0].id;

      gameEngine.removeBlockFromTimeline('drums', placedId);

      expect(timeline.tracks.drums.length).toBe(0);
    });
  });

  describe('play', () => {
    it('should do nothing if not ready', () => {
      gameEngine.isReady = false;
      gameEngine.play();

      expect(audioEngine.isPlaying).toBe(false);
    });

    it('should warn and return if no blocks', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation();
      gameEngine.play();

      expect(consoleSpy).toHaveBeenCalledWith('No blocks on timeline');
      consoleSpy.mockRestore();
    });

    it('should start playback with blocks', () => {
      // Add a block to timeline
      const mockBlock = {
        id: 'test-block',
        duration: 4,
        category: 'drums',
        isLoaded: true,
        audioBuffer: { duration: 1.0 },
        clone: vi.fn().mockReturnValue({
          id: 'test-block',
          duration: 4,
          category: 'drums',
          isLoaded: true,
          audioBuffer: { duration: 1.0 },
          getAudioSegment: (ctx) => ({ duration: 1.0 })
        })
      };

      gameEngine.addBlockToTimeline('drums', mockBlock, 0);
      gameEngine.play();

      expect(audioEngine.isPlaying).toBe(true);
      expect(mockVisualizer.start).toHaveBeenCalled();
    });

    it('should schedule stop at end when not looping', () => {
      const mockBlock = {
        id: 'test-block',
        duration: 4,
        category: 'drums',
        isLoaded: true,
        audioBuffer: { duration: 1.0 },
        clone: vi.fn().mockReturnValue({
          id: 'test-block',
          duration: 4,
          category: 'drums',
          isLoaded: true,
          audioBuffer: { duration: 1.0 },
          getAudioSegment: (ctx) => ({ duration: 1.0 })
        })
      };

      gameEngine.addBlockToTimeline('drums', mockBlock, 0);
      gameEngine.setLooping(false);
      gameEngine.play();

      expect(gameEngine.playbackInterval).not.toBeNull();
      // At least 1 timer (may have more from AudioEngine safety timeouts)
      expect(clock.getPendingTimerCount()).toBeGreaterThanOrEqual(1);
    });

    it('should schedule loop when looping', () => {
      const mockBlock = {
        id: 'test-block',
        duration: 4,
        category: 'drums',
        isLoaded: true,
        audioBuffer: { duration: 1.0 },
        clone: vi.fn().mockReturnValue({
          id: 'test-block',
          duration: 4,
          category: 'drums',
          isLoaded: true,
          audioBuffer: { duration: 1.0 },
          getAudioSegment: (ctx) => ({ duration: 1.0 })
        })
      };

      gameEngine.addBlockToTimeline('drums', mockBlock, 0);
      gameEngine.setLooping(true);
      gameEngine.play();

      expect(gameEngine.playbackInterval).not.toBeNull();
      // At least 1 timer (may have more from AudioEngine safety timeouts)
      expect(clock.getPendingTimerCount()).toBeGreaterThanOrEqual(1);
    });
  });

  describe('stop', () => {
    it('should stop audio playback', () => {
      const mockBlock = {
        id: 'test-block',
        duration: 4,
        category: 'drums',
        isLoaded: true,
        audioBuffer: { duration: 1.0 },
        clone: vi.fn().mockReturnValue({
          id: 'test-block',
          duration: 4,
          category: 'drums',
          isLoaded: true,
          audioBuffer: { duration: 1.0 },
          getAudioSegment: (ctx) => ({ duration: 1.0 })
        })
      };

      gameEngine.addBlockToTimeline('drums', mockBlock, 0);
      gameEngine.play();

      gameEngine.stop();

      expect(audioEngine.isPlaying).toBe(false);
      expect(mockVisualizer.stop).toHaveBeenCalled();
    });

    it('should clear playback interval', () => {
      const mockBlock = {
        id: 'test-block',
        duration: 4,
        category: 'drums',
        isLoaded: true,
        audioBuffer: { duration: 1.0 },
        clone: vi.fn().mockReturnValue({
          id: 'test-block',
          duration: 4,
          category: 'drums',
          isLoaded: true,
          audioBuffer: { duration: 1.0 },
          getAudioSegment: (ctx) => ({ duration: 1.0 })
        })
      };

      gameEngine.addBlockToTimeline('drums', mockBlock, 0);
      gameEngine.play();

      const timersBefore = clock.getPendingTimerCount();
      gameEngine.stop();

      expect(gameEngine.playbackInterval).toBeNull();
      expect(clock.getPendingTimerCount()).toBe(0);
    });
  });

  describe('pause / resume', () => {
    it('should pause playback', () => {
      const mockBlock = {
        id: 'test-block',
        duration: 4,
        category: 'drums',
        isLoaded: true,
        audioBuffer: { duration: 1.0 },
        clone: vi.fn().mockReturnValue({
          id: 'test-block',
          duration: 4,
          category: 'drums',
          isLoaded: true,
          audioBuffer: { duration: 1.0 },
          getAudioSegment: (ctx) => ({ duration: 1.0 })
        })
      };

      gameEngine.addBlockToTimeline('drums', mockBlock, 0);
      gameEngine.play();

      // Manually set playing state and advance time to simulate playback
      audioEngine.isPlaying = true;
      audioEngine.startedAt = audioEngine.audioContext.currentTime;
      audioEngine.audioContext.advanceTime(1.0);

      gameEngine.pause();

      expect(audioEngine.isPlaying).toBe(false);
      expect(audioEngine.pausedAt).toBeGreaterThan(0);
      expect(gameEngine.playbackInterval).toBeNull();
    });

    it('should resume from paused position', async () => {
      const mockBlock = {
        id: 'test-block',
        duration: 4,
        category: 'drums',
        isLoaded: true,
        audioBuffer: { duration: 1.0 },
        clone: vi.fn().mockReturnValue({
          id: 'test-block',
          duration: 4,
          category: 'drums',
          isLoaded: true,
          audioBuffer: { duration: 1.0 },
          getAudioSegment: (ctx) => ({ duration: 1.0 })
        })
      };

      gameEngine.addBlockToTimeline('drums', mockBlock, 0);
      gameEngine.play();

      // Manually set playing state and pause
      audioEngine.isPlaying = true;
      audioEngine.startedAt = audioEngine.audioContext.currentTime;
      audioEngine.audioContext.advanceTime(1.0);
      gameEngine.pause();

      await gameEngine.resume();

      expect(audioEngine.isPlaying).toBe(true);
      expect(mockVisualizer.start).toHaveBeenCalledTimes(2); // Once for play, once for resume
    });

    it('should warn and return if no blocks on resume', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation();
      await gameEngine.resume();

      expect(consoleSpy).toHaveBeenCalledWith('No blocks on timeline');
      consoleSpy.mockRestore();
    });

    it('should calculate correct timeout when resuming from middle of timeline (scheduleStop)', async () => {
      const mockBlock = {
        id: 'test-block',
        duration: 16, // 16 beats total duration
        category: 'drums',
        isLoaded: true,
        audioBuffer: { duration: 8.0 },
        clone: vi.fn().mockReturnValue({
          id: 'test-block',
          duration: 16,
          category: 'drums',
          isLoaded: true,
          audioBuffer: { duration: 8.0 },
          getAudioSegment: (ctx) => ({ duration: 8.0 })
        })
      };

      gameEngine.addBlockToTimeline('drums', mockBlock, 0);
      gameEngine.setLooping(false); // Ensure not looping
      gameEngine.play();

      // Simulate pause at beat 8 (halfway through 16 beats)
      audioEngine.isPlaying = true;
      audioEngine.startedAt = audioEngine.audioContext.currentTime;
      audioEngine.audioContext.advanceTime(4.0); // Advance 4 seconds = 8 beats @ 120 BPM
      gameEngine.pause();

      // Resume from beat 8
      await gameEngine.resume();

      // scheduleStop should timeout after remaining 8 beats (4 seconds), not full 16 beats
      // Pending timer count should be 1 (the scheduleStop timeout)
      expect(clock.getPendingTimerCount()).toBe(1);

      // Advance time to just before expected timeout (3.9s)
      clock.tick(3900);
      expect(audioEngine.isPlaying).toBe(true);

      // Advance to trigger timeout (4s total)
      clock.tick(100);
      expect(audioEngine.isPlaying).toBe(false);
    });

    it('should calculate correct timeout when resuming from middle of timeline (scheduleLoop)', async () => {
      const mockBlock = {
        id: 'test-block',
        duration: 16, // 16 beats total duration
        category: 'drums',
        isLoaded: true,
        audioBuffer: { duration: 8.0 },
        clone: vi.fn().mockReturnValue({
          id: 'test-block',
          duration: 16,
          category: 'drums',
          isLoaded: true,
          audioBuffer: { duration: 8.0 },
          getAudioSegment: (ctx) => ({ duration: 8.0 })
        })
      };

      gameEngine.addBlockToTimeline('drums', mockBlock, 0);
      gameEngine.setLooping(true); // Enable looping
      gameEngine.play();

      // Simulate pause at beat 8 (halfway through 16 beats)
      audioEngine.isPlaying = true;
      audioEngine.startedAt = audioEngine.audioContext.currentTime;
      audioEngine.audioContext.advanceTime(4.0); // Advance 4 seconds = 8 beats @ 120 BPM
      gameEngine.pause();

      // Resume from beat 8
      await gameEngine.resume();

      // scheduleLoop should timeout after remaining 8 beats (4 seconds), not full 16 beats
      expect(clock.getPendingTimerCount()).toBe(1);

      // Advance time to just before expected timeout (3.9s)
      clock.tick(3900);

      // Loop shouldn't have triggered yet
      const playCallsBefore = mockVisualizer.start.mock.calls.length;

      // Advance to trigger loop timeout (4s total)
      clock.tick(100);

      // Loop should have called play() again (visualizer.start called once more)
      const playCallsAfter = mockVisualizer.start.mock.calls.length;
      expect(playCallsAfter).toBe(playCallsBefore + 1);
    });
  });

  describe('onPlaybackEnd callback', () => {
    it('should call onPlaybackEnd callback when playback ends naturally', () => {
      const onPlaybackEndCallback = vi.fn();
      const engineWithCallback = new GameEngine({
        audioEngine,
        blockLibrary: mockBlockLibrary,
        timeline,
        visualizer: mockVisualizer,
        clock,
        onPlaybackEnd: onPlaybackEndCallback
      });

      // Initialize
      engineWithCallback.isReady = true;

      const mockBlock = {
        id: 'test-block',
        duration: 4,
        category: 'drums',
        isLoaded: true,
        audioBuffer: { duration: 2.0 },
        clone: vi.fn().mockReturnValue({
          id: 'test-block',
          duration: 4,
          category: 'drums',
          isLoaded: true,
          audioBuffer: { duration: 2.0 },
          getAudioSegment: (ctx) => ({ duration: 2.0 })
        })
      };

      engineWithCallback.addBlockToTimeline('drums', mockBlock, 0);
      engineWithCallback.setLooping(false);
      engineWithCallback.play();

      // Callback should not be called yet
      expect(onPlaybackEndCallback).not.toHaveBeenCalled();

      // Advance time to trigger scheduleStop timeout (4 beats = 2 seconds @ 120 BPM)
      clock.tick(2000);

      // Callback should now be called
      expect(onPlaybackEndCallback).toHaveBeenCalledTimes(1);
    });

    it('should not call onPlaybackEnd when looping', () => {
      const onPlaybackEndCallback = vi.fn();
      const engineWithCallback = new GameEngine({
        audioEngine,
        blockLibrary: mockBlockLibrary,
        timeline,
        visualizer: mockVisualizer,
        clock,
        onPlaybackEnd: onPlaybackEndCallback
      });

      // Initialize
      engineWithCallback.isReady = true;

      const mockBlock = {
        id: 'test-block',
        duration: 4,
        category: 'drums',
        isLoaded: true,
        audioBuffer: { duration: 2.0 },
        clone: vi.fn().mockReturnValue({
          id: 'test-block',
          duration: 4,
          category: 'drums',
          isLoaded: true,
          audioBuffer: { duration: 2.0 },
          getAudioSegment: (ctx) => ({ duration: 2.0 })
        })
      };

      engineWithCallback.addBlockToTimeline('drums', mockBlock, 0);
      engineWithCallback.setLooping(true); // Enable looping
      engineWithCallback.play();

      // Advance time - should loop, not end
      clock.tick(2000);

      // Callback should NOT be called because we're looping
      expect(onPlaybackEndCallback).not.toHaveBeenCalled();
    });
  });

  describe('clearTimeline', () => {
    it('should stop playback and clear timeline', () => {
      const mockBlock = {
        id: 'test-block',
        duration: 4,
        category: 'drums',
        isLoaded: true,
        audioBuffer: { duration: 1.0 },
        clone: vi.fn().mockReturnValue({
          id: 'test-block',
          duration: 4,
          category: 'drums',
          isLoaded: true,
          audioBuffer: { duration: 1.0 },
          getAudioSegment: (ctx) => ({ duration: 1.0 })
        })
      };

      gameEngine.addBlockToTimeline('drums', mockBlock, 0);
      gameEngine.play();

      gameEngine.clearTimeline();

      expect(timeline.tracks.drums.length).toBe(0);
      expect(audioEngine.isPlaying).toBe(false);
    });
  });

  describe('saveComposition / loadComposition', () => {
    it('should save composition to storage', () => {
      const mockBlock = {
        id: 'test-block',
        duration: 4,
        clone: vi.fn().mockReturnValue({ id: 'test-block', duration: 4 })
      };

      gameEngine.addBlockToTimeline('drums', mockBlock, 0);
      gameEngine.saveComposition('test-save');

      const saved = storage.getItem('musicFactory_test-save');
      expect(saved).toBeDefined();

      const state = JSON.parse(saved);
      expect(state.timeline).toBeDefined();
      expect(state.tempo).toBe(120);
      expect(state.savedAt).toBeDefined();
    });

    it('should load composition from storage', () => {
      const mockBlock = {
        id: 'test-block',
        duration: 4,
        clone: vi.fn().mockReturnValue({ id: 'test-block', duration: 4 })
      };

      gameEngine.addBlockToTimeline('drums', mockBlock, 0);
      gameEngine.saveComposition('test-load');

      gameEngine.clearTimeline();
      expect(timeline.tracks.drums.length).toBe(0);

      const success = gameEngine.loadComposition('test-load');

      expect(success).toBe(true);
      expect(timeline.tracks.drums.length).toBe(1);
    });

    it('should return false if save does not exist', () => {
      const success = gameEngine.loadComposition('non-existent');
      expect(success).toBe(false);
    });

    it('should throw error on save failure', () => {
      // Mock storage to throw error
      storage.setItem = vi.fn().mockImplementation(() => {
        throw new Error('Quota exceeded');
      });

      expect(() => {
        gameEngine.saveComposition('test');
      }).toThrow('Failed to save composition');
    });
  });

  describe('setVolume / setTempo', () => {
    it('should set master volume', () => {
      gameEngine.setVolume(0.5);
      expect(audioEngine.masterGain.gain.value).toBe(0.5);
    });

    it('should set tempo', () => {
      gameEngine.setTempo(140);
      expect(audioEngine.tempo).toBe(140);
    });
  });

  describe('getCurrentBeat / isPlaying', () => {
    it('should get current beat', () => {
      const beat = gameEngine.getCurrentBeat();
      expect(typeof beat).toBe('number');
    });

    it('should return playing state', () => {
      expect(gameEngine.isPlaying()).toBe(false);

      const mockBlock = {
        id: 'test-block',
        duration: 4,
        category: 'drums',
        isLoaded: true,
        audioBuffer: { duration: 1.0 },
        clone: vi.fn().mockReturnValue({
          id: 'test-block',
          duration: 4,
          category: 'drums',
          isLoaded: true,
          audioBuffer: { duration: 1.0 },
          getAudioSegment: (ctx) => ({ duration: 1.0 })
        })
      };

      gameEngine.addBlockToTimeline('drums', mockBlock, 0);
      gameEngine.play();

      expect(gameEngine.isPlaying()).toBe(true);
    });
  });

  describe('cleanup', () => {
    it('should stop playback', async () => {
      const mockBlock = {
        id: 'test-block',
        duration: 4,
        category: 'drums',
        isLoaded: true,
        audioBuffer: { duration: 1.0 },
        clone: vi.fn().mockReturnValue({
          id: 'test-block',
          duration: 4,
          category: 'drums',
          isLoaded: true,
          audioBuffer: { duration: 1.0 },
          getAudioSegment: (ctx) => ({ duration: 1.0 })
        })
      };

      gameEngine.addBlockToTimeline('drums', mockBlock, 0);
      gameEngine.play();

      await gameEngine.cleanup();

      expect(audioEngine.isPlaying).toBe(false);
    });

    it('should destroy visualizer', async () => {
      await gameEngine.cleanup();

      expect(mockVisualizer.destroy).toHaveBeenCalled();
      expect(gameEngine.visualizer).toBeNull();
    });

    it('should cleanup audio engine', async () => {
      await gameEngine.cleanup();

      expect(audioEngine.initialized).toBe(false);
    });

    it('should mark as not ready', async () => {
      await gameEngine.cleanup();

      expect(gameEngine.isReady).toBe(false);
    });
  });

  describe('Integration: Play → Stop → Loop', () => {
    it('should loop playback after duration', () => {
      const mockBlock = {
        id: 'test-block',
        duration: 4,
        category: 'drums',
        isLoaded: true,
        audioBuffer: { duration: 1.0 },
        clone: vi.fn().mockReturnValue({
          id: 'test-block',
          duration: 4,
          category: 'drums',
          isLoaded: true,
          audioBuffer: { duration: 1.0 },
          getAudioSegment: (ctx) => ({ duration: 1.0 })
        })
      };

      gameEngine.addBlockToTimeline('drums', mockBlock, 0);
      gameEngine.setLooping(true);
      gameEngine.play();

      const initialPlayCalls = mockVisualizer.start.mock.calls.length;

      // Advance time to trigger loop
      const duration = timeline.getTotalDuration();
      const durationMs = audioEngine.beatsToSeconds(duration) * 1000;
      clock.tick(durationMs);

      // Should have called play again (visualizer.start called again)
      expect(mockVisualizer.start.mock.calls.length).toBeGreaterThan(initialPlayCalls);
    });

    it('should stop after duration when not looping', () => {
      const mockBlock = {
        id: 'test-block',
        duration: 4,
        category: 'drums',
        isLoaded: true,
        audioBuffer: { duration: 1.0 },
        clone: vi.fn().mockReturnValue({
          id: 'test-block',
          duration: 4,
          category: 'drums',
          isLoaded: true,
          audioBuffer: { duration: 1.0 },
          getAudioSegment: (ctx) => ({ duration: 1.0 })
        })
      };

      gameEngine.addBlockToTimeline('drums', mockBlock, 0);
      gameEngine.setLooping(false);
      gameEngine.play();

      // Advance time to trigger stop
      const duration = timeline.getTotalDuration();
      const durationMs = audioEngine.beatsToSeconds(duration) * 1000;
      clock.tick(durationMs);

      expect(mockVisualizer.stop).toHaveBeenCalled();
    });
  });

  describe('randomizeComposition', () => {
    it('should generate a random composition with default options', () => {
      const placedCount = gameEngine.randomizeComposition();

      expect(placedCount).toBeGreaterThan(0);
      expect(placedCount).toBeGreaterThanOrEqual(8);
      expect(placedCount).toBeLessThanOrEqual(16);

      // Verify blocks were placed on timeline
      const allBlocks = timeline.getAllPlacedBlocks();
      expect(allBlocks.length).toBe(placedCount);
    });

    it('should respect minBlocks and maxBlocks options', () => {
      const placedCount = gameEngine.randomizeComposition({
        minBlocks: 5,
        maxBlocks: 10
      });

      expect(placedCount).toBeGreaterThanOrEqual(5);
      expect(placedCount).toBeLessThanOrEqual(10);
    });

    it('should only use specified tracks', () => {
      gameEngine.randomizeComposition({
        tracks: ['drums', 'bass'],
        minBlocks: 4,
        maxBlocks: 6
      });

      const allBlocks = timeline.getAllPlacedBlocks();

      // All blocks should be on drums or bass tracks
      allBlocks.forEach(block => {
        expect(['drums', 'bass']).toContain(block.trackName);
      });

      // Verify melody and fx tracks are empty
      expect(timeline.tracks.melody).toHaveLength(0);
      expect(timeline.tracks.fx).toHaveLength(0);
    });

    it('should clear timeline before generating new composition', () => {
      // Add some blocks first
      const mockBlock = {
        id: 'test-block',
        duration: 4,
        clone: vi.fn().mockReturnValue({ id: 'test-block', duration: 4 })
      };

      timeline.addBlock('drums', mockBlock, 0);
      timeline.addBlock('bass', mockBlock, 4);

      expect(timeline.getAllPlacedBlocks().length).toBe(2);

      // Generate random composition
      gameEngine.randomizeComposition();

      // Timeline should have new blocks
      const allBlocks = timeline.getAllPlacedBlocks();
      expect(allBlocks.length).toBeGreaterThan(0);
    });

    it('should handle empty block library', () => {
      // Create engine with empty block library
      const emptyBlockLibrary = {
        initialize: vi.fn(),
        loadAll: vi.fn().mockResolvedValue(),
        getAllBlocks: vi.fn(() => []),
        getBlockById: vi.fn(() => null)
      };

      const emptyEngine = new GameEngine({
        audioEngine,
        timeline,
        blockLibrary: emptyBlockLibrary,
        visualizer: mockVisualizer,
        clock,
        storage
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation();
      const placedCount = emptyEngine.randomizeComposition();

      expect(placedCount).toBe(0);
      expect(timeline.getAllPlacedBlocks().length).toBe(0);
      expect(consoleSpy).toHaveBeenCalledWith('No loaded blocks available for randomization');
      consoleSpy.mockRestore();
    });

    it('should respect maxAttempts when positions are limited', () => {
      // Use very restrictive options that make placement difficult
      const placedCount = gameEngine.randomizeComposition({
        minBlocks: 50, // Very high
        maxBlocks: 100, // Very high
        maxAttempts: 5 // Low attempts
      });

      // Should place some blocks but not all due to limited attempts
      expect(placedCount).toBeGreaterThan(0);
      expect(placedCount).toBeLessThan(50); // Won't reach minimum due to space constraints
    });

    it('should snap blocks to grid alignment', () => {
      gameEngine.randomizeComposition({
        minBlocks: 5,
        maxBlocks: 10
      });

      const allBlocks = timeline.getAllPlacedBlocks();

      // All blocks should be aligned to grid (beatGrid = 4)
      allBlocks.forEach(block => {
        expect(block.startBeat % timeline.beatGrid).toBe(0);
      });
    });

    it('should avoid overlapping blocks on same track', () => {
      gameEngine.randomizeComposition({
        minBlocks: 10,
        maxBlocks: 15
      });

      // Check each track for overlaps
      Object.keys(timeline.tracks).forEach(trackName => {
        const trackBlocks = timeline.tracks[trackName];

        // Sort by start beat
        const sorted = [...trackBlocks].sort((a, b) => a.startBeat - b.startBeat);

        // Check no overlaps
        for (let i = 0; i < sorted.length - 1; i++) {
          const current = sorted[i];
          const next = sorted[i + 1];

          const currentEnd = current.startBeat + current.block.duration;
          expect(currentEnd).toBeLessThanOrEqual(next.startBeat);
        }
      });
    });

    it('should return placed count matching timeline blocks', () => {
      const placedCount = gameEngine.randomizeComposition();
      const timelineBlocks = timeline.getAllPlacedBlocks();

      expect(placedCount).toBe(timelineBlocks.length);
    });
  });
});
