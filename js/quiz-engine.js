/**
 * QuizEngine - Multi-type quiz system for vocabulary and comprehension testing
 *
 * Supports four quiz types: Chinese-to-English, English-to-Chinese, mixed, and
 * unit review. Each quiz is 10 questions with auto-generated distractors from
 * the same unit. Awards stars based on correct answers.
 */
export class QuizEngine {
    /**
     * @param {object} storage - Persistence layer for vocab data, quiz history, stars
     * @param {object} ui      - UI helper (toasts, celebrations)
     * @param {object} router  - SPA router for screen navigation
     */
    constructor(storage, ui, router) {
        this.storage = storage;
        this.ui = ui;
        this.router = router;

        // Session state
        this.quizType = null;         // Current quiz type identifier
        this.questions = [];          // Array of generated question objects
        this.currentIndex = 0;        // Current question position
        this.score = 0;               // Correct answers count
        this.mistakes = [];           // { question, selectedIndex, correctIndex }
        this.answered = false;        // Whether current question has been answered

        this._bindEvents();
    }

    /* ──────────────────────── Event Binding ──────────────────────────────── */

    _bindEvents() {
        const backBtn = document.getElementById('quizSessionBack');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.router.navigate('main'));
        }

        const btnHome = document.getElementById('btnBackHome');
        if (btnHome) {
            btnHome.addEventListener('click', () => {
                this.router.navigate('main');
                // Switch to home tab
                const homeTab = document.querySelector('[data-tab="home"]');
                if (homeTab) homeTab.click();
            });
        }

        const btnReview = document.getElementById('btnReviewMistakes');
        if (btnReview) {
            btnReview.addEventListener('click', () => this._showMistakeReview());
        }
    }

    /* ──────────────────────── Tab Rendering ──────────────────────────────── */

    /**
     * Render the quiz type selection cards in the main quiz tab.
     */
    renderTab() {
        const container = document.getElementById('quizContainer');
        if (!container) return;

        const quizTypes = [
            {
                type: 'vocab-cn2en',
                icon: '📝',
                title: '看中选英',
                desc: '看中文，选英文单词',
            },
            {
                type: 'vocab-en2cn',
                icon: '📖',
                title: '看英选中',
                desc: '看英文，选中文意思',
            },
            {
                type: 'mixed',
                icon: '🔀',
                title: '综合测验',
                desc: '混合题型，全面测试',
            },
            {
                type: 'unit-review',
                icon: '📊',
                title: '单元测试',
                desc: '复习已学单元',
            },
        ];

        // Show recent quiz stats
        const stats = this.storage.getStats();
        let html = `<div class="quiz-stats-mini">
                        📊 已完成 <strong>${stats.quizCount || 0}</strong> 次测验
                    </div>`;

        html += '<div class="quiz-type-grid">';
        quizTypes.forEach(qt => {
            html += `<div class="quiz-type-card" data-quiz-type="${qt.type}">
                        <div class="quiz-type-icon">${qt.icon}</div>
                        <div class="quiz-type-title">${qt.title}</div>
                        <div class="quiz-type-desc">${qt.desc}</div>
                     </div>`;
        });
        html += '</div>';

        container.innerHTML = html;

        // Bind click handlers
        container.querySelectorAll('.quiz-type-card').forEach(card => {
            card.addEventListener('click', () => {
                this.startQuiz(card.dataset.quizType);
            });
        });
    }

    /* ──────────────────────── Quiz Lifecycle ─────────────────────────────── */

    /**
     * Start a quiz of the given type.
     * @param {string} type - 'vocab-cn2en' | 'vocab-en2cn' | 'unit-review' | 'mixed'
     */
    startQuiz(type) {
        this.quizType = type;
        this.currentIndex = 0;
        this.score = 0;
        this.mistakes = [];
        this.answered = false;

        // Generate 10 questions
        this.questions = this._generateQuestions(type, 10);

        if (this.questions.length === 0) {
            this.ui.showToast('还没有学过足够的单词，先去背单词吧 📚');
            return;
        }

        this.router.navigate('quiz-session');
        this._updateSessionProgress();
        this.showQuestion();
    }

    /**
     * Display the current question.
     */
    showQuestion() {
        if (this.currentIndex >= this.questions.length) {
            this.showResult();
            return;
        }

        this.answered = false;
        const q = this.questions[this.currentIndex];
        const body = document.getElementById('quizSessionBody');
        if (!body) return;

        // Build question UI
        let html = `<div class="quiz-question">
                        <div class="quiz-prompt">${q.prompt}</div>
                        <div class="quiz-options">`;

        q.options.forEach((opt, i) => {
            html += `<button class="quiz-option" data-index="${i}">
                        <span class="quiz-option-letter">${String.fromCharCode(65 + i)}</span>
                        <span class="quiz-option-text">${opt}</span>
                     </button>`;
        });

        html += `   </div>
                 </div>`;

        body.innerHTML = html;

        // Bind option clicks
        body.querySelectorAll('.quiz-option').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!this.answered) {
                    this.handleAnswer(parseInt(btn.dataset.index, 10));
                }
            });
        });

        this._updateSessionProgress();
    }

    /**
     * Handle the user selecting an answer.
     * @param {number} selectedIndex - Index of the selected option (0-3)
     */
    handleAnswer(selectedIndex) {
        if (this.answered) return;
        this.answered = true;

        const q = this.questions[this.currentIndex];
        const isCorrect = selectedIndex === q.correctIndex;

        // Highlight correct and wrong options
        const body = document.getElementById('quizSessionBody');
        const options = body.querySelectorAll('.quiz-option');

        options.forEach((opt, i) => {
            opt.classList.add('disabled');
            if (i === q.correctIndex) {
                opt.classList.add('correct');
            }
            if (i === selectedIndex && !isCorrect) {
                opt.classList.add('wrong');
            }
        });

        // Show explanation
        const explanationHtml = `<div class="quiz-explanation ${isCorrect ? 'correct' : 'wrong'}">
            ${isCorrect ? '✅ 回答正确！' : `❌ 正确答案是 ${String.fromCharCode(65 + q.correctIndex)}`}
            <div class="quiz-explanation-detail">${q.explanation || ''}</div>
        </div>`;
        body.insertAdjacentHTML('beforeend', explanationHtml);

        if (isCorrect) {
            this.score++;
        } else {
            this.mistakes.push({
                question: q,
                selectedIndex,
                correctIndex: q.correctIndex,
            });
        }

        // Update live score
        const scoreEl = document.getElementById('quizSessionScore');
        if (scoreEl) scoreEl.textContent = `${this.score} 分`;

        // Auto-advance after 1.5s, or allow click to advance
        const nextBtn = document.createElement('button');
        nextBtn.className = 'quiz-next-btn';
        nextBtn.textContent = '下一题 →';
        nextBtn.addEventListener('click', () => {
            this.currentIndex++;
            this.showQuestion();
        });
        body.appendChild(nextBtn);

        // Also auto-advance
        this._autoAdvanceTimer = setTimeout(() => {
            if (this.currentIndex < this.questions.length - 1 || this.currentIndex === this.questions.length - 1) {
                this.currentIndex++;
                this.showQuestion();
            }
        }, 3000);
    }

    /**
     * Show the final quiz result screen.
     */
    showResult() {
        // Clear any pending auto-advance
        if (this._autoAdvanceTimer) clearTimeout(this._autoAdvanceTimer);

        const total = this.questions.length;
        const pct = Math.round((this.score / total) * 100);

        // Award stars (1 per correct answer)
        this.storage.addStars(this.score);

        // Save quiz result
        this.storage.saveQuizResult({
            type: this.quizType,
            score: this.score,
            total,
            pct,
            mistakes: this.mistakes.length,
            date: new Date().toISOString(),
        });

        // Record study day
        this.storage.recordStudyDay();

        // Navigate to result screen
        this.router.navigate('quiz-result');

        // Emoji and title based on score
        let emoji, title;
        if (pct === 100) {
            emoji = '🏆';
            title = '满分！完美！';
        } else if (pct >= 80) {
            emoji = '🌟';
            title = '非常棒！';
        } else if (pct >= 60) {
            emoji = '👍';
            title = '还不错！';
        } else {
            emoji = '💪';
            title = '继续加油！';
        }

        const emojiEl = document.getElementById('quizResultEmoji');
        const titleEl = document.getElementById('quizResultTitle');
        const scoreNum = document.getElementById('scoreNumber');
        const detailEl = document.getElementById('quizResultDetail');

        if (emojiEl) emojiEl.textContent = emoji;
        if (titleEl) titleEl.textContent = title;
        if (scoreNum) scoreNum.textContent = `${this.score}/${total}`;
        if (detailEl) {
            detailEl.innerHTML = `
                <p>正确率：${pct}%</p>
                <p>获得 ⭐ ${this.score} 颗星星</p>
                ${this.mistakes.length > 0 ? `<p>错题 ${this.mistakes.length} 道，点击下方复习</p>` : '<p>全部正确，一道都没错！🎉</p>'}
            `;
        }

        // Show/hide review mistakes button
        const reviewBtn = document.getElementById('btnReviewMistakes');
        if (reviewBtn) {
            if (this.mistakes.length > 0) {
                this.ui.showElement(reviewBtn);
            } else {
                this.ui.hideElement(reviewBtn);
            }
        }

        // Dispatch completion event for mission tracking
        document.dispatchEvent(new CustomEvent('quiz-session-complete'));
    }

    /* ──────────────────── Question Generation ────────────────────────────── */

    /**
     * Generate an array of quiz questions.
     * @param {string} type  - Quiz type
     * @param {number} count - Number of questions to generate
     * @returns {Array} Array of question objects
     */
    _generateQuestions(type, count) {
        const vocabData = this.storage.getVocabData();
        const wordStates = this.storage.getWordStates();

        // Collect all studied words (words that have state)
        const studiedWords = [];
        Object.values(vocabData).forEach(unitWords => {
            unitWords.forEach(word => {
                if (wordStates[word.id]) {
                    studiedWords.push(word);
                }
            });
        });

        if (studiedWords.length < 4) return []; // Need at least 4 for options

        const shuffled = this._shuffle(studiedWords);
        const selected = shuffled.slice(0, Math.min(count, shuffled.length));
        const questions = [];

        selected.forEach(word => {
            let questionType = type;
            // For mixed type, randomly choose
            if (type === 'mixed') {
                questionType = Math.random() > 0.5 ? 'vocab-cn2en' : 'vocab-en2cn';
            }
            // unit-review behaves like mixed
            if (type === 'unit-review') {
                questionType = Math.random() > 0.5 ? 'vocab-cn2en' : 'vocab-en2cn';
            }

            const q = this._createVocabQuestion(word, studiedWords, questionType);
            if (q) questions.push(q);
        });

        return questions;
    }

    /**
     * Create a single vocabulary question with 4 options.
     * @param {object} targetWord   - The word being tested
     * @param {Array}  allWords     - Pool of all words for generating distractors
     * @param {string} type         - 'vocab-cn2en' or 'vocab-en2cn'
     * @returns {object|null} Question object
     */
    _createVocabQuestion(targetWord, allWords, type) {
        // Get distractors: prefer same unit, fall back to any
        const sameUnit = allWords.filter(w => w.unit === targetWord.unit && w.id !== targetWord.id);
        const others = allWords.filter(w => w.id !== targetWord.id);
        const pool = sameUnit.length >= 3 ? sameUnit : others;
        const distractors = this._shuffle(pool).slice(0, 3);

        if (distractors.length < 3) return null;

        if (type === 'vocab-cn2en') {
            // Prompt: Chinese meaning → select the English word
            const options = this._shuffle([
                targetWord.english,
                ...distractors.map(d => d.english),
            ]);
            return {
                prompt: `"${targetWord.chinese}" 的英文是？`,
                options,
                correctIndex: options.indexOf(targetWord.english),
                explanation: `${targetWord.english} ${targetWord.phonetic || ''} — ${targetWord.chinese}`,
                word: targetWord,
            };
        } else {
            // Prompt: English word → select the Chinese meaning
            const options = this._shuffle([
                targetWord.chinese,
                ...distractors.map(d => d.chinese),
            ]);
            return {
                prompt: `"${targetWord.english}" 的意思是？`,
                options,
                correctIndex: options.indexOf(targetWord.chinese),
                explanation: `${targetWord.english} ${targetWord.phonetic || ''} — ${targetWord.chinese}`,
                word: targetWord,
            };
        }
    }

    /* ──────────────────── Mistake Review ─────────────────────────────────── */

    /**
     * Show a detailed review of all mistakes from the current quiz.
     */
    _showMistakeReview() {
        const body = document.getElementById('quizResultDetail');
        if (!body) return;

        let html = '<div class="mistake-review"><h3>📋 错题回顾</h3>';
        this.mistakes.forEach((m, i) => {
            const q = m.question;
            html += `<div class="mistake-item">
                        <div class="mistake-num">第 ${i + 1} 题</div>
                        <div class="mistake-prompt">${q.prompt}</div>
                        <div class="mistake-your-answer wrong">
                            你的答案：${q.options[m.selectedIndex]}
                        </div>
                        <div class="mistake-correct-answer correct">
                            正确答案：${q.options[m.correctIndex]}
                        </div>
                        <div class="mistake-explanation">${q.explanation}</div>
                     </div>`;
        });
        html += '</div>';

        body.innerHTML = html;

        // Hide the review button since we're already showing it
        const reviewBtn = document.getElementById('btnReviewMistakes');
        if (reviewBtn) this.ui.hideElement(reviewBtn);
    }

    /* ─────────────────────── Helpers ─────────────────────────────────────── */

    /**
     * Update the quiz session progress bar and text.
     */
    _updateSessionProgress() {
        const total = this.questions.length;
        const current = this.currentIndex + 1;
        const pct = Math.round((this.currentIndex / total) * 100);

        const progressText = document.getElementById('quizSessionProgressText');
        const progressBar = document.getElementById('quizSessionProgressBar');
        const scoreEl = document.getElementById('quizSessionScore');

        if (progressText) progressText.textContent = `${current} / ${total}`;
        if (progressBar) progressBar.style.width = `${pct}%`;
        if (scoreEl) scoreEl.textContent = `${this.score} 分`;
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
