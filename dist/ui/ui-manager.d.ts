import { StatsDisplay } from "./stats-display";
import { AbilityBar } from "./ability-bar";
import { SkillMenu } from "./skill-menu";
import { ScreensManager } from "./screens";
import { Game } from "../game/game";
import { Player } from "../entities/player";
/**
 * UI Manager
 * Coordinates all UI components of the game
 */
export declare class UIManager {
    game: Game;
    gameContainer: HTMLElement;
    player: Player;
    statsDisplay: StatsDisplay;
    abilityBar: AbilityBar;
    skillMenu: SkillMenu;
    screensManager: ScreensManager;
    autoAttackToggle: HTMLElement | null;
    /**
     * Create a new UI manager
     * @param game - Game instance
     */
    constructor(game: Game);
    /**
     * Ensure auto-attack toggle element exists
     */
    ensureAutoAttackToggleExists(): void;
    /**
     * Initialize UI event listeners
     */
    initializeEventListeners(): void;
    /**
     * Subscribe to game events
     */
    subscribeToEvents(): void;
    /**
     * Toggle auto-attack
     */
    toggleAutoAttack(): void;
    /**
     * Update the auto-attack toggle display
     */
    updateAutoAttackToggle(): void;
    /**
     * Toggle the skill menu
     */
    toggleSkillMenu(): void;
    /**
     * Show the game over screen
     */
    showGameOver(): void;
    /**
     * Show the level up notification
     */
    showLevelUp(): void;
    /**
     * Update skill points display
     */
    updateSkillPointsDisplay(): void;
    /**
     * Create shield explosion effect
     * @param x - X coordinate
     * @param y - Y coordinate
     * @param range - Explosion range
     */
    createShieldExplosion(x: number, y: number, range: number): void;
    /**
     * Add an unlocked ability to the ability bar
     * @param abilityId - ID of the ability
     * @param icon - Icon to display
     * @param key - Hotkey
     */
    addUnlockedAbility(abilityId: string, icon: string, key: string): void;
    /**
     * Update the UI
     */
    update(): void;
    /**
     * Reset the UI to initial state
     */
    reset(): void;
}
export default UIManager;
