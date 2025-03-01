import { Particle } from '../entities/particle.js';

/**
 * Particle System
 * Manages all particle effects in the game
 */
export class ParticleSystem {
    constructor(gameContainer) {
        this.gameContainer = gameContainer;
        this.particles = [];
        this.bloodNovas = [];
        this.shadowTrails = [];
    }
    
    /**
     * Update all particles
     */
    update() {
        // Update regular particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            if (this.particles[i].update()) {
                this.particles.splice(i, 1);
            }
        }
        
        // Update blood novas
        for (let i = this.bloodNovas.length - 1; i >= 0; i--) {
            if (this.bloodNovas[i].update()) {
                this.bloodNovas.splice(i, 1);
            }
        }
        
        // Update shadow trails
        for (let i = this.shadowTrails.length - 1; i >= 0; i--) {
            if (this.shadowTrails[i].update()) {
                this.shadowTrails.splice(i, 1);
            }
        }
    }
    
    /**
     * Create blood particles at a position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} count - Number of particles to create
     * @returns {Array} - Array of created particles
     */
    createBloodParticles(x, y, count) {
        const newParticles = [];
        
        for (let i = 0; i < count; i++) {
            const particle = new Particle(this.gameContainer, {
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                life: 30 + Math.random() * 30,
                type: 'blood'
            });
            
            this.particles.push(particle);
            newParticles.push(particle);
        }
        
        return newParticles;
    }
    
    /**
     * Create a blood nova effect
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {Particle} - Created nova particle
     */
    createBloodNova(x, y) {
        const nova = new Particle(this.gameContainer, {
            x: x,
            y: y,
            radius: 20,
            opacity: 0.5,
            type: 'bloodNova'
        });
        
        this.bloodNovas.push(nova);
        return nova;
    }
    
    /**
     * Create shadow trail particles
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {Particle} - Created shadow particle
     */
    createShadowTrail(x, y) {
        const trail = new Particle(this.gameContainer, {
            x: x,
            y: y,
            opacity: 0.5,
            type: 'shadow'
        });
        
        this.shadowTrails.push(trail);
        return trail;
    }
    
    /**
     * Create shield particles
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} count - Number of particles to create
     */
    createShieldParticles(x, y, count) {
        for (let i = 0; i < count; i++) {
            const particle = new Particle(this.gameContainer, {
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3,
                life: 20 + Math.random() * 10,
                type: 'blood'
            });
            
            // Override default color for shield particles
            particle.element.style.backgroundColor = '#8a2be2';
            
            this.particles.push(particle);
        }
    }
    
    /**
     * Reset the particle system
     */
    reset() {
        // Clean up all particles
        for (const particle of this.particles) {
            particle.destroy();
        }
        this.particles = [];
        
        // Clean up all blood novas
        for (const nova of this.bloodNovas) {
            nova.destroy();
        }
        this.bloodNovas = [];
        
        // Clean up all shadow trails
        for (const trail of this.shadowTrails) {
            trail.destroy();
        }
        this.shadowTrails = [];
    }
}

export default ParticleSystem;