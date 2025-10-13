/**
 * Texture Selector - Modal for selecting texture brush type
 */

export class TextureSelector {
    constructor() {
        this.element = null;
        this.onSelectCallback = null;
        this.selectedTexture = 'crayon';
    }

    /**
     * Create texture selector modal
     */
    create() {
        const modal = document.createElement('div');
        modal.className = 'texture-selector hidden';
        modal.id = 'texture-selector';

        modal.innerHTML = `
            <div class="texture-selector-content">
                <button class="texture-close-btn" id="texture-close-btn">×</button>

                <div class="texture-header">
                    <h2>🖌️ Choose Texture</h2>
                    <p class="texture-subtitle">Select a painting style</p>
                </div>

                <div class="texture-grid">
                    <div class="texture-card" data-texture="crayon">
                        <div class="texture-icon">🖍️</div>
                        <div class="texture-name">Crayon</div>
                        <div class="texture-desc">Rough & grainy</div>
                    </div>

                    <div class="texture-card" data-texture="watercolor">
                        <div class="texture-icon">💧</div>
                        <div class="texture-name">Watercolor</div>
                        <div class="texture-desc">Soft & blended</div>
                    </div>

                    <div class="texture-card" data-texture="spray">
                        <div class="texture-icon">💨</div>
                        <div class="texture-name">Spray</div>
                        <div class="texture-desc">Scattered dots</div>
                    </div>

                    <div class="texture-card" data-texture="ink">
                        <div class="texture-icon">🖋️</div>
                        <div class="texture-name">Ink Brush</div>
                        <div class="texture-desc">Smooth & flowing</div>
                    </div>

                    <div class="texture-card" data-texture="brush">
                        <div class="texture-icon">🖌️</div>
                        <div class="texture-name">Chinese Brush</div>
                        <div class="texture-desc">Elegant & expressive</div>
                    </div>

                    <div class="texture-card" data-texture="oil">
                        <div class="texture-icon">🎨</div>
                        <div class="texture-name">Oil Paint</div>
                        <div class="texture-desc">Thick & textured</div>
                    </div>

                    <div class="texture-card" data-texture="colorSpray">
                        <div class="texture-icon">💨</div>
                        <div class="texture-name">Color Spray</div>
                        <div class="texture-desc">Dense spray paint</div>
                    </div>

                    <div class="texture-card" data-texture="waterSpray">
                        <div class="texture-icon">💧</div>
                        <div class="texture-name">Water Spray</div>
                        <div class="texture-desc">Blur & smear colors</div>
                    </div>
                </div>
            </div>
        `;

        this.element = modal;
        this.setupEventListeners();

        return modal;
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Close button
        const closeBtn = this.element.querySelector('#texture-close-btn');
        closeBtn.addEventListener('click', () => this.hide());

        // Click outside to close
        this.element.addEventListener('click', (e) => {
            if (e.target === this.element) {
                this.hide();
            }
        });

        // Texture cards
        const cards = this.element.querySelectorAll('.texture-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const texture = card.dataset.texture;
                this.selectTexture(texture);
            });
        });
    }

    /**
     * Select a texture
     */
    selectTexture(texture) {
        this.selectedTexture = texture;

        // Update active state
        const cards = this.element.querySelectorAll('.texture-card');
        cards.forEach(card => {
            card.classList.toggle('active', card.dataset.texture === texture);
        });

        // Trigger callback
        if (this.onSelectCallback) {
            this.onSelectCallback(texture);
        }

        // Hide modal after selection
        setTimeout(() => this.hide(), 300);
    }

    /**
     * Show the selector
     */
    show() {
        this.element.classList.remove('hidden');

        // Update active state based on current selection
        const cards = this.element.querySelectorAll('.texture-card');
        cards.forEach(card => {
            card.classList.toggle('active', card.dataset.texture === this.selectedTexture);
        });
    }

    /**
     * Hide the selector
     */
    hide() {
        this.element.classList.add('hidden');
    }

    /**
     * Set callback for texture selection
     */
    onSelect(callback) {
        this.onSelectCallback = callback;
    }

    /**
     * Get current texture
     */
    getSelectedTexture() {
        return this.selectedTexture;
    }
}
