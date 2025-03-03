/**
 * Rectangle interface for collision detection
 */
interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}
/**
 * Circle interface for collision detection
 */
interface Circle {
    x: number;
    y: number;
    radius: number;
}
/**
 * Collision utilities
 * Provides functions for collision detection between game entities
 */
/**
 * Check if two rectangles overlap
 * @param rect1 - First rectangle {x, y, width, height}
 * @param rect2 - Second rectangle {x, y, width, height}
 * @returns Whether the rectangles collide
 */
export declare function rectangleCollision(rect1: Rectangle, rect2: Rectangle): boolean;
/**
 * Check if a point is inside a rectangle
 * @param pointX - Point X coordinate
 * @param pointY - Point Y coordinate
 * @param rect - Rectangle {x, y, width, height}
 * @returns Whether the point is inside the rectangle
 */
export declare function pointInRectangle(pointX: number, pointY: number, rect: Rectangle): boolean;
/**
 * Check if a point is inside a circle
 * @param pointX - Point X coordinate
 * @param pointY - Point Y coordinate
 * @param circleX - Circle center X coordinate
 * @param circleY - Circle center Y coordinate
 * @param radius - Circle radius
 * @returns Whether the point is inside the circle
 */
export declare function pointInCircle(pointX: number, pointY: number, circleX: number, circleY: number, radius: number): boolean;
/**
 * Check if a circle and rectangle overlap
 * @param circle - Circle {x, y, radius}
 * @param rect - Rectangle {x, y, width, height}
 * @returns Whether the circle and rectangle collide
 */
export declare function circleRectangleCollision(circle: Circle, rect: Rectangle): boolean;
/**
 * Calculate distance between two points
 * @param x1 - First point X coordinate
 * @param y1 - First point Y coordinate
 * @param x2 - Second point X coordinate
 * @param y2 - Second point Y coordinate
 * @returns Distance between the points
 */
export declare function distance(x1: number, y1: number, x2: number, y2: number): number;
/**
 * Check if a point is close to a line segment
 * @param pointX - Point X coordinate
 * @param pointY - Point Y coordinate
 * @param lineX1 - Line start X coordinate
 * @param lineY1 - Line start Y coordinate
 * @param lineX2 - Line end X coordinate
 * @param lineY2 - Line end Y coordinate
 * @param tolerance - Distance tolerance
 * @returns Whether the point is close to the line
 */
export declare function pointNearLine(pointX: number, pointY: number, lineX1: number, lineY1: number, lineX2: number, lineY2: number, tolerance: number): boolean;
declare const _default: {
    rectangleCollision: typeof rectangleCollision;
    pointInRectangle: typeof pointInRectangle;
    pointInCircle: typeof pointInCircle;
    circleRectangleCollision: typeof circleRectangleCollision;
    distance: typeof distance;
    pointNearLine: typeof pointNearLine;
};
export default _default;
