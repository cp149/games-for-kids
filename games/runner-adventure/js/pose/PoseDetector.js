/**
 * Pose Detection Module
 * Handles MediaPipe pose detection and pose type management
 */

export class PoseDetector {
    constructor() {
        this.pose = null;
        this.isHandsUpPose = false;
        this.selectedPoseType = null;
        this.poseSelected = false;
        this.lastJumpTime = 0;
        this.JUMP_COOLDOWN = 300; // milliseconds
    }

    /**
     * Initialize MediaPipe Pose
     */
    init(onResultsCallback) {
        this.pose = new Pose({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
            }
        });

        // Detect device performance
        const isLowEndDevice = () => {
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const cores = navigator.hardwareConcurrency || 4;
            const memory = navigator.deviceMemory || 4;
            return isMobile || cores < 4 || memory < 4;
        };

        const useLiteModel = isLowEndDevice();

        this.pose.setOptions({
            modelComplexity: useLiteModel ? 0 : 1,
            smoothLandmarks: true,
            enableSegmentation: false,
            smoothSegmentation: false,
            minDetectionConfidence: useLiteModel ? 0.4 : 0.5,
            minTrackingConfidence: useLiteModel ? 0.4 : 0.5
        });

        console.log(`MediaPipe Pose initialized with ${useLiteModel ? 'lite' : 'standard'} model`);

        this.pose.onResults((results) => this.handleResults(results, onResultsCallback));
    }

    /**
     * Handle pose detection results
     */
    handleResults(results, callback) {
        if (!results.poseLandmarks) {
            this.isHandsUpPose = false;
            if (callback) callback(false);
            return;
        }

        const detected = this.detectPose(results.poseLandmarks);

        if (detected !== this.isHandsUpPose) {
            this.isHandsUpPose = detected;
            if (callback) callback(detected);
        }
    }

    /**
     * Detect one hand raised
     */
    detectOneHandUp(landmarks) {
        if (!landmarks || landmarks.length === 0) return false;

        const nose = landmarks[0];
        const leftEar = landmarks[7];
        const rightEar = landmarks[8];
        const leftWrist = landmarks[15];
        const rightWrist = landmarks[16];
        const leftShoulder = landmarks[11];
        const rightShoulder = landmarks[12];
        const leftElbow = landmarks[13];
        const rightElbow = landmarks[14];

        if (!leftWrist || !rightWrist || !nose || !leftShoulder || !rightShoulder) {
            return false;
        }

        const headLevel = (leftEar && rightEar) ? Math.min(leftEar.y, rightEar.y, nose.y) : nose.y;

        const leftHandRaised =
            leftWrist.y < headLevel &&
            leftWrist.y < leftShoulder.y - 0.2 &&
            (leftElbow ? leftWrist.y < leftElbow.y : true);

        const rightHandRaised =
            rightWrist.y < headLevel &&
            rightWrist.y < rightShoulder.y - 0.2 &&
            (rightElbow ? rightWrist.y < rightElbow.y : true);

        return (leftHandRaised && !rightHandRaised) || (!leftHandRaised && rightHandRaised);
    }

    /**
     * Detect arms spread (T-pose)
     */
    detectArmsSpread(landmarks) {
        if (!landmarks || landmarks.length === 0) return false;

        const leftWrist = landmarks[15];
        const rightWrist = landmarks[16];
        const leftShoulder = landmarks[11];
        const rightShoulder = landmarks[12];

        if (!leftWrist || !rightWrist || !leftShoulder || !rightShoulder) {
            return false;
        }

        const shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x);
        const bodyCenter = (leftShoulder.x + rightShoulder.x) / 2;

        const leftArmSpread = Math.abs(leftWrist.x - bodyCenter) > shoulderWidth * 0.8;
        const rightArmSpread = Math.abs(rightWrist.x - bodyCenter) > shoulderWidth * 0.8;
        const leftAtShoulderHeight = Math.abs(leftWrist.y - leftShoulder.y) < 0.15;
        const rightAtShoulderHeight = Math.abs(rightWrist.y - rightShoulder.y) < 0.15;

        return leftArmSpread && rightArmSpread && leftAtShoulderHeight && rightAtShoulderHeight;
    }

    /**
     * Detect one leg raised
     */
    detectOneLegRaised(landmarks) {
        if (!landmarks || landmarks.length === 0) return false;

        const leftHip = landmarks[23];
        const rightHip = landmarks[24];
        const leftKnee = landmarks[25];
        const rightKnee = landmarks[26];

        if (!leftHip || !rightHip || !leftKnee || !rightKnee) {
            return false;
        }

        const hipLevel = (leftHip.y + rightHip.y) / 2;
        const leftKneeRaised = leftKnee.y < hipLevel - 0.1;
        const rightKneeRaised = rightKnee.y < hipLevel - 0.1;

        return leftKneeRaised || rightKneeRaised;
    }

    /**
     * Detect hands on head
     */
    detectHandsOnHead(landmarks) {
        if (!landmarks || landmarks.length === 0) return false;

        const nose = landmarks[0];
        const leftEar = landmarks[7];
        const rightEar = landmarks[8];
        const leftWrist = landmarks[15];
        const rightWrist = landmarks[16];
        const leftShoulder = landmarks[11];
        const rightShoulder = landmarks[12];

        if (!leftWrist || !rightWrist || !nose || !leftShoulder || !rightShoulder || !leftEar || !rightEar) {
            return false;
        }

        const leftHandUp = leftWrist.y < leftShoulder.y;
        const rightHandUp = rightWrist.y < rightShoulder.y;
        if (!leftHandUp || !rightHandUp) return false;

        const headTop = Math.min(nose.y, leftEar.y, rightEar.y);
        const leftAtHeadLevel = leftWrist.y < headTop + 0.1 && leftWrist.y > headTop - 0.15;
        const rightAtHeadLevel = rightWrist.y < headTop + 0.1 && rightWrist.y > headTop - 0.15;
        if (!leftAtHeadLevel || !rightAtHeadLevel) return false;

        const headWidth = Math.abs(leftEar.x - rightEar.x);
        const leftNearHead = Math.abs(leftWrist.x - leftEar.x) < headWidth * 0.6;
        const rightNearHead = Math.abs(rightWrist.x - rightEar.x) < headWidth * 0.6;

        return leftNearHead && rightNearHead;
    }

    /**
     * Master detection function
     */
    detectPose(landmarks) {
        if (!this.selectedPoseType) return false;

        switch(this.selectedPoseType) {
            case 'one-hand':
                return this.detectOneHandUp(landmarks);
            case 'arms-spread':
                return this.detectArmsSpread(landmarks);
            case 'one-leg':
                return this.detectOneLegRaised(landmarks);
            case 'hands-up':
                return this.detectHandsOnHead(landmarks);
            default:
                return false;
        }
    }

    /**
     * Set pose type
     */
    setPoseType(type) {
        this.selectedPoseType = type;
        this.poseSelected = true;
    }

    /**
     * Get pose description
     */
    getPoseDescription() {
        if (!this.selectedPoseType) return 'No pose selected';

        switch(this.selectedPoseType) {
            case 'one-hand':
                return '🙋 Raise One Hand';
            case 'arms-spread':
                return '🔀 Spread Arms';
            case 'one-leg':
                return '🦩 Raise One Leg';
            case 'hands-up':
                return '🤦 Hands On Head';
            default:
                return 'Unknown pose';
        }
    }

    /**
     * Check if can jump with cooldown
     */
    canJump() {
        const now = Date.now();
        if (this.isHandsUpPose && (now - this.lastJumpTime > this.JUMP_COOLDOWN)) {
            this.lastJumpTime = now;
            return true;
        }
        return false;
    }

    /**
     * Send frame to pose detector
     */
    async processFrame(videoElement) {
        if (this.pose) {
            await this.pose.send({image: videoElement});
        }
    }
}
