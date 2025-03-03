/**
 * DOM utilities
 * Helper functions for DOM manipulation
 */
/**
 * Attributes object for createElement function
 */
interface ElementAttributes {
    [key: string]: string | number | Record<string, string | number> | null | undefined;
}
/**
 * Progress bar options
 */
interface ProgressBarOptions {
    width?: number;
    height?: number;
    backgroundColor?: string;
    fillColor?: string;
    containerClass?: string;
    fillClass?: string;
}
/**
 * Progress bar components
 */
interface ProgressBar {
    container: HTMLElement;
    fill: HTMLElement;
    setValue: (value: number) => void;
}
/**
 * Tooltip options
 */
interface TooltipOptions {
    className?: string;
    backgroundColor?: string;
    textColor?: string;
}
/**
 * Position element options
 */
interface PositionOptions {
    offsetX?: number;
    offsetY?: number;
    centerX?: boolean;
    centerY?: boolean;
}
/**
 * Create an element with attributes and content
 * @param tag - Tag name
 * @param attributes - Element attributes
 * @param content - Element content
 * @returns Created element
 */
export declare function createElement(tag: string, attributes?: ElementAttributes, content?: string | HTMLElement | Array<string | HTMLElement> | null): HTMLElement;
/**
 * Remove all children from an element
 * @param element - Element to clear
 */
export declare function clearElement(element: HTMLElement): void;
/**
 * Set element styles
 * @param element - Element to style
 * @param styles - Styles to apply
 */
export declare function setStyles(element: HTMLElement, styles: Record<string, string | number>): void;
/**
 * Create a progress bar element
 * @param value - Initial value (0-100)
 * @param options - Options (width, height, backgroundColor, fillColor)
 * @returns Progress bar components {container, fill, setValue}
 */
export declare function createProgressBar(value?: number, options?: ProgressBarOptions): ProgressBar;
/**
 * Create a tooltip element
 * @param text - Tooltip text
 * @param options - Options (className, backgroundColor, textColor)
 * @returns Tooltip element
 */
export declare function createTooltip(text: string, options?: TooltipOptions): HTMLElement;
/**
 * Position an element at specific coordinates
 * @param element - Element to position
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param options - Options (offsetX, offsetY, centerX, centerY)
 */
export declare function positionElement(element: HTMLElement, x: number, y: number, options?: PositionOptions): void;
declare const _default: {
    createElement: typeof createElement;
    clearElement: typeof clearElement;
    setStyles: typeof setStyles;
    createProgressBar: typeof createProgressBar;
    createTooltip: typeof createTooltip;
    positionElement: typeof positionElement;
};
export default _default;
