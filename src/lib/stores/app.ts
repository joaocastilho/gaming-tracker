import { writable, derived, get } from 'svelte/store';
import { replaceState } from '$app/navigation';
import type { filtersStore as FiltersStoreType } from './filters.js';

// TypeScript interfaces for app state
export interface AppState {
	theme: 'dark' | 'light';
	activeTab: 'all' | 'completed' | 'planned' | 'tierlist';
}

function createAppStore() {
	const theme = writable<'dark' | 'light'>('dark');
	const activeTab = writable<'all' | 'completed' | 'planned' | 'tierlist'>('all');

	// Initialize from localStorage first
	if (typeof window !== 'undefined') {
		const savedTheme = localStorage.getItem('gaming-tracker-theme') as 'dark' | 'light' | null;
		if (savedTheme) {
			theme.set(savedTheme);
			// Apply theme immediately to document
			document.documentElement.classList.remove('light', 'dark');
			document.documentElement.classList.add(savedTheme);
		}

		const savedActiveTab = localStorage.getItem('gaming-tracker-active-tab') as
			| 'all'
			| 'completed'
			| 'planned'
			| 'tierlist'
			| null;
		if (savedActiveTab) {
			activeTab.set(savedActiveTab);
		}

		// Subscribe to changes and save to localStorage
		theme.subscribe((t) => {
			localStorage.setItem('gaming-tracker-theme', t);
			// Apply theme to document
			document.documentElement.classList.remove('light', 'dark');
			document.documentElement.classList.add(t);
		});

		activeTab.subscribe((tab) => {
			localStorage.setItem('gaming-tracker-active-tab', tab);
		});
	}

	// Derived store for combined app state
	const appState = derived(
		[theme, activeTab],
		([$theme, $activeTab]): AppState => ({
			theme: $theme,
			activeTab: $activeTab
		})
	);

	return {
		// Individual state stores
		theme,
		activeTab,

		// Combined state
		appState,

		// Action methods
		toggleTheme() {
			theme.update((t) => (t === 'dark' ? 'light' : 'dark'));
		},

		setTheme(newTheme: 'dark' | 'light') {
			theme.set(newTheme);
		},

		setActiveTab(tab: 'all' | 'completed' | 'planned' | 'tierlist') {
			activeTab.set(tab);
		},

		// URL parameter management - only override localStorage if URL params are present and different
		readFromURL(searchParams: URLSearchParams) {
			const themeParam = searchParams.get('theme');
			const tab = searchParams.get('tab');

			// Only set theme if URL parameter exists and differs from current localStorage value
			if (themeParam && (themeParam === 'dark' || themeParam === 'light')) {
				const currentTheme = get(theme);
				if (themeParam !== currentTheme) {
					theme.set(themeParam);
				}
			}

			// Only set active tab if URL parameter exists and differs from current localStorage value
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

		// Enhanced URL parameter management with filter support
		readFromURLWithFilters(searchParams: URLSearchParams, filtersStore: typeof FiltersStoreType) {
			// Read app parameters
			this.readFromURL(searchParams);

			// Read filter parameters
			if (filtersStore && typeof filtersStore.readFromURL === 'function') {
				filtersStore.readFromURL(searchParams);
			}
		},

		writeToURL() {
			if (typeof window === 'undefined') return;

			try {
				const url = new URL(window.location.href);

				// Remove all parameters except filters to keep URLs clean
				url.searchParams.delete('theme');
				url.searchParams.delete('tab');
				url.searchParams.delete('view');

				// Use SvelteKit's replaceState
				replaceState(url.toString(), {});
			} catch (error) {
				// Silently ignore router initialization errors
				if (!(error instanceof Error) || !error.message.includes('router is initialized')) {
					console.warn('Failed to update URL:', error);
				}
			}
		},

		// Enhanced writeToURL with filter support
		writeToURLWithFilters(filtersStore: typeof FiltersStoreType) {
			if (typeof window === 'undefined') return;

			// Write app parameters
			this.writeToURL();

			// Write filter parameters
			if (filtersStore && typeof filtersStore.writeToURL === 'function') {
				filtersStore.writeToURL();
			}
		}
	};
}

export const appStore = createAppStore();

export type AppStore = ReturnType<typeof createAppStore>;
