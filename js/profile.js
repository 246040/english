/**
 * Profile - User profile, statistics, study calendar, skill bars & badges
 *
 * Renders the "Me" tab with learning stats, a monthly study calendar,
 * skill progress bars, and an achievement badge grid.
 */
export class Profile {
    /**
     * @param {object} storage - Persistence layer for user data, stats, study days
     * @param {object} ui      - UI helper (show/hide elements)
     */
    constructor(storage, ui) {
        this.storage = storage;
        this.ui = ui;
    }

    /* ─────────────────────── Main Render ──────────────────────────────────── */

    /**
     * Render all profile sections: identity, stats, calendar, skills, badges.
     */
    render() {
        this._renderIdentity();
        this._renderStats();
        this.renderCalendar();
        this.renderSkillBars();
        this.renderBadges();
    }

    /* ─────────────────── Identity & Stats ─────────────────────────────────── */

    /**
     * Set the user's display name and level/textbook info.
     */
    _renderIdentity() {
        const userData = this.storage.getUserData();
        const nameEl = document.getElementById('profileName');
        const levelEl = document.getElementById('profileLevel');

        if (nameEl) nameEl.textContent = userData.name || '同学';
        if (levelEl) {
            const grade = userData.grade || '';
            const textbook = userData.textbook || '';
            levelEl.textContent = [grade, textbook].filter(Boolean).join(' · ') || '初中英语';
        }
    }

    /**
     * Update the statistics grid with current numbers.
     */
    _renderStats() {
        const stats = this.storage.getStats();
        const wordStates = this.storage.getWordStates();

        // Count mastered words (repetitions >= 3 and lastQuality >= 4)
        const masteredCount = Object.values(wordStates).filter(
            s => s.repetitions >= 3 && s.lastQuality >= 4
        ).length;

        const els = {
            statWords: masteredCount,
            statStreak: stats.streak || 0,
            statStars: stats.stars || 0,
            statQuizzes: stats.quizCount || 0,
        };

        Object.entries(els).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        });
    }

    /* ──────────────────── Study Calendar ──────────────────────────────────── */

    /**
     * Render the current month's calendar with study-day highlights.
     * Days with learning activity get the `.studied` class; today gets `.today`.
     */
    renderCalendar() {
        const grid = document.getElementById('calendarGrid');
        if (!grid) return;

        const studyDays = this.storage.getStudyDays(); // Set or array of 'YYYY-MM-DD'
        const studySet = new Set(Array.isArray(studyDays) ? studyDays : []);

        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const todayDate = now.getDate();
        const todayStr = this._dateString(now);

        // First day of month: 0=Sun, 1=Mon, ...
        const firstDayWeekday = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Header row: 日一二三四五六
        const headers = ['日', '一', '二', '三', '四', '五', '六'];
        let html = '';
        headers.forEach(h => {
            html += `<div class="cal-header">${h}</div>`;
        });

        // Empty cells before the 1st
        for (let i = 0; i < firstDayWeekday; i++) {
            html += '<div class="cal-day empty"></div>';
        }

        // Day cells
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const classes = ['cal-day'];

            if (studySet.has(dateStr)) classes.push('studied');
            if (d === todayDate) classes.push('today');

            html += `<div class="${classes.join(' ')}">${d}</div>`;
        }

        grid.innerHTML = html;
    }

    /* ──────────────────── Skill Progress Bars ────────────────────────────── */

    /**
     * Update skill bar widths and percentage text.
     * - Vocab: mastered words / total studied words
     * - Grammar: average quiz score
     * - Listening: placeholder (0%)
     */
    renderSkillBars() {
        const wordStates = this.storage.getWordStates();
        const quizHistory = this.storage.getQuizHistory();

        // ── Vocab Skill ──
        const totalStudied = Object.keys(wordStates).length;
        const masteredCount = Object.values(wordStates).filter(
            s => s.repetitions >= 3 && s.lastQuality >= 4
        ).length;
        const vocabPct = totalStudied > 0 ? Math.round((masteredCount / totalStudied) * 100) : 0;

        this._setSkillBar('skillVocab', vocabPct);

        // ── Grammar Skill (average quiz score percentage) ──
        let grammarPct = 0;
        if (quizHistory && quizHistory.length > 0) {
            const totalPct = quizHistory.reduce((sum, q) => sum + (q.pct || 0), 0);
            grammarPct = Math.round(totalPct / quizHistory.length);
        }
        this._setSkillBar('skillGrammar', grammarPct);

        // ── Listening Skill (placeholder) ──
        this._setSkillBar('skillListening', 0);
    }

    /**
     * Set a skill bar's width and percentage label.
     * Looks for both the bar element (by id) and a sibling/related pct label.
     * @param {string} barId - DOM id of the bar element
     * @param {number} pct   - Percentage (0-100)
     */
    _setSkillBar(barId, pct) {
        const bar = document.getElementById(barId);
        if (bar) {
            bar.style.width = `${pct}%`;
        }

        // Convention: pct text element id = barId + 'Pct' (e.g. skillVocabPct)
        const pctEl = document.getElementById(barId + 'Pct');
        if (pctEl) {
            pctEl.textContent = `${pct}%`;
        }
    }

    /* ──────────────────── Achievement Badges ─────────────────────────────── */

    /**
     * Render the badge grid in #badgeGrid.
     * Checks unlock conditions against current stats and study data.
     */
    renderBadges() {
        const grid = document.getElementById('badgeGrid');
        if (!grid) return;

        const stats = this.storage.getStats();
        const wordStates = this.storage.getWordStates();
        const quizHistory = this.storage.getQuizHistory();
        const userData = this.storage.getUserData();

        const masteredCount = Object.values(wordStates).filter(
            s => s.repetitions >= 3 && s.lastQuality >= 4
        ).length;
        const hasPerfectQuiz = quizHistory && quizHistory.some(q => q.pct === 100);
        // Listening count placeholder
        const listeningCount = stats.listeningCount || 0;
        const unitProgress = this.storage.getUnitProgress();
        const allUnitsComplete = unitProgress
            ? Object.values(unitProgress).every(p => p === 100)
            : false;

        const badges = [
            {
                emoji: '🌱',
                name: '第一步',
                desc: '完成初始设置',
                unlocked: !!userData.setupComplete,
            },
            {
                emoji: '📅',
                name: '坚持一周',
                desc: '连续学习7天',
                unlocked: (stats.streak || 0) >= 7,
            },
            {
                emoji: '💯',
                name: '满分王',
                desc: '测验获得满分',
                unlocked: !!hasPerfectQuiz,
            },
            {
                emoji: '🎧',
                name: '听力达人',
                desc: '完成50次听力练习',
                unlocked: listeningCount >= 50,
            },
            {
                emoji: '📖',
                name: '百词达人',
                desc: '掌握100个单词',
                unlocked: masteredCount >= 100,
            },
            {
                emoji: '🔥',
                name: '连续30天',
                desc: '连续学习30天',
                unlocked: (stats.streak || 0) >= 30,
            },
            {
                emoji: '⭐',
                name: '千星收藏',
                desc: '累计获得1000颗星星',
                unlocked: (stats.stars || 0) >= 1000,
            },
            {
                emoji: '🏆',
                name: '学霸',
                desc: '完成所有单元学习',
                unlocked: allUnitsComplete,
            },
        ];

        let html = '';
        badges.forEach(b => {
            const lockedClass = b.unlocked ? '' : 'locked';
            html += `<div class="badge-item ${lockedClass}">
                        <div class="badge-emoji">${b.emoji}</div>
                        <div class="badge-name">${b.name}</div>
                        <div class="badge-desc">${b.desc}</div>
                     </div>`;
        });

        grid.innerHTML = html;
    }

    /* ─────────────────────── Helpers ──────────────────────────────────────── */

    /**
     * Format a Date object as 'YYYY-MM-DD'.
     * @param {Date} date
     * @returns {string}
     */
    _dateString(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
}
