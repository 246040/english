/**
 * Assessment - Diagnostic test to determine student's level
 * Adaptive difficulty: starts easy, adjusts based on answers
 */

import { UI } from './ui.js';

export class Assessment {
    constructor(storage, router, ui, onComplete) {
        this.storage = storage;
        this.router = router;
        this.ui = ui;
        this.onComplete = onComplete;
        this.questions = [];
        this.currentIndex = 0;
        this.answers = [];
        this.score = 0;
    }

    start() {
        this.questions = this.generateQuestions();
        this.currentIndex = 0;
        this.answers = [];
        this.score = 0;
        this.showQuestion();
    }

    generateQuestions() {
        // 10 questions: 4 easy (level 1) + 3 medium (level 2) + 3 hard (level 3)
        // If they get early ones wrong, skip harder ones
        const quizData = this.storage.getQuizData();
        const questions = [];

        // Pick from each level
        const l1 = UI.shuffle(quizData.level1).slice(0, 4);
        const l2 = UI.shuffle(quizData.level2).slice(0, 3);
        const l3 = UI.shuffle(quizData.level3).slice(0, 3);

        questions.push(...l1, ...l2, ...l3);
        return questions;
    }

    showQuestion() {
        const q = this.questions[this.currentIndex];
        if (!q) {
            this.finish();
            return;
        }

        // Update progress
        const total = this.questions.length;
        document.getElementById('assessQuestionNum').textContent = this.currentIndex + 1;
        document.getElementById('assessTotalNum').textContent = total;
        document.getElementById('assessProgressBar').style.width =
            `${((this.currentIndex + 1) / total) * 100}%`;

        // Render question
        const body = document.getElementById('assessBody');
        const letters = ['A', 'B', 'C', 'D'];

        let typeLabel = '';
        switch (q.type) {
            case 'vocab-en2cn': typeLabel = '词汇理解'; break;
            case 'vocab-cn2en': typeLabel = '词汇选择'; break;
            case 'grammar': typeLabel = '语法'; break;
            case 'cloze': typeLabel = '完形填空'; break;
            default: typeLabel = '综合'; break;
        }

        body.innerHTML = `
            <div class="question-card">
                <span class="question-type-badge">${typeLabel} · Level ${q.level}</span>
                <div class="question-text">${q.question}</div>
                ${q.questionCn ? `<div class="question-text-cn">${q.questionCn}</div>` : ''}
                <div class="options-list">
                    ${q.options.map((opt, i) => `
                        <button class="option-btn" data-index="${i}">
                            <span class="option-letter">${letters[i]}</span>
                            <span>${opt}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        // Bind option clicks
        body.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleAnswer(parseInt(btn.dataset.index), q);
            });
        });

        // Auto-speak English word if it's a vocab question
        if ((q.type === 'vocab-en2cn') && window.tts) {
            // Extract the English word from the question (inside quotes)
            const match = q.question.match(/"([^"]+)"/);
            if (match) {
                setTimeout(() => window.tts.speakWord(match[1]), 300);
            }
        }
    }

    handleAnswer(selectedIndex, question) {
        const body = document.getElementById('assessBody');
        const options = body.querySelectorAll('.option-btn');
        const isCorrect = selectedIndex === question.correctIndex;

        // Disable all options
        options.forEach(btn => btn.classList.add('disabled'));

        // Highlight correct and wrong
        options[question.correctIndex].classList.add('correct');
        if (!isCorrect) {
            options[selectedIndex].classList.add('wrong');
        }

        // Record answer
        this.answers.push({
            questionId: question.id,
            level: question.level,
            type: question.type,
            correct: isCorrect,
        });

        if (isCorrect) {
            this.score++;
        }

        // Show explanation
        const card = body.querySelector('.question-card');
        const explanation = document.createElement('div');
        explanation.className = 'explanation-box';
        explanation.innerHTML = `
            <p>${isCorrect ? '✅ 答对了！' : '❌ 没关系～'} ${question.explanation}</p>
        `;
        card.appendChild(explanation);

        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn btn-primary btn-next-question';
        nextBtn.textContent = this.currentIndex < this.questions.length - 1 ? '下一题 →' : '查看结果 🎉';
        card.appendChild(nextBtn);

        nextBtn.addEventListener('click', () => {
            this.currentIndex++;

            // Adaptive: if scored 0 on first 4 (all level 1), skip level 3
            if (this.currentIndex === 4 && this.score === 0) {
                // Skip to end (they're at beginner level)
                this.questions = this.questions.slice(0, 7); // Remove level 3
            }

            this.showQuestion();
        });
    }

    finish() {
        // Analyze results
        const l1Correct = this.answers.filter(a => a.level === 1 && a.correct).length;
        const l2Correct = this.answers.filter(a => a.level === 2 && a.correct).length;
        const l3Correct = this.answers.filter(a => a.level === 3 && a.correct).length;

        const l1Total = this.answers.filter(a => a.level === 1).length;
        const l2Total = this.answers.filter(a => a.level === 2).length;
        const l3Total = this.answers.filter(a => a.level === 3).length;

        // Determine level
        let level;
        if (l1Correct < 2) {
            level = 1; // Below Grade 7 basics
        } else if (l2Correct < 2) {
            level = 2; // Grade 7 level
        } else {
            level = 3; // Grade 8 level
        }

        // Determine strengths and weaknesses
        const strengths = [];
        const weaknesses = [];

        const vocabCorrect = this.answers.filter(a =>
            (a.type === 'vocab-en2cn' || a.type === 'vocab-cn2en') && a.correct
        ).length;
        const vocabTotal = this.answers.filter(a =>
            a.type === 'vocab-en2cn' || a.type === 'vocab-cn2en'
        ).length;

        const grammarCorrect = this.answers.filter(a =>
            (a.type === 'grammar' || a.type === 'cloze') && a.correct
        ).length;
        const grammarTotal = this.answers.filter(a =>
            a.type === 'grammar' || a.type === 'cloze'
        ).length;

        if (vocabTotal > 0 && vocabCorrect / vocabTotal >= 0.6) {
            strengths.push('单词认读');
        } else if (vocabTotal > 0) {
            weaknesses.push('词汇');
        }

        if (grammarTotal > 0 && grammarCorrect / grammarTotal >= 0.6) {
            strengths.push('语法基础');
        } else if (grammarTotal > 0) {
            weaknesses.push('语法');
        }

        // Listening is always weak for this user profile
        weaknesses.push('听力');

        const result = {
            level,
            score: this.score,
            total: this.answers.length,
            strengths,
            weaknesses,
            details: {
                l1: { correct: l1Correct, total: l1Total },
                l2: { correct: l2Correct, total: l2Total },
                l3: { correct: l3Correct, total: l3Total },
            }
        };

        this.onComplete(result);
    }
}
