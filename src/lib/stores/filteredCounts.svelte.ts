import { filteredGamesBaseStore } from './filteredGamesBase.svelte';

export interface FilteredTabCounts {
	all: number;
	completed: number;
	planned: number;
	tierlist: number | null;
}

class FilteredCountsStore {
	counts = $derived.by(() => {
		const baseFiltered = filteredGamesBaseStore.games;

		if (!baseFiltered) return { all: 0, completed: 0, planned: 0, tierlist: null };

		return {
			all: baseFiltered.length,
			completed: baseFiltered.filter((g) => g.status === 'Completed').length,
			planned: baseFiltered.filter((g) => g.status === 'Planned').length,
			tierlist: baseFiltered.filter((g) => g.tier).length,
		};
	});
}

export const filteredCountsStore = new FilteredCountsStore();
