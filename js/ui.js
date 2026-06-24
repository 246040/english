/**
 * UI - Shared UI utilities (toast, celebration, helpers)
 */

export class UI {
    constructor() {
        this.toastTimer = null;
    }

    /**
     * Show a brief toast notification
     */
    showToast(message, duration = 2500) {
        const toast = document.getElementById('toast');
        const toastText = document.getElementById('toastText');

        if (!toast || !toastText) return;

        toastText.textContent = message;
        toast.classList.remove('hidden');

        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => {
            toast.classList.add('hidden');
        }, duration);
    }

    /**
     * Show celebration overlay with confetti
     */
    showCelebration(emoji, title, text, callback) {
        const el = document.getElementById('celebration');
        const emojiEl = document.getElementById('celebrationEmoji');
        const titleEl = document.getElementById('celebrationTitle');
        const textEl = document.getElementById('celebrationText');
        const btn = document.getElementById('celebrationBtn');
        const confettiContainer = document.getElementById('confettiContainer');

        if (!el) return;

        emojiEl.textContent = emoji;
        titleEl.textContent = title;
        textEl.textContent = text;

        // Generate confetti
        confettiContainer.innerHTML = '';
        const colors = ['#6C63FF', '#FF6B9D', '#00D68F', '#FF9F43', '#54A0FF', '#FFD93D'];
        for (let i = 0; i < 40; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = `${Math.random() * 2}s`;
            confetti.style.animationDuration = `${2 + Math.random() * 2}s`;
            confetti.style.width = `${6 + Math.random() * 8}px`;
            confetti.style.height = `${6 + Math.random() * 8}px`;
            confettiContainer.appendChild(confetti);
        }

        el.classList.remove('hidden');

        // Bind close button (replace old listener)
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener('click', () => {
            el.classList.add('hidden');
            confettiContainer.innerHTML = '';
            if (callback) callback();
        });
    }

    /**
     * Hide an element
     */
    hideElement(el) {
        if (typeof el === 'string') el = document.getElementById(el);
        if (el) el.style.display = 'none';
    }

    /**
     * Show an element
     */
    showElement(el, display = 'block') {
        if (typeof el === 'string') el = document.getElementById(el);
        if (el) el.style.display = display;
    }

    /**
     * Create a visual star burst animation at a position
     */
    starBurst(x, y) {
        const container = document.getElementById('app');
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('span');
            star.textContent = '⭐';
            star.style.cssText = `
                position: fixed;
                left: ${x}px;
                top: ${y}px;
                font-size: 20px;
                pointer-events: none;
                z-index: 9999;
                animation: starFloat${i} 1s ease-out forwards;
            `;

            // Create unique keyframes
            const angle = (i / 5) * 360;
            const rad = angle * (Math.PI / 180);
            const dx = Math.cos(rad) * 60;
            const dy = Math.sin(rad) * 60;

            const style = document.createElement('style');
            style.textContent = `
                @keyframes starFloat${i} {
                    0% { transform: translate(0, 0) scale(1); opacity: 1; }
                    100% { transform: translate(${dx}px, ${dy}px) scale(0); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
            container.appendChild(star);

            setTimeout(() => {
                star.remove();
                style.remove();
            }, 1000);
        }
    }

    /**
     * Shuffle an array (Fisher-Yates)
     */
    static shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    /**
     * Pick N random items from an array
     */
    static pickRandom(array, n) {
        return UI.shuffle(array).slice(0, n);
    }
}
