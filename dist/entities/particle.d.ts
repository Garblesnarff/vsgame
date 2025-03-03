/**
 * Interface for particle creation options
 */
interface ParticleOptions {
    x: number;
    y: number;
    vx?: number;
    vy?: number;
    life?: number;
    type?: "blood" | "shadow" | "bloodNova";
    opacity?: number;
    radius?: number;
}
/**
 * Particle class for visual effects
 */
export declare class Particle {
    gameContainer: HTMLElement;
    element: HTMLElement;
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    type: string;
    opacity: number;
    radius?: number;
    /**
     * Create a new particle
     * @param gameContainer - DOM element containing the game
     * @param options - Particle options
     */
    constructor(gameContainer: HTMLElement, options: ParticleOptions);
    /**
     * Updates the particle position and properties
     * @returns Whether the particle has expired
     */
    update(): boolean;
    /**
     * Updates the DOM element position
     */
    updatePosition(): void;
    /**
     * Factory method to create blood particles
     * @param gameContainer - DOM element for the game container
     * @param x - X coordinate
     * @param y - Y coordinate
     * @param count - Number of particles to create
     * @returns Array of created particles
     */
    static createBloodParticles(gameContainer: HTMLElement, x: number, y: number, count: number): Particle[];
    /**
     * Factory method to create shadow trail particles
     * @param gameContainer - DOM element for the game container
     * @param x - X coordinate
     * @param y - Y coordinate
     * @returns Created shadow particle
     */
    static createShadowTrail(gameContainer: HTMLElement, x: number, y: number): Particle;
    /**
     * Factory method to create blood nova effect
     * @param gameContainer - DOM element for the game container
     * @param x - X coordinate
     * @param y - Y coordinate
     * @returns Created nova particle
     */
    static createBloodNova(gameContainer: HTMLElement, x: number, y: number): Particle;
    /**
     * Clean up particle resources
     */
    destroy(): void;
}
export default Particle;
