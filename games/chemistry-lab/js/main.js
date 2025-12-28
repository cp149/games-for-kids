/**
 * Chemistry Lab - Main initialization script
 */

import { PerformanceMonitor } from '../../lib/performance-monitor.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('[Init] DOMContentLoaded fired at', new Date().toISOString());
  const startTime = performance.now();

  const canvas = document.getElementById('game-canvas');
  if (!canvas) {
    console.error('Canvas not found');
    return;
  }

  // Initialize I18n system
  console.log('[Init] Initializing I18n...');
  const i18n = initI18n(MESSAGES);

  // Initialize performance monitor
  console.log('[Init] Initializing performance monitor...');
  const perfMonitor = new PerformanceMonitor({
    position: 'top-left'
  });
  perfMonitor.init();

  // Create game instance
  console.log('[Init] Creating game instance...');
  const game = new ChemistryLabGame(canvas, CONFIG, LEVELS, i18n);
  game.perfMonitor = perfMonitor;

  const endTime = performance.now();
  console.log(`[Init] Total initialization time: ${(endTime - startTime).toFixed(2)}ms`);

  // Setup language switcher
  const langButtons = document.querySelectorAll('.btn-lang');
  langButtons.forEach(btn => {
    const lang = btn.getAttribute('data-lang');

    // Highlight current language
    if (lang === i18n.getCurrentLanguage()) {
      btn.style.fontWeight = 'bold';
      btn.style.textDecoration = 'underline';
    }

    btn.addEventListener('click', () => {
      i18n.setLanguage(lang);

      // Update button styles
      langButtons.forEach(b => {
        b.style.fontWeight = 'normal';
        b.style.textDecoration = 'none';
      });
      btn.style.fontWeight = 'bold';
      btn.style.textDecoration = 'underline';
    });
  });

  // Setup menu
  const startButton = document.getElementById('start-button');
  const menuOverlay = document.getElementById('menu-overlay');

  if (startButton && menuOverlay) {
    startButton.addEventListener('click', () => {
      menuOverlay.classList.add('hidden');
      game.start();
    });
  }

  // Handle window resize
  function handleResize() {
    const container = document.getElementById('game-container');
    if (!container || !canvas) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const aspectRatio = CONFIG.CANVAS.WIDTH / CONFIG.CANVAS.HEIGHT;

    if (containerWidth / containerHeight > aspectRatio) {
      canvas.style.height = `${containerHeight}px`;
      canvas.style.width = `${containerHeight * aspectRatio}px`;
    } else {
      canvas.style.width = `${containerWidth}px`;
      canvas.style.height = `${containerWidth / aspectRatio}px`;
    }
  }

  window.addEventListener('resize', handleResize);
  handleResize();

  // Cleanup on unload
  window.addEventListener('beforeunload', () => {
    game.destroy();
    perfMonitor.destroy();
  });
});
