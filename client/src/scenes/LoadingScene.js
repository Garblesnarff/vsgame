// client/src/scenes/LoadingScene.js
import Phaser from 'phaser';

export class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
    this.assetsLoaded = 0;
    this.assetsFailed = 0;
  }
  
  /**
   * Create fallback assets for any missing ones
   */
  createFallbackAssets() {
    // Create a fallback icons texture if it doesn't exist
    if (!this.textures.exists('icons')) {
      console.log("Creating fallback icons");
      this.createFallbackIcons();
    }
  }
  
  /**
   * Create a fallback icons texture
   */
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
    // Only create animations if textures exist
    const createIfExists = (key, animConfig) => {
      if (this.textures.exists(key)) {
        this.anims.create(animConfig);
      }
    };
    
    const clans = ['nosferatu', 'tremere', 'ventrue', 'toreador'];
    
    clans.forEach(clan => {
      const key = `vampire-${clan}`;
      if (this.textures.exists(key)) {
        // Idle animation
        createIfExists(key, {
          key: `${clan}-idle`,
          frames: this.anims.generateFrameNumbers(key, { start: 0, end: 3 }),
          frameRate: 5,
          repeat: -1
        });
        
        // Walk animation
        createIfExists(key, {
          key: `${clan}-walk`,
          frames: this.anims.generateFrameNumbers(key, { start: 4, end: 11 }),
          frameRate: 10,
          repeat: -1
        });
      } else {
        console.warn(`Texture for ${key} not found, skipping animations`);
      }
    });
  }
  
  createEnemyAnimations() {
    // Only create animations if textures exist
    const createIfExists = (key, animConfig) => {
      if (this.textures.exists(key)) {
        this.anims.create(animConfig);
      }
    };
    
    const enemyTypes = ['basic', 'hunter', 'swarm', 'brute'];
    
    enemyTypes.forEach(type => {
      const key = `enemy-${type}`;
      if (this.textures.exists(key)) {
        // Idle animation
        createIfExists(key, {
          key: `enemy-${type}-idle`,
          frames: this.anims.generateFrameNumbers(key, { start: 0, end: 3 }),
          frameRate: 5,
          repeat: -1
        });
        
        // Walk animation
        createIfExists(key, {
          key: `enemy-${type}-walk`,
          frames: this.anims.generateFrameNumbers(key, { start: 4, end: 11 }),
          frameRate: 10,
          repeat: -1
        });
        
        // Attack animation (only for some types)
        if (type === 'hunter' || type === 'brute') {
          createIfExists(key, {
            key: `enemy-${type}-attack`,
            frames: this.anims.generateFrameNumbers(key, { start: 12, end: 15 }),
            frameRate: 10,
            repeat: 0
          });
        }
      } else {
        console.warn(`Texture for ${key} not found, skipping animations`);
      }
    });
  }
  
  createAbilityAnimations() {
    // Only create animations if textures exist
    const createIfExists = (key, animConfig) => {
      if (this.textures.exists(key)) {
        this.anims.create(animConfig);
      }
    };
    
    const abilities = [
      { key: 'blood-drain', frames: 10, frameRate: 10, repeat: -1 },
      { key: 'bat-swarm', frames: 8, frameRate: 12, repeat: -1 },
      { key: 'shadow-dash', frames: 6, frameRate: 15, repeat: 0 },
      { key: 'blood-lance', frames: 4, frameRate: 10, repeat: -1 },
      { key: 'night-shield', frames: 8, frameRate: 8, repeat: -1 },
      { key: 'poison-touch', frames: 8, frameRate: 12, repeat: 0 },
      { key: 'blood-ritual', frames: 12, frameRate: 10, repeat: 0 },
      { key: 'dominate', frames: 6, frameRate: 8, repeat: 0 },
      { key: 'mesmerize', frames: 10, frameRate: 10, repeat: 0 }
    ];
    
    abilities.forEach(ability => {
      const key = ability.key;
      if (this.textures.exists(key)) {
        createIfExists(key, {
          key: `${key}-effect`,
          frames: this.anims.generateFrameNumbers(key, { start: 0, end: ability.frames - 1 }),
          frameRate: ability.frameRate,
          repeat: ability.repeat
        });
      } else {
        console.warn(`Texture for ${key} not found, skipping animations`);
      }
    });
  }
  
  createParticleAnimations() {
    // Only create animations if textures exist
    const createIfExists = (key, animConfig) => {
      if (this.textures.exists(key)) {
        this.anims.create(animConfig);
      }
    };
    
    const particles = [
      { key: 'blood-particle', frames: 6, frameRate: 12, repeat: 0 },
      { key: 'shadow-particle', frames: 6, frameRate: 12, repeat: 0 }
    ];
    
    particles.forEach(particle => {
      const key = particle.key;
      if (this.textures.exists(key)) {
        createIfExists(key, {
          key: `${key}-effect`,
          frames: this.anims.generateFrameNumbers(key, { start: 0, end: particle.frames - 1 }),
          frameRate: particle.frameRate,
          repeat: particle.repeat
        });
      } else {
        console.warn(`Texture for ${key} not found, skipping animations`);
      }
    });
  }
  
  createFallbackIcons() {
    // We'll create a basic icon sheet with colored rectangles
    const graphics = this.make.graphics();
    
    // Define some basic colors for common icons
    const colors = [
      0xff0000, // health - red
      0x00b3ff, // energy - blue
      0x444444, // skull - dark gray
      0xffcc00, // level - gold
      0x6a0dad  // corner - purple
    ];
    
    // Create a grid of colored rectangles
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 5; x++) {
        const index = y * 5 + x;
        const color = colors[index % colors.length];
        
        graphics.fillStyle(color);
        graphics.fillRect(x * 32, y * 32, 32, 32);
        graphics.lineStyle(1, 0xffffff);
        graphics.strokeRect(x * 32, y * 32, 32, 32);
      }
    }
    
    graphics.generateTexture('icons-fallback', 160, 128);
    
    // Create an atlas with frame data
    const frames = {};
    
    // Create frames for commonly needed icons
    const iconNames = [
      'health', 'energy', 'skull', 'level', 'corner',
      'tree', 'rock', 'gravestone', 'shrub',
      'bloodDrain', 'batSwarm', 'shadowDash', 'bloodLance', 'nightShield',
      'poisonTouch', 'bloodRitual', 'dominate', 'mesmerize'
    ];
    
    // Create frames in a grid pattern
    for (let i = 0; i < iconNames.length; i++) {
      const x = (i % 5) * 32;
      const y = Math.floor(i / 5) * 32;
      
      frames[iconNames[i]] = {
        frame: { x, y, w: 32, h: 32 },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: 32, h: 32 },
        sourceSize: { w: 32, h: 32 }
      };
    }
    
    // Add the frames to the texture
    this.textures.addAtlas('icons', this.textures.get('icons-fallback').getSourceImage(), { frames });
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
    
    // Setup error handling
    this.load.on('loaderror', (fileObj) => {
      console.warn(`Error loading asset: ${fileObj.key}`);
      this.assetsFailed++;
      assetText.setText(`Failed: ${fileObj.key}\nLoading next asset...`);
    });
    
    // Update progress bar as assets load
    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0x8a2be2, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
      percentText.setText(parseInt(value * 100) + '%');
    });
    
    // Update the asset text as files load
    this.load.on('filecomplete', (key, type, data) => {
      this.assetsLoaded++;
      assetText.setText('Loading: ' + key);
    });
    
    // Remove progress bar when loading completes
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
      assetText.destroy();
      
      console.log(`Assets loaded: ${this.assetsLoaded}, failed: ${this.assetsFailed}`);
      
      // Create fallbacks for any missing assets
      this.createFallbackAssets();
    });
    
    // Load all game assets
    this.loadAssets();
  }

  /**
   * Attempt to load assets with fallbacks for missing files
   */
  loadAssets() {
    // Helper function to create a fallback for sprite sheets
    const createFallbackSpriteSheet = (key, width, height, frameWidth, frameHeight) => {
      const graphics = this.make.graphics();
      const color = Phaser.Display.Color.RandomRGB();
      graphics.fillStyle(color.color);
      graphics.fillRect(0, 0, width, height);
      graphics.lineStyle(1, 0xffffff);
      
      // Add a grid to show frame boundaries
      for (let y = 0; y < height; y += frameHeight) {
        for (let x = 0; x < width; x += frameWidth) {
          graphics.strokeRect(x, y, frameWidth, frameHeight);
        }
      }
      
      graphics.generateTexture(key, width, height);
    };
    
    // Try to load player sprites with fallbacks
    const loadPlayerSprites = () => {
      const clans = ['nosferatu', 'tremere', 'ventrue', 'toreador'];
      clans.forEach(clan => {
        this.load.spritesheet(`vampire-${clan}`, `assets/images/vampire-${clan}.png`, { 
          frameWidth: 64, 
          frameHeight: 64 
        }).on('fileerror', () => {
          createFallbackSpriteSheet(`vampire-${clan}`, 768, 128, 64, 64);
        });
      });
    };
    
    const loadEnemySprites = () => {
      const enemyTypes = ['basic', 'hunter', 'swarm', 'brute'];
      const sizes = [
        { w: 48, h: 48 },  // basic
        { w: 48, h: 64 },  // hunter
        { w: 32, h: 32 },  // swarm
        { w: 80, h: 80 }   // brute
      ];
      
      enemyTypes.forEach((type, index) => {
        const { w, h } = sizes[index];
        this.load.spritesheet(`enemy-${type}`, `assets/images/enemy-${type}.png`, { 
          frameWidth: w, 
          frameHeight: h 
        }).on('fileerror', () => {
          createFallbackSpriteSheet(`enemy-${type}`, w * 12, h * 2, w, h);
        });
      });
    };
    
    const loadAbilityEffects = () => {
      const abilities = [
        { name: 'blood-drain', w: 128, h: 128 },
        { name: 'bat-swarm', w: 32, h: 32 },
        { name: 'shadow-dash', w: 64, h: 64 },
        { name: 'blood-lance', w: 96, h: 32 },
        { name: 'night-shield', w: 128, h: 128 },
        { name: 'poison-touch', w: 64, h: 64 },
        { name: 'blood-ritual', w: 128, h: 128 },
        { name: 'dominate', w: 64, h: 64 },
        { name: 'mesmerize', w: 96, h: 96 }
      ];
      
      abilities.forEach(ability => {
        this.load.spritesheet(ability.name, `assets/images/${ability.name}.png`, { 
          frameWidth: ability.w, 
          frameHeight: ability.h 
        }).on('fileerror', () => {
          createFallbackSpriteSheet(ability.name, ability.w * 4, ability.h, ability.w, ability.h);
        });
      });
    };
    
    const loadProjectiles = () => {
      this.load.spritesheet('projectile', 'assets/images/projectile.png', { 
        frameWidth: 16, 
        frameHeight: 16 
      }).on('fileerror', () => {
        createFallbackSpriteSheet('projectile', 64, 16, 16, 16);
      });
      
      this.load.spritesheet('enemy-projectile', 'assets/images/enemy-projectile.png', { 
        frameWidth: 16, 
        frameHeight: 16 
      }).on('fileerror', () => {
        createFallbackSpriteSheet('enemy-projectile', 64, 16, 16, 16);
      });
    };
    
    const loadParticleEffects = () => {
      this.load.spritesheet('blood-particle', 'assets/images/blood-particle.png', { 
        frameWidth: 16, 
        frameHeight: 16 
      }).on('fileerror', () => {
        createFallbackSpriteSheet('blood-particle', 96, 16, 16, 16);
      });
      
      this.load.spritesheet('shadow-particle', 'assets/images/shadow-particle.png', { 
        frameWidth: 16, 
        frameHeight: 16 
      }).on('fileerror', () => {
        createFallbackSpriteSheet('shadow-particle', 96, 16, 16, 16);
      });
    };
    
    const loadEnvironment = () => {
      // Try to load environment assets
      this.load.image('tileset', 'assets/images/tileset.png')
        .on('fileerror', () => {
          // Create a simple tile pattern
          const graphics = this.make.graphics();
          graphics.fillStyle(0x111122);
          graphics.fillRect(0, 0, 512, 512);
          
          // Add some texture to the background
          graphics.lineStyle(1, 0x222244);
          for (let i = 0; i < 512; i += 32) {
            graphics.lineBetween(0, i, 512, i);
            graphics.lineBetween(i, 0, i, 512);
          }
          
          graphics.generateTexture('tileset', 512, 512);
        });
        
      // Load other environment assets
      const envAssets = [
        'territory-marker',
        'blood-pool'
      ];
      
      envAssets.forEach(asset => {
        this.load.image(asset, `assets/images/${asset}.png`)
          .on('fileerror', () => {
            // Create a simple placeholder
            const graphics = this.make.graphics();
            graphics.fillStyle(0x993366);
            graphics.fillCircle(32, 32, 32);
            graphics.generateTexture(asset, 64, 64);
          });
      });
    };
    
    const loadUI = () => {
      // Try to load UI element images
      const uiAssets = [
        'ability-frame',
        'ability-cooldown',
        'health-bar',
        'energy-bar',
        'day-icon',
        'night-icon',
        'minimap-frame'
      ];
      
      uiAssets.forEach(asset => {
        this.load.image(asset, `assets/images/${asset}.png`)
          .on('fileerror', () => {
            // Create a simple placeholder
            const graphics = this.make.graphics();
            
            if (asset === 'health-bar') {
              graphics.fillStyle(0xff0000);
              graphics.fillRect(0, 0, 200, 20);
            } else if (asset === 'energy-bar') {
              graphics.fillStyle(0x00ffff);
              graphics.fillRect(0, 0, 200, 20);
            } else if (asset === 'day-icon') {
              graphics.fillStyle(0xffcc00);
              graphics.fillCircle(16, 16, 16);
            } else if (asset === 'night-icon') {
              graphics.fillStyle(0x333366);
              graphics.fillCircle(16, 16, 16);
            } else {
              graphics.fillStyle(0x444444);
              graphics.fillRect(0, 0, 64, 64);
              graphics.lineStyle(2, 0x888888);
              graphics.strokeRect(2, 2, 60, 60);
            }
            
            graphics.generateTexture(asset, 64, 64);
          });
      });
    };
    
    const loadSounds = () => {
      // Try to load sounds but don't create fallbacks as they're not critical
      const abilityBaseSounds = [
        'blood-drain', 'bat-swarm', 'shadow-dash', 'blood-lance', 'night-shield',
        'poison-touch', 'blood-ritual', 'dominate', 'mesmerize'
      ];
      
      abilityBaseSounds.forEach(sound => {
        this.load.audio(`${sound}-sound`, `assets/sounds/${sound}.mp3`);
      });
      
      // Ambient sounds
      this.load.audio('ambient-night', 'assets/sounds/ambient-night.mp3');
      this.load.audio('ambient-day', 'assets/sounds/ambient-day.mp3');
      
      // Combat sounds
      const combatSounds = [
        'player-hit', 'enemy-hit', 'enemy-death', 'territory-captured'
      ];
      
      combatSounds.forEach(sound => {
        this.load.audio(sound, `assets/sounds/${sound}.mp3`);
      });
    };
    
    // Load all asset types
    loadPlayerSprites();
    loadEnemySprites();
    loadAbilityEffects();
    loadProjectiles();
    loadParticleEffects();
    loadEnvironment();
    loadUI();
    loadSounds();
  }
}