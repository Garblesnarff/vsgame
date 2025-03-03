import { AbilityManager } from "../abilities/ability-manager";
import { Game } from "../game/game";
/**
 * Interface for auto attack configuration
 */
interface AutoAttack {
    enabled: boolean;
    cooldown: number;
    lastFired: number;
    damage: number;
    range: number;
    level: number;
    maxLevel: number;
}
/**
 * Interface for projectile creation options
 */
interface ProjectileOptions {
    x: number;
    y: number;
    vx: number;
    vy: number;
    damage: number;
    isAutoAttack: boolean;
    isBloodLance?: boolean;
    pierce?: number;
    pierceCount?: number;
    healAmount?: number;
    hitEnemies?: Set<string>;
    className?: string;
    angle?: number;
}
/**
 * Player class representing the main character in the game
 */
export declare class Player {
    gameContainer: HTMLElement;
    game: Game | null;
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    health: number;
    maxHealth: number;
    energy: number;
    maxEnergy: number;
    energyRegen: number;
    level: number;
    kills: number;
    killsToNextLevel: number;
    skillPoints: number;
    isAlive: boolean;
    isInvulnerable: boolean;
    showingSkillMenu: boolean;
    lastAttack: number;
    attackCooldown: number;
    projectileSpeed: number;
    autoAttack: AutoAttack;
    abilityManager: AbilityManager;
    element: HTMLElement | null;
    /**
     * Create a new player
     * @param gameContainer - DOM element containing the game
     * @param game - Optional Game instance reference
     */
    constructor(gameContainer: HTMLElement, game?: Game | null);
    /**
     * Updates player position based on input
     * @param keys - Current state of keyboard keys
     */
    move(keys: Record<string, boolean>): void;
    /**
     * Updates the DOM element position
     */
    updatePosition(): void;
    /**
     * Regenerates energy over time
     * @param deltaTime - Time since last update in milliseconds
     */
    regenerateEnergy(deltaTime: number): void;
    /**
     * Player takes damage from an enemy
     * @param amount - Damage amount
     * @returns Whether damage was actually applied (not invulnerable)
     */
    takeDamage(amount: number): boolean;
    /**
     * Heals the player
     * @param amount - Healing amount
     */
    heal(amount: number): void;
    /**
     * Fires a projectile toward a target
     * @param targetX - Target X coordinate
     * @param targetY - Target Y coordinate
     * @param createProjectile - Function to create a projectile
     * @returns Whether the projectile was fired
     */
    fireProjectile(targetX: number, targetY: number, createProjectile: (options: ProjectileOptions) => void): boolean;
    /**
     * Fires an auto-attack projectile toward a target
     * @param enemy - Target enemy
     * @param createProjectile - Function to create a projectile
     * @returns Whether the projectile was fired
     */
    fireAutoProjectile(enemy: any, createProjectile: (options: ProjectileOptions) => void): boolean;
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
     * Make the player temporarily invulnerable
     * @param duration - Duration in milliseconds
     */
    setInvulnerable(duration: number): void;
    /**
     * Clean up player resources
     */
    destroy(): void;
}
export default Player;
