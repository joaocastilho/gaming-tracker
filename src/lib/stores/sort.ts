import { writable } from 'svelte/store';

/**
 * Sort Store - Manages table sorting state
 *
 * Features:
 * - sortBy: current sort column
 * - sortDirection: 'asc' | 'desc'
 * - URL parameter integration
 */
function createSortStore() {
	const { subscribe, set, update } = writable<{
		sortBy: string;
		sortDirection: 'asc' | 'desc';
	}>({
		sortBy: '',
		sortDirection: 'asc'
	});

	return {
		// Subscribe to sort state changes
		subscribe,

		// Get current sort state
		get state() {
			let currentState: { sortBy: string; sortDirection: 'asc' | 'desc' } = {
				sortBy: '',
				sortDirection: 'asc'
			};
			update((state) => {
				currentState = state;
				return state;
			});
			return currentState;
		},

		// Set sort column and direction
		setSort(sortBy: string, sortDirection: 'asc' | 'desc' = 'asc') {
			update(() => ({
				sortBy,
				sortDirection
			}));
		},

		// Toggle sort direction for a column
		toggleSort(column: string) {
			update((state) => {
				if (state.sortBy === column) {
					return {
						sortBy: column,
						sortDirection: state.sortDirection === 'asc' ? 'desc' : 'asc'
					};
				} else {
					return {
						sortBy: column,
						sortDirection: 'asc'
					};
				}
			});
		},

		// Clear sorting
		clearSort() {
			set({
				sortBy: '',
				sortDirection: 'asc'
			});
		},

		// Read sort state from URL parameters
		readFromURL(searchParams: URLSearchParams) {
			const sortBy = searchParams.get('sortBy') || '';
			const sortDir = (searchParams.get('sortDir') as 'asc' | 'desc') || 'asc';

			if (sortBy) {
				set({
					sortBy,
					sortDirection: sortDir
				});
			}
		},

		// Write sort state to URL parameters
		writeToURL() {
			if (typeof window === 'undefined') return;

			const currentState = this.state;
			const url = new URL(window.location.href);

			if (currentState.sortBy) {
				url.searchParams.set('sortBy', currentState.sortBy);
				url.searchParams.set('sortDir', currentState.sortDirection);
			} else {
				url.searchParams.delete('sortBy');
				url.searchParams.delete('sortDir');
			}

			// Use replaceState to avoid adding to browser history
			window.history.replaceState({}, '', url.toString());
		},

		// Reset to default state
		reset() {
			set({
				sortBy: '',
				sortDirection: 'asc'
			});
		}
	};
}

// Create and export the sort store instance
export const sortStore = createSortStore();

// Export type for store value
export type SortStore = ReturnType<typeof createSortStore>;
