/**
 * DOM utilities
 * Helper functions for DOM manipulation
 */

/**
 * Create an element with attributes and content
 * @param {string} tag - Tag name
 * @param {Object} attributes - Element attributes
 * @param {string|HTMLElement|Array} content - Element content
 * @returns {HTMLElement} - Created element
 */
export function createElement(tag, attributes = {}, content = null) {
    const element = document.createElement(tag);
    
    // Set attributes
    for (const [key, value] of Object.entries(attributes)) {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'style' && typeof value === 'object') {
            for (const [prop, val] of Object.entries(value)) {
                element.style[prop] = val;
            }
        } else {
            element.setAttribute(key, value);
        }
    }
    
    // Add content
    if (content !== null) {
        if (Array.isArray(content)) {
            content.forEach(item => {
                if (typeof item === 'string') {
                    element.appendChild(document.createTextNode(item));
                } else if (item instanceof HTMLElement) {
                    element.appendChild(item);
                }
            });
        } else if (typeof content === 'string') {
            element.textContent = content;
        } else if (content instanceof HTMLElement) {
            element.appendChild(content);
        }
    }
    
    return element;
}

/**
 * Remove all children from an element
 * @param {HTMLElement} element - Element to clear
 */
export function clearElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

/**
 * Set element styles
 * @param {HTMLElement} element - Element to style
 * @param {Object} styles - Styles to apply
 */
export function setStyles(element, styles) {
    for (const [prop, value] of Object.entries(styles)) {
        element.style[prop] = value;
    }
}

/**
 * Create a progress bar element
 * @param {number} value - Initial value (0-100)
 * @param {Object} options - Options (width, height, backgroundColor, fillColor)
 * @returns {Object} - Progress bar components {container, fill, setValue}
 */
export function createProgressBar(value = 100, options = {}) {
    const width = options.width || 100;
    const height = options.height || 10;
    const backgroundColor = options.backgroundColor || '#333';
    const fillColor = options.fillColor || '#4b0082';
    
    // Create container
    const container = createElement('div', {
        className: options.containerClass || 'progress-bar-container',
        style: {
            width: `${width}px`,
            height: `${height}px`,
            backgroundColor,
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '3px'
        }
    });
    
    // Create fill element
    const fill = createElement('div', {
        className: options.fillClass || 'progress-bar-fill',
        style: {
            width: `${value}%`,
            height: '100%',
            backgroundColor: fillColor,
            position: 'absolute',
            left: 0,
            top: 0,
            transition: 'width 0.3s ease'
        }
    });
    
    container.appendChild(fill);
    
    // Return components and setValue function
    return {
        container,
        fill,
        setValue: (newValue) => {
            fill.style.width = `${newValue}%`;
        }
    };
}

/**
 * Create a tooltip element
 * @param {string} text - Tooltip text
 * @param {Object} options - Options (className, backgroundColor, textColor)
 * @returns {HTMLElement} - Tooltip element
 */
export function createTooltip(text, options = {}) {
    return createElement('div', {
        className: options.className || 'tooltip',
        style: {
            position: 'absolute',
            backgroundColor: options.backgroundColor || 'rgba(0, 0, 0, 0.8)',
            color: options.textColor || 'white',
            padding: '5px 10px',
            borderRadius: '3px',
            fontSize: '12px',
            pointerEvents: 'none',
            zIndex: '1000',
            opacity: '0',
            transition: 'opacity 0.3s ease'
        }
    }, text);
}

/**
 * Position an element at specific coordinates
 * @param {HTMLElement} element - Element to position
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {Object} options - Options (offsetX, offsetY, centerX, centerY)
 */
export function positionElement(element, x, y, options = {}) {
    const offsetX = options.offsetX || 0;
    const offsetY = options.offsetY || 0;
    
    if (options.centerX) {
        x = x - (element.offsetWidth / 2);
    }
    
    if (options.centerY) {
        y = y - (element.offsetHeight / 2);
    }
    
    element.style.left = (x + offsetX) + 'px';
    element.style.top = (y + offsetY) + 'px';
}

export default {
    createElement,
    clearElement,
    setStyles,
    createProgressBar,
    createTooltip,
    positionElement
};