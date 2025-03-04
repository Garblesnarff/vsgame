/**
 * Configuration interfaces for game settings
 */

/**
 * Player configuration interface
 */
interface PlayerConfig {
  WIDTH: number;
  HEIGHT: number;
  SPEED: number;
  MAX_HEALTH: number;
  MAX_ENERGY: number;
  ENERGY_REGEN: number;
  ATTACK_COOLDOWN: number;
  PROJECTILE_SPEED: number;
  MANUAL_PROJECTILE_DAMAGE: number;
}

/**
 * Enemy configuration interface
 */
interface EnemyConfig {
  WIDTH: number;
  HEIGHT: number;
  BASE_HEALTH: number;
  BASE_DAMAGE: number;
}

/**
 * Level system configuration interface
 */
interface LevelConfig {
  KILLS_FOR_LEVELS: number[];
  KILLS_INCREASE_PER_LEVEL: number;
}

/**
 * Auto attack ability configuration
 */
interface AutoAttackConfig {
  ENABLED: boolean;
  COOLDOWN: number;
  DAMAGE: number;
  RANGE: number;
  MAX_LEVEL: number;
}

/**
 * Blood Drain ability configuration
 */
interface BloodDrainConfig {
  COOLDOWN: number;
  ENERGY_COST: number;
  RANGE: number;
  DAMAGE: number;
  HEAL_AMOUNT: number;
  DURATION: number;
  MAX_LEVEL: number;
}

/**
 * Bat Swarm ability configuration
 */
interface BatSwarmConfig {
  COOLDOWN: number;
  ENERGY_COST: number;
  COUNT: number;
  DAMAGE: number;
  SPEED: number;
  MAX_LEVEL: number;
}

/**
 * Shadow Dash ability configuration
 */
interface ShadowDashConfig {
  COOLDOWN: number;
  ENERGY_COST: number;
  DISTANCE: number;
  DAMAGE: number;
  INVULNERABILITY_TIME: number;
  MAX_LEVEL: number;
}

/**
 * Blood Lance ability configuration
 */
interface BloodLanceConfig {
  UNLOCKED: boolean;
  COOLDOWN: number;
  ENERGY_COST: number;
  DAMAGE: number;
  PIERCE: number;
  HEAL_AMOUNT: number;
  SPEED: number;
  MAX_LEVEL: number;
  UNLOCK_LEVEL: number;
}

/**
 * Night Shield ability configuration
 */
interface NightShieldConfig {
  UNLOCKED: boolean;
  COOLDOWN: number;
  ENERGY_COST: number;
  SHIELD_AMOUNT: number;
  DURATION: number;
  EXPLOSION_DAMAGE: number;
  EXPLOSION_RANGE: number;
  MAX_LEVEL: number;
  UNLOCK_LEVEL: number;
}

/**
 * UI skill menu configuration
 */
interface UISkillMenuConfig {
  BLOOD_LANCE_UNLOCK_COST: number;
  NIGHT_SHIELD_UNLOCK_COST: number;
  UPGRADE_COST: number;
}

/**
 * All abilities configuration
 */
interface AbilitiesConfig {
  AUTO_ATTACK: AutoAttackConfig;
  BLOOD_DRAIN: BloodDrainConfig;
  BAT_SWARM: BatSwarmConfig;
  SHADOW_DASH: ShadowDashConfig;
  BLOOD_LANCE: BloodLanceConfig;
  NIGHT_SHIELD: NightShieldConfig;
}

/**
 * UI configuration
 */
interface UIConfig {
  SKILL_MENU: UISkillMenuConfig;
}

/**
 * Complete game configuration
 */
interface GameConfig {
  GAME_WIDTH: number;
  GAME_HEIGHT: number;
  SPAWN_RATE: number;
  PLAYER: PlayerConfig;
  ENEMY: EnemyConfig;
  LEVEL: LevelConfig;
  ABILITIES: AbilitiesConfig;
  UI: UIConfig;
}

/**
 * Game Configuration
 * Contains all constants and default values for the game
 */
export const CONFIG: GameConfig = {
  // Game settings
  GAME_WIDTH: window.innerWidth,
  GAME_HEIGHT: window.innerHeight,
  SPAWN_RATE: 2000, // ms between enemy spawns

  // Player settings
  PLAYER: {
    WIDTH: 30,
    HEIGHT: 40,
    SPEED: 5,
    MAX_HEALTH: 100,
    MAX_ENERGY: 100,
    ENERGY_REGEN: 10, // Increased from 0.2 to match original implementation
    ATTACK_COOLDOWN: 350, // ms
    PROJECTILE_SPEED: 8,
    MANUAL_PROJECTILE_DAMAGE: 25,
  },

  // Enemy settings
  ENEMY: {
    WIDTH: 25,
    HEIGHT: 25,
    BASE_HEALTH: 50,
    BASE_DAMAGE: 5,
  },

  // Leveling system
  LEVEL: {
    KILLS_FOR_LEVELS: [
      0, 10, 22, 36, 52, 70, 90, 112, 136, 162, 190, 220, 252, 286, 322,
    ],
    KILLS_INCREASE_PER_LEVEL: 4,
  },

  // Ability settings
  ABILITIES: {
    AUTO_ATTACK: {
      ENABLED: true,
      COOLDOWN: 800, // ms
      DAMAGE: 15,
      RANGE: 300,
      MAX_LEVEL: 5,
    },
    BLOOD_DRAIN: {
      COOLDOWN: 8000, // ms
      ENERGY_COST: 30,
      RANGE: 150,
      DAMAGE: 50,
      HEAL_AMOUNT: 25,
      DURATION: 5000, // ms
      MAX_LEVEL: 5,
    },
    BAT_SWARM: {
      COOLDOWN: 8000, // ms
      ENERGY_COST: 40,
      COUNT: 24,
      DAMAGE: 2000,
      SPEED: 6,
      MAX_LEVEL: 5,
    },
    SHADOW_DASH: {
      COOLDOWN: 5000, // ms
      ENERGY_COST: 25,
      DISTANCE: 200,
      DAMAGE: 30,
      INVULNERABILITY_TIME: 500, // ms
      MAX_LEVEL: 5,
    },
    BLOOD_LANCE: {
      UNLOCKED: false,
      COOLDOWN: 12000, // ms
      ENERGY_COST: 50,
      DAMAGE: 150,
      PIERCE: 3,
      HEAL_AMOUNT: 10,
      SPEED: 12,
      MAX_LEVEL: 5,
      UNLOCK_LEVEL: 3,
    },
    NIGHT_SHIELD: {
      UNLOCKED: false,
      COOLDOWN: 15000, // ms
      ENERGY_COST: 60,
      SHIELD_AMOUNT: 100,
      DURATION: 8000, // ms
      EXPLOSION_DAMAGE: 100,
      EXPLOSION_RANGE: 120,
      MAX_LEVEL: 5,
      UNLOCK_LEVEL: 5,
    },
  },

  // UI Settings
  UI: {
    SKILL_MENU: {
      BLOOD_LANCE_UNLOCK_COST: 3,
      NIGHT_SHIELD_UNLOCK_COST: 3,
      UPGRADE_COST: 1,
    },
  },
};

export default CONFIG;