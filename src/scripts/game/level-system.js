import CONFIG from '../config.js';

/**
 * Level System
 * Manages player level progression, experience, and level-up events
 */
export class LevelSystem {
    constructor(player) {
        this.player = player;
        this.level = 1;
        this.kills = 0;
        this.killsToNextLevel = CONFIG.LEVEL.KILLS_FOR_LEVELS[1];
        this.levelUpCallbacks = [];
    }
    
    /**
     * Add a kill to the player's count and check for level up
     * @returns {boolean} - Whether the player leveled up
     */
    addKill() {
        this.kills++;
        
        if (this.level < CONFIG.LEVEL.KILLS_FOR_LEVELS.length - 1 && 
            this.kills >= CONFIG.LEVEL.KILLS_FOR_LEVELS[this.level]) {
            this.levelUp();
            return true;
        }
        
        return false;
    }
    
    /**
     * Level up the player
     */
    levelUp() {
        this.level++;
        
        // Update next level threshold
        if (this.level < CONFIG.LEVEL.KILLS_FOR_LEVELS.length - 1) {
            this.killsToNextLevel = CONFIG.LEVEL.KILLS_FOR_LEVELS[this.level];
        } else {
            // For levels beyond our predefined thresholds, use a formula
            this.killsToNextLevel = this.kills + 
                (CONFIG.LEVEL.KILLS_FOR_LEVELS[CONFIG.LEVEL.KILLS_FOR_LEVELS.length - 1] - 
                 CONFIG.LEVEL.KILLS_FOR_LEVELS[CONFIG.LEVEL.KILLS_FOR_LEVELS.length - 2]) + 
                 CONFIG.LEVEL.KILLS_INCREASE_PER_LEVEL;
        }
        
        // Notify all registered callbacks of the level up event
        this.levelUpCallbacks.forEach(callback => callback(this.level));
    }
    
    /**
     * Register a callback to be called when the player levels up
     * @param {Function} callback - Function to call on level up, receives level as parameter
     */
    onLevelUp(callback) {
        this.levelUpCallbacks.push(callback);
    }
    
    /**
     * Get the current level
     * @returns {number} - Current level
     */
    getLevel() {
        return this.level;
    }
    
    /**
     * Get the current kills
     * @returns {number} - Current kills
     */
    getKills() {
        return this.kills;
    }
    
    /**
     * Get the kills required for the next level
     * @returns {number} - Kills required for next level
     */
    getKillsToNextLevel() {
        return this.killsToNextLevel;
    }
    
    /**
     * Reset the level system
     */
    reset() {
        this.level = 1;
        this.kills = 0;
        this.killsToNextLevel = CONFIG.LEVEL.KILLS_FOR_LEVELS[1];
    }
}

export default LevelSystem;