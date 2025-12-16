import { beforeEach, describe, expect, it, vi } from 'vitest';
import { filteredGames } from '$lib/stores/filteredGamesStore.svelte';
import { filtersStore } from '$lib/stores/filters.svelte';
import { gamesStore } from '$lib/stores/games.svelte';
import { modalStore } from '$lib/stores/modal.svelte';
import type { Game } from '$lib/types/game';

describe('UI Integration Reproduction', () => {
	const mockGame: Game = {
		id: '1',
		title: 'Test Game',
		mainTitle: 'Test Game',
		subtitle: null,
		platform: 'PC',
		genre: 'Action',
		status: 'Planned',
		year: 2024,
		coverImage: 'test.webp',
		score: null,
		coOp: 'No',
		playtime: '10h 0m',
		finishedDate: null,
		ratingPresentation: null,
		ratingStory: null,
		ratingGameplay: null,
		tier: null
	};

	const mockGameB: Game = {
		...mockGame,
		id: '2',
		title: 'Zelda',
		mainTitle: 'Zelda',
		score: 10
	};

	beforeEach(() => {
		gamesStore.initializeGames([mockGame, mockGameB]);
		filtersStore.resetAllFilters();
		modalStore.closeModal();
	});

	describe('Modal Integration', () => {
		it('should notify subscribers when opening modal', () => {
			const subscriber = vi.fn();
			const unsubscribe = modalStore.subscribe(subscriber);

			expect(subscriber).toHaveBeenCalledTimes(1);
			expect(subscriber.mock.calls[0][0].isOpen).toBe(false);

			modalStore.openViewModal(mockGame, [mockGame, mockGameB]);

			expect(subscriber).toHaveBeenCalledTimes(2);
			expect(subscriber.mock.calls[1][0].isOpen).toBe(true);
			expect(subscriber.mock.calls[1][0].activeGame?.id).toBe(mockGame.id);

			unsubscribe();
		});

		it('should have correct state in getter', () => {
			modalStore.openViewModal(mockGame, []);
			expect(modalStore.isOpen).toBe(true);
			expect(modalStore.activeGame?.id).toBe(mockGame.id);
		});
	});

	describe('Sorting Integration', () => {
		it('should update filteredGames when sort changes', async () => {
			// Initial state: Alphabetical
			// T (Test Game) comes before Z (Zelda)
			let currentGames = filteredGames.value;
			expect(currentGames[0].title).toBe('Test Game');

			// Set sort to Score (Zelda has 10, Test Game has null -> nulls last? or nulls treated as 0?)
			// Let's rely on standard logic: Zelda (10) > Test (null)
			// If Descending: Zelda first.
			filtersStore.setSort({ key: 'score', direction: 'desc' });

			// Need to verify if the subscription notified!
			// filteredGames is a subscription wrapper.
			// Accessing .value should be fresh if it uses the getter from the store.

			// Re-read value
			currentGames = filteredGames.value;
			expect(currentGames[0].title).toBe('Zelda');
		});

		it('should notify subscribers on sort change', () => {
			const subscriber = vi.fn();
			const unsubscribe = filteredGames.subscribe(subscriber);

			// Initial call
			expect(subscriber).toHaveBeenCalledTimes(1);

			filtersStore.setSort({ key: 'score', direction: 'desc' });

			expect(subscriber).toHaveBeenCalledTimes(2);
			const secondCall = subscriber.mock.calls[1][0];
			expect(secondCall[0].title).toBe('Zelda'); // Should be reordered

			unsubscribe();
		});
	});
});
