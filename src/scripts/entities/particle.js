/**
 * Particle class for visual effects
 */
export class Particle {
    constructor(gameContainer, options) {
        this.gameContainer = gameContainer;
        
        // Position and movement
        this.x = options.x || 0;
        this.y = options.y || 0;
        this.vx = options.vx || 0;
        this.vy = options.vy || 0;
        
        // Properties
        this.life = options.life || 30;
        this.type = options.type || 'blood';
        this.opacity = options.opacity || 1;
        
        // Create DOM element
        this.element = document.createElement('div');
        
        // Set class based on particle type
        switch (this.type) {
            case 'blood':
                this.element.className = 'blood-particle';
                break;
            case 'shadow':
                this.element.className = 'shadow-trail';
                this.opacity = options.opacity || 0.5;
                break;
            case 'bloodNova':
                this.element.className = 'blood-nova';
                this.radius = options.radius || 20;
                this.element.style.width = this.radius * 2 + 'px';
                this.element.style.height = this.radius * 2 + 'px';
                this.element.style.left = (this.x - this.radius) + 'px';
                this.element.style.top = (this.y - this.radius) + 'px';
                break;
            default:
                this.element.className = 'blood-particle';
        }
        
        // Apply opacity if specified
        if (this.opacity !== 1) {
            this.element.style.opacity = this.opacity;
        }
        
        // Position element
        this.updatePosition();
        
        // Add to game container
        this.gameContainer.appendChild(this.element);
    }
    
    /**
     * Updates the particle position and properties
     * @returns {boolean} - Whether the particle has expired
     */
    update() {
        // Move particle
        this.x += this.vx;
        this.y += this.vy;
        
        // Update position
        this.updatePosition();
        
        // Special handling for different particle types
        if (this.type === 'bloodNova') {
            // Expand nova
            this.radius += 5;
            this.opacity -= 0.05;
            
            // Update nova appearance
            this.element.style.width = this.radius * 2 + 'px';
            this.element.style.height = this.radius * 2 + 'px';
            this.element.style.left = (this.x - this.radius) + 'px';
            this.element.style.top = (this.y - this.radius) + 'px';
            this.element.style.opacity = this.opacity;
        } else if (this.type === 'shadow') {
            // Fade out shadow
            this.opacity -= 0.05;
            this.element.style.opacity = this.opacity;
        } else {
            // Reduce particle life
            this.life--;
        }
        
        // Check if particle should be removed
        if (this.life <= 0 || this.opacity <= 0) {
            this.destroy();
            return true;
        }
        
        return false;
    }
    
    /**
     * Updates the DOM element position
     */
    updatePosition() {
        if (this.type === 'bloodNova') {
            // For blood nova, position is handled in update method
            return;
        }
        
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
    }
    
    /**
     * Factory method to create blood particles
     * @param {Object} gameContainer - DOM element for the game container
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} count - Number of particles to create
     * @returns {Array} - Array of created particles
     */
    static createBloodParticles(gameContainer, x, y, count) {
        const particles = [];
        
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(gameContainer, {
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                life: 30 + Math.random() * 30,
                type: 'blood'
            }));
        }
        
        return particles;
    }
    
    /**
     * Factory method to create shadow trail particles
     * @param {Object} gameContainer - DOM element for the game container
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {Particle} - Created shadow particle
     */
    static createShadowTrail(gameContainer, x, y) {
        return new Particle(gameContainer, {
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            opacity: 0.5,
            type: 'shadow'
        });
    }
    
    /**
     * Factory method to create blood nova effect
     * @param {Object} gameContainer - DOM element for the game container
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {Particle} - Created nova particle
     */
    static createBloodNova(gameContainer, x, y) {
        return new Particle(gameContainer, {
            x: x,
            y: y,
            radius: 20,
            opacity: 0.5,
            type: 'bloodNova'
        });
    }
    
    /**
     * Clean up particle resources
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

export default Particle;