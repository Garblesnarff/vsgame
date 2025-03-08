/**
 * Utility for creating CSS-based icons as a fallback
 * when sprite sheets are not available
 */

/**
 * Creates a CSS-based icon element
 * @param {string} iconType - The type of icon to create (e.g., 'health', 'energy')
 * @param {Object} options - Additional options
 * @param {number} options.width - Icon width (default: 32)
 * @param {number} options.height - Icon height (default: 32)
 * @returns {HTMLElement} The created icon element
 */
export function createCssIcon(iconType, options = {}) {
    const width = options.width || 32;
    const height = options.height || 32;
    
    const iconElement = document.createElement('div');
    iconElement.className = `css-icon css-icon-${iconType}`;
    iconElement.style.width = `${width}px`;
    iconElement.style.height = `${height}px`;
    
    return iconElement;
  }
  
  /**
   * Creates an image-based icon if the sprite is available,
   * or falls back to a CSS-based icon if not
   * @param {string} iconType - The type of icon to create
   * @param {Phaser.Scene} scene - The Phaser scene (for image creation)
   * @param {number} x - X position
   * @param {number} y - Y position
   * @returns {Phaser.GameObjects.Image|null} The created image or null if scene is invalid
   */
  export function createPhaserIcon(iconType, scene, x, y) {
    if (!scene || !scene.textures) {
      console.warn(`Invalid scene for icon creation: ${iconType}`);
      return null;
    }
    
    // Check if the icons texture exists
    if (scene.textures.exists('icons')) {
      try {
        // Try to create an image with the specified frame
        return scene.add.image(x, y, 'icons', iconType);
      } catch (error) {
        console.warn(`Error creating icon from sprite sheet: ${error.message}`);
        // Fall back to a placeholder
        return scene.add.rectangle(x, y, 32, 32, getIconColor(iconType));
      }
    } else {
      // Texture doesn't exist, create a colored rectangle instead
      return scene.add.rectangle(x, y, 32, 32, getIconColor(iconType));
    }
  }
  
  /**
   * Gets an appropriate color for an icon type
   * @param {string} iconType - The type of icon
   * @returns {number} The color value
   */
  function getIconColor(iconType) {
    const colors = {
      'health': 0xff0000,
      'energy': 0x00b3ff,
      'skull': 0x444444,
      'level': 0xffcc00,
      'corner': 0x6a0dad,
      'tree': 0x228b22,
      'rock': 0x808080,
      'gravestone': 0xa9a9a9,
      'shrub': 0x3cb371,
      'bloodDrain': 0x8b0000,
      'batSwarm': 0x4b0082,
      'shadowDash': 0x000000,
      'bloodLance': 0x8b0000,
      'nightShield': 0x4b0082,
      'poisonTouch': 0x4b8b3b,
      'bloodRitual': 0x8b0000,
      'dominate': 0x000099,
      'mesmerize': 0x990066
    };
    
    return colors[iconType] || 0xaaaaaa;
  }
  
  export default {
    createCssIcon,
    createPhaserIcon
  };