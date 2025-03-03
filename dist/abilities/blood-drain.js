import { Ability } from "./ability-base";
import { Particle } from "../entities/particle";
/**
 * Blood Drain ability - Drains health from nearby enemies
 */
export class BloodDrain extends Ability {
    /**
     * Create a new Blood Drain ability
     * @param player - The player that owns this ability
     * @param config - Configuration for the ability
     */
    constructor(player, config) {
        super(player, {
            name: "Blood Drain",
            description: "Drain blood from nearby enemies, damaging them and healing yourself",
            key: "1",
            cooldown: config.COOLDOWN,
            energyCost: config.ENERGY_COST,
            level: 1,
            maxLevel: config.MAX_LEVEL,
        });
        this.range = config.RANGE;
        this.damage = config.DAMAGE;
        this.healAmount = config.HEAL_AMOUNT;
        this.duration = config.DURATION;
        this.activeSince = 0;
    }
    /**
     * Toggle the blood drain ability
     * @returns Whether the ability state was changed
     */
    use() {
        // If already active, deactivate
        if (this.active) {
            this.deactivate();
            return true;
        }
        // Otherwise, try to activate
        if (!super.use()) {
            return false;
        }
        this.activate();
        return true;
    }
    /**
     * Activate the blood drain ability
     */
    activate() {
        this.active = true;
        this.activeSince = Date.now();
        // Create visual effect for the blood drain area
        this.visualEffect = document.createElement("div");
        this.visualEffect.className = "blood-drain-aoe";
        const range = this.getScaledRange();
        this.visualEffect.style.width = range * 2 + "px";
        this.visualEffect.style.height = range * 2 + "px";
        this.visualEffect.style.left =
            this.player.x + this.player.width / 2 - range + "px";
        this.visualEffect.style.top =
            this.player.y + this.player.height / 2 - range + "px";
        this.player.gameContainer.appendChild(this.visualEffect);
        // Deactivate after duration
        setTimeout(() => {
            this.deactivate();
        }, this.duration);
    }
    /**
     * Deactivate the blood drain ability
     */
    deactivate() {
        this.active = false;
        // Remove visual effect
        if (this.visualEffect && this.visualEffect.parentNode) {
            this.visualEffect.parentNode.removeChild(this.visualEffect);
            this.visualEffect = null;
        }
    }
    /**
     * Update the blood drain effect
     * @param deltaTime - Time since last update in ms
     * @param enemies - Array of enemy objects
     */
    update(deltaTime, enemies = []) {
        if (!this.active) {
            return;
        }
        // Update visual effect position to follow player
        if (this.visualEffect) {
            const range = this.getScaledRange();
            this.visualEffect.style.left =
                this.player.x + this.player.width / 2 - range + "px";
            this.visualEffect.style.top =
                this.player.y + this.player.height / 2 - range + "px";
        }
        // Create pulsing effect around player (occasionally)
        if (Math.random() < 0.1) {
            Particle.createBloodNova(this.player.gameContainer, this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
        }
        // Process enemies within range
        if (enemies.length > 0) {
            this.processEnemies(enemies, deltaTime);
        }
        // Check if the duration has expired
        if (Date.now() - this.activeSince >= this.duration) {
            this.deactivate();
        }
    }
    /**
     * Process enemies within range of the blood drain
     * @param enemies - Array of enemy objects
     * @param deltaTime - Time since last update in ms
     */
    processEnemies(enemies, deltaTime) {
        const range = this.getScaledRange();
        const damage = this.getScaledDamage() * (deltaTime / 1000);
        const healing = this.getScaledHealing() * (deltaTime / 1000);
        let healingApplied = false;
        for (const enemy of enemies) {
            const dx = enemy.x + enemy.width / 2 - (this.player.x + this.player.width / 2);
            const dy = enemy.y + enemy.height / 2 - (this.player.y + this.player.height / 2);
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= range) {
                // Enemy is in range of blood drain
                enemy.takeDamage(damage, (x, y, count) => {
                    Particle.createBloodParticles(this.player.gameContainer, x, y, count);
                });
                // Track that we applied healing
                healingApplied = true;
                // Create blood particles flowing from enemy to player (occasionally)
                if (Math.random() < 0.2) {
                    Particle.createBloodParticles(this.player.gameContainer, enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 1);
                }
            }
        }
        // Only heal player if at least one enemy was drained
        if (healingApplied) {
            this.player.heal(healing);
        }
    }
    /**
     * Get damage scaled by ability level
     * @returns Scaled damage
     */
    getScaledDamage() {
        return this.damage + (this.level - 1) * 20;
    }
    /**
     * Get healing scaled by ability level
     * @returns Scaled healing
     */
    getScaledHealing() {
        return this.healAmount + (this.level - 1) * 10;
    }
    /**
     * Get range scaled by ability level
     * @returns Scaled range
     */
    getScaledRange() {
        return this.range + (this.level - 1) * 20;
    }
    /**
     * Upgrade the ability
     * @returns Whether the upgrade was successful
     */
    upgrade() {
        if (!super.upgrade()) {
            return false;
        }
        // Update visual effect size if active
        if (this.active && this.visualEffect) {
            const range = this.getScaledRange();
            this.visualEffect.style.width = range * 2 + "px";
            this.visualEffect.style.height = range * 2 + "px";
            this.visualEffect.style.left =
                this.player.x + this.player.width / 2 - range + "px";
            this.visualEffect.style.top =
                this.player.y + this.player.height / 2 - range + "px";
        }
        return true;
    }
}
export default BloodDrain;
//# sourceMappingURL=blood-drain.js.map