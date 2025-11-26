/**
 * Game Initialization
 * Entry point for the Match-Three game
 */

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
