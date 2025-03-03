import CONFIG from "../config";
import { Player } from "../entities/player";

/**
 * Type for level up callback function
 */
type LevelUpCallback = (level: number) => void;

/**
 * Level System
 * Manages player level progression, experience, and level-up events
 */
export class LevelSystem {
  player: Player;
  level: number;
  kills: number;
  killsToNextLevel: number;
  levelUpCallbacks: LevelUpCallback[];

  /**
   * Create a new level system
   * @param player - The player associated with this level system
   */
  constructor(player: Player) {
    this.player = player;
    this.level = 1;
    this.kills = 0;
    this.killsToNextLevel = CONFIG.LEVEL.KILLS_FOR_LEVELS[1];
    this.levelUpCallbacks = [];
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

    // Update next level threshold
    if (this.level < CONFIG.LEVEL.KILLS_FOR_LEVELS.length - 1) {
      this.killsToNextLevel = CONFIG.LEVEL.KILLS_FOR_LEVELS[this.level];
    } else {
      // For levels beyond our predefined thresholds, use a formula
      this.killsToNextLevel =
        this.kills +
        (CONFIG.LEVEL.KILLS_FOR_LEVELS[
          CONFIG.LEVEL.KILLS_FOR_LEVELS.length - 1
        ] -
          CONFIG.LEVEL.KILLS_FOR_LEVELS[
            CONFIG.LEVEL.KILLS_FOR_LEVELS.length - 2
          ]) +
        CONFIG.LEVEL.KILLS_INCREASE_PER_LEVEL;
    }

    // Notify all registered callbacks of the level up event
    this.levelUpCallbacks.forEach((callback) => callback(this.level));
  }

  /**
   * Register a callback to be called when the player levels up
   * @param callback - Function to call on level up, receives level as parameter
   */
  onLevelUp(callback: LevelUpCallback): void {
    this.levelUpCallbacks.push(callback);
  }

  /**
   * Get the current level
   * @returns Current level
   */
  getLevel(): number {
    return this.level;
  }

  /**
   * Get the current kills
   * @returns Current kills
   */
  getKills(): number {
    return this.kills;
  }

  /**
   * Get the kills required for the next level
   * @returns Kills required for next level
   */
  getKillsToNextLevel(): number {
    return this.killsToNextLevel;
  }

  /**
   * Reset the level system
   */
  reset(): void {
    this.level = 1;
    this.kills = 0;
    this.killsToNextLevel = CONFIG.LEVEL.KILLS_FOR_LEVELS[1];
  }
}

export default LevelSystem;
