/**
 * Drawing Studio - Main Application
 * Entry point and UI controller
 */

import { DrawingEngine } from './core/DrawingEngine.js';
import { StorageManager } from './core/StorageManager.js';
import { Gallery } from './ui/Gallery.js';
import { TemplateSelector } from './ui/TemplateSelector.js';
import { TextureSelector } from './ui/TextureSelector.js';
import { MagicSelector } from './ui/MagicSelector.js';
import { ColorWheel } from './ui/ColorWheel.js';
import { Artwork } from './models/Artwork.js';
import { BucketFillTool } from './tools/BucketFillTool.js';
import { MagicBrush } from './tools/MagicBrush.js';
import { TextureBrush } from './tools/TextureBrush.js';
import { addAnimatedClass } from './utils/helpers.js';
import { MusicManager } from './core/MusicManager.js';

class DrawingStudioApp {
    constructor() {
        this.engine = null;
        this.storageManager = null;
        this.gallery = null;
        this.templateSelector = null;
        this.textureSelector = null;
        this.magicSelector = null;
        this.musicManager = null;
        this.currentTool = 'brush';
        this.currentArtworkId = null;
    }

    /**
     * Initialize the application
     */
    async init() {
        console.log('Initializing Drawing Studio...');

        // Initialize storage
        this.storageManager = new StorageManager();
        try {
            await this.storageManager.init();
            console.log('✓ Storage initialized');
        } catch (error) {
            console.error('Storage initialization failed:', error);
            alert('Warning: Unable to initialize storage. Artworks cannot be saved.');
        }

        // Initialize drawing engine
        this.engine = new DrawingEngine('canvas');

        // Register custom tools
        this.engine.toolManager.registerTool('bucket', new BucketFillTool());
        this.magicBrush = new MagicBrush();
        this.engine.toolManager.registerTool('magic', this.magicBrush);
        this.textureBrush = new TextureBrush();
        this.engine.toolManager.registerTool('texture', this.textureBrush);

        // Initialize gallery
        this.gallery = new Gallery(this.storageManager);
        const galleryElement = this.gallery.create();
        document.body.appendChild(galleryElement);

        // Set up gallery callbacks
        this.gallery.onLoad(async (artwork) => await this.loadArtwork(artwork));
        this.gallery.onDelete((artwork) => this.onArtworkDeleted(artwork));
        this.gallery.onNew(() => this.newArtwork());

        // Initialize template selector
        this.templateSelector = new TemplateSelector();
        const selectorElement = this.templateSelector.create();
        document.body.appendChild(selectorElement);

        // Set up template callback
        this.templateSelector.onSelect(async (template) => await this.loadTemplate(template));

        // Initialize texture selector
        this.textureSelector = new TextureSelector();
        const textureSelectorElement = this.textureSelector.create();
        document.body.appendChild(textureSelectorElement);

        // Set up texture callback
        this.textureSelector.onSelect((texture) => {
            if (this.textureBrush) {
                this.textureBrush.setTexture(texture);
            }
        });

        // Initialize magic selector
        this.magicSelector = new MagicSelector();
        const magicSelectorElement = this.magicSelector.create();
        document.body.appendChild(magicSelectorElement);

        // Set up magic callback
        this.magicSelector.onSelect((effect) => {
            if (this.magicBrush) {
                this.magicBrush.setEffect(effect);
            }
        });

        // Initialize music
        this.musicManager = new MusicManager();

        // Set up UI
        this.setupToolButtons();
        this.setupSizeControl();
        this.setupColorPalette();
        this.setupSymmetry();
        this.setupActionButtons();
        this.setupMusicControl();

        // Start music on first user interaction
        this.setupFirstInteraction();

        // Set up responsive canvas
        this.setupResponsiveCanvas();

        // Set up keyboard shortcuts
        this.setupKeyboardShortcuts();

        // Set up page unload cleanup
        window.addEventListener('beforeunload', () => {
            this.destroy();
        });

        console.log('Drawing Studio initialized successfully!');
        console.log('Debug info:', this.engine.getDebugInfo());
    }

    /**
     * Set up tool selector buttons
     */
    setupToolButtons() {
        const tools = this.engine.getAvailableTools();
        const container = document.getElementById('tool-buttons');

        tools.forEach(({ id, name }) => {
            const button = document.createElement('button');
            button.className = 'tool-btn';
            button.dataset.tool = id;

            // Add icons with text labels
            const iconData = {
                'brush': { emoji: '✏️', text: 'Brush' },
                'eraser': { emoji: '❌', text: 'Eraser' },
                'bucket': { emoji: '🪣', text: 'Fill' },
                'magic': { emoji: '✨', text: 'Magic' },
                'texture': { emoji: '🖌️', text: 'Texture' }
            };

            const data = iconData[id] || { emoji: '', text: name };
            button.innerHTML = `<span style="font-size:1.3em">${data.emoji}</span> <span>${data.text}</span>`;
            button.title = name;

            // Set active state for current tool
            if (id === this.currentTool) {
                button.classList.add('active');
            }

            button.addEventListener('click', () => this.selectTool(id));
            container.appendChild(button);
        });

        console.log(`${tools.length} tool buttons created`);
    }

    /**
     * Set up size control
     */
    setupSizeControl() {
        const sizeSlider = document.getElementById('size-slider');
        const sizeValue = document.getElementById('size-value');

        sizeSlider.addEventListener('input', (e) => {
            const width = parseInt(e.target.value, 10);
            if (!isNaN(width)) {
                this.engine.setLineWidth(width);
                sizeValue.textContent = `${width}px`;
            }
        });

        console.log('Size control set up');
    }

    /**
     * Set up color palette
     */
    setupColorPalette() {
        const container = document.getElementById('color-palette');

        // Add color wheel first
        this.colorWheel = new ColorWheel(120);
        const wheelElement = this.colorWheel.create();
        container.appendChild(wheelElement);

        this.colorWheel.onChange((color) => {
            this.selectColor(color);
        });

        // Add grayscale slider (separate row)
        const grayscaleSlider = this.colorWheel.createGrayscaleSlider();
        container.appendChild(grayscaleSlider);

        // Add random color button
        const randomBtn = document.createElement('button');
        randomBtn.className = 'random-color-btn';
        randomBtn.innerHTML = '🎲<br><span>Random</span>';
        randomBtn.title = 'Randomize color swatches';
        randomBtn.addEventListener('click', () => {
            this.randomizeColorSwatches();
            addAnimatedClass(randomBtn, 'pulse');
        });
        container.appendChild(randomBtn);

        // Add preset color buttons (will be filled by randomizeColorSwatches)
        this.colorButtons = [];
        for (let i = 0; i < 12; i++) {
            const button = document.createElement('button');
            button.className = 'color-btn';
            button.addEventListener('click', () => {
                const color = button.dataset.color;
                if (color) this.selectColor(color);
            });
            container.appendChild(button);
            this.colorButtons.push(button);
        }

        // Initialize with default colors
        this.randomizeColorSwatches();

        console.log(`Color wheel + grayscale slider + random button + ${this.colorButtons.length} color swatches created`);
    }

    /**
     * Randomize color swatches
     */
    randomizeColorSwatches() {
        // Generate 12 random vibrant colors
        const newColors = [];
        for (let i = 0; i < 12; i++) {
            newColors.push(this.colorWheel.getRandomColor());
        }

        // Update color buttons
        this.colorButtons.forEach((button, index) => {
            const color = newColors[index];
            button.style.backgroundColor = color;
            button.dataset.color = color;
            button.title = color;

            // Add animation
            button.style.animation = 'none';
            setTimeout(() => {
                button.style.animation = 'pulse 0.3s ease';
            }, index * 30); // Stagger animation
        });

        console.log('Color swatches randomized');
    }


    /**
     * Set up symmetry buttons
     */
    setupSymmetry() {
        const symmetryButtons = document.querySelectorAll('.symmetry-btn');

        symmetryButtons.forEach(button => {
            button.addEventListener('click', () => {
                const mode = button.dataset.mode;

                // Toggle symmetry mode
                this.engine.toggleSymmetry(mode);

                // Update active state
                if (this.engine.isSymmetryEnabled() && this.engine.getSymmetryMode() === mode) {
                    button.classList.add('active');
                    // Remove active from other buttons
                    symmetryButtons.forEach(btn => {
                        if (btn !== button) btn.classList.remove('active');
                    });
                } else {
                    button.classList.remove('active');
                }

                addAnimatedClass(button, 'pulse');
            });
        });

        console.log('Symmetry controls set up');
    }

    /**
     * Set up action buttons
     */
    setupActionButtons() {
        const templateBtn = document.getElementById('template-btn');
        const clearBtn = document.getElementById('clear-btn');
        const saveBtn = document.getElementById('save-btn');
        const galleryBtn = document.getElementById('gallery-btn');
        const exportBtn = document.getElementById('export-btn');

        // Template button
        if (templateBtn) {
            templateBtn.addEventListener('click', () => this.templateSelector.show());
        }

        // Clear button
        clearBtn.addEventListener('click', () => {
            if (confirm('Clear your drawing? This cannot be undone.')) {
                this.engine.clear();
                this.currentArtworkId = null;
                addAnimatedClass(clearBtn, 'pulse');

                // Fun feedback
                clearBtn.textContent = '✨ Cleared!';
                setTimeout(() => {
                    clearBtn.textContent = '🗑️ Clear';
                }, 1500);
            }
        });

        // Save button
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveArtwork());
        }

        // Gallery button
        if (galleryBtn) {
            galleryBtn.addEventListener('click', () => this.gallery.show());
        }

        // Export button
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportArtwork());
        }

        console.log('Action buttons set up');
    }

    /**
     * Select a tool
     * @param {string} toolId
     */
    selectTool(toolId) {
        if (this.engine.setTool(toolId)) {
            this.currentTool = toolId;

            // Update UI
            document.querySelectorAll('.tool-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.tool === toolId);
            });

            // Show magic selector modal when magic tool is selected
            if (toolId === 'magic' && this.magicSelector) {
                this.magicSelector.show();
            }

            // Show texture selector modal when texture tool is selected
            if (toolId === 'texture' && this.textureSelector) {
                this.textureSelector.show();
            }

            // Update size slider and value display to current tool's line width
            const sizeSlider = document.getElementById('size-slider');
            const sizeValue = document.getElementById('size-value');
            const toolInfo = this.engine.getActiveToolInfo();
            sizeSlider.value = toolInfo.lineWidth;
            sizeValue.textContent = `${toolInfo.lineWidth}px`;

            // Add animation
            const activeBtn = document.querySelector(`.tool-btn[data-tool="${toolId}"]`);
            if (activeBtn) {
                addAnimatedClass(activeBtn, 'pulse');
            }

            console.log(`Tool selected: ${toolId}`);
        }
    }


    /**
     * Select a color
     * @param {string} color
     */
    selectColor(color) {
        this.engine.setColor(color);

        // Update UI
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.color === color);
        });

        // Add animation
        const activeBtn = document.querySelector(`.color-btn[data-color="${color}"]`);
        if (activeBtn) {
            addAnimatedClass(activeBtn, 'pulse');
        }

        console.log(`Color selected: ${color}`);
    }

    /**
     * Set up responsive canvas sizing
     */
    setupResponsiveCanvas() {
        const resizeCanvas = () => {
            const canvas = document.getElementById('canvas');
            if (window.innerWidth <= 768) {
                const container = canvas.parentElement;
                const maxWidth = window.innerWidth - 40;
                const maxHeight = window.innerHeight - 300;

                const scale = Math.min(maxWidth / canvas.width, maxHeight / canvas.height);
                canvas.style.width = (canvas.width * scale) + 'px';
                canvas.style.height = (canvas.height * scale) + 'px';
            } else {
                canvas.style.width = '';
                canvas.style.height = '';
            }
        };

        window.addEventListener('load', resizeCanvas);
        window.addEventListener('resize', resizeCanvas);

        console.log('Responsive canvas set up');
    }

    /**
     * Set up keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Tool shortcuts: B for brush, E for eraser
            if (!e.ctrlKey && !e.metaKey && !e.altKey) {
                if (e.key === 'b' || e.key === 'B') {
                    this.selectTool('brush');
                } else if (e.key === 'e' || e.key === 'E') {
                    this.selectTool('eraser');
                }
            }
        });

        console.log('Keyboard shortcuts set up');
        console.log('Shortcuts: B (brush), E (eraser)');
    }

    /**
     * Save current artwork
     */
    async saveArtwork() {
        // Check if canvas is blank
        if (this.engine.isCanvasBlank()) {
            alert('Canvas is blank! Draw something first.');
            return;
        }

        try {
            const saveBtn = document.getElementById('save-btn');
            const originalText = saveBtn.textContent;
            saveBtn.textContent = '💾 Saving...';
            saveBtn.disabled = true;

            // Create or update artwork
            const artwork = new Artwork({
                id: this.currentArtworkId,  // Reuse ID if editing
                imageData: this.engine.getDataURL(),
                thumbnail: this.engine.generateThumbnail(),
                width: this.engine.canvas.width,
                height: this.engine.canvas.height
            });

            // Save to storage
            const id = await this.storageManager.saveArtwork(artwork);
            this.currentArtworkId = id;

            // Success feedback
            saveBtn.textContent = '✓ Saved!';
            addAnimatedClass(saveBtn, 'pulse');

            setTimeout(() => {
                saveBtn.textContent = originalText;
                saveBtn.disabled = false;
            }, 2000);

            console.log(`Artwork saved: ${id}`);
        } catch (error) {
            console.error('Save failed:', error);
            alert(`Failed to save: ${error.message}`);

            const saveBtn = document.getElementById('save-btn');
            saveBtn.textContent = '💾 Save';
            saveBtn.disabled = false;
        }
    }

    /**
     * Load artwork onto canvas
     * @param {Artwork} artwork
     */
    async loadArtwork(artwork) {
        try {
            await this.engine.loadFromDataURL(artwork.imageData);
            this.currentArtworkId = artwork.id;
            console.log(`Artwork loaded: ${artwork.id}`);
        } catch (error) {
            console.error('Load failed:', error);
            throw error;
        }
    }

    /**
     * Start new artwork
     */
    newArtwork() {
        if (!this.engine.isCanvasBlank()) {
            const confirmed = confirm('Start new drawing? Unsaved changes will be lost.');
            if (!confirmed) return;
        }

        this.engine.clear();
        this.currentArtworkId = null;
        console.log('New artwork started');
    }

    /**
     * Export artwork as PNG
     */
    exportArtwork() {
        if (this.engine.isCanvasBlank()) {
            alert('Canvas is blank! Draw something first.');
            return;
        }

        const filename = `drawing-${Date.now()}`;
        this.engine.downloadAsPNG(filename);

        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            const originalText = exportBtn.textContent;
            exportBtn.textContent = '✓ Downloaded!';
            addAnimatedClass(exportBtn, 'pulse');

            setTimeout(() => {
                exportBtn.textContent = originalText;
            }, 2000);
        }
    }

    /**
     * Callback when artwork is deleted
     * @param {Artwork} artwork
     */
    onArtworkDeleted(artwork) {
        if (this.currentArtworkId === artwork.id) {
            this.currentArtworkId = null;
        }
        console.log(`Artwork deleted: ${artwork.id}`);
    }

    /**
     * Set up first interaction to start music
     */
    setupFirstInteraction() {
        let musicStarted = false;

        const startMusic = () => {
            if (!musicStarted && !this.musicManager.isMuted) {
                this.musicManager.start();
                musicStarted = true;
                console.log('Music started after user interaction');
            }
        };

        // Listen for any user interaction
        document.addEventListener('click', startMusic, { once: true });
        document.addEventListener('touchstart', startMusic, { once: true });
        document.addEventListener('keydown', startMusic, { once: true });
    }

    /**
     * Clean up application resources
     */
    destroy() {
        console.log('Cleaning up Drawing Studio...');

        // Clean up UI components
        if (this.colorWheel) {
            this.colorWheel.destroy();
            this.colorWheel = null;
        }

        if (this.gallery) {
            this.gallery.destroy();
            this.gallery = null;
        }

        if (this.templateSelector) {
            this.templateSelector.destroy();
            this.templateSelector = null;
        }

        if (this.textureSelector) {
            this.textureSelector.destroy();
            this.textureSelector = null;
        }

        if (this.magicSelector) {
            this.magicSelector.destroy();
            this.magicSelector = null;
        }

        // Clean up engine and managers
        if (this.engine) {
            this.engine.destroy();
            this.engine = null;
        }

        if (this.musicManager) {
            this.musicManager.destroy();
            this.musicManager = null;
        }

        if (this.storageManager) {
            this.storageManager.destroy();
            this.storageManager = null;
        }

        // Clear references
        this.colorButtons = [];
        this.currentArtworkId = null;
        this.magicBrush = null;
        this.textureBrush = null;

        console.log('Drawing Studio cleaned up');
    }

    /**
     * Set up music control button
     */
    setupMusicControl() {
        const musicBtn = document.getElementById('music-btn');
        if (!musicBtn) {
            console.warn('Music button not found');
            return;
        }

        // Set initial state
        this.updateMusicButton(musicBtn);

        // Toggle music on click
        musicBtn.addEventListener('click', () => {
            this.musicManager.toggleMute();
            this.updateMusicButton(musicBtn);
            addAnimatedClass(musicBtn, 'pulse');
        });

        console.log('Music control set up');
    }

    /**
     * Update music button appearance
     */
    updateMusicButton(button) {
        const state = this.musicManager.getState();

        if (state.isMuted) {
            button.textContent = '🔇 Music OFF';
            button.classList.add('muted');
        } else {
            button.textContent = '🎵 Music ON';
            button.classList.remove('muted');
        }
    }

    /**
     * Load template onto canvas
     * @param {Template} template
     */
    async loadTemplate(template) {
        try {
            await template.loadToCanvas(this.engine.canvas);
            this.engine.saveState();
            this.currentArtworkId = null;

            // Always disable symmetry when loading template
            console.log('Disabling symmetry (if enabled)...');

            // Force disable symmetry
            this.engine.symmetryManager.disable();
            this.engine.updateOverlay();

            // Remove active state from all symmetry buttons
            const symmetryButtons = document.querySelectorAll('.symmetry-btn');
            symmetryButtons.forEach(btn => btn.classList.remove('active'));

            console.log('Symmetry force disabled, enabled:', this.engine.symmetryManager.enabled);

            // Auto-switch to fill tool
            this.selectTool('bucket');

            console.log(`Template loaded: ${template.name}`);
        } catch (error) {
            console.error('Template load failed:', error);
            alert('Failed to load template');
        }
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const app = new DrawingStudioApp();
        app.init();
    });
} else {
    const app = new DrawingStudioApp();
    app.init();
}
