/**
 * Base class for all player abilities
 */
export class Ability {
    constructor(player, config) {
        this.player = player;
        this.name = config.name || 'Unknown Ability';
        this.description = config.description || '';
        this.key = config.key || '';
        this.cooldown = config.cooldown || 5000;
        this.energyCost = config.energyCost || 0;
        this.lastUsed = 0;
        this.level = config.level || 1;
        this.maxLevel = config.maxLevel || 5;
        this.unlocked = config.unlocked !== undefined ? config.unlocked : true;
        this.active = false;
        this.visualEffect = null;
        this.element = null;
        this.cooldownElement = null;
    }
    
    /**
     * Check if the ability can be used
     * @returns {boolean} - Whether the ability can be used
     */
    canUse() {
        if (!this.unlocked) return false;
        
        const now = Date.now();
        const onCooldown = now - this.lastUsed < this.cooldown;
        const hasEnergy = this.player.energy >= this.energyCost;
        
        return !onCooldown && hasEnergy && !this.active;
    }
    
    /**
     * Use the ability
     * @returns {boolean} - Whether the ability was used
     */
    use() {
        if (!this.canUse()) return false;
        
        // Consume energy
        this.player.energy -= this.energyCost;
        this.lastUsed = Date.now();
        
        return true;
    }
    
    /**
     * Update the ability's cooldown display
     */
    updateCooldownDisplay() {
        if (!this.cooldownElement) return;
        
        const now = Date.now();
        const remaining = Math.max(0, this.lastUsed + this.cooldown - now);
        const percentage = (remaining / this.cooldown) * 100;
        
        this.cooldownElement.style.height = percentage + '%';
    }
    
    /**
     * Initialize the UI element for this ability
     * @param {string} containerId - ID of the container element
     * @param {string} abilityId - ID to use for this ability's element
     * @param {string} icon - Icon to display
     */
    initializeUI(containerId, abilityId, icon) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // Create ability element
        this.element = document.createElement('div');
        this.element.className = 'ability';
        this.element.id = abilityId;
        
        // Add inner content
        this.element.innerHTML = `
            <div class="ability-icon">${icon}</div>
            <div class="ability-key">${this.key}</div>
            <div class="ability-level">Lv${this.level}</div>
            <div class="ability-cooldown"></div>
        `;
        
        // Store reference to cooldown element
        this.cooldownElement = this.element.querySelector('.ability-cooldown');
        
        // Add event listener
        this.element.addEventListener('click', () => this.use());
        
        // Add to container
        container.appendChild(this.element);
    }
    
    /**
     * Update the ability's level display
     */
    updateLevelDisplay() {
        if (!this.element) return;
        
        const levelElement = this.element.querySelector('.ability-level');
        if (levelElement) {
            levelElement.textContent = `Lv${this.level}`;
        }
    }
    
    /**
     * Clean up ability resources
     */
    destroy() {
        if (this.visualEffect && this.visualEffect.parentNode) {
            this.visualEffect.parentNode.removeChild(this.visualEffect);
            this.visualEffect = null;
        }
    }
    
    /**
     * Check if the ability is active
     * @returns {boolean} - Whether the ability is active
     */
    isActive() {
        return this.active;
    }
    
    /**
     * Upgrade the ability
     * @returns {boolean} - Whether the upgrade was successful
     */
    upgrade() {
        if (this.level >= this.maxLevel) return false;
        
        this.level++;
        this.updateLevelDisplay();
        
        return true;
    }
    
    /**
     * Unlock the ability
     * @returns {boolean} - Whether the unlock was successful
     */
    unlock() {
        if (this.unlocked) return false;
        
        this.unlocked = true;
        this.level = 1;
        
        return true;
    }
}

export default Ability;