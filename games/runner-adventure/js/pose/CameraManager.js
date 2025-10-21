/**
 * Camera Manager
 * Handles camera initialization and control for pose detection
 */

export class CameraManager {
    constructor(videoElement, poseDetector) {
        this.videoElement = videoElement;
        this.poseDetector = poseDetector;
        this.camera = null;
        this.cameraActive = false;
    }

    /**
     * Check if device is low-end
     */
    isLowEndDevice() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const cores = navigator.hardwareConcurrency || 4;
        const memory = navigator.deviceMemory || 4;
        return isMobile || cores < 4 || memory < 4;
    }

    /**
     * Start camera
     */
    async start() {
        try {
            if (!this.poseDetector.pose) {
                this.poseDetector.init();
            }

            // Frame rate throttling
            let lastFrameTime = 0;
            const frameInterval = 1000 / 15; // 15 FPS

            const videoConfig = this.isLowEndDevice() ?
                { width: 480, height: 360 } :
                { width: 640, height: 480 };

            this.camera = new Camera(this.videoElement, {
                onFrame: async () => {
                    if (this.poseDetector.pose && this.cameraActive) {
                        const now = Date.now();
                        if (now - lastFrameTime >= frameInterval) {
                            lastFrameTime = now;
                            await this.poseDetector.processFrame(this.videoElement);
                        }
                    }
                },
                width: videoConfig.width,
                height: videoConfig.height,
                facingMode: 'user'
            });

            await this.camera.start();
            this.cameraActive = true;
            this.videoElement.style.display = 'block';

            // Dispatch event
            window.dispatchEvent(new CustomEvent('cameraStarted'));

            console.log('Camera started successfully');
            return true;
        } catch (error) {
            console.error('Error starting camera:', error);
            return false;
        }
    }

    /**
     * Stop camera
     */
    stop() {
        if (this.camera) {
            this.camera.stop();
            this.camera = null;
        }
        this.cameraActive = false;
        this.videoElement.style.display = 'none';
    }

    /**
     * Toggle camera
     */
    async toggle() {
        if (this.cameraActive) {
            this.stop();
            return false;
        } else {
            return await this.start();
        }
    }

    /**
     * Check if camera is active
     */
    isActive() {
        return this.cameraActive;
    }
}
