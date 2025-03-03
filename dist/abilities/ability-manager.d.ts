import { Ability } from "./ability-base";
import { Player } from "../entities/player";
import { Enemy } from "../entities/enemy";
/**
 * Manages all player abilities
 */
export declare class AbilityManager {
    player: Player;
    abilities: Map<string, Ability>;
    /**
     * Create a new ability manager
     * @param player - The player that owns these abilities
     */
    constructor(player: Player);
    /**
     * Initialize all abilities
     */
    initializeAbilities(): void;
    /**
     * Initialize ability UI elements
     */
    initializeUI(): void;
    /**
     * Get an ability by name
     * @param name - Name of the ability
     * @returns The ability object or undefined if not found
     */
    getAbility(name: string): Ability | undefined;
    /**
     * Update all abilities
     * @param deltaTime - Time since last update
     * @param enemies - Array of enemies in the game
     */
    update(deltaTime: number, enemies?: Enemy[]): void;
    /**
     * Check if abilities can be unlocked based on player level
     */
    checkUnlockableAbilities(): void;
    /**
     * Unlock an ability
     * @param abilityName - Name of the ability to unlock
     * @returns Whether the unlock was successful
     */
    unlockAbility(abilityName: string): boolean;
    /**
     * Upgrade an ability
     * @param abilityName - Name of the ability to upgrade
     * @returns Whether the upgrade was successful
     */
    upgradeAbility(abilityName: string): boolean;
    /**
     * Reset all abilities to initial state
     */
    reset(): void;
}
export default AbilityManager;
