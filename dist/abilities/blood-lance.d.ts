import { Ability } from "./ability-base";
import { Player } from "../entities/player";
import { Enemy } from "../entities/enemy";
/**
 * Blood Lance ability - Fire a piercing projectile that damages enemies and heals
 */
export declare class BloodLance extends Ability {
    damage: number;
    pierce: number;
    healAmount: number;
    speed: number;
    /**
     * Create a new Blood Lance ability
     * @param player - The player that owns this ability
     * @param config - Configuration for the ability
     */
    constructor(player: Player, config: any);
    /**
     * Use the blood lance ability
     * @returns Whether the ability was used
     */
    use(): boolean;
    /**
     * Find the best target for the lance
     * @returns Target information { angle, targetX, targetY }
     */
    findTarget(): {
        angle: number;
        targetX: number;
        targetY: number;
    };
    /**
     * Find the closest enemy for targeting
     * @returns Closest enemy or null if none found
     */
    findClosestEnemy(): Enemy | null;
    /**
     * Create the blood lance projectile
     * @param angle - Direction angle in radians
     */
    createLance(angle: number): void;
    /**
     * Create a fallback lance if the game's projectile system isn't available
     * @param angle - Direction angle in radians
     */
    createFallbackLance(angle: number): void;
    /**
     * Get damage scaled by ability level
     * @returns Scaled damage
     */
    getScaledDamage(): number;
    /**
     * Get pierce count scaled by ability level
     * @returns Scaled pierce count
     */
    getScaledPierce(): number;
    /**
     * Get healing amount scaled by ability level
     * @returns Scaled healing
     */
    getScaledHealing(): number;
    /**
     * Unlock the ability
     * @returns Whether the unlock was successful
     */
    unlock(): boolean;
}
export default BloodLance;
