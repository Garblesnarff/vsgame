import { Game } from "../game/game";
/**
 * Skill Menu
 * Manages the skill upgrade/unlock menu UI
 */
export declare class SkillMenu {
    game: Game;
    player: any;
    gameContainer: HTMLElement;
    menuOverlay: HTMLElement | null;
    skillPointsDisplay: HTMLElement | null;
    skillGrid: HTMLElement | null;
    isOpen: boolean;
    /**
     * Create a new skill menu
     * @param game - Game instance
     */
    constructor(game: Game);
    /**
     * Ensure the skill menu elements exist
     */
    ensureMenuExists(): void;
    /**
     * Initialize menu event listeners
     */
    initializeEventListeners(): void;
    /**
     * Create skill cards if they don't exist
     */
    ensureSkillCardsExist(): void;
    /**
     * Create a skill card element
     * @param id - Skill ID
     * @param name - Skill name
     * @param description - Skill description
     * @param effects - Array of effect objects { name, id, value }
     * @param level - Current skill level
     * @param locked - Whether the skill is locked initially
     * @param unlockLevel - Level required to unlock the skill
     */
    createSkillCard(id: string, name: string, description: string, effects: Array<{
        name: string;
        id: string;
        value: string;
    }>, level?: number, locked?: boolean, unlockLevel?: number): void;
    /**
     * Initialize skill upgrade buttons
     */
    initializeUpgradeButtons(): void;
    /**
     * Update skill card levels and values
     */
    update(): void;
    /**
     * Update skill card level pips
     * @param skillId - Skill ID
     * @param level - Current skill level
     */
    updateSkillCardPips(skillId: string, level: number): void;
    /**
     * Update the state of upgrade buttons
     */
    updateUpgradeButtonStates(): void;
    /**
     * Update unlockable ability buttons
     */
    updateUnlockableAbilityButtons(): void;
    /**
     * Toggle the skill menu
     */
    toggle(): void;
    /**
     * Open the skill menu
     */
    open(): void;
    /**
     * Close the skill menu
     */
    close(): void;
    /**
     * Reset the skill menu to initial state
     */
    reset(): void;
}
export default SkillMenu;
