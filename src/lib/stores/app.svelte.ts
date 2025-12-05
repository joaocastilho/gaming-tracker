/**
 * App Store - Svelte 5 Runes
 * Pure runes-based state with Svelte store compatibility layer
 */
import { writable, derived, type Readable } from 'svelte/store';

export interface AppState {
	theme: 'dark' | 'light';
	activeTab: 'all' | 'completed' | 'planned' | 'tierlist';
}

const themeStore = writable<'dark' | 'light'>('dark');
const activeTabStore = writable<'all' | 'completed' | 'planned' | 'tierlist'>('all');

if (typeof window !== 'undefined') {
	const savedTheme = localStorage.getItem('gaming-tracker-theme') as 'dark' | 'light' | null;
	if (savedTheme) {
		themeStore.set(savedTheme);
		document.documentElement.classList.remove('light', 'dark');
		document.documentElement.classList.add(savedTheme);
	}

	themeStore.subscribe((t) => {
		localStorage.setItem('gaming-tracker-theme', t);
		document.documentElement.classList.remove('light', 'dark');
		document.documentElement.classList.add(t);
	});
}

let currentActiveTab: 'all' | 'completed' | 'planned' | 'tierlist' = 'all';
activeTabStore.subscribe((v) => (currentActiveTab = v));

const appState: Readable<AppState> = derived(
	[themeStore, activeTabStore],
	([$theme, $activeTab]) => ({
		theme: $theme,
		activeTab: $activeTab
	})
);

export const appStore = {
	theme: themeStore,
	activeTab: activeTabStore,
	appState,

	toggleTheme() {
		themeStore.update((t) => (t === 'dark' ? 'light' : 'dark'));
	},

	setTheme(newTheme: 'dark' | 'light') {
		themeStore.set(newTheme);
	},

	setActiveTab(tab: 'all' | 'completed' | 'planned' | 'tierlist', force = false) {
		if (force || currentActiveTab !== tab) {
			activeTabStore.set(tab);
		}
	}
};

export type AppStore = typeof appStore;
