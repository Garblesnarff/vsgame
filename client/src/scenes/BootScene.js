// client/src/scenes/BootScene.js
import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Add error handling for loading assets
    this.load.on('loaderror', (fileObj) => {
      console.warn(`Error loading asset: ${fileObj.key}`);
      // Continue loading other assets
      this.load.totalFailed++;
    });

    // Create placeholder textures for missing assets
    this.createPlaceholderTextures();
    
    // Try to preload essential assets needed before the loading screen
    this.loadWithFallback('image', 'background', 'assets/images/background.jpg', this.createBackgroundTexture.bind(this));
    this.loadWithFallback('image', 'logo', 'assets/images/logo.png', this.createLogoTexture.bind(this));
    
    // Preload UI elements with fallbacks
    this.loadWithFallback('image', 'button', 'assets/images/button.png', this.createButtonTexture.bind(this));
    this.loadWithFallback('image', 'button-hover', 'assets/images/button-hover.png', this.createButtonHoverTexture.bind(this));
    
    // Try to preload sound effects (non-critical)
    this.load.audio('button-click', 'assets/sounds/button-click.mp3');
    this.load.audio('background-music', 'assets/sounds/background-music.mp3');
    
    // Try to load icon atlas, with a fallback for when it fails
    this.loadIconsWithFallback();
  }

  /**
   * Creates a CSS link element to load the icons CSS
   */
  loadIconsCSS() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'styles/icons.css';
    document.head.appendChild(link);
    console.log("Using CSS-based icons as fallback");
  }

  /**
   * Try to load the icon atlas, but prepare a fallback if it fails
   */
  loadIconsWithFallback() {
    // First try to load the actual atlas
    this.load.atlas('icons', 'assets/images/icons.png', 'assets/images/icons.json');
    
    // If it fails, we'll create a placeholder texture in the create method
    this.load.on('filecomplete-atlas-icons', () => {
      console.log('Icons atlas loaded successfully');
      this.iconsLoaded = true;
    });
    
    // Add CSS-based fallback after a short delay if icons don't load
    setTimeout(() => {
      if (!this.iconsLoaded) {
        this.loadIconsCSS();
      }
    }, 1000);
  }

  /**
   * Creates placeholder textures for missing assets
   */
  createPlaceholderTextures() {
    // Create a placeholder texture for missing images
    const graphics = this.make.graphics();
    graphics.fillStyle(0x333333);
    graphics.fillRect(0, 0, 64, 64);
    graphics.lineStyle(2, 0xffffff);
    graphics.strokeRect(1, 1, 62, 62);
    graphics.fillStyle(0xff0000);
    graphics.fillText('?', 24, 24);
    graphics.generateTexture('placeholder', 64, 64);
  }

  /**
   * Load an asset with a fallback in case it fails
   * @param {string} type - Asset type ('image', 'atlas', etc)
   * @param {string} key - Asset key
   * @param {string} path - Asset path
   * @param {Function} fallbackFn - Function to call to create a fallback
   */
  loadWithFallback(type, key, path, fallbackFn) {
    try {
      // Try to load the asset
      this.load[type](key, path);
      
      // Setup error handling for this specific asset
      this.load.on(`filecomplete-${type}-${key}`, () => {
        console.log(`Loaded ${key} successfully`);
      });
      
      this.load.on(`loaderror`, (fileObj) => {
        if (fileObj.key === key) {
          console.warn(`Failed to load ${key}, using fallback`);
          fallbackFn();
        }
      });
    } catch (error) {
      console.warn(`Error setting up load for ${key}: ${error.message}`);
      fallbackFn();
    }
  }

  /**
   * Create a fallback background texture
   */
  createBackgroundTexture() {
    const graphics = this.make.graphics();
    graphics.fillGradientStyle(0x000000, 0x000000, 0x330033, 0x330033, 1);
    graphics.fillRect(0, 0, 800, 600);
    graphics.generateTexture('background', 800, 600);
  }

  /**
   * Create a fallback logo texture
   */
  createLogoTexture() {
    const graphics = this.make.graphics();
    graphics.fillStyle(0x6a0dad);
    graphics.fillRect(0, 0, 300, 100);
    graphics.fillStyle(0xffffff);
    graphics.fillText('VAMPIRE SURVIVAL', 60, 40, '24px Arial');
    graphics.generateTexture('logo', 300, 100);
  }

  /**
   * Create a fallback button texture
   */
  createButtonTexture() {
    const graphics = this.make.graphics();
    graphics.fillStyle(0x4b0082);
    graphics.fillRoundedRect(0, 0, 200, 50, 10);
    graphics.generateTexture('button', 200, 50);
  }

  /**
   * Create a fallback button hover texture
   */
  createButtonHoverTexture() {
    const graphics = this.make.graphics();
    graphics.fillStyle(0x8a2be2);
    graphics.fillRoundedRect(0, 0, 200, 50, 10);
    graphics.generateTexture('button-hover', 200, 50);
  }
  
  /**
   * Create a fallback icons texture
   */
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

  create() {
    // Create fallback for icons if they didn't load
    if (!this.iconsLoaded) {
      this.createFallbackIcons();
    }
    
    // Set up any initial configurations
    this.sound.pauseOnBlur = false;
    
    // Check if we're already connected to the server
    if (window.gameState.roomJoined) {
      this.scene.start('GameScene');
    } else {
      this.scene.start('LoadingScene');
    }
  }
}