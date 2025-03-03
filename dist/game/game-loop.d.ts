/**
 * Game loop manager
 * Handles the main game update and render loop
 */
export declare class GameLoop {
    lastTimestamp: number;
    gameRunning: boolean;
    gamePaused: boolean;
    pauseOverlay: HTMLElement | null;
    updateCallback: ((deltaTime: number) => void) | null;
    constructor();
    /**
     * Start the game loop
     * @param updateCallback - Function to call on each update
     */
    start(updateCallback: (deltaTime: number) => void): void;
    /**
     * Stop the game loop
     */
    stop(): void;
    /**
     * Pause the game
     * @param gameContainer - Game container element
     */
    pauseGame(gameContainer: HTMLElement): void;
    /**
     * Resume the game
     */
    resumeGame(): void;
    /**
     * Toggle pause state
     * @param gameContainer - Game container element
     */
    togglePause(gameContainer: HTMLElement): void;
    /**
     * Main update function called on each animation frame
     * @param timestamp - Current timestamp
     */
    update(timestamp: number): void;
}
export default GameLoop;
