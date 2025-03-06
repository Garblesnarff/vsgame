import { 
  Enemy, 
  BasicEnemy,
  VampireHunter, 
  FastSwarmer, 
  TankyBrute 
} from "../entities/enemies";
import CONFIG from "../config";
import { GameEvents, EVENTS } from "../utils/event-system";

/**
 * Enemy spawn system
 * Manages the spawning of enemies based on game time and player level
 */
export class SpawnSystem {
  gameContainer: HTMLElement;
  lastSpawnTime: number;
  lastSwarmSpawnTime: number;
  lastHunterSpawnTime: number;
  baseSpawnRate: number;
  currentSpawnRate: number;
  hunterSpawnRate: number;
  swarmSpawnRate: number;
  swarmSize: number;
  bruteSpawnLevels: number[];
  bruteSpawnCount: Map<number, number>;
  spawnedBrutesCount: number;
  game: any; // Reference to the game object for adding enemies

  /**
   * Create a new spawn system
   * @param gameContainer - DOM element for the game container
   * @param game - Reference to the game object
   */
  constructor(gameContainer: HTMLElement, game?: any) {
    this.gameContainer = gameContainer;
    this.game = game;
    this.lastSpawnTime = 0;
    this.lastSwarmSpawnTime = 0;
    this.lastHunterSpawnTime = 0;
    this.baseSpawnRate = CONFIG.SPAWN_RATE;
    this.currentSpawnRate = this.baseSpawnRate;
    
    // Special enemy spawn timers
    this.hunterSpawnRate = CONFIG.ENEMY.SPAWN_RATES.HUNTER_SPAWN_RATE;
    this.swarmSpawnRate = CONFIG.ENEMY.SPAWN_RATES.SWARM_SPAWN_RATE;
    this.swarmSize = CONFIG.ENEMY.SPAWN_RATES.BASE_SWARM_SIZE;

    // Brute spawn levels (every 5 levels starting at 5)
    this.bruteSpawnLevels = [];
    for (let i = 5; i <= 50; i += 5) {
      this.bruteSpawnLevels.push(i);
    }
    
    // Map to track how many brutes should spawn at each level milestone
    this.bruteSpawnCount = new Map();
    this.bruteSpawnLevels.forEach((level, index) => {
      this.bruteSpawnCount.set(level, Math.floor(index / 2) + 1); // 1 at level 5, 1 at level 10, 2 at level 15, etc.
    });
    
    // Keep track of brutes already spawned in the current level
    this.spawnedBrutesCount = 0;
  }

  /**
   * Update the spawn system
   * @param gameTime - Current game time
   * @param playerLevel - Current player level
   * @returns Newly spawned enemy or null
   */
  update(gameTime: number, playerLevel: number): Enemy | null {
    // Adjust spawn rate based on player level
    this.currentSpawnRate = Math.max(
      500,
      this.baseSpawnRate - playerLevel * 200
    );
    
    // Check if it's time to spawn a new regular enemy
    if (gameTime - this.lastSpawnTime > this.currentSpawnRate) {
      this.lastSpawnTime = gameTime;
      return this.spawnRegularEnemy(playerLevel);
    }
    
    // Check if it's time to spawn a hunter
    if (gameTime - this.lastHunterSpawnTime > this.hunterSpawnRate) {
      this.lastHunterSpawnTime = gameTime;
      return this.spawnVampireHunter(playerLevel);
    }
    
    // Check if it's time to spawn a swarm
    if (gameTime - this.lastSwarmSpawnTime > this.swarmSpawnRate) {
      this.lastSwarmSpawnTime = gameTime;
      // Return the first swarmer, the rest will be added in spawnSwarm
      return this.spawnSwarm(playerLevel);
    }
    
    // Check if we need to spawn brutes for the current level
    if (this.shouldSpawnBrute(playerLevel)) {
      this.spawnedBrutesCount++;
      return this.spawnTankyBrute(playerLevel);
    }

    return null;
  }
  
  /**
   * Spawn a regular Enemy
   * @param playerLevel - Current player level
   * @returns Regular enemy
   */
  spawnRegularEnemy(playerLevel: number): Enemy {
    const enemy = new BasicEnemy(this.gameContainer, playerLevel);
    GameEvents.emit(EVENTS.ENEMY_SPAWN, enemy, 'basicEnemy');
    return enemy;
  }
  
  /**
   * Spawn a Vampire Hunter enemy
   * @param playerLevel - Current player level
   * @returns Vampire Hunter enemy
   */
  spawnVampireHunter(playerLevel: number): VampireHunter {
    const hunter = new VampireHunter(this.gameContainer, playerLevel);
    GameEvents.emit(EVENTS.ENEMY_SPAWN, hunter, 'vampireHunter');
    return hunter;
  }
  
  /**
   * Spawn a group of Fast Swarmers
   * @param playerLevel - Current player level
   * @returns First Fast Swarmer in the group
   */
  spawnSwarm(playerLevel: number): FastSwarmer {
    // Calculate swarm size based on player level
    const actualSwarmSize = this.swarmSize + Math.floor(playerLevel / 3);
    
    // Create first swarmer
    const firstSwarmer = new FastSwarmer(this.gameContainer, playerLevel);
    GameEvents.emit(EVENTS.ENEMY_SPAWN, firstSwarmer, 'fastSwarmer');
    
    // Create additional swarmers with slight delay
    for (let i = 1; i < actualSwarmSize; i++) {
      setTimeout(() => {
        const swarmer = new FastSwarmer(this.gameContainer, playerLevel);
        GameEvents.emit(EVENTS.ENEMY_SPAWN, swarmer, 'fastSwarmer');
        
        // Add to the game's enemies array if game reference is available
        if (this.game && this.game.enemies) {
          this.game.enemies.push(swarmer);
        }
      }, i * 300); // 300ms between spawns
    }
    
    return firstSwarmer;
  }
  
  /**
   * Spawn a Tanky Brute enemy
   * @param playerLevel - Current player level
   * @returns Tanky Brute enemy
   */
  spawnTankyBrute(playerLevel: number): TankyBrute {
    const brute = new TankyBrute(this.gameContainer, playerLevel);
    GameEvents.emit(EVENTS.ENEMY_SPAWN, brute, 'tankyBrute');
    return brute;
  }
  
  /**
   * Check if we should spawn a brute at the current level
   * @param playerLevel - Current player level
   * @returns Whether a brute should be spawned
   */
  shouldSpawnBrute(playerLevel: number): boolean {
    // Find the highest milestone level that's less than or equal to current level
    let milestone = -1;
    for (const level of this.bruteSpawnLevels) {
      if (level <= playerLevel && level > milestone) {
        milestone = level;
      }
    }
    
    // If no milestone is applicable
    if (milestone === -1) {
      return false;
    }
    
    // Get how many brutes should spawn at this level
    const brutesNeeded = this.bruteSpawnCount.get(milestone) || 0;
    
    // Add debugging
    console.log(`Level ${playerLevel}, Milestone ${milestone}, Brutes needed: ${brutesNeeded}, Spawned: ${this.spawnedBrutesCount}`);
    
    // Spawn if we haven't reached the quota for this level
    return this.spawnedBrutesCount < brutesNeeded;
  }
  
  // Also make sure this method gets called after leveling up:
  updateForLevelChange(playerLevel: number): void {
    // Reset brute counter when level changes to ensure we get fresh spawns
    this.spawnedBrutesCount = 0;
    
    // Emit event about special enemies at this level
    const milestone = this.bruteSpawnLevels.find(level => level === playerLevel);
    if (milestone) {
      const bruteCount = this.bruteSpawnCount.get(milestone) || 0;
      GameEvents.emit(EVENTS.SPAWN_SPECIAL, { 
        type: 'tankyBrute', 
        count: bruteCount,
        level: playerLevel 
      });
    }
  }

  /**
   * Set the game reference
   * @param game - Game instance
   */
  setGameReference(game: any): void {
    this.game = game;
  }

  /**
   * Reset the spawn system
   */
  reset(): void {
    this.lastSpawnTime = 0;
    this.lastSwarmSpawnTime = 0;
    this.lastHunterSpawnTime = 0;
    this.currentSpawnRate = this.baseSpawnRate;
    this.spawnedBrutesCount = 0;
  }
}

export default SpawnSystem;