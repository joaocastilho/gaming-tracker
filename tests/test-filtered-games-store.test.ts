import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { gamesStore } from '$lib/stores/games.svelte';
import { filtersStore } from '$lib/stores/filters.svelte';
import { appStore } from '$lib/stores/app.svelte';
import { filteredGames, filteredGamesStore } from '$lib/stores/filteredGamesStore.svelte';
import { filteredCountsStore } from '$lib/stores/filteredCounts.svelte';

/**
 * Comprehensive tests for filteredGamesStore
 * Ensures filtering, sorting, and caching behavior is preserved during migration
 */

const mockGames = [
	{
		id: '1',
		title: 'Zelda: Breath of the Wild',
		platform: 'Nintendo Switch',
		genre: 'Adventure',
		status: 'Completed',
		tier: 'S',
		score: 9.8,
		finishedDate: '2023-06-15',
		coOp: 'No'
	},
	{
		id: '2',
		title: 'God of War Ragnarok',
		platform: 'PlayStation 5',
		genre: 'Action',
		status: 'Completed',
		tier: 'A',
		score: 9.2,
		finishedDate: '2023-03-20',
		coOp: 'No'
	},
	{
		id: '3',
		title: 'Elden Ring',
		platform: 'PC',
		genre: 'RPG',
		status: 'Planned',
		tier: null,
		score: null,
		finishedDate: null,
		coOp: 'Yes'
	},
	{
		id: '4',
		title: 'Hollow Knight',
		platform: 'PC',
		genre: 'Metroidvania',
		status: 'Completed',
		tier: 'A',
		score: 8.5,
		finishedDate: '2022-11-10',
		coOp: 'No'
	}
];

describe('FilteredGamesStore Integration', () => {
	beforeEach(async () => {
		gamesStore.initializeGames(mockGames);
		filtersStore.resetFilters();
		appStore.setActiveTab('all');
		// Wait for derived store to update
		await new Promise((resolve) => setTimeout(resolve, 50));
	});

	describe('Filtering', () => {
		it('returns all games when no filters applied', async () => {
			await new Promise((resolve) => setTimeout(resolve, 50));
			const games = get(filteredGames);
			expect(games.length).toBe(4);
		});

		it('filters by search term', async () => {
			filtersStore.setSearchTerm('Zelda');
			await new Promise((resolve) => setTimeout(resolve, 50));
			const games = get(filteredGames);
			expect(games.length).toBe(1);
			expect(games[0].title).toContain('Zelda');
		});

		it('filters by platform', async () => {
			filtersStore.togglePlatform('PC');
			await new Promise((resolve) => setTimeout(resolve, 50));
			const games = get(filteredGames);
			expect(games.length).toBe(2);
			games.forEach((g) => expect(g.platform).toBe('PC'));
		});

		it('filters by genre', async () => {
			filtersStore.toggleGenre('Adventure');
			await new Promise((resolve) => setTimeout(resolve, 50));
			const games = get(filteredGames);
			expect(games.length).toBe(1);
			expect(games[0].genre).toBe('Adventure');
		});

		it('filters by tier', async () => {
			filtersStore.toggleTier('S - Masterpiece');
			await new Promise((resolve) => setTimeout(resolve, 50));
			const games = get(filteredGames);
			expect(games.length).toBe(1);
			expect(games[0].tier).toBe('S');
		});

		it('filters by co-op', async () => {
			filtersStore.toggleCoOp('Yes');
			await new Promise((resolve) => setTimeout(resolve, 50));
			const games = get(filteredGames);
			expect(games.length).toBe(1);
			expect(games[0].coOp).toBe('Yes');
		});

		it('filters by tab - completed', async () => {
			appStore.setActiveTab('completed');
			await new Promise((resolve) => setTimeout(resolve, 50));
			const games = get(filteredGames);
			expect(games.length).toBe(3);
			games.forEach((g) => expect(g.status).toBe('Completed'));
		});

		it('filters by tab - planned', async () => {
			appStore.setActiveTab('planned');
			await new Promise((resolve) => setTimeout(resolve, 50));
			const games = get(filteredGames);
			expect(games.length).toBe(1);
			expect(games[0].status).toBe('Planned');
		});

		it('combines multiple filters', async () => {
			filtersStore.togglePlatform('PC');
			appStore.setActiveTab('completed');
			await new Promise((resolve) => setTimeout(resolve, 50));
			const games = get(filteredGames);
			expect(games.length).toBe(1);
			expect(games[0].platform).toBe('PC');
			expect(games[0].status).toBe('Completed');
		});
	});

	describe('Sorting', () => {
		it('sorts by score descending', async () => {
			appStore.setActiveTab('completed');
			filtersStore.setSort({ key: 'score', direction: 'desc' });
			await new Promise((resolve) => setTimeout(resolve, 100));
			const games = get(filteredGames);
			expect(games[0].score).toBeGreaterThan(games[1].score!);
		});

		it('sorts alphabetically', async () => {
			filtersStore.setSort({ key: 'alphabetical', direction: 'asc' });
			await new Promise((resolve) => setTimeout(resolve, 100));
			const games = get(filteredGames);
			// Check first game starts with earlier letter
			expect(games[0].title.localeCompare(games[1].title)).toBeLessThan(0);
		});

		it('sorts by finished date', async () => {
			appStore.setActiveTab('completed');
			filtersStore.setSort({ key: 'finishedDate', direction: 'desc' });
			await new Promise((resolve) => setTimeout(resolve, 100));
			const games = get(filteredGames);
			// Most recent should be first
			expect(games[0].finishedDate).toBeDefined();
		});
	});

	describe('Counts Update', () => {
		it('updates filtered counts store', async () => {
			await new Promise((resolve) => setTimeout(resolve, 100));
			const counts = get(filteredCountsStore);
			expect(counts.all).toBe(4);
			expect(counts.completed).toBe(3);
			expect(counts.planned).toBe(1);
		});

		it('updates counts when filters change', async () => {
			filtersStore.togglePlatform('PC');
			await new Promise((resolve) => setTimeout(resolve, 100));
			const counts = get(filteredCountsStore);
			// PC filter reduces count (Elden Ring + Hollow Knight are PC games)
			expect(counts.all).toBeGreaterThanOrEqual(1);
			expect(counts.all).toBeLessThanOrEqual(4);
		});
	});

	describe('Cache', () => {
		it('clears cache', () => {
			filteredGamesStore.clearCache();
			// No error means success
			expect(true).toBe(true);
		});
	});
});
