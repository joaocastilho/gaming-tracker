import { writable, derived, get } from 'svelte/store';
import { replaceState } from '$app/navigation';
import type { FiltersStore } from './filters.js';

// TypeScript interfaces for app state
export interface AppState {
	viewMode: 'gallery' | 'table';
	theme: 'dark' | 'light';
	activeTab: 'all' | 'completed' | 'planned' | 'tierlist';
}

function createAppStore() {
	const viewMode = writable<'gallery' | 'table'>('gallery');
	const theme = writable<'dark' | 'light'>('dark');
	const activeTab = writable<'all' | 'completed' | 'planned' | 'tierlist'>('all');

	// Initialize from localStorage
	if (typeof window !== 'undefined') {
		viewMode.subscribe((mode) => {
			localStorage.setItem('gaming-tracker-view-mode', mode);
		});

		theme.subscribe((t) => {
			localStorage.setItem('gaming-tracker-theme', t);
			// Apply theme to document
			document.documentElement.classList.remove('light', 'dark');
			document.documentElement.classList.add(t);
		});

		// Load from localStorage on initialization
		const savedViewMode = localStorage.getItem('gaming-tracker-view-mode') as
			| 'gallery'
			| 'table'
			| null;
		if (savedViewMode) {
			viewMode.set(savedViewMode);
		}

		const savedTheme = localStorage.getItem('gaming-tracker-theme') as 'dark' | 'light' | null;
		if (savedTheme) {
			theme.set(savedTheme);
		}
	}

	// Derived store for combined app state
	const appState = derived(
		[viewMode, theme, activeTab],
		([$viewMode, $theme, $activeTab]): AppState => ({
			viewMode: $viewMode,
			theme: $theme,
			activeTab: $activeTab
		})
	);

	return {
		// Individual state stores
		viewMode,
		theme,
		activeTab,

		// Combined state
		appState,

		// Action methods
		toggleViewMode() {
			viewMode.update((mode) => (mode === 'gallery' ? 'table' : 'gallery'));
		},

		setViewMode(mode: 'gallery' | 'table') {
			viewMode.set(mode);
		},

		toggleTheme() {
			theme.update((t) => (t === 'dark' ? 'light' : 'dark'));
		},

		setTheme(newTheme: 'dark' | 'light') {
			theme.set(newTheme);
		},

		setActiveTab(tab: 'all' | 'completed' | 'planned' | 'tierlist') {
			activeTab.set(tab);
		},

		// URL parameter management
		readFromURL(searchParams: URLSearchParams) {
			const view = searchParams.get('view');
			const themeParam = searchParams.get('theme');
			const tab = searchParams.get('tab');

			if (view && (view === 'gallery' || view === 'table')) {
				viewMode.set(view);
			}

			if (themeParam && (themeParam === 'dark' || themeParam === 'light')) {
				theme.set(themeParam);
			}

			if (
				tab &&
				(tab === 'all' || tab === 'completed' || tab === 'planned' || tab === 'tierlist')
			) {
				activeTab.set(tab);
			}
		},

		// Enhanced URL parameter management with filter support
		readFromURLWithFilters(searchParams: URLSearchParams, filtersStore: FiltersStore) {
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
				const currentViewMode = get(viewMode);
				const currentTheme = get(theme);
				const currentActiveTab = get(activeTab);
				const url = new URL(window.location.href);

				// Only update if different from defaults to keep URLs clean
				if (currentViewMode !== 'gallery') {
					url.searchParams.set('view', currentViewMode);
				} else {
					url.searchParams.delete('view');
				}

				if (currentTheme !== 'dark') {
					url.searchParams.set('theme', currentTheme);
				} else {
					url.searchParams.delete('theme');
				}

				if (currentActiveTab !== 'all') {
					url.searchParams.set('tab', currentActiveTab);
				} else {
					url.searchParams.delete('tab');
				}

				// Use replaceState to avoid adding to browser history
				replaceState(url.toString(), {});
			} catch (error) {
				// Silently ignore router initialization errors
				if (!(error instanceof Error) || !error.message.includes('router is initialized')) {
					console.warn('Failed to update URL:', error);
				}
			}
		},

		// Enhanced writeToURL with filter support
		writeToURLWithFilters(filtersStore: FiltersStore) {
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
