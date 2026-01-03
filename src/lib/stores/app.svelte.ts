import { untrack } from 'svelte';
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
		// Initialize from localStorage immediately to avoid hydration mismatch
		if (typeof window !== 'undefined') {
			const savedTheme = localStorage.getItem('gaming-tracker-theme') as ThemeValue | null;
			if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
				this.theme = savedTheme;
			}

			$effect.root(() => {
				$effect(() => {
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

	// For backwards compatibility with $appStore subscription
	subscribe(fn: (value: AppState) => void): () => void {
		fn(this.appState);

		const root = $effect.root(() => {
			let first = true;
			$effect(() => {
				const state = this.appState;
				if (first) {
					first = false;
					return;
				}
				untrack(() => fn(state));
			});
		});

		return () => {
			root();
		};
	}
}

export const appStore = new AppStore();
export type { AppStore };
