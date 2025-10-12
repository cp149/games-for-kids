/**
 * BlockUI - Renders block library interface
 */
export class BlockUI {
  constructor(gameEngine, dragDropHandler) {
    this.gameEngine = gameEngine;
    this.dragDropHandler = dragDropHandler;
    this.libraryContainer = null;
  }

  /**
   * Initialize block library UI
   * @param {HTMLElement} container
   */
  initialize(container) {
    this.libraryContainer = container;
    this.render();
  }

  /**
   * Render the block library
   */
  render() {
    const categories = ['drums', 'bass', 'melody', 'fx'];
    const categoryNames = {
      drums: 'Drums',
      bass: 'Bass',
      melody: 'Melody',
      fx: 'Effects'
    };
    const categoryIcons = {
      drums: '🥁',
      bass: '🎸',
      melody: '🎹',
      fx: '✨'
    };

    let html = '<div class="block-library-content">';

    categories.forEach(category => {
      const blocks = this.gameEngine.blockLibrary.getBlocksByCategory(category);

      if (blocks.length > 0) {
        html += `
          <div class="block-category">
            <div class="category-header">
              <span class="category-icon">${categoryIcons[category]}</span>
              <span class="category-name">${categoryNames[category]}</span>
            </div>
            <div class="category-blocks">
        `;

        blocks.forEach(block => {
          html += this.renderBlockCard(block);
        });

        html += `
            </div>
          </div>
        `;
      }
    });

    html += '</div>';

    this.libraryContainer.innerHTML = html;

    // Initialize drag and drop for all blocks
    this.initializeBlocks();
  }

  /**
   * Render a single block card
   */
  renderBlockCard(block) {
    return `
      <div class="library-block"
           data-block-id="${block.id}"
           style="background: linear-gradient(135deg, ${block.color} 0%, ${this.darkenColor(block.color)} 100%)">
        <div class="block-mood">${block.mood}</div>
        <div class="block-title">${block.name}</div>
        <div class="block-duration">${block.duration} beats</div>
      </div>
    `;
  }

  /**
   * Initialize drag and drop for library blocks
   */
  initializeBlocks() {
    const blockElements = this.libraryContainer.querySelectorAll('.library-block');

    blockElements.forEach(element => {
      const blockId = element.dataset.blockId;
      const block = this.gameEngine.blockLibrary.getBlockById(blockId);

      if (block) {
        this.dragDropHandler.initLibraryBlock(element, block);
      }
    });
  }

  /**
   * Darken a color for gradient effect
   */
  darkenColor(color) {
    // Simple darkening by reducing brightness
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 30);
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 30);
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 30);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
}
