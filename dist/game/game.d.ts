import { Player } from "../entities/player.js";
import { Projectile, ProjectileOptions } from "../entities/projectile.js";
import { Enemy } from "../entities/enemy.js";
import { GameLoop } from "./game-loop.js";
import { InputHandler } from "./input-handler.js";
import { SpawnSystem } from "./spawn-system.js";
import { UIManager } from "../ui/ui-manager.js";
import { ParticleSystem } from "./particle-system.js";
import { LevelSystem } from "./level-system.js";
import { GameStateManager } from "./state-manager.js";
/**
 * Main Game class that orchestrates all game systems
 */
export declare class Game {
    gameContainer: HTMLElement;
    gameTime: number;
    enemies: Enemy[];
    projectiles: Projectile[];
    gameLoop: GameLoop;
    inputHandler: InputHandler;
    spawnSystem: SpawnSystem;
    particleSystem: ParticleSystem;
    uiManager: UIManager;
    stateManager: GameStateManager;
    levelSystem: LevelSystem;
    player: Player;
    /**
     * Create a new game
     * @param gameContainer - DOM element containing the game
     */
    constructor(gameContainer: HTMLElement);
    /**
     * Initialize game event listeners
     */
    initializeEventListeners(): void;
    /**
     * Start the game
     */
    start(): void;
    /**
     * Main update function called each frame
     * @param deltaTime - Time since last update in ms
     */
    update(deltaTime: number): void;
    /**
     * Update auto-attack logic
     */
    updateAutoAttack(): void;
    /**
     * Update enemy movement and check for collisions
     * @param deltaTime - Time since last update in ms
     */
    updateEnemies(deltaTime: number): void;
    /**
     * Update projectile movement and check for collisions
     */
    updateProjectiles(): void;
    /**
     * Create a new projectile
     * @param options - Projectile options
     * @returns The created projectile
     */
    createProjectile(options: ProjectileOptions): Projectile;
    /**
     * Handle player level up
     */
    handleLevelUp(): void;
    /**
     * Game over logic
     */
    gameOver(): void;
    /**
     * Restart the game
     */
    restart(): void;
    /**
     * Clean up all game entities
     */
    cleanupEntities(): void;
    /**
     * Toggle the skill menu
     */
    toggleSkillMenu(): void;
    /**
     * Toggle game pause
     */
    togglePause(): void;
    /**
     * Upgrade a skill
     * @param skillId - ID of the skill to upgrade
     */
    upgradeSkill(skillId: string): void;
    /**
     * Check if the game is currently running
     * @returns Whether the game is running
     */
    isRunning(): boolean;
    /**
     * Get the current game state
     * @returns Current game state
     */
    getState(): GameState;
}
import { GameState } from "../types/game-types.js";
export default Game;
