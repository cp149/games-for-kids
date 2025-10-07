/**
 * Template Selector UI
 */

import { Template } from '../models/Template.js';
import { TEMPLATES } from '../data/templates.js';

export class TemplateSelector {
    constructor() {
        this.container = null;
        this.templates = TEMPLATES.map(data => new Template(data));
        this.onSelectCallback = null;
    }

    /**
     * Create selector UI
     * @returns {HTMLElement}
     */
    create() {
        this.container = document.createElement('div');
        this.container.id = 'template-selector';
        this.container.className = 'template-selector hidden';

        const header = document.createElement('div');
        header.className = 'template-header';
        header.innerHTML = '<h2>🎨 Choose a Template</h2>';
        this.container.appendChild(header);

        const grid = document.createElement('div');
        grid.className = 'template-grid';

        this.templates.forEach(template => {
            const card = this.createTemplateCard(template);
            grid.appendChild(card);
        });

        this.container.appendChild(grid);

        const closeBtn = document.createElement('button');
        closeBtn.className = 'template-close-btn';
        closeBtn.innerHTML = '✕';
        closeBtn.onclick = () => this.hide();
        this.container.appendChild(closeBtn);

        return this.container;
    }

    /**
     * Create template card
     * @param {Template} template
     * @returns {HTMLElement}
     */
    createTemplateCard(template) {
        const card = document.createElement('div');
        card.className = 'template-card';

        const img = document.createElement('img');
        img.src = template.thumbnail;
        img.alt = template.name;
        card.appendChild(img);

        const name = document.createElement('div');
        name.className = 'template-name';
        name.textContent = template.name;
        card.appendChild(name);

        card.onclick = () => this.selectTemplate(template);

        return card;
    }

    /**
     * Select template
     * @param {Template} template
     */
    selectTemplate(template) {
        if (this.onSelectCallback) {
            this.onSelectCallback(template);
        }
        this.hide();
    }

    show() {
        if (this.container) {
            this.container.classList.remove('hidden');
        }
    }

    hide() {
        if (this.container) {
            this.container.classList.add('hidden');
        }
    }

    onSelect(callback) {
        this.onSelectCallback = callback;
    }
}
