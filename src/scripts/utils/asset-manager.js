import { GameEvents, EVENTS } from './event-system.js';

/**
 * AssetManager - Handles loading and caching of game assets
 */
export class AssetManager {
    constructor() {
        // Asset caches by type
        this.images = new Map();
        this.sounds = new Map();
        this.fonts = new Map();
        this.data = new Map();
        
        // Tracking loading state
        this.totalAssets = 0;
        this.loadedAssets = 0;
        this.isLoading = false;

        // Asset lists to load
        this.imagesToLoad = [];
        this.soundsToLoad = [];
        this.fontsToLoad = [];
        this.dataToLoad = [];
    }

    /**
     * Queue an image to be loaded
     * @param {string} key - Unique identifier for the image
     * @param {string} path - File path to the image
     * @returns {AssetManager} - This asset manager for chaining
     */
    queueImage(key, path) {
        this.imagesToLoad.push({ key, path });
        this.totalAssets++;
        return this;
    }

    /**
     * Queue a sound to be loaded
     * @param {string} key - Unique identifier for the sound
     * @param {string} path - File path to the sound
     * @returns {AssetManager} - This asset manager for chaining
     */
    queueSound(key, path) {
        this.soundsToLoad.push({ key, path });
        this.totalAssets++;
        return this;
    }

    /**
     * Queue a font to be loaded
     * @param {string} fontFamily - Font family name
     * @param {string} url - URL to the font file
     * @returns {AssetManager} - This asset manager for chaining
     */
    queueFont(fontFamily, url) {
        this.fontsToLoad.push({ fontFamily, url });
        this.totalAssets++;
        return this;
    }

    /**
     * Queue JSON data to be loaded
     * @param {string} key - Unique identifier for the data
     * @param {string} path - File path to the JSON data
     * @returns {AssetManager} - This asset manager for chaining
     */
    queueData(key, path) {
        this.dataToLoad.push({ key, path });
        this.totalAssets++;
        return this;
    }

    /**
     * Load all queued assets
     * @returns {Promise} - Promise that resolves when all assets are loaded
     */
    loadAll() {
        // Skip if already loading
        if (this.isLoading) {
            return Promise.reject(new Error('Assets are already loading'));
        }

        this.isLoading = true;
        this.loadedAssets = 0;

        // Emit loading start event
        GameEvents.emit('assets:loadStart', { total: this.totalAssets });

        // Create promises for each asset type
        const imagePromises = this.loadImages();
        const soundPromises = this.loadSounds();
        const fontPromises = this.loadFonts();
        const dataPromises = this.loadData();

        // Combine all promises
        return Promise.all([
            ...imagePromises,
            ...soundPromises,
            ...fontPromises,
            ...dataPromises
        ]).then(() => {
            this.isLoading = false;
            
            // Emit loading complete event
            GameEvents.emit('assets:loadComplete', {
                images: this.images,
                sounds: this.sounds,
                fonts: this.fonts,
                data: this.data
            });
            
            // Clear queues
            this.imagesToLoad = [];
            this.soundsToLoad = [];
            this.fontsToLoad = [];
            this.dataToLoad = [];
            
            return {
                images: this.images,
                sounds: this.sounds,
                fonts: this.fonts,
                data: this.data
            };
        }).catch(error => {
            this.isLoading = false;
            GameEvents.emit('assets:loadError', error);
            throw error;
        });
    }

    /**
     * Load all queued images
     * @returns {Array<Promise>} - Array of promises for image loading
     * @private
     */
    loadImages() {
        return this.imagesToLoad.map(({ key, path }) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                
                img.onload = () => {
                    this.images.set(key, img);
                    this.loadedAssets++;
                    this.emitProgress();
                    resolve(img);
                };
                
                img.onerror = (error) => {
                    reject(new Error(`Failed to load image: ${path}`));
                };
                
                img.src = path;
            });
        });
    }

    /**
     * Load all queued sounds
     * @returns {Array<Promise>} - Array of promises for sound loading
     * @private
     */
    loadSounds() {
        return this.soundsToLoad.map(({ key, path }) => {
            return new Promise((resolve, reject) => {
                const audio = new Audio();
                
                audio.oncanplaythrough = () => {
                    this.sounds.set(key, audio);
                    this.loadedAssets++;
                    this.emitProgress();
                    resolve(audio);
                };
                
                audio.onerror = () => {
                    reject(new Error(`Failed to load sound: ${path}`));
                };
                
                audio.src = path;
                audio.load();
            });
        });
    }

    /**
     * Load all queued fonts
     * @returns {Array<Promise>} - Array of promises for font loading
     * @private
     */
    loadFonts() {
        return this.fontsToLoad.map(({ fontFamily, url }) => {
            return new Promise((resolve, reject) => {
                // Create a @font-face rule
                const fontFace = new FontFace(fontFamily, `url(${url})`);
                
                fontFace.load().then(loadedFace => {
                    // Add to fonts collection
                    document.fonts.add(loadedFace);
                    this.fonts.set(fontFamily, loadedFace);
                    
                    this.loadedAssets++;
                    this.emitProgress();
                    resolve(loadedFace);
                }).catch(error => {
                    reject(new Error(`Failed to load font: ${fontFamily}`));
                });
            });
        });
    }

    /**
     * Load all queued data files
     * @returns {Array<Promise>} - Array of promises for data loading
     * @private
     */
    loadData() {
        return this.dataToLoad.map(({ key, path }) => {
            return fetch(path)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to load data: ${path}`);
                    }
                    return response.json();
                })
                .then(data => {
                    this.data.set(key, data);
                    this.loadedAssets++;
                    this.emitProgress();
                    return data;
                });
        });
    }

    /**
     * Emit a progress event
     * @private
     */
    emitProgress() {
        GameEvents.emit('assets:loadProgress', {
            loaded: this.loadedAssets,
            total: this.totalAssets,
            progress: this.loadedAssets / this.totalAssets
        });
    }

    /**
     * Get a loaded image by key
     * @param {string} key - Image key
     * @returns {HTMLImageElement|undefined} - The loaded image or undefined if not found
     */
    getImage(key) {
        return this.images.get(key);
    }

    /**
     * Get a loaded sound by key
     * @param {string} key - Sound key
     * @returns {HTMLAudioElement|undefined} - The loaded sound or undefined if not found
     */
    getSound(key) {
        // Return a clone to allow playing the same sound multiple times
        const original = this.sounds.get(key);
        if (!original) return undefined;
        
        return original.cloneNode();
    }

    /**
     * Get a loaded font by family name
     * @param {string} fontFamily - Font family name
     * @returns {FontFace|undefined} - The loaded font or undefined if not found
     */
    getFont(fontFamily) {
        return this.fonts.get(fontFamily);
    }

    /**
     * Get loaded data by key
     * @param {string} key - Data key
     * @returns {Object|undefined} - The loaded data or undefined if not found
     */
    getData(key) {
        return this.data.get(key);
    }

    /**
     * Play a sound by key
     * @param {string} key - Sound key
     * @param {number} volume - Volume level (0.0 to 1.0)
     * @param {boolean} loop - Whether to loop the sound
     * @returns {HTMLAudioElement|undefined} - The playing sound element or undefined if not found
     */
    playSound(key, volume = 1.0, loop = false) {
        const sound = this.getSound(key);
        if (!sound) return undefined;
        
        sound.volume = volume;
        sound.loop = loop;
        sound.play().catch(error => {
            console.error(`Error playing sound ${key}:`, error);
        });
        
        return sound;
    }
}

/**
 * Singleton instance of AssetManager
 */
export const assetManager = new AssetManager();

export default assetManager;