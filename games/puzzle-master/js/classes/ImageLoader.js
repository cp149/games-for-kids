/**
 * ImageLoader - Handles loading images from various sources
 */
class ImageLoader {
    constructor() {
        this.currentImage = null;
        this.onImageLoaded = null;
    }

    loadFromFile(file) {
        return new Promise((resolve, reject) => {
            if (!file.type.startsWith('image/')) {
                reject(new Error('File is not an image'));
                return;
            }

            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    this.currentImage = img;
                    if (this.onImageLoaded) {
                        this.onImageLoaded(img);
                    }
                    resolve(img);
                };
                img.onerror = () => {
                    reject(new Error('Failed to load image'));
                };
                img.src = e.target.result;
            };

            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };

            reader.readAsDataURL(file);
        });
    }

    loadFromURL(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous'; // For external images

            img.onload = () => {
                this.currentImage = img;
                if (this.onImageLoaded) {
                    this.onImageLoaded(img);
                }
                resolve(img);
            };

            img.onerror = () => {
                reject(new Error('Failed to load image from URL'));
            };

            img.src = url;
        });
    }

    loadFromCamera() {
        return new Promise((resolve, reject) => {
            // Check if browser supports camera
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                reject(new Error('Camera not supported'));
                return;
            }

            // Create video element for camera preview
            const video = document.createElement('video');
            video.autoplay = true;
            video.style.display = 'none';

            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    video.srcObject = stream;

                    // Wait for video to be ready
                    video.onloadedmetadata = () => {
                        // Create capture button UI
                        const captureUI = this.createCaptureUI(video, stream);
                        document.body.appendChild(captureUI);

                        // Return promise that resolves when photo is taken
                        resolve(new Promise((resolveCapture, rejectCapture) => {
                            captureUI.querySelector('.capture-btn').onclick = () => {
                                const img = this.captureFromVideo(video);
                                stream.getTracks().forEach(track => track.stop());
                                captureUI.remove();
                                this.currentImage = img;
                                if (this.onImageLoaded) {
                                    this.onImageLoaded(img);
                                }
                                resolveCapture(img);
                            };

                            captureUI.querySelector('.cancel-btn').onclick = () => {
                                stream.getTracks().forEach(track => track.stop());
                                captureUI.remove();
                                rejectCapture(new Error('Camera capture cancelled'));
                            };
                        }));
                    };
                })
                .catch(err => {
                    reject(new Error('Camera access denied: ' + err.message));
                });
        });
    }

    createCaptureUI(video, stream) {
        const container = document.createElement('div');
        container.className = 'camera-capture-ui';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;

        video.style.display = 'block';
        video.style.maxWidth = '90%';
        video.style.maxHeight = '70vh';

        const controls = document.createElement('div');
        controls.style.cssText = 'margin-top: 20px; display: flex; gap: 20px;';

        const captureBtn = document.createElement('button');
        captureBtn.className = 'capture-btn';
        captureBtn.textContent = '📸 Capture';
        captureBtn.style.cssText = `
            padding: 15px 30px;
            font-size: 18px;
            cursor: pointer;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 8px;
        `;

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'cancel-btn';
        cancelBtn.textContent = '❌ Cancel';
        cancelBtn.style.cssText = `
            padding: 15px 30px;
            font-size: 18px;
            cursor: pointer;
            background: #f44336;
            color: white;
            border: none;
            border-radius: 8px;
        `;

        controls.appendChild(captureBtn);
        controls.appendChild(cancelBtn);

        container.appendChild(video);
        container.appendChild(controls);

        return container;
    }

    captureFromVideo(video) {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);

        const img = new Image();
        img.src = canvas.toDataURL('image/png');
        return img;
    }

    getCurrentImage() {
        return this.currentImage;
    }
}
