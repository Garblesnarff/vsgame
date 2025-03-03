import CONFIG from '../config.js';
import { Ability } from './ability-base.js';
import { BloodDrain } from './blood-drain.js';
import { BatSwarm } from './bat-swarm.js';
import { ShadowDash } from './shadow-dash.js';
import { BloodLance } from './blood-lance.js';
import { NightShield } from './night-shield.js';
import { Player } from '../entities/player.js';
import { Enemy } from '../entities/enemy.js';

/**
 * Manages all player abilities
 */
export class AbilityManager {
    player: Player;
    abilities: Map<string, Ability>;
    
    /**
     * Create a new ability manager
     * @param player - The player that owns these abilities
     */
    constructor(player: Player) {
        this.player = player;
        this.abilities = new Map<string, Ability>();
        
        // Initialize abilities
        this.initializeAbilities();
    }
    
    /**
     * Initialize all abilities
     */
    initializeAbilities(): void {
        // Create base abilities
        this.abilities.set('bloodDrain', new BloodDrain(this.player, CONFIG.ABILITIES.BLOOD_DRAIN));
        this.abilities.set('batSwarm', new BatSwarm(this.player, CONFIG.ABILITIES.BAT_SWARM));
        this.abilities.set('shadowDash', new ShadowDash(this.player, CONFIG.ABILITIES.SHADOW_DASH));
        
        // Create locked abilities
        this.abilities.set('bloodLance', new BloodLance(this.player, CONFIG.ABILITIES.BLOOD_LANCE));
        this.abilities.set('nightShield', new NightShield(this.player, CONFIG.ABILITIES.NIGHT_SHIELD));
    }
    
    /**
     * Initialize ability UI elements
     */
    initializeUI(): void {
        // Initialize base abilities UI
        this.abilities.get('bloodDrain')?.initializeUI('abilities', 'blood-drain', '🩸');
        this.abilities.get('batSwarm')?.initializeUI('abilities', 'bat-swarm', '🦇');
        this.abilities.get('shadowDash')?.initializeUI('abilities', 'shadow-dash', '💨');
        
        // Locked abilities UI won't be initialized until they're unlocked
    }
    
    /**
     * Get an ability by name
     * @param name - Name of the ability
     * @returns The ability object or undefined if not found
     */
    getAbility(name: string): Ability | undefined {
        return this.abilities.get(name);
    }
    
    /**
     * Update all abilities
     * @param deltaTime - Time since last update
     * @param enemies - Array of enemies in the game
     */
    update(deltaTime: number, enemies: Enemy[] = []): void {
        // Update cooldown displays
        for (const ability of this.abilities.values()) {
            ability.updateCooldownDisplay();
        }
        
        // Update active abilities
        for (const ability of this.abilities.values()) {
            if (ability.isActive()) {
                ability.update(deltaTime, enemies);
            }
        }
    }
    
    /**
     * Check if abilities can be unlocked based on player level
     */
    checkUnlockableAbilities(): void {
        const bloodLance = this.abilities.get('bloodLance');
        const nightShield = this.abilities.get('nightShield');
        
        // Blood Lance unlocks at level 3
        if (this.player.level >= CONFIG.ABILITIES.BLOOD_LANCE.UNLOCK_LEVEL && 
            bloodLance && !bloodLance.unlocked) {
            const lockedElement = document.getElementById('blood-lance-locked');
            if (lockedElement) {
                lockedElement.style.display = 'none';
            }
        }
        
        // Night Shield unlocks at level 5
        if (this.player.level >= CONFIG.ABILITIES.NIGHT_SHIELD.UNLOCK_LEVEL && 
            nightShield && !nightShield.unlocked) {
            const lockedElement = document.getElementById('night-shield-locked');
            if (lockedElement) {
                lockedElement.style.display = 'none';
            }
        }
    }
    
    /**
     * Unlock an ability
     * @param abilityName - Name of the ability to unlock
     * @returns Whether the unlock was successful
     */
    unlockAbility(abilityName: string): boolean {
        const ability = this.abilities.get(abilityName);
        if (!ability || ability.unlocked) return false;
        
        // Unlock the ability
        ability.unlock();
        
        // Initialize UI for newly unlocked ability
        if (abilityName === 'bloodLance') {
            ability.initializeUI('abilities', 'blood-lance', '🗡️');
        } else if (abilityName === 'nightShield') {
            ability.initializeUI('abilities', 'night-shield', '🛡️');
        }
        
        return true;
    }
    
    /**
     * Upgrade an ability
     * @param abilityName - Name of the ability to upgrade
     * @returns Whether the upgrade was successful
     */
    upgradeAbility(abilityName: string): boolean {
        const ability = this.abilities.get(abilityName);
        if (!ability || !ability.unlocked || ability.level >= ability.maxLevel) return false;
        
        return ability.upgrade();
    }
    
    /**
     * Reset all abilities to initial state
     */
    reset(): void {
        // Clean up ability resources
        for (const ability of this.abilities.values()) {
            ability.destroy();
        }
        
        // Reinitialize abilities
        this.abilities.clear();
        this.initializeAbilities();
    }
}

export default AbilityManager;