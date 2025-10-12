import { MusicBlock } from '../audio/MusicBlock.js';

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
    // Drums blocks
    this.addBlock({
      id: 'drums_1',
      name: 'Basic Beat',
      category: 'drums',
      audioPath: 'assets/sounds/drums/back2.mp3',
      duration: 8,
      mood: '🎉',
      color: '#FF6B6B'
    });

    this.addBlock({
      id: 'drums_long_1',
      name: 'Long Beat 1',
      category: 'drums',
      audioPath: 'assets/sounds/drums/back2.mp3',
      duration: 16,
      mood: '🎵',
      color: '#FF6B6B'
    });

    this.addBlock({
      id: 'drums_long_2',
      name: 'Long Beat 2',
      category: 'drums',
      audioPath: 'assets/sounds/drums/back2.mp3',
      duration: 12,
      mood: '🔥',
      color: '#FF6B6B',
      startTime: 0,
      endTime: 12
    });

    this.addBlock({
      id: 'drums_2',
      name: 'Rhythm Loop',
      category: 'drums',
      audioPath: 'assets/sounds/drums/back2.mp3',
      duration: 4,
      mood: '😊',
      color: '#FF6B6B',
      startTime: 0,
      endTime: 4
    });

    this.addBlock({
      id: 'drums_3',
      name: 'Beat Part 2',
      category: 'drums',
      audioPath: 'assets/sounds/drums/back2.mp3',
      duration: 4,
      mood: '🎵',
      color: '#FF6B6B',
      startTime: 4,
      endTime: 8
    });

    this.addBlock({
      id: 'drums_4',
      name: 'Short Beat',
      category: 'drums',
      audioPath: 'assets/sounds/drums/back2.mp3',
      duration: 2,
      mood: '💫',
      color: '#FF6B6B',
      startTime: 0,
      endTime: 2
    });

    this.addBlock({
      id: 'drums_5',
      name: 'Quick Hit',
      category: 'drums',
      audioPath: 'assets/sounds/drums/back2.mp3',
      duration: 2,
      mood: '⚡',
      color: '#FF6B6B',
      startTime: 2,
      endTime: 4
    });

    // Bass blocks
    this.addBlock({
      id: 'bass_1',
      name: 'Groovy Bass',
      category: 'bass',
      audioPath: 'assets/sounds/bass/back1.mp3',
      duration: 8,
      mood: '😊',
      color: '#4ECDC4'
    });

    this.addBlock({
      id: 'bass_long_1',
      name: 'Long Groove',
      category: 'bass',
      audioPath: 'assets/sounds/bass/back1.mp3',
      duration: 16,
      mood: '🌊',
      color: '#4ECDC4'
    });

    this.addBlock({
      id: 'bass_long_2',
      name: 'Deep Long',
      category: 'bass',
      audioPath: 'assets/sounds/bass/back3.mp3',
      duration: 16,
      mood: '💎',
      color: '#4ECDC4'
    });

    this.addBlock({
      id: 'bass_2',
      name: 'Deep Bass',
      category: 'bass',
      audioPath: 'assets/sounds/bass/back3.mp3',
      duration: 8,
      mood: '😌',
      color: '#4ECDC4'
    });

    this.addBlock({
      id: 'bass_3',
      name: 'Short Bass',
      category: 'bass',
      audioPath: 'assets/sounds/bass/back1.mp3',
      duration: 4,
      mood: '🎉',
      color: '#4ECDC4',
      startTime: 0,
      endTime: 4
    });

    this.addBlock({
      id: 'bass_4',
      name: 'Bass Part 2',
      category: 'bass',
      audioPath: 'assets/sounds/bass/back1.mp3',
      duration: 4,
      mood: '🎸',
      color: '#4ECDC4',
      startTime: 4,
      endTime: 8
    });

    this.addBlock({
      id: 'bass_5',
      name: 'Deep Part 1',
      category: 'bass',
      audioPath: 'assets/sounds/bass/back3.mp3',
      duration: 4,
      mood: '🌊',
      color: '#4ECDC4',
      startTime: 0,
      endTime: 4
    });

    this.addBlock({
      id: 'bass_6',
      name: 'Deep Part 2',
      category: 'bass',
      audioPath: 'assets/sounds/bass/back3.mp3',
      duration: 4,
      mood: '💙',
      color: '#4ECDC4',
      startTime: 4,
      endTime: 8
    });

    // Melody blocks
    this.addBlock({
      id: 'melody_1',
      name: 'Catchy Tune',
      category: 'melody',
      audioPath: 'assets/sounds/melody/catchy-music.mp3',
      duration: 8,
      mood: '😊',
      color: '#FFE66D'
    });

    this.addBlock({
      id: 'melody_long_1',
      name: 'Catchy Full',
      category: 'melody',
      audioPath: 'assets/sounds/melody/catchy-music.mp3',
      duration: 16,
      mood: '🎼',
      color: '#FFE66D'
    });

    this.addBlock({
      id: 'melody_long_2',
      name: 'Quirky Full',
      category: 'melody',
      audioPath: 'assets/sounds/melody/quirky-music.mp3',
      duration: 16,
      mood: '🎪',
      color: '#FFE66D'
    });

    this.addBlock({
      id: 'melody_long_3',
      name: 'Fast Full',
      category: 'melody',
      audioPath: 'assets/sounds/melody/fast-music.mp3',
      duration: 16,
      mood: '🚀',
      color: '#FFE66D'
    });

    this.addBlock({
      id: 'melody_2',
      name: 'Quirky Melody',
      category: 'melody',
      audioPath: 'assets/sounds/melody/quirky-music.mp3',
      duration: 8,
      mood: '🎃',
      color: '#FFE66D'
    });

    this.addBlock({
      id: 'melody_3',
      name: 'Fast Melody',
      category: 'melody',
      audioPath: 'assets/sounds/melody/fast-music.mp3',
      duration: 8,
      mood: '🎉',
      color: '#FFE66D'
    });

    this.addBlock({
      id: 'melody_4',
      name: 'Happy Tune',
      category: 'melody',
      audioPath: 'assets/sounds/melody/catchy-music.mp3',
      duration: 4,
      mood: '😊',
      color: '#FFE66D',
      startTime: 0,
      endTime: 4
    });

    this.addBlock({
      id: 'melody_5',
      name: 'Catchy Part 2',
      category: 'melody',
      audioPath: 'assets/sounds/melody/catchy-music.mp3',
      duration: 4,
      mood: '🎶',
      color: '#FFE66D',
      startTime: 4,
      endTime: 8
    });

    this.addBlock({
      id: 'melody_6',
      name: 'Quirky Part 1',
      category: 'melody',
      audioPath: 'assets/sounds/melody/quirky-music.mp3',
      duration: 4,
      mood: '🎭',
      color: '#FFE66D',
      startTime: 0,
      endTime: 4
    });

    this.addBlock({
      id: 'melody_7',
      name: 'Quirky Part 2',
      category: 'melody',
      audioPath: 'assets/sounds/melody/quirky-music.mp3',
      duration: 4,
      mood: '🤹',
      color: '#FFE66D',
      startTime: 4,
      endTime: 8
    });

    this.addBlock({
      id: 'melody_8',
      name: 'Fast Part 1',
      category: 'melody',
      audioPath: 'assets/sounds/melody/fast-music.mp3',
      duration: 4,
      mood: '🚀',
      color: '#FFE66D',
      startTime: 0,
      endTime: 4
    });

    this.addBlock({
      id: 'melody_9',
      name: 'Fast Part 2',
      category: 'melody',
      audioPath: 'assets/sounds/melody/fast-music.mp3',
      duration: 4,
      mood: '⚡',
      color: '#FFE66D',
      startTime: 4,
      endTime: 8
    });

    // FX blocks
    this.addBlock({
      id: 'fx_long_1',
      name: 'Long FX',
      category: 'fx',
      audioPath: 'assets/sounds/fx/funny1.mp3',
      duration: 8,
      mood: '🌟',
      color: '#FF6BCB'
    });

    this.addBlock({
      id: 'fx_1',
      name: 'Sparkle',
      category: 'fx',
      audioPath: 'assets/sounds/fx/funny1.mp3',
      duration: 4,
      mood: '✨',
      color: '#FF6BCB',
      startTime: 0,
      endTime: 2
    });

    this.addBlock({
      id: 'fx_2',
      name: 'Magic Sound',
      category: 'fx',
      audioPath: 'assets/sounds/melody/quirky-music.mp3',
      duration: 4,
      mood: '🎃',
      color: '#FF6BCB',
      startTime: 0,
      endTime: 2
    });

    this.addBlock({
      id: 'fx_3',
      name: 'Swoosh',
      category: 'fx',
      audioPath: 'assets/sounds/fx/funny1.mp3',
      duration: 4,
      mood: '🎉',
      color: '#FF6BCB',
      startTime: 2,
      endTime: 4
    });

    this.addBlock({
      id: 'fx_4',
      name: 'Quirky FX 1',
      category: 'fx',
      audioPath: 'assets/sounds/melody/quirky-music.mp3',
      duration: 2,
      mood: '🎪',
      color: '#FF6BCB',
      startTime: 2,
      endTime: 4
    });

    this.addBlock({
      id: 'fx_5',
      name: 'Quirky FX 2',
      category: 'fx',
      audioPath: 'assets/sounds/melody/quirky-music.mp3',
      duration: 2,
      mood: '🎨',
      color: '#FF6BCB',
      startTime: 4,
      endTime: 6
    });

    this.addBlock({
      id: 'fx_6',
      name: 'Fast FX',
      category: 'fx',
      audioPath: 'assets/sounds/melody/fast-music.mp3',
      duration: 2,
      mood: '💥',
      color: '#FF6BCB',
      startTime: 0,
      endTime: 2
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
   * Load all audio files
   * @param {AudioContext} audioContext
   * @returns {Promise<void>}
   */
  async loadAll(audioContext) {
    const loadPromises = this.blocks.map(block => block.load(audioContext));
    await Promise.all(loadPromises);
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
