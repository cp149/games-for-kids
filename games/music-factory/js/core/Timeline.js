import { TimestampIDGenerator } from '../implementations/TimestampIDGenerator.js';

/**
 * Timeline - Manages the music timeline and placed blocks
 * Now supports dependency injection for testability
 */
export class Timeline {
  /**
   * @param {Object} config - Configuration options
   * @param {IIDGenerator} config.idGenerator - ID generator implementation (default: TimestampIDGenerator)
   * @param {number} config.maxBeats - Maximum timeline length (default: 32)
   * @param {number} config.beatGrid - Snap grid size (default: 4)
   */
  constructor(config = {}) {
    // Dependency injection - allows testing with mock ID generator
    this.idGenerator = config.idGenerator || new TimestampIDGenerator();

    // Externalized configuration - allows different timeline sizes
    this.maxBeats = config.maxBeats || 32;
    this.beatGrid = config.beatGrid || 4;

    this.tracks = {
      drums: [],
      bass: [],
      melody: [],
      fx: []
    };

    this.idCounter = 0; // Unique ID counter to prevent collisions
  }

  /**
   * Add a block to the timeline
   * @param {string} trackName - Track identifier (drums, bass, melody, fx)
   * @param {MusicBlock} block - The block to add
   * @param {number} startBeat - Starting beat position
   * @returns {boolean} Success status
   */
  addBlock(trackName, block, startBeat) {
    // Snap to grid
    startBeat = this.snapToGrid(startBeat);

    // Check if position is valid
    if (!this.canPlaceBlock(trackName, startBeat, block.duration)) {
      return false;
    }

    // Add block to track with guaranteed unique ID
    // Use injected ID generator for testability
    this.tracks[trackName].push({
      block: block,
      startBeat: startBeat,
      endBeat: startBeat + block.duration,
      id: this.idGenerator.generateId(`${trackName}_${++this.idCounter}`)
    });

    // Sort by start beat
    this.tracks[trackName].sort((a, b) => a.startBeat - b.startBeat);

    return true;
  }

  /**
   * Remove a block from timeline
   * @param {string} trackName
   * @param {string} placedId - The placed block ID
   */
  removeBlock(trackName, placedId) {
    const track = this.tracks[trackName];
    const index = track.findIndex(item => item.id === placedId);

    if (index > -1) {
      track.splice(index, 1);
    }
  }

  /**
   * Check if a block can be placed at position
   * @param {string} trackName
   * @param {number} startBeat
   * @param {number} duration
   * @returns {boolean}
   */
  canPlaceBlock(trackName, startBeat, duration) {
    const endBeat = startBeat + duration;

    // Check timeline bounds
    if (startBeat < 0 || endBeat > this.maxBeats) {
      return false;
    }

    // Check for overlaps
    const track = this.tracks[trackName];
    for (const item of track) {
      if (this.blocksOverlap(startBeat, endBeat, item.startBeat, item.endBeat)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if two block ranges overlap
   */
  blocksOverlap(start1, end1, start2, end2) {
    return start1 < end2 && end1 > start2;
  }

  /**
   * Snap position to grid
   * @param {number} beat
   * @returns {number}
   */
  snapToGrid(beat) {
    return Math.round(beat / this.beatGrid) * this.beatGrid;
  }

  /**
   * Get all blocks across all tracks
   * @returns {Array}
   */
  getAllPlacedBlocks() {
    const allBlocks = [];

    Object.keys(this.tracks).forEach((trackName, trackIndex) => {
      this.tracks[trackName].forEach(item => {
        allBlocks.push({
          ...item,
          trackName: trackName,
          trackIndex: trackIndex
        });
      });
    });

    // CRITICAL: Sort by startBeat to ensure correct playback order
    allBlocks.sort((a, b) => a.startBeat - b.startBeat);

    return allBlocks;
  }

  /**
   * Get blocks for a specific track
   * @param {string} trackName
   * @returns {Array}
   */
  getTrackBlocks(trackName) {
    return this.tracks[trackName] || [];
  }

  /**
   * Clear all blocks
   */
  clearAll() {
    this.tracks.drums = [];
    this.tracks.bass = [];
    this.tracks.melody = [];
    this.tracks.fx = [];
  }

  /**
   * Clear a specific track
   * @param {string} trackName
   */
  clearTrack(trackName) {
    if (this.tracks[trackName]) {
      this.tracks[trackName] = [];
    }
  }

  /**
   * Get the total duration of the timeline (last block end)
   * @returns {number}
   */
  getTotalDuration() {
    let maxEnd = 0;

    Object.values(this.tracks).forEach(track => {
      track.forEach(item => {
        if (item.endBeat > maxEnd) {
          maxEnd = item.endBeat;
        }
      });
    });

    return maxEnd;
  }

  /**
   * Export timeline state for saving
   * @returns {Object}
   */
  exportState() {
    const state = {};

    Object.keys(this.tracks).forEach(trackName => {
      state[trackName] = this.tracks[trackName].map(item => ({
        blockId: item.block.id,
        startBeat: item.startBeat
      }));
    });

    return state;
  }

  /**
   * Import timeline state from save
   * @param {Object} state
   * @param {BlockLibrary} blockLibrary
   */
  importState(state, blockLibrary) {
    this.clearAll();

    Object.keys(state).forEach(trackName => {
      state[trackName].forEach(savedBlock => {
        const block = blockLibrary.getBlockById(savedBlock.blockId);
        if (block) {
          this.addBlock(trackName, block.clone(), savedBlock.startBeat);
        }
      });
    });
  }
}
