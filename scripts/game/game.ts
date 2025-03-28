import { Player } from "../entities/player";
import { Projectile, ProjectileOptions } from "../entities/projectile";
import { Enemy } from "../entities/enemies/base-enemy";
import { VampireHunter } from "../entities/enemies/vampire-hunter";
import { GameLoop } from "./game-loop";
import { InputHandler } from "./input-handler";
import { SpawnSystem } from "./spawn-system";
import { UIManager } from "../ui/ui-manager";
import { ParticleSystem } from "./particle-system";
import { LevelSystem } from "./level-system";
import { GameStateManager, defaultStateHandlers } from "./state-manager";
import { GameEvents, EVENTS } from "../utils/event-system";
import CONFIG from "../config";
import { GameState } from "../types/game-types";
import PassiveSkillMenu from "../ui/PassiveSkillMenu";

/**
 * Main Game class that orchestrates all game systems
 */
export class Game {
  // Container
  gameContainer: HTMLElement;

  // Game state
  gameTime: number;
  enemies: Enemy[];
  projectiles: Projectile[];

  // Game systems
  gameLoop: GameLoop;
  inputHandler: InputHandler;
  spawnSystem: SpawnSystem;
  particleSystem: ParticleSystem;
  uiManager: UIManager;
  stateManager: GameStateManager;
  levelSystem: LevelSystem;
  passiveSkillMenu: PassiveSkillMenu;

  // Player
  player: Player;
  availableKillPoints: number = 0;

  /**
   * Create a new game
   * @param gameContainer - DOM element containing the game
   */
  constructor(gameContainer: HTMLElement) {
    this.gameContainer = gameContainer;

    // Initialize game state
    this.gameTime = 0;
    this.enemies = [];
    this.projectiles = [];

    // Create game systems
    this.gameLoop = new GameLoop();
    this.inputHandler = new InputHandler(this);
    this.spawnSystem = new SpawnSystem(this.gameContainer);
    // Set game reference for the spawn system so it can add enemies
    this.spawnSystem.setGameReference(this);
    this.particleSystem = new ParticleSystem(this.gameContainer);

    // Create player
    this.player = new Player(this.gameContainer, this);

    // Create level system
    this.levelSystem = new LevelSystem(this.player);
    this.player.setLevelSystem(this.levelSystem);
    // Create state manager
    this.stateManager = new GameStateManager(this);
    this.stateManager.registerStates(defaultStateHandlers);

    // Register level up handler
    this.levelSystem.onLevelUp((_level) => {
      this.player.skillPoints++;
      this.handleLevelUp();
    });

    // Create UI manager (after player is created)
    this.uiManager = new UIManager(this);

    // Create passive skill menu
    this.passiveSkillMenu = new PassiveSkillMenu(this);

    // Initialize ability UI
    this.player.abilityManager.initializeUI();

    // Initialize event listeners
    this.initializeEventListeners();
  }

  /**
   * Initialize game event listeners
   */
  initializeEventListeners(): void {
    // Listen for game state events
    GameEvents.once(EVENTS.GAME_INIT, () => {
      console.log("Game initialized");
    });

    // Emit game initialized event
    GameEvents.emit(EVENTS.GAME_INIT, this);
  }

  /**
   * Start the game
   */
  start(): void {
    // Start in the playing state
    this.stateManager.changeState(GameState.PLAYING);

    // Start the game loop
    this.gameLoop.start(this.update.bind(this));

    // Emit game started event
    GameEvents.emit(EVENTS.GAME_START, this);
  }

  /**
   * Main update function called each frame
   * @param deltaTime - Time since last update in ms
   */
  update(deltaTime: number): void {
    // Update game time
    this.gameTime += deltaTime;

    // Update player position based on input
    this.player.move(this.inputHandler.getKeys());

    // Update player energy
    this.player.regenerateEnergy(deltaTime);

    // Update abilities
    this.player.abilityManager.update(deltaTime, this.enemies);

    // Spawn enemies
    const playerLevel = this.player?.level ?? 1; // Handle potentially undefined level
    const newEnemy = this.spawnSystem.update(this.gameTime, playerLevel);
    if (newEnemy) {
      this.enemies.push(newEnemy);

      // Emit enemy spawn event
      GameEvents.emit(EVENTS.ENEMY_SPAWN, newEnemy);
    }

    // Auto-attack
    this.updateAutoAttack();

    // Update enemies
    this.updateEnemies(deltaTime);

    // Update projectiles
    this.updateProjectiles();

    // Update particles
    this.particleSystem.update();

    // Update UI
    this.uiManager.update();

    // Update state manager
    this.stateManager.update(deltaTime);
  }

  /**
   * Update auto-attack logic
   */
  updateAutoAttack(): void {
    if (!this.player.autoAttack?.enabled) {
      return;
    }

    const now = Date.now();
    const timeSinceLastFired = now - (this.player.autoAttack?.lastFired ?? 0);
    const cooldown = this.player.autoAttack?.cooldown ?? Infinity;

    if (timeSinceLastFired < cooldown) {

      return;
    }

    // Find the closest enemy within range
    let closestEnemy: Enemy | null = null;
    let closestDistance = Infinity;

    for (const enemy of this.enemies) {
      const dx =
        enemy.x + enemy.width / 2 - (this.player.x + this.player.width / 2);
      const dy =
        enemy.y + enemy.height / 2 - (this.player.y + this.player.height / 2);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (
        distance < (this.player.autoAttack?.range ?? 0) &&
        distance < closestDistance
      ) {
        closestEnemy = enemy;
        closestDistance = distance;
      }
    }

    // If there's an enemy in range, fire at it
    if (closestEnemy) {
      this.player.fireAutoProjectile(
        closestEnemy,
        this.createProjectile.bind(this)
      );
      this.player.autoAttack.lastFired = now;
    }
  }

  /**
   * Update enemy movement and check for collisions
   * @param _deltaTime - Time since last update in ms
   */
  updateEnemies(_deltaTime: number): void {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];

      // Move enemy towards player
      // Special handling for VampireHunter to pass createProjectile function
      if (enemy instanceof VampireHunter) {
        enemy.moveTowardsPlayer(this.player, this.createProjectile.bind(this));
      } else {
        enemy.moveTowardsPlayer(this.player);
      }

      // Check for Blood Drain ability affecting this enemy
      const bloodDrain = this.player.abilityManager.getAbility("bloodDrain");
      if (bloodDrain && bloodDrain.isActive()) {
        // Blood Drain is handled in the ability's update method
      }

      // Check if enemy is far out of bounds (cleanup)
      if (enemy.isOutOfBounds()) {
        enemy.destroy();
        this.enemies.splice(i, 1);
        continue;
      }

      // Check collision with player
      if (
        this.player.isAlive &&
        !this.player.isInvulnerable &&
        enemy.collidesWithPlayer(this.player)
      ) {
        // Calculate damage amount
        const damageAmount = enemy.damage;

        // Apply damage to player
        if (this.player.takeDamage(damageAmount)) {
          // Create blood particles if damage was applied
          this.particleSystem.createBloodParticles(
            this.player.x + this.player.width / 2,
            this.player.y + this.player.height / 2,
            10
          );

          // Check if player died
          if (!this.player.isAlive) {
            this.gameOver();
          }
        }

        // Push enemy back
        const dx =
          enemy.x + enemy.width / 2 - (this.player.x + this.player.width / 2);
        const dy =
          enemy.y + enemy.height / 2 - (this.player.y + this.player.height / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);

        enemy.x += (dx / dist) * 10;
        enemy.y += (dy / dist) * 10;
        enemy.updatePosition();
      }
    }
  }

  /**
   * Update projectile movement and check for collisions
   */
  updateProjectiles(): void {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];

      // Move projectile
      projectile.move();

      // Check if projectile is out of bounds
      if (projectile.isOutOfBounds()) {
        projectile.destroy();
        this.projectiles.splice(i, 1);
        continue;
      }

      let shouldRemoveProjectile = false;

      // Handle enemy projectiles (they only collide with the player)
      if (projectile.isEnemyProjectile) {
        // Check collision with player
        if (
          this.player.isAlive &&
          !this.player.isInvulnerable &&
          projectile.collidesWithPlayer(this.player)
        ) {
          // Create hit effect
          this.particleSystem.createBloodParticles(
            projectile.x,
            projectile.y,
            5
          );

          // Apply damage to player
          this.player.takeDamage(projectile.damage);

          // Remove projectile
          shouldRemoveProjectile = true;
        }
      } 
      // Handle player projectiles (they only collide with enemies)
      else {
        // Check collision with enemies
        for (let j = this.enemies.length - 1; j >= 0; j--) {
          const enemy = this.enemies[j];

          if (projectile.collidesWith(enemy)) {
            // Create blood particles
            this.particleSystem.createBloodParticles(
              projectile.x,
              projectile.y,
              5
            );

            // Apply damage to enemy
            if (
              enemy.takeDamage(
                projectile.damage,
                this.particleSystem.createBloodParticles.bind(this.particleSystem),
                projectile.isBloodLance ? 'bloodLance' : undefined
              )
            ) {
              // Enemy died
              enemy.destroy();
              this.enemies.splice(j, 1);

              // Emit enemy death event
              GameEvents.emit(EVENTS.ENEMY_DEATH, enemy);

              // Add kill to player and check for level up
              if (this.levelSystem.addKill()) {
                // Level up was handled by the callback
              }
            } else {
              // Emit enemy damage event
              GameEvents.emit(EVENTS.ENEMY_DAMAGE, enemy, projectile.damage);
            }

            // Handle Blood Lance special behavior
            if (projectile.isBloodLance) {
              shouldRemoveProjectile = projectile.handleBloodLanceHit(
                enemy,
                this.player.heal.bind(this.player)
              );
            } else {
              // Regular projectile or auto-attack - remove after hitting
              shouldRemoveProjectile = true;
            }

            // Break loop for non-piercing projectiles
            if (shouldRemoveProjectile && !projectile.isBloodLance) {
              break;
            }
          }
        }
      }

      // Remove projectile if needed
      if (shouldRemoveProjectile) {
        projectile.destroy();
        this.projectiles.splice(i, 1);
      }
    }
  }

  /**
   * Create a new projectile
   * @param options - Projectile options
   * @returns The created projectile
   */
  createProjectile(options: ProjectileOptions): Projectile {
    const projectile = new Projectile(this.gameContainer, options);
    this.projectiles.push(projectile);
    return projectile;
  }

  /**
   * Handle player level up
   */
  handleLevelUp(): void {
    // Show level up notification
    this.uiManager.showLevelUp();

    // Update spawn rate
    const playerLevel = this.player.level;
    this.spawnSystem.currentSpawnRate = Math.max(
      500,
      CONFIG.SPAWN_RATE - playerLevel * 200
    );

    // Check for unlockable abilities
    this.player.abilityManager.checkUnlockableAbilities();
    
    // Reset brute spawn count and update for the new level
    this.spawnSystem.updateForLevelChange(playerLevel);
    
    // Debug info
    console.debug(`Level up handled. New level: ${playerLevel}`);
    console.debug(`Blood Lance unlock level: ${CONFIG.ABILITIES.BLOOD_LANCE.UNLOCK_LEVEL}`);
    console.debug(`Night Shield unlock level: ${CONFIG.ABILITIES.NIGHT_SHIELD.UNLOCK_LEVEL}`);

    // Also trigger skill menu to update in case it's open
    if (this.player.showingSkillMenu && this.uiManager.skillMenu) {
      this.uiManager.skillMenu.update();
    }

    // Heal player slightly
    this.player.heal(20);
  }

  /**
   * Game over logic
   */
  gameOver(): void {
    this.gameLoop.stop();

    // Store kills
    this.availableKillPoints = this.levelSystem.kills;

    // Change to game over state
    this.stateManager.changeState(GameState.GAME_OVER);

    // Open passive skill menu
    this.passiveSkillMenu.open();

    // Emit game over event
    GameEvents.emit(EVENTS.GAME_OVER, this);
  }

  /**
   * Restart the game
   */
  restart(): void {
    // Deactivate all abilities before cleanup
    if (this.player && this.player.abilityManager) {
      const abilities = this.player.abilityManager.abilities;
      for (const ability of abilities.values()) {
        if (ability.isActive()) {
          if (typeof ability.deactivate === 'function') {
            ability.deactivate();
          } else {
            ability.active = false;
          }
        }
      }
    }

    // Clean up existing entities
    this.cleanupEntities();

    // Reset player
    if (this.player) {
      this.player.destroy();
    }
    this.player = new Player(this.gameContainer, this);

    // Reset level system
    this.levelSystem = new LevelSystem(this.player);

    // Register level up handler for the new level system
    this.levelSystem.onLevelUp((_level) => {
      this.player.skillPoints++;
      this.handleLevelUp();
    });

    // Apply purchased passive skills
    this.applyPurchasedPassiveSkills();

    // Initialize player abilities
    this.player.abilityManager.initializeUI();

    // Reset game systems
    this.gameTime = 0;
    this.spawnSystem.reset();
    this.particleSystem.reset();

    // Update UI manager with new player reference
    if (this.uiManager) {
      this.uiManager.player = this.player;
      
      // Update stats display with new player reference
      if (this.uiManager.statsDisplay) {
        this.uiManager.statsDisplay.player = this.player;
      }
      
      // Update ability bar with new ability manager
      if (this.uiManager.abilityBar) {
        this.uiManager.abilityBar.abilityManager = this.player.abilityManager;
      }
    }

    // Reset UI
    this.uiManager.reset();

    // Reset passive skill menu
    this.passiveSkillMenu.reset();

    // Force an immediate UI update
    this.uiManager.update();

    // Start game loop
    this.gameLoop.start(this.update.bind(this));

    // Emit game restart event
    GameEvents.emit(EVENTS.GAME_RESTART, this);
  }

  /**
   * Apply purchased passive skills to the player
   */
  applyPurchasedPassiveSkills(): void {
    // TODO: Implement this method to apply the purchased passive skills to the player
    // This will likely involve reading the purchased skills from the passiveSkillMenu
    // and modifying the player's stats accordingly.
  }

  /**
   * Toggle the skill menu
   */
  toggleSkillMenu(): void {
    this.uiManager.toggleSkillMenu();
  }

  /**
   * Toggle game pause
   */
  togglePause(): void {
    if (this.player.showingSkillMenu) {
      // Don't toggle pause if skill menu is open
      return;
    }

    this.gameLoop.togglePause(this.gameContainer);

    // Emit appropriate event
    if (this.gameLoop.gamePaused) {
      GameEvents.emit(EVENTS.GAME_PAUSE, this);
    } else {
      GameEvents.emit(EVENTS.GAME_RESUME, this);
    }
  }

  /**
   * Upgrade a skill
   * @param skillId - ID of the skill to upgrade
   */
  upgradeSkill(skillId: string): void {
    // Check if player has skill points
    if ((this.player.skillPoints ?? 0) <= 0) {
      return;
    }

    let pointCost = CONFIG.UI.SKILL_MENU.UPGRADE_COST;
    let upgraded = false;

    // Handle different skills
    if (skillId === "autoAttack") {
      // Auto attack upgrade
      const autoAttack = this.player.autoAttack;
      if (autoAttack && autoAttack.level < autoAttack.maxLevel) {
        autoAttack.level++;
        autoAttack.damage += 10; // +10 damage per level
        autoAttack.cooldown = Math.max(
          300,
          autoAttack.cooldown - 100
        ); // -100ms cooldown (min 300ms)
        autoAttack.range += 30; // +30 range per level
        upgraded = true;
      }
    } else if (skillId === "bloodLance") {
      // Blood Lance unlock/upgrade
      const bloodLance = this.player.abilityManager.getAbility("bloodLance");
      const playerLevel = this.player?.level ?? 0;

      if (
        bloodLance &&
        !bloodLance.unlocked &&
        playerLevel >= CONFIG.ABILITIES.BLOOD_LANCE.UNLOCK_LEVEL
      ) {
        // Unlock ability
        pointCost = CONFIG.UI.SKILL_MENU.BLOOD_LANCE_UNLOCK_COST;
        upgraded = this.player.abilityManager.unlockAbility("bloodLance");
        
        // No UI initialization here - handled by AbilityManager
      } else if (bloodLance && bloodLance.unlocked) {
        // Upgrade ability
        upgraded = this.player.abilityManager.upgradeAbility("bloodLance");
      }
    } else if (skillId === "nightShield") {
      // Night Shield unlock/upgrade
      const nightShield = this.player.abilityManager.getAbility("nightShield");
      const playerLevel = this.player?.level ?? 0;

      if (
        nightShield &&
        !nightShield.unlocked &&
        playerLevel >= CONFIG.ABILITIES.NIGHT_SHIELD.UNLOCK_LEVEL
      ) {
        // Unlock ability
        pointCost = CONFIG.UI.SKILL_MENU.NIGHT_SHIELD_UNLOCK_COST;
        upgraded = this.player.abilityManager.unlockAbility("nightShield");
        
        // No UI initialization here - handled by AbilityManager
      } else if (nightShield && nightShield.unlocked) {
        // Upgrade ability
        upgraded = this.player.abilityManager.upgradeAbility("nightShield");
      }
    } else {
      // Regular ability upgrade
      upgraded = this.player.abilityManager.upgradeAbility(skillId);
    }

    // Deduct skill points if upgrade was successful
    if (upgraded) {
      this.player.skillPoints -= pointCost;

      // Emit ability upgraded event
      GameEvents.emit(EVENTS.ABILITY_UPGRADE, skillId, this.player);
    }
  }

  /**
   * Check if the game is currently running
   * @returns Whether the game is running
   */
  isRunning(): boolean {
    return this.gameLoop.gameRunning;
  }

  /**
   * Get the current game state
   * @returns Current game state
   */
  getState(): GameState {
    return this.stateManager.getCurrentState();
  }

   /**
   * Clean up all game entities
   */
  cleanupEntities(): void {
    // Clean up enemies
    for (const enemy of this.enemies) {
      enemy.destroy();
    }
    this.enemies = [];

    // Clean up projectiles
    for (const projectile of this.projectiles) {
      projectile.destroy();
    }
    this.projectiles = [];

    // Clean up particles
    this.particleSystem.reset();

    // Clean up any DOM elements that might have been missed
    const bloodNovas = document.querySelectorAll('.blood-nova');
    bloodNovas.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });

    const bloodDrainAOEs = document.querySelectorAll('.blood-drain-aoe');
    bloodDrainAOEs.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });

    const bats = document.querySelectorAll('.bat');
    bats.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });

    const shadowTrails = document.querySelectorAll('.shadow-trail');
    shadowTrails.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });

    const bloodParticles = document.querySelectorAll('.blood-particle');
    bloodParticles.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
  }
}

export default Game;
