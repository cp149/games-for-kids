/**
 * ImageLoader - Handles loading images from various sources
 */
class ImageLoader {
    constructor() {
        this.currentImage = null;
        this.onImageLoaded = null;
        this.imageCache = new Map();
        this.cacheOrder = [];  // LRU tracking
        this.cacheMaxSize = CONFIG.IMAGE_LOADER.CACHE_MAX_SIZE;
        this.activeStream = null;  // Track active camera stream
        this.captureUI = null;  // Track capture UI for cleanup
        this.errorMessages = CONFIG.IMAGE_LOADER.ERROR_MESSAGES;
    }

    loadFromFile(file) {
        return new Promise((resolve, reject) => {
            if (!file.type.startsWith('image/')) {
                reject(new Error(this.errorMessages.NOT_IMAGE));
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
                    reject(new Error(this.errorMessages.LOAD_FAILED));
                };
                img.src = e.target.result;
            };

            reader.onerror = () => {
                reject(new Error(this.errorMessages.READ_FAILED));
            };

            reader.readAsDataURL(file);
        });
    }

    loadFromURL(url) {
        if (this.imageCache.has(url)) {
            const cachedImg = this.imageCache.get(url);
            this.currentImage = cachedImg;
            if (this.onImageLoaded) {
                this.onImageLoaded(cachedImg);
            }
            return Promise.resolve(cachedImg);
        }

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';

            img.onload = () => {
                this.addToCache(url, img);
                this.currentImage = img;
                if (this.onImageLoaded) {
                    this.onImageLoaded(img);
                }
                resolve(img);
            };

            img.onerror = () => {
                reject(new Error(this.errorMessages.URL_FAILED));
            };

            img.src = url;
        });
    }

    loadFromCamera() {
        return new Promise((resolve, reject) => {
            // Check if browser supports camera
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                reject(new Error(this.errorMessages.CAMERA_NOT_SUPPORTED));
                return;
            }

            // Cleanup any existing camera resources first
            this.cleanupCamera();

            // Create video element for camera preview
            const video = document.createElement('video');
            video.autoplay = true;
            video.playsInline = true;  // Important for iOS
            video.muted = true;  // Required for autoplay on iOS
            video.setAttribute('playsinline', '');  // iOS compatibility
            video.setAttribute('webkit-playsinline', '');  // Older iOS webkit prefix
            video.style.display = 'none';

            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    // Track active stream for cleanup
                    this.activeStream = stream;
                    video.srcObject = stream;

                    // Wait for video to be ready
                    video.onloadedmetadata = () => {
                        // Create capture button UI
                        this.captureUI = this.createCaptureUI(video, stream);
                        document.body.appendChild(this.captureUI);

                        // Return promise that resolves when photo is taken
                        resolve(new Promise((resolveCapture, rejectCapture) => {
                            this.captureUI.querySelector('.capture-btn').onclick = () => {
                                const img = this.captureFromVideo(video);
                                this.cleanupCamera();
                                this.currentImage = img;
                                if (this.onImageLoaded) {
                                    this.onImageLoaded(img);
                                }
                                resolveCapture(img);
                            };

                            this.captureUI.querySelector('.cancel-btn').onclick = () => {
                                this.cleanupCamera();
                                rejectCapture(new Error(this.errorMessages.CAMERA_CANCELLED));
                            };
                        }));
                    };

                    // Handle video error
                    video.onerror = () => {
                        this.cleanupCamera();
                        reject(new Error(this.errorMessages.VIDEO_ERROR));
                    };
                })
                .catch(err => {
                    this.cleanupCamera();
                    reject(new Error(this.errorMessages.CAMERA_ACCESS_DENIED + ': ' + err.message));
                });
        });
    }

    // Cleanup camera resources
    cleanupCamera() {
        if (this.activeStream) {
            this.activeStream.getTracks().forEach(track => track.stop());
            this.activeStream = null;
        }
        if (this.captureUI) {
            this.captureUI.remove();
            this.captureUI = null;
        }
    }

    createCaptureUI(video, stream) {
        // Use CSS classes instead of inline styles (styles defined in styles.css)
        const container = document.createElement('div');
        container.className = 'camera-capture-ui';

        video.style.display = 'block';

        const controls = document.createElement('div');
        controls.className = 'camera-controls';

        const captureBtn = document.createElement('button');
        captureBtn.className = 'capture-btn';
        captureBtn.textContent = '📸 Capture';

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'cancel-btn';
        cancelBtn.textContent = '❌ Cancel';

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

    // Add to cache with LRU eviction
    addToCache(url, img) {
        // If already exists, remove to update order
        if (this.imageCache.has(url)) {
            this.imageCache.delete(url);
            const index = this.cacheOrder.indexOf(url);
            if (index > -1) {
                this.cacheOrder.splice(index, 1);
            }
        }

        // Add new entry
        this.imageCache.set(url, img);
        this.cacheOrder.push(url);

        // Evict oldest if over capacity
        while (this.cacheOrder.length > this.cacheMaxSize) {
            const oldestUrl = this.cacheOrder.shift();
            this.imageCache.delete(oldestUrl);
        }
    }

    // Cleanup all resources
    destroy() {
        this.cleanupCamera();
        this.imageCache.clear();
        this.cacheOrder = [];
        this.currentImage = null;
        this.onImageLoaded = null;
    }
}
