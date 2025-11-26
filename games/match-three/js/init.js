/**
 * Game Initialization
 * Entry point for the Match-Three game
 */

// Register Service Worker for PWA support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then((registration) => {
                console.log('[App] Service Worker registered:', registration.scope);
            })
            .catch((error) => {
                console.log('[App] Service Worker registration failed:', error);
            });
    });
}

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Create game instance
    window.game = new MatchThreeGame('game-container');

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (window.game) {
            window.game.destroy();
        }
    });
});
