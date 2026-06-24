/**
 * TTS - Text-to-Speech module using Web Speech API
 * Provides English pronunciation for words and sentences
 */

export class TTS {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voice = null;
        this.ready = false;
        this._initVoice();
    }

    /**
     * Find the best English voice available on the device.
     * Prefers: Google US English > any en-US > any en-*
     */
    _initVoice() {
        const loadVoices = () => {
            const voices = this.synth.getVoices();
            if (voices.length === 0) return;

            // Priority: Google US > native US > any English
            this.voice =
                voices.find(v => v.name.includes('Google') && v.lang.startsWith('en-US')) ||
                voices.find(v => v.lang === 'en-US') ||
                voices.find(v => v.lang.startsWith('en-')) ||
                voices.find(v => v.lang.startsWith('en')) ||
                null;

            this.ready = true;
        };

        // Voices may load async on some browsers
        loadVoices();
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = loadVoices;
        }
    }

    /**
     * Speak a word or short phrase in English
     * @param {string} text - The English text to speak
     * @param {object} options - { rate: 0.8, pitch: 1.0 }
     */
    speak(text, options = {}) {
        if (!this.synth || !text) return;

        // Cancel any ongoing speech
        this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = options.rate || 0.75; // Slower for learners
        utterance.pitch = options.pitch || 1.0;
        utterance.volume = 1.0;

        if (this.voice) {
            utterance.voice = this.voice;
        }

        this.synth.speak(utterance);
    }

    /**
     * Speak a word slowly (for vocabulary learning)
     * @param {string} word
     */
    speakWord(word) {
        this.speak(word, { rate: 0.6 });
    }

    /**
     * Speak a sentence at normal-slow pace
     * @param {string} sentence
     */
    speakSentence(sentence) {
        this.speak(sentence, { rate: 0.7 });
    }

    /**
     * Speak word twice: once slow, once normal
     * @param {string} word
     */
    speakWordTwice(word) {
        if (!this.synth || !word) return;
        this.synth.cancel();

        const slow = new SpeechSynthesisUtterance(word);
        slow.lang = 'en-US';
        slow.rate = 0.5;
        slow.pitch = 1.0;
        if (this.voice) slow.voice = this.voice;

        const normal = new SpeechSynthesisUtterance(word);
        normal.lang = 'en-US';
        normal.rate = 0.8;
        normal.pitch = 1.0;
        if (this.voice) normal.voice = this.voice;

        this.synth.speak(slow);
        this.synth.speak(normal);
    }

    /**
     * Check if TTS is available on this device
     * @returns {boolean}
     */
    isAvailable() {
        return 'speechSynthesis' in window;
    }

    /**
     * Stop any current speech
     */
    stop() {
        if (this.synth) {
            this.synth.cancel();
        }
    }
}
