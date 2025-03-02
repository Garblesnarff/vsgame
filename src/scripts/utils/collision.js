/**
 * Collision utilities
 * Provides functions for collision detection between game entities
 */

/**
 * Check if two rectangles overlap
 * @param {Object} rect1 - First rectangle {x, y, width, height}
 * @param {Object} rect2 - Second rectangle {x, y, width, height}
 * @returns {boolean} - Whether the rectangles collide
 */
export function rectangleCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

/**
 * Check if a point is inside a rectangle
 * @param {number} pointX - Point X coordinate
 * @param {number} pointY - Point Y coordinate
 * @param {Object} rect - Rectangle {x, y, width, height}
 * @returns {boolean} - Whether the point is inside the rectangle
 */
export function pointInRectangle(pointX, pointY, rect) {
    return (
        pointX >= rect.x &&
        pointX <= rect.x + rect.width &&
        pointY >= rect.y &&
        pointY <= rect.y + rect.height
    );
}

/**
 * Check if a point is inside a circle
 * @param {number} pointX - Point X coordinate
 * @param {number} pointY - Point Y coordinate
 * @param {number} circleX - Circle center X coordinate
 * @param {number} circleY - Circle center Y coordinate
 * @param {number} radius - Circle radius
 * @returns {boolean} - Whether the point is inside the circle
 */
export function pointInCircle(pointX, pointY, circleX, circleY, radius) {
    const dx = pointX - circleX;
    const dy = pointY - circleY;
    return (dx * dx + dy * dy) <= (radius * radius);
}

/**
 * Check if a circle and rectangle overlap
 * @param {Object} circle - Circle {x, y, radius}
 * @param {Object} rect - Rectangle {x, y, width, height}
 * @returns {boolean} - Whether the circle and rectangle collide
 */
export function circleRectangleCollision(circle, rect) {
    // Find closest point on rectangle to circle center
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
    
    // Calculate distance between closest point and circle center
    const dx = closestX - circle.x;
    const dy = closestY - circle.y;
    
    // Check if distance is less than circle's radius
    return (dx * dx + dy * dy) <= (circle.radius * circle.radius);
}

/**
 * Calculate distance between two points
 * @param {number} x1 - First point X coordinate
 * @param {number} y1 - First point Y coordinate
 * @param {number} x2 - Second point X coordinate
 * @param {number} y2 - Second point Y coordinate
 * @returns {number} - Distance between the points
 */
export function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if a point is close to a line segment
 * @param {number} pointX - Point X coordinate
 * @param {number} pointY - Point Y coordinate
 * @param {number} lineX1 - Line start X coordinate
 * @param {number} lineY1 - Line start Y coordinate
 * @param {number} lineX2 - Line end X coordinate
 * @param {number} lineY2 - Line end Y coordinate
 * @param {number} tolerance - Distance tolerance
 * @returns {boolean} - Whether the point is close to the line
 */
export function pointNearLine(pointX, pointY, lineX1, lineY1, lineX2, lineY2, tolerance) {
    // Calculate length of line segment squared
    const lengthSquared = (lineX2 - lineX1) * (lineX2 - lineX1) + (lineY2 - lineY1) * (lineY2 - lineY1);
    
    // If line segment is a point, check distance to that point
    if (lengthSquared === 0) {
        return distance(pointX, pointY, lineX1, lineY1) <= tolerance;
    }
    
    // Calculate projection of point onto line
    const t = Math.max(0, Math.min(1, ((pointX - lineX1) * (lineX2 - lineX1) + (pointY - lineY1) * (lineY2 - lineY1)) / lengthSquared));
    
    const projX = lineX1 + t * (lineX2 - lineX1);
    const projY = lineY1 + t * (lineY2 - lineY1);
    
    // Check distance from point to projection
    return distance(pointX, pointY, projX, projY) <= tolerance;
}

export default {
    rectangleCollision,
    pointInRectangle,
    pointInCircle,
    circleRectangleCollision,
    distance,
    pointNearLine
};