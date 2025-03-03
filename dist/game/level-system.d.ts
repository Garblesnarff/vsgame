import { Player } from "../entities/player";
/**
 * Type for level up callback function
 */
type LevelUpCallback = (level: number) => void;
/**
 * Level System
 * Manages player level progression, experience, and level-up events
 */
export declare class LevelSystem {
    player: Player;
    level: number;
    kills: number;
    killsToNextLevel: number;
    levelUpCallbacks: LevelUpCallback[];
    /**
     * Create a new level system
     * @param player - The player associated with this level system
     */
    constructor(player: Player);
    /**
     * Add a kill to the player's count and check for level up
     * @returns Whether the player leveled up
     */
    addKill(): boolean;
    /**
     * Level up the player
     */
    levelUp(): void;
    /**
     * Register a callback to be called when the player levels up
     * @param callback - Function to call on level up, receives level as parameter
     */
    onLevelUp(callback: LevelUpCallback): void;
    /**
     * Get the current level
     * @returns Current level
     */
    getLevel(): number;
    /**
     * Get the current kills
     * @returns Current kills
     */
    getKills(): number;
    /**
     * Get the kills required for the next level
     * @returns Kills required for next level
     */
    getKillsToNextLevel(): number;
    /**
     * Reset the level system
     */
    reset(): void;
}
export default LevelSystem;
