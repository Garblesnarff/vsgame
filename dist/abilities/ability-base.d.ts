import { Player } from "../entities/player";
import { Enemy } from "../entities/enemy";
/**
 * Configuration options for creating abilities
 */
export interface AbilityConfig {
    name: string;
    description: string;
    key: string;
    cooldown: number;
    energyCost: number;
    level?: number;
    maxLevel?: number;
    unlocked?: boolean;
}
/**
 * Base class for all player abilities
 *
 * This serves as the foundation for all abilities in the game,
 * providing common functionality like cooldowns, energy costs,
 * UI representation, and leveling.
 */
export declare class Ability {
    /**
     * The player that owns this ability
     */
    player: Player;
    /**
     * The name of the ability
     */
    name: string;
    /**
     * Description of what the ability does
     */
    description: string;
    /**
     * Keyboard key associated with the ability
     */
    key: string;
    /**
     * Cooldown time in milliseconds
     */
    cooldown: number;
    /**
     * Energy cost to use the ability
     */
    energyCost: number;
    /**
     * Timestamp of when the ability was last used
     */
    lastUsed: number;
    /**
     * Current ability level
     */
    level: number;
    /**
     * Maximum level for this ability
     */
    maxLevel: number;
    /**
     * Whether the ability is unlocked
     */
    unlocked: boolean;
    /**
     * Whether the ability is currently active
     */
    active: boolean;
    /**
     * Visual effect element for the ability
     */
    visualEffect: HTMLElement | null;
    /**
     * UI element for the ability
     */
    element: HTMLElement | null;
    /**
     * UI element for the cooldown display
     */
    cooldownElement: HTMLElement | null;
    /**
     * Additional properties that may be defined in subclasses
     */
    [key: string]: any;
    /**
     * Create a new ability
     *
     * @param player - The player that owns this ability
     * @param config - Configuration for the ability
     */
    constructor(player: Player, config: AbilityConfig);
    /**
     * Check if the ability can be used
     *
     * Verifies that:
     * 1. The ability is unlocked
     * 2. The cooldown has expired
     * 3. The player has enough energy
     * 4. The ability isn't already active
     *
     * @returns Whether the ability can be used
     */
    canUse(): boolean;
    /**
     * Use the ability
     *
     * This is the base implementation that:
     * 1. Checks if the ability can be used
     * 2. Consumes energy
     * 3. Sets the last used timestamp
     * 4. Emits the ability use event
     *
     * Subclasses should override this to implement specific ability behaviors
     * but should call super.use() first to handle these common operations.
     *
     * @returns Whether the ability was successfully used
     */
    use(): boolean;
    /**
     * Update the ability's cooldown display in the UI
     */
    updateCooldownDisplay(): void;
    /**
     * Initialize the UI element for this ability
     *
     * Creates and configures the DOM elements needed to display this ability
     * in the UI, including the icon, key binding, level indicator, and cooldown display.
     *
     * @param containerId - ID of the container element
     * @param abilityId - ID to use for this ability's element
     * @param icon - Icon to display (emoji or character)
     */
    initializeUI(containerId: string, abilityId: string, icon: string): void;
    /**
     * Update the ability's level display in the UI
     */
    updateLevelDisplay(): void;
    /**
     * Clean up ability resources
     *
     * Removes any DOM elements or other resources created by this ability.
     * Should be called when the ability is no longer needed or the game is reset.
     */
    destroy(): void;
    /**
     * Check if the ability is currently active
     *
     * @returns Whether the ability is active
     */
    isActive(): boolean;
    /**
     * Upgrade the ability to the next level
     *
     * Increases the ability's level and updates the UI to reflect the change.
     * Abilities typically gain improved effects at higher levels.
     *
     * @returns Whether the upgrade was successful
     */
    upgrade(): boolean;
    /**
     * Unlock the ability
     *
     * Makes the ability available for use. Some abilities start locked
     * and must be unlocked through progression.
     *
     * @returns Whether the unlock was successful
     */
    unlock(): boolean;
    /**
     * Update the ability state
     *
     * This method is meant to be overridden by subclasses to implement
     * the specific update logic for each ability type.
     *
     * @param deltaTime - Time in milliseconds since the last update
     * @param enemies - List of enemies in the game (optional)
     */
    update(deltaTime: number, enemies?: Enemy[]): void;
}
export default Ability;
