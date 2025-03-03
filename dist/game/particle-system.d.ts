import { Particle } from "../entities/particle";
/**
 * Particle System
 * Manages all particle effects in the game
 */
export declare class ParticleSystem {
    gameContainer: HTMLElement;
    particles: Particle[];
    bloodNovas: Particle[];
    shadowTrails: Particle[];
    /**
     * Create a new particle system
     * @param gameContainer - DOM element for the game container
     */
    constructor(gameContainer: HTMLElement);
    /**
     * Update all particles
     */
    update(): void;
    /**
     * Create blood particles at a position
     * @param x - X coordinate
     * @param y - Y coordinate
     * @param count - Number of particles to create
     * @returns Array of created particles
     */
    createBloodParticles(x: number, y: number, count: number): Particle[];
    /**
     * Create a blood nova effect
     * @param x - X coordinate
     * @param y - Y coordinate
     * @returns Created nova particle
     */
    createBloodNova(x: number, y: number): Particle;
    /**
     * Create shadow trail particles
     * @param x - X coordinate
     * @param y - Y coordinate
     * @returns Created shadow particle
     */
    createShadowTrail(x: number, y: number): Particle;
    /**
     * Create shield particles
     * @param x - X coordinate
     * @param y - Y coordinate
     * @param count - Number of particles to create
     */
    createShieldParticles(x: number, y: number, count: number): Particle[];
    /**
     * Reset the particle system
     */
    reset(): void;
}
export default ParticleSystem;
