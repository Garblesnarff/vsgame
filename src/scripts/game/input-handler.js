/**
 * Input Handler
 * Manages keyboard and mouse input
 */
export class InputHandler {
    constructor(game) {
        this.game = game;
        this.keys = {};
        
        // Bind event listeners
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
        window.addEventListener('click', this.handleClick.bind(this));
        
        // Track mouse position
        this.mouseX = 0;
        this.mouseY = 0;
        window.addEventListener('mousemove', this.handleMouseMove.bind(this));
    }
    
    /**
     * Handle keydown events
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyDown(e) {
        this.keys[e.key] = true;
        
        // Handle special key presses
        if (e.key === ' ' && !this.game.isRunning()) {
            // Space to restart when game over
            this.game.restart();
            return;
        }
        
        if ((e.key === 's' || e.key === 'S') && this.game.isRunning()) {
            // 'S' to toggle skill menu
            this.game.toggleSkillMenu();
            return;
        }
        
        if (e.key === 'Escape') {
            // Escape to close skill menu or pause game
            if (this.game.player.showingSkillMenu) {
                this.game.toggleSkillMenu();
            } else {
                this.game.togglePause();
            }
            return;
        }
        
        if (!this.game.isRunning() || !this.game.player.isAlive || this.game.player.showingSkillMenu) {
            return;
        }
        
        // Ability hotkeys
        this.handleAbilityHotkeys(e.key);
    }
    
    /**
     * Handle ability hotkeys
     * @param {string} key - Key pressed
     */
    handleAbilityHotkeys(key) {
        const abilityManager = this.game.player.abilityManager;
        
        switch (key) {
            case '1':
                abilityManager.getAbility('bloodDrain').use();
                break;
            case '2':
                abilityManager.getAbility('batSwarm').use();
                break;
            case '3':
                abilityManager.getAbility('shadowDash').use();
                break;
            case '4':
                const bloodLance = abilityManager.getAbility('bloodLance');
                if (bloodLance && bloodLance.unlocked) {
                    bloodLance.use();
                }
                break;
            case '5':
                const nightShield = abilityManager.getAbility('nightShield');
                if (nightShield && nightShield.unlocked) {
                    nightShield.use();
                }
                break;
        }
    }
    
    /**
     * Handle keyup events
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyUp(e) {
        this.keys[e.key] = false;
    }
    
    /**
     * Handle mouse click events
     * @param {MouseEvent} e - Mouse event
     */
    handleClick(e) {
        if (this.game.isRunning() && this.game.player.isAlive && !this.game.player.showingSkillMenu) {
            this.game.player.fireProjectile(e.clientX, e.clientY, this.game.createProjectile.bind(this.game));
        }
    }
    
    /**
     * Handle mouse movement events
     * @param {MouseEvent} e - Mouse event
     */
    handleMouseMove(e) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
    }
    
    /**
     * Check if a key is pressed
     * @param {string} key - Key to check
     * @returns {boolean} - Whether the key is pressed
     */
    isKeyDown(key) {
        return this.keys[key] === true;
    }
    
    /**
     * Get the current mouse position
     * @returns {Object} - Mouse coordinates
     */
    getMousePosition() {
        return { x: this.mouseX, y: this.mouseY };
    }
    
    /**
     * Get all currently pressed keys
     * @returns {Object} - Keys object
     */
    getKeys() {
        return this.keys;
    }
    
    /**
     * Reset input state
     */
    reset() {
        this.keys = {};
    }
}

export default InputHandler;