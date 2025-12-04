import { writable, derived, type Readable } from 'svelte/store';

export interface AppState {
	theme: 'dark' | 'light';
	activeTab: 'all' | 'completed' | 'planned' | 'tierlist';
}

function createAppStore() {
	const theme = writable<'dark' | 'light'>('dark');
	const activeTab = writable<'all' | 'completed' | 'planned' | 'tierlist'>('all');

	let currentActiveTab: 'all' | 'completed' | 'planned' | 'tierlist' = 'all';
	activeTab.subscribe((v) => (currentActiveTab = v));

	if (typeof window !== 'undefined') {
		const savedTheme = localStorage.getItem('gaming-tracker-theme') as 'dark' | 'light' | null;
		if (savedTheme) {
			theme.set(savedTheme);
			document.documentElement.classList.remove('light', 'dark');
			document.documentElement.classList.add(savedTheme);
		}

		theme.subscribe((t) => {
			localStorage.setItem('gaming-tracker-theme', t);
			document.documentElement.classList.remove('light', 'dark');
			document.documentElement.classList.add(t);
		});
	}

	const appState: Readable<AppState> = derived(
		[theme, activeTab],
		([$theme, $activeTab]) => ({
			theme: $theme,
			activeTab: $activeTab
		})
	);

	return {
		theme,
		activeTab,
		appState,

		toggleTheme() {
			theme.update((t) => (t === 'dark' ? 'light' : 'dark'));
		},

		setTheme(newTheme: 'dark' | 'light') {
			theme.set(newTheme);
		},

		setActiveTab(tab: 'all' | 'completed' | 'planned' | 'tierlist', force = false) {
			if (force || currentActiveTab !== tab) {
				activeTab.set(tab);
			}
		}
	};
}

export const appStore = createAppStore();

export type AppStore = ReturnType<typeof createAppStore>;

