import { describe, it, expect, beforeEach } from 'vitest';
import { Timeline } from '../js/core/Timeline.js';
import { SequentialIDGenerator } from '../js/implementations/SequentialIDGenerator.js';

/**
 * Timeline Unit Tests
 * Tests the Timeline class with deterministic ID generation
 */
describe('Timeline', () => {
  let timeline;
  let idGenerator;
  let mockBlock;

  beforeEach(() => {
    // Use deterministic ID generator for testing
    idGenerator = new SequentialIDGenerator();
    timeline = new Timeline({ idGenerator });

    // Create a mock block
    mockBlock = {
      id: 'test-block',
      name: 'Test Block',
      duration: 4,
      category: 'drums',
      clone: function() {
        return { ...this };
      }
    };
  });

  describe('Constructor', () => {
    it('should initialize with default configuration', () => {
      const defaultTimeline = new Timeline();
      expect(defaultTimeline.maxBeats).toBe(32);
      expect(defaultTimeline.beatGrid).toBe(4);
    });

    it('should accept custom configuration', () => {
      const customTimeline = new Timeline({
        maxBeats: 64,
        beatGrid: 8
      });
      expect(customTimeline.maxBeats).toBe(64);
      expect(customTimeline.beatGrid).toBe(8);
    });

    it('should initialize with empty tracks', () => {
      expect(timeline.tracks.drums).toEqual([]);
      expect(timeline.tracks.bass).toEqual([]);
      expect(timeline.tracks.melody).toEqual([]);
      expect(timeline.tracks.fx).toEqual([]);
    });
  });

  describe('addBlock', () => {
    it('should add a block to the timeline', () => {
      const success = timeline.addBlock('drums', mockBlock, 0);

      expect(success).toBe(true);
      expect(timeline.tracks.drums.length).toBe(1);
      expect(timeline.tracks.drums[0].block).toBe(mockBlock);
      expect(timeline.tracks.drums[0].startBeat).toBe(0);
      expect(timeline.tracks.drums[0].endBeat).toBe(4);
    });

    it('should generate unique deterministic IDs', () => {
      timeline.addBlock('drums', mockBlock, 0);
      timeline.addBlock('bass', mockBlock, 0);

      const drumsId = timeline.tracks.drums[0].id;
      const bassId = timeline.tracks.bass[0].id;

      // IDs should be deterministic with SequentialIDGenerator
      expect(drumsId).toBe('drums_1_1');
      expect(bassId).toBe('bass_2_2');
      expect(drumsId).not.toBe(bassId);
    });

    it('should snap to grid', () => {
      timeline.addBlock('drums', mockBlock, 2); // Not on grid

      expect(timeline.tracks.drums[0].startBeat).toBe(4); // Snapped to 4 (Math.round(2/4)*4)
    });

    it('should prevent overlapping blocks', () => {
      timeline.addBlock('drums', mockBlock, 0); // 0-4
      const success = timeline.addBlock('drums', mockBlock, 0); // Exact overlap

      expect(success).toBe(false);
      expect(timeline.tracks.drums.length).toBe(1);
    });

    it('should prevent blocks beyond timeline bounds', () => {
      const success = timeline.addBlock('drums', mockBlock, 30); // Would end at 34 > 32

      expect(success).toBe(false);
      expect(timeline.tracks.drums.length).toBe(0);
    });

    it('should sort blocks by start beat', () => {
      timeline.addBlock('drums', mockBlock, 8);
      timeline.addBlock('drums', mockBlock, 0);
      timeline.addBlock('drums', mockBlock, 16);

      expect(timeline.tracks.drums[0].startBeat).toBe(0);
      expect(timeline.tracks.drums[1].startBeat).toBe(8);
      expect(timeline.tracks.drums[2].startBeat).toBe(16);
    });
  });

  describe('removeBlock', () => {
    it('should remove a block by ID', () => {
      timeline.addBlock('drums', mockBlock, 0);
      const blockId = timeline.tracks.drums[0].id;

      timeline.removeBlock('drums', blockId);

      expect(timeline.tracks.drums.length).toBe(0);
    });

    it('should handle non-existent block removal gracefully', () => {
      timeline.addBlock('drums', mockBlock, 0);

      timeline.removeBlock('drums', 'non-existent-id');

      expect(timeline.tracks.drums.length).toBe(1);
    });
  });

  describe('canPlaceBlock', () => {
    it('should allow placing non-overlapping blocks', () => {
      timeline.addBlock('drums', mockBlock, 0); // 0-4

      expect(timeline.canPlaceBlock('drums', 4, 4)).toBe(true); // 4-8
      expect(timeline.canPlaceBlock('drums', 8, 4)).toBe(true); // 8-12
    });

    it('should prevent overlapping blocks', () => {
      timeline.addBlock('drums', mockBlock, 0); // 0-4

      expect(timeline.canPlaceBlock('drums', 0, 4)).toBe(false); // Exact overlap
      expect(timeline.canPlaceBlock('drums', 2, 4)).toBe(false); // Partial overlap
    });

    it('should check timeline bounds', () => {
      expect(timeline.canPlaceBlock('drums', -4, 4)).toBe(false); // Before start
      expect(timeline.canPlaceBlock('drums', 30, 4)).toBe(false); // Beyond end
      expect(timeline.canPlaceBlock('drums', 28, 4)).toBe(true); // At edge
    });
  });

  describe('snapToGrid', () => {
    it('should snap to grid correctly', () => {
      expect(timeline.snapToGrid(0)).toBe(0);
      expect(timeline.snapToGrid(2)).toBe(4); // Math.round(2/4)*4 = 4
      expect(timeline.snapToGrid(3)).toBe(4); // Math.round(3/4)*4 = 4
      expect(timeline.snapToGrid(6)).toBe(8); // Math.round(6/4)*4 = 8
      expect(timeline.snapToGrid(1)).toBe(0); // Math.round(1/4)*4 = 0
    });

    it('should respect custom grid size', () => {
      const customTimeline = new Timeline({ beatGrid: 8, idGenerator });

      expect(customTimeline.snapToGrid(3)).toBe(0); // Math.round(3/8)*8 = 0
      expect(customTimeline.snapToGrid(6)).toBe(8); // Math.round(6/8)*8 = 8
      expect(customTimeline.snapToGrid(10)).toBe(8); // Math.round(10/8)*8 = 8
      expect(customTimeline.snapToGrid(12)).toBe(16); // Math.round(12/8)*8 = 16
    });
  });

  describe('getAllPlacedBlocks', () => {
    it('should return empty array when no blocks', () => {
      expect(timeline.getAllPlacedBlocks()).toEqual([]);
    });

    it('should return all blocks across tracks', () => {
      timeline.addBlock('drums', mockBlock, 0);
      timeline.addBlock('bass', mockBlock, 0);
      timeline.addBlock('melody', mockBlock, 0);

      const allBlocks = timeline.getAllPlacedBlocks();

      expect(allBlocks.length).toBe(3);
      expect(allBlocks[0].trackName).toBe('drums');
      expect(allBlocks[1].trackName).toBe('bass');
      expect(allBlocks[2].trackName).toBe('melody');
    });

    it('should include trackIndex in returned blocks', () => {
      timeline.addBlock('drums', mockBlock, 0);

      const allBlocks = timeline.getAllPlacedBlocks();

      expect(allBlocks[0]).toHaveProperty('trackIndex');
      expect(allBlocks[0].trackIndex).toBe(0);
    });
  });

  describe('getTotalDuration', () => {
    it('should return 0 for empty timeline', () => {
      expect(timeline.getTotalDuration()).toBe(0);
    });

    it('should return end of last block', () => {
      timeline.addBlock('drums', mockBlock, 0); // 0-4
      timeline.addBlock('bass', mockBlock, 8); // 8-12
      timeline.addBlock('melody', mockBlock, 4); // 4-8

      expect(timeline.getTotalDuration()).toBe(12);
    });
  });

  describe('clearAll', () => {
    it('should clear all tracks', () => {
      timeline.addBlock('drums', mockBlock, 0);
      timeline.addBlock('bass', mockBlock, 0);
      timeline.addBlock('melody', mockBlock, 0);
      timeline.addBlock('fx', mockBlock, 0);

      timeline.clearAll();

      expect(timeline.tracks.drums).toEqual([]);
      expect(timeline.tracks.bass).toEqual([]);
      expect(timeline.tracks.melody).toEqual([]);
      expect(timeline.tracks.fx).toEqual([]);
    });
  });

  describe('clearTrack', () => {
    it('should clear a specific track', () => {
      timeline.addBlock('drums', mockBlock, 0);
      timeline.addBlock('bass', mockBlock, 0);

      timeline.clearTrack('drums');

      expect(timeline.tracks.drums).toEqual([]);
      expect(timeline.tracks.bass.length).toBe(1);
    });

    it('should handle clearing non-existent track', () => {
      timeline.clearTrack('invalid-track');
      // Should not throw error
    });
  });

  describe('exportState / importState', () => {
    it('should export timeline state', () => {
      timeline.addBlock('drums', mockBlock, 0);
      timeline.addBlock('bass', mockBlock, 4);

      const state = timeline.exportState();

      expect(state.drums.length).toBe(1);
      expect(state.drums[0].blockId).toBe('test-block');
      expect(state.drums[0].startBeat).toBe(0);
      expect(state.bass.length).toBe(1);
      expect(state.bass[0].startBeat).toBe(4);
    });

    it('should import timeline state', () => {
      const mockLibrary = {
        getBlockById: (id) => {
          if (id === 'test-block') {
            return mockBlock;
          }
          return null;
        }
      };

      const state = {
        drums: [{ blockId: 'test-block', startBeat: 0 }],
        bass: [{ blockId: 'test-block', startBeat: 4 }]
      };

      timeline.importState(state, mockLibrary);

      expect(timeline.tracks.drums.length).toBe(1);
      expect(timeline.tracks.bass.length).toBe(1);
      expect(timeline.tracks.drums[0].startBeat).toBe(0);
      expect(timeline.tracks.bass[0].startBeat).toBe(4);
    });

    it('should skip missing blocks during import', () => {
      const mockLibrary = {
        getBlockById: () => null // All blocks missing
      };

      const state = {
        drums: [{ blockId: 'missing-block', startBeat: 0 }]
      };

      timeline.importState(state, mockLibrary);

      expect(timeline.tracks.drums.length).toBe(0);
    });
  });
});
