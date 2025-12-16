import { beforeEach, describe, expect, it, vi } from 'vitest';
import { filteredGames } from '$lib/stores/filteredGamesStore.svelte';
import { filtersStore } from '$lib/stores/filters.svelte';
import { gamesStore } from '$lib/stores/games.svelte';
import type { Game } from '$lib/types/game';

describe('Sorting Reproduction', () => {
	const mockGames: Game[] = [
		{
			id: '1',
			title: 'A Game',
			mainTitle: 'A Game',
			subtitle: null,
			platform: 'PC',
			genre: 'RPG',
			status: 'Planned',
			year: 2020,
			coverImage: 'a.webp',
			score: 10,
			coOp: 'No',
			playtime: '10h 0m',
			finishedDate: null,
			ratingPresentation: null,
			ratingStory: null,
			ratingGameplay: null,
			tier: null
		},
		{
			id: '2',
			title: 'B Game',
			mainTitle: 'B Game',
			subtitle: null,
			platform: 'PC',
			genre: 'Action',
			status: 'Planned',
			year: 2021,
			coverImage: 'b.webp',
			score: 5,
			coOp: 'No',
			playtime: '5h 0m',
			finishedDate: null,
			ratingPresentation: null,
			ratingStory: null,
			ratingGameplay: null,
			tier: null
		}
	];

	beforeEach(() => {
		gamesStore.initializeGames(mockGames);
		filtersStore.resetAllFilters();
	});

	it('should notify subscribers when sort changes', async () => {
		const subscriber = vi.fn();
		const unsubscribe = filteredGames.subscribe(subscriber);

		// Initial call
		expect(subscriber).toHaveBeenCalledTimes(1);
		expect(subscriber.mock.calls[0][0][0].title).toBe('A Game');

		// Change sort
		filtersStore.setSort({ key: 'score', direction: 'asc' });

		// Wait for potential async updates if any (stores are usually synchronous but let's be safe)
		// In current implementation, it should be synchronous or microtask.
		// Subscriber should be called again
		expect(subscriber).toHaveBeenCalledTimes(2);

		const secondCallValue = subscriber.mock.calls[1][0];
		expect(secondCallValue[0].title).toBe('B Game');

		unsubscribe();
	});
});
