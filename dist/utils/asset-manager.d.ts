/**
 * AssetManager - Handles loading and caching of game assets
 */
export declare class AssetManager {
    images: Map<string, HTMLImageElement>;
    sounds: Map<string, HTMLAudioElement>;
    fonts: Map<string, FontFace>;
    data: Map<string, any>;
    totalAssets: number;
    loadedAssets: number;
    isLoading: boolean;
    private imagesToLoad;
    private soundsToLoad;
    private fontsToLoad;
    private dataToLoad;
    constructor();
    /**
     * Queue an image to be loaded
     * @param key - Unique identifier for the image
     * @param path - File path to the image
     * @returns This asset manager for chaining
     */
    queueImage(key: string, path: string): AssetManager;
    /**
     * Queue a sound to be loaded
     * @param key - Unique identifier for the sound
     * @param path - File path to the sound
     * @returns This asset manager for chaining
     */
    queueSound(key: string, path: string): AssetManager;
    /**
     * Queue a font to be loaded
     * @param fontFamily - Font family name
     * @param url - URL to the font file
     * @returns This asset manager for chaining
     */
    queueFont(fontFamily: string, url: string): AssetManager;
    /**
     * Queue JSON data to be loaded
     * @param key - Unique identifier for the data
     * @param path - File path to the JSON data
     * @returns This asset manager for chaining
     */
    queueData(key: string, path: string): AssetManager;
    /**
     * Load all queued assets
     * @returns Promise that resolves when all assets are loaded
     */
    loadAll(): Promise<{
        images: Map<string, HTMLImageElement>;
        sounds: Map<string, HTMLAudioElement>;
        fonts: Map<string, FontFace>;
        data: Map<string, any>;
    }>;
    /**
     * Load all queued images
     * @returns Array of promises for image loading
     * @private
     */
    private loadImages;
    /**
     * Load all queued sounds
     * @returns Array of promises for sound loading
     * @private
     */
    private loadSounds;
    /**
     * Load all queued fonts
     * @returns Array of promises for font loading
     * @private
     */
    private loadFonts;
    /**
     * Load all queued data files
     * @returns Array of promises for data loading
     * @private
     */
    private loadData;
    /**
     * Emit a progress event
     * @private
     */
    private emitProgress;
    /**
     * Get a loaded image by key
     * @param key - Image key
     * @returns The loaded image or undefined if not found
     */
    getImage(key: string): HTMLImageElement | undefined;
    /**
     * Get a loaded sound by key
     * @param key - Sound key
     * @returns The loaded sound or undefined if not found
     */
    getSound(key: string): HTMLAudioElement | undefined;
    /**
     * Get a loaded font by family name
     * @param fontFamily - Font family name
     * @returns The loaded font or undefined if not found
     */
    getFont(fontFamily: string): FontFace | undefined;
    /**
     * Get loaded data by key
     * @param key - Data key
     * @returns The loaded data or undefined if not found
     */
    getData(key: string): any | undefined;
    /**
     * Play a sound by key
     * @param key - Sound key
     * @param volume - Volume level (0.0 to 1.0)
     * @param loop - Whether to loop the sound
     * @returns The playing sound element or undefined if not found
     */
    playSound(key: string, volume?: number, loop?: boolean): HTMLAudioElement | undefined;
}
/**
 * Singleton instance of AssetManager
 */
export declare const assetManager: AssetManager;
export default assetManager;
