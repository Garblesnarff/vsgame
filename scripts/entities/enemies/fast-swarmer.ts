import { Enemy } from './base-enemy';
import CONFIG from '../../config';

/**
 * FastSwarmer enemy class
 * A small, fast enemy that moves erratically and attacks in groups
 */
export class FastSwarmer extends Enemy {
  // Fast Swarmer specific properties
  private directionChangeInterval: number;
  private lastDirectionChange: number;
  private directionX: number;
  private directionY: number;
  private erraticMovement: boolean;
  private dodgeChance: number;
  private originalSpeed: number;
  private burstSpeed: number;
  private isBursting: boolean;
  private burstCooldown: number;
  private lastBurst: number;

  /**
   * Create a new Fast Swarmer enemy
   * @param gameContainer - DOM element containing the game
   * @param playerLevel - Current level of the player
   */
  constructor(gameContainer: HTMLElement, playerLevel: number) {
    // Call base enemy constructor
    super(gameContainer, playerLevel);
    
    // Add fast swarmer class for specific styling
    this.element.classList.add('fast-swarmer');
    
    // Override size and appearance
    const sizeMultiplier = CONFIG.ENEMY.FAST_SWARMER.SIZE_MULTIPLIER;
    this.width = CONFIG.ENEMY.FAST_SWARMER.WIDTH * sizeMultiplier;
    this.height = CONFIG.ENEMY.FAST_SWARMER.HEIGHT * sizeMultiplier;
    this.element.style.width = this.width + "px";
    this.element.style.height = this.height + "px";
    this.element.style.backgroundColor = "#00cc00"; // Green color
    this.element.style.borderRadius = "50%"; // Circular shape
    
    // Set unique stats for Fast Swarmer
    const healthMultiplier = CONFIG.ENEMY.FAST_SWARMER.HEALTH_MULTIPLIER;
    const damageMultiplier = CONFIG.ENEMY.FAST_SWARMER.DAMAGE_MULTIPLIER;
    const speedMultiplier = CONFIG.ENEMY.FAST_SWARMER.SPEED_MULTIPLIER;
    
    this.health = CONFIG.ENEMY.FAST_SWARMER.BASE_HEALTH * healthMultiplier + playerLevel * 3;
    this.maxHealth = this.health;
    this.damage = CONFIG.ENEMY.FAST_SWARMER.BASE_DAMAGE * damageMultiplier + playerLevel * 0.5;
    this.originalSpeed = speedMultiplier + Math.random() * playerLevel * 0.15;
    this.speed = this.originalSpeed;
    
    // Erratic movement properties
    this.directionChangeInterval = 500 + Math.random() * 1000; // Change direction every 0.5-1.5 seconds
    this.lastDirectionChange = 0;
    this.directionX = Math.random() * 2 - 1; // Random initial direction
    this.directionY = Math.random() * 2 - 1;
    const dirMagnitude = Math.sqrt(this.directionX * this.directionX + this.directionY * this.directionY);
    this.directionX /= dirMagnitude;
    this.directionY /= dirMagnitude;
    this.erraticMovement = true;
    
    // Dodge ability
    this.dodgeChance = CONFIG.ENEMY.FAST_SWARMER.DODGE_CHANCE + playerLevel * 0.01;
    
    // Burst speed properties
    this.burstSpeed = this.originalSpeed * CONFIG.ENEMY.FAST_SWARMER.BURST_SPEED_MULTIPLIER;
    this.isBursting = false;
    this.burstCooldown = 3000 + Math.random() * 2000; // Burst every 3-5 seconds
    this.lastBurst = -this.burstCooldown; // Allow bursting soon after spawn
    
    // Update health bar position due to smaller size
    if (this.healthBarContainer) {
      this.healthBarContainer.style.width = this.width + "px";
    }
  }
  
  /**
   * Override moveTowardsPlayer to implement the Fast Swarmer's unique behavior
   * @param player - Player object to track
   */
  moveTowardsPlayer(player: any): void {
    if (!player) return;
    
    const now = Date.now();
    
    // Calculate distance to player
    const dx = player.x + player.width / 2 - (this.x + this.width / 2);
    const dy = player.y + player.height / 2 - (this.y + this.height / 2);
    const distToPlayer = Math.sqrt(dx * dx + dy * dy);
    
    // Determine if it's time to change direction
    if (this.erraticMovement && now - this.lastDirectionChange > this.directionChangeInterval) {
      this.changeDirection(dx, dy, distToPlayer);
      this.lastDirectionChange = now;
    }
    
    // Handle burst speed mode
    if (!this.isBursting && now - this.lastBurst > this.burstCooldown) {
      // Start a burst
      this.startBurst();
      this.lastBurst = now;
    }
    
    // Check if burst should end
    if (this.isBursting && now - this.lastBurst > 500) {
      this.endBurst();
    }
    
    // Move based on current mode
    if (this.erraticMovement) {
      // Move in current direction but generally toward player
      const playerWeight = 0.6; // How much to favor moving toward player vs random direction
      const moveX = this.directionX * (1 - playerWeight) + (dx / distToPlayer) * playerWeight;
      const moveY = this.directionY * (1 - playerWeight) + (dy / distToPlayer) * playerWeight;
      
      // Normalize movement vector
      const moveMagnitude = Math.sqrt(moveX * moveX + moveY * moveY);
      this.x += (moveX / moveMagnitude) * this.speed;
      this.y += (moveY / moveMagnitude) * this.speed;
    } else {
      // Direct movement toward player during burst
      this.x += (dx / distToPlayer) * this.speed;
      this.y += (dy / distToPlayer) * this.speed;
    }
    
    // Update position
    this.updatePosition();
  }
  
  /**
   * Change movement direction
   * @param dx - X direction to player
   * @param dy - Y direction to player
   * @param distToPlayer - Distance to player
   */
  private changeDirection(dx: number, dy: number, _distToPlayer: number): void {
    // Sometimes change to direct player chase
    if (Math.random() < 0.3) {
      this.erraticMovement = false;
      return;
    }
    
    this.erraticMovement = true;
    
    // Calculate new random direction with some bias toward player
    const randomAngle = Math.random() * Math.PI * 2;
    const playerAngle = Math.atan2(dy, dx);
    
    // Blend between random angle and player angle
    const blendFactor = 0.7; // 0 = pure random, 1 = directly toward player
    const finalAngle = randomAngle * (1 - blendFactor) + playerAngle * blendFactor;
    
    this.directionX = Math.cos(finalAngle);
    this.directionY = Math.sin(finalAngle);
  }
  
  /**
   * Start a speed burst
   */
  private startBurst(): void {
    this.isBursting = true;
    this.speed = this.burstSpeed;
    this.erraticMovement = false;
    
    // Visual indication of burst
    this.element.classList.add('fast-swarmer-burst');
  }
  
  /**
   * End a speed burst
   */
  private endBurst(): void {
    this.isBursting = false;
    this.speed = this.originalSpeed;
    this.erraticMovement = true;
    
    // Remove visual indication
    this.element.classList.remove('fast-swarmer-burst');
  }
  
  /**
   * Check if this enemy should dodge a projectile
   * @returns Whether dodge was successful
   */
  tryDodgeProjectile(): boolean {
    return Math.random() < this.dodgeChance;
  }
  
  /**
   * Check if enemy collides with player with a smaller hitbox for dodging
   * @param player - Player object
   * @returns Whether collision occurred
   */
  collidesWithPlayer(player: any): boolean {
    // Use a slightly smaller hitbox for collision to represent swift movement
    const hitboxReduction = 0.2;
    const effectiveWidth = this.width * (1 - hitboxReduction);
    const effectiveHeight = this.height * (1 - hitboxReduction);
    
    return (
      this.x + (this.width - effectiveWidth) / 2 < player.x + player.width &&
      this.x + (this.width - effectiveWidth) / 2 + effectiveWidth > player.x &&
      this.y + (this.height - effectiveHeight) / 2 < player.y + player.height &&
      this.y + (this.height - effectiveHeight) / 2 + effectiveHeight > player.y
    );
  }
}

export default FastSwarmer;