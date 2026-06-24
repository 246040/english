/**
 * GrammarPractice - 语法闯关模块
 * 6个语法专题，每个专题有10-15道选择题
 * 答题后显示语法规则解释和答题技巧
 */

import { grammarTopics, grammarQuestions } from './data/grammar-data.js';

export class GrammarPractice {
    constructor(storage, ui, router) {
        this.storage = storage;
        this.ui = ui;
        this.router = router;
        this.currentTopic = null;
        this.questions = [];
        this.currentIndex = 0;
        this.score = 0;
        this.results = [];
    }

    /* ─────────────── Topic List ─────────────── */

    renderTab() {
        const container = document.getElementById('grammarContainer');
        if (!container) return;

        const progress = this._getProgress();

        let html = `
            <div class="grammar-header">
                <button class="btn-back" id="grammarBack">← 返回</button>
                <h2>📖 语法闯关</h2>
            </div>
            <div class="grammar-topics">
        `;

        grammarTopics.forEach(topic => {
            const topicProgress = progress[topic.id] || { best: 0, attempts: 0 };
            const stars = Math.min(3, Math.floor(topicProgress.best / (topic.questionCount * 0.33)));
            const starStr = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);

            html += `
                <div class="grammar-topic-card" data-topic="${topic.id}">
                    <div class="grammar-topic-icon">${topic.icon}</div>
                    <div class="grammar-topic-name">${topic.name}</div>
                    <div class="grammar-topic-desc">${topic.description}</div>
                    <div class="grammar-topic-meta">
                        ${topic.questionCount}题 · ${starStr}
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;

        // Bind back
        document.getElementById('grammarBack')?.addEventListener('click', () => {
            this.router.navigate('main');
        });

        // Bind topic cards
        container.querySelectorAll('.grammar-topic-card').forEach(card => {
            card.addEventListener('click', () => {
                this.startTopic(card.dataset.topic);
            });
        });
    }

    /* ─────────────── Session ─────────────── */

    startTopic(topicId) {
        this.currentTopic = topicId;
        this.questions = grammarQuestions[topicId] || [];
        this.currentIndex = 0;
        this.score = 0;
        this.results = [];

        if (this.questions.length === 0) {
            this.ui.showToast('暂无题目');
            return;
        }

        this.showQuestion();
    }

    showQuestion() {
        if (this.currentIndex >= this.questions.length) {
            this.showResult();
            return;
        }

        const container = document.getElementById('grammarContainer');
        if (!container) return;

        const q = this.questions[this.currentIndex];
        const progress = ((this.currentIndex + 1) / this.questions.length) * 100;

        container.innerHTML = `
            <div class="grammar-header">
                <button class="btn-back" id="grammarQuit">← 退出</button>
                <div class="mtrain-progress">
                    <span>${this.currentIndex + 1}/${this.questions.length}</span>
                    <div class="progress-bar-wrapper small">
                        <div class="progress-bar" style="width: ${progress}%"></div>
                    </div>
                </div>
                <span class="mtrain-score">⭐ ${this.score}</span>
            </div>
            <div class="grammar-body">
                <div class="grammar-question">
                    <div class="grammar-prompt">${q.question}</div>
                    <div class="grammar-prompt-cn">${q.questionCn}</div>
                    <div class="mtrain-options">
                        ${q.options.map((opt, i) => `
                            <button class="mtrain-option" data-index="${i}">
                                <span class="mtrain-letter">${String.fromCharCode(65 + i)}</span>
                                <span>${opt}</span>
                            </button>
                        `).join('')}
                    </div>
                    <div id="grammarFeedback"></div>
                </div>
            </div>
        `;

        // Speak the English part
        if (window.tts && q.question) {
            const cleanQ = q.question.replace(/_+/g, 'blank').replace(/\(.*?\)/g, '');
            setTimeout(() => window.tts.speakWord(cleanQ), 300);
        }

        // Bind quit
        document.getElementById('grammarQuit')?.addEventListener('click', () => {
            this.renderTab();
        });

        // Bind options
        container.querySelectorAll('.mtrain-option').forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleAnswer(parseInt(btn.dataset.index));
            });
        });
    }

    handleAnswer(selectedIndex) {
        const q = this.questions[this.currentIndex];
        const isCorrect = selectedIndex === q.correctIndex;
        const container = document.getElementById('grammarContainer');

        // Disable all and highlight
        container.querySelectorAll('.mtrain-option').forEach((opt, i) => {
            opt.style.pointerEvents = 'none';
            if (i === q.correctIndex) {
                opt.classList.add('correct');
            }
            if (i === selectedIndex && !isCorrect) {
                opt.classList.add('wrong');
            }
        });

        if (isCorrect) {
            this.score++;
            this.results.push({ question: q, correct: true });
        } else {
            this.results.push({ question: q, correct: false });
        }

        // Show feedback with explanation and tip
        const feedback = document.getElementById('grammarFeedback');
        if (feedback) {
            feedback.innerHTML = `
                <div class="grammar-explanation">
                    ${isCorrect ? '✅ 正确！' : '❌ 答错了'}
                    <p>${q.explanation}</p>
                </div>
                <div class="grammar-tip">
                    💡 记忆技巧：${q.tip}
                </div>
            `;
        }

        // Auto advance
        setTimeout(() => {
            this.currentIndex++;
            this.showQuestion();
        }, isCorrect ? 1500 : 3000);
    }

    showResult() {
        const container = document.getElementById('grammarContainer');
        if (!container) return;

        const total = this.questions.length;
        const correct = this.score;
        const pct = Math.round((correct / total) * 100);

        // Save progress
        this._saveProgress(this.currentTopic, correct);

        // Award stars
        this.storage.addStars(correct);
        this.storage.recordStudyDay();

        let emoji, title;
        if (pct >= 90) { emoji = '🏆'; title = '语法小天才！'; }
        else if (pct >= 70) { emoji = '🎉'; title = '掌握得不错！'; }
        else if (pct >= 50) { emoji = '💪'; title = '继续加油！'; }
        else { emoji = '📚'; title = '多练几次，规则会更清晰！'; }

        // Collect wrong rules for review
        const wrongTips = this.results
            .filter(r => !r.correct)
            .map(r => r.question.tip);

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
                        <span class="mtrain-stat-value">⭐ ${correct}</span>
                        <span class="mtrain-stat-label">获得星星</span>
                    </div>
                </div>
                ${wrongTips.length > 0 ? `
                    <div class="mtrain-result-words">
                        <h3>📝 需要复习的语法规则</h3>
                        ${wrongTips.map(tip => `
                            <div class="mtrain-word-row wrong">
                                <span>💡</span>
                                <span>${tip}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                <div class="mtrain-result-actions">
                    <button class="btn btn-secondary" id="grammarRetry">🔄 再练一次</button>
                    <button class="btn btn-primary" id="grammarHome">🏠 返回</button>
                </div>
            </div>
        `;

        document.getElementById('grammarRetry')?.addEventListener('click', () => {
            this.startTopic(this.currentTopic);
        });

        document.getElementById('grammarHome')?.addEventListener('click', () => {
            this.router.navigate('main');
        });

        // Dispatch completion event
        document.dispatchEvent(new CustomEvent('grammar-session-complete', {
            detail: { score: correct, total, topicId: this.currentTopic }
        }));
    }

    /* ─────────────── Progress Persistence ─────────────── */

    _getProgress() {
        return this.storage._get('eb_grammar_progress') || {};
    }

    _saveProgress(topicId, score) {
        const progress = this._getProgress();
        if (!progress[topicId]) {
            progress[topicId] = { best: 0, attempts: 0 };
        }
        progress[topicId].attempts++;
        progress[topicId].best = Math.max(progress[topicId].best, score);
        this.storage._set('eb_grammar_progress', progress);
    }
}
