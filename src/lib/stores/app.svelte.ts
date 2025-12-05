/**
 * App Store - Svelte 5 Runes
 * Manages theme and active tab state for the application
 */

export type ThemeValue = 'dark' | 'light';
export type TabValue = 'all' | 'completed' | 'planned' | 'tierlist';

export interface AppState {
	theme: ThemeValue;
	activeTab: TabValue;
}

class AppStore {
	theme = $state<ThemeValue>('dark');
	activeTab = $state<TabValue>('all');

	constructor() {
		// Initialize from localStorage in an effect to avoid hydration mismatch
		if (typeof window !== 'undefined') {
			$effect.root(() => {
				$effect(() => {
					// On mount/first run, sync from localStorage if available and not set
					const savedTheme = localStorage.getItem('gaming-tracker-theme') as ThemeValue | null;
					if (savedTheme && savedTheme !== this.theme) {
						this.theme = savedTheme;
					}

					// Sync state to localStorage and DOM
					localStorage.setItem('gaming-tracker-theme', this.theme);
					document.documentElement.classList.remove('light', 'dark');
					document.documentElement.classList.add(this.theme);
				});
			});
		}
	}

	get appState(): AppState {
		return {
			theme: this.theme,
			activeTab: this.activeTab
		};
	}

	toggleTheme() {
		this.theme = this.theme === 'dark' ? 'light' : 'dark';
	}

	setTheme(newTheme: ThemeValue) {
		this.theme = newTheme;
	}

	setActiveTab(tab: TabValue, force = false) {
		if (force || this.activeTab !== tab) {
			this.activeTab = tab;
		}
	}
}

export const appStore = new AppStore();
export type { AppStore };
