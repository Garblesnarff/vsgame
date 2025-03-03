import { Ability } from "./ability-base";
import { Player } from "../entities/player";
import { Enemy } from "../entities/enemy";
/**
 * Interface for bat objects
 */
interface Bat {
    x: number;
    y: number;
    vx: number;
    vy: number;
    element: HTMLElement;
}
/**
 * Bat Swarm ability - Release a swarm of bats that damage enemies they touch
 */
export declare class BatSwarm extends Ability {
    count: number;
    damage: number;
    speed: number;
    bats: Bat[];
    /**
     * Create a new Bat Swarm ability
     * @param player - The player that owns this ability
     * @param config - Configuration for the ability
     */
    constructor(player: Player, config: any);
    /**
     * Use the bat swarm ability
     * @returns Whether the ability was used
     */
    use(): boolean;
    /**
     * Create a bat with the given angle
     * @param angle - Direction angle in radians
     */
    createBat(angle: number): void;
    /**
     * Update bat positions and check for collisions
     * @param deltaTime - Time since last update
     * @param enemies - Array of enemy objects
     */
    update(deltaTime: number, enemies?: Enemy[]): void;
    /**
     * Check if a bat is outside the game area
     * @param bat - Bat object
     * @returns Whether the bat is out of bounds
     */
    isBatOutOfBounds(bat: Bat): boolean;
    /**
     * Check if a bat collides with an enemy
     * @param bat - Bat object
     * @param enemy - Enemy object
     * @returns Whether collision occurred
     */
    batCollidesWithEnemy(bat: Bat, enemy: Enemy): boolean;
    /**
     * Remove a bat from the game
     * @param index - Index of the bat to remove
     */
    removeBat(index: number): void;
    /**
     * Get count scaled by ability level
     * @returns Scaled count
     */
    getScaledCount(): number;
    /**
     * Get damage scaled by ability level
     * @returns Scaled damage
     */
    getScaledDamage(): number;
    /**
     * Clean up ability resources
     */
    destroy(): void;
}
export default BatSwarm;
