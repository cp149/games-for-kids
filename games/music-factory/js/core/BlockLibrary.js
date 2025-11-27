import { MusicBlock } from '../audio/MusicBlock.js';

/**
 * Mood emoji constants for separated tracks
 */
const TRACK_MOODS = {
  drums: {
    a: ['🎉', '🔥', '💫', '⚡', '🎵', '🥁', '💥', '🎸', '🌟'],
    b: ['😊', '🎶', '✨', '🔥', '💪', '🎯', '🚀', '💎', '🌈'],
    long: ['🥁', '🎵', '🔥', '💫', '⚡', '🎉', '✨', '🌟', '💥']
  },
  bass: {
    a: ['🌊', '💎', '🎸', '😌', '🎉', '💙', '🌈', '🔮', '🎵'],
    b: ['😊', '🎶', '✨', '🌟', '💫', '🔥', '🚀', '💪', '🌙'],
    long: ['🎸', '🌊', '💎', '💙', '🌈', '😌', '🎉', '🔮', '✨']
  },
  melody: {
    a: ['🎼', '🎹', '🎵', '🎶', '🎤', '🎷', '🎺', '🎻', '🪕'],
    b: ['😊', '🌟', '✨', '💫', '🌈', '🎉', '🎊', '💖', '🦋'],
    long: ['🎵', '🎼', '🎹', '🎶', '🎷', '🎤', '🎺', '🎻', '✨']
  }
};

/**
 * Default fallback mood emoji
 */
const DEFAULT_MOOD = '🎵';

/**
 * BlockLibrary - Manages all available music blocks
 */
export class BlockLibrary {
  constructor() {
    this.blocks = [];
    this.categories = {
      drums: [],
      bass: [],
      melody: [],
      fx: []
    };
  }

  /**
   * Initialize the block library with predefined blocks
   */
  initialize() {
    // Drums blocks - all 4 beats (2 sec) or 2 beats (1 sec)
    this.addBlock({
      id: 'drums_1',
      name: 'Beat A',
      category: 'drums',
      audioPath: 'assets/sounds/drums/back2.mp3',
      duration: 4,
      mood: '🎉',
      color: '#FF6B6B',
      startTime: 0,
      endTime: 2
    });

    this.addBlock({
      id: 'drums_2',
      name: 'Beat B',
      category: 'drums',
      audioPath: 'assets/sounds/drums/back2.mp3',
      duration: 4,
      mood: '🎵',
      color: '#FF6B6B',
      startTime: 2,
      endTime: 4
    });

    this.addBlock({
      id: 'drums_3',
      name: 'Beat C',
      category: 'drums',
      audioPath: 'assets/sounds/drums/back2.mp3',
      duration: 4,
      mood: '🔥',
      color: '#FF6B6B',
      startTime: 4,
      endTime: 6
    });

    this.addBlock({
      id: 'drums_4',
      name: 'Short A',
      category: 'drums',
      audioPath: 'assets/sounds/drums/back2.mp3',
      duration: 2,
      mood: '💫',
      color: '#FF6B6B',
      startTime: 0,
      endTime: 1
    });

    this.addBlock({
      id: 'drums_5',
      name: 'Short B',
      category: 'drums',
      audioPath: 'assets/sounds/drums/back2.mp3',
      duration: 2,
      mood: '⚡',
      color: '#FF6B6B',
      startTime: 1,
      endTime: 2
    });

    // New separated drums (tracks 01-09) - 4 beats each
    for (let i = 1; i <= 9; i++) {
      const trackNum = String(i).padStart(2, '0');
      const idx = i - 1;
      this.addBlock({
        id: `drums_track${trackNum}_a`,
        name: `T${i} Drums A`,
        category: 'drums',
        audioPath: `assets/sounds/drums/track${trackNum}.mp3`,
        duration: 4,
        mood: TRACK_MOODS.drums.a[idx] || DEFAULT_MOOD,
        color: '#FF6B6B',
        startTime: 0,
        endTime: 2
      });
      this.addBlock({
        id: `drums_track${trackNum}_b`,
        name: `T${i} Drums B`,
        category: 'drums',
        audioPath: `assets/sounds/drums/track${trackNum}.mp3`,
        duration: 4,
        mood: TRACK_MOODS.drums.b[idx] || DEFAULT_MOOD,
        color: '#FF6B6B',
        startTime: 2,
        endTime: 4
      });
      this.addBlock({
        id: `drums_track${trackNum}_c`,
        name: `T${i} Drums C`,
        category: 'drums',
        audioPath: `assets/sounds/drums/track${trackNum}.mp3`,
        duration: 4,
        mood: TRACK_MOODS.drums.long[idx] || DEFAULT_MOOD,
        color: '#FF6B6B',
        startTime: 4,
        endTime: 6
      });
    }

    // Bass blocks - all 4 beats (2 sec) or 2 beats (1 sec)
    this.addBlock({
      id: 'bass_1',
      name: 'Bass A',
      category: 'bass',
      audioPath: 'assets/sounds/bass/back1.mp3',
      duration: 4,
      mood: '😊',
      color: '#4ECDC4',
      startTime: 0,
      endTime: 2
    });

    this.addBlock({
      id: 'bass_2',
      name: 'Bass B',
      category: 'bass',
      audioPath: 'assets/sounds/bass/back1.mp3',
      duration: 4,
      mood: '🌊',
      color: '#4ECDC4',
      startTime: 2,
      endTime: 4
    });

    this.addBlock({
      id: 'bass_3',
      name: 'Deep A',
      category: 'bass',
      audioPath: 'assets/sounds/bass/back3.mp3',
      duration: 4,
      mood: '💎',
      color: '#4ECDC4',
      startTime: 0,
      endTime: 2
    });

    this.addBlock({
      id: 'bass_4',
      name: 'Deep B',
      category: 'bass',
      audioPath: 'assets/sounds/bass/back3.mp3',
      duration: 4,
      mood: '😌',
      color: '#4ECDC4',
      startTime: 2,
      endTime: 4
    });

    // New separated bass (tracks 01-09) - 4 beats each
    for (let i = 1; i <= 9; i++) {
      const trackNum = String(i).padStart(2, '0');
      const idx = i - 1;
      this.addBlock({
        id: `bass_track${trackNum}_a`,
        name: `T${i} Bass A`,
        category: 'bass',
        audioPath: `assets/sounds/bass/track${trackNum}.mp3`,
        duration: 4,
        mood: TRACK_MOODS.bass.a[idx] || DEFAULT_MOOD,
        color: '#4ECDC4',
        startTime: 0,
        endTime: 2
      });
      this.addBlock({
        id: `bass_track${trackNum}_b`,
        name: `T${i} Bass B`,
        category: 'bass',
        audioPath: `assets/sounds/bass/track${trackNum}.mp3`,
        duration: 4,
        mood: TRACK_MOODS.bass.b[idx] || DEFAULT_MOOD,
        color: '#4ECDC4',
        startTime: 2,
        endTime: 4
      });
      this.addBlock({
        id: `bass_track${trackNum}_c`,
        name: `T${i} Bass C`,
        category: 'bass',
        audioPath: `assets/sounds/bass/track${trackNum}.mp3`,
        duration: 4,
        mood: TRACK_MOODS.bass.long[idx] || DEFAULT_MOOD,
        color: '#4ECDC4',
        startTime: 4,
        endTime: 6
      });
    }

    // Melody blocks - all 4 beats (2 sec)
    this.addBlock({
      id: 'melody_1',
      name: 'Catchy A',
      category: 'melody',
      audioPath: 'assets/sounds/melody/catchy-music.mp3',
      duration: 4,
      mood: '😊',
      color: '#FFE66D',
      startTime: 0,
      endTime: 2
    });

    this.addBlock({
      id: 'melody_2',
      name: 'Catchy B',
      category: 'melody',
      audioPath: 'assets/sounds/melody/catchy-music.mp3',
      duration: 4,
      mood: '🎶',
      color: '#FFE66D',
      startTime: 2,
      endTime: 4
    });

    this.addBlock({
      id: 'melody_3',
      name: 'Quirky A',
      category: 'melody',
      audioPath: 'assets/sounds/melody/quirky-music.mp3',
      duration: 4,
      mood: '🎭',
      color: '#FFE66D',
      startTime: 0,
      endTime: 2
    });

    this.addBlock({
      id: 'melody_4',
      name: 'Quirky B',
      category: 'melody',
      audioPath: 'assets/sounds/melody/quirky-music.mp3',
      duration: 4,
      mood: '🤹',
      color: '#FFE66D',
      startTime: 2,
      endTime: 4
    });

    this.addBlock({
      id: 'melody_5',
      name: 'Fast A',
      category: 'melody',
      audioPath: 'assets/sounds/melody/fast-music.mp3',
      duration: 4,
      mood: '🚀',
      color: '#FFE66D',
      startTime: 0,
      endTime: 2
    });

    this.addBlock({
      id: 'melody_6',
      name: 'Fast B',
      category: 'melody',
      audioPath: 'assets/sounds/melody/fast-music.mp3',
      duration: 4,
      mood: '⚡',
      color: '#FFE66D',
      startTime: 2,
      endTime: 4
    });

    // New separated melody (tracks 01-09) - 4 beats each
    for (let i = 1; i <= 9; i++) {
      const trackNum = String(i).padStart(2, '0');
      const idx = i - 1;
      this.addBlock({
        id: `melody_track${trackNum}_a`,
        name: `T${i} Melody A`,
        category: 'melody',
        audioPath: `assets/sounds/melody/track${trackNum}.mp3`,
        duration: 4,
        mood: TRACK_MOODS.melody.a[idx] || DEFAULT_MOOD,
        color: '#FFE66D',
        startTime: 0,
        endTime: 2
      });
      this.addBlock({
        id: `melody_track${trackNum}_b`,
        name: `T${i} Melody B`,
        category: 'melody',
        audioPath: `assets/sounds/melody/track${trackNum}.mp3`,
        duration: 4,
        mood: TRACK_MOODS.melody.b[idx] || DEFAULT_MOOD,
        color: '#FFE66D',
        startTime: 2,
        endTime: 4
      });
      this.addBlock({
        id: `melody_track${trackNum}_c`,
        name: `T${i} Melody C`,
        category: 'melody',
        audioPath: `assets/sounds/melody/track${trackNum}.mp3`,
        duration: 4,
        mood: TRACK_MOODS.melody.long[idx] || DEFAULT_MOOD,
        color: '#FFE66D',
        startTime: 4,
        endTime: 6
      });
    }

    // FX blocks - all 2 beats (1 sec)
    this.addBlock({
      id: 'fx_1',
      name: 'Sparkle',
      category: 'fx',
      audioPath: 'assets/sounds/fx/funny1.mp3',
      duration: 2,
      mood: '✨',
      color: '#FF6BCB',
      startTime: 0,
      endTime: 1
    });

    this.addBlock({
      id: 'fx_2',
      name: 'Magic',
      category: 'fx',
      audioPath: 'assets/sounds/melody/quirky-music.mp3',
      duration: 2,
      mood: '🎃',
      color: '#FF6BCB',
      startTime: 0,
      endTime: 1
    });

    this.addBlock({
      id: 'fx_3',
      name: 'Swoosh',
      category: 'fx',
      audioPath: 'assets/sounds/fx/funny1.mp3',
      duration: 2,
      mood: '🎉',
      color: '#FF6BCB',
      startTime: 1,
      endTime: 2
    });

    this.addBlock({
      id: 'fx_4',
      name: 'Quirky',
      category: 'fx',
      audioPath: 'assets/sounds/melody/quirky-music.mp3',
      duration: 2,
      mood: '🎪',
      color: '#FF6BCB',
      startTime: 1,
      endTime: 2
    });

    this.addBlock({
      id: 'fx_5',
      name: 'Pop',
      category: 'fx',
      audioPath: 'assets/sounds/melody/quirky-music.mp3',
      duration: 2,
      mood: '🎨',
      color: '#FF6BCB',
      startTime: 2,
      endTime: 3
    });

    this.addBlock({
      id: 'fx_6',
      name: 'Zap',
      category: 'fx',
      audioPath: 'assets/sounds/melody/fast-music.mp3',
      duration: 2,
      mood: '💥',
      color: '#FF6BCB',
      startTime: 0,
      endTime: 1
    });
  }

  /**
   * Add a block to the library
   * @param {Object} config - Block configuration
   */
  addBlock(config) {
    const block = new MusicBlock(config);
    this.blocks.push(block);

    if (this.categories[block.category]) {
      this.categories[block.category].push(block);
    }
  }

  /**
   * Load all audio files with error handling and concurrency control
   * @param {AudioContext} audioContext
   * @param {number} [concurrency=5] - Max concurrent loads to prevent browser throttling
   * @returns {Promise<{loaded: number, failed: number, errors: Array}>}
   */
  async loadAll(audioContext, concurrency = 5) {
    let loaded = 0;
    let failed = 0;
    const errors = [];

    // Process blocks in batches to limit concurrent requests
    const blocks = [...this.blocks];
    const batches = [];
    for (let i = 0; i < blocks.length; i += concurrency) {
      batches.push(blocks.slice(i, i + concurrency));
    }

    for (const batch of batches) {
      const loadPromises = batch.map(async (block) => {
        try {
          await block.load(audioContext);
          loaded++;
        } catch (error) {
          failed++;
          errors.push({ blockId: block.id, error: error.message });
          console.warn(`Failed to load block ${block.id}:`, error.message);
        }
      });

      await Promise.all(loadPromises);
    }

    if (failed > 0) {
      console.warn(`Audio loading complete: ${loaded} loaded, ${failed} failed`);
    }

    return { loaded, failed, errors };
  }

  /**
   * Get blocks by category
   * @param {string} category
   * @returns {Array<MusicBlock>}
   */
  getBlocksByCategory(category) {
    return this.categories[category] || [];
  }

  /**
   * Get block by ID
   * @param {string} id
   * @returns {MusicBlock|null}
   */
  getBlockById(id) {
    return this.blocks.find(block => block.id === id) || null;
  }

  /**
   * Get all blocks
   * @returns {Array<MusicBlock>}
   */
  getAllBlocks() {
    return this.blocks;
  }
}
