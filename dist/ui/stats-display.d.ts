import { Player } from "../entities/player";
/**
 * Stats Display
 * Manages the display of player statistics (health, energy, level, kills, etc.)
 */
export declare class StatsDisplay {
    gameContainer: HTMLElement;
    player: Player;
    healthBar: HTMLElement | null;
    energyBar: HTMLElement | null;
    timeElement: HTMLElement | null;
    levelElement: HTMLElement | null;
    killsElement: HTMLElement | null;
    skillPointsCount: HTMLElement | null;
    /**
     * Create a new stats display
     * @param gameContainer - DOM element containing the game
     * @param player - Player object whose stats to display
     */
    constructor(gameContainer: HTMLElement, player: Player);
    /**
     * Ensure all required UI elements exist
     */
    ensureElementsExist(): void;
    /**
     * Update the display with current player stats
     * @param gameTime - Current game time in ms
     */
    update(gameTime: number): void;
    /**
     * Format time in mm:ss format
     * @param ms - Time in milliseconds
     * @returns Formatted time string
     */
    formatTime(ms: number): string;
    /**
     * Reset the stats display
     */
    reset(): void;
}
export default StatsDisplay;
