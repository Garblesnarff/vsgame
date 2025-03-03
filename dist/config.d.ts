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
export declare const CONFIG: GameConfig;
export default CONFIG;
