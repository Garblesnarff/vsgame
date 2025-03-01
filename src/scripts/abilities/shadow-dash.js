import { Ability } from './ability-base.js';

/**
 * Shadow Dash ability - Dash through enemies, becoming briefly invulnerable
 */
export class ShadowDash extends Ability {
    constructor(player, config) {
        super(player, {
            name: 'Shadow Dash',
            description: 'Dash through enemies, becoming briefly invulnerable and damaging enemies you pass through',
            key: '3',
            cooldown: config.COOLDOWN,
            energyCost: config.ENERGY_COST,
            level: 1,
            maxLevel: config.MAX_LEVEL
        });
        
        this.distance = config.DISTANCE;
        this.damage = config.DAMAGE;
        this.invulnerabilityTime = config.INVULNERABILITY_TIME;
    }
    
    /**
     * Use the shadow dash ability
     * @returns {boolean} - Whether the ability was used
     */
    use() {
        if (this.active || !super.use()) return false;
        
        this.active = true;
        
        // Set player invulnerable
        this.player.setInvulnerable(this.invulnerabilityTime);
        
        // Calculate dash direction based on current movement keys
        const keys = this.getMovementKeys();
        let dirX = 0, dirY = 0;
        
        if (keys.up) dirY = -1;
        if (keys.down) dirY = 1;
        if (keys.left) dirX = -1;
        if (keys.right) dirX = 1;
        
        // If no direction pressed, dash forward (right)
        if (dirX === 0 && dirY === 0) dirX = 1;
        
        // Normalize direction vector
        const length = Math.sqrt(dirX * dirX + dirY * dirY);
        dirX /= length;
        dirY /= length;
        
        // Get dash distance based on level
        const dashDistance = this.getScaledDistance();
        
        // Calculate dash target position
        const dashX = dirX * dashDistance;
        const dashY = dirY * dashDistance;
        
        // Create shadow trail effect
        this.createShadowTrail(dashX, dashY);
        
        // Move player
        this.player.x = Math.max(0, Math.min(window.innerWidth - this.player.width, this.player.x + dashX));
        this.player.y = Math.max(0, Math.min(window.innerHeight - this.player.height, this.player.y + dashY));
        this.player.updatePosition();
        
        // Damage enemies in path
        this.damageEnemiesInPath(dirX, dirY, dashDistance);
        
        // End dash after the invulnerability time
        setTimeout(() => {
            this.active = false;
        }, this.invulnerabilityTime);
        
        return true;
    }
    
    /**
     * Get current movement keys from the game input handler
     * @returns {Object} - Keys state { up, down, left, right }
     */
    getMovementKeys() {
        // If we can access the game input handler
        if (this.player.game && this.player.game.inputHandler) {
            const keys = this.player.game.inputHandler.getKeys();
            
            return {
                up: keys['ArrowUp'] || keys['w'] || false,
                down: keys['ArrowDown'] || keys['s'] || false,
                left: keys['ArrowLeft'] || keys['a'] || false,
                right: keys['ArrowRight'] || keys['d'] || false
            };
        }
        
        // Default: dash right if we can't access input
        return { up: false, down: false, left: false, right: true };
    }
    
    /**
     * Create shadow trail effect
     * @param {number} dashX - X component of dash vector
     * @param {number} dashY - Y component of dash vector
     */
    createShadowTrail(dashX, dashY) {
        // Create multiple shadow trails along the dash path
        for (let i = 0; i < 10; i++) {
            const trailX = this.player.x + (dashX * (i / 10));
            const trailY = this.player.y + (dashY * (i / 10));
            
            // Use particle system if available
            if (this.player.game && this.player.game.particleSystem) {
                this.player.game.particleSystem.createShadowTrail(trailX, trailY);
            } else {
                // Fallback if no particle system
                const trail = document.createElement('div');
                trail.className = 'shadow-trail';
                trail.style.left = trailX + 'px';
                trail.style.top = trailY + 'px';
                trail.style.opacity = 0.5;
                
                this.player.gameContainer.appendChild(trail);
                
                // Fade out and remove
                let opacity = 0.5;
                const fadeInterval = setInterval(() => {
                    opacity -= 0.05;
                    trail.style.opacity = opacity;
                    
                    if (opacity <= 0) {
                        clearInterval(fadeInterval);
                        if (trail.parentNode) {
                            trail.parentNode.removeChild(trail);
                        }
                    }
                }, 100);
            }
        }
    }
    
    /**
     * Damage enemies in the dash path
     * @param {number} dirX - X direction component
     * @param {number} dirY - Y direction component
     * @param {number} distance - Dash distance
     */
    damageEnemiesInPath(dirX, dirY, distance) {
        // If we can access game enemies
        if (!this.player.game || !this.player.game.enemies) return;
        
        const enemies = this.player.game.enemies;
        const damage = this.getScaledDamage();
        
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            
            // Check if enemy is in dash path (simple approximation)
            if (this.isEnemyInDashPath(enemy, dirX, dirY, distance)) {
                // Apply damage
                enemy.takeDamage(damage, (x, y, count) => {
                    if (this.player.game.particleSystem) {
                        this.player.game.particleSystem.createBloodParticles(x, y, count);
                    }
                });
                
                // Check if enemy died
                if (enemy.health <= 0) {
                    enemy.destroy();
                    enemies.splice(i, 1);
                    
                    // Add kill to player
                    if (this.player.addKill()) {
                        // Player leveled up
                        if (this.player.game) {
                            this.player.game.handleLevelUp();
                        }
                    }
                }
            }
        }
    }
    
    /**
     * Check if an enemy is in the dash path
     * @param {Object} enemy - Enemy object
     * @param {number} dirX - X direction component
     * @param {number} dirY - Y direction component
     * @param {number} distance - Dash distance
     * @returns {boolean} - Whether the enemy is in the dash path
     */
    isEnemyInDashPath(enemy, dirX, dirY, distance) {
        // Simplified check: enemy center point is within a certain distance of the dash line
        // For a more accurate check, you'd use line-rectangle intersection
        
        // Dash start and end points
        const startX = this.player.x + this.player.width / 2;
        const startY = this.player.y + this.player.height / 2;
        const endX = startX + dirX * distance;
        const endY = startY + dirY * distance;
        
        // Enemy center
        const enemyX = enemy.x + enemy.width / 2;
        const enemyY = enemy.y + enemy.height / 2;
        
        // Distance from enemy center to dash line segment
        // Using point-to-line-segment distance formula
        const lengthSquared = (endX - startX) * (endX - startX) + (endY - startY) * (endY - startY);
        
        // If dash length is zero, return distance to start point
        if (lengthSquared === 0) {
            const dx = enemyX - startX;
            const dy = enemyY - startY;
            return Math.sqrt(dx * dx + dy * dy) < 50; // 50px collision radius
        }
        
        // Project enemy point onto dash line
        const t = Math.max(0, Math.min(1, ((enemyX - startX) * (endX - startX) + (enemyY - startY) * (endY - startY)) / lengthSquared));
        
        const projX = startX + t * (endX - startX);
        const projY = startY + t * (endY - startY);
        
        // Distance from enemy center to projection point
        const dx = enemyX - projX;
        const dy = enemyY - projY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Return true if enemy is close enough to dash path
        return distance < 50; // 50px collision radius
    }
    
    /**
     * Get distance scaled by ability level
     * @returns {number} - Scaled distance
     */
    getScaledDistance() {
        return this.distance + (this.level - 1) * 50;
    }
    
    /**
     * Get damage scaled by ability level
     * @returns {number} - Scaled damage
     */
    getScaledDamage() {
        return this.damage + (this.level - 1) * 15;
    }
    
    /**
     * Get invulnerability time scaled by ability level
     * @returns {number} - Scaled invulnerability time in ms
     */
    getScaledInvulnerabilityTime() {
        return this.invulnerabilityTime + (this.level - 1) * 100;
    }
}

export default ShadowDash;