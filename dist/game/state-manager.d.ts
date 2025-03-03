import { GameState, StateHandlers } from "../types/game-types";
import { Game } from "./game";
/**
 * GameStateManager - Manages the different states of the game
 */
export declare class GameStateManager {
    game: Game;
    currentState: GameState;
    previousState: GameState | null;
    states: StateHandlers;
    /**
     * Create a new game state manager
     * @param game - Game instance
     */
    constructor(game: Game);
    /**
     * Register state handlers
     * @param stateHandlers - Object with state handlers for each game state
     */
    registerStates(stateHandlers: StateHandlers): void;
    /**
     * Setup event listeners related to game state
     */
    setupEventListeners(): void;
    /**
     * Change to a new game state
     * @param newState - The new state to change to
     */
    changeState(newState: GameState): void;
    /**
     * Check if the game is in a specific state
     * @param state - The state to check
     * @returns Whether the game is in that state
     */
    isInState(state: GameState): boolean;
    /**
     * Get the current game state
     * @returns The current game state
     */
    getCurrentState(): GameState;
    /**
     * Restore the previous state (useful for temporary states like menus)
     */
    restorePreviousState(): void;
    /**
     * Update the current state
     * @param deltaTime - Time since last update
     */
    update(deltaTime: number): void;
}
/**
 * Default state handlers for the game
 */
export declare const defaultStateHandlers: StateHandlers;
export default GameStateManager;
