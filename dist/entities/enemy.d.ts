import { Player } from "./player";
/**
 * Type for particle creation callback
 */
type ParticleCreationFunction = (x: number, y: number, count: number) => void;
/**
 * Enemy class representing monsters that attack the player
 */
export declare class Enemy {
    gameContainer: HTMLElement;
    element: HTMLElement;
    healthBarContainer: HTMLElement;
    healthBar: HTMLElement;
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    health: number;
    maxHealth: number;
    damage: number;
    id: string;
    /**
     * Create a new enemy
     * @param gameContainer - DOM element containing the game
     * @param playerLevel - Current level of the player
     */
    constructor(gameContainer: HTMLElement, playerLevel: number);
    /**
     * Sets a random spawn position outside the screen
     */
    setSpawnPosition(): void;
    /**
     * Updates the enemy's position to follow the player
     * @param player - Player object to follow
     */
    moveTowardsPlayer(player: Player): void;
    /**
     * Updates the DOM element position
     */
    updatePosition(): void;
    /**
     * Updates the enemy's health bar display
     */
    updateHealthBar(): void;
    /**
     * Enemy takes damage from a source
     * @param amount - Damage amount
     * @param createParticles - Function to create blood particles (optional)
     * @returns Whether the enemy died
     */
    takeDamage(amount: number, createParticles?: ParticleCreationFunction): boolean;
    /**
     * Checks if enemy collides with player
     * @param player - Player object
     * @returns Whether collision occurred
     */
    collidesWithPlayer(player: Player): boolean;
    /**
     * Checks if enemy position is out of bounds
     * @returns Whether enemy is out of bounds
     */
    isOutOfBounds(): boolean;
    /**
     * Clean up enemy resources
     */
    destroy(): void;
}
export default Enemy;
