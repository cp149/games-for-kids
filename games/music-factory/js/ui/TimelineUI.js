/**
 * TimelineUI - Renders and manages timeline visualization
 */
export class TimelineUI {
  constructor(gameEngine, dragDropHandler) {
    this.gameEngine = gameEngine;
    this.dragDropHandler = dragDropHandler;

    this.timelineContainer = null;
    this.trackElements = {};
    this.playheadElement = null;
    this.animationFrame = null;
  }

  /**
   * Initialize timeline UI
   * @param {HTMLElement} container
   */
  initialize(container) {
    this.timelineContainer = container;
    this.render();
    this.startPlayheadAnimation();
  }

  /**
   * Render the timeline structure
   */
  render() {
    const tracks = ['drums', 'bass', 'melody', 'fx'];
    const trackIcons = {
      drums: '🥁',
      bass: '🎸',
      melody: '🎹',
      fx: '✨'
    };
    const trackColors = {
      drums: '#FF6B6B',
      bass: '#4ECDC4',
      melody: '#FFE66D',
      fx: '#FF6BCB'
    };

    let html = '<div class="timeline-header">';

    // Beat markers
    html += '<div class="beat-markers">';
    for (let i = 0; i <= this.gameEngine.timeline.maxBeats; i += 4) {
      html += `<div class="beat-marker">${i}</div>`;
    }
    html += '</div>';
    html += '</div>';

    // Tracks
    html += '<div class="timeline-tracks">';

    tracks.forEach(trackName => {
      html += `
        <div class="timeline-track"
             data-track="${trackName}"
             style="border-left: 4px solid ${trackColors[trackName]}">
          <div class="track-label" style="background: ${trackColors[trackName]}">
            <span class="track-icon">${trackIcons[trackName]}</span>
          </div>
          <div class="track-content" data-track-name="${trackName}">
          </div>
        </div>
      `;
    });

    html += '</div>';

    // Playhead
    html += '<div class="playhead" id="playhead"></div>';

    this.timelineContainer.innerHTML = html;

    // Store track elements
    tracks.forEach(trackName => {
      const trackContent = this.timelineContainer.querySelector(
        `.track-content[data-track-name="${trackName}"]`
      );
      this.trackElements[trackName] = trackContent;

      // Initialize as drop target
      this.dragDropHandler.initDropTarget(trackContent, trackName);
    });

    this.playheadElement = document.getElementById('playhead');
  }

  /**
   * Update timeline with current blocks
   */
  updateBlocks() {
    // Clear all tracks
    Object.values(this.trackElements).forEach(el => {
      el.innerHTML = '';
    });

    // Render blocks
    const allBlocks = this.gameEngine.timeline.getAllPlacedBlocks();

    allBlocks.forEach(placedBlock => {
      this.renderBlock(placedBlock);
    });
  }

  /**
   * Render a single block on timeline
   */
  renderBlock(placedBlock) {
    const trackElement = this.trackElements[placedBlock.trackName];
    if (!trackElement) return;

    const blockElement = document.createElement('div');
    blockElement.className = 'timeline-block';
    blockElement.style.backgroundColor = placedBlock.block.color;

    // Calculate position and width
    const maxBeats = this.gameEngine.timeline.maxBeats;
    const leftPercent = (placedBlock.startBeat / maxBeats) * 100;
    const widthPercent = (placedBlock.block.duration / maxBeats) * 100;

    blockElement.style.left = leftPercent + '%';
    blockElement.style.width = widthPercent + '%';

    // Content
    blockElement.innerHTML = `
      <div class="block-name">${placedBlock.block.name}</div>
      <button class="block-remove" data-block-id="${placedBlock.id}">×</button>
    `;

    // Remove button handler
    const removeBtn = blockElement.querySelector('.block-remove');
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.removeBlock(placedBlock.trackName, placedBlock.id);
    });

    // Initialize drag for moving
    this.dragDropHandler.initTimelineBlock(blockElement, placedBlock);

    trackElement.appendChild(blockElement);
  }

  /**
   * Remove a block
   */
  removeBlock(trackName, blockId) {
    this.gameEngine.removeBlockFromTimeline(trackName, blockId);
    this.updateBlocks();
  }

  /**
   * Start playhead animation
   */
  startPlayheadAnimation() {
    const animate = () => {
      if (this.gameEngine.isPlaying()) {
        const currentBeat = this.gameEngine.getCurrentBeat();
        const totalBeats = this.gameEngine.timeline.getTotalDuration();
        const maxBeats = this.gameEngine.timeline.maxBeats;

        const percent = (currentBeat / maxBeats) * 100;
        this.playheadElement.style.left = percent + '%';
        this.playheadElement.style.display = 'block';
      } else {
        this.playheadElement.style.display = 'none';
      }

      this.animationFrame = requestAnimationFrame(animate);
    };

    animate();
  }

  /**
   * Stop playhead animation
   */
  stopPlayheadAnimation() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    this.stopPlayheadAnimation();
  }
}
