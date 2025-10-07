/**
 * Drawing Studio - Main Application
 * Entry point and UI controller
 */

import { DrawingEngine } from './core/DrawingEngine.js';
import { addAnimatedClass } from './utils/helpers.js';

class DrawingStudioApp {
    constructor() {
        this.engine = null;
        this.currentTool = 'brush';
        this.currentSize = 'medium';
    }

    /**
     * Initialize the application
     */
    init() {
        console.log('Initializing Drawing Studio...');

        // Initialize drawing engine
        this.engine = new DrawingEngine('canvas');

        // Set up UI
        this.setupToolButtons();
        this.setupSizeButtons();
        this.setupColorPalette();
        this.setupActionButtons();

        // Set up responsive canvas
        this.setupResponsiveCanvas();

        // Set up keyboard shortcuts
        this.setupKeyboardShortcuts();

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

            // Add emoji icons
            const icons = {
                'brush': '✏️',
                'eraser': '🧹'
            };
            button.textContent = icons[id] || name;
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
     * Set up size selector buttons
     */
    setupSizeButtons() {
        const sizes = ['small', 'medium', 'large'];
        const container = document.getElementById('size-buttons');

        sizes.forEach(size => {
            const button = document.createElement('button');
            button.className = 'size-btn';
            button.dataset.size = size;
            button.textContent = size.charAt(0).toUpperCase() + size.slice(1);

            // Set active state for current size
            if (size === this.currentSize) {
                button.classList.add('active');
            }

            button.addEventListener('click', () => this.selectSize(size));
            container.appendChild(button);
        });

        console.log(`${sizes.length} size buttons created`);
    }

    /**
     * Set up color palette
     */
    setupColorPalette() {
        const colors = this.engine.getColorPalette();
        const container = document.getElementById('color-palette');

        colors.forEach((color, index) => {
            const button = document.createElement('button');
            button.className = 'color-btn';
            button.dataset.color = color;
            button.style.backgroundColor = color;
            button.title = color;

            // Set active state for first color
            if (index === 0) {
                button.classList.add('active');
            }

            button.addEventListener('click', () => this.selectColor(color));
            container.appendChild(button);
        });

        console.log(`${colors.length} color buttons created`);
    }

    /**
     * Set up action buttons (undo, redo, clear)
     */
    setupActionButtons() {
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');
        const clearBtn = document.getElementById('clear-btn');

        // Undo button
        undoBtn.addEventListener('click', async () => {
            const success = await this.engine.undo();
            if (success) {
                addAnimatedClass(undoBtn, 'pulse');
            }
            this.updateHistoryButtons();
        });

        // Redo button
        redoBtn.addEventListener('click', async () => {
            const success = await this.engine.redo();
            if (success) {
                addAnimatedClass(redoBtn, 'pulse');
            }
            this.updateHistoryButtons();
        });

        // Clear button
        clearBtn.addEventListener('click', () => {
            if (confirm('Clear your drawing? This cannot be undone.')) {
                this.engine.clear();
                addAnimatedClass(clearBtn, 'pulse');
                this.updateHistoryButtons();

                // Fun feedback
                clearBtn.textContent = '✨ Cleared!';
                setTimeout(() => {
                    clearBtn.textContent = '🗑️ Clear Canvas';
                }, 1500);
            }
        });

        // Initial state
        this.updateHistoryButtons();

        console.log('Action buttons set up');
    }

    /**
     * Update undo/redo button states
     */
    updateHistoryButtons() {
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');

        undoBtn.disabled = !this.engine.canUndo();
        redoBtn.disabled = !this.engine.canRedo();
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

            // Add animation
            const activeBtn = document.querySelector(`.tool-btn[data-tool="${toolId}"]`);
            if (activeBtn) {
                addAnimatedClass(activeBtn, 'pulse');
            }

            console.log(`Tool selected: ${toolId}`);
        }
    }

    /**
     * Select a size
     * @param {string} size
     */
    selectSize(size) {
        this.engine.setSize(size);
        this.currentSize = size;

        // Update UI
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.size === size);
        });

        // Add animation
        const activeBtn = document.querySelector(`.size-btn[data-size="${size}"]`);
        if (activeBtn) {
            addAnimatedClass(activeBtn, 'pulse');
        }

        console.log(`Size selected: ${size}`);
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
            // Undo: Ctrl+Z or Cmd+Z
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.engine.undo().then(() => this.updateHistoryButtons());
            }

            // Redo: Ctrl+Y or Cmd+Shift+Z
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                this.engine.redo().then(() => this.updateHistoryButtons());
            }

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
        console.log('Shortcuts: Ctrl+Z (undo), Ctrl+Y (redo), B (brush), E (eraser)');
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
