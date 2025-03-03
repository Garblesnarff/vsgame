import { AbilityManager } from "../abilities/ability-manager";
/**
 * Ability Bar
 * Manages the visual representation of player abilities in the UI
 */
export declare class AbilityBar {
    gameContainer: HTMLElement;
    abilityManager: AbilityManager;
    container: HTMLElement | null;
    abilityElements: Map<string, {
        element: HTMLElement;
        cooldownElement: HTMLElement | null;
        levelElement: HTMLElement | null;
    }>;
    /**
     * Create a new ability bar
     * @param gameContainer - DOM element for the game container
     * @param abilityManager - Ability manager instance
     */
    constructor(gameContainer: HTMLElement, abilityManager: AbilityManager);
    /**
     * Initialize the ability bar with the player's abilities
     */
    initialize(): void;
    /**
     * Add an ability to the ability bar
     * @param abilityId - ID of the ability
     * @param icon - Icon to display
     * @param key - Hotkey
     * @returns The created ability element or null if creation failed
     */
    addAbility(abilityId: string, icon: string, key: string): HTMLElement | null;
    /**
     * Remove an ability from the ability bar
     * @param abilityId - ID of the ability to remove
     */
    removeAbility(abilityId: string): void;
    /**
     * Update the ability bar UI (cooldowns, levels, etc.)
     */
    update(): void;
    /**
     * Add an unlocked ability to the bar
     * @param abilityId - ID of the ability
     * @param icon - Icon to display
     * @param key - Hotkey
     */
    addUnlockedAbility(abilityId: string, icon: string, key: string): HTMLElement | null;
    /**
     * Reset the ability bar to its initial state
     */
    reset(): void;
}
export default AbilityBar;
