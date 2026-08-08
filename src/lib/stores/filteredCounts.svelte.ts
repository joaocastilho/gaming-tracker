import { filteredGamesBaseStore } from './filteredGamesBase.svelte';

export interface FilteredTabCounts {
	all: number;
	completed: number;
	planned: number;
	tierlist: number | null;
}

class FilteredCountsStore {
	private lastCounts: FilteredTabCounts | null = null;

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

		const next: FilteredTabCounts = {
			all: baseFiltered.length,
			completed,
			planned,
			tierlist,
		};

		if (
			this.lastCounts &&
			this.lastCounts.all === next.all &&
			this.lastCounts.completed === next.completed &&
			this.lastCounts.planned === next.planned &&
			this.lastCounts.tierlist === next.tierlist
		) {
			return this.lastCounts;
		}

		this.lastCounts = next;
		return next;
	});
}

export const filteredCountsStore = new FilteredCountsStore();
