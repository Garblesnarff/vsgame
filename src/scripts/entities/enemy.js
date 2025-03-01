import CONFIG from '../config.js';

/**
 * Enemy class representing monsters that attack the player
 */
export class Enemy {
    constructor(gameContainer, playerLevel) {
        this.gameContainer = gameContainer;
        
        // Position and dimensions
        this.width = CONFIG.ENEMY.WIDTH;
        this.height = CONFIG.ENEMY.HEIGHT;
        
        // Stats scaled by player level
        this.speed = 1 + Math.random() * playerLevel * 0.2;
        this.health = CONFIG.ENEMY.BASE_HEALTH + playerLevel * 10;
        this.maxHealth = this.health;
        this.damage = CONFIG.ENEMY.BASE_DAMAGE + playerLevel;
        
        // Determine spawn position (outside screen)
        this.setSpawnPosition();
        
        // Create DOM elements
        this.element = document.createElement('div');
        this.element.className = 'enemy';
        
        this.healthBarContainer = document.createElement('div');
        this.healthBarContainer.className = 'enemy-health-container';
        
        this.healthBar = document.createElement('div');
        this.healthBar.className = 'enemy-health-bar';
        
        this.healthBarContainer.appendChild(this.healthBar);
        this.element.appendChild(this.healthBarContainer);
        
        // Position elements
        this.updatePosition();
        
        // Add to game container
        this.gameContainer.appendChild(this.element);
    }
    
    /**
     * Sets a random spawn position outside the screen
     */
    setSpawnPosition() {
        const side = Math.floor(Math.random() * 4);
        
        switch (side) {
            case 0: // Top
                this.x = Math.random() * CONFIG.GAME_WIDTH;
                this.y = -this.height;
                break;
            case 1: // Right
                this.x = CONFIG.GAME_WIDTH + this.width;
                this.y = Math.random() * CONFIG.GAME_HEIGHT;
                break;
            case 2: // Bottom
                this.x = Math.random() * CONFIG.GAME_WIDTH;
                this.y = CONFIG.GAME_HEIGHT + this.height;
                break;
            case 3: // Left
                this.x = -this.width;
                this.y = Math.random() * CONFIG.GAME_HEIGHT;
                break;
        }
    }
    
    /**
     * Updates the enemy's position to follow the player
     * @param {Object} player - Player object to follow
     */
    moveTowardsPlayer(player) {
        const dx = player.x + player.width / 2 - (this.x + this.width / 2);
        const dy = player.y + player.height / 2 - (this.y + this.height / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Normalize and apply speed
        this.x += (dx / dist) * this.speed;
        this.y += (dy / dist) * this.speed;
        
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
     * Updates the enemy's health bar display
     */
    updateHealthBar() {
        this.healthBar.style.width = (this.health / this.maxHealth * 100) + '%';
    }
    
    /**
     * Enemy takes damage from a source
     * @param {number} amount - Damage amount
     * @param {Function} createParticles - Function to create blood particles
     * @returns {boolean} - Whether the enemy died
     */
    takeDamage(amount, createParticles) {
        this.health -= amount;
        this.updateHealthBar();
        
        // Create blood particles at position
        if (createParticles) {
            createParticles(this.x + this.width / 2, this.y + this.height / 2, 5);
        }
        
        // Return whether the enemy died
        return this.health <= 0;
    }
    
    /**
     * Checks if enemy collides with player
     * @param {Object} player - Player object
     * @returns {boolean} - Whether collision occurred
     */
    collidesWithPlayer(player) {
        return (
            this.x < player.x + player.width &&
            this.x + this.width > player.x &&
            this.y < player.y + player.height &&
            this.y + this.height > player.y
        );
    }
    
    /**
     * Checks if enemy position is out of bounds
     * @returns {boolean} - Whether enemy is out of bounds
     */
    isOutOfBounds() {
        return (
            this.x < -this.width - 100 || 
            this.x > CONFIG.GAME_WIDTH + 100 || 
            this.y < -this.height - 100 || 
            this.y > CONFIG.GAME_HEIGHT + 100
        );
    }
    
    /**
     * Clean up enemy resources
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

export default Enemy;