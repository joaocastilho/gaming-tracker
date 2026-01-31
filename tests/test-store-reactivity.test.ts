/**
 * Store Reactivity Tests
 * These tests verify that store subscribers are called when state changes.
 * This catches issues where the subscription mechanism is broken.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises } from './utils';

describe('Store Subscriber Reactivity', () => {
	beforeEach(() => {
		vi.resetModules();
	});

	describe('filtersStore subscriber notifications', () => {
		it('should notify subscribers when setSearchTerm is called', async () => {
			const { filtersStore } = await import('$lib/stores/filters.svelte');
			const callback = vi.fn();

			filtersStore.subscribe(callback);
			// Reset the mock so we only count new calls
			callback.mockClear();

			// Change the search term
			filtersStore.setSearchTerm('test');

			// Subscriber should have been called with the new state
			expect(callback).toHaveBeenCalledTimes(1);
			expect(callback).toHaveBeenCalledWith(expect.objectContaining({ searchTerm: 'test' }));
		});

		it('should notify subscribers when setSort is called', async () => {
			const { filtersStore } = await import('$lib/stores/filters.svelte');
			const callback = vi.fn();

			filtersStore.subscribe(callback);
			callback.mockClear();

			// Change the sort
			filtersStore.setSort({ key: 'score', direction: 'desc' });

			expect(callback).toHaveBeenCalledTimes(1);
			expect(callback).toHaveBeenCalledWith(
				expect.objectContaining({
					sortOption: { key: 'score', direction: 'desc' }
				})
			);
		});

		it('should notify subscribers when togglePlatform is called', async () => {
			const { filtersStore } = await import('$lib/stores/filters.svelte');
			const callback = vi.fn();

			filtersStore.subscribe(callback);
			callback.mockClear();

			filtersStore.togglePlatform('PC');

			expect(callback).toHaveBeenCalledTimes(1);
			expect(callback).toHaveBeenCalledWith(expect.objectContaining({ platforms: ['PC'] }));
		});

		it('should notify subscribers when toggleGenre is called', async () => {
			const { filtersStore } = await import('$lib/stores/filters.svelte');
			const callback = vi.fn();

			filtersStore.subscribe(callback);
			callback.mockClear();

			filtersStore.toggleGenre('Action');

			expect(callback).toHaveBeenCalledTimes(1);
			expect(callback).toHaveBeenCalledWith(expect.objectContaining({ genres: ['Action'] }));
		});

		it('should notify subscribers when resetFilters is called', async () => {
			const { filtersStore } = await import('$lib/stores/filters.svelte');
			const callback = vi.fn();

			// First apply some filters
			filtersStore.setSearchTerm('test');
			filtersStore.togglePlatform('PC');

			filtersStore.subscribe(callback);
			callback.mockClear();

			// Reset filters
			filtersStore.resetFilters();

			expect(callback).toHaveBeenCalledTimes(1);
			expect(callback).toHaveBeenCalledWith(
				expect.objectContaining({
					searchTerm: '',
					platforms: [],
					sortOption: null
				})
			);
		});

		it('should NOT notify subscribers when setting same value (idempotency)', async () => {
			const { filtersStore } = await import('$lib/stores/filters.svelte');
			const callback = vi.fn();

			filtersStore.setSearchTerm('test');

			filtersStore.subscribe(callback);
			callback.mockClear();

			// Set the same value again
			filtersStore.setSearchTerm('test');

			// Should NOT have been called
			expect(callback).not.toHaveBeenCalled();
		});

		it('should support multiple subscribers', async () => {
			const { filtersStore } = await import('$lib/stores/filters.svelte');
			const callback1 = vi.fn();
			const callback2 = vi.fn();

			filtersStore.subscribe(callback1);
			filtersStore.subscribe(callback2);
			callback1.mockClear();
			callback2.mockClear();

			filtersStore.setSearchTerm('test');

			expect(callback1).toHaveBeenCalledTimes(1);
			expect(callback2).toHaveBeenCalledTimes(1);
		});

		it('should stop notifying after unsubscribe', async () => {
			const { filtersStore } = await import('$lib/stores/filters.svelte');
			const callback = vi.fn();

			const unsubscribe = filtersStore.subscribe(callback);
			callback.mockClear();

			unsubscribe();

			filtersStore.setSearchTerm('test');

			// Should NOT be called after unsubscribe
			expect(callback).not.toHaveBeenCalled();
		});
	});

	describe('gamesStore subscriber notifications', () => {
		it('should notify subscribers when games are initialized', async () => {
			const { gamesStore } = await import('$lib/stores/games.svelte');
			const callback = vi.fn();

			gamesStore.subscribe(callback);
			callback.mockClear();

			// Initialize with mock games
			gamesStore.initializeGames([
				{
					id: '1',
					title: 'Test Game',
					platform: 'PC',
					genre: 'Action',
					status: 'Completed'
				}
			]);

			expect(callback).toHaveBeenCalled();
			const lastCall = callback.mock.calls[callback.mock.calls.length - 1];
			expect(lastCall[0]).toHaveLength(1);
		});

		it('should notify subscribers when addGame is called', async () => {
			const { gamesStore } = await import('$lib/stores/games.svelte');
			const callback = vi.fn();

			gamesStore.subscribe(callback);
			callback.mockClear();

			gamesStore.addGame({
				id: 'new-game',
				title: 'New Game',
				mainTitle: 'New Game',
				subtitle: null,
				platform: 'PC',
				year: 2024,
				genre: 'RPG',
				status: 'Planned',
				coverImage: '',
				playtime: '0h 0m',
				finishedDate: null,
				coOp: 'No',
				score: null,
				tier: null,
				ratingGameplay: null,
				ratingPresentation: null,
				ratingStory: null
			});

			expect(callback).toHaveBeenCalled();
		});

		it('should stop notifying after unsubscribe', async () => {
			const { gamesStore } = await import('$lib/stores/games.svelte');
			const callback = vi.fn();

			const unsubscribe = gamesStore.subscribe(callback);
			callback.mockClear();

			unsubscribe();

			gamesStore.initializeGames([{ id: '1', title: 'Test' }]);

			expect(callback).not.toHaveBeenCalled();
		});
	});

	describe('filteredGames subscriber notifications', () => {
		it('should notify subscribers when underlying gamesStore changes', async () => {
			const { filteredGames } = await import('$lib/stores/filteredGamesStore.svelte');
			const { gamesStore } = await import('$lib/stores/games.svelte');
			const callback = vi.fn();

			filteredGames.subscribe(callback);
			callback.mockClear();

			// Initialize games
			gamesStore.initializeGames([
				{
					id: '1',
					title: 'Test Game',
					platform: 'PC',
					genre: 'Action',
					status: 'Completed'
				}
			]);

			// Give time for propagation
			await flushPromises();

			expect(callback).toHaveBeenCalled();
		});

		it('should notify subscribers when underlying filtersStore changes', async () => {
			const { filteredGames } = await import('$lib/stores/filteredGamesStore.svelte');
			const { filtersStore } = await import('$lib/stores/filters.svelte');
			const { gamesStore } = await import('$lib/stores/games.svelte');
			const callback = vi.fn();

			// First initialize games
			gamesStore.initializeGames([
				{
					id: '1',
					title: 'Test Game',
					platform: 'PC',
					genre: 'Action',
					status: 'Completed'
				}
			]);

			filteredGames.subscribe(callback);
			callback.mockClear();

			// Change a filter
			filtersStore.setSearchTerm('test');

			// Give time for propagation
			await flushPromises();

			expect(callback).toHaveBeenCalled();
		});

		it('should notify subscribers when sort changes', async () => {
			const { filteredGames } = await import('$lib/stores/filteredGamesStore.svelte');
			const { filtersStore } = await import('$lib/stores/filters.svelte');
			const { gamesStore } = await import('$lib/stores/games.svelte');
			const callback = vi.fn();

			// First initialize games
			gamesStore.initializeGames([
				{
					id: '1',
					title: 'A Game',
					platform: 'PC',
					genre: 'Action',
					status: 'Completed',
					score: 8
				},
				{
					id: '2',
					title: 'B Game',
					platform: 'PC',
					genre: 'Action',
					status: 'Completed',
					score: 9
				}
			]);

			filteredGames.subscribe(callback);
			callback.mockClear();

			// Change sort
			filtersStore.setSort({ key: 'score', direction: 'desc' });

			// Give time for propagation
			await flushPromises();

			expect(callback).toHaveBeenCalled();
		});
	});
});

describe('Store Subscription Contract', () => {
	beforeEach(() => {
		vi.resetModules();
	});

	it('filtersStore.subscribe should immediately call with current value', async () => {
		const { filtersStore } = await import('$lib/stores/filters.svelte');
		filtersStore.setSearchTerm('initial');

		const callback = vi.fn();
		filtersStore.subscribe(callback);

		expect(callback).toHaveBeenCalledWith(expect.objectContaining({ searchTerm: 'initial' }));
	});

	it('gamesStore.subscribe should immediately call with current value', async () => {
		const { gamesStore } = await import('$lib/stores/games.svelte');

		const callback = vi.fn();
		gamesStore.subscribe(callback);

		expect(callback).toHaveBeenCalledWith(expect.any(Array));
	});

	it('filteredGames.subscribe should immediately call with current value', async () => {
		const { filteredGames } = await import('$lib/stores/filteredGamesStore.svelte');

		const callback = vi.fn();
		filteredGames.subscribe(callback);

		expect(callback).toHaveBeenCalledWith(expect.any(Array));
	});
});
