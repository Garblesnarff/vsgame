import { Ability } from "./ability-base";
import { Player } from "../entities/player";
import { Enemy } from "../entities/enemy";
/**
 * Night Shield ability - Create a shield that absorbs damage and explodes
 */
export declare class NightShield extends Ability {
    shieldAmount: number;
    duration: number;
    explosionDamage: number;
    explosionRange: number;
    currentShield: number;
    shieldElement: HTMLElement | null;
    shieldHealthBar: HTMLElement | null;
    shieldIndicator: HTMLElement | null;
    activeSince: number;
    timerHandle: number | null;
    /**
     * Create a new Night Shield ability
     * @param player - The player that owns this ability
     * @param config - Configuration for the ability
     */
    constructor(player: Player, config: any);
    /**
     * Use the night shield ability
     * @returns Whether the ability was used
     */
    use(): boolean;
    /**
     * Create shield visual effect
     */
    createShieldVisual(): void;
    /**
     * Update the shield position and health display
     * @param deltaTime - Time since last update
     * @param enemies - Array of enemies (not used directly but required by base class)
     */
    update(deltaTime: number, enemies?: Enemy[]): void;
    /**
     * Update the shield health bar display
     */
    updateShieldHealthBar(): void;
    /**
     * Absorb damage with the shield
     * @param amount - Damage amount to absorb
     * @returns Whether damage was absorbed
     */
    absorbDamage(amount: number): boolean;
    /**
     * Create visual effect for shield absorbing damage
     */
    createShieldAbsorptionEffect(): void;
    /**
     * Make the shield explode
     */
    explodeShield(): void;
    /**
     * Damage all enemies within the explosion range
     */
    damageEnemiesInRange(): void;
    /**
     * Create explosion visual effect
     */
    createExplosionEffect(): void;
    /**
     * Create fallback explosion effect if UI manager isn't available
     */
    createFallbackExplosionEffect(): void;
    /**
     * Deactivate the shield
     */
    deactivateShield(): void;
    /**
     * Get shield amount scaled by ability level
     * @returns Scaled shield amount
     */
    getScaledShieldAmount(): number;
    /**
     * Get explosion damage scaled by ability level
     * @returns Scaled explosion damage
     */
    getScaledExplosionDamage(): number;
    /**
     * Clean up ability resources
     */
    destroy(): void;
    /**
     * Unlock the ability
     * @returns Whether the unlock was successful
     */
    unlock(): boolean;
}
export default NightShield;
