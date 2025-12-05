/**
 * Filtered Counts Store - Svelte 5 Runes
 * Tracks count of games in each tab after filters are applied
 */

export interface FilteredTabCounts {
	all: number;
	completed: number;
	planned: number;
	tierlist: number | null;
}

const initialState: FilteredTabCounts = {
	all: 0,
	completed: 0,
	planned: 0,
	tierlist: null
};

class FilteredCountsStore {
	counts = $state<FilteredTabCounts>({ ...initialState });

	setCounts(newCounts: FilteredTabCounts) {
		this.counts = newCounts;
	}

	updateCount(tab: keyof FilteredTabCounts, count: number) {
		this.counts = {
			...this.counts,
			[tab]: count
		};
	}

	reset() {
		this.counts = { ...initialState };
	}
}

export const filteredCountsStore = new FilteredCountsStore();
