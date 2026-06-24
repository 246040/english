/**
 * 英语小灶 EnglishBuddy - Main Application Entry
 * Orchestrates all modules and handles screen navigation
 */

import { Storage } from './storage.js';
import { Router } from './router.js';
import { Assessment } from './assessment.js';
import { VocabLearner } from './vocab-learner.js';
import { QuizEngine } from './quiz-engine.js';
import { DailyMission } from './daily-mission.js';
import { Profile } from './profile.js';
import { UI } from './ui.js';
import { TTS } from './tts.js';
import { Pet } from './pet.js';
import { SpellingPractice } from './spelling.js';
import { MatchGame } from './match-game.js';

class App {
    constructor() {
        this.storage = new Storage();
        this.router = new Router();
        this.ui = new UI();
        this.tts = new TTS();
        window.tts = this.tts; // Make accessible to all modules
        this.init();
    }

    async init() {
        // Show splash for at least 1.5s
        await this.showSplash();

        // Check if user has completed setup
        const userData = this.storage.getUserData();

        if (!userData || !userData.setupComplete) {
            this.router.navigate('welcome');
        } else if (!userData.assessmentComplete) {
            this.router.navigate('setup');
        } else {
            this.router.navigate('main');
            this.initMainApp(userData);
        }

        this.bindGlobalEvents();
    }

    showSplash() {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, 1800);
        });
    }

    bindGlobalEvents() {
        // Welcome screen
        const btnStartSetup = document.getElementById('btnStartSetup');
        if (btnStartSetup) {
            btnStartSetup.addEventListener('click', () => {
                this.router.navigate('setup');
            });

            // Auto-slide welcome slides
            this.startWelcomeSlider();
        }

        // Setup screen
        this.bindSetupEvents();

        // Bottom navigation
        this.bindNavigation();

        // Quick action buttons
        this.bindQuickActions();
    }

    startWelcomeSlider() {
        let currentSlide = 0;
        const slides = document.querySelectorAll('.welcome-slide');
        const dots = document.querySelectorAll('.dot');

        const goToSlide = (index) => {
            slides.forEach(s => s.classList.remove('active'));
            dots.forEach(d => d.classList.remove('active'));
            slides[index].classList.add('active');
            dots[index].classList.add('active');
        };

        // Auto rotate
        this.welcomeTimer = setInterval(() => {
            currentSlide = (currentSlide + 1) % 3;
            goToSlide(currentSlide);
        }, 3000);

        // Click dots
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                currentSlide = parseInt(dot.dataset.dot);
                goToSlide(currentSlide);
                clearInterval(this.welcomeTimer);
            });
        });
    }

    bindSetupEvents() {
        const nameInput = document.getElementById('inputName');
        const gradeBtns = document.querySelectorAll('.grade-btn');
        const textbookBtns = document.querySelectorAll('.textbook-btn');
        const btnStart = document.getElementById('btnStartAssessment');

        let selectedGrade = 8;
        let selectedTextbook = 'pep';

        // Name input enables button
        if (nameInput) {
            nameInput.addEventListener('input', () => {
                btnStart.disabled = nameInput.value.trim().length === 0;
            });
        }

        // Grade selection
        gradeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                gradeBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedGrade = parseInt(btn.dataset.grade);
            });
        });

        // Textbook selection
        textbookBtns.forEach(btn => {
            if (!btn.disabled) {
                btn.addEventListener('click', () => {
                    textbookBtns.forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    selectedTextbook = btn.dataset.textbook;
                });
            }
        });

        // Start assessment button
        if (btnStart) {
            btnStart.addEventListener('click', () => {
                const name = nameInput.value.trim();
                if (!name) return;

                // Save user data
                this.storage.setUserData({
                    name: name,
                    grade: selectedGrade,
                    textbook: selectedTextbook,
                    setupComplete: true,
                    assessmentComplete: false,
                    createdAt: new Date().toISOString()
                });

                // Start assessment
                this.startAssessment();
            });
        }
    }

    startAssessment() {
        this.router.navigate('assessment');
        this.assessment = new Assessment(
            this.storage,
            this.router,
            this.ui,
            (result) => this.onAssessmentComplete(result)
        );
        this.assessment.start();
    }

    onAssessmentComplete(result) {
        // Save assessment result
        const userData = this.storage.getUserData();
        userData.assessmentComplete = true;
        userData.level = result.level;
        userData.strengths = result.strengths;
        userData.weaknesses = result.weaknesses;
        userData.score = result.score;
        this.storage.setUserData(userData);

        // Show result screen
        this.showAssessmentResult(result);
    }

    showAssessmentResult(result) {
        this.router.navigate('assess-result');

        const resultCard = document.getElementById('resultCard');
        const resultEmoji = document.getElementById('resultEmoji');
        const resultTitle = document.getElementById('resultTitle');

        let levelText, levelStars, emoji;
        if (result.level === 1) {
            levelText = '基础入门';
            levelStars = '⭐';
            emoji = '💪';
            resultTitle.textContent = '没关系，我们从头开始！';
        } else if (result.level === 2) {
            levelText = '初一水平';
            levelStars = '⭐⭐';
            emoji = '👍';
            resultTitle.textContent = '有基础了！我们一起加油';
        } else {
            levelText = '初二水平';
            levelStars = '⭐⭐⭐';
            emoji = '🎉';
            resultTitle.textContent = '基础不错！一起进步';
        }

        resultEmoji.textContent = emoji;
        document.getElementById('resultSubtitle').textContent = '已为你生成专属学习计划';

        resultCard.innerHTML = `
            <div class="result-level">
                <div class="result-level-stars">${levelStars}</div>
                <div class="result-level-text">
                    <h3>你当前的水平：${levelText}</h3>
                    <p>答对 ${result.score} / ${result.total} 题</p>
                </div>
            </div>
            <div class="result-items">
                ${result.strengths.length > 0 ? `
                <div class="result-item">
                    <span class="result-item-icon">✅</span>
                    <span>强项：${result.strengths.join('、')}</span>
                </div>` : ''}
                ${result.weaknesses.length > 0 ? `
                <div class="result-item">
                    <span class="result-item-icon">📈</span>
                    <span>需要加油：${result.weaknesses.join('、')}</span>
                </div>` : ''}
                <div class="result-item">
                    <span class="result-item-icon">📖</span>
                    <span>建议从「${result.level === 1 ? '基础补救' : 'Unit 1'}」开始</span>
                </div>
            </div>
        `;

        // Bind start learning button
        document.getElementById('btnStartLearning').addEventListener('click', () => {
            this.router.navigate('main');
            this.initMainApp(this.storage.getUserData());
        });
    }

    initMainApp(userData) {
        // Set greeting
        const hour = new Date().getHours();
        let greetText = '';
        if (hour < 12) greetText = '早上好';
        else if (hour < 18) greetText = '下午好';
        else greetText = '晚上好';
        document.getElementById('greetingText').textContent = `${greetText}，${userData.name}`;

        // Update stats badges
        this.updateTopBar();

        // Initialize modules
        this.pet = new Pet(this.storage, this.ui);
        this.pet.renderHomeCard();

        this.dailyMission = new DailyMission(this.storage, this.ui, this.router);
        this.dailyMission.render();

        this.vocabLearner = new VocabLearner(this.storage, this.ui, this.router);
        this.quizEngine = new QuizEngine(this.storage, this.ui, this.router);
        this.spellingPractice = new SpellingPractice(this.storage, this.ui, this.router);
        this.matchGame = new MatchGame(this.storage, this.ui, this.router);
        this.profile = new Profile(this.storage, this.ui);

        // Listen for mission task completion events from modules
        document.addEventListener('vocab-session-complete', () => {
            this.dailyMission.completeMissionTask('learn-words');
            this.updateTopBar();
            this.pet.renderHomeCard();
        });

        document.addEventListener('quiz-session-complete', () => {
            this.dailyMission.completeMissionTask('take-quiz');
            this.updateTopBar();
            this.pet.renderHomeCard();
        });

        document.addEventListener('review-session-complete', () => {
            this.dailyMission.completeMissionTask('review-words');
            this.updateTopBar();
            this.pet.renderHomeCard();
        });

        document.addEventListener('spelling-session-complete', () => {
            this.dailyMission.completeMissionTask('learn-words');
            this.updateTopBar();
            this.pet.renderHomeCard();
        });

        document.addEventListener('match-game-complete', () => {
            this.updateTopBar();
            this.pet.renderHomeCard();
        });

        // Handle daily mission "review" task click
        document.addEventListener('start-review', () => {
            if (this.vocabLearner) {
                this.vocabLearner.startReview();
            }
        });

        // Render unit list
        this.renderUnitList();

        // Render profile
        this.profile.render();
    }

    updateTopBar() {
        const stats = this.storage.getStats();
        document.getElementById('streakBadge').textContent = `🔥 ${stats.streak}天`;
        document.getElementById('starBadge').textContent = `⭐ ${stats.stars}`;
    }

    renderUnitList() {
        const unitList = document.getElementById('unitList');
        const { unitInfo } = this.getUnitData();
        const progress = this.storage.getUnitProgress();

        unitList.innerHTML = unitInfo.map(unit => {
            const prog = progress[unit.id] || 0;
            const isLocked = false; // All units accessible for now
            return `
                <div class="unit-card ${isLocked ? 'locked' : ''}" data-unit="${unit.id}">
                    <div class="unit-icon">${unit.icon}</div>
                    <div class="unit-info">
                        <div class="unit-name">${unit.name}</div>
                        <div class="unit-desc">${unit.nameEn}</div>
                        <div class="unit-progress">
                            <div class="unit-progress-bar">
                                <div class="unit-progress-fill" style="width: ${prog}%"></div>
                            </div>
                        </div>
                    </div>
                    <div class="unit-arrow">›</div>
                </div>
            `;
        }).join('');

        // Bind click events
        unitList.querySelectorAll('.unit-card:not(.locked)').forEach(card => {
            card.addEventListener('click', () => {
                const unitId = card.dataset.unit;
                this.vocabLearner.startUnit(unitId);
            });
        });
    }

    getUnitData() {
        return {
            unitInfo: this.storage.getUnitInfo()
        };
    }

    bindNavigation() {
        const navBtns = document.querySelectorAll('.nav-btn');
        const tabPanes = document.querySelectorAll('.tab-pane');

        navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;

                // Update active states
                navBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                tabPanes.forEach(pane => pane.classList.remove('active'));
                document.getElementById(`tab-${tab}`).classList.add('active');

                // Trigger tab-specific rendering
                if (tab === 'vocab') {
                    this.vocabLearner && this.vocabLearner.renderTab();
                } else if (tab === 'quiz') {
                    this.quizEngine && this.quizEngine.renderTab();
                } else if (tab === 'profile') {
                    this.profile && this.profile.render();
                }
            });
        });
    }

    bindQuickActions() {
        document.getElementById('quickVocab')?.addEventListener('click', () => {
            document.querySelector('.nav-btn[data-tab="vocab"]').click();
        });

        document.getElementById('quickSpelling')?.addEventListener('click', () => {
            // Start spelling for first available unit with studied words
            const vocabData = this.storage.getVocabData();
            const wordStates = this.storage.getWordStates();
            const unitIds = Object.keys(vocabData);
            const unitWithWords = unitIds.find(uid => {
                return vocabData[uid].some(w => wordStates[w.id]);
            });
            if (unitWithWords && this.spellingPractice) {
                this.spellingPractice.start(unitWithWords);
            } else {
                this.ui.showToast('先去背几个单词再来拼写吧 📚');
            }
        });

        document.getElementById('quickMatch')?.addEventListener('click', () => {
            const vocabData = this.storage.getVocabData();
            const wordStates = this.storage.getWordStates();
            const unitIds = Object.keys(vocabData);
            const unitWithWords = unitIds.find(uid => {
                const studied = vocabData[uid].filter(w => wordStates[w.id]);
                return studied.length >= 6;
            });
            if (unitWithWords && this.matchGame) {
                this.matchGame.start(unitWithWords);
            } else {
                this.ui.showToast('需要至少学过6个单词才能玩配对游戏 🎮');
            }
        });

        document.getElementById('quickListening')?.addEventListener('click', () => {
            this.ui.showToast('🎧 听力模块即将上线，敬请期待！');
        });

        document.getElementById('quickQuiz')?.addEventListener('click', () => {
            document.querySelector('.nav-btn[data-tab="quiz"]').click();
        });

        document.getElementById('quickReview')?.addEventListener('click', () => {
            if (this.vocabLearner) {
                this.vocabLearner.startReview();
            }
        });
    }
}

// Boot the app
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // SW registration failed - that's ok, app still works
        });
    });
}
