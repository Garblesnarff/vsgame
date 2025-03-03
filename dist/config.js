/**
 * Configuration interfaces for game settings
 */
/**
 * Game Configuration
 * Contains all constants and default values for the game
 */
export const CONFIG = {
    // Game settings
    GAME_WIDTH: window.innerWidth,
    GAME_HEIGHT: window.innerHeight,
    SPAWN_RATE: 2000,
    // Player settings
    PLAYER: {
        WIDTH: 30,
        HEIGHT: 40,
        SPEED: 5,
        MAX_HEALTH: 100,
        MAX_ENERGY: 100,
        ENERGY_REGEN: 0.2,
        ATTACK_COOLDOWN: 500,
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
            COOLDOWN: 800,
            DAMAGE: 15,
            RANGE: 300,
            MAX_LEVEL: 5,
        },
        BLOOD_DRAIN: {
            COOLDOWN: 8000,
            ENERGY_COST: 30,
            RANGE: 150,
            DAMAGE: 50,
            HEAL_AMOUNT: 25,
            DURATION: 5000,
            MAX_LEVEL: 5,
        },
        BAT_SWARM: {
            COOLDOWN: 8000,
            ENERGY_COST: 40,
            COUNT: 16,
            DAMAGE: 200,
            SPEED: 6,
            MAX_LEVEL: 5,
        },
        SHADOW_DASH: {
            COOLDOWN: 5000,
            ENERGY_COST: 25,
            DISTANCE: 200,
            DAMAGE: 30,
            INVULNERABILITY_TIME: 500,
            MAX_LEVEL: 5,
        },
        BLOOD_LANCE: {
            UNLOCKED: false,
            COOLDOWN: 12000,
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
            COOLDOWN: 15000,
            ENERGY_COST: 60,
            SHIELD_AMOUNT: 100,
            DURATION: 8000,
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
//# sourceMappingURL=config.js.map