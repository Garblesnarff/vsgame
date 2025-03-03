import CONFIG from "../config";
import { AbilityManager } from "../abilities/ability-manager";
import { GameEvents, EVENTS } from "../utils/event-system";
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
export class Player {
  // Container and game references
  gameContainer: HTMLElement;
  game: Game | null;

  // Position and dimensions
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;

  // Stats
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  energyRegen: number;

  // Progression
  level: number;
  kills: number;
  killsToNextLevel: number;
  skillPoints: number;

  // States
  isAlive: boolean;
  isInvulnerable: boolean;
  showingSkillMenu: boolean;

  // Attack properties
  lastAttack: number;
  attackCooldown: number;
  projectileSpeed: number;

  // Auto attack settings
  autoAttack: AutoAttack;

  // Abilities
  abilityManager: AbilityManager;

  // DOM element
  element: HTMLElement | null;

  /**
   * Create a new player
   * @param gameContainer - DOM element containing the game
   * @param game - Optional Game instance reference
   */
  constructor(gameContainer: HTMLElement, game: Game | null = null) {
    this.gameContainer = gameContainer;
    this.game = game;

    // Position and dimensions
    this.x = CONFIG.GAME_WIDTH / 2 - CONFIG.PLAYER.WIDTH / 2;
    this.y = CONFIG.GAME_HEIGHT / 2 - CONFIG.PLAYER.HEIGHT / 2;
    this.width = CONFIG.PLAYER.WIDTH;
    this.height = CONFIG.PLAYER.HEIGHT;
    this.speed = CONFIG.PLAYER.SPEED;

    // Stats
    this.health = CONFIG.PLAYER.MAX_HEALTH;
    this.maxHealth = CONFIG.PLAYER.MAX_HEALTH;
    this.energy = CONFIG.PLAYER.MAX_ENERGY;
    this.maxEnergy = CONFIG.PLAYER.MAX_ENERGY;
    this.energyRegen = CONFIG.PLAYER.ENERGY_REGEN;

    // Progression
    this.level = 1;
    this.kills = 0;
    this.killsToNextLevel = CONFIG.LEVEL.KILLS_FOR_LEVELS[1];
    this.skillPoints = 0;

    // States
    this.isAlive = true;
    this.isInvulnerable = false;
    this.showingSkillMenu = false;

    // Attack properties
    this.lastAttack = 0;
    this.attackCooldown = CONFIG.PLAYER.ATTACK_COOLDOWN;
    this.projectileSpeed = CONFIG.PLAYER.PROJECTILE_SPEED;

    // Auto attack settings
    this.autoAttack = {
      enabled: CONFIG.ABILITIES.AUTO_ATTACK.ENABLED,
      cooldown: CONFIG.ABILITIES.AUTO_ATTACK.COOLDOWN,
      lastFired: 0,
      damage: CONFIG.ABILITIES.AUTO_ATTACK.DAMAGE,
      range: CONFIG.ABILITIES.AUTO_ATTACK.RANGE,
      level: 1,
      maxLevel: CONFIG.ABILITIES.AUTO_ATTACK.MAX_LEVEL,
    };

    // Initialize abilities
    this.abilityManager = new AbilityManager(this);

    // Create DOM element
    this.element = document.createElement("div");
    this.element.className = "player";
    this.gameContainer.appendChild(this.element);
    this.updatePosition();
  }

  /**
   * Updates player position based on input
   * @param keys - Current state of keyboard keys
   */
  move(keys: Record<string, boolean>): void {
    if (keys["ArrowUp"] || keys["w"]) {
      this.y = Math.max(0, this.y - this.speed);
    }
    if (keys["ArrowDown"] || keys["s"]) {
      this.y = Math.min(CONFIG.GAME_HEIGHT - this.height, this.y + this.speed);
    }
    if (keys["ArrowLeft"] || keys["a"]) {
      this.x = Math.max(0, this.x - this.speed);
    }
    if (keys["ArrowRight"] || keys["d"]) {
      this.x = Math.min(CONFIG.GAME_WIDTH - this.width, this.x + this.speed);
    }

    this.updatePosition();
  }

  /**
   * Updates the DOM element position
   */
  updatePosition(): void {
    if (this.element) {
      this.element.style.left = this.x + "px";
      this.element.style.top = this.y + "px";
    }
  }

  /**
   * Regenerates energy over time
   * @param deltaTime - Time since last update in milliseconds
   */
  regenerateEnergy(deltaTime: number): void {
    this.energy = Math.min(
      this.maxEnergy,
      this.energy + this.energyRegen * (deltaTime / 1000)
    );
  }

  /**
   * Player takes damage from an enemy
   * @param amount - Damage amount
   * @returns Whether damage was actually applied (not invulnerable)
   */
  takeDamage(amount: number): boolean {
    if (this.isInvulnerable) {
      return false;
    }

    // Check if Night Shield is active
    const nightShield = this.abilityManager.getAbility("nightShield");
    if (
      nightShield &&
      nightShield.isActive() &&
      nightShield.currentShield > 0
    ) {
      return nightShield.absorbDamage(amount);
    }

    this.health -= amount;

    // Emit damage event
    GameEvents.emit(EVENTS.PLAYER_DAMAGE, amount, this);

    if (this.health <= 0) {
      this.health = 0;
      this.isAlive = false;

      // Emit death event
      GameEvents.emit(EVENTS.PLAYER_DEATH, this);
    }

    return true;
  }

  /**
   * Heals the player
   * @param amount - Healing amount
   */
  heal(amount: number): void {
    const oldHealth = this.health;
    this.health = Math.min(this.maxHealth, this.health + amount);

    // Only emit heal event if actually healed
    if (this.health > oldHealth) {
      GameEvents.emit(EVENTS.PLAYER_HEAL, amount, this);
    }
  }

  /**
   * Fires a projectile toward a target
   * @param targetX - Target X coordinate
   * @param targetY - Target Y coordinate
   * @param createProjectile - Function to create a projectile
   * @returns Whether the projectile was fired
   */
  fireProjectile(
    targetX: number,
    targetY: number,
    createProjectile: (options: ProjectileOptions) => void
  ): boolean {
    const now = Date.now();

    // Check cooldown and energy
    if (now - this.lastAttack < this.attackCooldown || this.energy < 10) {
      return false;
    }

    // Use energy
    this.energy -= 10;
    this.lastAttack = now;

    // Calculate direction
    const angle = Math.atan2(
      targetY - (this.y + this.height / 2),
      targetX - (this.x + this.width / 2)
    );

    // Create projectile
    createProjectile({
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
      vx: Math.cos(angle) * this.projectileSpeed,
      vy: Math.sin(angle) * this.projectileSpeed,
      damage: CONFIG.PLAYER.MANUAL_PROJECTILE_DAMAGE,
      isAutoAttack: false,
    });

    return true;
  }

  /**
   * Fires an auto-attack projectile toward a target
   * @param enemy - Target enemy
   * @param createProjectile - Function to create a projectile
   * @returns Whether the projectile was fired
   */
  fireAutoProjectile(
    enemy: any,
    createProjectile: (options: ProjectileOptions) => void
  ): boolean {
    const now = Date.now();

    // Check cooldown
    if (now - this.autoAttack.lastFired < this.autoAttack.cooldown) {
      return false;
    }

    // Calculate direction
    const targetX = enemy.x + enemy.width / 2;
    const targetY = enemy.y + enemy.height / 2;
    const angle = Math.atan2(
      targetY - (this.y + this.height / 2),
      targetX - (this.x + this.width / 2)
    );

    // Create projectile
    createProjectile({
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
      vx: Math.cos(angle) * this.projectileSpeed,
      vy: Math.sin(angle) * this.projectileSpeed,
      damage: this.autoAttack.damage,
      isAutoAttack: true,
    });

    this.autoAttack.lastFired = now;
    return true;
  }

  /**
   * Add a kill to the player's count and check for level up
   * @returns Whether the player leveled up
   */
  addKill(): boolean {
    this.kills++;

    if (
      this.level < CONFIG.LEVEL.KILLS_FOR_LEVELS.length - 1 &&
      this.kills >= CONFIG.LEVEL.KILLS_FOR_LEVELS[this.level]
    ) {
      this.levelUp();
      return true;
    }

    return false;
  }

  /**
   * Level up the player
   */
  levelUp(): void {
    this.level++;
    this.skillPoints++;

    // Update next level threshold
    if (this.level < CONFIG.LEVEL.KILLS_FOR_LEVELS.length - 1) {
      this.killsToNextLevel = CONFIG.LEVEL.KILLS_FOR_LEVELS[this.level];
    } else {
      this.killsToNextLevel = this.kills + 20;
    }

    // Heal player
    this.health = Math.min(this.maxHealth, this.health + 20);

    // Increase auto attack base damage with level
    this.autoAttack.damage =
      CONFIG.ABILITIES.AUTO_ATTACK.DAMAGE + this.level * 2;

    // Emit level up event
    GameEvents.emit(EVENTS.PLAYER_LEVEL_UP, this.level, this);

    // Emit skill point gained event
    GameEvents.emit(EVENTS.PLAYER_SKILL_POINT, this.skillPoints, this);
  }

  /**
   * Make the player temporarily invulnerable
   * @param duration - Duration in milliseconds
   */
  setInvulnerable(duration: number): void {
    this.isInvulnerable = true;

    setTimeout(() => {
      this.isInvulnerable = false;
    }, duration);
  }

  /**
   * Clean up player resources
   */
  destroy(): void {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}

export default Player;
