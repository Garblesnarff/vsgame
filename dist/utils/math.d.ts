/**
 * Math utilities
 * Helper functions for mathematical calculations
 */
/**
 * Generate a random number between min and max (inclusive)
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Random number in range
 */
export declare function random(min: number, max: number): number;
/**
 * Generate a random integer between min and max (inclusive)
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Random integer in range
 */
export declare function randomInt(min: number, max: number): number;
/**
 * Clamp a value between min and max
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export declare function clamp(value: number, min: number, max: number): number;
/**
 * Linear interpolation between two values
 * @param a - Start value
 * @param b - End value
 * @param t - Interpolation factor (0-1)
 * @returns Interpolated value
 */
export declare function lerp(a: number, b: number, t: number): number;
/**
 * Calculate the angle between two points in radians
 * @param x1 - First point X coordinate
 * @param y1 - First point Y coordinate
 * @param x2 - Second point X coordinate
 * @param y2 - Second point Y coordinate
 * @returns Angle in radians
 */
export declare function angle(x1: number, y1: number, x2: number, y2: number): number;
/**
 * Calculate the distance between two points
 * @param x1 - First point X coordinate
 * @param y1 - First point Y coordinate
 * @param x2 - Second point X coordinate
 * @param y2 - Second point Y coordinate
 * @returns Distance
 */
export declare function distance(x1: number, y1: number, x2: number, y2: number): number;
/**
 * Calculate the square of the distance between two points (faster than distance)
 * @param x1 - First point X coordinate
 * @param y1 - First point Y coordinate
 * @param x2 - Second point X coordinate
 * @param y2 - Second point Y coordinate
 * @returns Squared distance
 */
export declare function distanceSquared(x1: number, y1: number, x2: number, y2: number): number;
/**
 * Calculate a point on a circle given center, radius and angle
 * @param centerX - Circle center X coordinate
 * @param centerY - Circle center Y coordinate
 * @param radius - Circle radius
 * @param angle - Angle in radians
 * @returns Point {x, y}
 */
export declare function pointOnCircle(centerX: number, centerY: number, radius: number, angle: number): {
    x: number;
    y: number;
};
/**
 * Normalize a 2D vector to unit length
 * @param x - Vector X component
 * @param y - Vector Y component
 * @returns Normalized vector {x, y}
 */
export declare function normalize(x: number, y: number): {
    x: number;
    y: number;
};
/**
 * Convert degrees to radians
 * @param degrees - Angle in degrees
 * @returns Angle in radians
 */
export declare function toRadians(degrees: number): number;
/**
 * Convert radians to degrees
 * @param radians - Angle in radians
 * @returns Angle in degrees
 */
export declare function toDegrees(radians: number): number;
/**
 * Scale a value from one range to another
 * @param value - Value to scale
 * @param fromMin - Source range minimum
 * @param fromMax - Source range maximum
 * @param toMin - Target range minimum
 * @param toMax - Target range maximum
 * @returns Scaled value
 */
export declare function scale(value: number, fromMin: number, fromMax: number, toMin: number, toMax: number): number;
export declare const Math2D: {
    random: typeof random;
    randomInt: typeof randomInt;
    clamp: typeof clamp;
    lerp: typeof lerp;
    angle: typeof angle;
    distance: typeof distance;
    distanceSquared: typeof distanceSquared;
    pointOnCircle: typeof pointOnCircle;
    normalize: typeof normalize;
    toRadians: typeof toRadians;
    toDegrees: typeof toDegrees;
    scale: typeof scale;
};
export default Math2D;
