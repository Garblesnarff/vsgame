/**
 * Math utilities
 * Helper functions for mathematical calculations
 */

/**
 * Generate a random number between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Random number in range
 */
export function random(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Generate a random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Random integer in range
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Clamped value
 */
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation between two values
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} - Interpolated value
 */
export function lerp(a, b, t) {
    return a + (b - a) * clamp(t, 0, 1);
}

/**
 * Calculate the angle between two points in radians
 * @param {number} x1 - First point X coordinate
 * @param {number} y1 - First point Y coordinate
 * @param {number} x2 - Second point X coordinate
 * @param {number} y2 - Second point Y coordinate
 * @returns {number} - Angle in radians
 */
export function angle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

/**
 * Calculate the distance between two points
 * @param {number} x1 - First point X coordinate
 * @param {number} y1 - First point Y coordinate
 * @param {number} x2 - Second point X coordinate
 * @param {number} y2 - Second point Y coordinate
 * @returns {number} - Distance
 */
export function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate the square of the distance between two points (faster than distance)
 * @param {number} x1 - First point X coordinate
 * @param {number} y1 - First point Y coordinate
 * @param {number} x2 - Second point X coordinate
 * @param {number} y2 - Second point Y coordinate
 * @returns {number} - Squared distance
 */
export function distanceSquared(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return dx * dx + dy * dy;
}

/**
 * Calculate a point on a circle given center, radius and angle
 * @param {number} centerX - Circle center X coordinate
 * @param {number} centerY - Circle center Y coordinate
 * @param {number} radius - Circle radius
 * @param {number} angle - Angle in radians
 * @returns {Object} - Point {x, y}
 */
export function pointOnCircle(centerX, centerY, radius, angle) {
    return {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
    };
}

/**
 * Normalize a 2D vector to unit length
 * @param {number} x - Vector X component
 * @param {number} y - Vector Y component
 * @returns {Object} - Normalized vector {x, y}
 */
export function normalize(x, y) {
    const length = Math.sqrt(x * x + y * y);
    
    if (length === 0) {
        return { x: 0, y: 0 };
    }
    
    return {
        x: x / length,
        y: y / length
    };
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} - Angle in radians
 */
export function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 * @param {number} radians - Angle in radians
 * @returns {number} - Angle in degrees
 */
export function toDegrees(radians) {
    return radians * (180 / Math.PI);
}

/**
 * Scale a value from one range to another
 * @param {number} value - Value to scale
 * @param {number} fromMin - Source range minimum
 * @param {number} fromMax - Source range maximum
 * @param {number} toMin - Target range minimum
 * @param {number} toMax - Target range maximum
 * @returns {number} - Scaled value
 */
export function scale(value, fromMin, fromMax, toMin, toMax) {
    return ((value - fromMin) / (fromMax - fromMin)) * (toMax - toMin) + toMin;
}

export default {
    random,
    randomInt,
    clamp,
    lerp,
    angle,
    distance,
    distanceSquared,
    pointOnCircle,
    normalize,
    toRadians,
    toDegrees,
    scale
};