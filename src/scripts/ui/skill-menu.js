import CONFIG from '../config.js';

/**
 * Skill Menu
 * Manages the skill upgrade/unlock menu UI
 */
export class SkillMenu {
    constructor(game) {
        this.game = game;
        this.player = game.player;
        this.gameContainer = game.gameContainer;
        
        // Get menu elements
        this.menuOverlay = document.getElementById('skill-menu-overlay');
        this.skillPointsDisplay = document.getElementById('available-skill-points');
        this.skillGrid = document.querySelector('.skill-grid');
        
        // Create menu if it doesn't exist
        this.ensureMenuExists();
        
        // Initialize event listeners
        this.initializeEventListeners();
        
        // Initialize skill cards
        this.ensureSkillCardsExist();
        
        // Track state
        this.isOpen = false;
    }
    
    /**
     * Ensure the skill menu elements exist
     */
    ensureMenuExists() {
        if (!this.menuOverlay) {
            this.menuOverlay = document.createElement('div');
            this.menuOverlay.id = 'skill-menu-overlay';
            this.menuOverlay.className = 'skill-menu-overlay';
            
            this.menuOverlay.innerHTML = `
                <div class="skill-menu">
                    <div class="skill-menu-header">
                        <h2>Vampiric Powers</h2>
                        <div class="skill-points-display">
                            Available Skill Points: <span id="available-skill-points">0</span>
                        </div>
                        <button class="skill-menu-close" id="skill-menu-close">Close</button>
                    </div>
                    
                    <div class="skill-grid"></div>
                </div>
            `;
            
            this.gameContainer.appendChild(this.menuOverlay);
            this.skillPointsDisplay = document.getElementById('available-skill-points');
            this.skillGrid = this.menuOverlay.querySelector('.skill-grid');
        }
    }
    
    /**
     * Initialize menu event listeners
     */
    initializeEventListeners() {
        // Close button
        const closeButton = document.getElementById('skill-menu-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.toggle());
        }
        
        // Skill points indicator
        const skillPointsIndicator = document.getElementById('skill-points');
        if (skillPointsIndicator) {
            skillPointsIndicator.addEventListener('click', () => this.toggle());
        }
    }
    
    /**
     * Create skill cards if they don't exist
     */
    ensureSkillCardsExist() {
        // Check if the skill cards already exist
        if (document.getElementById('auto-attack-card')) return;
        
        // Create skill cards for base abilities
        this.createSkillCard('auto-attack', 'Blood Bolt', 'Automatically fire projectiles at nearby enemies.', [
            { name: 'Damage', id: 'auto-attack-damage', value: this.player.autoAttack.damage.toString() },
            { name: 'Cooldown', id: 'auto-attack-cooldown', value: (this.player.autoAttack.cooldown / 1000) + 's' },
            { name: 'Range', id: 'auto-attack-range', value: this.player.autoAttack.range.toString() }
        ], this.player.autoAttack.level);
        
        // Get ability instances for current stats
        const abilities = this.player.abilityManager.abilities;
        const bloodDrain = abilities.get('bloodDrain');
        const batSwarm = abilities.get('batSwarm');
        const shadowDash = abilities.get('shadowDash');
        const bloodLance = abilities.get('bloodLance');
        const nightShield = abilities.get('nightShield');
        
        // Create ability cards
        this.createSkillCard('blood-drain', 'Blood Drain', bloodDrain.description, [
            { name: 'Damage/sec', id: 'blood-drain-damage', value: bloodDrain.getScaledDamage().toString() },
            { name: 'Healing/sec', id: 'blood-drain-healing', value: bloodDrain.getScaledHealing().toString() },
            { name: 'Range', id: 'blood-drain-range', value: bloodDrain.getScaledRange().toString() },
            { name: 'Duration', id: 'blood-drain-duration', value: (bloodDrain.duration / 1000) + 's' }
        ], bloodDrain.level);
        
        this.createSkillCard('bat-swarm', 'Bat Swarm', batSwarm.description, [
            { name: 'Damage', id: 'bat-swarm-damage', value: batSwarm.getScaledDamage().toString() },
            { name: 'Bat Count', id: 'bat-swarm-count', value: batSwarm.getScaledCount().toString() },
            { name: 'Cooldown', id: 'bat-swarm-cooldown', value: (batSwarm.cooldown / 1000) + 's' }
        ], batSwarm.level);
        
        this.createSkillCard('shadow-dash', 'Shadow Dash', shadowDash.description, [
            { name: 'Damage', id: 'shadow-dash-damage', value: shadowDash.getScaledDamage().toString() },
            { name: 'Distance', id: 'shadow-dash-distance', value: shadowDash.getScaledDistance().toString() },
            { name: 'Invulnerability', id: 'shadow-dash-invuln', value: (shadowDash.getScaledInvulnerabilityTime() / 1000) + 's' }
        ], shadowDash.level);
        
        // Create skill cards for unlockable abilities
        this.createSkillCard('blood-lance', 'Blood Lance', bloodLance.description, [
            { name: 'Damage', id: 'blood-lance-damage', value: bloodLance.getScaledDamage().toString() },
            { name: 'Pierce Count', id: 'blood-lance-pierce', value: bloodLance.getScaledPierce().toString() },
            { name: 'Heal per Hit', id: 'blood-lance-healing', value: bloodLance.getScaledHealing().toString() }
        ], bloodLance.level, true, CONFIG.ABILITIES.BLOOD_LANCE.UNLOCK_LEVEL);
        
        this.createSkillCard('night-shield', 'Night Shield', nightShield.description, [
            { name: 'Shield Amount', id: 'night-shield-amount', value: nightShield.getScaledShieldAmount().toString() },
            { name: 'Duration', id: 'night-shield-duration', value: (nightShield.duration / 1000) + 's' },
            { name: 'Explosion Damage', id: 'night-shield-explosion', value: nightShield.getScaledExplosionDamage().toString() }
        ], nightShield.level, true, CONFIG.ABILITIES.NIGHT_SHIELD.UNLOCK_LEVEL);
        
        // Initialize upgrade buttons
        this.initializeUpgradeButtons();
    }
    
    /**
     * Create a skill card element
     * @param {string} id - Skill ID
     * @param {string} name - Skill name
     * @param {string} description - Skill description
     * @param {Array} effects - Array of effect objects { name, id, value }
     * @param {number} level - Current skill level
     * @param {boolean} locked - Whether the skill is locked initially
     * @param {number} unlockLevel - Level required to unlock the skill
     */
    createSkillCard(id, name, description, effects, level = 0, locked = false, unlockLevel = 0) {
        // Create card element
        const card = document.createElement('div');
        card.className = 'skill-card';
        card.id = `${id}-card`;
        
        // Add "New!" badge for unlockable abilities
        if (locked) {
            const badge = document.createElement('div');
            badge.className = 'new-ability-badge';
            badge.textContent = 'New!';
            card.appendChild(badge);
        }
        
        // Add header
        const header = document.createElement('div');
        header.className = 'skill-card-header';
        header.innerHTML = `<h3>${name}</h3>`;
        card.appendChild(header);
        
        // Add level pips
        const levelContainer = document.createElement('div');
        levelContainer.className = 'skill-level';
        
        for (let i = 0; i < 5; i++) {
            const pip = document.createElement('div');
            pip.className = 'level-pip';
            if (i < level) {
                pip.classList.add('filled');
            }
            levelContainer.appendChild(pip);
        }
        
        card.appendChild(levelContainer);
        
        // Add description
        const desc = document.createElement('div');
        desc.className = 'skill-description';
        desc.textContent = description;
        card.appendChild(desc);
        
        // Add effects
        const effectsContainer = document.createElement('div');
        effectsContainer.className = 'skill-effects';
        
        effects.forEach(effect => {
            const effectElement = document.createElement('div');
            effectElement.className = 'skill-effect';
            effectElement.innerHTML = `
                <span class="skill-effect-name">${effect.name}:</span>
                <span class="skill-effect-value" id="${effect.id}">${effect.value}</span>
            `;
            effectsContainer.appendChild(effectElement);
        });
        
        card.appendChild(effectsContainer);
        
        // Add upgrade button
        const button = document.createElement('button');
        button.className = 'skill-upgrade-btn';
        button.id = `${id}-upgrade`;
        button.textContent = locked ? 'Unlock (3 Points)' : 'Upgrade (1 Point)';
        card.appendChild(button);
        
        // Add locked overlay if needed
        if (locked) {
            const lockedOverlay = document.createElement('div');
            lockedOverlay.className = 'skill-locked';
            lockedOverlay.id = `${id}-locked`;
            lockedOverlay.innerHTML = `<div class="skill-locked-message">Unlocks at Level ${unlockLevel}</div>`;
            card.appendChild(lockedOverlay);
        }
        
        // Add to skill grid
        this.skillGrid.appendChild(card);
        
        return card;
    }
    
    /**
     * Initialize skill upgrade buttons
     */
    initializeUpgradeButtons() {
        // Auto Attack upgrade
        document.getElementById('auto-attack-upgrade').addEventListener('click', () => {
            this.game.upgradeSkill('autoAttack');
            this.update();
        });
        
        // Blood Drain upgrade
        document.getElementById('blood-drain-upgrade').addEventListener('click', () => {
            this.game.upgradeSkill('bloodDrain');
            this.update();
        });
        
        // Bat Swarm upgrade
        document.getElementById('bat-swarm-upgrade').addEventListener('click', () => {
            this.game.upgradeSkill('batSwarm');
            this.update();
        });
        
        // Shadow Dash upgrade
        document.getElementById('shadow-dash-upgrade').addEventListener('click', () => {
            this.game.upgradeSkill('shadowDash');
            this.update();
        });
        
        // Blood Lance upgrade/unlock
        document.getElementById('blood-lance-upgrade').addEventListener('click', () => {
            this.game.upgradeSkill('bloodLance');
            this.update();
        });
        
        // Night Shield upgrade/unlock
        document.getElementById('night-shield-upgrade').addEventListener('click', () => {
            this.game.upgradeSkill('nightShield');
            this.update();
        });
    }
    
    /**
     * Update skill card levels and values
     */
    update() {
        const player = this.player;
        
        // Update available skill points
        this.skillPointsDisplay.textContent = player.skillPoints;
        
        // Update Auto Attack card
        this.updateSkillCardPips('auto-attack', player.autoAttack.level);
        document.getElementById('auto-attack-damage').textContent = player.autoAttack.damage;
        document.getElementById('auto-attack-cooldown').textContent = (player.autoAttack.cooldown / 1000) + 's';
        document.getElementById('auto-attack-range').textContent = player.autoAttack.range;
        
        // Update ability cards through ability manager
        const abilities = player.abilityManager.abilities;
        
        // Blood Drain
        const bloodDrain = abilities.get('bloodDrain');
        this.updateSkillCardPips('blood-drain', bloodDrain.level);
        document.getElementById('blood-drain-damage').textContent = bloodDrain.getScaledDamage();
        document.getElementById('blood-drain-healing').textContent = bloodDrain.getScaledHealing();
        document.getElementById('blood-drain-range').textContent = bloodDrain.getScaledRange();
        document.getElementById('blood-drain-duration').textContent = (bloodDrain.duration / 1000) + 's';
        
        // Bat Swarm
        const batSwarm = abilities.get('batSwarm');
        this.updateSkillCardPips('bat-swarm', batSwarm.level);
        document.getElementById('bat-swarm-damage').textContent = batSwarm.getScaledDamage();
        document.getElementById('bat-swarm-count').textContent = batSwarm.getScaledCount();
        document.getElementById('bat-swarm-cooldown').textContent = (batSwarm.cooldown / 1000) + 's';
        
        // Shadow Dash
        const shadowDash = abilities.get('shadowDash');
        this.updateSkillCardPips('shadow-dash', shadowDash.level);
        document.getElementById('shadow-dash-damage').textContent = shadowDash.getScaledDamage();
        document.getElementById('shadow-dash-distance').textContent = shadowDash.getScaledDistance();
        document.getElementById('shadow-dash-invuln').textContent = (shadowDash.getScaledInvulnerabilityTime() / 1000) + 's';
        
        // Blood Lance
        const bloodLance = abilities.get('bloodLance');
        this.updateSkillCardPips('blood-lance', bloodLance.level);
        document.getElementById('blood-lance-damage').textContent = bloodLance.getScaledDamage();
        document.getElementById('blood-lance-pierce').textContent = bloodLance.getScaledPierce();
        document.getElementById('blood-lance-healing').textContent = bloodLance.getScaledHealing();
        
        // Night Shield
        const nightShield = abilities.get('nightShield');
        this.updateSkillCardPips('night-shield', nightShield.level);
        document.getElementById('night-shield-amount').textContent = nightShield.getScaledShieldAmount();
        document.getElementById('night-shield-duration').textContent = (nightShield.duration / 1000) + 's';
        document.getElementById('night-shield-explosion').textContent = nightShield.getScaledExplosionDamage();
        
        // Update button states
        this.updateUpgradeButtonStates();
    }
    
    /**
     * Update skill card level pips
     * @param {string} skillId - Skill ID
     * @param {number} level - Current skill level
     */
    updateSkillCardPips(skillId, level) {
        const card = document.getElementById(skillId + '-card');
        if (!card) return;
        
        const pips = card.querySelectorAll('.level-pip');
        for (let i = 0; i < pips.length; i++) {
            if (i < level) {
                pips[i].classList.add('filled');
            } else {
                pips[i].classList.remove('filled');
            }
        }
    }
    
    /**
     * Update the state of upgrade buttons
     */
    updateUpgradeButtonStates() {
        const player = this.player;
        
        // Disable upgrade buttons if no skill points or max level reached
        document.getElementById('auto-attack-upgrade').disabled = 
            (player.skillPoints < 1 || player.autoAttack.level >= player.autoAttack.maxLevel);
            
        const abilities = player.abilityManager.abilities;
        
        // Blood Drain
        document.getElementById('blood-drain-upgrade').disabled = 
            (player.skillPoints < 1 || abilities.get('bloodDrain').level >= abilities.get('bloodDrain').maxLevel);
            
        // Bat Swarm
        document.getElementById('bat-swarm-upgrade').disabled = 
            (player.skillPoints < 1 || abilities.get('batSwarm').level >= abilities.get('batSwarm').maxLevel);
            
        // Shadow Dash
        document.getElementById('shadow-dash-upgrade').disabled = 
            (player.skillPoints < 1 || abilities.get('shadowDash').level >= abilities.get('shadowDash').maxLevel);
        
        // Blood Lance
        const bloodLance = abilities.get('bloodLance');
        const bloodLanceUnlockLevel = CONFIG.ABILITIES.BLOOD_LANCE.UNLOCK_LEVEL;
        
        if (player.level < bloodLanceUnlockLevel || bloodLance.level >= bloodLance.maxLevel) {
            document.getElementById('blood-lance-upgrade').disabled = true;
        } else if (bloodLance.unlocked) {
            document.getElementById('blood-lance-upgrade').disabled = (player.skillPoints < 1);
            document.getElementById('blood-lance-upgrade').textContent = "Upgrade (1 Point)";
        } else {
            document.getElementById('blood-lance-upgrade').disabled = (player.skillPoints < CONFIG.UI.SKILL_MENU.BLOOD_LANCE_UNLOCK_COST);
        }
        
        // Update unlock overlay
        if (player.level >= bloodLanceUnlockLevel && document.getElementById('blood-lance-locked')) {
            document.getElementById('blood-lance-locked').style.display = 'none';
        }
        
        // Night Shield
        const nightShield = abilities.get('nightShield');
        const nightShieldUnlockLevel = CONFIG.ABILITIES.NIGHT_SHIELD.UNLOCK_LEVEL;
        
        if (player.level < nightShieldUnlockLevel || nightShield.level >= nightShield.maxLevel) {
            document.getElementById('night-shield-upgrade').disabled = true;
        } else if (nightShield.unlocked) {
            document.getElementById('night-shield-upgrade').disabled = (player.skillPoints < 1);
            document.getElementById('night-shield-upgrade').textContent = "Upgrade (1 Point)";
        } else {
            document.getElementById('night-shield-upgrade').disabled = (player.skillPoints < CONFIG.UI.SKILL_MENU.NIGHT_SHIELD_UNLOCK_COST);
        }
        
        // Update unlock overlay
        if (player.level >= nightShieldUnlockLevel && document.getElementById('night-shield-locked')) {
            document.getElementById('night-shield-locked').style.display = 'none';
        }
    }
    
    /**
     * Toggle the skill menu
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    /**
     * Open the skill menu
     */
    open() {
        this.menuOverlay.style.display = 'flex';
        this.player.showingSkillMenu = true;
        this.isOpen = true;
        
        // Update content
        this.update();
        
        // Pause game
        if (this.game.gameLoop) {
            this.game.gameLoop.pauseGame(this.game.gameContainer);
        }
    }
    
    /**
     * Close the skill menu
     */
    close() {
        this.menuOverlay.style.display = 'none';
        this.player.showingSkillMenu = false;
        this.isOpen = false;
        
        // Resume game
        if (this.game.gameLoop) {
            this.game.gameLoop.resumeGame();
        }
    }
    
    /**
     * Reset the skill menu to initial state
     */
    reset() {
        // Close menu if open
        if (this.isOpen) {
            this.close();
        }
    }
}

export default SkillMenu;