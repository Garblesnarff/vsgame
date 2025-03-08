// client/src/main.js
import Phaser from 'phaser';
import * as Colyseus from 'colyseus.js';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';
import { UIScene } from './scenes/UIScene';
import { LoadingScene } from './scenes/LoadingScene';

// Game configuration
const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 1280,
  height: 720,
  pixelArt: false,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [BootScene, LoadingScene, GameScene, UIScene]
};

// Create the game instance
const game = new Phaser.Game(config);

// Store global game state
window.gameState = {
  connected: false,
  roomJoined: false,
  client: null,
  room: null,
  playerId: null,
  playerData: null,
  username: '',
  clan: 'Nosferatu',
  abilities: []
};

// Initialize UI elements - This function runs when the page loads
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM loaded, setting up UI elements");
  
  // Get references to the UI elements
  const joinButton = document.getElementById('join-button');
  const usernameInput = document.getElementById('username');
  const clanSelect = document.getElementById('clan');
  const clanInfo = document.getElementById('clan-info');
  const loginScreen = document.getElementById('login-screen');
  const loadingScreen = document.getElementById('loading-screen');
  
  console.log("Join button element:", joinButton);
  
  // Change clan info based on selection
  if (clanSelect) {
    clanSelect.addEventListener('change', function() {
      console.log("Clan selected:", clanSelect.value);
      const selectedClan = clanSelect.value;
      let clanDescription = '';
      
      switch(selectedClan) {
        case 'Nosferatu':
          clanDescription = '<strong>Nosferatu:</strong> Stealth and poison abilities, higher durability.';
          break;
        case 'Tremere':
          clanDescription = '<strong>Tremere:</strong> Blood magic specialization with AoE attacks.';
          break;
        case 'Ventrue':
          clanDescription = '<strong>Ventrue:</strong> Command abilities to temporarily control enemies.';
          break;
        case 'Toreador':
          clanDescription = '<strong>Toreador:</strong> Speed and charm abilities to distract enemies.';
          break;
      }
      
      if (clanInfo) {
        clanInfo.innerHTML = clanDescription;
      }
    });
  }
  
  // Join button click handler
  if (joinButton) {
    console.log("Setting up join button click handler");
    
    joinButton.addEventListener("click", async function() {
      console.log("Join button clicked!");
      alert("Join button clicked! Attempting to connect...");
      
      const username = usernameInput ? usernameInput.value.trim() : '';
      const clan = clanSelect ? clanSelect.value : 'Nosferatu';
      
      if (!username) {
        alert('Please enter a username');
        return;
      }
      
      console.log("Username:", username, "Clan:", clan);
      
      // Store username and clan
      window.gameState.username = username;
      window.gameState.clan = clan;
      
      // Show loading screen
      if (loginScreen) loginScreen.style.display = 'none';
      if (loadingScreen) loadingScreen.style.display = 'flex';
      
      // Connect to Colyseus server
      try {
        console.log("Attempting to connect to server...");
        await connectToServer();
      } catch (error) {
        console.error("Could not connect to server:", error);
        alert('Failed to connect to server. Please try again.');
        
        // Show login screen again
        if (loginScreen) loginScreen.style.display = 'flex';
        if (loadingScreen) loadingScreen.style.display = 'none';
      }
    });
  } else {
    console.error("Join button not found on the page!");
    alert("Error: Join button not found on the page!");
  }
});

/**
 * Connect to the Colyseus server and join a room
 */
async function connectToServer() {
  try {
    console.log("Creating Colyseus client...");
    // Create Colyseus client
    const client = new Colyseus.Client('ws://localhost:2567');
    window.gameState.client = client;
    window.gameState.connected = true;
    
    console.log("Joining room...");
    // Join a vampire_game room
    const room = await client.joinOrCreate('vampire_game', {
      username: window.gameState.username,
      clan: window.gameState.clan
    });
    
    console.log("Room joined successfully!");
    window.gameState.room = room;
    window.gameState.roomJoined = true;
    
    // Listen for state changes
    setupRoomListeners(room);
    
    // Start the game
    game.scene.start('GameScene');
    
    // Hide loading screen
    document.getElementById('loading-screen').style.display = 'none';
    
    return room;
  } catch (error) {
    console.error("Error connecting to server:", error);
    alert("Connection error: " + error.message);
    throw error;
  }
}

/**
 * Setup room event listeners
 * @param {Room} room - The Colyseus room
 */
function setupRoomListeners(room) {
  // When we join, the server sends our player ID
  room.onMessage("gameInit", (data) => {
    window.gameState.playerId = room.sessionId;
    console.log("Player ID:", window.gameState.playerId);
    console.log("Game initialized with data:", data);
    
    // Store map dimensions
    window.gameState.mapWidth = data.mapWidth;
    window.gameState.mapHeight = data.mapHeight;
    window.gameState.currentTime = data.currentTime;
  });
  
  // Listen for player attribute changes
  room.state.players.onAdd = (player, sessionId) => {
    console.log("Player added:", sessionId, player);
    
    // If this is our player, store player data
    if (sessionId === room.sessionId) {
      window.gameState.playerData = player;
      
      // Extract abilities
      window.gameState.abilities = [];
      player.abilities.forEach(ability => {
        window.gameState.abilities.push({
          id: ability.id,
          level: ability.level,
          cooldown: ability.cooldown,
          energyCost: ability.energyCost
        });
      });
    }
    
    // Listen for attribute changes
    player.onChange = (changes) => {
      // If this is our player, update the UI
      if (sessionId === room.sessionId) {
        // Handle specific changes we're interested in
        changes.forEach(change => {
          if (change.field === 'health') {
            // Update health UI
            const event = new CustomEvent('playerHealthChanged', {
              detail: { health: change.value, maxHealth: player.maxHealth }
            });
            document.dispatchEvent(event);
          }
          else if (change.field === 'energy') {
            // Update energy UI
            const event = new CustomEvent('playerEnergyChanged', {
              detail: { energy: change.value, maxEnergy: player.maxEnergy }
            });
            document.dispatchEvent(event);
          }
          else if (change.field === 'level') {
            // Update level UI
            const event = new CustomEvent('playerLevelChanged', {
              detail: { level: change.value }
            });
            document.dispatchEvent(event);
          }
          else if (change.field === 'kills') {
            // Update kills UI
            const event = new CustomEvent('playerKillsChanged', {
              detail: { kills: change.value }
            });
            document.dispatchEvent(event);
          }
        });
      }
    };
  };
  
  room.state.players.onRemove = (player, sessionId) => {
    console.log("Player removed:", sessionId);
  };
  
  // Listen for enemy changes
  room.state.enemies.onAdd = (enemy, enemyId) => {
    console.log("Enemy added:", enemyId, enemy);
  };
  
  room.state.enemies.onRemove = (enemy, enemyId) => {
    console.log("Enemy removed:", enemyId);
  };
  
  // Listen for territory events
  room.onMessage("territoryClaimed", (data) => {
    console.log("Territory claimed:", data);
  });
  
  // Listen for blood pact events
  room.onMessage("bloodPactFormed", (data) => {
    console.log("Blood pact formed:", data);
  });
  
  // Listen for time change
  room.onMessage("timeChange", (data) => {
    console.log("Time changed to:", data.time);
    window.gameState.currentTime = data.time;
    
    // Dispatch event for UI to update
    const event = new CustomEvent('timeChanged', {
      detail: { time: data.time }
    });
    document.dispatchEvent(event);
  });
  
  // Listen for ability used
  room.onMessage("abilityUsed", (data) => {
    console.log("Ability used:", data);
    
    // Dispatch event for game scene to show visual effects
    const event = new CustomEvent('abilityUsed', {
      detail: data
    });
    document.dispatchEvent(event);
  });
  
  // Listen for player died
  room.onMessage("playerDied", (data) => {
    console.log("Player died:", data);
    
    // If it's our player, show game over screen
    if (data.playerId === room.sessionId) {
      const event = new CustomEvent('playerDied');
      document.dispatchEvent(event);
    }
  });
  
  // Listen for game over
  room.onMessage("gameOver", (data) => {
    console.log("Game over:", data);
    
    // Show game over screen
    const event = new CustomEvent('gameOver', {
      detail: data
    });
    document.dispatchEvent(event);
  });
}

// Export game instance
export default game;