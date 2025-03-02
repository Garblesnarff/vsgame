import { Game } from './game/game.js';

/**
 * Main entry point for the Vampire Survival Game
 * Initializes the game and starts it
 */
document.addEventListener('DOMContentLoaded', () => {
    // Get the game container
    const gameContainer = document.getElementById('game-container');
    
    // Create and initialize the game
    const game = new Game(gameContainer);
    
    // Start the game
    game.start();
    
    // Expose game instance to window for debugging (optional)
    window.vampireGame = game;
    
    // Log initialization for debugging
    console.log('Vampire Survival Game initialized successfully!');
});