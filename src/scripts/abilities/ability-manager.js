import CONFIG from '../config.js';
import { BloodDrain } from './blood-drain.js';
import { BatSwarm } from './bat-swarm.js';
import { ShadowDash } from './shadow-dash.js';
import { BloodLance } from './blood-lance.js';
import { NightShield } from './night-shield.js';

/**
 * Manages all player abilities
 */
export class AbilityManager {
    constructor(player) {
        this.player = player;
        this.abilities = new Map();
        
        // Initialize abilities
        this.initializeAbilities();
    }
    
    /**
     * Initialize all abilities
     */
    initializeAbilities() {
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
    initializeUI() {
        // Initialize base abilities UI
        this.abilities.get('bloodDrain').initializeUI('abilities', 'blood-drain', '🩸');
        this.abilities.get('batSwarm').initializeUI('abilities', 'bat-swarm', '🦇');
        this.abilities.get('shadowDash').initializeUI('abilities', 'shadow-dash', '💨');
        
        // Locked abilities UI won't be initialized until they're unlocked
    }
    
    /**
     * Get an ability by name
     * @param {string} name - Name of the ability
     * @returns {Ability} - The ability object
     */
    getAbility(name) {
        return this.abilities.get(name);
    }
    
    /**
     * Update all abilities
     * @param {number} deltaTime - Time since last update
     */
    update(deltaTime) {
        // Update cooldown displays
        for (const ability of this.abilities.values()) {
            ability.updateCooldownDisplay();
        }
        
        // Update active abilities
        for (const ability of this.abilities.values()) {
            if (ability.isActive()) {
                ability.update(deltaTime);
            }
        }
    }
    
    /**
     * Check if abilities can be unlocked based on player level
     */
    checkUnlockableAbilities() {
        const bloodLance = this.abilities.get('bloodLance');
        const nightShield = this.abilities.get('nightShield');
        
        // Blood Lance unlocks at level 3
        if (this.player.level >= CONFIG.ABILITIES.BLOOD_LANCE.UNLOCK_LEVEL && 
            !bloodLance.unlocked && document.getElementById('blood-lance-locked')) {
            document.getElementById('blood-lance-locked').style.display = 'none';
        }
        
        // Night Shield unlocks at level 5
        if (this.player.level >= CONFIG.ABILITIES.NIGHT_SHIELD.UNLOCK_LEVEL && 
            !nightShield.unlocked && document.getElementById('night-shield-locked')) {
            document.getElementById('night-shield-locked').style.display = 'none';
        }
    }
    
    /**
     * Unlock an ability
     * @param {string} abilityName - Name of the ability to unlock
     * @returns {boolean} - Whether the unlock was successful
     */
    unlockAbility(abilityName) {
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
     * @param {string} abilityName - Name of the ability to upgrade
     * @returns {boolean} - Whether the upgrade was successful
     */
    upgradeAbility(abilityName) {
        const ability = this.abilities.get(abilityName);
        if (!ability || !ability.unlocked || ability.level >= ability.maxLevel) return false;
        
        return ability.upgrade();
    }
    
    /**
     * Reset all abilities to initial state
     */
    reset() {
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