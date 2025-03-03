import { Ability } from "./ability-base";
import { Player } from "../entities/player";
import { Enemy } from "../entities/enemy";
/**
 * Blood Drain ability - Drains health from nearby enemies
 */
export declare class BloodDrain extends Ability {
    range: number;
    damage: number;
    healAmount: number;
    duration: number;
    activeSince: number;
    /**
     * Create a new Blood Drain ability
     * @param player - The player that owns this ability
     * @param config - Configuration for the ability
     */
    constructor(player: Player, config: any);
    /**
     * Toggle the blood drain ability
     * @returns Whether the ability state was changed
     */
    use(): boolean;
    /**
     * Activate the blood drain ability
     */
    activate(): void;
    /**
     * Deactivate the blood drain ability
     */
    deactivate(): void;
    /**
     * Update the blood drain effect
     * @param deltaTime - Time since last update in ms
     * @param enemies - Array of enemy objects
     */
    update(deltaTime: number, enemies?: Enemy[]): void;
    /**
     * Process enemies within range of the blood drain
     * @param enemies - Array of enemy objects
     * @param deltaTime - Time since last update in ms
     */
    processEnemies(enemies: Enemy[], deltaTime: number): void;
    /**
     * Get damage scaled by ability level
     * @returns Scaled damage
     */
    getScaledDamage(): number;
    /**
     * Get healing scaled by ability level
     * @returns Scaled healing
     */
    getScaledHealing(): number;
    /**
     * Get range scaled by ability level
     * @returns Scaled range
     */
    getScaledRange(): number;
    /**
     * Upgrade the ability
     * @returns Whether the upgrade was successful
     */
    upgrade(): boolean;
}
export default BloodDrain;
