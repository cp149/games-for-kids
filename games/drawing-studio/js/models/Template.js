/**
 * Drawing Studio - Coloring Template Model
 */

export class Template {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.category = data.category || 'animals';
        this.difficulty = data.difficulty || 1;
        this.imagePath = data.imagePath;
        this.thumbnail = data.thumbnail || data.imagePath;
    }

    /**
     * Load template SVG onto canvas
     * @param {HTMLCanvasElement} canvas
     * @returns {Promise<void>}
     */
    async loadToCanvas(canvas) {
        return new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = () => {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Fill white background
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Draw template centered
                const scale = Math.min(
                    canvas.width / img.width * 0.8,
                    canvas.height / img.height * 0.8
                );
                const x = (canvas.width - img.width * scale) / 2;
                const y = (canvas.height - img.height * scale) / 2;

                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
                resolve();
            };

            img.onerror = () => reject(new Error('Failed to load template'));
            img.src = this.imagePath;
        });
    }
}
