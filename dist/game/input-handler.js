import { GameEvents, EVENTS } from "../utils/event-system";
/**
 * Input Handler
 * Manages keyboard and mouse input
 */
export class InputHandler {
    /**
     * Create a new input handler
     * @param game - Game instance
     */
    constructor(game) {
        this.game = game;
        this.keys = {};
        // Track mouse position
        this.mouseX = 0;
        this.mouseY = 0;
        // Bind event listeners
        window.addEventListener("keydown", this.handleKeyDown.bind(this));
        window.addEventListener("keyup", this.handleKeyUp.bind(this));
        window.addEventListener("click", this.handleClick.bind(this));
        window.addEventListener("mousemove", this.handleMouseMove.bind(this));
    }
    /**
     * Handle keydown events
     * @param e - Keyboard event
     */
    handleKeyDown(e) {
        this.keys[e.key] = true;
        // Emit input event
        GameEvents.emit(EVENTS.INPUT_KEY_DOWN, e.key);
        // Handle special key presses
        if (e.key === " " && !this.game.isRunning()) {
            // Space to restart when game over
            this.game.restart();
            return;
        }
        if ((e.key === "s" || e.key === "S") && this.game.isRunning()) {
            // 'S' to toggle skill menu
            this.game.toggleSkillMenu();
            return;
        }
        if (e.key === "Escape") {
            // Escape to close skill menu or pause game
            if (this.game.player.showingSkillMenu) {
                this.game.toggleSkillMenu();
            }
            else {
                this.game.togglePause();
            }
            return;
        }
        if (!this.game.isRunning() ||
            !this.game.player.isAlive ||
            this.game.player.showingSkillMenu) {
            return;
        }
        // Ability hotkeys
        this.handleAbilityHotkeys(e.key);
    }
    /**
     * Handle ability hotkeys
     * @param key - Key pressed
     */
    handleAbilityHotkeys(key) {
        const abilityManager = this.game.player.abilityManager;
        switch (key) {
            case "1":
                abilityManager.getAbility("bloodDrain")?.use();
                break;
            case "2":
                abilityManager.getAbility("batSwarm")?.use();
                break;
            case "3":
                abilityManager.getAbility("shadowDash")?.use();
                break;
            case "4":
                const bloodLance = abilityManager.getAbility("bloodLance");
                if (bloodLance && bloodLance.unlocked) {
                    bloodLance.use();
                }
                break;
            case "5":
                const nightShield = abilityManager.getAbility("nightShield");
                if (nightShield && nightShield.unlocked) {
                    nightShield.use();
                }
                break;
        }
    }
    /**
     * Handle keyup events
     * @param e - Keyboard event
     */
    handleKeyUp(e) {
        this.keys[e.key] = false;
        // Emit input event
        GameEvents.emit(EVENTS.INPUT_KEY_UP, e.key);
    }
    /**
     * Handle mouse click events
     * @param e - Mouse event
     */
    handleClick(e) {
        // Emit input event
        GameEvents.emit(EVENTS.INPUT_CLICK, { x: e.clientX, y: e.clientY });
        if (this.game.isRunning() &&
            this.game.player.isAlive &&
            !this.game.player.showingSkillMenu) {
            this.game.player.fireProjectile(e.clientX, e.clientY, this.game.createProjectile.bind(this.game));
        }
    }
    /**
     * Handle mouse movement events
     * @param e - Mouse event
     */
    handleMouseMove(e) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
    }
    /**
     * Check if a key is pressed
     * @param key - Key to check
     * @returns Whether the key is pressed
     */
    isKeyDown(key) {
        return this.keys[key] === true;
    }
    /**
     * Get the current mouse position
     * @returns Mouse coordinates
     */
    getMousePosition() {
        return { x: this.mouseX, y: this.mouseY };
    }
    /**
     * Get all currently pressed keys
     * @returns Keys object
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
//# sourceMappingURL=input-handler.js.map