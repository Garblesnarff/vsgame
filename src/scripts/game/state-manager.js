import { GameEvents, EVENTS } from '../utils/event-system.js';

/**
 * Enum for game states
 * @enum {string}
 */
export const GameState = {
    LOADING: 'loading',
    MAIN_MENU: 'mainMenu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    SKILL_MENU: 'skillMenu',
    GAME_OVER: 'gameOver'
};

/**
 * GameStateManager - Manages the different states of the game
 */
export class GameStateManager {
    constructor(game) {
        this.game = game;
        this.currentState = GameState.LOADING;
        this.previousState = null;
        this.states = {};
        
        // Setup event listeners
        this.setupEventListeners();
    }
    
    /**
     * Register state handlers
     * @param {Object} stateHandlers - Object with state handlers for each game state
     */
    registerStates(stateHandlers) {
        this.states = stateHandlers;
    }
    
    /**
     * Setup event listeners related to game state
     */
    setupEventListeners() {
        // Game state transitions
        GameEvents.on(EVENTS.GAME_START, () => this.changeState(GameState.PLAYING));
        GameEvents.on(EVENTS.GAME_OVER, () => this.changeState(GameState.GAME_OVER));
        GameEvents.on(EVENTS.GAME_PAUSE, () => this.changeState(GameState.PAUSED));
        GameEvents.on(EVENTS.GAME_RESUME, () => this.changeState(GameState.PLAYING));
        GameEvents.on(EVENTS.GAME_RESTART, () => this.changeState(GameState.PLAYING));
        
        // Skill menu state
        GameEvents.on(EVENTS.UI_SKILL_MENU_OPEN, () => this.changeState(GameState.SKILL_MENU));
        GameEvents.on(EVENTS.UI_SKILL_MENU_CLOSE, () => this.restorePreviousState());
        
        // Asset loading
        GameEvents.on('assets:loadStart', () => this.changeState(GameState.LOADING));
        GameEvents.on('assets:loadComplete', () => {
            if (this.currentState === GameState.LOADING) {
                this.changeState(GameState.MAIN_MENU);
            }
        });
    }
    
    /**
     * Change to a new game state
     * @param {GameState} newState - The new state to change to
     */
    changeState(newState) {
        // Don't change if already in this state
        if (newState === this.currentState) return;
        
        // Exit current state
        if (this.states[this.currentState] && this.states[this.currentState].exit) {
            this.states[this.currentState].exit(this.game);
        }
        
        // Store previous state
        this.previousState = this.currentState;
        
        // Update current state
        this.currentState = newState;
        
        // Emit state change event
        GameEvents.emit('state:change', {
            from: this.previousState,
            to: this.currentState
        });
        
        // Enter new state
        if (this.states[this.currentState] && this.states[this.currentState].enter) {
            this.states[this.currentState].enter(this.game);
        }
    }
    
    /**
     * Check if the game is in a specific state
     * @param {GameState} state - The state to check
     * @returns {boolean} - Whether the game is in that state
     */
    isInState(state) {
        return this.currentState === state;
    }
    
    /**
     * Get the current game state
     * @returns {GameState} - The current game state
     */
    getCurrentState() {
        return this.currentState;
    }
    
    /**
     * Restore the previous state (useful for temporary states like menus)
     */
    restorePreviousState() {
        if (this.previousState) {
            this.changeState(this.previousState);
        } else {
            // Default to PLAYING if no previous state
            this.changeState(GameState.PLAYING);
        }
    }
    
    /**
     * Update the current state
     * @param {number} deltaTime - Time since last update
     */
    update(deltaTime) {
        // Execute update logic for current state
        if (this.states[this.currentState] && this.states[this.currentState].update) {
            this.states[this.currentState].update(this.game, deltaTime);
        }
    }
}

/**
 * Default state handlers for the game
 */
export const defaultStateHandlers = {
    [GameState.LOADING]: {
        enter: (game) => {
            console.log('Entering LOADING state');
            // Show loading screen
            const loadingScreen = document.createElement('div');
            loadingScreen.id = 'loading-screen';
            loadingScreen.style.position = 'absolute';
            loadingScreen.style.top = '0';
            loadingScreen.style.left = '0';
            loadingScreen.style.width = '100%';
            loadingScreen.style.height = '100%';
            loadingScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            loadingScreen.style.display = 'flex';
            loadingScreen.style.justifyContent = 'center';
            loadingScreen.style.alignItems = 'center';
            loadingScreen.style.zIndex = '2000';
            loadingScreen.innerHTML = '<div style="color: white; font-size: 24px;">Loading...</div>';
            
            game.gameContainer.appendChild(loadingScreen);
            
            // Pause game loop if it's running
            if (game.gameLoop && game.gameLoop.gameRunning && !game.gameLoop.gamePaused) {
                game.gameLoop.pauseGame(game.gameContainer);
            }
        },
        exit: (game) => {
            console.log('Exiting LOADING state');
            // Hide loading screen
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.parentNode.removeChild(loadingScreen);
            }
        },
        update: (game, deltaTime) => {
            // Loading state update (e.g., update progress bar)
        }
    },
    
    [GameState.MAIN_MENU]: {
        enter: (game) => {
            console.log('Entering MAIN_MENU state');
            // Show main menu
            const mainMenu = document.createElement('div');
            mainMenu.id = 'main-menu';
            mainMenu.style.position = 'absolute';
            mainMenu.style.top = '0';
            mainMenu.style.left = '0';
            mainMenu.style.width = '100%';
            mainMenu.style.height = '100%';
            mainMenu.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            mainMenu.style.display = 'flex';
            mainMenu.style.flexDirection = 'column';
            mainMenu.style.justifyContent = 'center';
            mainMenu.style.alignItems = 'center';
            mainMenu.style.zIndex = '1000';
            
            mainMenu.innerHTML = `
                <h1 style="color: #8a2be2; font-size: 48px; margin-bottom: 40px;">Vampire Survival</h1>
                <button id="start-button" style="background-color: #4b0082; color: white; border: none; padding: 15px 30px; margin: 10px; font-size: 20px; cursor: pointer; border-radius: 5px;">Start Game</button>
                <button id="settings-button" style="background-color: #333; color: white; border: none; padding: 10px 20px; margin: 10px; font-size: 16px; cursor: pointer; border-radius: 5px;">Settings</button>
            `;
            
            game.gameContainer.appendChild(mainMenu);
            
            // Add event listeners
            document.getElementById('start-button').addEventListener('click', () => {
                // Start the game
                GameEvents.emit(EVENTS.GAME_START);
            });
            
            // Keep game paused
            if (game.gameLoop && game.gameLoop.gameRunning && !game.gameLoop.gamePaused) {
                game.gameLoop.pauseGame(game.gameContainer);
            }
        },
        exit: (game) => {
            console.log('Exiting MAIN_MENU state');
            // Hide main menu
            const mainMenu = document.getElementById('main-menu');
            if (mainMenu) {
                mainMenu.parentNode.removeChild(mainMenu);
            }
            
            // Resume game if needed
            if (game.gameLoop && game.gameLoop.gameRunning && game.gameLoop.gamePaused) {
                game.gameLoop.resumeGame();
            }
        },
        update: (game, deltaTime) => {
            // Main menu update (e.g., animate background)
        }
    },
    
    [GameState.PLAYING]: {
        enter: (game) => {
            console.log('Entering PLAYING state');
            // Resume game if it was paused
            if (game.gameLoop && game.gameLoop.gameRunning && game.gameLoop.gamePaused) {
                game.gameLoop.resumeGame();
            }
            
            // Hide pause overlay if it exists
            const pauseOverlay = document.getElementById('pause-overlay');
            if (pauseOverlay) {
                pauseOverlay.style.display = 'none';
            }
        },
        exit: (game) => {
            console.log('Exiting PLAYING state');
            // No special exit logic needed for now
        },
        update: (game, deltaTime) => {
            // Game is updated in the main loop
        }
    },
    
    [GameState.PAUSED]: {
        enter: (game) => {
            console.log('Entering PAUSED state');
            // Pause the game
            if (game.gameLoop && game.gameLoop.gameRunning && !game.gameLoop.gamePaused) {
                game.gameLoop.pauseGame(game.gameContainer);
            }
        },
        exit: (game) => {
            console.log('Exiting PAUSED state');
            // No special exit logic needed
        },
        update: (game, deltaTime) => {
            // No updates while paused
        }
    },
    
    [GameState.SKILL_MENU]: {
        enter: (game) => {
            console.log('Entering SKILL_MENU state');
            // Pause the game
            if (game.gameLoop && game.gameLoop.gameRunning && !game.gameLoop.gamePaused) {
                game.gameLoop.pauseGame(game.gameContainer);
            }
            
            // This is handled by the UI manager
        },
        exit: (game) => {
            console.log('Exiting SKILL_MENU state');
            // Resume game if going back to playing
            if (game.gameLoop && game.gameLoop.gameRunning && game.gameLoop.gamePaused) {
                game.gameLoop.resumeGame();
            }
        },
        update: (game, deltaTime) => {
            // No updates while in skill menu
        }
    },
    
    [GameState.GAME_OVER]: {
        enter: (game) => {
            console.log('Entering GAME_OVER state');
            // Stop the game loop
            if (game.gameLoop && game.gameLoop.gameRunning) {
                game.gameLoop.stop();
            }
            
            // This is handled by the UI manager showing the game over screen
        },
        exit: (game) => {
            console.log('Exiting GAME_OVER state');
            // This happens when restarting
        },
        update: (game, deltaTime) => {
            // No updates in game over state
        }
    }
};

export default GameStateManager;