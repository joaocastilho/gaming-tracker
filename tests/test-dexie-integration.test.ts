import { beforeEach, describe, expect, it, afterEach } from 'vitest';
import { appStore } from '$lib/stores/app.svelte';
import { filteredGamesStore } from '$lib/stores/filteredGamesStore.svelte';
import { filtersStore } from '$lib/stores/filters.svelte';
import { gamesStore } from '$lib/stores/games.svelte';
import { db } from '$lib/db';
import type { Game } from '$lib/types/game';

const mockGames: Game[] = [
	{
		id: '1',
		title: 'Zelda BOTW',
		mainTitle: 'Zelda BOTW',
		subtitle: null,
		platform: 'Switch',
		year: 2017,
		genre: 'Adventure',
		coOp: 'No',
		status: 'Completed',
		coverImage: 'covers/zelda.webp',
		playtime: '50h 0m',
		finishedDate: '15/01/2023',
		ratingPresentation: 10,
		ratingStory: 9,
		ratingGameplay: 10,
		score: 19,
		tier: 'S - Masterpiece'
	},
	{
		id: '2',
		title: 'God of War',
		mainTitle: 'God of War',
		subtitle: null,
		platform: 'PS5',
		year: 2022,
		genre: 'Action',
		coOp: 'No',
		status: 'Completed',
		coverImage: 'covers/gow.webp',
		playtime: '30h 0m',
		finishedDate: '20/02/2023',
		ratingPresentation: 9,
		ratingStory: 10,
		ratingGameplay: 9,
		score: 18,
		tier: 'A - Amazing'
	},
	{
		id: '3',
		title: 'Elden Ring',
		mainTitle: 'Elden Ring',
		subtitle: null,
		platform: 'PC',
		year: 2022,
		genre: 'RPG',
		coOp: 'Yes',
		status: 'Planned',
		coverImage: 'covers/elden.webp',
		playtime: '0h 0m',
		finishedDate: null,
		ratingPresentation: null,
		ratingStory: null,
		ratingGameplay: null,
		score: null,
		tier: null
	}
];

describe('Dexie Integration with Stores', () => {
	beforeEach(async () => {
		await db.games.clear();
		await db.games.bulkPut(mockGames);
		gamesStore.initializeGames(mockGames);
		appStore.setActiveTab('all');
		filtersStore.resetFilters();
		await new Promise((resolve) => setTimeout(resolve, 10));
	});

	afterEach(async () => {
		await db.games.clear();
	});

	describe('Filters work after Dexie integration', () => {
		it('filters by search term', () => {
			filtersStore.setSearchTerm('Zelda');
			const results = filteredGamesStore.games;
			expect(results.length).toBe(1);
			expect(results[0].id).toBe('1');
		});

		it('filters by platform', () => {
			filtersStore.togglePlatform('PC');
			const results = filteredGamesStore.games;
			expect(results.length).toBe(1);
			expect(results[0].platform).toBe('PC');
		});

		it('filters by genre', () => {
			filtersStore.toggleGenre('Action');
			const results = filteredGamesStore.games;
			expect(results.length).toBe(1);
			expect(results[0].genre).toBe('Action');
		});

		it('filters by co-op', () => {
			filtersStore.toggleCoOp('Yes');
			const results = filteredGamesStore.games;
			expect(results.length).toBe(1);
			expect(results[0].coOp).toBe('Yes');
		});

		it('filters by tier', () => {
			filtersStore.toggleTier('S - Masterpiece');
			const results = filteredGamesStore.games;
			expect(results.length).toBe(1);
			expect(results[0].tier).toBe('S - Masterpiece');
		});

		it('filters by tab (completed)', () => {
			appStore.setActiveTab('completed');
			const results = filteredGamesStore.games;
			expect(results.length).toBe(2);
			expect(results.every((g) => g.status === 'Completed')).toBe(true);
		});

		it('filters by tab (planned)', () => {
			appStore.setActiveTab('planned');
			const results = filteredGamesStore.games;
			expect(results.length).toBe(1);
			expect(results[0].status).toBe('Planned');
		});

		it('combines multiple filters', () => {
			filtersStore.togglePlatform('PC');
			filtersStore.toggleCoOp('Yes');
			const results = filteredGamesStore.games;
			expect(results.length).toBe(1);
			expect(results[0].id).toBe('3');
		});
	});

	describe('Sorts work after Dexie integration', () => {
		it('sorts by score descending', async () => {
			appStore.setActiveTab('completed');
			filtersStore.setSort({ key: 'score', direction: 'desc' });
			await new Promise((resolve) => setTimeout(resolve, 150));

			const results = filteredGamesStore.games;
			expect(results[0].score).toBe(19);
			expect(results[1].score).toBe(18);
		});

		it('sorts by score ascending', async () => {
			appStore.setActiveTab('completed');
			filtersStore.setSort({ key: 'score', direction: 'asc' });
			await new Promise((resolve) => setTimeout(resolve, 150));

			const results = filteredGamesStore.games;
			expect(results[0].score).toBe(18);
			expect(results[1].score).toBe(19);
		});

		it('sorts by date descending', async () => {
			appStore.setActiveTab('completed');
			filtersStore.setSort({ key: 'finishedDate', direction: 'desc' });
			await new Promise((resolve) => setTimeout(resolve, 150));

			const results = filteredGamesStore.games;
			expect(results[0].id).toBe('2');
			expect(results[1].id).toBe('1');
		});

		it('sorts alphabetically ascending', async () => {
			appStore.setActiveTab('all');
			filtersStore.setSort({ key: 'alphabetical', direction: 'asc' });
			await new Promise((resolve) => setTimeout(resolve, 150));

			const results = filteredGamesStore.games;
			expect(results[0].title).toBe('Elden Ring');
			expect(results[1].title).toBe('God of War');
			expect(results[2].title).toBe('Zelda BOTW');
		});

		it('sorts alphabetically descending', async () => {
			appStore.setActiveTab('all');
			filtersStore.setSort({ key: 'alphabetical', direction: 'desc' });
			await new Promise((resolve) => setTimeout(resolve, 150));

			const results = filteredGamesStore.games;
			expect(results[0].title).toBe('Zelda BOTW');
			expect(results[2].title).toBe('Elden Ring');
		});
	});

	describe('Data persistence with Dexie', () => {
		it('persists games to Dexie when initialized', async () => {
			const stored = await db.games.toArray();
			expect(stored.length).toBe(3);
		});

		it('retrieves correct game by id from Dexie', async () => {
			const game = await db.games.get('1');
			expect(game?.title).toBe('Zelda BOTW');
		});

		it('can query Dexie by status', async () => {
			const completed = await db.games.where('status').equals('Completed').toArray();
			expect(completed.length).toBe(2);
		});

		it('can query Dexie by platform', async () => {
			const pcGames = await db.games.where('platform').equals('PC').toArray();
			expect(pcGames.length).toBe(1);
			expect(pcGames[0].title).toBe('Elden Ring');
		});
	});
});
