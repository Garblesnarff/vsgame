/**
 * Screens Manager
 * Handles different game screens (game over, level up, etc.)
 */
export declare class ScreensManager {
    gameContainer: HTMLElement;
    gameOverScreen: HTMLElement | null;
    levelUpScreen: HTMLElement | null;
    finalScoreElement: HTMLElement | null;
    /**
     * Create a new screens manager
     * @param gameContainer - DOM element for the game container
     */
    constructor(gameContainer: HTMLElement);
    /**
     * Ensure all screen elements exist
     */
    ensureScreensExist(): void;
    /**
     * Show the game over screen
     * @param kills - Number of kills
     * @param time - Time played
     */
    showGameOver(kills: number, time: string): void;
    /**
     * Hide the game over screen
     */
    hideGameOver(): void;
    /**
     * Show the level up screen
     * @param duration - Duration to show the screen in ms (default: 3000)
     */
    showLevelUp(duration?: number): void;
    /**
     * Hide the level up screen
     */
    hideLevelUp(): void;
    /**
     * Create a custom message screen
     * @param message - Message to display
     * @param className - CSS class for styling
     * @param duration - Duration to show in ms (0 for permanent)
     * @returns The created screen element
     */
    showMessage(message: string, className?: string, duration?: number): HTMLElement;
    /**
     * Hide all screens
     */
    hideAll(): void;
}
export default ScreensManager;
