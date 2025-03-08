// client/src/scenes/BootScene.js
import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Preload essential assets needed before the loading screen
    this.load.image('background', 'assets/images/background.jpg');
    this.load.image('logo', 'assets/images/logo.png');
    
    // Preload UI elements
    this.load.image('button', 'assets/images/button.png');
    this.load.image('button-hover', 'assets/images/button-hover.png');
    
    // Preload sound effects
    this.load.audio('button-click', 'assets/sounds/button-click.mp3');
    this.load.audio('background-music', 'assets/sounds/background-music.mp3');
  }

  create() {
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