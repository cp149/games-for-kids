/**
 * Magic Selector - Modal for selecting magic brush effect
 */

import { EffectFactory } from '../tools/effects/EffectFactory.js';

export class MagicSelector {
    constructor() {
        this.element = null;
        this.onSelectCallback = null;
        this.selectedEffect = 'rainbow';
    }

    /**
     * Create magic selector modal
     */
    create() {
        const modal = document.createElement('div');
        modal.className = 'magic-selector hidden';
        modal.id = 'magic-selector';

        // Get all effects from factory
        const effects = EffectFactory.getAllEffectInfo();

        // Generate magic cards HTML
        const cardsHTML = effects.map(effect => `
            <div class="magic-card" data-effect="${effect.id}">
                <div class="magic-icon">${effect.icon}</div>
                <div class="magic-name">${effect.name}</div>
                <div class="magic-desc">${effect.description}</div>
            </div>
        `).join('');

        modal.innerHTML = `
            <div class="magic-selector-content">
                <button class="magic-close-btn" id="magic-close-btn">×</button>

                <div class="magic-header">
                    <h2>✨ Choose Magic Effect</h2>
                    <p class="magic-subtitle">Select a magical brush style</p>
                </div>

                <div class="magic-grid">
                    ${cardsHTML}
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
        const closeBtn = this.element.querySelector('#magic-close-btn');
        closeBtn.addEventListener('click', () => this.hide());

        // Click outside to close
        this.element.addEventListener('click', (e) => {
            if (e.target === this.element) {
                this.hide();
            }
        });

        // Magic cards
        const cards = this.element.querySelectorAll('.magic-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const effect = card.dataset.effect;
                this.selectEffect(effect);
            });
        });
    }

    /**
     * Select an effect
     */
    selectEffect(effect) {
        this.selectedEffect = effect;

        // Update active state
        const cards = this.element.querySelectorAll('.magic-card');
        cards.forEach(card => {
            card.classList.toggle('active', card.dataset.effect === effect);
        });

        // Trigger callback
        if (this.onSelectCallback) {
            this.onSelectCallback(effect);
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
        const cards = this.element.querySelectorAll('.magic-card');
        cards.forEach(card => {
            card.classList.toggle('active', card.dataset.effect === this.selectedEffect);
        });
    }

    /**
     * Hide the selector
     */
    hide() {
        this.element.classList.add('hidden');
    }

    /**
     * Set callback for effect selection
     */
    onSelect(callback) {
        this.onSelectCallback = callback;
    }

    /**
     * Get current effect
     */
    getSelectedEffect() {
        return this.selectedEffect;
    }
}
