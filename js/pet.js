/**
 * Pet - 学习宠物养成系统
 * 
 * 用星星喂养宠物，宠物随学习天数和星星成长。
 * 从蛋 → 幼崽 → 少年 → 成年，共4个阶段。
 * 宠物有心情状态：开心/普通/饿了（取决于今天是否学习）
 */

export class Pet {
    constructor(storage, ui) {
        this.storage = storage;
        this.ui = ui;
    }

    // 宠物成长阶段定义
    static STAGES = [
        { id: 'egg',    name: '神秘蛋蛋',   emoji: '🥚', needStars: 0,   needDays: 0,  desc: '一颗神秘的蛋，等待你的关爱...' },
        { id: 'baby',   name: '小萌芽',     emoji: '🐣', needStars: 20,  needDays: 3,  desc: '刚孵化的小可爱，需要你每天喂养！' },
        { id: 'teen',   name: '小精灵',     emoji: '🐥', needStars: 100, needDays: 7,  desc: '越来越活泼了！继续加油！' },
        { id: 'adult',  name: '学霸鸡',     emoji: '🐔', needStars: 300, needDays: 14, desc: '已经很厉害了，你们一起成为学霸吧！' },
        { id: 'legend', name: '凤凰',       emoji: '🦅', needStars: 800, needDays: 30, desc: '传说中的英语大师！所向披靡！' },
    ];

    // 宠物心情
    static MOODS = {
        happy:   { emoji: '😊', text: '开心', desc: '今天学习了，好开心！' },
        normal:  { emoji: '😐', text: '一般', desc: '今天还没学习哦～' },
        hungry:  { emoji: '😢', text: '饿了', desc: '已经2天没学习了，我好饿...' },
        excited: { emoji: '🤩', text: '兴奋', desc: '连续学了好多天，太棒了！' },
    };

    // 装扮选项
    static ACCESSORIES = [
        { id: 'none',       name: '无装扮',   emoji: '',  cost: 0,   unlocked: true },
        { id: 'hat_star',   name: '⭐ 星星帽', emoji: '🎩', cost: 30,  unlocked: false },
        { id: 'bow',        name: '🎀 蝴蝶结', emoji: '🎀', cost: 50,  unlocked: false },
        { id: 'crown',      name: '👑 皇冠',   emoji: '👑', cost: 100, unlocked: false },
        { id: 'glasses',    name: '🤓 学霸镜', emoji: '🤓', cost: 80,  unlocked: false },
        { id: 'scarf',      name: '🧣 小围巾', emoji: '🧣', cost: 60,  unlocked: false },
        { id: 'flower',     name: '🌸 小花花', emoji: '🌸', cost: 40,  unlocked: false },
        { id: 'sparkle',    name: '✨ 闪闪光', emoji: '✨', cost: 120, unlocked: false },
    ];

    /**
     * 获取宠物状态
     */
    getPetData() {
        let data = this.storage._get('eb_pet');
        if (!data) {
            data = {
                name: '小蛋蛋',
                totalFed: 0,         // 总共喂过的星星
                currentAccessory: 'none',
                unlockedAccessories: ['none'],
                createdAt: new Date().toISOString(),
            };
            this.storage._set('eb_pet', data);
        }
        return data;
    }

    savePetData(data) {
        this.storage._set('eb_pet', data);
    }

    /**
     * 获取当前成长阶段
     */
    getCurrentStage() {
        const data = this.getPetData();
        const stats = this.storage.getStats();
        const studyDays = this.storage.getStudyDays().length;

        let currentStage = Pet.STAGES[0];
        for (const stage of Pet.STAGES) {
            if (data.totalFed >= stage.needStars && studyDays >= stage.needDays) {
                currentStage = stage;
            } else {
                break;
            }
        }
        return currentStage;
    }

    /**
     * 获取下一个阶段（用于显示进度）
     */
    getNextStage() {
        const current = this.getCurrentStage();
        const idx = Pet.STAGES.findIndex(s => s.id === current.id);
        if (idx < Pet.STAGES.length - 1) {
            return Pet.STAGES[idx + 1];
        }
        return null;
    }

    /**
     * 获取心情
     */
    getMood() {
        const stats = this.storage.getStats();
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];
        const studyDays = this.storage.getStudyDays();

        if (stats.streak >= 7) return Pet.MOODS.excited;
        if (studyDays.includes(today)) return Pet.MOODS.happy;
        if (!studyDays.includes(yesterday) && !studyDays.includes(twoDaysAgo)) return Pet.MOODS.hungry;
        return Pet.MOODS.normal;
    }

    /**
     * 喂食（花费星星）
     */
    feed(amount = 5) {
        const stats = this.storage.getStats();
        if (stats.stars < amount) {
            this.ui.showToast('星星不够啦，去学习赚更多星星吧 ⭐');
            return false;
        }

        const data = this.getPetData();
        data.totalFed += amount;
        this.savePetData(data);

        // Deduct stars
        stats.stars -= amount;
        this.storage._set('eb_stats', stats);

        return true;
    }

    /**
     * 购买装扮
     */
    buyAccessory(accessoryId) {
        const acc = Pet.ACCESSORIES.find(a => a.id === accessoryId);
        if (!acc) return false;

        const data = this.getPetData();
        if (data.unlockedAccessories.includes(accessoryId)) {
            // Already owned, just equip
            data.currentAccessory = accessoryId;
            this.savePetData(data);
            return true;
        }

        const stats = this.storage.getStats();
        if (stats.stars < acc.cost) {
            this.ui.showToast(`星星不够啦！还需要 ${acc.cost - stats.stars} 颗 ⭐`);
            return false;
        }

        // Purchase
        stats.stars -= acc.cost;
        this.storage._set('eb_stats', stats);

        data.unlockedAccessories.push(accessoryId);
        data.currentAccessory = accessoryId;
        this.savePetData(data);

        this.ui.showToast(`成功解锁「${acc.name}」！`);
        return true;
    }

    /**
     * 渲染宠物卡片（在首页展示）
     */
    renderHomeCard() {
        const container = document.getElementById('petHomeCard');
        if (!container) return;

        const data = this.getPetData();
        const stage = this.getCurrentStage();
        const nextStage = this.getNextStage();
        const mood = this.getMood();
        const stats = this.storage.getStats();
        const studyDays = this.storage.getStudyDays().length;
        const acc = Pet.ACCESSORIES.find(a => a.id === data.currentAccessory);

        // Progress to next stage
        let progressHtml = '';
        if (nextStage) {
            const starProgress = Math.min(100, Math.round((data.totalFed / nextStage.needStars) * 100));
            const dayProgress = Math.min(100, Math.round((studyDays / nextStage.needDays) * 100));
            const overallProgress = Math.min(starProgress, dayProgress);
            progressHtml = `
                <div class="pet-progress">
                    <div class="pet-progress-label">
                        进化到 ${nextStage.emoji} ${nextStage.name}
                    </div>
                    <div class="pet-progress-bar">
                        <div class="pet-progress-fill" style="width: ${overallProgress}%"></div>
                    </div>
                    <div class="pet-progress-detail">
                        ⭐ ${data.totalFed}/${nextStage.needStars} · 📅 ${studyDays}/${nextStage.needDays}天
                    </div>
                </div>
            `;
        } else {
            progressHtml = `<div class="pet-progress-label pet-max">🏆 已满级！传说中的英语大师！</div>`;
        }

        container.innerHTML = `
            <div class="pet-display">
                <div class="pet-avatar">
                    ${acc && acc.emoji ? `<span class="pet-accessory">${acc.emoji}</span>` : ''}
                    <span class="pet-emoji">${stage.emoji}</span>
                    <span class="pet-mood">${mood.emoji}</span>
                </div>
                <div class="pet-info">
                    <div class="pet-name">${data.name}</div>
                    <div class="pet-stage">${stage.name} · ${mood.text}</div>
                    <div class="pet-desc">${mood.desc}</div>
                </div>
            </div>
            ${progressHtml}
            <div class="pet-actions">
                <button class="pet-btn pet-feed-btn" id="petFeedBtn">
                    🍎 喂食 (-5⭐)
                </button>
                <button class="pet-btn pet-dress-btn" id="petDressBtn">
                    👗 装扮
                </button>
            </div>
        `;

        // Bind feed
        document.getElementById('petFeedBtn')?.addEventListener('click', () => {
            if (this.feed(5)) {
                const oldStage = stage;
                const newStage = this.getCurrentStage();

                if (newStage.id !== oldStage.id) {
                    this.ui.showCelebration(
                        newStage.emoji,
                        `${data.name} 进化了！`,
                        `恭喜！你的宠物成长为「${newStage.name}」了！`,
                        () => this.renderHomeCard()
                    );
                } else {
                    this.ui.showToast(`给 ${data.name} 喂了食物 🍎`);
                    this.renderHomeCard();
                }

                // Update top bar stars
                if (window.app) window.app.updateTopBar();
            }
        });

        // Bind dress
        document.getElementById('petDressBtn')?.addEventListener('click', () => {
            this.showDressModal();
        });
    }

    /**
     * 显示装扮选择弹窗
     */
    showDressModal() {
        const data = this.getPetData();
        const stats = this.storage.getStats();

        let modal = document.getElementById('petDressModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'petDressModal';
            modal.className = 'dress-modal hidden';
            document.getElementById('app').appendChild(modal);
        }

        const accessoryHtml = Pet.ACCESSORIES.map(acc => {
            const owned = data.unlockedAccessories.includes(acc.id);
            const equipped = data.currentAccessory === acc.id;
            const canAfford = stats.stars >= acc.cost;

            let statusText, statusClass;
            if (equipped) {
                statusText = '已佩戴';
                statusClass = 'equipped';
            } else if (owned) {
                statusText = '佩戴';
                statusClass = 'owned';
            } else if (canAfford) {
                statusText = `${acc.cost}⭐ 购买`;
                statusClass = 'buyable';
            } else {
                statusText = `${acc.cost}⭐`;
                statusClass = 'locked';
            }

            return `
                <div class="dress-item ${statusClass}" data-acc-id="${acc.id}">
                    <span class="dress-icon">${acc.emoji || '➖'}</span>
                    <span class="dress-name">${acc.name}</span>
                    <span class="dress-status">${statusText}</span>
                </div>
            `;
        }).join('');

        modal.innerHTML = `
            <div class="dress-content">
                <div class="dress-header">
                    <h3>👗 装扮小屋</h3>
                    <span class="dress-stars">⭐ ${stats.stars}</span>
                    <button class="dress-close" id="dressClose">✕</button>
                </div>
                <div class="dress-list">
                    ${accessoryHtml}
                </div>
            </div>
        `;

        modal.classList.remove('hidden');

        // Close button
        document.getElementById('dressClose')?.addEventListener('click', () => {
            modal.classList.add('hidden');
        });

        // Click overlay to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.add('hidden');
        });

        // Item clicks
        modal.querySelectorAll('.dress-item').forEach(item => {
            item.addEventListener('click', () => {
                const accId = item.dataset.accId;
                if (this.buyAccessory(accId)) {
                    modal.classList.add('hidden');
                    this.renderHomeCard();
                    if (window.app) window.app.updateTopBar();
                }
            });
        });
    }

    /**
     * 改名
     */
    renamePet(newName) {
        const data = this.getPetData();
        data.name = newName.trim().slice(0, 8);
        this.savePetData(data);
    }
}
