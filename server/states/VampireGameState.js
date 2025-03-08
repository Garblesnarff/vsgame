// server/states/VampireGameState.js
const { Schema, type, MapSchema, ArraySchema } = require('@colyseus/schema');

// Ability schema (must be defined before PlayerSchema since it's used inside it)
class AbilitySchema extends Schema {}

type("string")(AbilitySchema.prototype, "id");
type("number")(AbilitySchema.prototype, "level");
type("number")(AbilitySchema.prototype, "cooldown");
type("number")(AbilitySchema.prototype, "cooldownRemaining");
type("number")(AbilitySchema.prototype, "energyCost");
type("number")(AbilitySchema.prototype, "damage");
type("number")(AbilitySchema.prototype, "range");
type("number")(AbilitySchema.prototype, "duration");
type("number")(AbilitySchema.prototype, "count");
type("number")(AbilitySchema.prototype, "speed");
type("number")(AbilitySchema.prototype, "distance");
type("number")(AbilitySchema.prototype, "invulnerabilityTime");
type("number")(AbilitySchema.prototype, "radius");

// Player schema
class PlayerSchema extends Schema {
  constructor() {
    super();
    // Initialize abilities array
    this.abilities = new ArraySchema();
    this.bloodPacts = new ArraySchema();
  }
}

type("string")(PlayerSchema.prototype, "id");
type("string")(PlayerSchema.prototype, "username");
type("number")(PlayerSchema.prototype, "x");
type("number")(PlayerSchema.prototype, "y");
type("number")(PlayerSchema.prototype, "health");
type("number")(PlayerSchema.prototype, "maxHealth");
type("number")(PlayerSchema.prototype, "energy");
type("number")(PlayerSchema.prototype, "maxEnergy");
type("number")(PlayerSchema.prototype, "speed");
type("number")(PlayerSchema.prototype, "level");
type("number")(PlayerSchema.prototype, "experience");
type("string")(PlayerSchema.prototype, "clan");
type("number")(PlayerSchema.prototype, "kills");
type("boolean")(PlayerSchema.prototype, "dead");
type("boolean")(PlayerSchema.prototype, "invulnerable");
type("number")(PlayerSchema.prototype, "damageMultiplier");
type("number")(PlayerSchema.prototype, "speedMultiplier");
type("number")(PlayerSchema.prototype, "abilityRangeMultiplier");
type("number")(PlayerSchema.prototype, "cooldownReductionMultiplier");
type("number")(PlayerSchema.prototype, "healingMultiplier");
type("number")(PlayerSchema.prototype, "territoryCount");
type("number")(PlayerSchema.prototype, "radius");
type("number")(PlayerSchema.prototype, "lastDamagedTime");
type(["string"])(PlayerSchema.prototype, "bloodPacts");
type([AbilitySchema])(PlayerSchema.prototype, "abilities");

// Enemy schema
class EnemySchema extends Schema {}

type("string")(EnemySchema.prototype, "id");
type("number")(EnemySchema.prototype, "x");
type("number")(EnemySchema.prototype, "y");
type("string")(EnemySchema.prototype, "type");
type("number")(EnemySchema.prototype, "health");
type("number")(EnemySchema.prototype, "damage");
type("number")(EnemySchema.prototype, "speed");
type("number")(EnemySchema.prototype, "radius");

// Projectile schema
class ProjectileSchema extends Schema {}

type("string")(ProjectileSchema.prototype, "id");
type("string")(ProjectileSchema.prototype, "playerId");
type("string")(ProjectileSchema.prototype, "type");
type("number")(ProjectileSchema.prototype, "x");
type("number")(ProjectileSchema.prototype, "y");
type("number")(ProjectileSchema.prototype, "velocityX");
type("number")(ProjectileSchema.prototype, "velocityY");
type("number")(ProjectileSchema.prototype, "damage");
type("number")(ProjectileSchema.prototype, "pierceCount");
type("number")(ProjectileSchema.prototype, "lifeTime");
type("number")(ProjectileSchema.prototype, "radius");

// Territory schema
class TerritorySchema extends Schema {}

type("string")(TerritorySchema.prototype, "id");
type("number")(TerritorySchema.prototype, "x");
type("number")(TerritorySchema.prototype, "y");
type("string")(TerritorySchema.prototype, "owner");
type("string")(TerritorySchema.prototype, "clanId");
type("number")(TerritorySchema.prototype, "minionTimer");
type("number")(TerritorySchema.prototype, "minionSpawnRate");
type("number")(TerritorySchema.prototype, "radius");

// Blood Pool schema
class BloodPoolSchema extends Schema {}

type("string")(BloodPoolSchema.prototype, "id");
type("number")(BloodPoolSchema.prototype, "x");
type("number")(BloodPoolSchema.prototype, "y");
type("number")(BloodPoolSchema.prototype, "radius");
type("number")(BloodPoolSchema.prototype, "lifeTime");

// Minion schema
class MinionSchema extends Schema {}

type("string")(MinionSchema.prototype, "id");
type("number")(MinionSchema.prototype, "x");
type("number")(MinionSchema.prototype, "y");
type("number")(MinionSchema.prototype, "health");
type("number")(MinionSchema.prototype, "damage");
type("number")(MinionSchema.prototype, "speed");
type("string")(MinionSchema.prototype, "ownerId");
type("string")(MinionSchema.prototype, "clanId");
type("number")(MinionSchema.prototype, "radius");

// Blood Pact schema
class BloodPactSchema extends Schema {
  constructor() {
    super();
    this.members = new ArraySchema();
    this.bonuses = new BonusesSchema();
  }
}

type("string")(BloodPactSchema.prototype, "id");
type(["string"])(BloodPactSchema.prototype, "members");
type(BonusesSchema)(BloodPactSchema.prototype, "bonuses");

// Bonuses schema for Blood Pacts
class BonusesSchema extends Schema {}

type("number")(BonusesSchema.prototype, "cooldownReduction");
type("number")(BonusesSchema.prototype, "damageBoost");

// Main game state
class VampireGameState extends Schema {
  constructor() {
    super();
    this.players = new MapSchema();
    this.enemies = new MapSchema();
    this.projectiles = new MapSchema();
    this.territories = new ArraySchema();
    this.bloodPools = new ArraySchema();
    this.minions = new MapSchema();
    this.bloodPacts = new MapSchema();
    
    // Initialize territories on the map
    this.initializeTerritories();
  }
  
  initializeTerritories() {
    // Create territories distributed across the map
    // This is just a placeholder - the actual distribution will depend on map size
    const territoryCount = 9; // 3x3 grid
    const baseSize = 2000; // Default map size
    
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const territoryId = `territory_${i}_${j}`;
        const territory = new TerritorySchema();
        
        territory.id = territoryId;
        territory.x = (i + 0.5) * (baseSize / 3);
        territory.y = (j + 0.5) * (baseSize / 3);
        territory.owner = null;
        territory.clanId = null;
        territory.minionTimer = 15000; // 15 seconds between minion spawns
        territory.minionSpawnRate = 15000;
        territory.radius = 200;
        
        this.territories.push(territory);
      }
    }
  }
}

type("number")(VampireGameState.prototype, "mapWidth");
type("number")(VampireGameState.prototype, "mapHeight");
type("boolean")(VampireGameState.prototype, "dayNightCycle");
type("string")(VampireGameState.prototype, "currentTime");
type("number")(VampireGameState.prototype, "dayNightDuration");
type("number")(VampireGameState.prototype, "gameTime");
type({ map: PlayerSchema })(VampireGameState.prototype, "players");
type({ map: EnemySchema })(VampireGameState.prototype, "enemies");
type({ map: ProjectileSchema })(VampireGameState.prototype, "projectiles");
type([TerritorySchema])(VampireGameState.prototype, "territories");
type([BloodPoolSchema])(VampireGameState.prototype, "bloodPools");
type({ map: MinionSchema })(VampireGameState.prototype, "minions");
type({ map: BloodPactSchema })(VampireGameState.prototype, "bloodPacts");

module.exports = { VampireGameState };