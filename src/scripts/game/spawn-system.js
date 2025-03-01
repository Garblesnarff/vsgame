import { Enemy } from '../entities/enemy.js';
import CONFIG from '../config.js';

/**
 * Enemy spawn system
 * Manages the spawning of enemies based on game time and player level
 */
export class SpawnSystem {
    constructor(gameContainer) {
        this.gameContainer = gameContainer;
        this.lastSpawnTime = 0;
        this.baseSpawnRate = CONFIG.SPAWN_RATE;
        this.currentSpawnRate = this.baseSpawnRate;
    }
    
    /**
     * Update the spawn system
     * @param {number} gameTime - Current game time
     * @param {number} playerLevel - Current player level
     * @returns {Enemy|null} - Newly spawned enemy or null
     */
    update(gameTime, playerLevel) {
        // Adjust spawn rate based on player level
        this.currentSpawnRate = Math.max(500, this.baseSpawnRate - playerLevel * 200);
        
        // Check if it's time to spawn a new enemy
        if (gameTime - this.lastSpawnTime > this.currentSpawnRate) {
            this.lastSpawnTime = gameTime;
            return this.spawnEnemy(playerLevel);
        }
        
        return null;
    }
    
    /**
     * Spawn a new enemy
     * @param {number} playerLevel - Current player level
     * @returns {Enemy} - Newly spawned enemy
     */
    spawnEnemy(playerLevel) {
        const enemy = new Enemy(this.gameContainer, playerLevel);
        return enemy;
    }
    
    /**
     * Reset the spawn system
     */
    reset() {
        this.lastSpawnTime = 0;
        this.currentSpawnRate = this.baseSpawnRate;
    }
}

export default SpawnSystem;