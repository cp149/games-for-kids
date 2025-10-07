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
        this.setupSizeControl();
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
     * Set up action buttons (clear)
     */
    setupActionButtons() {
        const clearBtn = document.getElementById('clear-btn');

        // Clear button
        clearBtn.addEventListener('click', () => {
            if (confirm('Clear your drawing? This cannot be undone.')) {
                this.engine.clear();
                addAnimatedClass(clearBtn, 'pulse');

                // Fun feedback
                clearBtn.textContent = '✨ Cleared!';
                setTimeout(() => {
                    clearBtn.textContent = '🗑️ Clear Canvas';
                }, 1500);
            }
        });

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
