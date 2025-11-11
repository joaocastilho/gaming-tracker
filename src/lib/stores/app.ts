import { writable, derived, get } from 'svelte/store';
import { replaceState } from '$app/navigation';
import type { filtersStore as FiltersStoreType } from './filters.js';

export interface AppState {
	theme: 'dark' | 'light';
	activeTab: 'all' | 'completed' | 'planned' | 'tierlist';
}

function createAppStore() {
	const theme = writable<'dark' | 'light'>('dark');
	const activeTab = writable<'all' | 'completed' | 'planned' | 'tierlist'>('all');

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

	const appState = derived(
		[theme, activeTab],
		([$theme, $activeTab]): AppState => ({
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

		setActiveTab(tab: 'all' | 'completed' | 'planned' | 'tierlist') {
			const previousTab = get(activeTab);
			activeTab.set(tab);
			console.log(`📋 Tab Navigation: Changed from "${previousTab}" to "${tab}"`);
		},

		readFromURL(searchParams: URLSearchParams) {
			const themeParam = searchParams.get('theme');
			const tab = searchParams.get('tab');

			if (themeParam && (themeParam === 'dark' || themeParam === 'light')) {
				const currentTheme = get(theme);
				if (themeParam !== currentTheme) {
					theme.set(themeParam);
				}
			}

			if (
				tab &&
				(tab === 'all' || tab === 'completed' || tab === 'planned' || tab === 'tierlist')
			) {
				const currentTab = get(activeTab);
				if (tab !== currentTab) {
					activeTab.set(tab);
				}
			}
		},

		readFromURLWithFilters(searchParams: URLSearchParams, filtersStore: typeof FiltersStoreType) {
			this.readFromURL(searchParams);

			if (filtersStore && typeof filtersStore.readFromURL === 'function') {
				filtersStore.readFromURL(searchParams);
			}
		},

		writeToURL() {
			if (typeof window === 'undefined') return;

			try {
				const url = new URL(window.location.href);

				url.searchParams.delete('theme');
				url.searchParams.delete('tab');
				url.searchParams.delete('view');

				replaceState(url.toString(), {});
			} catch (error) {
				if (!(error instanceof Error) || !error.message.includes('router is initialized')) {
					console.warn('Failed to update URL:', error);
				}
			}
		},

		writeToURLWithFilters(filtersStore: typeof FiltersStoreType) {
			if (typeof window === 'undefined') return;

			this.writeToURL();

			if (filtersStore && typeof filtersStore.writeToURL === 'function') {
				filtersStore.writeToURL();
			}
		}
	};
}

export const appStore = createAppStore();

export type AppStore = ReturnType<typeof createAppStore>;
