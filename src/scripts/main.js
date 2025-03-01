import CONFIG from './config.js';
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
    
    // Log initialization for debugging
    console.log('Vampire Survival Game initialized successfully!');
});