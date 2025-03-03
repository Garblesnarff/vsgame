/**
 * Game loop manager
 * Handles the main game update and render loop
 */
export class GameLoop {
    constructor() {
        this.lastTimestamp = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.pauseOverlay = null;
        this.updateCallback = null;
    }
    /**
     * Start the game loop
     * @param updateCallback - Function to call on each update
     */
    start(updateCallback) {
        this.gameRunning = true;
        this.gamePaused = false;
        this.updateCallback = updateCallback;
        this.lastTimestamp = 0;
        // Remove pause overlay if it exists
        this.resumeGame();
        // Start the animation frame loop
        requestAnimationFrame(this.update.bind(this));
    }
    /**
     * Stop the game loop
     */
    stop() {
        this.gameRunning = false;
    }
    /**
     * Pause the game
     * @param gameContainer - Game container element
     */
    pauseGame(gameContainer) {
        this.gamePaused = true;
        // Create pause overlay if it doesn't exist
        if (!this.pauseOverlay) {
            this.pauseOverlay = document.createElement("div");
            this.pauseOverlay.id = "pause-overlay";
            this.pauseOverlay.textContent = "GAME PAUSED";
            gameContainer.appendChild(this.pauseOverlay);
        }
        else {
            this.pauseOverlay.style.display = "block";
        }
    }
    /**
     * Resume the game
     */
    resumeGame() {
        this.gamePaused = false;
        // Hide pause overlay
        if (this.pauseOverlay) {
            this.pauseOverlay.style.display = "none";
        }
    }
    /**
     * Toggle pause state
     * @param gameContainer - Game container element
     */
    togglePause(gameContainer) {
        if (this.gamePaused) {
            this.resumeGame();
        }
        else {
            this.pauseGame(gameContainer);
        }
    }
    /**
     * Main update function called on each animation frame
     * @param timestamp - Current timestamp
     */
    update(timestamp) {
        if (!this.gameRunning) {
            return;
        }
        // Calculate delta time
        const deltaTime = timestamp - (this.lastTimestamp || timestamp);
        this.lastTimestamp = timestamp;
        // Skip updates if game is paused
        if (!this.gamePaused && this.updateCallback) {
            this.updateCallback(deltaTime);
        }
        // Request next frame
        requestAnimationFrame(this.update.bind(this));
    }
}
export default GameLoop;
//# sourceMappingURL=game-loop.js.map