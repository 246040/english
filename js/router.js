/**
 * Router - Simple SPA screen navigation
 * Manages screen transitions with animations
 */

export class Router {
    constructor() {
        this.currentScreen = 'splash';
        this.history = ['splash'];
    }

    /**
     * Navigate to a screen by name
     * @param {string} screenName - Maps to element id `screen-${screenName}`
     */
    navigate(screenName) {
        const targetId = `screen-${screenName}`;
        const targetEl = document.getElementById(targetId);

        if (!targetEl) {
            console.warn(`Screen not found: ${targetId}`);
            return;
        }

        // Hide current screen
        const currentEl = document.getElementById(`screen-${this.currentScreen}`);
        if (currentEl && currentEl !== targetEl) {
            currentEl.classList.remove('active');
            currentEl.classList.remove('screen-enter');
        }

        // Show target screen
        targetEl.classList.add('active');
        targetEl.classList.add('screen-enter');

        // Remove animation class after it completes
        setTimeout(() => {
            targetEl.classList.remove('screen-enter');
        }, 400);

        // Scroll to top
        targetEl.scrollTop = 0;

        // Update state
        this.currentScreen = screenName;
        this.history.push(screenName);
    }

    /**
     * Go back to previous screen
     */
    back() {
        if (this.history.length > 1) {
            this.history.pop(); // Remove current
            const prev = this.history[this.history.length - 1];
            this.navigate(prev);
        }
    }

    /**
     * Get current screen name
     */
    getCurrent() {
        return this.currentScreen;
    }
}
