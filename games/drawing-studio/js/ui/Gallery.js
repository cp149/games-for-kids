/**
 * Drawing Studio - Gallery UI
 * Displays grid of saved artworks with thumbnails
 */

export class Gallery {
    constructor(storageManager) {
        this.storageManager = storageManager;
        this.container = null;
        this.artworks = [];
        this.onLoadCallback = null;
        this.onDeleteCallback = null;
        this.onNewCallback = null;
    }

    /**
     * Create gallery UI
     * @returns {HTMLElement}
     */
    create() {
        this.container = document.createElement('div');
        this.container.id = 'gallery';
        this.container.className = 'gallery hidden';

        // Header
        const header = document.createElement('div');
        header.className = 'gallery-header';

        const title = document.createElement('h2');
        title.textContent = '🎨 My Gallery';
        header.appendChild(title);

        const closeBtn = document.createElement('button');
        closeBtn.className = 'gallery-close-btn';
        closeBtn.innerHTML = '✕';
        closeBtn.title = 'Close Gallery';
        closeBtn.addEventListener('click', () => this.hide());
        header.appendChild(closeBtn);

        this.container.appendChild(header);

        // Grid container
        const grid = document.createElement('div');
        grid.className = 'gallery-grid';
        grid.id = 'gallery-grid';
        this.container.appendChild(grid);

        // Info bar
        const infoBar = document.createElement('div');
        infoBar.className = 'gallery-info';
        infoBar.id = 'gallery-info';
        infoBar.textContent = 'Loading...';
        this.container.appendChild(infoBar);

        return this.container;
    }

    /**
     * Show gallery and load artworks
     */
    async show() {
        if (!this.container) {
            console.error('Gallery not created');
            return;
        }

        this.container.classList.remove('hidden');
        await this.refresh();
    }

    /**
     * Hide gallery
     */
    hide() {
        if (this.container) {
            this.container.classList.add('hidden');
        }
    }

    /**
     * Refresh gallery with latest artworks
     */
    async refresh() {
        try {
            this.artworks = await this.storageManager.getAllArtworks();
            this.render();
        } catch (error) {
            console.error('Error loading gallery:', error);
            this.showError('Failed to load artworks');
        }
    }

    /**
     * Render gallery grid
     */
    render() {
        const grid = document.getElementById('gallery-grid');
        if (!grid) return;

        grid.innerHTML = '';

        // Show new artwork button first
        const newCard = this.createNewArtworkCard();
        grid.appendChild(newCard);

        // Show artworks
        if (this.artworks.length === 0) {
            this.updateInfo('No artworks yet. Start drawing!');
        } else {
            this.artworks.forEach(artwork => {
                const card = this.createArtworkCard(artwork);
                grid.appendChild(card);
            });

            this.updateInfo(`${this.artworks.length} artwork${this.artworks.length > 1 ? 's' : ''}`);
        }
    }

    /**
     * Create "New Artwork" card
     * @returns {HTMLElement}
     */
    createNewArtworkCard() {
        const card = document.createElement('div');
        card.className = 'gallery-card new-artwork-card';

        const content = document.createElement('div');
        content.className = 'new-artwork-content';
        content.innerHTML = `
            <div class="new-artwork-icon">+</div>
            <div class="new-artwork-text">New Drawing</div>
        `;

        card.appendChild(content);

        card.addEventListener('click', () => {
            if (this.onNewCallback) {
                this.onNewCallback();
            }
            this.hide();
        });

        return card;
    }

    /**
     * Create artwork card
     * @param {Artwork} artwork
     * @returns {HTMLElement}
     */
    createArtworkCard(artwork) {
        const card = document.createElement('div');
        card.className = 'gallery-card';
        card.dataset.artworkId = artwork.id;

        // Thumbnail
        const thumbnail = document.createElement('img');
        thumbnail.className = 'artwork-thumbnail';
        thumbnail.src = artwork.thumbnail || artwork.imageData;
        thumbnail.alt = artwork.name;
        card.appendChild(thumbnail);

        // Info overlay
        const info = document.createElement('div');
        info.className = 'artwork-info';

        const name = document.createElement('div');
        name.className = 'artwork-name';
        name.textContent = this.truncateName(artwork.name, 20);
        name.title = artwork.name;
        info.appendChild(name);

        const date = document.createElement('div');
        date.className = 'artwork-date';
        date.textContent = this.formatDate(artwork.modifiedAt);
        info.appendChild(date);

        card.appendChild(info);

        // Actions (hidden by default, shown on hover)
        const actions = document.createElement('div');
        actions.className = 'artwork-actions';

        const loadBtn = document.createElement('button');
        loadBtn.className = 'action-btn load-btn';
        loadBtn.innerHTML = '📂';
        loadBtn.title = 'Load';
        loadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.loadArtwork(artwork);
        });
        actions.appendChild(loadBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-btn delete-btn';
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.title = 'Delete';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteArtwork(artwork);
        });
        actions.appendChild(deleteBtn);

        card.appendChild(actions);

        // Click to load
        card.addEventListener('click', () => {
            this.loadArtwork(artwork);
        });

        return card;
    }

    /**
     * Load artwork
     * @param {Artwork} artwork
     */
    async loadArtwork(artwork) {
        if (this.onLoadCallback) {
            try {
                await this.onLoadCallback(artwork);
                this.hide();
            } catch (error) {
                console.error('Error loading artwork:', error);
                alert('Failed to load artwork');
            }
        }
    }

    /**
     * Delete artwork with confirmation
     * @param {Artwork} artwork
     */
    async deleteArtwork(artwork) {
        const confirmed = confirm(`Delete "${artwork.name}"?`);
        if (!confirmed) return;

        try {
            await this.storageManager.deleteArtwork(artwork.id);

            if (this.onDeleteCallback) {
                this.onDeleteCallback(artwork);
            }

            await this.refresh();
        } catch (error) {
            console.error('Error deleting artwork:', error);
            alert('Failed to delete artwork');
        }
    }

    /**
     * Truncate name to max length
     * @param {string} name
     * @param {number} maxLength
     * @returns {string}
     */
    truncateName(name, maxLength) {
        if (name.length <= maxLength) return name;
        return name.substring(0, maxLength - 3) + '...';
    }

    /**
     * Format date
     * @param {number} timestamp
     * @returns {string}
     */
    formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString();
    }

    /**
     * Update info bar
     * @param {string} message
     */
    updateInfo(message) {
        const infoBar = document.getElementById('gallery-info');
        if (infoBar) {
            infoBar.textContent = message;
        }
    }

    /**
     * Show error message
     * @param {string} message
     */
    showError(message) {
        this.updateInfo(`❌ ${message}`);
    }

    /**
     * Set load callback
     * @param {Function} callback
     */
    onLoad(callback) {
        this.onLoadCallback = callback;
    }

    /**
     * Set delete callback
     * @param {Function} callback
     */
    onDelete(callback) {
        this.onDeleteCallback = callback;
    }

    /**
     * Set new artwork callback
     * @param {Function} callback
     */
    onNew(callback) {
        this.onNewCallback = callback;
    }
}
