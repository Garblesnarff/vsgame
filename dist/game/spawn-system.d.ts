import { Enemy } from "../entities/enemy";
/**
 * Enemy spawn system
 * Manages the spawning of enemies based on game time and player level
 */
export declare class SpawnSystem {
    gameContainer: HTMLElement;
    lastSpawnTime: number;
    baseSpawnRate: number;
    currentSpawnRate: number;
    /**
     * Create a new spawn system
     * @param gameContainer - DOM element for the game container
     */
    constructor(gameContainer: HTMLElement);
    /**
     * Update the spawn system
     * @param gameTime - Current game time
     * @param playerLevel - Current player level
     * @returns Newly spawned enemy or null
     */
    update(gameTime: number, playerLevel: number): Enemy | null;
    /**
     * Spawn a new enemy
     * @param playerLevel - Current player level
     * @returns Newly spawned enemy
     */
    spawnEnemy(playerLevel: number): Enemy;
    /**
     * Reset the spawn system
     */
    reset(): void;
}
export default SpawnSystem;
