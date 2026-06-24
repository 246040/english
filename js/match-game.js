/**
 * MatchGame - 单词配对游戏
 * 
 * 将英文单词与对应中文释义进行连线配对。
 * 支持计时、步数统计、星星奖励和TTS发音。
 */
export class MatchGame {
    /**
     * @param {object} storage - 数据持久层
     * @param {object} ui      - UI工具
     * @param {object} router  - SPA路由
     */
    constructor(storage, ui, router) {
        this.storage = storage;
        this.ui = ui;
        this.router = router;

        // 游戏状态
        this.cards = [];              // 所有卡片 { id, wordId, type, text, matched }
        this.selectedCard = null;     // 当前选中的第一张卡片元素
        this.matchedCount = 0;        // 已配对数量
        this.totalPairs = 0;          // 总配对数
        this.moves = 0;               // 尝试次数
        this.timerInterval = null;    // 计时器句柄
        this.startTime = 0;           // 开始时间
        this.elapsed = 0;             // 已用时间(秒)
        this.isLocked = false;        // 动画期间锁定交互
        this.gameWords = [];          // 本轮选中的单词
    }

    /* ──────────────────────────── 游戏生命周期 ──────────────────────────── */

    /**
     * 开始配对游戏
     * @param {string} unitId - 单元ID
     */
    start(unitId) {
        const vocabData = this.storage.getVocabData();
        const unitWords = vocabData[unitId];

        if (!unitWords || unitWords.length < 6) {
            this.ui.showToast('该单元单词不足，需要至少6个单词');
            return;
        }

        // 随机挑选6个单词
        this.gameWords = this._shuffle(unitWords).slice(0, 6);
        this.totalPairs = this.gameWords.length;

        // 生成12张卡片 (6英文 + 6中文)
        this.cards = [];
        this.gameWords.forEach(word => {
            this.cards.push({
                id: `en_${word.id}`,
                wordId: word.id,
                type: 'en',
                text: word.english,
                matched: false,
            });
            this.cards.push({
                id: `cn_${word.id}`,
                wordId: word.id,
                type: 'cn',
                text: word.chinese,
                matched: false,
            });
        });

        // 洗牌
        this.cards = this._shuffle(this.cards);

        // 重置游戏状态
        this.selectedCard = null;
        this.matchedCount = 0;
        this.moves = 0;
        this.elapsed = 0;
        this.isLocked = false;

        // 切换到游戏屏幕并渲染
        this.router.navigate('match-game');
        this.render();
        this._startTimer();
    }

    /* ──────────────────────────── 游戏渲染 ──────────────────────────── */

    /**
     * 渲染游戏界面
     */
    render() {
        const container = document.getElementById('screen-match-game');
        if (!container) return;

        // 生成卡片网格
        let cardsHtml = '';
        this.cards.forEach(card => {
            const typeClass = card.type === 'en' ? 'english' : 'chinese';
            cardsHtml += `
                <div class="match-card ${typeClass}" 
                     data-card-id="${card.id}"
                     data-word-id="${card.wordId}" 
                     data-type="${card.type}">
                    ${card.text}
                </div>
            `;
        });

        container.innerHTML = `
            <div class="match-header">
                <button class="btn-back" id="matchBack">← 返回</button>
                <span class="match-timer" id="matchTimer">⏱ 0:00</span>
                <span class="match-moves" id="matchMoves">步数: 0</span>
            </div>
            <div class="match-board" id="matchBoard">
                ${cardsHtml}
            </div>
        `;

        // 绑定事件
        this._bindEvents();
    }

    /**
     * 绑定游戏事件
     */
    _bindEvents() {
        // 返回按钮
        const backBtn = document.getElementById('matchBack');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this._stopTimer();
                this.router.navigate('main');
            });
        }

        // 卡片点击 (事件委托到游戏面板)
        const board = document.getElementById('matchBoard');
        if (board) {
            board.addEventListener('click', (e) => {
                const cardEl = e.target.closest('.match-card');
                if (cardEl) this.handleSelect(cardEl);
            });
        }
    }

    /* ──────────────────────────── 交互逻辑 ──────────────────────────── */

    /**
     * 处理卡片点击选择
     * @param {HTMLElement} element - 被点击的卡片DOM元素
     */
    handleSelect(element) {
        // 锁定期间忽略点击
        if (this.isLocked) return;

        // 已配对的卡片忽略
        if (element.classList.contains('matched')) return;

        // 已选中的卡片再次点击取消选中
        if (element.classList.contains('selected')) {
            element.classList.remove('selected');
            this.selectedCard = null;
            return;
        }

        if (!this.selectedCard) {
            // ── 选中第一张卡片 ──
            element.classList.add('selected');
            this.selectedCard = element;
        } else {
            // ── 选中第二张卡片 ──
            const firstType = this.selectedCard.dataset.type;
            const secondType = element.dataset.type;

            // 不允许选择两张同类型的卡片
            if (firstType === secondType) {
                // 取消第一张，选中新的
                this.selectedCard.classList.remove('selected');
                element.classList.add('selected');
                this.selectedCard = element;
                return;
            }

            // 选中第二张并检查匹配
            element.classList.add('selected');
            this.checkMatch(this.selectedCard, element);
        }
    }

    /**
     * 检查两张选中的卡片是否匹配
     * @param {HTMLElement} card1 - 第一张卡片
     * @param {HTMLElement} card2 - 第二张卡片
     */
    checkMatch(card1, card2) {
        this.isLocked = true;
        this.moves++;

        // 更新步数显示
        const movesEl = document.getElementById('matchMoves');
        if (movesEl) movesEl.textContent = `步数: ${this.moves}`;

        const wordId1 = card1.dataset.wordId;
        const wordId2 = card2.dataset.wordId;

        if (wordId1 === wordId2) {
            // ── 配对成功 ──
            this._handleMatch(card1, card2, wordId1);
        } else {
            // ── 配对失败 ──
            this._handleMismatch(card1, card2);
        }
    }

    /**
     * 处理配对成功
     */
    _handleMatch(card1, card2, wordId) {
        // 添加匹配动画
        card1.classList.add('matched');
        card2.classList.add('matched');
        card1.classList.remove('selected');
        card2.classList.remove('selected');

        this.matchedCount++;
        this.selectedCard = null;

        // 更新内部卡片状态
        this.cards.forEach(c => {
            if (c.wordId === wordId) c.matched = true;
        });

        // TTS发音：找到对应的英文单词
        const word = this.gameWords.find(w => w.id === wordId);
        if (word && window.tts) {
            window.tts.speakWord(word.english);
        }

        // 检查是否全部配对完成
        if (this.matchedCount >= this.totalPairs) {
            setTimeout(() => this.showComplete(), 600);
        }

        this.isLocked = false;
    }

    /**
     * 处理配对失败
     */
    _handleMismatch(card1, card2) {
        // 红色闪烁提示
        card1.classList.add('wrong');
        card2.classList.add('wrong');

        // 0.5秒后重置
        setTimeout(() => {
            card1.classList.remove('selected', 'wrong');
            card2.classList.remove('selected', 'wrong');
            this.selectedCard = null;
            this.isLocked = false;
        }, 500);
    }

    /* ──────────────────────────── 计时器 ──────────────────────────── */

    /**
     * 开始计时
     */
    _startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            this.elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(this.elapsed / 60);
            const seconds = this.elapsed % 60;
            const timerEl = document.getElementById('matchTimer');
            if (timerEl) {
                timerEl.textContent = `⏱ ${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }

    /**
     * 停止计时
     */
    _stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /* ──────────────────────────── 游戏完成 ──────────────────────────── */

    /**
     * 显示游戏完成庆祝界面
     */
    showComplete() {
        this._stopTimer();

        // 计算星星奖励
        let stars = 6; // 基础6星

        // 时间加成
        if (this.elapsed < 30) {
            stars += 3;
        } else if (this.elapsed < 45) {
            stars += 2;
        } else if (this.elapsed < 60) {
            stars += 1;
        }

        // 错误惩罚：超过最优次数(6次)的每次多余尝试扣1星
        const extraMoves = Math.max(0, this.moves - this.totalPairs);
        stars = Math.max(1, stars - extraMoves); // 最少1星

        // 保存星星和学习记录
        this.storage.addStars(stars);
        this.storage.recordStudyDay();

        // 时间格式化
        const minutes = Math.floor(this.elapsed / 60);
        const seconds = this.elapsed % 60;
        const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        // 评价
        let emoji, title;
        if (this.elapsed < 30 && extraMoves === 0) {
            emoji = '🏆';
            title = '完美通关！';
        } else if (this.elapsed < 45) {
            emoji = '🌟';
            title = '太棒了！';
        } else {
            emoji = '👍';
            title = '配对完成！';
        }

        // 渲染完成界面
        const container = document.getElementById('screen-match-game');
        if (!container) return;

        container.innerHTML = `
            <div class="match-complete">
                <div class="match-complete-emoji">${emoji}</div>
                <div class="match-complete-title">${title}</div>
                <div class="match-complete-stats">
                    <div class="match-stat">
                        <span class="match-stat-label">⏱ 用时</span>
                        <span class="match-stat-value">${timeStr}</span>
                    </div>
                    <div class="match-stat">
                        <span class="match-stat-label">👆 步数</span>
                        <span class="match-stat-value">${this.moves}</span>
                    </div>
                    <div class="match-stat">
                        <span class="match-stat-label">⭐ 星星</span>
                        <span class="match-stat-value">+${stars}</span>
                    </div>
                </div>
                <button class="btn-match-back" id="matchCompleteBack">返回</button>
            </div>
        `;

        // 返回按钮
        const backBtn = document.getElementById('matchCompleteBack');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.router.navigate('main');
            });
        }

        // 派发完成事件（供任务系统追踪）
        document.dispatchEvent(new CustomEvent('match-game-complete'));
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
