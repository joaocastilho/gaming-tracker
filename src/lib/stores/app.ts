import { writable } from 'svelte/store';

/**
 * App Store - Manages global application state including theme, view mode, and active tab
 *
 * Features:
 * - theme: 'dark' | 'light' (persisted to localStorage)
 * - viewMode: 'gallery' | 'table' (persisted to localStorage)
 * - activeTab: 'all' | 'completed' | 'planned' | 'tierlist' (URL-based state)
 */

type Theme = 'dark' | 'light';
type ViewMode = 'gallery' | 'table';
type ActiveTab = 'all' | 'completed' | 'planned' | 'tierlist';

function createAppStore() {
	// Initialize stores with defaults
	const themeStore = writable<Theme>('dark');
	const viewModeStore = writable<ViewMode>('gallery');
	const activeTabStore = writable<ActiveTab>('all');

	// Theme persistence
	const THEME_KEY = 'gaming-tracker-theme';

	// Load theme from localStorage on initialization
	if (typeof window !== 'undefined') {
		const savedTheme = localStorage.getItem(THEME_KEY) as Theme;
		if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
			themeStore.set(savedTheme);
		}
	}

	// Apply theme to document and persist changes
	themeStore.subscribe((theme) => {
		if (typeof window !== 'undefined') {
			// Apply theme class to document
			document.documentElement.classList.remove('light', 'dark');
			document.documentElement.classList.add(theme);

			// Persist to localStorage
			localStorage.setItem(THEME_KEY, theme);
		}
	});

	// View mode persistence
	const VIEW_MODE_KEY = 'gaming-tracker-view-mode';

	// Load view mode from localStorage on initialization
	if (typeof window !== 'undefined') {
		const savedViewMode = localStorage.getItem(VIEW_MODE_KEY) as ViewMode;
		if (savedViewMode && (savedViewMode === 'gallery' || savedViewMode === 'table')) {
			viewModeStore.set(savedViewMode);
		}
	}

	// Persist view mode changes
	viewModeStore.subscribe((viewMode) => {
		if (typeof window !== 'undefined') {
			localStorage.setItem(VIEW_MODE_KEY, viewMode);
		}
	});

	return {
		// Theme store
		theme: {
			subscribe: themeStore.subscribe,
			set: themeStore.set,
			update: themeStore.update,
			toggle: () => themeStore.update((current) => (current === 'dark' ? 'light' : 'dark')),
			get: () => {
				let current: Theme = 'dark';
				themeStore.subscribe((value) => (current = value))();
				return current;
			}
		},

		// View mode store
		viewMode: {
			subscribe: viewModeStore.subscribe,
			set: viewModeStore.set,
			update: viewModeStore.update,
			get: () => {
				let current: ViewMode = 'gallery';
				viewModeStore.subscribe((value) => (current = value))();
				return current;
			}
		},

		// Active tab store
		activeTab: {
			subscribe: activeTabStore.subscribe,
			set: activeTabStore.set,
			update: activeTabStore.update,
			get: () => {
				let current: ActiveTab = 'all';
				activeTabStore.subscribe((value) => (current = value))();
				return current;
			}
		},

		// Combined state getter
		getState() {
			let theme: Theme = 'dark';
			let viewMode: ViewMode = 'gallery';
			let activeTab: ActiveTab = 'all';

			themeStore.subscribe((value) => (theme = value))();
			viewModeStore.subscribe((value) => (viewMode = value))();
			activeTabStore.subscribe((value) => (activeTab = value))();

			return { theme, viewMode, activeTab };
		},

		// Reset all state to defaults
		reset() {
			themeStore.set('dark');
			viewModeStore.set('gallery');
			activeTabStore.set('all');
		}
	};
}

// Create and export the app store instance
export const appStore = createAppStore();

// Export types for store values
export type { Theme, ViewMode, ActiveTab };

// Export type for store instance
export type AppStore = ReturnType<typeof createAppStore>;
