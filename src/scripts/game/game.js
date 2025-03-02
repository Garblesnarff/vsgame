import { Player } from '../entities/player.js';
import { Projectile } from '../entities/projectile.js';
import { GameLoop } from './game-loop.js';
import { InputHandler } from './input-handler.js';
import { SpawnSystem } from './spawn-system.js';
import { UIManager } from '../ui/ui-manager.js';
import { ParticleSystem } from './particle-system.js';
import { LevelSystem } from './level-system.js';
import Collision from '../utils/collision.js';
import CONFIG from '../config.js';

/**
 * Main Game class that orchestrates all game systems
 */
export class Game {
    constructor(gameContainer) {
        this.gameContainer = gameContainer;
        
        // Initialize game state
        this.gameTime = 0;
        this.enemies = [];
        this.projectiles = [];
        
        // Create game systems
        this.gameLoop = new GameLoop();
        this.inputHandler = new InputHandler(this);
        this.spawnSystem = new SpawnSystem(this.gameContainer);
        this.particleSystem = new ParticleSystem(this.gameContainer);
        
        // Create player
        this.player = new Player(this.gameContainer);
        
        // Create level system
        this.levelSystem = new LevelSystem(this.player);
        
        // Register level up handler
        this.levelSystem.onLevelUp((level) => {
            this.player.skillPoints++;
            this.handleLevelUp();
        });
        
        // Create UI manager (after player is created)
        this.uiManager = new UIManager(this);
        
        // Initialize ability UI
        this.player.abilityManager.initializeUI();
    }
    
    /**
     * Start the game
     */
    start() {
        this.gameLoop.start(this.update.bind(this));
    }
    
    /**
     * Main update function called each frame
     * @param {number} deltaTime - Time since last update in ms
     */
    update(deltaTime) {
        // Update game time
        this.gameTime += deltaTime;
        
        // Update player position based on input
        this.player.move(this.inputHandler.getKeys());
        
        // Update player energy
        this.player.regenerateEnergy(deltaTime);
        
        // Update abilities
        this.player.abilityManager.update(deltaTime, this.enemies);
        
        // Spawn enemies
        const newEnemy = this.spawnSystem.update(this.gameTime, this.player.level);
        if (newEnemy) {
            this.enemies.push(newEnemy);
        }
        
        // Auto-attack
        this.updateAutoAttack();
        
        // Update enemies
        this.updateEnemies(deltaTime);
        
        // Update projectiles
        this.updateProjectiles();
        
        // Update particles
        this.particleSystem.update();
        
        // Update UI
        this.uiManager.update();
    }
    
    /**
     * Update auto-attack logic
     */
    updateAutoAttack() {
        if (!this.player.autoAttack.enabled) return;
        
        const now = Date.now();
        if (now - this.player.autoAttack.lastFired < this.player.autoAttack.cooldown) return;
        
        // Find the closest enemy within range
        let closestEnemy = null;
        let closestDistance = Infinity;
        
        for (const enemy of this.enemies) {
            const dx = enemy.x + enemy.width / 2 - (this.player.x + this.player.width / 2);
            const dy = enemy.y + enemy.height / 2 - (this.player.y + this.player.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.player.autoAttack.range && distance < closestDistance) {
                closestEnemy = enemy;
                closestDistance = distance;
            }
        }
        
        // If there's an enemy in range, fire at it
        if (closestEnemy) {
            this.player.fireAutoProjectile(closestEnemy, this.createProjectile.bind(this));
        }
    }
    
    /**
     * Update enemy movement and check for collisions
     * @param {number} deltaTime - Time since last update in ms
     */
    updateEnemies(deltaTime) {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            // Move enemy towards player
            enemy.moveTowardsPlayer(this.player);
            
            // Check for Blood Drain ability affecting this enemy
            const bloodDrain = this.player.abilityManager.getAbility('bloodDrain');
            if (bloodDrain && bloodDrain.isActive()) {
                // Blood Drain is handled in the ability's update method
            }
            
            // Check if enemy is far out of bounds (cleanup)
            if (enemy.isOutOfBounds()) {
                enemy.destroy();
                this.enemies.splice(i, 1);
                continue;
            }
            
            // Check collision with player
            if (this.player.isAlive && !this.player.isInvulnerable && enemy.collidesWithPlayer(this.player)) {
                // Calculate damage amount
                const damageAmount = enemy.damage;
                
                // Apply damage to player
                if (this.player.takeDamage(damageAmount)) {
                    // Create blood particles if damage was applied
                    this.particleSystem.createBloodParticles(
                        this.player.x + this.player.width / 2,
                        this.player.y + this.player.height / 2,
                        10
                    );
                    
                    // Check if player died
                    if (!this.player.isAlive) {
                        this.gameOver();
                    }
                }
                
                // Push enemy back
                const dx = enemy.x + enemy.width / 2 - (this.player.x + this.player.width / 2);
                const dy = enemy.y + enemy.height / 2 - (this.player.y + this.player.height / 2);
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                enemy.x += (dx / dist) * 10;
                enemy.y += (dy / dist) * 10;
                enemy.updatePosition();
            }
        }
    }
    
    /**
     * Update projectile movement and check for collisions
     */
    updateProjectiles() {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            
            // Move projectile
            projectile.move();
            
            // Check if projectile is out of bounds
            if (projectile.isOutOfBounds()) {
                projectile.destroy();
                this.projectiles.splice(i, 1);
                continue;
            }
            
            let shouldRemoveProjectile = false;
            
            // Check collision with enemies
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                
                if (projectile.collidesWith(enemy)) {
                    // Create blood particles
                    this.particleSystem.createBloodParticles(projectile.x, projectile.y, 5);
                    
                    // Apply damage to enemy
                    if (enemy.takeDamage(projectile.damage, this.particleSystem.createBloodParticles.bind(this.particleSystem))) {
                        // Enemy died
                        enemy.destroy();
                        this.enemies.splice(j, 1);
                        
                        // Add kill to player and check for level up
                        if (this.levelSystem.addKill()) {
                            // Level up was handled by the callback
                        }
                    }
                    
                    // Handle Blood Lance special behavior
                    if (projectile.isBloodLance) {
                        shouldRemoveProjectile = projectile.handleBloodLanceHit(enemy, this.player.heal.bind(this.player));
                    } else {
                        // Regular projectile or auto-attack - remove after hitting
                        shouldRemoveProjectile = true;
                    }
                    
                    // Break loop for non-piercing projectiles
                    if (shouldRemoveProjectile && !projectile.isBloodLance) {
                        break;
                    }
                }
            }
            
            // Remove projectile if needed
            if (shouldRemoveProjectile) {
                projectile.destroy();
                this.projectiles.splice(i, 1);
            }
        }
    }
    
    /**
     * Create a new projectile
     * @param {Object} options - Projectile options
     * @returns {Projectile} - The created projectile
     */
    createProjectile(options) {
        const projectile = new Projectile(this.gameContainer, options);
        this.projectiles.push(projectile);
        return projectile;
    }
    
    /**
     * Handle player level up
     */
    handleLevelUp() {
        // Show level up notification
        this.uiManager.showLevelUp();
        
        // Update spawn rate
        this.spawnSystem.currentSpawnRate = Math.max(500, CONFIG.SPAWN_RATE - this.player.level * 200);
        
        // Check for unlockable abilities
        this.player.abilityManager.checkUnlockableAbilities();
        
        // Heal player slightly
        this.player.heal(20);
    }
    
    /**
     * Game over logic
     */
    gameOver() {
        this.gameLoop.stop();
        this.uiManager.showGameOver();
    }
    
    /**
     * Restart the game
     */
    restart() {
        // Clean up existing entities
        this.cleanupEntities();
        
        // Reset player
        this.player.destroy();
        this.player = new Player(this.gameContainer);
        
        // Reset level system
        this.levelSystem = new LevelSystem(this.player);
        this.levelSystem.onLevelUp((level) => {
            this.player.skillPoints++;
            this.handleLevelUp();
        });
        
        // Initialize player abilities
        this.player.abilityManager.initializeUI();
        
        // Reset game systems
        this.gameTime = 0;
        this.spawnSystem.reset();
        this.particleSystem.reset();
        
        // Reset UI
        this.uiManager.reset();
        
        // Start game loop
        this.gameLoop.start(this.update.bind(this));
    }
    
    /**
     * Clean up all game entities
     */
    cleanupEntities() {
        // Clean up enemies
        for (const enemy of this.enemies) {
            enemy.destroy();
        }
        this.enemies = [];
        
        // Clean up projectiles
        for (const projectile of this.projectiles) {
            projectile.destroy();
        }
        this.projectiles = [];
        
        // Clean up particles
        this.particleSystem.reset();
    }
    
    /**
     * Toggle the skill menu
     */
    toggleSkillMenu() {
        this.uiManager.toggleSkillMenu();
    }
    
    /**
     * Toggle game pause
     */
    togglePause() {
        if (this.player.showingSkillMenu) {
            // Don't toggle pause if skill menu is open
            return;
        }
        
        this.gameLoop.togglePause(this.gameContainer);
    }
    
    /**
     * Upgrade a skill
     * @param {string} skillId - ID of the skill to upgrade
     */
    upgradeSkill(skillId) {
        // Check if player has skill points
        if (this.player.skillPoints <= 0) return;
        
        let pointCost = CONFIG.UI.SKILL_MENU.UPGRADE_COST;
        let upgraded = false;
        
        // Handle different skills
        if (skillId === 'autoAttack') {
            // Auto attack upgrade
            if (this.player.autoAttack.level < this.player.autoAttack.maxLevel) {
                this.player.autoAttack.level++;
                this.player.autoAttack.damage += 10; // +10 damage per level
                this.player.autoAttack.cooldown = Math.max(300, this.player.autoAttack.cooldown - 100); // -100ms cooldown (min 300ms)
                this.player.autoAttack.range += 30; // +30 range per level
                upgraded = true;
            }
        } else if (skillId === 'bloodLance') {
            // Blood Lance unlock/upgrade
            const bloodLance = this.player.abilityManager.getAbility('bloodLance');
            
            if (!bloodLance.unlocked && this.player.level >= CONFIG.ABILITIES.BLOOD_LANCE.UNLOCK_LEVEL) {
                // Unlock ability
                pointCost = CONFIG.UI.SKILL_MENU.BLOOD_LANCE_UNLOCK_COST;
                upgraded = this.player.abilityManager.unlockAbility('bloodLance');
                
                // Add to UI when unlocked
                if (upgraded) {
                    this.uiManager.addUnlockedAbility('bloodLance', '🗡️', '4');
                }
            } else if (bloodLance.unlocked) {
                // Upgrade ability
                upgraded = this.player.abilityManager.upgradeAbility('bloodLance');
            }
        } else if (skillId === 'nightShield') {
            // Night Shield unlock/upgrade
            const nightShield = this.player.abilityManager.getAbility('nightShield');
            
            if (!nightShield.unlocked && this.player.level >= CONFIG.ABILITIES.NIGHT_SHIELD.UNLOCK_LEVEL) {
                // Unlock ability
                pointCost = CONFIG.UI.SKILL_MENU.NIGHT_SHIELD_UNLOCK_COST;
                upgraded = this.player.abilityManager.unlockAbility('nightShield');
                
                // Add to UI when unlocked
                if (upgraded) {
                    this.uiManager.addUnlockedAbility('nightShield', '🛡️', '5');
                }
            } else if (nightShield.unlocked) {
                // Upgrade ability
                upgraded = this.player.abilityManager.upgradeAbility('nightShield');
            }
        } else {
            // Regular ability upgrade
            upgraded = this.player.abilityManager.upgradeAbility(skillId);
        }
        
        // Deduct skill points if upgrade was successful
        if (upgraded) {
            this.player.skillPoints -= pointCost;
            this.uiManager.updateSkillMenu();
        }
    }
    
    /**
     * Check if the game is currently running
     * @returns {boolean} - Whether the game is running
     */
    isRunning() {
        return this.gameLoop.gameRunning;
    }
}

export default Game;