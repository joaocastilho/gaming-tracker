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
	tierlist: null,
};

class FilteredCountsStore {
	counts = $state<FilteredTabCounts>({ ...initialState });

	setCounts(newCounts: FilteredTabCounts) {
		this.counts = newCounts;
	}

	updateCount(tab: keyof FilteredTabCounts, count: number) {
		this.counts = {
			...this.counts,
			[tab]: count,
		};
	}

	reset() {
		this.counts = { ...initialState };
	}
}

export const filteredCountsStore = new FilteredCountsStore();
