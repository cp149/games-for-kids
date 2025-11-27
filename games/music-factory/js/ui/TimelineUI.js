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

    // Bind event delegation handler to preserve 'this' context
    this.handleRemoveClick = this.handleRemoveClick.bind(this);
  }

  /**
   * Initialize timeline UI
   * @param {HTMLElement} container
   */
  initialize(container) {
    this.timelineContainer = container;
    this.render();

    // Setup event delegation for remove buttons (prevents memory leaks)
    this.timelineContainer.addEventListener('click', this.handleRemoveClick);

    // Don't start animation here - it will be started when play() is called
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
    // Clear all tracks with proper cleanup
    Object.values(this.trackElements).forEach(el => {
      // Remove all child elements to help GC
      while (el.firstChild) {
        el.removeChild(el.firstChild);
      }
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

    // Content - store track name and block id as data attributes for event delegation
    blockElement.innerHTML = `
      <div class="block-name">${placedBlock.block.name}</div>
      <button class="block-remove" data-track="${placedBlock.trackName}" data-block-id="${placedBlock.id}">×</button>
    `;

    // Event delegation handles remove clicks - no individual listeners needed
    // This prevents memory leaks when blocks are removed/recreated

    // Initialize drag for moving
    this.dragDropHandler.initTimelineBlock(blockElement, placedBlock);

    trackElement.appendChild(blockElement);
  }

  /**
   * Handle remove button clicks via event delegation
   */
  handleRemoveClick(e) {
    // Check if clicked element is a remove button
    if (e.target.classList.contains('block-remove')) {
      e.stopPropagation();

      const trackName = e.target.dataset.track;
      const blockId = e.target.dataset.blockId;

      if (trackName && blockId) {
        this.removeBlock(trackName, blockId);
      }
    }
  }

  /**
   * Remove a block
   */
  removeBlock(trackName, blockId) {
    this.gameEngine.removeBlockFromTimeline(trackName, blockId);
    this.updateBlocks();
  }

  /**
   * Start playhead animation (only runs while playing)
   */
  startPlayheadAnimation() {
    // Don't start if already running
    if (this.animationFrame) return;

    const animate = () => {
      if (this.gameEngine.isPlaying()) {
        const currentBeat = this.gameEngine.getCurrentBeat();
        const maxBeats = this.gameEngine.timeline.maxBeats;

        const percent = (currentBeat / maxBeats) * 100;
        this.playheadElement.style.left = percent + '%';
        this.playheadElement.style.display = 'block';

        // Continue animation while playing
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        // Stop animation when not playing
        this.animationFrame = null;

        // Keep playhead visible at paused position, hide when fully stopped
        const currentBeat = this.gameEngine.getCurrentBeat();
        if (currentBeat > 0) {
          // Paused: show at paused position
          const maxBeats = this.gameEngine.timeline.maxBeats;
          const percent = (currentBeat / maxBeats) * 100;
          this.playheadElement.style.left = percent + '%';
          this.playheadElement.style.display = 'block';
        } else {
          // Fully stopped: hide playhead
          this.playheadElement.style.display = 'none';
        }
      }
    };

    animate();
  }

  /**
   * Stop playhead animation and hide playhead
   */
  stopPlayheadAnimation() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    // Hide playhead when stopping
    if (this.playheadElement) {
      this.playheadElement.style.display = 'none';
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    this.stopPlayheadAnimation();

    // Remove event delegation listener to prevent memory leak
    if (this.timelineContainer) {
      this.timelineContainer.removeEventListener('click', this.handleRemoveClick);
    }
  }
}
