import { writable } from 'svelte/store';
import { replaceState } from '$app/navigation';

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
		subscribe,

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

		setSort(sortBy: string, sortDirection: 'asc' | 'desc' = 'asc') {
			update(() => ({
				sortBy,
				sortDirection
			}));
		},

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

		clearSort() {
			set({
				sortBy: '',
				sortDirection: 'asc'
			});
		},

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

		writeToURL() {
			if (typeof window === 'undefined') return;

			try {
				const currentState = this.state;
				const url = new URL(window.location.href);

				if (currentState.sortBy) {
					url.searchParams.set('sortBy', currentState.sortBy);
					url.searchParams.set('sortDir', currentState.sortDirection);
				} else {
					url.searchParams.delete('sortBy');
					url.searchParams.delete('sortDir');
				}

				replaceState(url.toString(), {});
			} catch {
				// Ignore router initialization errors
			}
		},

		reset() {
			set({
				sortBy: '',
				sortDirection: 'asc'
			});
		}
	};
}

export const sortStore = createSortStore();

export type SortStore = ReturnType<typeof createSortStore>;
