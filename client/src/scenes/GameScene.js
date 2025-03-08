// client/src/scenes/GameScene.js
import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    
    // Game entities
    this.players = new Map();
    this.enemies = new Map();
    this.projectiles = new Map();
    this.territories = new Map();
    this.bloodPools = new Map();
    this.minions = new Map();
    
    // Local player reference
    this.player = null;
    this.playerSprite = null;
    
    // Camera
    this.mainCamera = null;
    
    // Input
    this.cursors = null;
    this.keyW = null;
    this.keyA = null;
    this.keyS = null;
    this.keyD = null;
    this.keys1to5 = [];
    
    // Map
    this.mapWidth = 0;
    this.mapHeight = 0;
    
    // Game state
    this.gameActive = false;
    
    // Connection to server
    this.room = null;
    
    // Last sent position
    this.lastSentX = 0;
    this.lastSentY = 0;
    
    // Target for abilities
    this.targetPosition = { x: 0, y: 0 };
    
    // Position update rate limiting
    this.positionUpdateInterval = 100; // ms
    this.lastPositionUpdate = 0;
    
    // Ability cooldowns
    this.abilityCooldowns = new Map();
  }

  create() {
    // Get room connection
    this.room = window.gameState.room;
    if (!this.room) {
      console.error("No room connection");
      return;
    }
    
    // Get map dimensions from server
    this.mapWidth = window.gameState.mapWidth || 2000;
    this.mapHeight = window.gameState.mapHeight || 2000;
    
    // Create world bounds
    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight);
    
    // Create map background using a tiled sprite
    this.createMapBackground();
    
    // Set up camera
    this.mainCamera = this.cameras.main;
    this.mainCamera.setBounds(0, 0, this.mapWidth, this.mapHeight);
    
    // Setup input
    this.setupInput();
    
    // Start listening for room state changes
    this.setupRoomStateListeners();
    
    // Add UI scene on top
    this.scene.launch('UIScene');
    
    // Start music based on time of day
    this.setupAudio();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Initialize game state
    this.gameActive = true;
    
    // Initialize ability cooldowns
    if (window.gameState.abilities) {
      window.gameState.abilities.forEach(ability => {
        this.abilityCooldowns.set(ability.id, {
          cooldown: ability.cooldown,
          lastUsed: 0
        });
      });
    }
    
    // Debug text
    this.debugText = this.add.text(10, 10, 'Debug Info', { 
      font: '16px monospace',
      fill: '#ffffff'
    });
    this.debugText.setScrollFactor(0);
    this.debugText.setDepth(999);
  }
  
  createMapBackground() {
    // Create ground layer
    this.groundLayer = this.add.tileSprite(
      0, 0, this.mapWidth, this.mapHeight, 'tileset'
    );
    this.groundLayer.setOrigin(0, 0);
    this.groundLayer.setDepth(-1);
    
    // Add some ambient objects to make the map less empty
    this.createAmbientObjects();
    
    // Add world boundaries visual indicators
    this.createWorldBoundaries();
  }
  
  createAmbientObjects() {
    // Add some trees, rocks, gravestones, etc.
    const objectCount = Math.floor(this.mapWidth * this.mapHeight / 100000);
    
    for (let i = 0; i < objectCount; i++) {
      const x = Phaser.Math.Between(50, this.mapWidth - 50);
      const y = Phaser.Math.Between(50, this.mapHeight - 50);
      
      // Randomly select an ambient object type
      const objectType = Phaser.Math.Between(0, 3);
      
      switch(objectType) {
        case 0: // Tree
          this.add.image(x, y, 'icons', 'tree').setDepth(y);
          break;
        case 1: // Rock
          this.add.image(x, y, 'icons', 'rock').setDepth(y);
          break;
        case 2: // Gravestone
          this.add.image(x, y, 'icons', 'gravestone').setDepth(y);
          break;
        case 3: // Shrub
          this.add.image(x, y, 'icons', 'shrub').setDepth(y);
          break;
      }
    }
  }
  
  createWorldBoundaries() {
    // Add simple visual borders at the edge of the world
    const graphics = this.add.graphics();
    graphics.lineStyle(5, 0x6a0dad, 1);
    graphics.strokeRect(0, 0, this.mapWidth, this.mapHeight);
    
    // Add some markers at the corners
    const markerSize = 32;
    this.add.image(markerSize/2, markerSize/2, 'icons', 'corner').setDepth(1);
    this.add.image(this.mapWidth - markerSize/2, markerSize/2, 'icons', 'corner').setDepth(1).setFlipX(true);
    this.add.image(markerSize/2, this.mapHeight - markerSize/2, 'icons', 'corner').setDepth(1).setFlipY(true);
    this.add.image(
      this.mapWidth - markerSize/2, 
      this.mapHeight - markerSize/2, 
      'icons', 
      'corner'
    ).setDepth(1).setFlipX(true).setFlipY(true);
  }
  
  setupInput() {
    // Set up cursor keys
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // Set up WASD keys
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    
    // Set up number keys 1-5 for abilities
    this.keys1to5 = [
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE)
    ];
    
    // Set up mouse input
    this.input.on('pointerdown', (pointer) => {
      if (!this.gameActive) return;
      
      // Convert screen coordinates to world coordinates
      const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      this.targetPosition.x = worldPoint.x;
      this.targetPosition.y = worldPoint.y;
      
      // Check if right click (context menu)
      if (pointer.rightButtonDown()) {
        this.handleRightClick(worldPoint.x, worldPoint.y);
      }
    });
    
    // Prevent context menu from appearing on right click
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        pointer.event.preventDefault();
      }
    });
  }
  
  handleRightClick(x, y) {
    // Check if right-click is on a territory to claim it
    const territory = this.findTerritoryAt(x, y);
    if (territory) {
      // Send message to claim territory
      this.room.send("claimTerritory", {
        territoryX: territory.x,
        territoryY: territory.y
      });
      
      // Show visual feedback
      this.showClaimingEffect(territory.x, territory.y);
    }
  }
  
  findTerritoryAt(x, y) {
    // Find a territory near the clicked position
    for (const territory of this.territories.values()) {
      const distance = Phaser.Math.Distance.Between(
        x, y, territory.x, territory.y
      );
      
      if (distance < territory.radius) {
        return territory;
      }
    }
    return null;
  }
  
  showClaimingEffect(x, y) {
    // Show a visual effect when trying to claim a territory
    const effect = this.add.circle(x, y, 50, 0x6a1cb7, 0.5);
    this.tweens.add({
      targets: effect,
      radius: 100,
      alpha: 0,
      duration: 1000,
      onComplete: () => effect.destroy()
    });
  }
  
  setupAudio() {
    // Play ambient music based on time of day
    const time = window.gameState.currentTime || 'night';
    
    if (time === 'day') {
      this.dayAmbience = this.sound.add('ambient-day', { loop: true, volume: 0.3 });
      this.dayAmbience.play();
    } else {
      this.nightAmbience = this.sound.add('ambient-night', { loop: true, volume: 0.5 });
      this.nightAmbience.play();
    }
  }
  
  setupEventListeners() {
    // Listen for ability usage events
    document.addEventListener('abilityUsed', (event) => {
      const data = event.detail;
      this.showAbilityEffect(data.abilityId, data.playerId, data.targetX, data.targetY);
    });
    
    // Listen for time change
    document.addEventListener('timeChanged', (event) => {
      const time = event.detail.time;
      this.handleTimeChange(time);
    });
    
    // Listen for player death
    document.addEventListener('playerDied', () => {
      this.handlePlayerDeath();
    });
    
    // Listen for game over
    document.addEventListener('gameOver', (event) => {
      this.handleGameOver(event.detail);
    });
  }
  
  handleTimeChange(time) {
    // Change the ambient lighting and sound based on time
    if (time === 'day') {
      // Transition to day
      if (this.nightAmbience) {
        this.tweens.add({
          targets: this.nightAmbience,
          volume: 0,
          duration: 2000,
          onComplete: () => {
            this.nightAmbience.stop();
          }
        });
      }
      
      this.dayAmbience = this.sound.add('ambient-day', { loop: true, volume: 0 });
      this.dayAmbience.play();
      
      this.tweens.add({
        targets: this.dayAmbience,
        volume: 0.3,
        duration: 2000
      });
      
      // Transition lighting
      this.cameras.main.setBackgroundColor('rgba(40, 40, 70, 0.5)');
    } else {
      // Transition to night
      if (this.dayAmbience) {
        this.tweens.add({
          targets: this.dayAmbience,
          volume: 0,
          duration: 2000,
          onComplete: () => {
            this.dayAmbience.stop();
          }
        });
      }
      
      this.nightAmbience = this.sound.add('ambient-night', { loop: true, volume: 0 });
      this.nightAmbience.play();
      
      this.tweens.add({
        targets: this.nightAmbience,
        volume: 0.5,
        duration: 2000
      });
      
      // Transition lighting
      this.cameras.main.setBackgroundColor('rgba(5, 5, 30, 0.7)');
    }
  }
  
  handlePlayerDeath() {
    // Play death sound
    this.sound.play('player-hit', { volume: 0.8 });
    
    // Show death effect on player sprite
    if (this.playerSprite) {
      this.tweens.add({
        targets: this.playerSprite,
        alpha: 0,
        duration: 2000,
        onComplete: () => {
          this.playerSprite.setVisible(false);
        }
      });
      
      // Create a blood pool at player position
      const bloodPool = this.add.image(this.playerSprite.x, this.playerSprite.y, 'blood-pool')
        .setDepth(this.playerSprite.y - 1)
        .setAlpha(0)
        .setScale(0.5);
      
      this.tweens.add({
        targets: bloodPool,
        alpha: 1,
        scale: 1.5,
        duration: 1000
      });
    }
    
    // Set game state
    this.gameActive = false;
    
    // Show game over UI (handled by UIScene)
  }
  
  handleGameOver(data) {
    // Set game state
    this.gameActive = false;
    
    // Stop all music
    this.sound.stopAll();
    
    // Play game over sound
    if (data.result === 'victory') {
      this.sound.play('victory-sound', { volume: 1.0 });
    } else {
      this.sound.play('defeat-sound', { volume: 1.0 });
    }
  }
  
  setupRoomStateListeners() {
    const room = this.room;
    
    // Listen for player state changes
    room.state.players.onAdd = (player, sessionId) => {
      this.addPlayer(player, sessionId);
      
      // Listen for player state changes
      player.onChange = (changes) => {
        this.updatePlayer(sessionId, changes);
      };
    };
    
    room.state.players.onRemove = (player, sessionId) => {
      this.removePlayer(sessionId);
    };
    
    // Listen for enemy changes
    room.state.enemies.onAdd = (enemy, enemyId) => {
      this.addEnemy(enemy, enemyId);
      
      // Listen for enemy state changes
      enemy.onChange = (changes) => {
        this.updateEnemy(enemyId, changes);
      };
    };
    
    room.state.enemies.onRemove = (enemy, enemyId) => {
      this.removeEnemy(enemyId);
    };
    
    // Listen for projectile changes
    room.state.projectiles.onAdd = (projectile, projectileId) => {
      this.addProjectile(projectile, projectileId);
      
      // Listen for projectile state changes
      projectile.onChange = (changes) => {
        this.updateProjectile(projectileId, changes);
      };
    };
    
    room.state.projectiles.onRemove = (projectile, projectileId) => {
      this.removeProjectile(projectileId);
    };
    
    // Listen for territory changes
    room.state.territories.onAdd = (territory, index) => {
      this.addTerritory(territory, index);
      
      // Listen for territory state changes
      territory.onChange = (changes) => {
        this.updateTerritory(territory.id, changes);
      };
    };
    
    // Listen for blood pool changes
    room.state.bloodPools.onAdd = (bloodPool, index) => {
      this.addBloodPool(bloodPool, index);
    };
    
    room.state.bloodPools.onRemove = (bloodPool, index) => {
      this.removeBloodPool(bloodPool.id);
    };
    
    // Listen for minion changes
    room.state.minions.onAdd = (minion, minionId) => {
      this.addMinion(minion, minionId);
      
      // Listen for minion state changes
      minion.onChange = (changes) => {
        this.updateMinion(minionId, changes);
      };
    };
    
    room.state.minions.onRemove = (minion, minionId) => {
      this.removeMinion(minionId);
    };
  }
  
  addPlayer(player, sessionId) {
    // Determine if this is the local player
    const isLocalPlayer = sessionId === this.room.sessionId;
    
    // Create player sprite based on clan
    const x = player.x;
    const y = player.y;
    const spriteKey = `vampire-${player.clan.toLowerCase()}`;
    
    const sprite = this.physics.add.sprite(x, y, spriteKey).setDepth(y);
    sprite.setCollideWorldBounds(true);
    
    // Play idle animation
    sprite.anims.play(`${player.clan.toLowerCase()}-idle`, true);
    
    // Add player name text
    const nameText = this.add.text(x, y - 40, player.username, {
      font: '14px Arial',
      fill: isLocalPlayer ? '#ffffff' : '#aaaaaa',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 3
    });
    nameText.setOrigin(0.5, 0.5);
    nameText.setDepth(1000);
    
    // Add health bar
    const healthBarBackground = this.add.rectangle(x, y - 25, 50, 6, 0x000000);
    healthBarBackground.setOrigin(0.5, 0.5);
    healthBarBackground.setDepth(1000);
    
    const healthBar = this.add.rectangle(x - 25, y - 25, 50, 6, 0xff0000);
    healthBar.setOrigin(0, 0.5);
    healthBar.setDepth(1001);
    
    // Store player data
    this.players.set(sessionId, {
      sprite,
      nameText,
      healthBarBackground,
      healthBar,
      x: player.x,
      y: player.y,
      health: player.health,
      maxHealth: player.maxHealth,
      isLocalPlayer
    });
    
    // If this is the local player, set camera to follow
    if (isLocalPlayer) {
      this.player = player;
      this.playerSprite = sprite;
      this.cameras.main.startFollow(sprite);
    }
  }
  
  updatePlayer(sessionId, changes) {
    const playerData = this.players.get(sessionId);
    if (!playerData) return;
    
    // Apply changes
    changes.forEach(change => {
      switch (change.field) {
        case "x":
        case "y":
          playerData[change.field] = change.value;
          break;
        case "health":
          playerData.health = change.value;
          this.updatePlayerHealthBar(sessionId);
          break;
        case "maxHealth":
          playerData.maxHealth = change.value;
          this.updatePlayerHealthBar(sessionId);
          break;
        case "dead":
          if (change.value) {
            this.handlePlayerDeathAnimation(sessionId);
          }
          break;
      }
    });
    
    // Update sprite animation based on movement
    const sprite = playerData.sprite;
    const player = this.room.state.players.get(sessionId);
    
    if (!player || player.dead) return;
    
    const isMoving = this.lastFramePositions && 
                     this.lastFramePositions.has(sessionId) && 
                     (this.lastFramePositions.get(sessionId).x !== player.x || 
                      this.lastFramePositions.get(sessionId).y !== player.y);
    
    // Set appropriate animation
    const clan = player.clan.toLowerCase();
    if (isMoving) {
      if (!sprite.anims.isPlaying || sprite.anims.currentAnim.key !== `${clan}-walk`) {
        sprite.anims.play(`${clan}-walk`, true);
      }
    } else {
      if (!sprite.anims.isPlaying || sprite.anims.currentAnim.key !== `${clan}-idle`) {
        sprite.anims.play(`${clan}-idle`, true);
      }
    }
    
    // Store this frame's position for comparison next frame
    if (!this.lastFramePositions) {
      this.lastFramePositions = new Map();
    }
    this.lastFramePositions.set(sessionId, { x: player.x, y: player.y });
  }
  
  updatePlayerHealthBar(sessionId) {
    const playerData = this.players.get(sessionId);
    if (!playerData) return;
    
    // Calculate health percentage
    const healthPercent = playerData.health / playerData.maxHealth;
    
    // Update health bar width
    playerData.healthBar.width = 50 * healthPercent;
    
    // Change color based on health percentage
    let color = 0x00ff00; // Green
    if (healthPercent < 0.6) {
      color = 0xffff00; // Yellow
    }
    if (healthPercent < 0.3) {
      color = 0xff0000; // Red
    }
    
    playerData.healthBar.fillColor = color;
  }
  
  handlePlayerDeathAnimation(sessionId) {
    const playerData = this.players.get(sessionId);
    if (!playerData) return;
    
    // Play death animation
    const sprite = playerData.sprite;
    this.tweens.add({
      targets: sprite,
      alpha: 0,
      duration: 2000,
      onComplete: () => {
        sprite.setVisible(false);
      }
    });
    
    // Create blood pool
    const bloodPool = this.add.image(sprite.x, sprite.y, 'blood-pool')
      .setDepth(sprite.y - 1)
      .setScale(0)
      .setAlpha(0);
    
    this.tweens.add({
      targets: bloodPool,
      scale: 1,
      alpha: 1,
      duration: 1000
    });
    
    // Fade out name and health bar
    this.tweens.add({
      targets: [playerData.nameText, playerData.healthBarBackground, playerData.healthBar],
      alpha: 0,
      duration: 1000
    });
  }
  
  removePlayer(sessionId) {
    const playerData = this.players.get(sessionId);
    if (!playerData) return;
    
    // Remove player objects
    playerData.sprite.destroy();
    playerData.nameText.destroy();
    playerData.healthBarBackground.destroy();
    playerData.healthBar.destroy();
    
    // Remove from players map
    this.players.delete(sessionId);
  }
  
  addEnemy(enemy, enemyId) {
    // Create enemy sprite based on type
    const sprite = this.add.sprite(enemy.x, enemy.y, `enemy-${enemy.type}`);
    sprite.setDepth(enemy.y);
    
    // Play appropriate animation
    sprite.anims.play(`enemy-${enemy.type}-idle`, true);
    
    // Add health bar
    const healthBarBackground = this.add.rectangle(enemy.x, enemy.y - 15, 30, 4, 0x000000);
    healthBarBackground.setOrigin(0.5, 0.5);
    healthBarBackground.setDepth(1000);
    
    const healthBar = this.add.rectangle(enemy.x - 15, enemy.y - 15, 30, 4, 0xff0000);
    healthBar.setOrigin(0, 0.5);
    healthBar.setDepth(1001);
    
    // Store enemy data
    this.enemies.set(enemyId, {
      sprite,
      healthBarBackground,
      healthBar,
      type: enemy.type,
      health: enemy.health,
      x: enemy.x,
      y: enemy.y
    });
  }
  
  updateEnemy(enemyId, changes) {
    const enemyData = this.enemies.get(enemyId);
    if (!enemyData) return;
    
    let needsHealthBarUpdate = false;
    
    // Apply changes
    changes.forEach(change => {
      switch (change.field) {
        case "x":
          enemyData.x = change.value;
          enemyData.sprite.x = change.value;
          enemyData.healthBarBackground.x = change.value;
          enemyData.healthBar.x = change.value - 15;
          break;
        case "y":
          enemyData.y = change.value;
          enemyData.sprite.y = change.value;
          enemyData.sprite.setDepth(change.value);
          enemyData.healthBarBackground.y = change.value - 15;
          enemyData.healthBar.y = change.value - 15;
          break;
        case "health":
          enemyData.health = change.value;
          needsHealthBarUpdate = true;
          break;
      }
    });
    
    // Update health bar if needed
    if (needsHealthBarUpdate) {
      this.updateEnemyHealthBar(enemyId);
    }
    
    // Update animation based on movement
    const sprite = enemyData.sprite;
    const enemy = this.room.state.enemies.get(enemyId);
    
    if (!enemy) return;
    
    const isMoving = this.lastFrameEnemyPositions && 
                     this.lastFrameEnemyPositions.has(enemyId) && 
                     (this.lastFrameEnemyPositions.get(enemyId).x !== enemy.x || 
                      this.lastFrameEnemyPositions.get(enemyId).y !== enemy.y);
    
    // Set appropriate animation
    if (isMoving) {
      if (!sprite.anims.isPlaying || sprite.anims.currentAnim.key !== `enemy-${enemy.type}-walk`) {
        sprite.anims.play(`enemy-${enemy.type}-walk`, true);
      }
      
      // Flip sprite based on movement direction
      if (enemy.x > this.lastFrameEnemyPositions.get(enemyId).x) {
        sprite.setFlipX(false);
      } else if (enemy.x < this.lastFrameEnemyPositions.get(enemyId).x) {
        sprite.setFlipX(true);
      }
    } else {
      if (!sprite.anims.isPlaying || sprite.anims.currentAnim.key !== `enemy-${enemy.type}-idle`) {
        sprite.anims.play(`enemy-${enemy.type}-idle`, true);
      }
    }
    
    // Store this frame's position for comparison next frame
    if (!this.lastFrameEnemyPositions) {
      this.lastFrameEnemyPositions = new Map();
    }
    this.lastFrameEnemyPositions.set(enemyId, { x: enemy.x, y: enemy.y });
  }
  
  updateEnemyHealthBar(enemyId) {
    const enemyData = this.enemies.get(enemyId);
    if (!enemyData) return;
    
    const enemy = this.room.state.enemies.get(enemyId);
    if (!enemy) return;
    
    // Calculate health percentage
    const healthPercent = enemy.health / 100; // Assuming 100 is max health
    
    // Update health bar width
    enemyData.healthBar.width = 30 * healthPercent;
  }
  
  removeEnemy(enemyId) {
    const enemyData = this.enemies.get(enemyId);
    if (!enemyData) return;
    
    // Play death animation and sound
    this.sound.play('enemy-death', { volume: 0.3 });
    
    // Create death particles
    this.createBloodParticles(enemyData.sprite.x, enemyData.sprite.y, 10);
    
    // Fade out sprite
    this.tweens.add({
      targets: [enemyData.sprite, enemyData.healthBarBackground, enemyData.healthBar],
      alpha: 0,
      duration: 300,
      onComplete: () => {
        // Remove enemy objects
        enemyData.sprite.destroy();
        enemyData.healthBarBackground.destroy();
        enemyData.healthBar.destroy();
      }
    });
    
    // Remove from enemies map
    this.enemies.delete(enemyId);
  }
  
  createBloodParticles(x, y, count) {
    // Create blood particle effect
    for (let i = 0; i < count; i++) {
      const particle = this.add.sprite(x, y, 'blood-particle');
      particle.setDepth(y + 1);
      
      // Play blood animation
      particle.anims.play('blood-particle-effect');
      
      // Add some random movement
      const angle = Phaser.Math.Between(0, 360);
      const speed = Phaser.Math.Between(50, 100);
      const vx = Math.cos(angle * Math.PI / 180) * speed;
      const vy = Math.sin(angle * Math.PI / 180) * speed;
      
      this.tweens.add({
        targets: particle,
        x: particle.x + vx,
        y: particle.y + vy,
        alpha: 0,
        duration: 800,
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }
  
  addProjectile(projectile, projectileId) {
    // Create projectile sprite based on type
    const sprite = this.add.sprite(projectile.x, projectile.y, projectile.type === 'enemy' ? 'enemy-projectile' : 'projectile');
    sprite.setDepth(projectile.y + 1);
    
    // Set rotation based on velocity
    const angle = Math.atan2(projectile.velocityY, projectile.velocityX);
    sprite.setRotation(angle);
    
    // Store projectile data
    this.projectiles.set(projectileId, {
      sprite,
      x: projectile.x,
      y: projectile.y
    });
  }
  
  updateProjectile(projectileId, changes) {
    const projectileData = this.projectiles.get(projectileId);
    if (!projectileData) return;
    
    // Apply changes
    changes.forEach(change => {
      switch (change.field) {
        case "x":
          projectileData.x = change.value;
          projectileData.sprite.x = change.value;
          break;
        case "y":
          projectileData.y = change.value;
          projectileData.sprite.y = change.value;
          projectileData.sprite.setDepth(change.value + 1);
          break;
      }
    });
  }
  
  removeProjectile(projectileId) {
    const projectileData = this.projectiles.get(projectileId);
    if (!projectileData) return;
    
    // Play hit sound if it's not too far from the player to avoid sound spam
    const distance = Phaser.Math.Distance.Between(
      projectileData.x, 
      projectileData.y, 
      this.playerSprite.x, 
      this.playerSprite.y
    );
    
    if (distance < 500) {
      this.sound.play('enemy-hit', { volume: 0.2 });
    }
    
    // Create hit effect
    this.createHitEffect(projectileData.x, projectileData.y);
    
    // Remove projectile sprite
    projectileData.sprite.destroy();
    
    // Remove from projectiles map
    this.projectiles.delete(projectileId);
  }
  
  createHitEffect(x, y) {
    // Create simple impact flash
    const flash = this.add.circle(x, y, 10, 0xffffff, 0.8);
    flash.setDepth(y + 5);
    
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 2,
      duration: 200,
      onComplete: () => {
        flash.destroy();
      }
    });
  }
  
  addTerritory(territory, territoryId) {
    // Create territory indicator sprite
    const sprite = this.add.image(territory.x, territory.y, 'territory-marker');
    sprite.setDepth(0); // Below most objects
    sprite.setAlpha(0.6);
    
    // Create territory circle to show boundaries
    const circle = this.add.circle(territory.x, territory.y, territory.radius, 0xffffff, 0.1);
    circle.setStrokeStyle(2, 0xffffff, 0.3);
    
    // Add territory owner flag if owned
    let flagSprite = null;
    if (territory.owner) {
      flagSprite = this.createTerritoryFlag(territory);
    }
    
    // Store territory data
    this.territories.set(territoryId || territory.id, {
      sprite,
      circle,
      flagSprite,
      x: territory.x,
      y: territory.y,
      owner: territory.owner,
      clanId: territory.clanId,
      radius: territory.radius
    });
  }
  
  createTerritoryFlag(territory) {
    let flagColor;
    
    // Set color based on clan
    switch(territory.clanId) {
      case 'Nosferatu':
        flagColor = 0x993300;
        break;
      case 'Tremere':
        flagColor = 0x990099;
        break;
      case 'Ventrue':
        flagColor = 0x000099;
        break;
      case 'Toreador':
        flagColor = 0x990066;
        break;
      default:
        flagColor = 0x666666;
    }
    
    // Create flag post
    const post = this.add.rectangle(territory.x, territory.y - 20, 3, 40, 0x000000);
    post.setOrigin(0.5, 1);
    post.setDepth(territory.y);
    
    // Create flag
    const flag = this.add.rectangle(territory.x + 12, territory.y - 40, 24, 16, flagColor);
    flag.setOrigin(0, 0.5);
    flag.setDepth(territory.y);
    
    // Group them together
    const container = this.add.container(0, 0, [post, flag]);
    
    // Add waving animation
    this.tweens.add({
      targets: flag,
      scaleX: 0.8,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    return container;
  }
  
  updateTerritory(territoryId, changes) {
    const territoryData = this.territories.get(territoryId);
    if (!territoryData) return;
    
    let flagChanged = false;
    
    // Apply changes
    changes.forEach(change => {
      switch (change.field) {
        case "owner":
        case "clanId":
          territoryData[change.field] = change.value;
          flagChanged = true;
          break;
      }
    });
    
    // Update flag if ownership changed
    if (flagChanged) {
      // Remove old flag if it exists
      if (territoryData.flagSprite) {
        territoryData.flagSprite.destroy();
        territoryData.flagSprite = null;
      }
      
      // Get updated territory data from server
      const territory = this.room.state.territories.find(t => t.id === territoryId);
      if (territory && territory.owner) {
        territoryData.flagSprite = this.createTerritoryFlag(territory);
        
        // Play capture sound
        this.sound.play('territory-captured', { volume: 0.5 });
        
        // Create visual effect
        this.createTerritoryCaptureEffect(territory.x, territory.y, territory.clanId);
      }
    }
  }
  
  createTerritoryCaptureEffect(x, y, clanId) {
    // Determine color based on clan
    let color;
    switch(clanId) {
      case 'Nosferatu':
        color = 0x993300;
        break;
      case 'Tremere':
        color = 0x990099;
        break;
      case 'Ventrue':
        color = 0x000099;
        break;
      case 'Toreador':
        color = 0x990066;
        break;
      default:
        color = 0x666666;
    }
    
    // Create expanding ring effect
    const ring = this.add.circle(x, y, 10, color, 0.5);
    ring.setStrokeStyle(3, color, 1);
    
    // Animate the ring
    this.tweens.add({
      targets: ring,
      radius: 100,
      alpha: 0,
      duration: 1500,
      onComplete: () => {
        ring.destroy();
      }
    });
  }
  
  addBloodPool(bloodPool) {
    // Create blood pool sprite
    const sprite = this.add.image(bloodPool.x, bloodPool.y, 'blood-pool');
    sprite.setDepth(bloodPool.y - 1);
    sprite.setAlpha(0);
    sprite.setScale(0.5);
    
    // Fade in animation
    this.tweens.add({
      targets: sprite,
      alpha: 0.7,
      scale: 1,
      duration: 1000
    });
    
    // Store blood pool data
    this.bloodPools.set(bloodPool.id, {
      sprite,
      x: bloodPool.x,
      y: bloodPool.y,
      radius: bloodPool.radius,
      lifeTime: bloodPool.lifeTime
    });
    
    // Set up timer to remove the blood pool when its lifetime expires
    this.time.delayedCall(bloodPool.lifeTime, () => {
      this.removeBloodPool(bloodPool.id);
    });
  }
  
  removeBloodPool(bloodPoolId) {
    const bloodPoolData = this.bloodPools.get(bloodPoolId);
    if (!bloodPoolData) return;
    
    // Fade out animation
    this.tweens.add({
      targets: bloodPoolData.sprite,
      alpha: 0,
      scale: 0.5,
      duration: 1000,
      onComplete: () => {
        bloodPoolData.sprite.destroy();
        this.bloodPools.delete(bloodPoolId);
      }
    });
  }
  
  addMinion(minion, minionId) {
    // Create minion sprite with color based on clan
    let color;
    switch(minion.clanId) {
      case 'Nosferatu':
        color = 0x993300;
        break;
      case 'Tremere':
        color = 0x990099;
        break;
      case 'Ventrue':
        color = 0x000099;
        break;
      case 'Toreador':
        color = 0x990066;
        break;
      default:
        color = 0x666666;
    }
    
    // Create minion using graphics for now (can be replaced with proper sprites later)
    const graphics = this.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.fillCircle(0, 0, minion.radius);
    graphics.lineStyle(2, 0x000000, 1);
    graphics.strokeCircle(0, 0, minion.radius);
    
    // Convert to sprite texture
    const texture = graphics.createGeometryMask();
    graphics.clear();
    
    // Create sprite using the generated texture
    const sprite = this.add.sprite(minion.x, minion.y, 'enemy-basic');
    sprite.setDepth(minion.y);
    sprite.setTint(color);
    sprite.setScale(0.5);
    
    // Add pulsing effect to indicate it's a friendly minion
    this.tweens.add({
      targets: sprite,
      alpha: 0.7,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
    
    // Store minion data
    this.minions.set(minionId, {
      sprite,
      x: minion.x,
      y: minion.y,
      health: minion.health,
      ownerId: minion.ownerId
    });
  }
  
  updateMinion(minionId, changes) {
    const minionData = this.minions.get(minionId);
    if (!minionData) return;
    
    // Apply changes
    changes.forEach(change => {
      switch (change.field) {
        case "x":
          minionData.x = change.value;
          minionData.sprite.x = change.value;
          break;
        case "y":
          minionData.y = change.value;
          minionData.sprite.y = change.value;
          minionData.sprite.setDepth(change.value);
          break;
        case "health":
          minionData.health = change.value;
          break;
      }
    });
  }
  
  removeMinion(minionId) {
    const minionData = this.minions.get(minionId);
    if (!minionData) return;
    
    // Fade out animation
    this.tweens.add({
      targets: minionData.sprite,
      alpha: 0,
      scale: 0,
      duration: 300,
      onComplete: () => {
        minionData.sprite.destroy();
        this.minions.delete(minionId);
      }
    });
  }
  
  showAbilityEffect(abilityId, playerId, targetX, targetY) {
    // Get player that used the ability
    const playerData = this.players.get(playerId);
    if (!playerData) return;
    
    // Play ability sound
    this.sound.play(`${abilityId}-sound`, { volume: 0.5 });
    
    // Create ability visual effect based on type
    switch(abilityId) {
      case 'bloodDrain':
        this.showBloodDrainEffect(playerData.sprite.x, playerData.sprite.y);
        break;
      case 'batSwarm':
        this.showBatSwarmEffect(playerData.sprite.x, playerData.sprite.y, targetX, targetY);
        break;
      case 'shadowDash':
        this.showShadowDashEffect(playerData.sprite.x, playerData.sprite.y, targetX, targetY);
        break;
      case 'bloodLance':
        this.showBloodLanceEffect(playerData.sprite.x, playerData.sprite.y, targetX, targetY);
        break;
      case 'nightShield':
        this.showNightShieldEffect(playerData.sprite.x, playerData.sprite.y);
        break;
      case 'poisonTouch':
        this.showPoisonTouchEffect(playerData.sprite.x, playerData.sprite.y, targetX, targetY);
        break;
      case 'bloodRitual':
        this.showBloodRitualEffect(playerData.sprite.x, playerData.sprite.y);
        break;
      case 'dominate':
        this.showDominateEffect(playerData.sprite.x, playerData.sprite.y, targetX, targetY);
        break;
      case 'mesmerize':
        this.showMesmerizeEffect(playerData.sprite.x, playerData.sprite.y);
        break;
    }
  }
  
  showBloodDrainEffect(x, y) {
    // Create blood drain aura
    const aura = this.add.sprite(x, y, 'blood-drain');
    aura.setDepth(y - 1);
    aura.setScale(2);
    aura.setAlpha(0.7);
    
    // Play animation
    aura.anims.play('blood-drain-effect');
    
    // Remove after animation completes
    aura.on('animationcomplete', () => {
      this.tweens.add({
        targets: aura,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          aura.destroy();
        }
      });
    });
  }
  
  showBatSwarmEffect(x, y, targetX, targetY) {
    // Calculate angle to target
    const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
    
    // Create multiple bats
    for (let i = 0; i < 24; i++) {
      // Calculate spread
      const spreadAngle = angle + Phaser.Math.FloatBetween(-Math.PI/4, Math.PI/4);
      const distance = Phaser.Math.FloatBetween(50, 300);
      const destX = x + Math.cos(spreadAngle) * distance;
      const destY = y + Math.sin(spreadAngle) * distance;
      
      // Create bat sprite
      const bat = this.add.sprite(x, y, 'bat-swarm');
      bat.setDepth(y + 10 + i);
      
      // Play animation
      bat.anims.play('bat-swarm-effect');
      
      // Move bat to destination
      this.tweens.add({
        targets: bat,
        x: destX,
        y: destY,
        duration: Phaser.Math.FloatBetween(500, 1200),
        onComplete: () => {
          // Create blood splash at destination
          this.createBloodParticles(bat.x, bat.y, 2);
          
          // Remove bat
          bat.destroy();
        }
      });
    }
  }
  
  showShadowDashEffect(x, y, targetX, targetY) {
    // Calculate direction
    const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
    const distance = 200; // Dash distance
    const destX = x + Math.cos(angle) * distance;
    const destY = y + Math.sin(angle) * distance;
    
    // Create shadow trail
    for (let i = 0; i < 10; i++) {
      const trailX = x + Math.cos(angle) * (distance * i / 10);
      const trailY = y + Math.sin(angle) * (distance * i / 10);
      
      const shadow = this.add.sprite(trailX, trailY, 'shadow-particle');
      shadow.setDepth(y - 1);
      shadow.setAlpha(0.7);
      
      // Play animation
      shadow.anims.play('shadow-particle-effect');
      
      // Fade out over time
      this.tweens.add({
        targets: shadow,
        alpha: 0,
        delay: i * 50,
        duration: 500,
        onComplete: () => {
          shadow.destroy();
        }
      });
    }
  }
  
  showBloodLanceEffect(x, y, targetX, targetY) {
    // Calculate angle
    const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
    
    // Create blood lance sprite
    const lance = this.add.sprite(x, y, 'blood-lance');
    lance.setDepth(y + 5);
    lance.setRotation(angle);
    
    // Play animation
    lance.anims.play('blood-lance-effect');
    
    // Move in direction of angle
    const speed = 800;
    const distance = 500;
    const duration = distance / speed * 1000;
    
    this.tweens.add({
      targets: lance,
      x: x + Math.cos(angle) * distance,
      y: y + Math.sin(angle) * distance,
      duration: duration,
      onComplete: () => {
        lance.destroy();
      }
    });
    
    // Add particle trail
    this.time.addEvent({
      delay: 50,
      repeat: duration / 50,
      callback: () => {
        this.createBloodParticles(lance.x, lance.y, 1);
      }
    });
  }
  
  showNightShieldEffect(x, y) {
    // Create shield sprite
    const shield = this.add.sprite(x, y, 'night-shield');
    shield.setDepth(y - 1);
    shield.setScale(1.5);
    shield.setAlpha(0.7);
    
    // Play animation
    shield.anims.play('night-shield-effect');
    
    // Pulse effect
    this.tweens.add({
      targets: shield,
      scale: 1.7,
      duration: 1000,
      yoyo: true,
      repeat: 7, // Shield lasts for 8 seconds
      onComplete: () => {
        // Explosion effect when shield expires
        const explosion = this.add.circle(x, y, 10, 0x8a2be2, 0.7);
        explosion.setDepth(y + 10);
        
        this.tweens.add({
          targets: explosion,
          radius: 120,
          alpha: 0,
          duration: 1000,
          onComplete: () => {
            explosion.destroy();
            shield.destroy();
          }
        });
      }
    });
  }
  
  showPoisonTouchEffect(x, y, targetX, targetY) {
    // Calculate angle
    const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
    
    // Create poison cloud sprite
    const poison = this.add.sprite(targetX, targetY, 'poison-touch');
    poison.setDepth(y + 5);
    poison.setScale(1.5);
    poison.setAlpha(0.7);
    
    // Play animation
    poison.anims.play('poison-touch-effect');
    
    // Fade out over time
    this.tweens.add({
      targets: poison,
      alpha: 0,
      scale: 2,
      duration: 1000,
      onComplete: () => {
        poison.destroy();
      }
    });
  }
  
  showBloodRitualEffect(x, y) {
    // Create ritual circle
    const ritual = this.add.sprite(x, y, 'blood-ritual');
    ritual.setDepth(y - 1);
    ritual.setScale(2);
    ritual.setAlpha(0.7);
    
    // Play animation
    ritual.anims.play('blood-ritual-effect');
    
    // Remove after animation completes
    ritual.on('animationcomplete', () => {
      this.tweens.add({
        targets: ritual,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          ritual.destroy();
        }
      });
    });
  }
  
  showDominateEffect(x, y, targetX, targetY) {
    // Create dominate beam connecting source and target
    const graphics = this.add.graphics();
    graphics.lineStyle(3, 0x000099, 0.7);
    graphics.lineBetween(x, y, targetX, targetY);
    
    // Create dominate effect at target
    const dominate = this.add.sprite(targetX, targetY, 'dominate');
    dominate.setDepth(y + 5);
    dominate.setAlpha(0.7);
    
    // Play animation
    dominate.anims.play('dominate-effect');
    
    // Fade out over time
    this.tweens.add({
      targets: [graphics, dominate],
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        graphics.destroy();
        dominate.destroy();
      }
    });
  }
  
  showMesmerizeEffect(x, y) {
    // Create mesmerize aura
    const mesmerize = this.add.sprite(x, y, 'mesmerize');
    mesmerize.setDepth(y - 1);
    mesmerize.setScale(2);
    mesmerize.setAlpha(0.7);
    
    // Play animation
    mesmerize.anims.play('mesmerize-effect');
    
    // Remove after animation completes
    mesmerize.on('animationcomplete', () => {
      this.tweens.add({
        targets: mesmerize,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          mesmerize.destroy();
        }
      });
    });
  }
  
  update(time, delta) {
    if (!this.gameActive || !this.player) return;
    
    // Handle player movement
    this.handlePlayerMovement();
    
    // Handle ability usage
    this.handleAbilityInput();
    
    // Update UI debug text
    this.updateDebugText();
  }
  
  handlePlayerMovement() {
    if (!this.playerSprite || !this.player) return;
    
    // Calculate movement direction
    let dx = 0;
    let dy = 0;
    
    if (this.cursors.left.isDown || this.keyA.isDown) {
      dx = -1;
    } else if (this.cursors.right.isDown || this.keyD.isDown) {
      dx = 1;
    }
    
    if (this.cursors.up.isDown || this.keyW.isDown) {
      dy = -1;
    } else if (this.cursors.down.isDown || this.keyS.isDown) {
      dy = 1;
    }
    
    // Normalize for diagonal movement
    if (dx !== 0 && dy !== 0) {
      const length = Math.sqrt(dx * dx + dy * dy);
      dx = dx / length;
      dy = dy / length;
    }
    
    // Apply movement
    if (dx !== 0 || dy !== 0) {
      // Get player speed from server
      const speed = this.player.speed || 5;
      
      // Calculate new position
      const newX = this.playerSprite.x + dx * speed;
      const newY = this.playerSprite.y + dy * speed;
      
      // Update local position
      this.playerSprite.x = newX;
      this.playerSprite.y = newY;
      this.playerSprite.setDepth(newY);
      
      // Update name and health bar position
      const playerData = this.players.get(this.room.sessionId);
      if (playerData) {
        playerData.nameText.x = newX;
        playerData.nameText.y = newY - 40;
        
        playerData.healthBarBackground.x = newX;
        playerData.healthBarBackground.y = newY - 25;
        
        playerData.healthBar.x = newX - 25;
        playerData.healthBar.y = newY - 25;
      }
      
      // Send position update to server (with rate limiting)
      const now = Date.now();
      if (now - this.lastPositionUpdate > this.positionUpdateInterval) {
        this.lastPositionUpdate = now;
        
        // Only send if position has changed significantly
        if (Math.abs(newX - this.lastSentX) > 1 || Math.abs(newY - this.lastSentY) > 1) {
          this.room.send("move", { x: newX, y: newY });
          this.lastSentX = newX;
          this.lastSentY = newY;
        }
      }
      
      // Set appropriate animation
      const clan = this.player.clan.toLowerCase();
      if (!this.playerSprite.anims.isPlaying || this.playerSprite.anims.currentAnim.key !== `${clan}-walk`) {
        this.playerSprite.anims.play(`${clan}-walk`, true);
      }
      
      // Flip sprite based on movement direction
      if (dx < 0) {
        this.playerSprite.setFlipX(true);
      } else if (dx > 0) {
        this.playerSprite.setFlipX(false);
      }
    } else {
      // Idle animation
      const clan = this.player.clan.toLowerCase();
      if (!this.playerSprite.anims.isPlaying || this.playerSprite.anims.currentAnim.key !== `${clan}-idle`) {
        this.playerSprite.anims.play(`${clan}-idle`, true);
      }
    }
  }
  
  handleAbilityInput() {
    // Check number keys for ability usage
    for (let i = 0; i < this.keys1to5.length; i++) {
      const key = this.keys1to5[i];
      
      if (Phaser.Input.Keyboard.JustDown(key)) {
        // Map key index to ability ID
        let abilityId;
        switch(i) {
          case 0: abilityId = 'bloodDrain'; break;
          case 1: abilityId = 'batSwarm'; break;
          case 2: abilityId = 'shadowDash'; break;
          case 3: abilityId = 'bloodLance'; break;
          case 4: abilityId = 'nightShield'; break;
        }
        
        // Check if this player has this ability unlocked
        const abilityData = window.gameState.abilities.find(a => a.id === abilityId);
        if (!abilityData) continue;
        
        // Check if ability is on cooldown
        const cooldownInfo = this.abilityCooldowns.get(abilityId);
        if (!cooldownInfo) continue;
        
        const now = Date.now();
        if (now - cooldownInfo.lastUsed < cooldownInfo.cooldown) {
          // Ability is on cooldown
          console.log(`${abilityId} is on cooldown`);
          continue;
        }
        
        // Use ability
        this.room.send("useAbility", {
          abilityId: abilityId,
          targetX: this.targetPosition.x,
          targetY: this.targetPosition.y
        });
        
        // Update cooldown
        cooldownInfo.lastUsed = now;
      }
    }
  }
  
  updateDebugText() {
    if (!this.debugText) return;
    
    // Get player position
    const x = Math.floor(this.playerSprite?.x || 0);
    const y = Math.floor(this.playerSprite?.y || 0);
    
    // Get player stats
    const health = Math.floor(this.player?.health || 0);
    const energy = Math.floor(this.player?.energy || 0);
    
    // Get enemy count
    const enemyCount = this.enemies.size;
    
    // Get ping
    const ping = this.room.ping || 0;
    
    // Update text
    this.debugText.setText(
      `X: ${x}, Y: ${y}\n` +
      `Health: ${health}, Energy: ${energy}\n` +
      `Enemies: ${enemyCount}\n` +
      `Ping: ${ping}ms\n` +
      `Time: ${window.gameState.currentTime}`
    );
  }
}