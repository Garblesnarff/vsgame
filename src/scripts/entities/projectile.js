import CONFIG from '../config.js';

/**
 * Projectile class for player attacks and abilities
 */
export class Projectile {
    constructor(gameContainer, options) {
        this.gameContainer = gameContainer;
        
        // Position and movement
        this.x = options.x || 0;
        this.y = options.y || 0;
        this.vx = options.vx || 0;
        this.vy = options.vy || 0;
        
        // Properties
        this.damage = options.damage || 0;
        this.isAutoAttack = options.isAutoAttack || false;
        this.isBloodLance = options.isBloodLance || false;
        
        // Blood Lance specific properties
        if (this.isBloodLance) {
            this.pierce = options.pierce || 3;
            this.pierceCount = 0;
            this.healAmount = options.healAmount || 0;
            this.hitEnemies = new Set();
        }
        
        // Create DOM element
        this.element = document.createElement('div');
        this.element.className = options.className || 'projectile';
        
        // Special styling for different projectile types
        if (this.isAutoAttack) {
            this.element.style.backgroundColor = '#990099';
        } else if (this.isBloodLance) {
            this.element.className = 'blood-lance';
        }
        
        // Set rotation if provided
        if (options.angle !== undefined) {
            this.element.style.transform = `rotate(${options.angle}rad)`;
        }
        
        // Position element
        this.updatePosition();
        
        // Add to game container
        this.gameContainer.appendChild(this.element);
    }
    
    /**
     * Updates the projectile position
     */
    move() {
        this.x += this.vx;
        this.y += this.vy;
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
     * Checks if projectile is outside the game area
     * @returns {boolean} - Whether projectile is out of bounds
     */
    isOutOfBounds() {
        return (
            this.x < 0 || 
            this.x > CONFIG.GAME_WIDTH || 
            this.y < 0 || 
            this.y > CONFIG.GAME_HEIGHT
        );
    }
    
    /**
     * Checks if projectile hits an enemy
     * @param {Enemy} enemy - Enemy to check collision with
     * @returns {boolean} - Whether collision occurred
     */
    collidesWith(enemy) {
        // For Blood Lance, skip enemies we already hit
        if (this.isBloodLance && this.hitEnemies.has(enemy.id)) {
            return false;
        }
        
        return (
            this.x > enemy.x &&
            this.x < enemy.x + enemy.width &&
            this.y > enemy.y &&
            this.y < enemy.y + enemy.height
        );
    }
    
    /**
     * Handle hit effects for Blood Lance
     * @param {Enemy} enemy - Enemy that was hit
     * @param {Function} healPlayer - Function to heal the player
     * @returns {boolean} - Whether the projectile should be destroyed
     */
    handleBloodLanceHit(enemy, healPlayer) {
        if (!this.isBloodLance) return true;
        
        // Record this enemy as hit
        this.hitEnemies.add(enemy.id);
        
        // Heal player
        if (healPlayer) {
            healPlayer(this.healAmount);
        }
        
        // Increment pierce count
        this.pierceCount++;
        
        // Check if we've reached max pierce
        return this.pierceCount >= this.pierce;
    }
    
    /**
     * Clean up projectile resources
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

export default Projectile;