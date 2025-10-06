/**
 * UIComponents - Kid-friendly UI components for KAPLAY games
 *
 * Provides reusable UI elements:
 * - Buttons with hover effects
 * - Modals and dialogs
 * - Progress bars
 * - Star displays
 * - Menus
 *
 * @example
 * import { UIComponents } from '../lib/extensions/ui/UIComponents.js';
 * const ui = new UIComponents(k, i18n);
 * ui.createButton(k.center(), 'start', () => k.go('game'));
 */
export class UIComponents {
    /**
     * @param {Object} k - KAPLAY instance
     * @param {Object} i18n - SimpleI18n instance (optional)
     */
    constructor(k, i18n = null) {
        this.k = k;
        this.i18n = i18n;

        // Default theme colors
        this.theme = {
            primary: [100, 200, 255],       // Light blue
            secondary: [255, 200, 100],     // Orange
            success: [100, 220, 100],       // Green
            danger: [220, 80, 80],          // Red
            warning: [255, 200, 50],        // Yellow
            text: [255, 255, 255],          // White
            textDark: [50, 50, 50],         // Dark gray
            background: [50, 50, 80],       // Dark blue
            overlay: [0, 0, 0, 0.7]         // Semi-transparent black
        };
    }

    /**
     * Create a button
     * @param {Object} pos - Position {x, y}
     * @param {string} text - Button text or i18n key
     * @param {Function} onClick - Click handler
     * @param {Object} options - Button options
     * @returns {Object} Button game object
     */
    createButton(pos, text, onClick, options = {}) {
        const {
            width = 200,
            height = 60,
            color = this.theme.primary,
            hoverColor = this.theme.secondary,
            textColor = this.theme.text,
            fontSize = 24,
            radius = 8,
            useI18n = true
        } = options;

        // Get text (from i18n or direct)
        const buttonText = (useI18n && this.i18n) ? this.i18n.t(text) : text;

        // Create button background
        const button = this.k.add([
            this.k.rect(width, height, { radius }),
            this.k.pos(pos.x, pos.y),
            this.k.anchor('center'),
            this.k.color(...color),
            this.k.area(),
            this.k.scale(1),
            'button'
        ]);

        // Create button text
        const label = this.k.add([
            this.k.text(buttonText, { size: fontSize }),
            this.k.pos(pos.x, pos.y),
            this.k.anchor('center'),
            this.k.color(...textColor),
            this.k.z(1)
        ]);

        // Hover effects
        button.onHover(() => {
            button.color = this.k.rgb(...hoverColor);
            button.scale = this.k.vec2(1.05, 1.05);
            this.k.setCursor('pointer');
        });

        button.onHoverEnd(() => {
            button.color = this.k.rgb(...color);
            button.scale = this.k.vec2(1, 1);
            this.k.setCursor('default');
        });

        // Click handler
        button.onClick(onClick);

        // Store reference to label for updates
        button.label = label;

        // Update method for i18n changes
        if (useI18n && this.i18n) {
            button.updateText = () => {
                label.text = this.i18n.t(text);
            };
        }

        return button;
    }

    /**
     * Create a modal dialog
     * @param {string} title - Modal title or i18n key
     * @param {string} message - Modal message or i18n key
     * @param {Array} buttons - Array of {text, onClick} objects
     * @param {Object} options - Modal options
     * @returns {Object} Modal container
     */
    createModal(title, message, buttons = [], options = {}) {
        const {
            width = 400,
            height = 300,
            useI18n = true
        } = options;

        const modalObjs = [];

        // Overlay
        const overlay = this.k.add([
            this.k.rect(this.k.width(), this.k.height()),
            this.k.pos(0, 0),
            this.k.color(...this.theme.overlay),
            this.k.z(100),
            this.k.opacity(0.7)
        ]);
        modalObjs.push(overlay);

        // Modal background
        const modal = this.k.add([
            this.k.rect(width, height, { radius: 15 }),
            this.k.pos(this.k.center()),
            this.k.anchor('center'),
            this.k.color(...this.theme.background),
            this.k.z(101),
            this.k.outline(4, this.k.rgb(...this.theme.primary))
        ]);
        modalObjs.push(modal);

        // Title
        const titleText = (useI18n && this.i18n) ? this.i18n.t(title) : title;
        const titleObj = this.k.add([
            this.k.text(titleText, { size: 32, font: 'sans-serif' }),
            this.k.pos(this.k.center().sub(0, height / 2 - 50)),
            this.k.anchor('center'),
            this.k.color(...this.theme.text),
            this.k.z(102)
        ]);
        modalObjs.push(titleObj);

        // Message
        const messageText = (useI18n && this.i18n) ? this.i18n.t(message) : message;
        const messageObj = this.k.add([
            this.k.text(messageText, { size: 20, width: width - 40, align: 'center' }),
            this.k.pos(this.k.center().sub(0, 20)),
            this.k.anchor('center'),
            this.k.color(...this.theme.text),
            this.k.z(102)
        ]);
        modalObjs.push(messageObj);

        // Buttons
        const buttonY = this.k.center().y + height / 2 - 60;
        const buttonSpacing = 220;
        const startX = this.k.center().x - ((buttons.length - 1) * buttonSpacing) / 2;

        buttons.forEach((btn, index) => {
            const buttonPos = { x: startX + index * buttonSpacing, y: buttonY };
            const button = this.createButton(buttonPos, btn.text, () => {
                // Close modal
                modalObjs.forEach(obj => this.k.destroy(obj));
                // Execute callback
                if (btn.onClick) btn.onClick();
            }, { width: 180, height: 50, fontSize: 20, useI18n });

            modalObjs.push(button, button.label);
        });

        return {
            objects: modalObjs,
            close: () => modalObjs.forEach(obj => this.k.destroy(obj))
        };
    }

    /**
     * Create a progress bar
     * @param {Object} pos - Position {x, y}
     * @param {Object} options - Progress bar options
     * @returns {Object} Progress bar object with update() method
     */
    createProgressBar(pos, options = {}) {
        const {
            width = 200,
            height = 20,
            maxValue = 100,
            currentValue = 0,
            color = this.theme.success,
            backgroundColor = [80, 80, 80],
            showText = true
        } = options;

        // Background
        const bg = this.k.add([
            this.k.rect(width, height, { radius: 10 }),
            this.k.pos(pos.x, pos.y),
            this.k.color(...backgroundColor),
            this.k.outline(2, this.k.rgb(200, 200, 200))
        ]);

        // Progress fill
        const progress = this.k.add([
            this.k.rect((currentValue / maxValue) * width, height, { radius: 10 }),
            this.k.pos(pos.x, pos.y),
            this.k.color(...color),
            this.k.z(1)
        ]);

        // Text label (optional)
        let label = null;
        if (showText) {
            label = this.k.add([
                this.k.text(`${currentValue}/${maxValue}`, { size: 16 }),
                this.k.pos(pos.x + width / 2, pos.y + height / 2),
                this.k.anchor('center'),
                this.k.color(...this.theme.text),
                this.k.z(2)
            ]);
        }

        return {
            bg,
            progress,
            label,
            update: (newValue) => {
                const percent = Math.max(0, Math.min(1, newValue / maxValue));
                progress.width = percent * width;
                if (label) {
                    label.text = `${Math.floor(newValue)}/${maxValue}`;
                }
            }
        };
    }

    /**
     * Create a star rating display
     * @param {Object} pos - Position {x, y}
     * @param {number} stars - Number of stars (0-3)
     * @param {Object} options - Star options
     * @returns {Object} Star display with update() method
     */
    createStars(pos, stars = 0, options = {}) {
        const {
            maxStars = 3,
            size = 50,
            spacing = 60,
            filledColor = [255, 215, 0],      // Gold
            emptyColor = [150, 150, 150]       // Gray
        } = options;

        const starObjs = [];

        for (let i = 0; i < maxStars; i++) {
            const x = pos.x + i * spacing;
            const isFilled = i < stars;
            const color = isFilled ? filledColor : emptyColor;

            const star = this.k.add([
                this.k.text('⭐', { size }),
                this.k.pos(x, pos.y),
                this.k.color(...color),
                this.k.anchor('center')
            ]);

            starObjs.push(star);
        }

        return {
            stars: starObjs,
            update: (newStars) => {
                starObjs.forEach((star, i) => {
                    const isFilled = i < newStars;
                    const color = isFilled ? filledColor : emptyColor;
                    star.color = this.k.rgb(...color);
                });
            }
        };
    }

    /**
     * Create a simple menu
     * @param {Array} items - Array of {text, onClick} menu items
     * @param {Object} options - Menu options
     * @returns {Object} Menu container
     */
    createMenu(items, options = {}) {
        const {
            startY = this.k.center().y - (items.length * 80) / 2,
            spacing = 80,
            useI18n = true
        } = options;

        const menuObjs = [];

        items.forEach((item, index) => {
            const y = startY + index * spacing;
            const button = this.createButton(
                { x: this.k.center().x, y },
                item.text,
                item.onClick,
                { useI18n }
            );

            menuObjs.push(button, button.label);
        });

        return {
            objects: menuObjs,
            destroy: () => menuObjs.forEach(obj => this.k.destroy(obj))
        };
    }

    /**
     * Show a notification toast
     * @param {string} message - Message to show or i18n key
     * @param {Object} options - Toast options
     */
    showToast(message, options = {}) {
        const {
            duration = 2,
            position = 'top',    // 'top', 'center', 'bottom'
            color = this.theme.success,
            useI18n = true
        } = options;

        const text = (useI18n && this.i18n) ? this.i18n.t(message) : message;

        // Position mapping
        const positions = {
            top: { x: this.k.center().x, y: 80 },
            center: this.k.center(),
            bottom: { x: this.k.center().x, y: this.k.height() - 80 }
        };

        const pos = positions[position] || positions.top;

        // Create toast background
        const toast = this.k.add([
            this.k.rect(400, 60, { radius: 30 }),
            this.k.pos(pos.x, pos.y),
            this.k.anchor('center'),
            this.k.color(...color),
            this.k.z(200),
            this.k.opacity(0.9)
        ]);

        // Create toast text
        const toastText = this.k.add([
            this.k.text(text, { size: 20 }),
            this.k.pos(pos.x, pos.y),
            this.k.anchor('center'),
            this.k.color(...this.theme.text),
            this.k.z(201)
        ]);

        // Auto-destroy after duration
        this.k.wait(duration, () => {
            this.k.destroy(toast);
            this.k.destroy(toastText);
        });
    }

    /**
     * Create a countdown timer display
     * @param {Object} pos - Position {x, y}
     * @param {number} seconds - Starting seconds
     * @param {Function} onFinish - Callback when timer reaches 0
     * @param {Object} options - Timer options
     * @returns {Object} Timer object with pause/resume methods
     */
    createTimer(pos, seconds, onFinish, options = {}) {
        const {
            fontSize = 48,
            color = this.theme.text,
            warningColor = this.theme.warning,
            dangerColor = this.theme.danger,
            warningThreshold = 10,
            dangerThreshold = 5
        } = options;

        let timeLeft = seconds;
        let paused = false;

        const timer = this.k.add([
            this.k.text(`${Math.ceil(timeLeft)}`, { size: fontSize }),
            this.k.pos(pos.x, pos.y),
            this.k.anchor('center'),
            this.k.color(...color)
        ]);

        timer.onUpdate(() => {
            if (paused) return;

            timeLeft -= this.k.dt();

            // Update text
            timer.text = `${Math.ceil(Math.max(0, timeLeft))}`;

            // Update color based on time left
            if (timeLeft <= dangerThreshold) {
                timer.color = this.k.rgb(...dangerColor);
            } else if (timeLeft <= warningThreshold) {
                timer.color = this.k.rgb(...warningColor);
            }

            // Finish
            if (timeLeft <= 0) {
                timeLeft = 0;
                paused = true;
                if (onFinish) onFinish();
            }
        });

        return {
            timer,
            pause: () => { paused = true; },
            resume: () => { paused = false; },
            getTimeLeft: () => timeLeft,
            addTime: (amount) => { timeLeft += amount; }
        };
    }

    /**
     * Set custom theme colors
     * @param {Object} themeColors - Object with color definitions
     */
    setTheme(themeColors) {
        Object.assign(this.theme, themeColors);
    }
}
