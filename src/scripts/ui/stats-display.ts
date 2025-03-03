import { Player } from '../entities/player.js';

/**
 * Stats Display
 * Manages the display of player statistics (health, energy, level, kills, etc.)
 */
export class StatsDisplay {
    gameContainer: HTMLElement;
    player: Player;
    healthBar: HTMLElement | null;
    energyBar: HTMLElement | null;
    timeElement: HTMLElement | null;
    levelElement: HTMLElement | null;
    killsElement: HTMLElement | null;
    skillPointsCount: HTMLElement | null;
    
    /**
     * Create a new stats display
     * @param gameContainer - DOM element containing the game
     * @param player - Player object whose stats to display
     */
    constructor(gameContainer: HTMLElement, player: Player) {
        this.gameContainer = gameContainer;
        this.player = player;
        
        // Get DOM elements
        this.healthBar = document.getElementById('health-bar');
        this.energyBar = document.getElementById('energy-bar');
        this.timeElement = document.getElementById('time');
        this.levelElement = document.getElementById('level');
        this.killsElement = document.getElementById('kills');
        this.skillPointsCount = document.getElementById('skill-points-count');
        
        // Create elements if they don't exist
        this.ensureElementsExist();
    }
    
    /**
     * Ensure all required UI elements exist
     */
    ensureElementsExist(): void {
        // Check for stats container
        if (!document.getElementById('stats')) {
            const statsContainer = document.createElement('div');
            statsContainer.id = 'stats';
            
            statsContainer.innerHTML = `
                <div class="bar-container">
                    <div id="health-bar"></div>
                </div>
                <div class="bar-container">
                    <div id="energy-bar"></div>
                </div>
                <div>Time: <span id="time">0:00</span></div>
                <div>Level: <span id="level">1</span></div>
                <div>Kills: <span id="kills">0 / 10</span></div>
            `;
            
            this.gameContainer.appendChild(statsContainer);
            
            // Update references
            this.healthBar = document.getElementById('health-bar');
            this.energyBar = document.getElementById('energy-bar');
            this.timeElement = document.getElementById('time');
            this.levelElement = document.getElementById('level');
            this.killsElement = document.getElementById('kills');
        }
        
        // Check for skill points display
        if (!document.getElementById('skill-points')) {
            const skillPointsElement = document.createElement('div');
            skillPointsElement.id = 'skill-points';
            skillPointsElement.className = 'skill-points';
            skillPointsElement.innerHTML = `Skill Points: <span id="skill-points-count">0</span>`;
            
            this.gameContainer.appendChild(skillPointsElement);
            this.skillPointsCount = document.getElementById('skill-points-count');
        }
    }
    
    /**
     * Update the display with current player stats
     * @param gameTime - Current game time in ms
     */
    update(gameTime: number): void {
        // Skip if elements aren't available
        if (!this.healthBar || !this.energyBar) return;
        
        // Update health and energy bars
        this.healthBar.style.width = (this.player.health / this.player.maxHealth * 100) + '%';
        this.energyBar.style.width = (this.player.energy / this.player.maxEnergy * 100) + '%';
        
        // Update time display
        if (this.timeElement) {
            this.timeElement.textContent = this.formatTime(gameTime);
        }
        
        // Update level and kills
        if (this.levelElement) {
            this.levelElement.textContent = this.player.level.toString();
        }
        
        if (this.killsElement) {
            this.killsElement.textContent = this.player.kills + ' / ' + this.player.killsToNextLevel;
        }
        
        // Update skill points display
        if (this.skillPointsCount) {
            this.skillPointsCount.textContent = this.player.skillPoints.toString();
        }
    }
    
    /**
     * Format time in mm:ss format
     * @param ms - Time in milliseconds
     * @returns Formatted time string
     */
    formatTime(ms: number): string {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
    }
    
    /**
     * Reset the stats display
     */
    reset(): void {
        // Reset to initial values
        if (this.healthBar) {
            this.healthBar.style.width = '100%';
        }
        
        if (this.energyBar) {
            this.energyBar.style.width = '100%';
        }
        
        if (this.timeElement) {
            this.timeElement.textContent = '0:00';
        }
        
        if (this.levelElement) {
            this.levelElement.textContent = '1';
        }
        
        if (this.killsElement) {
            this.killsElement.textContent = '0 / 10';
        }
        
        if (this.skillPointsCount) {
            this.skillPointsCount.textContent = '0';
        }
    }
}

export default StatsDisplay;