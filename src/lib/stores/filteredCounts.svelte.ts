import { writable } from 'svelte/store';

export interface FilteredTabCounts {
	all: number;
	completed: number;
	planned: number;
	tierlist: number | null;
}

function createFilteredCountsStore() {
	const initialState: FilteredTabCounts = {
		all: 0,
		completed: 0,
		planned: 0,
		tierlist: null
	};

	const store = writable<FilteredTabCounts>(initialState);

	return {
		subscribe: store.subscribe,
		set: store.set,
		update: store.update,

		setCounts(newCounts: FilteredTabCounts) {
			store.set(newCounts);
		},

		updateCount(tab: keyof FilteredTabCounts, count: number) {
			store.update((current) => ({
				...current,
				[tab]: count
			}));
		}
	};
}

export const filteredCountsStore = createFilteredCountsStore();
