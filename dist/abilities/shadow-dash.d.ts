import { Ability } from "./ability-base";
import { Player } from "../entities/player";
import { Enemy } from "../entities/enemy";
/**
 * Shadow Dash ability - Dash through enemies, becoming briefly invulnerable
 */
export declare class ShadowDash extends Ability {
    distance: number;
    damage: number;
    invulnerabilityTime: number;
    /**
     * Create a new Shadow Dash ability
     * @param player - The player that owns this ability
     * @param config - Configuration for the ability
     */
    constructor(player: Player, config: any);
    /**
     * Use the shadow dash ability
     * @returns Whether the ability was used
     */
    use(): boolean;
    /**
     * Get current movement keys from the game input handler
     * @returns Keys state { up, down, left, right }
     */
    getMovementKeys(): {
        up: boolean;
        down: boolean;
        left: boolean;
        right: boolean;
    };
    /**
     * Create shadow trail effect
     * @param dashX - X component of dash vector
     * @param dashY - Y component of dash vector
     */
    createShadowTrail(dashX: number, dashY: number): void;
    /**
     * Damage enemies in the dash path
     * @param dirX - X direction component
     * @param dirY - Y direction component
     * @param dashDistance - Dash distance
     * @param enemies - Array of enemies to check
     */
    damageEnemiesInPath(dirX: number, dirY: number, dashDistance: number, enemies: Enemy[]): void;
    /**
     * Check if an enemy is in the dash path
     * @param enemy - Enemy object
     * @param dirX - X direction component
     * @param dirY - Y direction component
     * @param dashDistance - Dash distance
     * @returns Whether the enemy is in the dash path
     */
    isEnemyInDashPath(enemy: Enemy, dirX: number, dirY: number, dashDistance: number): boolean;
    /**
     * Get distance scaled by ability level
     * @returns Scaled distance
     */
    getScaledDistance(): number;
    /**
     * Get damage scaled by ability level
     * @returns Scaled damage
     */
    getScaledDamage(): number;
    /**
     * Get invulnerability time scaled by ability level
     * @returns Scaled invulnerability time in ms
     */
    getScaledInvulnerabilityTime(): number;
}
export default ShadowDash;
