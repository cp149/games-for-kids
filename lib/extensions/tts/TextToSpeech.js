/**
 * TextToSpeech - Text-to-Speech wrapper for games
 *
 * Features:
 * - Browser-native Web Speech API
 * - Multi-language support (uses i18n keys)
 * - Voice customization (rate, pitch, volume)
 * - Queue management
 * - Auto language detection
 *
 * @example
 * const i18n = new SimpleI18n('en');
 * const tts = new TextToSpeech(i18n);
 * tts.speak('Hello World!');
 * tts.speakKey('welcome_message'); // Uses i18n translation
 */
export class TextToSpeech {
    /**
     * @param {Object} i18n - SimpleI18n instance for multi-language support
     * @param {Object} options - TTS configuration
     * @param {number} options.rate - Speech rate 0.1-10 (default: 1)
     * @param {number} options.pitch - Speech pitch 0-2 (default: 1)
     * @param {number} options.volume - Speech volume 0-1 (default: 1)
     * @param {string} options.voiceURI - Specific voice URI (optional)
     */
    constructor(i18n = null, options = {}) {
        this.i18n = i18n;
        this.enabled = true;

        // Check browser support
        if (!('speechSynthesis' in window)) {
            console.warn('Web Speech API not supported in this browser');
            this.enabled = false;
            return;
        }

        this.synth = window.speechSynthesis;
        this.voices = [];

        // Configuration
        this.rate = options.rate || 1;
        this.pitch = options.pitch || 1;
        this.volume = options.volume || 1;
        this.voiceURI = options.voiceURI || null;

        // Queue management
        this.queue = [];
        this.speaking = false;

        // Load voices (may take a moment on some browsers)
        this.loadVoices();

        // Chrome needs this event for voices to load
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => this.loadVoices();
        }
    }

    /**
     * Load available voices
     * @private
     */
    loadVoices() {
        this.voices = this.synth.getVoices();
    }

    /**
     * Get voice for current language
     * @param {string} lang - Language code (e.g., 'en', 'zh-CN', 'ja-JP')
     * @returns {SpeechSynthesisVoice|null} Best matching voice or null
     * @private
     */
    getVoiceForLanguage(lang) {
        if (this.voices.length === 0) {
            this.loadVoices();
        }

        // If specific voice URI is set, use it
        if (this.voiceURI) {
            const specificVoice = this.voices.find(v => v.voiceURI === this.voiceURI);
            if (specificVoice) return specificVoice;
        }

        // Map short codes to full language codes
        const langMap = {
            'en': 'en-US',
            'zh': 'zh-CN',
            'ja': 'ja-JP',
            'es': 'es-ES',
            'fr': 'fr-FR',
            'de': 'de-DE',
            'it': 'it-IT',
            'pt': 'pt-BR',
            'ru': 'ru-RU',
            'ko': 'ko-KR'
        };

        const fullLang = langMap[lang] || lang;

        // Find exact match
        let voice = this.voices.find(v => v.lang === fullLang);
        if (voice) return voice;

        // Find partial match (e.g., 'en' matches 'en-GB')
        voice = this.voices.find(v => v.lang.startsWith(lang));
        if (voice) return voice;

        // Return default voice
        return this.voices[0] || null;
    }

    /**
     * Speak text directly
     * @param {string} text - Text to speak
     * @param {string} lang - Language code (optional, uses i18n language if available)
     * @returns {Promise} Resolves when speech finishes
     */
    speak(text, lang = null) {
        if (!this.enabled || !text) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const utterance = new SpeechSynthesisUtterance(text);

            // Set language
            const targetLang = lang || (this.i18n ? this.i18n.getLanguage() : 'en');
            const voice = this.getVoiceForLanguage(targetLang);
            if (voice) {
                utterance.voice = voice;
                utterance.lang = voice.lang;
            }

            // Set properties
            utterance.rate = this.rate;
            utterance.pitch = this.pitch;
            utterance.volume = this.volume;

            // Event handlers
            utterance.onend = () => {
                this.speaking = false;
                this.processQueue();
                resolve();
            };

            utterance.onerror = (event) => {
                console.error('Speech synthesis error:', event);
                this.speaking = false;
                this.processQueue();
                reject(event);
            };

            // Speak
            this.synth.speak(utterance);
            this.speaking = true;
        });
    }

    /**
     * Speak translation key (uses i18n)
     * @param {string} key - Translation key
     * @param {...any} params - Parameters for translation
     * @returns {Promise} Resolves when speech finishes
     */
    speakKey(key, ...params) {
        if (!this.i18n) {
            console.warn('i18n not provided, cannot speak key:', key);
            return Promise.resolve();
        }

        const text = this.i18n.t(key, ...params);
        return this.speak(text);
    }

    /**
     * Add speech to queue
     * @param {string} text - Text to speak
     * @param {string} lang - Language code (optional)
     */
    enqueue(text, lang = null) {
        this.queue.push({ text, lang });
        if (!this.speaking) {
            this.processQueue();
        }
    }

    /**
     * Add translation key to queue
     * @param {string} key - Translation key
     * @param {...any} params - Parameters for translation
     */
    enqueueKey(key, ...params) {
        if (!this.i18n) return;
        const text = this.i18n.t(key, ...params);
        this.enqueue(text);
    }

    /**
     * Process speech queue
     * @private
     */
    processQueue() {
        if (this.queue.length === 0 || this.speaking) {
            return;
        }

        const { text, lang } = this.queue.shift();
        this.speak(text, lang);
    }

    /**
     * Stop current speech
     */
    stop() {
        if (this.enabled) {
            this.synth.cancel();
            this.speaking = false;
        }
    }

    /**
     * Clear queue and stop speech
     */
    clear() {
        this.queue = [];
        this.stop();
    }

    /**
     * Pause speech
     */
    pause() {
        if (this.enabled && this.speaking) {
            this.synth.pause();
        }
    }

    /**
     * Resume speech
     */
    resume() {
        if (this.enabled && this.synth.paused) {
            this.synth.resume();
        }
    }

    /**
     * Enable TTS
     */
    enable() {
        this.enabled = true;
    }

    /**
     * Disable TTS
     */
    disable() {
        this.enabled = false;
        this.clear();
    }

    /**
     * Toggle TTS on/off
     * @returns {boolean} New enabled state
     */
    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            this.clear();
        }
        return this.enabled;
    }

    /**
     * Check if TTS is enabled
     * @returns {boolean} True if enabled
     */
    isEnabled() {
        return this.enabled;
    }

    /**
     * Set speech rate
     * @param {number} rate - Speech rate 0.1-10 (1 = normal)
     */
    setRate(rate) {
        this.rate = Math.max(0.1, Math.min(10, rate));
    }

    /**
     * Set speech pitch
     * @param {number} pitch - Speech pitch 0-2 (1 = normal)
     */
    setPitch(pitch) {
        this.pitch = Math.max(0, Math.min(2, pitch));
    }

    /**
     * Set speech volume
     * @param {number} volume - Volume 0-1 (1 = max)
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    /**
     * Get available voices
     * @returns {SpeechSynthesisVoice[]} Array of available voices
     */
    getVoices() {
        if (this.voices.length === 0) {
            this.loadVoices();
        }
        return this.voices;
    }

    /**
     * Get voices for specific language
     * @param {string} lang - Language code
     * @returns {SpeechSynthesisVoice[]} Matching voices
     */
    getVoicesForLanguage(lang) {
        const voices = this.getVoices();
        return voices.filter(v => v.lang.startsWith(lang));
    }

    /**
     * Set specific voice by URI
     * @param {string} voiceURI - Voice URI from getVoices()
     */
    setVoice(voiceURI) {
        this.voiceURI = voiceURI;
    }
}
