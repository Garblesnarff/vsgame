// client/src/scenes/UIScene.js
import Phaser from 'phaser';

export class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
    
    // UI Components
    this.healthBar = null;
    this.energyBar = null;
    this.timeIcon = null;
    this.abilityBar = null;
    this.minimap = null;
    this.gameOverPanel = null;
    this.killCounter = null;
    this.levelText = null;
    
    // Ability cooldown indicators
    this.abilityCooldowns = new Map();
    
    // Current game state
    this.gameOver = false;
  }

  create() {
    // Setup UI container
    const uiContainer = document.getElementById('ui-container');
    if (uiContainer) {
      uiContainer.innerHTML = '';
    }
    
    // Create UI elements
    this.createHealthBar();
    this.createEnergyBar();
    this.createAbilityBar();
    this.createMinimap();
    this.createKillCounter();
    this.createLevelIndicator();
    this.createTimeIndicator();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Update UI with initial values
    this.updateUI();
  }
  
  createHealthBar() {
    // Create health bar container
    const healthBarContainer = this.add.container(10, 10);
    
    // Health bar background
    const healthBarBg = this.add.rectangle(0, 0, 200, 20, 0x000000, 0.5);
    healthBarBg.setOrigin(0, 0);
    healthBarBg.setStrokeStyle(1, 0xffffff, 0.8);
    
    // Health bar fill
    this.healthBar = this.add.rectangle(0, 0, 200, 20, 0xff0000, 1);
    this.healthBar.setOrigin(0, 0);
    
    // Health icon
    const healthIcon = this.add.image(-25, 10, 'icons', 'health');
    healthIcon.setScale(0.7);
    
    // Health text
    this.healthText = this.add.text(100, 10, '100/100', {
      font: '14px Arial',
      fill: '#ffffff'
    });
    this.healthText.setOrigin(0.5, 0.5);
    
    // Add to container
    healthBarContainer.add([healthBarBg, this.healthBar, healthIcon, this.healthText]);
  }
  
  createEnergyBar() {
    // Create energy bar container
    const energyBarContainer = this.add.container(10, 40);
    
    // Energy bar background
    const energyBarBg = this.add.rectangle(0, 0, 200, 20, 0x000000, 0.5);
    energyBarBg.setOrigin(0, 0);
    energyBarBg.setStrokeStyle(1, 0xffffff, 0.8);
    
    // Energy bar fill
    this.energyBar = this.add.rectangle(0, 0, 200, 20, 0x00b3b3, 1);
    this.energyBar.setOrigin(0, 0);
    
    // Energy icon
    const energyIcon = this.add.image(-25, 10, 'icons', 'energy');
    energyIcon.setScale(0.7);
    
    // Energy text
    this.energyText = this.add.text(100, 10, '100/100', {
      font: '14px Arial',
      fill: '#ffffff'
    });
    this.energyText.setOrigin(0.5, 0.5);
    
    // Add to container
    energyBarContainer.add([energyBarBg, this.energyBar, energyIcon, this.energyText]);
  }
  
  createAbilityBar() {
    // Create ability bar container at the bottom center of the screen
    const centerX = this.cameras.main.width / 2;
    const abilityBarContainer = this.add.container(centerX, this.cameras.main.height - 80);
    
    // Background panel
    const barWidth = 350;
    const abilityBarBg = this.add.rectangle(0, 0, barWidth, 70, 0x000000, 0.5);
    abilityBarBg.setOrigin(0.5, 0);
    abilityBarBg.setStrokeStyle(1, 0xffffff, 0.5);
    
    // Add to container
    abilityBarContainer.add(abilityBarBg);
    
    // Get abilities from window.gameState
    const abilities = window.gameState.abilities || [];
    const abilitySpacing = 70;
    const startX = -(abilities.length * abilitySpacing) / 2 + abilitySpacing / 2;
    
    // Create ability icons
    abilities.forEach((ability, index) => {
      // Create ability icon background
      const x = startX + index * abilitySpacing;
      const abilityBg = this.add.image(x, 10, 'ability-frame');
      abilityBg.setOrigin(0.5, 0);
      
      // Create ability icon
      const abilityIcon = this.add.image(x, 25, 'icons', ability.id);
      abilityIcon.setOrigin(0.5, 0);
      
      // Create cooldown overlay (initially invisible)
      const cooldownOverlay = this.add.image(x, 10, 'ability-cooldown');
      cooldownOverlay.setOrigin(0.5, 0);
      cooldownOverlay.setVisible(false);
      
      // Create key binding text
      const keyText = this.add.text(x, 50, (index + 1).toString(), {
        font: '16px Arial',
        fill: '#ffffff'
      });
      keyText.setOrigin(0.5, 0);
      
      // Store cooldown reference
      this.abilityCooldowns.set(ability.id, {
        overlay: cooldownOverlay,
        cooldown: ability.cooldown,
        lastUsed: 0
      });
      
      // Add to container
      abilityBarContainer.add([abilityBg, abilityIcon, cooldownOverlay, keyText]);
    });
    
    // Store reference
    this.abilityBar = abilityBarContainer;
  }
  
  createMinimap() {
    // Create minimap container at the bottom right
    const minimap = this.add.container(this.cameras.main.width - 120, this.cameras.main.height - 120);
    
    // Minimap background
    const minimapBg = this.add.rectangle(0, 0, 100, 100, 0x000000, 0.5);
    minimapBg.setOrigin(0, 0);
    minimapBg.setStrokeStyle(1, 0xffffff, 0.8);
    
    // Minimap frame
    const minimapFrame = this.add.image(0, 0, 'minimap-frame');
    minimapFrame.setOrigin(0, 0);
    
    // Player indicator
    this.minimapPlayer = this.add.circle(50, 50, 3, 0xffffff);
    
    // Territory indicators (will be updated with game state)
    this.minimapTerritories = [];
    
    // Add to container
    minimap.add([minimapBg, this.minimapPlayer]);
    minimap.add(this.minimapTerritories);
    
    // Store reference
    this.minimap = minimap;
  }
  
  createKillCounter() {
    // Create kill counter at the top right
    const killCounter = this.add.container(this.cameras.main.width - 150, 20);
    
    // Background
    const killCounterBg = this.add.rectangle(0, 0, 120, 30, 0x000000, 0.5);
    killCounterBg.setOrigin(0, 0);
    killCounterBg.setStrokeStyle(1, 0xffffff, 0.8);
    
    // Kill icon
    const killIcon = this.add.image(10, 15, 'icons', 'skull');
    killIcon.setScale(0.7);
    
    // Kill text
    this.killText = this.add.text(40, 15, 'Kills: 0', {
      font: '14px Arial',
      fill: '#ffffff'
    });
    this.killText.setOrigin(0, 0.5);
    
    // Add to container
    killCounter.add([killCounterBg, killIcon, this.killText]);
    
    // Store reference
    this.killCounter = killCounter;
  }
  
  createLevelIndicator() {
    // Create level indicator at the top right
    const levelIndicator = this.add.container(this.cameras.main.width - 150, 60);
    
    // Background
    const levelBg = this.add.rectangle(0, 0, 120, 30, 0x000000, 0.5);
    levelBg.setOrigin(0, 0);
    levelBg.setStrokeStyle(1, 0xffffff, 0.8);
    
    // Level icon
    const levelIcon = this.add.image(10, 15, 'icons', 'level');
    levelIcon.setScale(0.7);
    
    // Level text
    this.levelText = this.add.text(40, 15, 'Level: 1', {
      font: '14px Arial',
      fill: '#ffffff'
    });
    this.levelText.setOrigin(0, 0.5);
    
    // Add to container
    levelIndicator.add([levelBg, levelIcon, this.levelText]);
    
    // Store reference
    this.levelIndicator = levelIndicator;
  }
  
  createTimeIndicator() {
    // Create time indicator at the top center
    const centerX = this.cameras.main.width / 2;
    const timeIndicator = this.add.container(centerX, 20);
    
    // Background
    const timeBg = this.add.rectangle(0, 0, 80, 30, 0x000000, 0.5);
    timeBg.setOrigin(0.5, 0);
    timeBg.setStrokeStyle(1, 0xffffff, 0.8);
    
    // Time icon (day or night)
    const currentTime = window.gameState.currentTime || 'night';
    this.timeIcon = this.add.image(0, 15, `${currentTime}-icon`);
    this.timeIcon.setOrigin(0.5, 0.5);
    this.timeIcon.setScale(0.7);
    
    // Add to container
    timeIndicator.add([timeBg, this.timeIcon]);
    
    // Store reference
    this.timeIndicator = timeIndicator;
  }
  
  createGameOverPanel() {
    // Create game over panel in the center of the screen
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    
    const gameOverPanel = this.add.container(centerX, centerY);
    gameOverPanel.setDepth(100);
    
    // Background
    const panelBg = this.add.rectangle(0, 0, 400, 300, 0x000000, 0.8);
    panelBg.setOrigin(0.5, 0.5);
    panelBg.setStrokeStyle(2, 0xff0000, 1);
    
    // Game over text
    const gameOverText = this.add.text(0, -100, 'GAME OVER', {
      font: '32px Arial',
      fill: '#ff0000',
      fontStyle: 'bold'
    });
    gameOverText.setOrigin(0.5, 0.5);
    
    // Stats text
    this.gameOverStats = this.add.text(0, -30, '', {
      font: '18px Arial',
      fill: '#ffffff',
      align: 'center'
    });
    this.gameOverStats.setOrigin(0.5, 0.5);
    
    // Restart text
    const restartText = this.add.text(0, 100, 'Press SPACE to restart', {
      font: '20px Arial',
      fill: '#ffffff'
    });
    restartText.setOrigin(0.5, 0.5);
    
    // Add to container
    gameOverPanel.add([panelBg, gameOverText, this.gameOverStats, restartText]);
    
    // Hide initially
    gameOverPanel.setVisible(false);
    
    // Store reference
    this.gameOverPanel = gameOverPanel;
  }
  
  setupEventListeners() {
    // Player health changed
    document.addEventListener('playerHealthChanged', (event) => {
      this.updateHealthBar(event.detail.health, event.detail.maxHealth);
    });
    
    // Player energy changed
    document.addEventListener('playerEnergyChanged', (event) => {
      this.updateEnergyBar(event.detail.energy, event.detail.maxEnergy);
    });
    
    // Player level changed
    document.addEventListener('playerLevelChanged', (event) => {
      this.updateLevelText(event.detail.level);
    });
    
    // Player kills changed
    document.addEventListener('playerKillsChanged', (event) => {
      this.updateKillCounter(event.detail.kills);
    });
    
    // Time changed
    document.addEventListener('timeChanged', (event) => {
      this.updateTimeIndicator(event.detail.time);
    });
    
    // Player died
    document.addEventListener('playerDied', () => {
      this.showGameOver();
    });
    
    // Game over
    document.addEventListener('gameOver', (event) => {
      this.showGameOver(event.detail);
    });
    
    // Ability used (for cooldowns)
    document.addEventListener('abilityUsed', (event) => {
      this.startAbilityCooldown(event.detail.abilityId);
    });
  }
  
  updateHealthBar(health, maxHealth) {
    if (!this.healthBar || !this.healthText) return;
    
    // Calculate health percentage
    const healthPercent = Math.max(0, health / maxHealth);
    
    // Update health bar width (based on percentage)
    this.healthBar.width = 200 * healthPercent;
    
    // Update health text
    this.healthText.setText(`${Math.floor(health)}/${Math.floor(maxHealth)}`);
    
    // Change color based on health percentage
    if (healthPercent < 0.3) {
      this.healthBar.fillColor = 0xff0000; // Red for low health
    } else if (healthPercent < 0.6) {
      this.healthBar.fillColor = 0xffff00; // Yellow for medium health
    } else {
      this.healthBar.fillColor = 0x00ff00; // Green for high health
    }
  }
  
  updateEnergyBar(energy, maxEnergy) {
    if (!this.energyBar || !this.energyText) return;
    
    // Calculate energy percentage
    const energyPercent = Math.max(0, energy / maxEnergy);
    
    // Update energy bar width
    this.energyBar.width = 200 * energyPercent;
    
    // Update energy text
    this.energyText.setText(`${Math.floor(energy)}/${Math.floor(maxEnergy)}`);
  }
  
  updateLevelText(level) {
    if (!this.levelText) return;
    
    this.levelText.setText(`Level: ${level}`);
  }
  
  updateKillCounter(kills) {
    if (!this.killText) return;
    
    this.killText.setText(`Kills: ${kills}`);
  }
  
  updateTimeIndicator(time) {
    if (!this.timeIcon) return;
    
    // Update time icon
    this.timeIcon.setTexture(`${time}-icon`);
    
    // Add a flash effect
    this.tweens.add({
      targets: this.timeIcon,
      scale: 1,
      duration: 300,
      yoyo: true,
      onComplete: () => {
        this.timeIcon.setScale(0.7);
      }
    });
  }
  
  startAbilityCooldown(abilityId) {
    const cooldownInfo = this.abilityCooldowns.get(abilityId);
    if (!cooldownInfo) return;
    
    // Set last used time
    cooldownInfo.lastUsed = Date.now();
    
    // Show cooldown overlay
    cooldownInfo.overlay.setVisible(true);
    
    // Start cooldown animation
    this.tweens.add({
      targets: cooldownInfo.overlay,
      scaleY: 0,
      duration: cooldownInfo.cooldown,
      ease: 'Linear',
      onComplete: () => {
        cooldownInfo.overlay.setVisible(false);
        cooldownInfo.overlay.setScale(1);
      }
    });
  }
  
  updateMinimap() {
    if (!this.minimap || !this.minimapPlayer) return;
    
    // Get player position from game state
    const player = window.gameState.playerData;
    if (!player) return;
    
    // Get map dimensions
    const mapWidth = window.gameState.mapWidth || 2000;
    const mapHeight = window.gameState.mapHeight || 2000;
    
    // Calculate player position on minimap (scaled down)
    const minimapX = (player.x / mapWidth) * 100;
    const minimapY = (player.y / mapHeight) * 100;
    
    // Update player indicator position
    this.minimapPlayer.x = minimapX;
    this.minimapPlayer.y = minimapY;
    
    // Todo: Update territory indicators when implemented
  }
  
  showGameOver(data) {
    // If game over panel doesn't exist, create it
    if (!this.gameOverPanel) {
      this.createGameOverPanel();
    }
    
    // Update game over stats
    const player = window.gameState.playerData;
    if (player) {
      this.gameOverStats.setText(
        `Level: ${player.level}\n` +
        `Kills: ${player.kills}\n\n` +
        `${data && data.result === 'victory' ? 'VICTORY!' : 'DEFEAT'}`
      );
    }
    
    // Show game over panel
    this.gameOverPanel.setVisible(true);
    
    // Set game over state
    this.gameOver = true;
  }
  
  updateUI() {
    // Get player data from window.gameState
    const player = window.gameState.playerData;
    if (!player) return;
    
    // Update health bar
    this.updateHealthBar(player.health, player.maxHealth);
    
    // Update energy bar
    this.updateEnergyBar(player.energy, player.maxEnergy);
    
    // Update level text
    this.updateLevelText(player.level);
    
    // Update kill counter
    this.updateKillCounter(player.kills);
    
    // Update minimap
    this.updateMinimap();
  }
  
  update(time, delta) {
    // Skip updates if game is over
    if (this.gameOver) return;
    
    // Update UI
    this.updateUI();
    
    // Update ability cooldowns
    this.updateAbilityCooldowns();
  }
  
  updateAbilityCooldowns() {
    const now = Date.now();
    
    // Update each ability cooldown
    this.abilityCooldowns.forEach((cooldownInfo, abilityId) => {
      if (cooldownInfo.lastUsed === 0) return;
      
      const elapsed = now - cooldownInfo.lastUsed;
      const remaining = Math.max(0, cooldownInfo.cooldown - elapsed);
      const percentage = remaining / cooldownInfo.cooldown;
      
      // Update cooldown overlay
      if (percentage > 0 && cooldownInfo.overlay) {
        cooldownInfo.overlay.setVisible(true);
        cooldownInfo.overlay.setScale(1, percentage);
      } else if (cooldownInfo.overlay) {
        cooldownInfo.overlay.setVisible(false);
        cooldownInfo.overlay.setScale(1);
      }
    });
  }
}