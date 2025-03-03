import { Enemy } from "../entities/enemy";
import CONFIG from "../config";

/**
 * Enemy spawn system
 * Manages the spawning of enemies based on game time and player level
 */
export class SpawnSystem {
  gameContainer: HTMLElement;
  lastSpawnTime: number;
  baseSpawnRate: number;
  currentSpawnRate: number;

  /**
   * Create a new spawn system
   * @param gameContainer - DOM element for the game container
   */
  constructor(gameContainer: HTMLElement) {
    this.gameContainer = gameContainer;
    this.lastSpawnTime = 0;
    this.baseSpawnRate = CONFIG.SPAWN_RATE;
    this.currentSpawnRate = this.baseSpawnRate;
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

    // Check if it's time to spawn a new enemy
    if (gameTime - this.lastSpawnTime > this.currentSpawnRate) {
      this.lastSpawnTime = gameTime;
      return this.spawnEnemy(playerLevel);
    }

    return null;
  }

  /**
   * Spawn a new enemy
   * @param playerLevel - Current player level
   * @returns Newly spawned enemy
   */
  spawnEnemy(playerLevel: number): Enemy {
    const enemy = new Enemy(this.gameContainer, playerLevel);
    return enemy;
  }

  /**
   * Reset the spawn system
   */
  reset(): void {
    this.lastSpawnTime = 0;
    this.currentSpawnRate = this.baseSpawnRate;
  }
}

export default SpawnSystem;
