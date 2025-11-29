/**
 * Input Manager
 * Handles all user input events and canvas interactions
 */

import i18n from '../utils/i18n.js';

export class InputManager {
  constructor(canvas, callbacks) {
    this.canvas = canvas;
    this.callbacks = callbacks;
    this.eventHandlers = new Map(); // Store event handler references
  }

  /**
   * Add event listener and store reference
   * @param {HTMLElement} element - Target element
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   */
  addEventListener(element, event, handler) {
    if (!element) return;

    const key = `${element.id || 'canvas'}_${event}`;
    this.eventHandlers.set(key, { element, event, handler });
    element.addEventListener(event, handler);
  }

  /**
   * Setup all event listeners
   */
  setupEventListeners() {
    // Canvas click and touch
    const canvasClickHandler = (e) => this.handleCanvasClick(e);
    const canvasTouchHandler = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const clickEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY
      };
      this.handleCanvasClick(clickEvent);
    };
    const canvasMousemoveHandler = (e) => this.handleMouseMove(e);

    this.addEventListener(this.canvas, 'click', canvasClickHandler);
    this.addEventListener(this.canvas, 'touchstart', canvasTouchHandler);
    this.addEventListener(this.canvas, 'mousemove', canvasMousemoveHandler);

    // Top bar buttons
    this.addEventListener(document.getElementById('btnRestart'), 'click', () => this.callbacks.onRestart());
    this.addEventListener(document.getElementById('btnHint'), 'click', () => this.callbacks.onShowHint());
    this.addEventListener(document.getElementById('btnSettings'), 'click', () => this.callbacks.onShowSettings());
    this.addEventListener(document.getElementById('btnRandom'), 'click', () => this.callbacks.onShowDifficulty());

    // Settings panel
    this.addEventListener(document.getElementById('btnCloseSettings'), 'click', () => this.callbacks.onHideSettings());
    this.addEventListener(document.getElementById('languageSelect'), 'change', (e) => {
      i18n.setLanguage(e.target.value);
    });
    this.addEventListener(document.getElementById('soundToggle'), 'change', (e) => {
      this.callbacks.onSettingChange('sound', e.target.checked);
    });
    this.addEventListener(document.getElementById('musicToggle'), 'change', (e) => {
      this.callbacks.onSettingChange('music', e.target.checked);
    });
    this.addEventListener(document.getElementById('particlesToggle'), 'change', (e) => {
      this.callbacks.onSettingChange('particles', e.target.checked);
    });

    // Tutorial
    this.addEventListener(document.getElementById('btnTutorialNext'), 'click', () => this.callbacks.onTutorialNext());

    // Success screen
    this.addEventListener(document.getElementById('btnReplay'), 'click', () => this.callbacks.onRestart());
    this.addEventListener(document.getElementById('btnNextLevel'), 'click', () => this.callbacks.onNextLevel());

    // Difficulty panel
    this.addEventListener(document.getElementById('btnCloseDifficulty'), 'click', () => this.callbacks.onHideDifficulty());
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
      const handler = () => {
        const difficulty = parseInt(btn.getAttribute('data-difficulty'));
        this.callbacks.onLoadRandom(difficulty);
      };
      this.addEventListener(btn, 'click', handler);
    });

    // Game complete panel
    this.addEventListener(document.getElementById('btnCloseComplete'), 'click', () => this.callbacks.onHideGameComplete());
    this.addEventListener(document.getElementById('btnRestartGame'), 'click', () => {
      this.callbacks.onHideGameComplete();
      this.callbacks.onRestartGame();
    });
    this.addEventListener(document.getElementById('btnPlayRandom'), 'click', () => {
      this.callbacks.onHideGameComplete();
      this.callbacks.onShowDifficulty();
    });

    // Hint panel
    this.addEventListener(document.getElementById('btnCloseHint'), 'click', () => this.callbacks.onHideHint());
  }

  /**
   * Clean up all event listeners
   */
  destroy() {
    // Remove all event listeners
    this.eventHandlers.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventHandlers.clear();

    // Clear references
    this.canvas = null;
    this.callbacks = null;
  }

  /**
   * Handle canvas click events
   * @param {Event} e - Click event
   */
  handleCanvasClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.callbacks.onCanvasClick(x, y);
  }

  /**
   * Handle canvas mouse move events
   * @param {Event} e - Mouse move event
   */
  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const button = this.callbacks.onGetButtonAt(x, y);
    this.canvas.style.cursor = button ? 'pointer' : 'default';
  }
}
