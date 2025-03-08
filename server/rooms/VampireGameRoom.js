// server/rooms/VampireGameRoom.js
const { Room } = require('colyseus');
const { VampireGameState } = require('../states/VampireGameState');

class VampireGameRoom extends Room {
  onCreate(options) {
    this.setState(new VampireGameState());
    
    // Set maximum clients to 10 players per room
    this.maxClients = options.maxClients || 10;
    
    // Set map size based on number of expected players
    this.state.mapWidth = 2000 + (this.maxClients * 500);
    this.state.mapHeight = 2000 + (this.maxClients * 500);
    
    // Configure world properties
    this.state.dayNightCycle = true;
    this.state.currentTime = 'night'; // Start at night when vampires are stronger
    this.state.dayNightDuration = 300; // 5 minutes per cycle
    
    // Setup physics update interval (20 times per second)
    this.setSimulationInterval((deltaTime) => this.update(deltaTime), 50);
    
    // Setup day/night cycle timer
    this.setClock();
    
    // Handle game-specific messages
    this.setupMessageHandlers();
    
    console.log("VampireGameRoom created!", options);
  }

  setClock() {
    // Day/night cycle
    this.clock.setInterval(() => {
      // Toggle between day and night
      this.state.currentTime = this.state.currentTime === 'day' ? 'night' : 'day';
      
      // Broadcast time change to all clients
      this.broadcast("timeChange", { time: this.state.currentTime });
      
      // Apply day/night effects
      if (this.state.currentTime === 'day') {
        // Vampires are weaker during the day
        Object.values(this.state.players).forEach(player => {
          player.damageMultiplier = 0.7;
          player.speedMultiplier = 0.8;
        });
      } else {
        // Vampires are stronger during the night
        Object.values(this.state.players).forEach(player => {
          player.damageMultiplier = 1.2;
          player.speedMultiplier = 1.1;
        });
      }
    }, this.state.dayNightDuration * 1000);
  }

  setupMessageHandlers() {
    // Handle player movement
    this.onMessage("move", (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.x = data.x;
        player.y = data.y;
      }
    });

    // Handle ability usage
    this.onMessage("useAbility", (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        // Process ability usage on server-side
        this.handleAbilityUse(player, data.abilityId, data.targetX, data.targetY);
        
        // Broadcast ability usage to all clients for visual effects
        this.broadcast("abilityUsed", {
          playerId: client.sessionId,
          abilityId: data.abilityId,
          targetX: data.targetX,
          targetY: data.targetY
        });
      }
    });

    // Handle territory claiming
    this.onMessage("claimTerritory", (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        const territory = this.state.territories.find(t => 
          t.x === data.territoryX && t.y === data.territoryY);
        
        if (territory && !territory.owner) {
          territory.owner = client.sessionId;
          territory.clanId = player.clanId;
          
          // Apply territory bonuses to the player
          player.territoryCount++;
          player.healingMultiplier += 0.1;
          
          // Broadcast territory claim to all clients
          this.broadcast("territoryClaimed", {
            territoryId: territory.id,
            playerId: client.sessionId,
            clanId: player.clanId
          });
        }
      }
    });

    // Handle blood pact formation
    this.onMessage("formBloodPact", (client, data) => {
      const player = this.state.players.get(client.sessionId);
      const target = this.state.players.get(data.targetPlayerId);
      
      if (player && target) {
        // Create a unique pact ID
        const pactId = `pact_${client.sessionId}_${data.targetPlayerId}`;
        
        // Create the blood pact
        this.state.bloodPacts.set(pactId, {
          id: pactId,
          members: [client.sessionId, data.targetPlayerId],
          bonuses: {
            cooldownReduction: 0.15,
            damageBoost: 0.1
          }
        });
        
        // Apply blood pact effects to both players
        player.bloodPacts.push(pactId);
        target.bloodPacts.push(pactId);
        
        // Notify both players
        this.broadcast("bloodPactFormed", {
          pactId: pactId,
          player1: client.sessionId,
          player2: data.targetPlayerId
        }, { except: [client.sessionId, data.targetPlayerId] });
      }
    });
  }

  handleAbilityUse(player, abilityId, targetX, targetY) {
    // Apply cooldowns
    const ability = player.abilities.find(a => a.id === abilityId);
    if (ability && ability.cooldownRemaining <= 0) {
      ability.cooldownRemaining = ability.cooldown;
      
      // Process ability effects based on type
      switch(abilityId) {
        case 'bloodDrain':
          this.handleBloodDrainAbility(player, targetX, targetY);
          break;
        case 'batSwarm':
          this.handleBatSwarmAbility(player, targetX, targetY);
          break;
        case 'shadowDash':
          this.handleShadowDashAbility(player, targetX, targetY);
          break;
        case 'bloodLance':
          this.handleBloodLanceAbility(player, targetX, targetY);
          break;
        case 'nightShield':
          this.handleNightShieldAbility(player);
          break;
      }
    }
  }

  handleBloodDrainAbility(player, targetX, targetY) {
    // Find enemies within range
    const range = 150 * player.abilityRangeMultiplier;
    const enemies = this.state.enemies.filter(enemy => {
      const dx = enemy.x - player.x;
      const dy = enemy.y - player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= range;
    });
    
    // Apply damage to enemies and heal player
    let totalHealing = 0;
    enemies.forEach(enemy => {
      const damage = 10 * player.damageMultiplier;
      enemy.health -= damage;
      totalHealing += damage * 0.5;
      
      // Check if enemy died
      if (enemy.health <= 0) {
        this.state.enemies.delete(enemy.id);
        player.kills++;
        
        // Add blood pool at enemy location
        this.state.bloodPools.push({
          id: `blood_${Date.now()}_${enemy.id}`,
          x: enemy.x,
          y: enemy.y,
          radius: 20,
          lifeTime: 30000 // 30 seconds
        });
      }
    });
    
    // Heal the player
    player.health = Math.min(player.maxHealth, player.health + totalHealing);
  }

  // Additional ability handlers would be implemented here

  update(deltaTime) {
    // Update cooldowns
    this.updateCooldowns(deltaTime);
    
    // Update enemy positions and behaviors
    this.updateEnemies(deltaTime);
    
    // Update projectiles
    this.updateProjectiles(deltaTime);
    
    // Update territories and blood pools
    this.updateTerritoriesAndBloodPools(deltaTime);
    
    // Check for player collisions with enemies
    this.checkPlayerEnemyCollisions();
    
    // Spawn new enemies
    this.spawnEnemies();
    
    // Check win/lose conditions
    this.checkGameConditions();
  }

  updateCooldowns(deltaTime) {
    Object.values(this.state.players).forEach(player => {
      player.abilities.forEach(ability => {
        if (ability.cooldownRemaining > 0) {
          ability.cooldownRemaining = Math.max(0, ability.cooldownRemaining - deltaTime);
        }
      });
    });
  }

  updateEnemies(deltaTime) {
    // Basic AI behavior
    this.state.enemies.forEach(enemy => {
      // Find closest player
      let closestPlayer = null;
      let closestDistance = Infinity;
      
      Object.values(this.state.players).forEach(player => {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestPlayer = player;
        }
      });
      
      // Move towards closest player
      if (closestPlayer) {
        const dx = closestPlayer.x - enemy.x;
        const dy = closestPlayer.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 10) {
          const speed = enemy.speed * (deltaTime / 1000);
          enemy.x += (dx / distance) * speed;
          enemy.y += (dy / distance) * speed;
        }
      }
    });
  }

  updateProjectiles(deltaTime) {
    // Move projectiles and check collisions
    this.state.projectiles.forEach(projectile => {
      // Update position
      projectile.x += projectile.velocityX * (deltaTime / 1000);
      projectile.y += projectile.velocityY * (deltaTime / 1000);
      
      // Check lifetime
      projectile.lifeTime -= deltaTime;
      if (projectile.lifeTime <= 0) {
        this.state.projectiles.delete(projectile.id);
        return;
      }
      
      // Check enemy collisions
      this.state.enemies.forEach(enemy => {
        const dx = projectile.x - enemy.x;
        const dy = projectile.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < enemy.radius + projectile.radius) {
          enemy.health -= projectile.damage;
          
          // Check if enemy died
          if (enemy.health <= 0) {
            this.state.enemies.delete(enemy.id);
            
            const player = this.state.players.get(projectile.playerId);
            if (player) {
              player.kills++;
            }
          }
          
          // Remove projectile unless it has pierce remaining
          if (projectile.pierceCount <= 0) {
            this.state.projectiles.delete(projectile.id);
          } else {
            projectile.pierceCount--;
          }
        }
      });
    });
  }

  updateTerritoriesAndBloodPools(deltaTime) {
    // Update blood pool lifetimes
    this.state.bloodPools.forEach(pool => {
      pool.lifeTime -= deltaTime;
      if (pool.lifeTime <= 0) {
        const index = this.state.bloodPools.indexOf(pool);
        if (index !== -1) {
          this.state.bloodPools.splice(index, 1);
        }
      }
    });
    
    // Territory effects
    this.state.territories.forEach(territory => {
      if (territory.owner) {
        // Spawn allied minions periodically
        territory.minionTimer -= deltaTime;
        if (territory.minionTimer <= 0) {
          territory.minionTimer = territory.minionSpawnRate;
          
          // Create a new minion
          const minionId = `minion_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
          this.state.minions.set(minionId, {
            id: minionId,
            x: territory.x + (Math.random() * 100 - 50),
            y: territory.y + (Math.random() * 100 - 50),
            health: 50,
            damage: 10,
            speed: 80,
            ownerId: territory.owner,
            clanId: territory.clanId,
            radius: 15
          });
        }
      }
    });
  }

  checkPlayerEnemyCollisions() {
    Object.values(this.state.players).forEach(player => {
      this.state.enemies.forEach(enemy => {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Check if player collides with enemy
        if (distance < player.radius + enemy.radius) {
          // Apply damage to player
          if (!player.invulnerable) {
            player.health -= enemy.damage;
            player.lastDamagedTime = Date.now();
            
            // Check if player died
            if (player.health <= 0) {
              player.health = 0;
              player.dead = true;
              
              // Broadcast player death
              this.broadcast("playerDied", { playerId: player.id });
            }
          }
        }
      });
    });
  }

  spawnEnemies() {
    // Spawn enemies based on player count and game progression
    const shouldSpawn = Math.random() < 0.05; // 5% chance per update
    if (shouldSpawn) {
      const playerCount = Object.keys(this.state.players).length;
      const spawnCount = Math.max(1, Math.floor(playerCount * 0.5));
      
      for (let i = 0; i < spawnCount; i++) {
        // Pick a random player to spawn near
        const playerIds = Object.keys(this.state.players);
        const randomPlayerId = playerIds[Math.floor(Math.random() * playerIds.length)];
        const player = this.state.players.get(randomPlayerId);
        
        if (player) {
          // Spawn enemy at a random position away from the player
          const angle = Math.random() * Math.PI * 2;
          const distance = 500 + Math.random() * 300; // 500-800 units away
          const enemyX = player.x + Math.cos(angle) * distance;
          const enemyY = player.y + Math.sin(angle) * distance;
          
          // Create the enemy
          const enemyId = `enemy_${Date.now()}_${i}`;
          this.state.enemies.set(enemyId, {
            id: enemyId,
            x: enemyX,
            y: enemyY,
            type: this.getRandomEnemyType(),
            health: 100,
            damage: 15,
            speed: 100,
            radius: 20
          });
        }
      }
    }
  }
  
  getRandomEnemyType() {
    const types = ['basic', 'hunter', 'swarm', 'brute'];
    return types[Math.floor(Math.random() * types.length)];
  }

  checkGameConditions() {
    // Check if all players are dead (game over)
    const allPlayersDead = Object.values(this.state.players).every(player => player.dead);
    if (allPlayersDead && Object.keys(this.state.players).length > 0) {
      this.broadcast("gameOver", { result: "defeat" });
    }
  }

  onJoin(client, options) {
    console.log(`Player ${client.sessionId} joined!`);
    
    // Create a new player
    this.state.players.set(client.sessionId, {
      id: client.sessionId,
      username: options.username || `Player ${client.sessionId.substr(0, 4)}`,
      x: Math.random() * this.state.mapWidth,
      y: Math.random() * this.state.mapHeight,
      health: 100,
      maxHealth: 100,
      energy: 100,
      maxEnergy: 100,
      speed: 5,
      level: 1,
      experience: 0,
      clan: options.clan || 'Nosferatu', // Default clan
      kills: 0,
      dead: false,
      invulnerable: false,
      damageMultiplier: 1.0,
      speedMultiplier: 1.0,
      abilityRangeMultiplier: 1.0,
      cooldownReductionMultiplier: 1.0,
      healingMultiplier: 1.0,
      territoryCount: 0,
      radius: 20,
      bloodPacts: [],
      abilities: [
        {
          id: 'bloodDrain',
          level: 1,
          cooldown: 8000,
          cooldownRemaining: 0,
          energyCost: 30,
          damage: 50,
          range: 150,
          duration: 5000
        },
        {
          id: 'batSwarm',
          level: 1,
          cooldown: 8000,
          cooldownRemaining: 0,
          energyCost: 40,
          count: 24,
          damage: 20,
          speed: 6
        },
        {
          id: 'shadowDash',
          level: 1,
          cooldown: 5000,
          cooldownRemaining: 0,
          energyCost: 25,
          distance: 200,
          damage: 30,
          invulnerabilityTime: 500
        }
      ]
    });
    
    // Apply clan-specific initialization
    this.initializePlayerClan(client.sessionId, options.clan);
    
    // Send initial game state to the client
    this.send(client, "gameInit", {
      mapWidth: this.state.mapWidth,
      mapHeight: this.state.mapHeight,
      currentTime: this.state.currentTime,
      playerId: client.sessionId
    });
  }
  
  initializePlayerClan(playerId, clan) {
    const player = this.state.players.get(playerId);
    if (!player) return;
    
    switch (clan) {
      case 'Nosferatu':
        // Stealth and poison, more durable
        player.maxHealth = 120;
        player.health = 120;
        player.abilities.push({
          id: 'poisonTouch',
          level: 1,
          cooldown: 10000,
          cooldownRemaining: 0,
          energyCost: 35,
          damage: 5, // DoT damage per second
          duration: 8000, // DoT lasts 8 seconds
          range: 100
        });
        break;
        
      case 'Tremere':
        // Blood magic specialists
        player.maxEnergy = 130;
        player.energy = 130;
        player.abilities.push({
          id: 'bloodRitual',
          level: 1,
          cooldown: 15000,
          cooldownRemaining: 0,
          energyCost: 50,
          damage: 80,
          radius: 200
        });
        break;
        
      case 'Ventrue':
        // Command abilities
        player.abilityRangeMultiplier = 1.2;
        player.abilities.push({
          id: 'dominate',
          level: 1,
          cooldown: 20000,
          cooldownRemaining: 0,
          energyCost: 60,
          duration: 10000,
          range: 150
        });
        break;
        
      case 'Toreador':
        // Speed and charm
        player.speedMultiplier = 1.3;
        player.abilities.push({
          id: 'mesmerize',
          level: 1,
          cooldown: 12000,
          cooldownRemaining: 0,
          energyCost: 40,
          duration: 5000,
          radius: 180
        });
        break;
    }
  }

  onLeave(client, consented) {
    console.log(`Player ${client.sessionId} left!`);
    
    // Remove the player from the game
    this.state.players.delete(client.sessionId);
    
    // Handle any cleanup related to this player
    this.cleanupPlayerData(client.sessionId);
  }
  
  cleanupPlayerData(playerId) {
    // Remove blood pacts involving this player
    const pactsToRemove = [];
    
    this.state.bloodPacts.forEach((pact, pactId) => {
      if (pact.members.includes(playerId)) {
        pactsToRemove.push(pactId);
        
        // Remove pact reference from other member
        const otherMemberId = pact.members.find(id => id !== playerId);
        if (otherMemberId) {
          const otherPlayer = this.state.players.get(otherMemberId);
          if (otherPlayer) {
            const pactIndex = otherPlayer.bloodPacts.indexOf(pactId);
            if (pactIndex !== -1) {
              otherPlayer.bloodPacts.splice(pactIndex, 1);
            }
          }
        }
      }
    });
    
    // Delete the pacts
    pactsToRemove.forEach(pactId => {
      this.state.bloodPacts.delete(pactId);
    });
    
    // Transfer owned territories to random players or make them neutral
    this.state.territories.forEach(territory => {
      if (territory.owner === playerId) {
        const remainingPlayers = Object.keys(this.state.players);
        if (remainingPlayers.length > 0) {
          // Transfer to random player
          const randomPlayerId = remainingPlayers[Math.floor(Math.random() * remainingPlayers.length)];
          const newOwner = this.state.players.get(randomPlayerId);
          
          territory.owner = randomPlayerId;
          territory.clanId = newOwner.clan;
          
          // Notify about territory transfer
          this.broadcast("territoryTransferred", {
            territoryId: territory.id,
            oldOwnerId: playerId,
            newOwnerId: randomPlayerId
          });
        } else {
          // Make territory neutral
          territory.owner = null;
          territory.clanId = null;
        }
      }
    });
  }

  onDispose() {
    console.log("VampireGameRoom disposed!");
  }
}

module.exports = { VampireGameRoom };