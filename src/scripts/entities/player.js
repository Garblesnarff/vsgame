import CONFIG from '../config.js';
import { AbilityManager } from '../abilities/ability-manager.js';

/**
 * Player class representing the main character in the game
 */
export class Player {
    constructor(gameContainer) {
        this.gameContainer = gameContainer;
        
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
            maxLevel: CONFIG.ABILITIES.AUTO_ATTACK.MAX_LEVEL
        };
        
        // Initialize abilities
        this.abilityManager = new AbilityManager(this);
        
        // Create DOM element
        this.element = document.createElement('div');
        this.element.className = 'player';
        this.gameContainer.appendChild(this.element);
        this.updatePosition();
    }
    
    /**
     * Updates player position based on input
     * @param {Object} keys - Current state of keyboard keys
     */
    move(keys) {
        if (keys['ArrowUp'] || keys['w']) {
            this.y = Math.max(0, this.y - this.speed);
        }
        if (keys['ArrowDown'] || keys['s']) {
            this.y = Math.min(CONFIG.GAME_HEIGHT - this.height, this.y + this.speed);
        }
        if (keys['ArrowLeft'] || keys['a']) {
            this.x = Math.max(0, this.x - this.speed);
        }
        if (keys['ArrowRight'] || keys['d']) {
            this.x = Math.min(CONFIG.GAME_WIDTH - this.width, this.x + this.speed);
        }
        
        this.updatePosition();
    }
    
    /**
     * Updates the DOM element position
     */
    updatePosition() {
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
    }
    
    /**
     * Regenerates energy over time
     * @param {number} deltaTime - Time since last update
     */
    regenerateEnergy(deltaTime) {
        this.energy = Math.min(this.maxEnergy, this.energy + this.energyRegen * (deltaTime / 1000));
    }
    
    /**
     * Player takes damage from an enemy
     * @param {number} amount - Damage amount
     * @returns {boolean} - Whether damage was actually applied (not invulnerable)
     */
    takeDamage(amount) {
        if (this.isInvulnerable) return false;
        
        // Check if Night Shield is active
        const nightShield = this.abilityManager.getAbility('nightShield');
        if (nightShield && nightShield.isActive() && nightShield.currentShield > 0) {
            return nightShield.absorbDamage(amount);
        }
        
        this.health -= amount;
        
        if (this.health <= 0) {
            this.health = 0;
            this.isAlive = false;
        }
        
        return true;
    }
    
    /**
     * Heals the player
     * @param {number} amount - Healing amount
     */
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }
    
    /**
     * Fires a projectile toward a target
     * @param {number} targetX - Target X coordinate
     * @param {number} targetY - Target Y coordinate
     * @param {Function} createProjectile - Function to create a projectile
     * @returns {boolean} - Whether the projectile was fired
     */
    fireProjectile(targetX, targetY, createProjectile) {
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
            isAutoAttack: false
        });
        
        return true;
    }
    
    /**
     * Fires an auto-attack projectile toward a target
     * @param {Object} enemy - Target enemy
     * @param {Function} createProjectile - Function to create a projectile
     */
    fireAutoProjectile(enemy, createProjectile) {
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
            isAutoAttack: true
        });
        
        this.autoAttack.lastFired = now;
        return true;
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
        this.autoAttack.damage = CONFIG.ABILITIES.AUTO_ATTACK.DAMAGE + this.level * 2;
    }
    
    /**
     * Make the player temporarily invulnerable
     * @param {number} duration - Duration in milliseconds
     */
    setInvulnerable(duration) {
        this.isInvulnerable = true;
        
        setTimeout(() => {
            this.isInvulnerable = false;
        }, duration);
    }
    
    /**
     * Clean up player resources
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

export default Player;