/**
 * Ability Bar
 * Manages the visual representation of player abilities in the UI
 */
export class AbilityBar {
    /**
     * Create a new ability bar
     * @param gameContainer - DOM element for the game container
     * @param abilityManager - Ability manager instance
     */
    constructor(gameContainer, abilityManager) {
        this.gameContainer = gameContainer;
        this.abilityManager = abilityManager;
        this.container = document.getElementById("abilities");
        this.abilityElements = new Map();
        // Create container if it doesn't exist
        if (!this.container) {
            this.container = document.createElement("div");
            this.container.id = "abilities";
            this.gameContainer.appendChild(this.container);
        }
    }
    /**
     * Initialize the ability bar with the player's abilities
     */
    initialize() {
        // Clear existing elements
        if (this.container) {
            this.container.innerHTML = "";
        }
        this.abilityElements.clear();
        // Initialize starting abilities
        this.addAbility("bloodDrain", "🩸", "1");
        this.addAbility("batSwarm", "🦇", "2");
        this.addAbility("shadowDash", "💨", "3");
    }
    /**
     * Add an ability to the ability bar
     * @param abilityId - ID of the ability
     * @param icon - Icon to display
     * @param key - Hotkey
     * @returns The created ability element or null if creation failed
     */
    addAbility(abilityId, icon, key) {
        const ability = this.abilityManager.getAbility(abilityId);
        if (!ability || !this.container) {
            return null;
        }
        // Create ability element
        const element = document.createElement("div");
        element.className = "ability";
        element.id = abilityId.replace(/([A-Z])/g, "-$1").toLowerCase(); // camelCase to kebab-case
        // Add inner content
        element.innerHTML = `
            <div class="ability-icon">${icon}</div>
            <div class="ability-key">${key}</div>
            <div class="ability-level">Lv${ability.level}</div>
            <div class="ability-cooldown"></div>
        `;
        // Add event listener
        element.addEventListener("click", () => ability.use());
        // Add to container
        this.container.appendChild(element);
        // Store reference to element
        this.abilityElements.set(abilityId, {
            element: element,
            cooldownElement: element.querySelector(".ability-cooldown"),
            levelElement: element.querySelector(".ability-level"),
        });
        return element;
    }
    /**
     * Remove an ability from the ability bar
     * @param abilityId - ID of the ability to remove
     */
    removeAbility(abilityId) {
        const abilityElement = this.abilityElements.get(abilityId);
        if (abilityElement && abilityElement.element && this.container) {
            this.container.removeChild(abilityElement.element);
            this.abilityElements.delete(abilityId);
        }
    }
    /**
     * Update the ability bar UI (cooldowns, levels, etc.)
     */
    update() {
        const now = Date.now();
        for (const [abilityId, elements] of this.abilityElements.entries()) {
            const ability = this.abilityManager.getAbility(abilityId);
            if (!ability) {
                continue;
            }
            // Update cooldown
            if (elements.cooldownElement) {
                const cooldownRemaining = Math.max(0, ability.lastUsed + ability.cooldown - now);
                const cooldownPercentage = (cooldownRemaining / ability.cooldown) * 100;
                elements.cooldownElement.style.height = `${cooldownPercentage}%`;
            }
            // Update level
            if (elements.levelElement) {
                elements.levelElement.textContent = `Lv${ability.level}`;
            }
        }
    }
    /**
     * Add an unlocked ability to the bar
     * @param abilityId - ID of the ability
     * @param icon - Icon to display
     * @param key - Hotkey
     */
    addUnlockedAbility(abilityId, icon, key) {
        return this.addAbility(abilityId, icon, key);
    }
    /**
     * Reset the ability bar to its initial state
     */
    reset() {
        this.initialize();
    }
}
export default AbilityBar;
//# sourceMappingURL=ability-bar.js.map