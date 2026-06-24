/**
 * VocabLearner - Flashcard-based vocabulary learning with SM-2 spaced repetition
 * 
 * Provides a complete flashcard experience: unit selection, word list with mastery status,
 * flip-to-reveal cards, and spaced repetition scheduling via the SM-2 algorithm.
 */
export class VocabLearner {
    /**
     * @param {object} storage - Persistence layer for vocab data, word states, stars, etc.
     * @param {object} ui      - UI helper (toasts, celebrations, show/hide elements)
     * @param {object} router  - SPA router for screen navigation
     */
    constructor(storage, ui, router) {
        this.storage = storage;
        this.ui = ui;
        this.router = router;

        // Current session state
        this.currentWords = [];      // Words queued for this session
        this.currentIndex = 0;       // Position in the queue
        this.sessionResults = [];    // { wordId, quality } for each response
        this.isFlipped = false;      // Whether the current card is showing the answer
        this.selectedUnitId = null;  // Currently selected unit in the tab view
        this.isReviewMode = false;   // true when doing cross-unit review

        this._bindEvents();
    }

    /* ──────────────────────────── Event Binding ──────────────────────────── */

    /**
     * Bind all static DOM elements once on construction.
     */
    _bindEvents() {
        // Back button on learn screen
        const backBtn = document.getElementById('vocabLearnBack');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.router.navigate('main');
            });
        }

        // Flashcard flip
        const flashcard = document.getElementById('flashcard');
        if (flashcard) {
            flashcard.addEventListener('click', () => this._flipCard());
        }

        // Response buttons
        const btnForgot = document.getElementById('btnForgot');
        const btnFuzzy = document.getElementById('btnFuzzy');
        const btnKnown = document.getElementById('btnKnown');

        if (btnForgot) btnForgot.addEventListener('click', () => this.handleResponse(0));
        if (btnFuzzy) btnFuzzy.addEventListener('click', () => this.handleResponse(3));
        if (btnKnown) btnKnown.addEventListener('click', () => this.handleResponse(5));

        // Audio button - speak word again
        const btnAudio = document.getElementById('btnPlayWord');
        if (btnAudio) {
            btnAudio.addEventListener('click', (e) => {
                e.stopPropagation(); // Don't flip card
                const word = this.currentWords[this.currentIndex];
                if (word && window.tts) {
                    window.tts.speakWordTwice(word.english);
                }
            });
        }
    }

    /* ─────────────────────────── Tab Rendering ───────────────────────────── */

    /**
     * Render the vocab tab on the main screen.
     * Shows a horizontal unit selector at the top and a word list below
     * with mastery indicators (✅ mastered, 🔄 learning, ⬜ new).
     */
    renderTab() {
        const vocabData = this.storage.getVocabData();
        const wordStates = this.storage.getWordStates();
        const unitIds = Object.keys(vocabData);

        // Default to first unit if none selected
        if (!this.selectedUnitId || !vocabData[this.selectedUnitId]) {
            this.selectedUnitId = unitIds[0] || null;
        }

        const container = document.getElementById('vocabContainer');
        if (!container) return;

        // ── Unit Selector (horizontal scrollable) ──
        const unitNames = {
            remedial: '补习词汇',
            unit1: '第一单元',
            unit2: '第二单元',
            unit3: '第三单元',
            unit4: '第四单元',
            unit5: '第五单元',
            unit6: '第六单元',
            unit7: '第七单元',
            unit8: '第八单元',
            unit9: '第九单元',
            unit10: '第十单元',
            unit11: '第十一单元',
            unit12: '第十二单元',
        };

        let html = '<div class="unit-selector">';
        unitIds.forEach(uid => {
            const active = uid === this.selectedUnitId ? 'active' : '';
            const label = unitNames[uid] || uid;
            const progress = this._getUnitProgress(vocabData[uid], wordStates);
            html += `<button class="unit-chip ${active}" data-unit="${uid}">
                        ${label}
                        <span class="unit-chip-pct">${progress}%</span>
                     </button>`;
        });
        html += '</div>';

        // ── Review button (if there are due words) ──
        const dueCount = this._getDueWords(vocabData, wordStates).length;
        if (dueCount > 0) {
            html += `<button class="review-banner" id="btnStartReview">
                        🔄 有 ${dueCount} 个单词需要复习
                     </button>`;
        }

        // ── Word list for selected unit ──
        const unitWords = vocabData[this.selectedUnitId] || [];
        html += '<div class="word-list">';
        unitWords.forEach(word => {
            const state = wordStates[word.id];
            const status = this._getMasteryIcon(state);
            html += `<div class="word-list-item" data-word-id="${word.id}">
                        <span class="word-status">${status}</span>
                        <span class="word-english">${word.english}</span>
                        <span class="word-chinese">${word.chinese}</span>
                     </div>`;
        });
        html += '</div>';

        // ── Start learning button ──
        html += `<button class="btn-start-unit" id="btnStartUnit">
                    📚 开始学习本单元
                 </button>`;

        container.innerHTML = html;

        // ── Attach dynamic event listeners ──
        container.querySelectorAll('.unit-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                this.selectedUnitId = chip.dataset.unit;
                this.renderTab();
            });
        });

        const startBtn = document.getElementById('btnStartUnit');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startUnit(this.selectedUnitId));
        }

        const reviewBtn = document.getElementById('btnStartReview');
        if (reviewBtn) {
            reviewBtn.addEventListener('click', () => this.startReview());
        }
    }

    /* ─────────────────────── Session Lifecycle ────────────────────────────── */

    /**
     * Start learning words from a specific unit.
     * Picks up to 8 words: prioritises due-for-review, then fills with new words.
     * @param {string} unitId
     */
    startUnit(unitId) {
        const vocabData = this.storage.getVocabData();
        const unitWords = vocabData[unitId];
        if (!unitWords || unitWords.length === 0) {
            this.ui.showToast('该单元暂无单词');
            return;
        }

        this.isReviewMode = false;
        const wordStates = this.storage.getWordStates();
        const now = Date.now();

        // Split into due / new
        const due = [];
        const newWords = [];
        unitWords.forEach(w => {
            const s = wordStates[w.id];
            if (!s) {
                newWords.push(w);
            } else if (new Date(s.nextReview).getTime() <= now) {
                due.push(w);
            }
        });

        // Mix: due first, then fill with new, up to 8
        this.currentWords = [...this._shuffle(due), ...this._shuffle(newWords)].slice(0, 8);

        if (this.currentWords.length === 0) {
            this.ui.showToast('本单元所有单词已掌握，太棒了！🎉');
            return;
        }

        this.currentIndex = 0;
        this.sessionResults = [];

        // Update unit name label
        const unitNameEl = document.getElementById('learnUnitName');
        if (unitNameEl) {
            const names = { remedial: '补习词汇' };
            unitNameEl.textContent = names[unitId] || `第${unitId.replace('unit', '')}单元`;
        }

        this.router.navigate('vocab-learn');
        this.showNextCard();
    }

    /**
     * Start a review session of words due across all units.
     * Picks up to 10 due words.
     */
    startReview() {
        const vocabData = this.storage.getVocabData();
        const wordStates = this.storage.getWordStates();
        const dueWords = this._getDueWords(vocabData, wordStates);

        if (dueWords.length === 0) {
            this.ui.showToast('暂无需要复习的单词 👍');
            return;
        }

        this.isReviewMode = true;
        this.currentWords = this._shuffle(dueWords).slice(0, 10);
        this.currentIndex = 0;
        this.sessionResults = [];

        const unitNameEl = document.getElementById('learnUnitName');
        if (unitNameEl) unitNameEl.textContent = '复习模式';

        this.router.navigate('vocab-learn');
        this.showNextCard();
    }

    /* ─────────────────────── Flashcard Display ───────────────────────────── */

    /**
     * Display the next flashcard in the queue (front side: English word).
     */
    showNextCard() {
        if (this.currentIndex >= this.currentWords.length) {
            this.showComplete();
            return;
        }

        const word = this.currentWords[this.currentIndex];
        this.isFlipped = false;

        // Reset card to front
        const inner = document.getElementById('flashcardInner');
        if (inner) inner.classList.remove('flipped');

        // Populate front side
        const wordEnglish = document.getElementById('wordEnglish');
        const wordPhonetic = document.getElementById('wordPhonetic');
        if (wordEnglish) wordEnglish.textContent = word.english;
        if (wordPhonetic) wordPhonetic.textContent = word.phonetic || '';

        // Populate back side
        const wordChinese = document.getElementById('wordChinese');
        const wordPos = document.getElementById('wordPos');
        const exampleEn = document.getElementById('exampleEn');
        const exampleCn = document.getElementById('exampleCn');
        if (wordChinese) wordChinese.textContent = word.chinese;
        if (wordPos) wordPos.textContent = word.partOfSpeech || '';
        if (exampleEn) exampleEn.textContent = word.exampleEn || '';
        if (exampleCn) exampleCn.textContent = word.exampleCn || '';

        // Hide response buttons until card is flipped
        this._setResponseButtonsVisible(false);

        // Progress indicator
        this._updateProgress();

        // Auto-speak the word
        if (window.tts) {
            setTimeout(() => window.tts.speakWord(word.english), 300);
        }
    }

    /**
     * Flip the card to reveal the answer and show response buttons.
     */
    _flipCard() {
        if (this.isFlipped) return; // Already flipped, wait for response
        this.isFlipped = true;

        const inner = document.getElementById('flashcardInner');
        if (inner) inner.classList.add('flipped');

        // Speak the example sentence when flipped
        const word = this.currentWords[this.currentIndex];
        if (word && word.exampleEn && window.tts) {
            setTimeout(() => window.tts.speakSentence(word.exampleEn), 400);
        }

        this._setResponseButtonsVisible(true);
    }

    /* ──────────────────────── Response Handling ──────────────────────────── */

    /**
     * Handle the user's self-assessed response quality.
     * @param {number} quality - 0 = forgot, 3 = fuzzy, 5 = known
     */
    handleResponse(quality) {
        if (!this.isFlipped) return; // Ignore if card hasn't been flipped

        const word = this.currentWords[this.currentIndex];
        const wordStates = this.storage.getWordStates();
        const currentState = wordStates[word.id] || this._defaultWordState(word.id);

        // Calculate next review via SM-2
        const newState = this.calculateNextReview({ ...currentState }, quality);
        this.storage.saveWordState(word.id, newState);

        // Record session result
        this.sessionResults.push({ wordId: word.id, quality });

        // Brief feedback toast
        if (quality === 5) {
            this.ui.showToast('掌握了！👏');
        } else if (quality === 3) {
            this.ui.showToast('快记住了，继续加油 💪');
        } else {
            this.ui.showToast('没关系，多看几次就会了 😊');
        }

        // Record today as a study day
        this.storage.recordStudyDay();

        // Advance to next card
        this.currentIndex++;
        // Small delay so the user sees the toast before card changes
        setTimeout(() => this.showNextCard(), 400);
    }

    /* ──────────────────────── SM-2 Algorithm ─────────────────────────────── */

    /**
     * SM-2 spaced repetition scheduling.
     *
     * @param {object} wordState - Current state of the word
     * @param {number} quality   - User response quality (0–5)
     * @returns {object} Updated word state with new interval, easeFactor, nextReview
     */
    calculateNextReview(wordState, quality) {
        let { easeFactor, interval, repetitions } = wordState;

        if (quality === 0) {
            // Forgot: reset progress
            repetitions = 0;
            interval = 1; // Review again tomorrow
        } else if (quality === 3) {
            // Fuzzy: slight progress
            repetitions += 1;
            interval = Math.max(interval, 1) + 1;
        } else if (quality >= 4) {
            // Known: advance normally
            if (repetitions === 0) {
                interval = 1;
            } else if (repetitions === 1) {
                interval = 6;
            } else {
                interval = Math.round(interval * easeFactor);
            }
            repetitions += 1;
        }

        // Update ease factor: EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
        const qDiff = 5 - quality;
        easeFactor = easeFactor + (0.1 - qDiff * (0.08 + qDiff * 0.02));
        if (easeFactor < 1.3) easeFactor = 1.3; // Floor at 1.3

        // Schedule next review date
        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + interval);

        return {
            wordId: wordState.wordId,
            easeFactor,
            interval,
            repetitions,
            nextReview: nextReview.toISOString(),
            lastQuality: quality,
        };
    }

    /* ──────────────────── Session Complete Summary ───────────────────────── */

    /**
     * Show the learning-complete summary with stars earned.
     */
    showComplete() {
        const knownCount = this.sessionResults.filter(r => r.quality === 5).length;
        const fuzzyCount = this.sessionResults.filter(r => r.quality === 3).length;
        const total = this.sessionResults.length;

        // Stars: 2 per known, 1 per fuzzy
        const stars = knownCount * 2 + fuzzyCount;
        this.storage.addStars(stars);

        // Build emoji and title based on performance
        let emoji, title, text;
        const ratio = knownCount / total;
        if (ratio >= 0.8) {
            emoji = '🌟';
            title = '太棒了！';
            text = `你掌握了 ${knownCount}/${total} 个单词，获得 ${stars} 颗星星！`;
        } else if (ratio >= 0.5) {
            emoji = '👍';
            title = '不错哦！';
            text = `掌握 ${knownCount} 个，模糊 ${fuzzyCount} 个。获得 ${stars} 颗星星，继续加油！`;
        } else {
            emoji = '💪';
            title = '继续努力！';
            text = `这次掌握了 ${knownCount} 个，别灰心，多复习几次就好了！获得 ${stars} 颗星星。`;
        }

        // Dispatch completion event for mission tracking
        const eventName = this.isReviewMode ? 'review-session-complete' : 'vocab-session-complete';
        document.dispatchEvent(new CustomEvent(eventName));

        this.ui.showCelebration(emoji, title, text, () => {
            this.router.navigate('main');
            this.renderTab();
        });
    }

    /* ─────────────────────────── Helpers ──────────────────────────────────── */

    /**
     * Create a default word state for a word that has never been studied.
     * @param {string} wordId
     * @returns {object}
     */
    _defaultWordState(wordId) {
        return {
            wordId,
            easeFactor: 2.5,
            interval: 0,
            repetitions: 0,
            nextReview: new Date(0).toISOString(), // Epoch — immediately due
            lastQuality: 0,
        };
    }

    /**
     * Get all words that are due for review across all units.
     * @returns {Array} Array of word objects
     */
    _getDueWords(vocabData, wordStates) {
        const now = Date.now();
        const due = [];
        Object.values(vocabData).forEach(unitWords => {
            unitWords.forEach(word => {
                const state = wordStates[word.id];
                if (state && state.repetitions > 0 && new Date(state.nextReview).getTime() <= now) {
                    due.push(word);
                }
            });
        });
        return due;
    }

    /**
     * Calculate unit progress percentage (mastered / total * 100).
     * @param {Array} unitWords
     * @param {object} wordStates
     * @returns {number}
     */
    _getUnitProgress(unitWords, wordStates) {
        if (!unitWords || unitWords.length === 0) return 0;
        const mastered = unitWords.filter(w => {
            const s = wordStates[w.id];
            return s && s.repetitions >= 3 && s.lastQuality >= 4;
        }).length;
        return Math.round((mastered / unitWords.length) * 100);
    }

    /**
     * Determine the mastery icon for a word.
     * @param {object|undefined} state
     * @returns {string} Emoji indicator
     */
    _getMasteryIcon(state) {
        if (!state) return '⬜'; // New
        if (state.repetitions >= 3 && state.lastQuality >= 4) return '✅'; // Mastered
        return '🔄'; // Learning
    }

    /**
     * Show/hide the response buttons (forgot / fuzzy / known).
     * @param {boolean} visible
     */
    _setResponseButtonsVisible(visible) {
        const btns = [
            document.getElementById('btnForgot'),
            document.getElementById('btnFuzzy'),
            document.getElementById('btnKnown'),
        ];
        btns.forEach(btn => {
            if (!btn) return;
            if (visible) {
                this.ui.showElement(btn);
            } else {
                this.ui.hideElement(btn);
            }
        });
    }

    /**
     * Update the progress bar and text for the current session.
     */
    _updateProgress() {
        const total = this.currentWords.length;
        const current = this.currentIndex + 1;
        const pct = Math.round((this.currentIndex / total) * 100);

        const progressText = document.getElementById('learnProgressText');
        const progressBar = document.getElementById('learnProgressBar');
        if (progressText) progressText.textContent = `${current} / ${total}`;
        if (progressBar) progressBar.style.width = `${pct}%`;
    }

    /**
     * Shuffle an array (Fisher-Yates).
     * @param {Array} arr
     * @returns {Array} Shuffled copy
     */
    _shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }
}
