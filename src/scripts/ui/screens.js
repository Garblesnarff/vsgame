/**
 * Screens Manager
 * Handles different game screens (game over, level up, etc.)
 */
export class ScreensManager {
    constructor(gameContainer) {
        this.gameContainer = gameContainer;
        
        // Get screen elements
        this.gameOverScreen = document.getElementById('game-over');
        this.levelUpScreen = document.getElementById('level-up');
        this.finalScoreElement = document.getElementById('final-score');
        
        // Create screens if they don't exist
        this.ensureScreensExist();
    }
    
    /**
     * Ensure all screen elements exist
     */
    ensureScreensExist() {
        if (!this.gameOverScreen) {
            this.gameOverScreen = document.createElement('div');
            this.gameOverScreen.id = 'game-over';
            this.gameOverScreen.className = 'game-over';
            this.gameOverScreen.innerHTML = `
                GAME OVER<br>
                <span id="final-score"></span><br>
                Press SPACE to restart
            `;
            this.gameContainer.appendChild(this.gameOverScreen);
            this.finalScoreElement = document.getElementById('final-score');
        }
        
        if (!this.levelUpScreen) {
            this.levelUpScreen = document.createElement('div');
            this.levelUpScreen.id = 'level-up';
            this.levelUpScreen.className = 'level-up';
            this.levelUpScreen.innerHTML = `
                LEVEL UP!<br>
                You gained a skill point!<br>
                Press 'S' to open Skills
            `;
            this.gameContainer.appendChild(this.levelUpScreen);
        }
    }
    
    /**
     * Show the game over screen
     * @param {number} kills - Number of kills
     * @param {string} time - Time played
     */
    showGameOver(kills, time) {
        this.finalScoreElement.textContent = `Kills: ${kills} | Time: ${time}`;
        this.gameOverScreen.style.display = 'block';
    }
    
    /**
     * Hide the game over screen
     */
    hideGameOver() {
        this.gameOverScreen.style.display = 'none';
    }
    
    /**
     * Show the level up screen
     * @param {number} duration - Duration to show the screen in ms (default: 3000)
     */
    showLevelUp(duration = 3000) {
        this.levelUpScreen.style.display = 'block';
        
        // Hide after duration
        setTimeout(() => {
            this.levelUpScreen.style.display = 'none';
        }, duration);
    }
    
    /**
     * Hide the level up screen
     */
    hideLevelUp() {
        this.levelUpScreen.style.display = 'none';
    }
    
    /**
     * Create a custom message screen
     * @param {string} message - Message to display
     * @param {string} className - CSS class for styling
     * @param {number} duration - Duration to show in ms (0 for permanent)
     * @returns {HTMLElement} - The created screen element
     */
    showMessage(message, className = 'message', duration = 3000) {
        const messageScreen = document.createElement('div');
        messageScreen.className = className;
        messageScreen.style.position = 'absolute';
        messageScreen.style.top = '50%';
        messageScreen.style.left = '50%';
        messageScreen.style.transform = 'translate(-50%, -50%)';
        messageScreen.style.fontSize = '36px';
        messageScreen.style.color = '#ffffff';
        messageScreen.style.textAlign = 'center';
        messageScreen.style.zIndex = '1000';
        messageScreen.innerHTML = message;
        
        this.gameContainer.appendChild(messageScreen);
        
        if (duration > 0) {
            setTimeout(() => {
                if (messageScreen.parentNode) {
                    messageScreen.parentNode.removeChild(messageScreen);
                }
            }, duration);
        }
        
        return messageScreen;
    }
    
    /**
     * Hide all screens
     */
    hideAll() {
        this.hideGameOver();
        this.hideLevelUp();
    }
}

export default ScreensManager;