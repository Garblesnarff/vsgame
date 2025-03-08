// client/src/scenes/LoadingScene.js
import Phaser from 'phaser';

export class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
  }

  preload() {
    // Create a loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Create loading bar background
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
    
    // Loading text
    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading...',
      style: {
        font: '20px monospace',
        fill: '#ffffff'
      }
    });
    loadingText.setOrigin(0.5, 0.5);
    
    // Percentage text
    const percentText = this.make.text({
      x: width / 2,
      y: height / 2,
      text: '0%',
      style: {
        font: '18px monospace',
        fill: '#ffffff'
      }
    });
    percentText.setOrigin(0.5, 0.5);
    
    // Asset loading text
    const assetText = this.make.text({
      x: width / 2,
      y: height / 2 + 50,
      text: '',
      style: {
        font: '16px monospace',
        fill: '#ffffff'
      }
    });
    assetText.setOrigin(0.5, 0.5);
    
    // Update progress bar as assets load
    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0x8a2be2, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
      percentText.setText(parseInt(value * 100) + '%');
    });
    
    // Update the asset text as files load
    this.load.on('fileprogress', (file) => {
      assetText.setText('Loading: ' + file.key);
    });
    
    // Remove progress bar when loading completes
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
      assetText.destroy();
    });
    
    // Load all game assets
    this.loadAssets();
  }

  loadAssets() {
    // Load player sprites
    this.load.spritesheet('vampire-nosferatu', 'assets/images/vampire-nosferatu.png', { 
      frameWidth: 64, 
      frameHeight: 64 
    });
    this.load.spritesheet('vampire-tremere', 'assets/images/vampire-tremere.png', { 
      frameWidth: 64, 
      frameHeight: 64 
    });
    this.load.spritesheet('vampire-ventrue', 'assets/images/vampire-ventrue.png', { 
      frameWidth: 64, 
      frameHeight: 64 
    });
    this.load.spritesheet('vampire-toreador', 'assets/images/vampire-toreador.png', { 
      frameWidth: 64, 
      frameHeight: 64 
    });
    
    // Load enemy sprites
    this.load.spritesheet('enemy-basic', 'assets/images/enemy-basic.png', { 
      frameWidth: 48, 
      frameHeight: 48 
    });
    this.load.spritesheet('enemy-hunter', 'assets/images/enemy-hunter.png', { 
      frameWidth: 48, 
      frameHeight: 64 
    });
    this.load.spritesheet('enemy-swarm', 'assets/images/enemy-swarm.png', { 
      frameWidth: 32, 
      frameHeight: 32 
    });
    this.load.spritesheet('enemy-brute', 'assets/images/enemy-brute.png', { 
      frameWidth: 80, 
      frameHeight: 80 
    });
    
    // Load ability effects
    this.load.spritesheet('blood-drain', 'assets/images/blood-drain.png', { 
      frameWidth: 128, 
      frameHeight: 128 
    });
    this.load.spritesheet('bat-swarm', 'assets/images/bat-swarm.png', { 
      frameWidth: 32, 
      frameHeight: 32 
    });
    this.load.spritesheet('shadow-dash', 'assets/images/shadow-dash.png', { 
      frameWidth: 64, 
      frameHeight: 64 
    });
    this.load.spritesheet('blood-lance', 'assets/images/blood-lance.png', { 
      frameWidth: 96, 
      frameHeight: 32 
    });
    this.load.spritesheet('night-shield', 'assets/images/night-shield.png', { 
      frameWidth: 128, 
      frameHeight: 128 
    });
    this.load.spritesheet('poison-touch', 'assets/images/poison-touch.png', { 
      frameWidth: 64, 
      frameHeight: 64 
    });
    this.load.spritesheet('blood-ritual', 'assets/images/blood-ritual.png', { 
      frameWidth: 128, 
      frameHeight: 128 
    });
    this.load.spritesheet('dominate', 'assets/images/dominate.png', { 
      frameWidth: 64, 
      frameHeight: 64 
    });
    this.load.spritesheet('mesmerize', 'assets/images/mesmerize.png', { 
      frameWidth: 96, 
      frameHeight: 96 
    });
    
    // Load projectiles
    this.load.spritesheet('projectile', 'assets/images/projectile.png', { 
      frameWidth: 16, 
      frameHeight: 16 
    });
    this.load.spritesheet('enemy-projectile', 'assets/images/enemy-projectile.png', { 
      frameWidth: 16, 
      frameHeight: 16 
    });
    
    // Load particle effects
    this.load.spritesheet('blood-particle', 'assets/images/blood-particle.png', { 
      frameWidth: 16, 
      frameHeight: 16 
    });
    this.load.spritesheet('shadow-particle', 'assets/images/shadow-particle.png', { 
      frameWidth: 16, 
      frameHeight: 16 
    });
    
    // Load environment
    this.load.image('tileset', 'assets/images/tileset.png');
    this.load.image('territory-marker', 'assets/images/territory-marker.png');
    this.load.image('blood-pool', 'assets/images/blood-pool.png');
    
    // Load UI elements
    this.load.image('ability-frame', 'assets/images/ability-frame.png');
    this.load.image('ability-cooldown', 'assets/images/ability-cooldown.png');
    this.load.image('health-bar', 'assets/images/health-bar.png');
    this.load.image('energy-bar', 'assets/images/energy-bar.png');
    this.load.image('day-icon', 'assets/images/day-icon.png');
    this.load.image('night-icon', 'assets/images/night-icon.png');
    this.load.image('minimap-frame', 'assets/images/minimap-frame.png');
    
    // Load icon atlas for abilities and status effects
    this.load.atlas('icons', 'assets/images/icons.png', 'assets/images/icons.json');
    
    // Load sound effects for abilities
    this.load.audio('blood-drain-sound', 'assets/sounds/blood-drain.mp3');
    this.load.audio('bat-swarm-sound', 'assets/sounds/bat-swarm.mp3');
    this.load.audio('shadow-dash-sound', 'assets/sounds/shadow-dash.mp3');
    this.load.audio('blood-lance-sound', 'assets/sounds/blood-lance.mp3');
    this.load.audio('night-shield-sound', 'assets/sounds/night-shield.mp3');
    this.load.audio('poison-touch-sound', 'assets/sounds/poison-touch.mp3');
    this.load.audio('blood-ritual-sound', 'assets/sounds/blood-ritual.mp3');
    this.load.audio('dominate-sound', 'assets/sounds/dominate.mp3');
    this.load.audio('mesmerize-sound', 'assets/sounds/mesmerize.mp3');
    
    // Load ambient sounds
    this.load.audio('ambient-night', 'assets/sounds/ambient-night.mp3');
    this.load.audio('ambient-day', 'assets/sounds/ambient-day.mp3');
    
    // Load combat sounds
    this.load.audio('player-hit', 'assets/sounds/player-hit.mp3');
    this.load.audio('enemy-hit', 'assets/sounds/enemy-hit.mp3');
    this.load.audio('enemy-death', 'assets/sounds/enemy-death.mp3');
    this.load.audio('territory-captured', 'assets/sounds/territory-captured.mp3');
  }

  create() {
    // Create animations for player characters
    this.createPlayerAnimations();
    
    // Create animations for enemies
    this.createEnemyAnimations();
    
    // Create animations for ability effects
    this.createAbilityAnimations();
    
    // Create animations for particles
    this.createParticleAnimations();
    
    // Start the game scene if we're connected to a room
    if (window.gameState.roomJoined) {
      this.scene.start('GameScene');
    } else {
      // Otherwise stay at the loading screen until we join a room
      // The logic in main.js will take care of starting the game scene
      
      // Add some text to indicate we're waiting for server connection
      const width = this.cameras.main.width;
      const height = this.cameras.main.height;
      
      this.add.text(width / 2, height / 2, 'Connecting to server...\nPlease wait...', {
        font: '20px monospace',
        fill: '#ffffff',
        align: 'center'
      }).setOrigin(0.5, 0.5);
    }
  }
  
  createPlayerAnimations() {
    // Nosferatu animations
    this.anims.create({
      key: 'nosferatu-idle',
      frames: this.anims.generateFrameNumbers('vampire-nosferatu', { start: 0, end: 3 }),
      frameRate: 5,
      repeat: -1
    });
    
    this.anims.create({
      key: 'nosferatu-walk',
      frames: this.anims.generateFrameNumbers('vampire-nosferatu', { start: 4, end: 11 }),
      frameRate: 10,
      repeat: -1
    });
    
    // Repeat similar animation setup for other vampire clans
    
    // Tremere animations
    this.anims.create({
      key: 'tremere-idle',
      frames: this.anims.generateFrameNumbers('vampire-tremere', { start: 0, end: 3 }),
      frameRate: 5,
      repeat: -1
    });
    
    this.anims.create({
      key: 'tremere-walk',
      frames: this.anims.generateFrameNumbers('vampire-tremere', { start: 4, end: 11 }),
      frameRate: 10,
      repeat: -1
    });
    
    // Ventrue animations
    this.anims.create({
      key: 'ventrue-idle',
      frames: this.anims.generateFrameNumbers('vampire-ventrue', { start: 0, end: 3 }),
      frameRate: 5,
      repeat: -1
    });
    
    this.anims.create({
      key: 'ventrue-walk',
      frames: this.anims.generateFrameNumbers('vampire-ventrue', { start: 4, end: 11 }),
      frameRate: 10,
      repeat: -1
    });
    
    // Toreador animations
    this.anims.create({
      key: 'toreador-idle',
      frames: this.anims.generateFrameNumbers('vampire-toreador', { start: 0, end: 3 }),
      frameRate: 5,
      repeat: -1
    });
    
    this.anims.create({
      key: 'toreador-walk',
      frames: this.anims.generateFrameNumbers('vampire-toreador', { start: 4, end: 11 }),
      frameRate: 10,
      repeat: -1
    });
  }
  
  createEnemyAnimations() {
    // Basic enemy animations
    this.anims.create({
      key: 'enemy-basic-idle',
      frames: this.anims.generateFrameNumbers('enemy-basic', { start: 0, end: 3 }),
      frameRate: 5,
      repeat: -1
    });
    
    this.anims.create({
      key: 'enemy-basic-walk',
      frames: this.anims.generateFrameNumbers('enemy-basic', { start: 4, end: 11 }),
      frameRate: 10,
      repeat: -1
    });
    
    // Hunter enemy animations
    this.anims.create({
      key: 'enemy-hunter-idle',
      frames: this.anims.generateFrameNumbers('enemy-hunter', { start: 0, end: 3 }),
      frameRate: 5,
      repeat: -1
    });
    
    this.anims.create({
      key: 'enemy-hunter-walk',
      frames: this.anims.generateFrameNumbers('enemy-hunter', { start: 4, end: 11 }),
      frameRate: 10,
      repeat: -1
    });
    
    this.anims.create({
      key: 'enemy-hunter-attack',
      frames: this.anims.generateFrameNumbers('enemy-hunter', { start: 12, end: 15 }),
      frameRate: 10,
      repeat: 0
    });
    
    // Swarm enemy animations
    this.anims.create({
      key: 'enemy-swarm-idle',
      frames: this.anims.generateFrameNumbers('enemy-swarm', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });
    
    this.anims.create({
      key: 'enemy-swarm-walk',
      frames: this.anims.generateFrameNumbers('enemy-swarm', { start: 4, end: 11 }),
      frameRate: 12,
      repeat: -1
    });
    
    // Brute enemy animations
    this.anims.create({
      key: 'enemy-brute-idle',
      frames: this.anims.generateFrameNumbers('enemy-brute', { start: 0, end: 3 }),
      frameRate: 5,
      repeat: -1
    });
    
    this.anims.create({
      key: 'enemy-brute-walk',
      frames: this.anims.generateFrameNumbers('enemy-brute', { start: 4, end: 11 }),
      frameRate: 8,
      repeat: -1
    });
    
    this.anims.create({
      key: 'enemy-brute-attack',
      frames: this.anims.generateFrameNumbers('enemy-brute', { start: 12, end: 17 }),
      frameRate: 10,
      repeat: 0
    });
  }
  
  createAbilityAnimations() {
    // Blood Drain animation
    this.anims.create({
      key: 'blood-drain-effect',
      frames: this.anims.generateFrameNumbers('blood-drain', { start: 0, end: 9 }),
      frameRate: 10,
      repeat: -1
    });
    
    // Bat Swarm animation
    this.anims.create({
      key: 'bat-swarm-effect',
      frames: this.anims.generateFrameNumbers('bat-swarm', { start: 0, end: 7 }),
      frameRate: 12,
      repeat: -1
    });
    
    // Shadow Dash animation
    this.anims.create({
      key: 'shadow-dash-effect',
      frames: this.anims.generateFrameNumbers('shadow-dash', { start: 0, end: 5 }),
      frameRate: 15,
      repeat: 0
    });
    
    // Blood Lance animation
    this.anims.create({
      key: 'blood-lance-effect',
      frames: this.anims.generateFrameNumbers('blood-lance', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
    
    // Night Shield animation
    this.anims.create({
      key: 'night-shield-effect',
      frames: this.anims.generateFrameNumbers('night-shield', { start: 0, end: 7 }),
      frameRate: 8,
      repeat: -1
    });
    
    // Additional abilities for different clans
    
    // Poison Touch (Nosferatu)
    this.anims.create({
      key: 'poison-touch-effect',
      frames: this.anims.generateFrameNumbers('poison-touch', { start: 0, end: 7 }),
      frameRate: 12,
      repeat: 0
    });
    
    // Blood Ritual (Tremere)
    this.anims.create({
      key: 'blood-ritual-effect',
      frames: this.anims.generateFrameNumbers('blood-ritual', { start: 0, end: 11 }),
      frameRate: 10,
      repeat: 0
    });
    
    // Dominate (Ventrue)
    this.anims.create({
      key: 'dominate-effect',
      frames: this.anims.generateFrameNumbers('dominate', { start: 0, end: 5 }),
      frameRate: 8,
      repeat: 0
    });
    
    // Mesmerize (Toreador)
    this.anims.create({
      key: 'mesmerize-effect',
      frames: this.anims.generateFrameNumbers('mesmerize', { start: 0, end: 9 }),
      frameRate: 10,
      repeat: 0
    });
  }
  
  createParticleAnimations() {
    // Blood particle animation
    this.anims.create({
      key: 'blood-particle-effect',
      frames: this.anims.generateFrameNumbers('blood-particle', { start: 0, end: 5 }),
      frameRate: 12,
      repeat: 0
    });
    
    // Shadow particle animation
    this.anims.create({
      key: 'shadow-particle-effect',
      frames: this.anims.generateFrameNumbers('shadow-particle', { start: 0, end: 5 }),
      frameRate: 12,
      repeat: 0
    });
  }
}