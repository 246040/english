/**
 * Storage - LocalStorage wrapper for all app data persistence
 * Handles user data, vocabulary states, stats, missions, and study history
 */

// Import vocab data
import { vocabData, unitInfo } from './data/vocab-data.js';
import { quizData } from './data/quiz-data.js';

const KEYS = {
    USER: 'eb_user',
    WORD_STATES: 'eb_word_states',
    STATS: 'eb_stats',
    MISSION: 'eb_mission',
    STUDY_DAYS: 'eb_study_days',
    QUIZ_HISTORY: 'eb_quiz_history',
    SETTINGS: 'eb_settings',
};

export class Storage {
    constructor() {
        this._initDefaults();
    }

    _initDefaults() {
        if (!this._get(KEYS.STATS)) {
            this._set(KEYS.STATS, {
                stars: 0,
                streak: 0,
                bestStreak: 0,
                totalWords: 0,
                totalQuizzes: 0,
                lastStudyDate: null,
            });
        }
        if (!this._get(KEYS.WORD_STATES)) {
            this._set(KEYS.WORD_STATES, {});
        }
        if (!this._get(KEYS.STUDY_DAYS)) {
            this._set(KEYS.STUDY_DAYS, []);
        }
        if (!this._get(KEYS.QUIZ_HISTORY)) {
            this._set(KEYS.QUIZ_HISTORY, []);
        }
    }

    // --- Low-level helpers ---
    _get(key) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    _set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn('Storage write failed:', e);
        }
    }

    // --- User Data ---
    getUserData() {
        return this._get(KEYS.USER);
    }

    setUserData(data) {
        this._set(KEYS.USER, data);
    }

    // --- Vocab Data (static, from data file) ---
    getVocabData() {
        return vocabData;
    }

    getUnitInfo() {
        return unitInfo;
    }

    getQuizData() {
        return quizData;
    }

    // --- Word States (learning progress per word) ---
    getWordStates() {
        return this._get(KEYS.WORD_STATES) || {};
    }

    getWordState(wordId) {
        const states = this.getWordStates();
        return states[wordId] || null;
    }

    saveWordState(wordId, state) {
        const states = this.getWordStates();
        states[wordId] = state;
        this._set(KEYS.WORD_STATES, states);
    }

    /**
     * Get words that are due for review (nextReview <= now)
     */
    getDueWords() {
        const states = this.getWordStates();
        const now = Date.now();
        const dueWordIds = [];

        for (const [wordId, state] of Object.entries(states)) {
            if (state.nextReview && state.nextReview <= now && state.repetitions > 0) {
                dueWordIds.push(wordId);
            }
        }

        return dueWordIds;
    }

    /**
     * Get words from a unit that haven't been studied yet
     */
    getNewWords(unitId, count = 5) {
        const unitWords = vocabData[unitId] || [];
        const states = this.getWordStates();
        const newWords = unitWords.filter(w => !states[w.id]);
        return newWords.slice(0, count);
    }

    /**
     * Get count of mastered words (repetitions >= 3 and interval >= 7 days)
     */
    getMasteredWordCount() {
        const states = this.getWordStates();
        let count = 0;
        for (const state of Object.values(states)) {
            if (state.repetitions >= 3 && state.interval >= 7) {
                count++;
            }
        }
        return count;
    }

    /**
     * Get count of words currently being learned
     */
    getLearningWordCount() {
        const states = this.getWordStates();
        return Object.keys(states).length;
    }

    // --- Stats ---
    getStats() {
        return this._get(KEYS.STATS) || {
            stars: 0,
            streak: 0,
            bestStreak: 0,
            totalWords: 0,
            totalQuizzes: 0,
            lastStudyDate: null,
        };
    }

    addStars(count) {
        const stats = this.getStats();
        stats.stars += count;
        this._set(KEYS.STATS, stats);
        return stats.stars;
    }

    updateStreak() {
        const stats = this.getStats();
        const today = new Date().toISOString().split('T')[0];

        if (stats.lastStudyDate === today) {
            // Already studied today
            return stats.streak;
        }

        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        if (stats.lastStudyDate === yesterday) {
            // Consecutive day
            stats.streak += 1;
        } else if (!stats.lastStudyDate) {
            // First time
            stats.streak = 1;
        } else {
            // Streak broken
            stats.streak = 1;
        }

        stats.lastStudyDate = today;
        if (stats.streak > stats.bestStreak) {
            stats.bestStreak = stats.streak;
        }

        this._set(KEYS.STATS, stats);
        return stats.streak;
    }

    incrementTotalWords(count = 1) {
        const stats = this.getStats();
        stats.totalWords += count;
        this._set(KEYS.STATS, stats);
    }

    incrementTotalQuizzes() {
        const stats = this.getStats();
        stats.totalQuizzes += 1;
        this._set(KEYS.STATS, stats);
    }

    // --- Study Days ---
    getStudyDays() {
        return this._get(KEYS.STUDY_DAYS) || [];
    }

    recordStudyDay() {
        const days = this.getStudyDays();
        const today = new Date().toISOString().split('T')[0];
        if (!days.includes(today)) {
            days.push(today);
            this._set(KEYS.STUDY_DAYS, days);
        }
    }

    // --- Mission ---
    getMission() {
        const mission = this._get(KEYS.MISSION);
        if (!mission) return null;

        // Check if mission is for today
        const today = new Date().toISOString().split('T')[0];
        if (mission.date !== today) {
            return null; // Expired, generate new one
        }
        return mission;
    }

    saveMission(data) {
        this._set(KEYS.MISSION, data);
    }

    // --- Quiz History ---
    getQuizHistory() {
        return this._get(KEYS.QUIZ_HISTORY) || [];
    }

    saveQuizResult(result) {
        const history = this.getQuizHistory();
        history.push({
            ...result,
            date: new Date().toISOString(),
        });
        // Keep last 50 results
        if (history.length > 50) {
            history.splice(0, history.length - 50);
        }
        this._set(KEYS.QUIZ_HISTORY, history);
        this.incrementTotalQuizzes();
    }

    // --- Unit Progress ---
    getUnitProgress() {
        const states = this.getWordStates();
        const progress = {};

        for (const info of unitInfo) {
            const unitWords = vocabData[info.id] || [];
            if (unitWords.length === 0) {
                progress[info.id] = 0;
                continue;
            }
            const studied = unitWords.filter(w => states[w.id]).length;
            progress[info.id] = Math.round((studied / unitWords.length) * 100);
        }

        return progress;
    }

    // --- Skill Levels ---
    getSkillLevels() {
        const states = this.getWordStates();
        const totalStudied = Object.keys(states).length;
        const mastered = this.getMasteredWordCount();

        // Vocab skill
        const vocabSkill = totalStudied > 0
            ? Math.round((mastered / totalStudied) * 100)
            : 0;

        // Grammar skill (from quiz history)
        const quizHistory = this.getQuizHistory();
        const grammarQuizzes = quizHistory.filter(q => q.type === 'grammar' || q.type === 'mixed');
        const grammarSkill = grammarQuizzes.length > 0
            ? Math.round(grammarQuizzes.reduce((sum, q) => sum + (q.score / q.total) * 100, 0) / grammarQuizzes.length)
            : 0;

        return {
            vocab: Math.min(vocabSkill, 100),
            listening: 0, // Placeholder
            grammar: Math.min(grammarSkill, 100),
        };
    }

    // --- Badges ---
    getBadges() {
        const stats = this.getStats();
        const mastered = this.getMasteredWordCount();
        const userData = this.getUserData();

        return [
            { id: 'first-step', icon: '🌱', name: '第一步', unlocked: !!userData?.assessmentComplete },
            { id: 'week-streak', icon: '📅', name: '坚持一周', unlocked: stats.bestStreak >= 7 },
            { id: 'perfect-quiz', icon: '💯', name: '满分王', unlocked: this.getQuizHistory().some(q => q.score === q.total) },
            { id: 'listener', icon: '🎧', name: '听力达人', unlocked: false }, // Placeholder
            { id: 'hundred-words', icon: '📖', name: '百词达人', unlocked: mastered >= 100 },
            { id: 'thirty-days', icon: '🔥', name: '连续30天', unlocked: stats.bestStreak >= 30 },
            { id: 'thousand-stars', icon: '⭐', name: '千星收藏', unlocked: stats.stars >= 1000 },
            { id: 'champion', icon: '🏆', name: '学霸', unlocked: false }, // All units complete
        ];
    }

    // --- Reset (for debugging) ---
    resetAll() {
        Object.values(KEYS).forEach(key => localStorage.removeItem(key));
        this._initDefaults();
    }
}
