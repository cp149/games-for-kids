/**
 * Drawing Studio - History Manager
 * Manages undo/redo functionality using canvas snapshots
 */

export class HistoryManager {
    constructor(maxStates = 10) {
        this.maxStates = maxStates;
        this.states = [];
        this.currentIndex = -1;
    }

    /**
     * Save current canvas state
     * @param {HTMLCanvasElement} canvas
     */
    saveState(canvas) {
        // Remove any states after current index (if we undid and then drew)
        if (this.currentIndex < this.states.length - 1) {
            this.states = this.states.slice(0, this.currentIndex + 1);
        }

        // Save canvas as data URL
        const dataURL = canvas.toDataURL();
        this.states.push(dataURL);

        // Update index
        this.currentIndex++;

        // Limit number of states (remove oldest if needed)
        if (this.states.length > this.maxStates) {
            this.states.shift();
            this.currentIndex--; // Adjust index after removing oldest state
        }

        console.log(`State saved. Total states: ${this.states.length}, Current index: ${this.currentIndex}`);
    }

    /**
     * Check if undo is available
     * @returns {boolean}
     */
    canUndo() {
        return this.currentIndex > 0;
    }

    /**
     * Check if redo is available
     * @returns {boolean}
     */
    canRedo() {
        return this.currentIndex < this.states.length - 1;
    }

    /**
     * Undo to previous state
     * @param {HTMLCanvasElement} canvas
     * @param {CanvasRenderingContext2D} ctx
     * @returns {Promise<boolean>}
     */
    async undo(canvas, ctx) {
        if (!this.canUndo()) {
            console.log('Cannot undo - at oldest state');
            return false;
        }

        this.currentIndex--;
        await this.restoreState(canvas, ctx, this.currentIndex);
        console.log(`Undid to state ${this.currentIndex}`);
        return true;
    }

    /**
     * Redo to next state
     * @param {HTMLCanvasElement} canvas
     * @param {CanvasRenderingContext2D} ctx
     * @returns {Promise<boolean>}
     */
    async redo(canvas, ctx) {
        if (!this.canRedo()) {
            console.log('Cannot redo - at newest state');
            return false;
        }

        this.currentIndex++;
        await this.restoreState(canvas, ctx, this.currentIndex);
        console.log(`Redid to state ${this.currentIndex}`);
        return true;
    }

    /**
     * Restore a specific state
     * @param {HTMLCanvasElement} canvas
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} index
     * @returns {Promise<void>}
     */
    async restoreState(canvas, ctx, index) {
        const dataURL = this.states[index];

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                resolve();
            };
            img.onerror = reject;
            img.src = dataURL;
        });
    }

    /**
     * Clear all history
     */
    clear() {
        this.states = [];
        this.currentIndex = -1;
        console.log('History cleared');
    }

    /**
     * Get current state info
     * @returns {{totalStates: number, currentIndex: number, canUndo: boolean, canRedo: boolean}}
     */
    getStateInfo() {
        return {
            totalStates: this.states.length,
            currentIndex: this.currentIndex,
            canUndo: this.canUndo(),
            canRedo: this.canRedo()
        };
    }
}
