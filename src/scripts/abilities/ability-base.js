import { GameEvents, EVENTS } from '../utils/event-system.js';

/**
 * @typedef {Object} AbilityConfig
 * @property {string} name - The name of the ability
 * @property {string} description - Description of what the ability does
 * @property {string} key - Keyboard key associated with the ability
 * @property {number} cooldown - Cooldown time in milliseconds
 * @property {number} energyCost - Energy cost to use the ability
 * @property {number} level - Current ability level (default 1)
 * @property {number} maxLevel - Maximum level for this ability (default 5)
 * @property {boolean} [unlocked=true] - Whether the ability is unlocked
 */

/**
 * Base class for all player abilities
 * 
 * This serves as the foundation for all abilities in the game,
 * providing common functionality like cooldowns, energy costs,
 * UI representation, and leveling.
 * 
 * @class
 */
export class Ability {
    /**
     * Create a new ability
     * 
     * @param {Object} player - The player that owns this ability
     * @param {AbilityConfig} config - Configuration for the ability
     */
    constructor(player, config) {
        /**
         * The player that owns this ability
         * @type {Object}
         */
        this.player = player;
        
        /**
         * The name of the ability
         * @type {string}
         */
        this.name = config.name || 'Unknown Ability';
        
        /**
         * Description of what the ability does
         * @type {string}
         */
        this.description = config.description || '';
        
        /**
         * Keyboard key associated with the ability
         * @type {string}
         */
        this.key = config.key || '';
        
        /**
         * Cooldown time in milliseconds
         * @type {number}
         */
        this.cooldown = config.cooldown || 5000;
        
        /**
         * Energy cost to use the ability
         * @type {number}
         */
        this.energyCost = config.energyCost || 0;
        
        /**
         * Timestamp of when the ability was last used
         * @type {number}
         */
        this.lastUsed = 0;
        
        /**
         * Current ability level
         * @type {number}
         */
        this.level = config.level || 1;
        
        /**
         * Maximum level for this ability
         * @type {number}
         */
        this.maxLevel = config.maxLevel || 5;
        
        /**
         * Whether the ability is unlocked
         * @type {boolean}
         */
        this.unlocked = config.unlocked !== undefined ? config.unlocked : true;
        
        /**
         * Whether the ability is currently active
         * @type {boolean}
         */
        this.active = false;
        
        /**
         * Visual effect element for the ability
         * @type {HTMLElement|null}
         */
        this.visualEffect = null;
        
        /**
         * UI element for the ability
         * @type {HTMLElement|null}
         */
        this.element = null;
        
        /**
         * UI element for the cooldown display
         * @type {HTMLElement|null}
         */
        this.cooldownElement = null;
    }
    
    /**
     * Check if the ability can be used
     * 
     * Verifies that:
     * 1. The ability is unlocked
     * 2. The cooldown has expired
     * 3. The player has enough energy
     * 4. The ability isn't already active
     * 
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
     * 
     * This is the base implementation that:
     * 1. Checks if the ability can be used
     * 2. Consumes energy
     * 3. Sets the last used timestamp
     * 4. Emits the ability use event
     * 
     * Subclasses should override this to implement specific ability behaviors
     * but should call super.use() first to handle these common operations.
     * 
     * @returns {boolean} - Whether the ability was successfully used
     */
    use() {
        if (!this.canUse()) return false;
        
        // Consume energy
        this.player.energy -= this.energyCost;
        this.lastUsed = Date.now();
        
        // Emit ability use event
        GameEvents.emit(EVENTS.ABILITY_USE, this.name, this.player);
        
        return true;
    }
    
    /**
     * Update the ability's cooldown display in the UI
     * 
     * This updates the visual representation of the cooldown in the UI,
     * showing how much time is left before the ability can be used again.
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
     * 
     * Creates and configures the DOM elements needed to display this ability
     * in the UI, including the icon, key binding, level indicator, and cooldown display.
     * 
     * @param {string} containerId - ID of the container element
     * @param {string} abilityId - ID to use for this ability's element
     * @param {string} icon - Icon to display (emoji or character)
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
     * Update the ability's level display in the UI
     * 
     * Updates the level indicator in the UI to reflect the current ability level.
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
     * 
     * Removes any DOM elements or other resources created by this ability.
     * Should be called when the ability is no longer needed or the game is reset.
     */
    destroy() {
        if (this.visualEffect && this.visualEffect.parentNode) {
            this.visualEffect.parentNode.removeChild(this.visualEffect);
            this.visualEffect = null;
        }
    }
    
    /**
     * Check if the ability is currently active
     * 
     * @returns {boolean} - Whether the ability is active
     */
    isActive() {
        return this.active;
    }
    
    /**
     * Upgrade the ability to the next level
     * 
     * Increases the ability's level and updates the UI to reflect the change.
     * Abilities typically gain improved effects at higher levels.
     * 
     * @returns {boolean} - Whether the upgrade was successful
     */
    upgrade() {
        if (this.level >= this.maxLevel) return false;
        
        this.level++;
        this.updateLevelDisplay();
        
        // Emit upgrade event
        GameEvents.emit(EVENTS.ABILITY_UPGRADE, this.name, this.player);
        
        return true;
    }
    
    /**
     * Unlock the ability
     * 
     * Makes the ability available for use. Some abilities start locked
     * and must be unlocked through progression.
     * 
     * @returns {boolean} - Whether the unlock was successful
     */
    unlock() {
        if (this.unlocked) return false;
        
        this.unlocked = true;
        this.level = 1;
        
        // Emit unlock event
        GameEvents.emit(EVENTS.ABILITY_UNLOCK, this.name, this.player);
        
        return true;
    }
    
    /**
     * Update the ability state
     * 
     * This method is meant to be overridden by subclasses to implement
     * the specific update logic for each ability type.
     * 
     * @param {number} deltaTime - Time in milliseconds since the last update
     * @param {Array} [enemies=[]] - List of enemies in the game
     */
    update(deltaTime, enemies = []) {
        // Base implementation does nothing
        // Override in subclasses to implement ability-specific behavior
    }
}

export default Ability;