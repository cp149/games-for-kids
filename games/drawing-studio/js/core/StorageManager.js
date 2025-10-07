/**
 * Drawing Studio - Storage Manager
 * Handles artwork persistence using IndexedDB
 */

import { Artwork } from '../models/Artwork.js';

export class StorageManager {
    constructor() {
        this.dbName = 'DrawingStudio';
        this.dbVersion = 1;
        this.storeName = 'artworks';
        this.db = null;
        this.maxArtworks = 50;  // Limit to prevent storage overflow
    }

    /**
     * Initialize IndexedDB
     * @returns {Promise<void>}
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('IndexedDB error:', request.error);
                reject(new Error('Failed to open IndexedDB'));
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('IndexedDB initialized successfully');
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create object store if it doesn't exist
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const objectStore = db.createObjectStore(this.storeName, { keyPath: 'id' });
                    objectStore.createIndex('createdAt', 'createdAt', { unique: false });
                    objectStore.createIndex('modifiedAt', 'modifiedAt', { unique: false });
                    console.log('Object store created');
                }
            };
        });
    }

    /**
     * Save artwork
     * @param {Artwork} artwork
     * @returns {Promise<string>} artwork ID
     */
    async saveArtwork(artwork) {
        if (!this.db) {
            throw new Error('Database not initialized');
        }

        // Check artwork limit
        const count = await this.getArtworkCount();
        if (count >= this.maxArtworks) {
            throw new Error(`Maximum ${this.maxArtworks} artworks allowed. Please delete some first.`);
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.put(artwork.toJSON());

            request.onsuccess = () => {
                console.log(`Artwork saved: ${artwork.id}`);
                resolve(artwork.id);
            };

            request.onerror = () => {
                console.error('Save error:', request.error);
                reject(new Error('Failed to save artwork'));
            };
        });
    }

    /**
     * Load artwork by ID
     * @param {string} id
     * @returns {Promise<Artwork|null>}
     */
    async loadArtwork(id) {
        if (!this.db) {
            throw new Error('Database not initialized');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.get(id);

            request.onsuccess = () => {
                if (request.result) {
                    resolve(Artwork.fromJSON(request.result));
                } else {
                    resolve(null);
                }
            };

            request.onerror = () => {
                console.error('Load error:', request.error);
                reject(new Error('Failed to load artwork'));
            };
        });
    }

    /**
     * Get all artworks (metadata only, sorted by modified date)
     * @returns {Promise<Artwork[]>}
     */
    async getAllArtworks() {
        if (!this.db) {
            throw new Error('Database not initialized');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const objectStore = transaction.objectStore(this.storeName);
            const index = objectStore.index('modifiedAt');
            const request = index.openCursor(null, 'prev'); // Newest first

            const artworks = [];

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    artworks.push(Artwork.fromJSON(cursor.value));
                    cursor.continue();
                } else {
                    resolve(artworks);
                }
            };

            request.onerror = () => {
                console.error('Get all error:', request.error);
                reject(new Error('Failed to load artworks'));
            };
        });
    }

    /**
     * Delete artwork by ID
     * @param {string} id
     * @returns {Promise<void>}
     */
    async deleteArtwork(id) {
        if (!this.db) {
            throw new Error('Database not initialized');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.delete(id);

            request.onsuccess = () => {
                console.log(`Artwork deleted: ${id}`);
                resolve();
            };

            request.onerror = () => {
                console.error('Delete error:', request.error);
                reject(new Error('Failed to delete artwork'));
            };
        });
    }

    /**
     * Get artwork count
     * @returns {Promise<number>}
     */
    async getArtworkCount() {
        if (!this.db) {
            throw new Error('Database not initialized');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.count();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(new Error('Failed to count artworks'));
            };
        });
    }

    /**
     * Clear all artworks (for testing/reset)
     * @returns {Promise<void>}
     */
    async clearAll() {
        if (!this.db) {
            throw new Error('Database not initialized');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.clear();

            request.onsuccess = () => {
                console.log('All artworks cleared');
                resolve();
            };

            request.onerror = () => {
                reject(new Error('Failed to clear artworks'));
            };
        });
    }

    /**
     * Get storage usage estimate
     * @returns {Promise<{used: number, quota: number}>} Sizes in MB
     */
    async getStorageInfo() {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            const estimate = await navigator.storage.estimate();
            return {
                used: Math.round(estimate.usage / 1024 / 1024 * 100) / 100,
                quota: Math.round(estimate.quota / 1024 / 1024)
            };
        }
        return { used: 0, quota: 0 };
    }
}
