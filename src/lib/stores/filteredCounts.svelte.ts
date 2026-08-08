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

		let completed = 0;
		let planned = 0;
		let tierlist = 0;
		for (const game of baseFiltered) {
			if (game.status === 'Completed') {
				completed++;
			} else if (game.status === 'Planned' || game.status === 'Playing') {
				planned++;
			}
			if (game.tier) tierlist++;
		}

		return { all: baseFiltered.length, completed, planned, tierlist };
	});
}

export const filteredCountsStore = new FilteredCountsStore();
