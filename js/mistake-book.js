/**
 * MistakeBook - 错题本 & 弱词集中训练
 * 
 * 功能：
 * 1. 自动收集拼写错的、测验错的、翻卡片标记"不认识"的单词
 * 2. 提供集中强化训练（混合模式：拼写+选择+配对）
 * 3. 按错误次数排序，错得越多越优先复习
 * 4. 掌握后自动移出错题本
 */

export class MistakeBook {
    constructor(storage, ui, router) {
        this.storage = storage;
        this.ui = ui;
        this.router = router;
        this.currentWords = [];
        this.currentIndex = 0;
        this.score = 0;
        this.sessionResults = [];
        this._listenForMistakes();
    }

    /* ─────────────── Data Management ─────────────── */

    /**
     * 获取错题本数据
     * Format: { wordId: { word, wrongCount, lastWrong, source, mastered } }
     */
    getMistakes() {
        return this.storage._get('eb_mistakes') || {};
    }

    saveMistakes(data) {
        this.storage._set('eb_mistakes', data);
    }

    /**
     * 添加一个错词
     */
    addMistake(word, source = 'quiz') {
        const mistakes = this.getMistakes();
        if (mistakes[word.id]) {
            mistakes[word.id].wrongCount += 1;
            mistakes[word.id].lastWrong = new Date().toISOString();
            mistakes[word.id].source = source;
            mistakes[word.id].mastered = false;
        } else {
            mistakes[word.id] = {
                word: word,
                wrongCount: 1,
                lastWrong: new Date().toISOString(),
                source: source,
                mastered: false,
            };
        }
        this.saveMistakes(mistakes);
    }

    /**
     * 标记一个词为已掌握（从错题本移除）
     */
    markMastered(wordId) {
        const mistakes = this.getMistakes();
        if (mistakes[wordId]) {
            mistakes[wordId].mastered = true;
            mistakes[wordId].masteredAt = new Date().toISOString();
        }
        this.saveMistakes(mistakes);
    }

    /**
     * 获取未掌握的弱词列表（按错误次数降序）
     */
    getWeakWords() {
        const mistakes = this.getMistakes();
        return Object.values(mistakes)
            .filter(m => !m.mastered)
            .sort((a, b) => b.wrongCount - a.wrongCount);
    }

    /**
     * 获取错题本统计
     */
    getStats() {
        const mistakes = this.getMistakes();
        const all = Object.values(mistakes);
        const active = all.filter(m => !m.mastered);
        const mastered = all.filter(m => m.mastered);
        return {
            total: all.length,
            active: active.length,
            mastered: mastered.length,
        };
    }

    /* ─────────────── Auto-collect from events ─────────────── */

    _listenForMistakes() {
        // 收集测验错题
        document.addEventListener('quiz-mistake', (e) => {
            if (e.detail && e.detail.word) {
                this.addMistake(e.detail.word, 'quiz');
            }
        });

        // 收集拼写错题
        document.addEventListener('spelling-mistake', (e) => {
            if (e.detail && e.detail.word) {
                this.addMistake(e.detail.word, 'spelling');
            }
        });

        // 收集翻卡片"不认识"
        document.addEventListener('vocab-forgot', (e) => {
            if (e.detail && e.detail.word) {
                this.addMistake(e.detail.word, 'vocab');
            }
        });
    }

    /* ─────────────── Rendering ─────────────── */

    /**
     * 渲染错题本页面（在"我的"tab或单独入口）
     */
    renderBookView() {
        const container = document.getElementById('mistakeBookContainer');
        if (!container) return;

        const weakWords = this.getWeakWords();
        const stats = this.getStats();

        if (weakWords.length === 0) {
            container.innerHTML = `
                <div class="mistake-empty">
                    <div class="mistake-empty-emoji">🎉</div>
                    <h3>错题本是空的！</h3>
                    <p>太棒了，你把所有错词都掌握了！<br>继续学习，错题会自动收集到这里哦～</p>
                </div>
            `;
            return;
        }

        let html = `
            <div class="mistake-stats">
                <span class="mistake-stat">📕 待攻克: <strong>${stats.active}</strong></span>
                <span class="mistake-stat">✅ 已掌握: <strong>${stats.mastered}</strong></span>
            </div>
            <button class="btn btn-primary mistake-train-btn" id="btnMistakeTrain">
                🎯 集中训练 (${Math.min(weakWords.length, 10)} 词)
            </button>
            <div class="mistake-list">
        `;

        weakWords.slice(0, 30).forEach(m => {
            const sourceIcon = { quiz: '📝', spelling: '✍️', vocab: '🔤' }[m.source] || '📝';
            html += `
                <div class="mistake-list-item" data-word-id="${m.word.id}">
                    <div class="mistake-word-info">
                        <span class="mistake-en">${m.word.english}</span>
                        <span class="mistake-cn">${m.word.chinese}</span>
                    </div>
                    <div class="mistake-meta">
                        <span class="mistake-count">❌ ${m.wrongCount}次</span>
                        <span class="mistake-source">${sourceIcon}</span>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;

        // Bind train button
        document.getElementById('btnMistakeTrain')?.addEventListener('click', () => {
            this.startTraining();
        });

        // Bind individual word tap - speak pronunciation
        container.querySelectorAll('.mistake-list-item').forEach(item => {
            item.addEventListener('click', () => {
                const wordId = item.dataset.wordId;
                const mistake = this.getMistakes()[wordId];
                if (mistake && window.tts) {
                    window.tts.speakWord(mistake.word.english);
                }
            });
        });
    }

    /* ─────────────── Training Session ─────────────── */

    /**
     * 开始弱词集中训练
     * 混合模式：选择题 + 拼写
     */
    startTraining() {
        const weakWords = this.getWeakWords();
        if (weakWords.length === 0) {
            this.ui.showToast('没有需要训练的错词哦 🎉');
            return;
        }

        // Pick up to 10 weakest words
        this.currentWords = weakWords.slice(0, 10).map(m => m.word);
        this.currentIndex = 0;
        this.score = 0;
        this.sessionResults = [];

        this.router.navigate('mistake-train');
        this._renderTrainQuestion();
    }

    _renderTrainQuestion() {
        if (this.currentIndex >= this.currentWords.length) {
            this._renderTrainResult();
            return;
        }

        const container = document.getElementById('mistakeTrainContainer');
        if (!container) return;

        const word = this.currentWords[this.currentIndex];
        const allWords = this._getAllWordsPool();

        // Alternate between spelling and multiple choice
        const isSpelling = this.currentIndex % 3 === 2; // Every 3rd question is spelling

        if (isSpelling) {
            this._renderSpellingQuestion(container, word);
        } else {
            this._renderChoiceQuestion(container, word, allWords);
        }
    }

    _renderChoiceQuestion(container, word, allWords) {
        // Generate distractors
        const distractors = allWords
            .filter(w => w.id !== word.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        const options = [word.chinese, ...distractors.map(d => d.chinese)]
            .sort(() => Math.random() - 0.5);

        const correctIndex = options.indexOf(word.chinese);

        container.innerHTML = `
            <div class="mtrain-header">
                <button class="btn-back" id="mtrainBack">← 退出</button>
                <div class="mtrain-progress">
                    <span>${this.currentIndex + 1}/${this.currentWords.length}</span>
                    <div class="progress-bar-wrapper small">
                        <div class="progress-bar" style="width: ${((this.currentIndex + 1) / this.currentWords.length) * 100}%"></div>
                    </div>
                </div>
                <span class="mtrain-score">⭐ ${this.score}</span>
            </div>
            <div class="mtrain-body">
                <div class="mtrain-prompt">
                    <span class="mtrain-english">${word.english}</span>
                    <button class="btn-audio mtrain-audio" id="mtrainSpeak">🔊</button>
                </div>
                <p class="mtrain-hint">选出正确的中文意思</p>
                <div class="mtrain-options">
                    ${options.map((opt, i) => `
                        <button class="mtrain-option" data-index="${i}" data-correct="${i === correctIndex}">
                            <span class="mtrain-letter">${String.fromCharCode(65 + i)}</span>
                            <span>${opt}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        // Speak the word
        if (window.tts) {
            setTimeout(() => window.tts.speakWord(word.english), 300);
        }

        // Bind back
        document.getElementById('mtrainBack')?.addEventListener('click', () => {
            this.router.navigate('main');
        });

        // Bind audio
        document.getElementById('mtrainSpeak')?.addEventListener('click', () => {
            if (window.tts) window.tts.speakWord(word.english);
        });

        // Bind options
        container.querySelectorAll('.mtrain-option').forEach(btn => {
            btn.addEventListener('click', () => {
                this._handleChoiceAnswer(btn, word, correctIndex);
            });
        });
    }

    _handleChoiceAnswer(btn, word, correctIndex) {
        const selected = parseInt(btn.dataset.index);
        const isCorrect = selected === correctIndex;
        const container = document.getElementById('mistakeTrainContainer');

        // Disable all options
        container.querySelectorAll('.mtrain-option').forEach(opt => {
            opt.style.pointerEvents = 'none';
            if (parseInt(opt.dataset.index) === correctIndex) {
                opt.classList.add('correct');
            }
        });

        if (isCorrect) {
            btn.classList.add('correct');
            this.score += 2;
            this.sessionResults.push({ word, correct: true });
        } else {
            btn.classList.add('wrong');
            this.sessionResults.push({ word, correct: false });
            // Re-add mistake count
            this.addMistake(word, 'mistake-train');
        }

        // Next after delay
        setTimeout(() => {
            this.currentIndex++;
            this._renderTrainQuestion();
        }, isCorrect ? 800 : 1500);
    }

    _renderSpellingQuestion(container, word) {
        container.innerHTML = `
            <div class="mtrain-header">
                <button class="btn-back" id="mtrainBack">← 退出</button>
                <div class="mtrain-progress">
                    <span>${this.currentIndex + 1}/${this.currentWords.length}</span>
                    <div class="progress-bar-wrapper small">
                        <div class="progress-bar" style="width: ${((this.currentIndex + 1) / this.currentWords.length) * 100}%"></div>
                    </div>
                </div>
                <span class="mtrain-score">⭐ ${this.score}</span>
            </div>
            <div class="mtrain-body">
                <div class="mtrain-spelling-prompt">
                    <div class="mtrain-chinese">${word.chinese}</div>
                    <div class="mtrain-pos">${word.partOfSpeech || ''}</div>
                    <button class="btn-audio mtrain-audio" id="mtrainSpeak">🔊</button>
                </div>
                <p class="mtrain-hint">拼写出英文单词</p>
                <div class="mtrain-spell-input">
                    <input type="text" id="mtrainInput" placeholder="输入英文拼写..." 
                           autocomplete="off" autocapitalize="off" spellcheck="false">
                    <button class="btn btn-primary" id="mtrainSubmit">确定</button>
                </div>
                <div class="mtrain-feedback" id="mtrainFeedback"></div>
            </div>
        `;

        // Speak the word
        if (window.tts) {
            setTimeout(() => window.tts.speakWord(word.english), 300);
        }

        // Bind back
        document.getElementById('mtrainBack')?.addEventListener('click', () => {
            this.router.navigate('main');
        });

        // Bind audio
        document.getElementById('mtrainSpeak')?.addEventListener('click', () => {
            if (window.tts) window.tts.speakWord(word.english);
        });

        // Bind submit
        const input = document.getElementById('mtrainInput');
        const submitBtn = document.getElementById('mtrainSubmit');

        const submit = () => {
            const answer = input.value.trim().toLowerCase();
            if (!answer) return;
            this._handleSpellingAnswer(answer, word);
        };

        submitBtn?.addEventListener('click', submit);
        input?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') submit();
        });

        // Focus input
        setTimeout(() => input?.focus(), 400);
    }

    _handleSpellingAnswer(answer, word) {
        const isCorrect = answer === word.english.toLowerCase();
        const feedback = document.getElementById('mtrainFeedback');
        const input = document.getElementById('mtrainInput');

        if (isCorrect) {
            input.classList.add('correct');
            feedback.innerHTML = `<span class="spelling-feedback correct">✅ 正确！</span>`;
            this.score += 3; // Spelling worth more
            this.sessionResults.push({ word, correct: true });
        } else {
            input.classList.add('wrong');
            feedback.innerHTML = `
                <span class="spelling-feedback wrong">❌ 正确答案：</span>
                <span class="spelling-answer">${word.english}</span>
            `;
            this.sessionResults.push({ word, correct: false });
            this.addMistake(word, 'mistake-train');
        }

        // Next after delay
        setTimeout(() => {
            this.currentIndex++;
            this._renderTrainQuestion();
        }, isCorrect ? 1000 : 2000);
    }

    _renderTrainResult() {
        const container = document.getElementById('mistakeTrainContainer');
        if (!container) return;

        const correct = this.sessionResults.filter(r => r.correct).length;
        const total = this.sessionResults.length;
        const pct = Math.round((correct / total) * 100);

        // Mark words that were all correct as mastered
        const correctWordIds = this.sessionResults
            .filter(r => r.correct)
            .map(r => r.word.id);
        
        // Only mark mastered if they got it right AND their wrongCount was 1
        const mistakes = this.getMistakes();
        correctWordIds.forEach(wid => {
            if (mistakes[wid] && mistakes[wid].wrongCount <= 1) {
                this.markMastered(wid);
            } else if (mistakes[wid]) {
                // Reduce wrong count for correct answers
                mistakes[wid].wrongCount = Math.max(0, mistakes[wid].wrongCount - 1);
            }
        });
        this.saveMistakes(mistakes);

        // Add stars
        this.storage.addStars(this.score);
        this.storage.recordStudyDay();

        let emoji, title;
        if (pct >= 90) { emoji = '🏆'; title = '太厉害了！'; }
        else if (pct >= 70) { emoji = '🎉'; title = '进步很大！'; }
        else if (pct >= 50) { emoji = '💪'; title = '继续加油！'; }
        else { emoji = '📚'; title = '多练几次就好了！'; }

        container.innerHTML = `
            <div class="mtrain-result">
                <div class="mtrain-result-emoji">${emoji}</div>
                <h2>${title}</h2>
                <div class="mtrain-result-stats">
                    <div class="mtrain-result-stat">
                        <span class="mtrain-stat-value">${correct}/${total}</span>
                        <span class="mtrain-stat-label">正确率</span>
                    </div>
                    <div class="mtrain-result-stat">
                        <span class="mtrain-stat-value">⭐ ${this.score}</span>
                        <span class="mtrain-stat-label">获得星星</span>
                    </div>
                </div>
                <div class="mtrain-result-words">
                    <h3>本次训练单词</h3>
                    ${this.sessionResults.map(r => `
                        <div class="mtrain-word-row ${r.correct ? 'correct' : 'wrong'}">
                            <span>${r.correct ? '✅' : '❌'}</span>
                            <span class="mtrain-word-en">${r.word.english}</span>
                            <span class="mtrain-word-cn">${r.word.chinese}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="mtrain-result-actions">
                    <button class="btn btn-secondary" id="mtrainAgain">🔄 再练一轮</button>
                    <button class="btn btn-primary" id="mtrainHome">🏠 返回</button>
                </div>
            </div>
        `;

        // Bind actions
        document.getElementById('mtrainAgain')?.addEventListener('click', () => {
            this.startTraining();
        });
        document.getElementById('mtrainHome')?.addEventListener('click', () => {
            this.router.navigate('main');
        });

        // Dispatch event
        document.dispatchEvent(new CustomEvent('mistake-train-complete', {
            detail: { score: this.score, correct, total }
        }));
    }

    /* ─────────────── Helpers ─────────────── */

    _getAllWordsPool() {
        const vocabData = this.storage.getVocabData();
        const allWords = [];
        Object.values(vocabData).forEach(unitWords => {
            unitWords.forEach(w => allWords.push(w));
        });
        return allWords;
    }
}
