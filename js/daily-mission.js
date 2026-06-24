/**
 * DailyMission - Manages daily learning missions with streak tracking
 *
 * Generates a three-task daily mission (learn words, take a quiz, review),
 * tracks task completion, maintains a streak counter for consecutive days,
 * and awards bonus stars when all tasks are finished.
 */
export class DailyMission {
    /**
     * @param {object} storage - Persistence layer for mission data, streaks, stars
     * @param {object} ui      - UI helper (toasts, celebrations)
     * @param {object} router  - SPA router for screen navigation
     */
    constructor(storage, ui, router) {
        this.storage = storage;
        this.ui = ui;
        this.router = router;
    }

    /* ─────────────────────── Rendering ────────────────────────────────────── */

    /**
     * Render the daily mission card into #dailyMissionCard.
     * Checks for today's mission; generates one if missing.
     */
    render() {
        const mission = this._getOrCreateMission();
        const container = document.getElementById('dailyMissionCard');
        if (!container) return;

        const stats = this.storage.getStats();
        const streak = stats.streak || 0;

        let html = `
            <div class="mission-title">
                <span class="mission-title-icon">🎯</span>
                <span>今日任务</span>
                <span class="mission-streak" title="连续学习天数">🔥 ${streak}天</span>
            </div>
            <div class="mission-tasks">`;

        mission.tasks.forEach(task => {
            const statusIcon = task.completed ? '✅' : '⬜';
            const doneClass = task.completed ? 'done' : '';
            html += `
                <div class="mission-task ${doneClass}" data-task-id="${task.id}">
                    <span class="mission-task-icon">${task.icon}</span>
                    <div class="mission-task-info">
                        <div class="mission-task-name">${task.name}</div>
                        <div class="mission-task-desc">${task.desc}</div>
                    </div>
                    <span class="mission-task-status">${statusIcon}</span>
                </div>`;
        });

        html += '</div>';

        // Reward section
        if (mission.allComplete) {
            html += `<div class="mission-reward complete">
                        🎉 今日任务全部完成！已获得 10 颗星星
                     </div>`;
        } else {
            const remaining = mission.tasks.filter(t => !t.completed).length;
            html += `<div class="mission-reward pending">
                        ⭐ 完成全部任务可获得 10 颗星星（还剩 ${remaining} 个任务）
                     </div>`;
        }

        container.innerHTML = html;

        // Bind task click handlers (only for incomplete tasks)
        container.querySelectorAll('.mission-task:not(.done)').forEach(el => {
            el.addEventListener('click', () => {
                this._onTaskClick(el.dataset.taskId);
            });
        });
    }

    /* ────────────────────── Mission Generation ───────────────────────────── */

    /**
     * Generate today's mission if one doesn't already exist.
     * @returns {object} Mission data for today
     */
    generateMission() {
        const today = this._todayString();

        const mission = {
            date: today,
            tasks: [
                {
                    id: 'learn-words',
                    name: '背单词',
                    desc: '学习8个新单词或复习单词',
                    icon: '🔤',
                    completed: false,
                },
                {
                    id: 'take-quiz',
                    name: '小测验',
                    desc: '完成一次10题测验',
                    icon: '📝',
                    completed: false,
                },
                {
                    id: 'review-words',
                    name: '复习',
                    desc: '复习5个到期单词',
                    icon: '🔄',
                    completed: false,
                },
            ],
            allComplete: false,
        };

        this.storage.saveMission(mission);
        return mission;
    }

    /* ──────────────────── Task Completion ─────────────────────────────────── */

    /**
     * Mark a specific mission task as completed.
     * Checks if all tasks are now done and triggers celebration + star award.
     * @param {string} taskId - 'learn-words' | 'take-quiz' | 'review-words'
     */
    completeMissionTask(taskId) {
        const mission = this._getOrCreateMission();
        const task = mission.tasks.find(t => t.id === taskId);

        if (!task || task.completed) return;

        task.completed = true;

        // Check if all tasks are now complete
        const allDone = mission.tasks.every(t => t.completed);
        if (allDone && !mission.allComplete) {
            mission.allComplete = true;
            this.storage.addStars(10);
            this.storage.updateStreak();
            this.storage.recordStudyDay();

            this.ui.showCelebration(
                '🎉',
                '今日任务全部完成！',
                '太棒了！你获得了 10 颗星星奖励！坚持每天学习，你一定能进步！',
            );
        }

        this.storage.saveMission(mission);

        // Re-render the card to reflect updated status
        this.render();
    }

    /* ─────────────────────── Helpers ──────────────────────────────────────── */

    /**
     * Get today's mission or create one if it doesn't exist.
     * @returns {object} Mission data
     */
    _getOrCreateMission() {
        const today = this._todayString();
        const existing = this.storage.getMission();

        if (existing && existing.date === today) {
            return existing;
        }

        // New day — generate fresh mission
        return this.generateMission();
    }

    /**
     * Handle a click on a mission task card.
     * Routes the user to the appropriate learning module.
     * @param {string} taskId
     */
    _onTaskClick(taskId) {
        switch (taskId) {
            case 'learn-words':
                // Switch to vocab tab and let the user pick a unit
                this.router.navigate('main');
                // Trigger the vocab tab
                const vocabTab = document.querySelector('[data-tab="vocab"]');
                if (vocabTab) vocabTab.click();
                break;

            case 'take-quiz':
                // Switch to quiz tab
                this.router.navigate('main');
                const quizTab = document.querySelector('[data-tab="quiz"]');
                if (quizTab) quizTab.click();
                break;

            case 'review-words':
                // Start a review session directly
                // This will be handled by the VocabLearner instance in app.js
                const event = new CustomEvent('start-review');
                document.dispatchEvent(event);
                break;

            default:
                break;
        }
    }

    /**
     * Get today's date as a YYYY-MM-DD string.
     * @returns {string}
     */
    _todayString() {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }
}
