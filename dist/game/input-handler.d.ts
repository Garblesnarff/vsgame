import { Game } from "./game";
/**
 * Input Handler
 * Manages keyboard and mouse input
 */
export declare class InputHandler {
    game: Game;
    keys: Record<string, boolean>;
    mouseX: number;
    mouseY: number;
    /**
     * Create a new input handler
     * @param game - Game instance
     */
    constructor(game: Game);
    /**
     * Handle keydown events
     * @param e - Keyboard event
     */
    handleKeyDown(e: KeyboardEvent): void;
    /**
     * Handle ability hotkeys
     * @param key - Key pressed
     */
    handleAbilityHotkeys(key: string): void;
    /**
     * Handle keyup events
     * @param e - Keyboard event
     */
    handleKeyUp(e: KeyboardEvent): void;
    /**
     * Handle mouse click events
     * @param e - Mouse event
     */
    handleClick(e: MouseEvent): void;
    /**
     * Handle mouse movement events
     * @param e - Mouse event
     */
    handleMouseMove(e: MouseEvent): void;
    /**
     * Check if a key is pressed
     * @param key - Key to check
     * @returns Whether the key is pressed
     */
    isKeyDown(key: string): boolean;
    /**
     * Get the current mouse position
     * @returns Mouse coordinates
     */
    getMousePosition(): {
        x: number;
        y: number;
    };
    /**
     * Get all currently pressed keys
     * @returns Keys object
     */
    getKeys(): Record<string, boolean>;
    /**
     * Reset input state
     */
    reset(): void;
}
export default InputHandler;
