/**
 * SpellingPractice - 拼写练习模块
 * 
 * 根据中文提示拼写英文单词。支持渐进式提示、TTS发音、
 * 星星奖励系统，以及错误重试机制。
 */
export class SpellingPractice {
    /**
     * @param {object} storage - 数据持久层 (词汇数据、单词状态、星星等)
     * @param {object} ui      - UI工具 (toast、庆祝动画等)
     * @param {object} router  - SPA路由 (屏幕切换)
     */
    constructor(storage, ui, router) {
        this.storage = storage;
        this.ui = ui;
        this.router = router;

        // 当前会话状态
        this.currentWords = [];       // 本轮待拼写的单词
        this.currentIndex = 0;        // 当前进度
        this.hintLevel = 0;           // 当前提示级别 (0=无提示)
        this.attempt = 0;             // 当前尝试次数 (1=首次, 2=重试)
        this.sessionStars = 0;        // 本轮已获星星
        this.results = [];            // 每个单词的结果 { word, stars, attempts }
    }

    /* ──────────────────────────── 会话生命周期 ──────────────────────────── */

    /**
     * 开始拼写练习会话
     * @param {string} unitId - 单元ID
     */
    start(unitId) {
        const vocabData = this.storage.getVocabData();
        const unitWords = vocabData[unitId];

        if (!unitWords || unitWords.length === 0) {
            this.ui.showToast('该单元暂无单词');
            return;
        }

        // 优先选择用户之前拼错的单词
        const wordStates = this.storage.getWordStates();
        const weak = [];
        const others = [];

        unitWords.forEach(w => {
            const state = wordStates[w.id];
            // 拼错过 (lastQuality低) 或还没学过的优先
            if (state && state.lastQuality <= 3) {
                weak.push(w);
            } else {
                others.push(w);
            }
        });

        // 弱词优先，补充其他词，共8个
        this.currentWords = [
            ...this._shuffle(weak),
            ...this._shuffle(others),
        ].slice(0, 8);

        if (this.currentWords.length === 0) {
            this.ui.showToast('没有可练习的单词');
            return;
        }

        // 重置会话状态
        this.currentIndex = 0;
        this.sessionStars = 0;
        this.results = [];

        // 切换到拼写屏幕并渲染
        this.router.navigate('spelling');
        this.renderQuestion();
    }

    /* ──────────────────────────── 题目渲染 ──────────────────────────── */

    /**
     * 渲染当前拼写题目
     */
    renderQuestion() {
        const word = this.currentWords[this.currentIndex];
        const total = this.currentWords.length;
        const progress = Math.round((this.currentIndex / total) * 100);

        // 重置题目状态
        this.hintLevel = 0;
        this.attempt = 1;

        // 词性中文映射
        const posNames = {
            'n.': 'n. 名词',
            'v.': 'v. 动词',
            'adj.': 'adj. 形容词',
            'adv.': 'adv. 副词',
            'prep.': 'prep. 介词',
            'conj.': 'conj. 连词',
            'pron.': 'pron. 代词',
            'interj.': 'interj. 感叹词',
        };
        const posDisplay = posNames[word.partOfSpeech] || word.partOfSpeech || '';

        const container = document.getElementById('screen-spelling');
        if (!container) return;

        container.innerHTML = `
            <div class="spelling-header">
                <button class="btn-back" id="spellingBack">← 返回</button>
                <div class="spelling-progress">
                    <span class="spelling-progress-text">${this.currentIndex + 1} / ${total}</span>
                    <div class="spelling-progress-bar">
                        <div class="spelling-progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
                <span class="spelling-stars">⭐ ${this.sessionStars}</span>
            </div>
            <div class="spelling-body">
                <div class="spelling-chinese">${word.chinese}</div>
                <div class="spelling-pos">${posDisplay}</div>
                <button class="btn-audio" id="spellingAudio">🔊</button>
                <div class="spelling-input-row">
                    <input type="text" id="spellingInput" 
                           placeholder="输入英文拼写..." 
                           autocomplete="off" 
                           autocapitalize="off"
                           spellcheck="false">
                    <button id="spellingSubmit" class="btn-submit">确定</button>
                </div>
                <div class="spelling-hint" id="spellingHint"></div>
                <button id="spellingHintBtn" class="btn-hint">💡 提示</button>
                <div class="spelling-feedback" id="spellingFeedback"></div>
            </div>
        `;

        // 绑定事件
        this._bindQuestionEvents(word);

        // 自动发音
        if (window.tts) {
            setTimeout(() => window.tts.speakWord(word.english), 300);
        }

        // 聚焦输入框
        setTimeout(() => {
            const input = document.getElementById('spellingInput');
            if (input) input.focus();
        }, 400);
    }

    /**
     * 绑定当前题目的事件监听
     * @param {object} word - 当前单词对象
     */
    _bindQuestionEvents(word) {
        // 返回按钮
        const backBtn = document.getElementById('spellingBack');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.router.navigate('main');
            });
        }

        // 发音按钮
        const audioBtn = document.getElementById('spellingAudio');
        if (audioBtn) {
            audioBtn.addEventListener('click', () => {
                if (window.tts) window.tts.speakWord(word.english);
            });
        }

        // 提交按钮
        const submitBtn = document.getElementById('spellingSubmit');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.checkAnswer());
        }

        // 回车提交
        const input = document.getElementById('spellingInput');
        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') this.checkAnswer();
            });
        }

        // 提示按钮
        const hintBtn = document.getElementById('spellingHintBtn');
        if (hintBtn) {
            hintBtn.addEventListener('click', () => this.showHint());
        }
    }

    /* ──────────────────────────── 答案检查 ──────────────────────────── */

    /**
     * 检查用户输入的拼写是否正确
     */
    checkAnswer() {
        const input = document.getElementById('spellingInput');
        const feedback = document.getElementById('spellingFeedback');
        if (!input || !feedback) return;

        const word = this.currentWords[this.currentIndex];
        const userAnswer = input.value.trim().toLowerCase();
        const correctAnswer = word.english.toLowerCase();

        if (!userAnswer) {
            this.ui.showToast('请输入英文单词');
            return;
        }

        if (userAnswer === correctAnswer) {
            // ── 正确 ──
            this._showCorrectFeedback(feedback, word);
        } else {
            // ── 错误 ──
            this._showWrongFeedback(feedback, input, word);
        }
    }

    /**
     * 显示正确答案反馈
     */
    _showCorrectFeedback(feedback, word) {
        const input = document.getElementById('spellingInput');
        const submitBtn = document.getElementById('spellingSubmit');
        const hintBtn = document.getElementById('spellingHintBtn');

        // 计算星星：首次+无提示=2星，首次+有提示=1星，重试正确=1星
        let stars = 0;
        if (this.attempt === 1) {
            stars = this.hintLevel === 0 ? 2 : Math.max(1, 2 - this.hintLevel);
        } else {
            stars = 1;
        }

        this.sessionStars += stars;

        // 记录结果
        this.results.push({
            word: word,
            stars: stars,
            attempts: this.attempt,
            mastered: true,
        });

        // 显示反馈
        feedback.innerHTML = `
            <div class="feedback-correct">
                ✅ 正确！+${stars}⭐
            </div>
        `;
        feedback.className = 'spelling-feedback show correct';

        // 禁用输入
        if (input) input.disabled = true;
        if (submitBtn) submitBtn.disabled = true;
        if (hintBtn) hintBtn.style.display = 'none';

        // 发音并自动进入下一题
        if (window.tts) window.tts.speakWord(word.english);

        setTimeout(() => {
            this.currentIndex++;
            if (this.currentIndex >= this.currentWords.length) {
                this.showResult();
            } else {
                this.renderQuestion();
            }
        }, 1000);
    }

    /**
     * 显示错误答案反馈
     */
    _showWrongFeedback(feedback, input, word) {
        if (this.attempt === 1) {
            // 第一次错误：显示正确答案，允许重试
            feedback.innerHTML = `
                <div class="feedback-wrong">
                    ❌ 正确答案是: <span class="correct-word">${word.english}</span>
                </div>
                <button class="btn-retry" id="spellingRetry">🔄 再试一次</button>
            `;
            feedback.className = 'spelling-feedback show wrong';

            // 输入框红色闪烁
            input.classList.add('input-error');
            setTimeout(() => input.classList.remove('input-error'), 500);

            // 绑定重试按钮
            const retryBtn = document.getElementById('spellingRetry');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => {
                    this.attempt = 2;
                    input.value = '';
                    input.focus();
                    feedback.innerHTML = '';
                    feedback.className = 'spelling-feedback';
                });
            }
        } else {
            // 第二次错误：0星，显示答案，自动进入下一题
            this.results.push({
                word: word,
                stars: 0,
                attempts: 2,
                mastered: false,
            });

            feedback.innerHTML = `
                <div class="feedback-wrong">
                    正确答案: <span class="correct-word">${word.english}</span>
                </div>
            `;
            feedback.className = 'spelling-feedback show wrong';

            input.disabled = true;
            const submitBtn = document.getElementById('spellingSubmit');
            if (submitBtn) submitBtn.disabled = true;
            const hintBtn = document.getElementById('spellingHintBtn');
            if (hintBtn) hintBtn.style.display = 'none';

            // 发音正确答案
            if (window.tts) window.tts.speakWord(word.english);

            setTimeout(() => {
                this.currentIndex++;
                if (this.currentIndex >= this.currentWords.length) {
                    this.showResult();
                } else {
                    this.renderQuestion();
                }
            }, 2000);
        }
    }

    /* ──────────────────────────── 提示系统 ──────────────────────────── */

    /**
     * 渐进式显示提示：每次多揭示一个字母
     */
    showHint() {
        const word = this.currentWords[this.currentIndex];
        const hintEl = document.getElementById('spellingHint');
        if (!hintEl) return;

        this.hintLevel++;

        const english = word.english;
        const revealed = english.slice(0, this.hintLevel);
        const hidden = '_'.repeat(english.length - this.hintLevel);
        const hintText = revealed + hidden;

        hintEl.textContent = `提示: ${hintText}`;
        hintEl.classList.add('show');

        // 如果已经揭示了大部分字母，隐藏提示按钮
        if (this.hintLevel >= english.length - 1) {
            const hintBtn = document.getElementById('spellingHintBtn');
            if (hintBtn) hintBtn.style.display = 'none';
        }
    }

    /* ──────────────────────────── 结果总结 ──────────────────────────── */

    /**
     * 显示练习完成总结
     */
    showResult() {
        const total = this.results.length;
        const mastered = this.results.filter(r => r.mastered).length;
        const needPractice = total - mastered;

        // 保存星星和学习记录
        this.storage.addStars(this.sessionStars);
        this.storage.recordStudyDay();

        // 生成总结UI
        const container = document.getElementById('screen-spelling');
        if (!container) return;

        // 评价语
        let emoji, title;
        const ratio = mastered / total;
        if (ratio >= 0.8) {
            emoji = '🌟';
            title = '拼写大师！';
        } else if (ratio >= 0.5) {
            emoji = '👍';
            title = '继续努力！';
        } else {
            emoji = '💪';
            title = '多加练习！';
        }

        // 单词结果列表
        let wordListHtml = '';
        this.results.forEach(r => {
            const icon = r.mastered ? '✅' : '❌';
            const starText = r.stars > 0 ? `+${r.stars}⭐` : '';
            wordListHtml += `
                <div class="result-word-item ${r.mastered ? 'mastered' : 'failed'}">
                    <span class="result-icon">${icon}</span>
                    <span class="result-english">${r.word.english}</span>
                    <span class="result-chinese">${r.word.chinese}</span>
                    <span class="result-stars">${starText}</span>
                </div>
            `;
        });

        container.innerHTML = `
            <div class="spelling-result">
                <div class="result-emoji">${emoji}</div>
                <div class="result-title">${title}</div>
                <div class="result-summary">
                    掌握 <span class="result-highlight">${mastered}</span> 个，
                    需练习 <span class="result-highlight">${needPractice}</span> 个
                </div>
                <div class="result-stars-total">
                    共获得 ⭐ ${this.sessionStars} 颗星星
                </div>
                <div class="result-word-list">
                    ${wordListHtml}
                </div>
                <button class="btn-result-back" id="spellingResultBack">返回</button>
            </div>
        `;

        // 返回按钮
        const backBtn = document.getElementById('spellingResultBack');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.router.navigate('main');
            });
        }

        // 派发完成事件（供任务系统追踪）
        document.dispatchEvent(new CustomEvent('spelling-session-complete'));
    }

    /* ──────────────────────────── 工具方法 ──────────────────────────── */

    /**
     * Fisher-Yates 洗牌
     * @param {Array} arr
     * @returns {Array} 打乱后的副本
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
