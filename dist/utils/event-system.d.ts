/**
 * Type definitions for event listeners and handler maps
 */
type EventListener = (...args: any[]) => void;
/**
 * EventEmitter - A simple event system implementing the publisher-subscriber pattern
 * This allows components to communicate without direct references to each other.
 */
export declare class EventEmitter {
    private events;
    constructor();
    /**
     * Subscribe to an event
     * @param eventName - Name of the event to subscribe to
     * @param listener - Function to call when the event is emitted
     * @returns Unsubscribe function
     */
    on(eventName: string, listener: EventListener): () => void;
    /**
     * Subscribe to an event and remove after first trigger
     * @param eventName - Name of the event to subscribe to
     * @param listener - Function to call when the event is emitted
     * @returns Unsubscribe function
     */
    once(eventName: string, listener: EventListener): () => void;
    /**
     * Unsubscribe from an event
     * @param eventName - Name of the event to unsubscribe from
     * @param listenerToRemove - Function to remove from the event
     */
    off(eventName: string, listenerToRemove: EventListener): void;
    /**
     * Emit an event, calling all subscribed listeners
     * @param eventName - Name of the event to emit
     * @param args - Arguments to pass to the listeners
     */
    emit(eventName: string, ...args: any[]): void;
    /**
     * Get all listeners for an event
     * @param eventName - Name of the event
     * @returns Array of listeners
     */
    listeners(eventName: string): EventListener[];
    /**
     * Remove all listeners for an event
     * @param eventName - Name of the event (optional, if not provided all events are cleared)
     */
    removeAllListeners(eventName?: string): void;
}
/**
 * Game Events - Centralized event emitter for the game
 * This provides a singleton event system that can be imported anywhere
 */
export declare const GameEvents: EventEmitter;
/**
 * Event names - Constants for event names to avoid typos
 */
export declare const EVENTS: {
    GAME_INIT: string;
    GAME_START: string;
    GAME_OVER: string;
    GAME_PAUSE: string;
    GAME_RESUME: string;
    GAME_RESTART: string;
    PLAYER_DAMAGE: string;
    PLAYER_HEAL: string;
    PLAYER_DEATH: string;
    PLAYER_LEVEL_UP: string;
    PLAYER_SKILL_POINT: string;
    ENEMY_SPAWN: string;
    ENEMY_DAMAGE: string;
    ENEMY_DEATH: string;
    ABILITY_USE: string;
    ABILITY_UPGRADE: string;
    ABILITY_UNLOCK: string;
    UI_SKILL_MENU_OPEN: string;
    UI_SKILL_MENU_CLOSE: string;
    INPUT_KEY_DOWN: string;
    INPUT_KEY_UP: string;
    INPUT_CLICK: string;
};
export default GameEvents;
