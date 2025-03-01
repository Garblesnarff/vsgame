/**
 * UI Manager
 * Handles all game UI elements and displays
 */
export class UIManager {
    constructor(game) {
        this.game = game;
        
        // Get DOM elements
        this.healthBar = document.getElementById('health-bar');
        this.energyBar = document.getElementById('energy-bar');
        this.timeElement = document.getElementById('time');
        this.levelElement = document.getElementById('level');
        this.killsElement = document.getElementById('kills');
        this.gameOverElement = document.getElementById('game-over');
        this.finalScoreElement = document.getElementById('final-score');
        this.levelUpElement = document.getElementById('level-up');
        this.autoAttackToggle = document.getElementById('auto-attack-toggle');
        this.skillPointsElement = document.getElementById('skill-points');
        this.skillPointsCount = document.getElementById('skill-points-count');
        this.skillMenuOverlay = document.getElementById('skill-menu-overlay');
        this.availableSkillPoints = document.getElementById('available-skill-points');
        this.skillGrid = document.querySelector('.skill-grid');
        
        // Initialize UI event listeners
        this.initializeEventListeners();
        
        // Initialize skill menu
        this.initializeSkillMenu();
    }
    
    /**
     * Initialize UI event listeners
     */
    initializeEventListeners() {
        // Auto-attack toggle
        this.autoAttackToggle.addEventListener('click', () => {
            this.game.player.autoAttack.enabled = !this.game.player.autoAttack.enabled;
            this.updateAutoAttackToggle();
        });
        
        // Skill points display
        this.skillPointsElement.addEventListener('click', () => {
            this.game.toggleSkillMenu();
        });
        
        // Skill menu close button
        document.getElementById('skill-menu-close').addEventListener('click', () => {
            this.game.toggleSkillMenu();
        });
    }
    
    /**
     * Initialize the skill menu
     */
    initializeSkillMenu() {
        // Create skill cards if they don't exist
        this.ensureSkillCardsExist();
        
        // Initialize upgrade buttons for skills
        this.initializeSkillUpgradeButtons();
    }
    
    /**
     * Create skill cards if they don't exist
     */
    ensureSkillCardsExist() {
        // Check if the skill cards already exist
        if (document.getElementById('auto-attack-card')) return;
        
        // Create skill cards for base abilities
        this.createSkillCard('auto-attack', 'Blood Bolt', 'Automatically fire projectiles at nearby enemies.', [
            { name: 'Damage', id: 'auto-attack-damage', value: '15' },
            { name: 'Cooldown', id: 'auto-attack-cooldown', value: '0.8s' },
            { name: 'Range', id: 'auto-attack-range', value: '300' }
        ]);
        
        this.createSkillCard('blood-drain', 'Blood Drain', 'Drain blood from nearby enemies, damaging them and healing yourself.', [
            { name: 'Damage/sec', id: 'blood-drain-damage', value: '50' },
            { name: 'Healing/sec', id: 'blood-drain-healing', value: '25' },
            { name: 'Range', id: 'blood-drain-range', value: '150' },
            { name: 'Duration', id: 'blood-drain-duration', value: '5s' }
        ]);
        
        this.createSkillCard('bat-swarm', 'Bat Swarm', 'Release a swarm of bats that damage enemies they touch.', [
            { name: 'Damage', id: 'bat-swarm-damage', value: '200' },
            { name: 'Bat Count', id: 'bat-swarm-count', value: '16' },
            { name: 'Cooldown', id: 'bat-swarm-cooldown', value: '8s' }
        ]);
        
        this.createSkillCard('shadow-dash', 'Shadow Dash', 'Dash through enemies, becoming briefly invulnerable.', [
            { name: 'Damage', id: 'shadow-dash-damage', value: '30' },
            { name: 'Distance', id: 'shadow-dash-distance', value: '200' },
            { name: 'Invulnerability', id: 'shadow-dash-invuln', value: '0.5s' }
        ]);
        
        // Create skill cards for unlockable abilities
        this.createSkillCard('blood-lance', 'Blood Lance', 'Fire a powerful piercing projectile that damages enemies and heals you.', [
            { name: 'Damage', id: 'blood-lance-damage', value: '150' },
            { name: 'Pierce Count', id: 'blood-lance-pierce', value: '3' },
            { name: 'Heal per Hit', id: 'blood-lance-healing', value: '10' }
        ], true, 3);
        
        this.createSkillCard('night-shield', 'Night Shield', 'Surround yourself with a shield that absorbs damage and explodes.', [
            { name: 'Shield Amount', id: 'night-shield-amount', value: '100' },
            { name: 'Duration', id: 'night-shield-duration', value: '8s' },
            { name: 'Explosion Damage', id: 'night-shield-explosion', value: '100' }
        ], true, 5);
    }
    
    /**
     * Create a skill card element
     * @param {string} id - Skill ID
     * @param {string} name - Skill name
     * @param {string} description - Skill description
     * @param {Array} effects - Array of effect objects { name, id, value }
     * @param {boolean} locked - Whether the skill is locked initially
     * @param {number} unlockLevel - Level required to unlock the skill
     */
    createSkillCard(id, name, description, effects, locked = false, unlockLevel = 0) {
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
            if (i === 0 && !locked) {
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
    }
    
    /**
     * Initialize skill upgrade buttons
     */
    initializeSkillUpgradeButtons() {
        // Auto Attack upgrade
        document.getElementById('auto-attack-upgrade').addEventListener('click', () => {
            this.game.upgradeSkill('autoAttack');
        });
        
        // Blood Drain upgrade
        document.getElementById('blood-drain-upgrade').addEventListener('click', () => {
            this.game.upgradeSkill('bloodDrain');
        });
        
        // Bat Swarm upgrade
        document.getElementById('bat-swarm-upgrade').addEventListener('click', () => {
            this.game.upgradeSkill('batSwarm');
        });
        
        // Shadow Dash upgrade
        document.getElementById('shadow-dash-upgrade').addEventListener('click', () => {
            this.game.upgradeSkill('shadowDash');
        });
        
        // Blood Lance upgrade/unlock
        document.getElementById('blood-lance-upgrade').addEventListener('click', () => {
            this.game.upgradeSkill('bloodLance');
        });
        
        // Night Shield upgrade/unlock
        document.getElementById('night-shield-upgrade').addEventListener('click', () => {
            this.game.upgradeSkill('nightShield');
        });
    }
    
    /**
     * Update game stats display
     */
    updateStats() {
        const player = this.game.player;
        
        // Update health and energy bars
        this.healthBar.style.width = (player.health / player.maxHealth * 100) + '%';
        this.energyBar.style.width = (player.energy / player.maxEnergy * 100) + '%';
        
        // Update time display
        const minutes = Math.floor(this.game.gameTime / 60000);
        const seconds = Math.floor((this.game.gameTime % 60000) / 1000);
        this.timeElement.textContent = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
        
        // Update level and kills
        this.levelElement.textContent = player.level;
        this.killsElement.textContent = player.kills + ' / ' + player.killsToNextLevel;
        
        // Update skill points display
        this.skillPointsCount.textContent = player.skillPoints;
        
        // Update available skill points in menu if open
        if (player.showingSkillMenu) {
            this.availableSkillPoints.textContent = player.skillPoints;
        }
    }
    
    /**
     * Update the auto-attack toggle button
     */
    updateAutoAttackToggle() {
        this.autoAttackToggle.textContent = `Auto-Attack: ${this.game.player.autoAttack.enabled ? 'ON' : 'OFF'}`;
        this.autoAttackToggle.classList.toggle('active', this.game.player.autoAttack.enabled);
    }
    
    /**
     * Show the game over screen
     */
    showGameOver() {
        // Set final score
        const minutes = Math.floor(this.game.gameTime / 60000);
        const seconds = Math.floor((this.game.gameTime % 60000) / 1000);
        const timeString = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
        
        this.finalScoreElement.textContent = 'Kills: ' + this.game.player.kills + ' | Time: ' + timeString;
        
        // Show game over screen
        this.gameOverElement.style.display = 'block';
    }
    
    /**
     * Hide the game over screen
     */
    hideGameOver() {
        this.gameOverElement.style.display = 'none';
    }
    
    /**
     * Show the level up notification
     */
    showLevelUp() {
        this.levelUpElement.style.display = 'block';
        
        // Hide after a delay
        setTimeout(() => {
            this.levelUpElement.style.display = 'none';
        }, 3000);
    }
    
    /**
     * Toggle the skill menu
     */
    toggleSkillMenu() {
        const player = this.game.player;
        
        if (player.showingSkillMenu) {
            // Close skill menu
            this.skillMenuOverlay.style.display = 'none';
            player.showingSkillMenu = false;
            
            // Resume game if it was running
            if (this.game.isRunning() && player.isAlive && this.game.gameLoop.gamePaused) {
                this.game.gameLoop.resumeGame();
            }
        } else {
            // Open skill menu
            this.skillMenuOverlay.style.display = 'flex';
            player.showingSkillMenu = true;
            
            // Pause game if it's running
            if (this.game.isRunning() && player.isAlive && !this.game.gameLoop.gamePaused) {
                this.game.gameLoop.pauseGame(this.game.gameContainer);
            }
            
            // Update skill menu content
            this.updateSkillMenu();
        }
    }
    
    /**
     * Update skill menu content
     */
    updateSkillMenu() {
        // Update available skill points
        this.availableSkillPoints.textContent = this.game.player.skillPoints;
        
        // Update skill card levels and values
        this.updateSkillCards();
        
        // Update upgrade button states
        this.updateUpgradeButtonStates();
    }
    
    /**
     * Update skill card levels and values
     */
    updateSkillCards() {
        const player = this.game.player;
        
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
        document.getElementById('shadow-dash-invuln').textContent = (shadowDash.invulnerabilityTime / 1000) + 's';
        
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
        const player = this.game.player;
        
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
        
        // Update unlockable abilities
        this.updateUnlockableAbilityButtons();
    }
    
    /**
     * Update unlockable ability buttons
     */
    updateUnlockableAbilityButtons() {
        const player = this.game.player;
        const abilities = player.abilityManager.abilities;
        
        // Blood Lance
        const bloodLance = abilities.get('bloodLance');
        const bloodLanceUnlockLevel = 3; // Level required to unlock
        
        if (player.level < bloodLanceUnlockLevel) {
            // Not high enough level to unlock
            document.getElementById('blood-lance-upgrade').disabled = true;
            
            if (document.getElementById('blood-lance-locked')) {
                document.getElementById('blood-lance-locked').style.display = 'flex';
            }
        } else if (bloodLance.unlocked) {
            // Already unlocked, check if can upgrade
            document.getElementById('blood-lance-upgrade').disabled = 
                (player.skillPoints < 1 || bloodLance.level >= bloodLance.maxLevel);
            document.getElementById('blood-lance-upgrade').textContent = "Upgrade (1 Point)";
            
            if (document.getElementById('blood-lance-locked')) {
                document.getElementById('blood-lance-locked').style.display = 'none';
            }
        } else {
            // Can unlock
            document.getElementById('blood-lance-upgrade').disabled = (player.skillPoints < 3);
            document.getElementById('blood-lance-upgrade').textContent = "Unlock (3 Points)";
            
            if (document.getElementById('blood-lance-locked')) {
                document.getElementById('blood-lance-locked').style.display = 'none';
            }
        }
        
        // Night Shield
        const nightShield = abilities.get('nightShield');
        const nightShieldUnlockLevel = 5; // Level required to unlock
        
        if (player.level < nightShieldUnlockLevel) {
            // Not high enough level to unlock
            document.getElementById('night-shield-upgrade').disabled = true;
            
            if (document.getElementById('night-shield-locked')) {
                document.getElementById('night-shield-locked').style.display = 'flex';
            }
        } else if (nightShield.unlocked) {
            // Already unlocked, check if can upgrade
            document.getElementById('night-shield-upgrade').disabled = 
                (player.skillPoints < 1 || nightShield.level >= nightShield.maxLevel);
            document.getElementById('night-shield-upgrade').textContent = "Upgrade (1 Point)";
            
            if (document.getElementById('night-shield-locked')) {
                document.getElementById('night-shield-locked').style.display = 'none';
            }
        } else {
            // Can unlock
            document.getElementById('night-shield-upgrade').disabled = (player.skillPoints < 3);
            document.getElementById('night-shield-upgrade').textContent = "Unlock (3 Points)";
            
            if (document.getElementById('night-shield-locked')) {
                document.getElementById('night-shield-locked').style.display = 'none';
            }
        }
    }
    
    /**
     * Create and display blood particles
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} count - Number of particles
     */
    createBloodParticles(x, y, count) {
        return this.game.particleSystem.createBloodParticles(x, y, count);
    }
    
    /**
     * Create a shield explosion effect
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} range - Explosion range
     */
    createShieldExplosion(x, y, range) {
        // Create explosion visual effect
        const explosion = document.createElement('div');
        explosion.className = 'night-shield';
        explosion.style.width = '0px';
        explosion.style.height = '0px';
        explosion.style.left = x + 'px';
        explosion.style.top = y + 'px';
        explosion.style.border = '5px solid #8a2be2';
        explosion.style.backgroundColor = 'rgba(138, 43, 226, 0.3)';
        explosion.style.transition = 'all 0.3s ease-out';
        
        this.game.gameContainer.appendChild(explosion);
        
        // Animate explosion
        setTimeout(() => {
            explosion.style.width = range * 2 + 'px';
            explosion.style.height = range * 2 + 'px';
            explosion.style.left = (x - range) + 'px';
            explosion.style.top = (y - range) + 'px';
            explosion.style.opacity = '0.7';
        }, 10);
        
        setTimeout(() => {
            explosion.style.opacity = '0';
            setTimeout(() => {
                if (explosion.parentNode) {
                    explosion.parentNode.removeChild(explosion);
                }
            }, 300);
        }, 300);
    }
    
    /**
     * Reset UI to initial state
     */
    reset() {
        this.hideGameOver();
        this.updateStats();
        this.updateAutoAttackToggle();
        
        // Close skill menu if open
        if (this.game.player.showingSkillMenu) {
            this.toggleSkillMenu();
        }
    }
}

export default UIManager;