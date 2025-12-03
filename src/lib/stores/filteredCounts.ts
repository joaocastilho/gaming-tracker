import { writable } from 'svelte/store';

export interface FilteredTabCounts {
	all: number;
	completed: number;
	planned: number;
	tierlist: number | null;
}

function createFilteredCountsStore() {
	const counts = writable<FilteredTabCounts>({
		all: 0,
		completed: 0,
		planned: 0,
		tierlist: null
	});

	return {
		subscribe: counts.subscribe,
		set: counts.set,
		update: counts.update,

		setCounts(newCounts: FilteredTabCounts) {
			counts.set(newCounts);
		},

		updateCount(tab: keyof FilteredTabCounts, count: number) {
			counts.update((current) => ({
				...current,
				[tab]: count
			}));
		}
	};
}

export const filteredCountsStore = createFilteredCountsStore();
