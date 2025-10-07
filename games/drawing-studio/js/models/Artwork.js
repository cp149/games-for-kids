/**
 * Drawing Studio - Artwork Model
 * Represents a saved artwork with metadata
 */

export class Artwork {
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.name = data.name || `Artwork ${new Date().toLocaleString()}`;
        this.createdAt = data.createdAt || Date.now();
        this.modifiedAt = data.modifiedAt || Date.now();
        this.imageData = data.imageData || null;  // Full canvas image (base64)
        this.thumbnail = data.thumbnail || null;   // Thumbnail (base64)
        this.width = data.width || 1000;
        this.height = data.height || 700;
    }

    /**
     * Generate unique ID
     * @returns {string}
     */
    generateId() {
        return `artwork_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Convert to JSON for storage
     * @returns {object}
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            createdAt: this.createdAt,
            modifiedAt: this.modifiedAt,
            imageData: this.imageData,
            thumbnail: this.thumbnail,
            width: this.width,
            height: this.height
        };
    }

    /**
     * Create from JSON
     * @param {object} json
     * @returns {Artwork}
     */
    static fromJSON(json) {
        return new Artwork(json);
    }

    /**
     * Get file size estimate in KB
     * @returns {number}
     */
    getFileSizeKB() {
        const dataSize = (this.imageData?.length || 0) + (this.thumbnail?.length || 0);
        return Math.round(dataSize * 0.75 / 1024); // Base64 is ~33% larger
    }

    /**
     * Update modification timestamp
     */
    touch() {
        this.modifiedAt = Date.now();
    }
}
