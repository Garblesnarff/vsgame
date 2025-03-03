import { Enemy } from "./enemy";
/**
 * Interface for projectile options
 */
export interface ProjectileOptions {
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
 * Projectile class for player attacks and abilities
 */
export declare class Projectile {
    gameContainer: HTMLElement;
    element: HTMLElement;
    x: number;
    y: number;
    vx: number;
    vy: number;
    damage: number;
    isAutoAttack: boolean;
    isBloodLance: boolean;
    pierce: number;
    pierceCount: number;
    healAmount: number;
    hitEnemies: Set<string>;
    /**
     * Create a new projectile
     * @param gameContainer - DOM element containing the game
     * @param options - Projectile options
     */
    constructor(gameContainer: HTMLElement, options: ProjectileOptions);
    /**
     * Updates the projectile position
     */
    move(): void;
    /**
     * Updates the DOM element position
     */
    updatePosition(): void;
    /**
     * Checks if projectile is outside the game area
     * @returns Whether projectile is out of bounds
     */
    isOutOfBounds(): boolean;
    /**
     * Checks if projectile hits an enemy
     * @param enemy - Enemy to check collision with
     * @returns Whether collision occurred
     */
    collidesWith(enemy: Enemy): boolean;
    /**
     * Handle hit effects for Blood Lance
     * @param enemy - Enemy that was hit
     * @param healPlayer - Function to heal the player
     * @returns Whether the projectile should be destroyed
     */
    handleBloodLanceHit(enemy: Enemy, healPlayer: (amount: number) => void): boolean;
    /**
     * Clean up projectile resources
     */
    destroy(): void;
}
export default Projectile;
