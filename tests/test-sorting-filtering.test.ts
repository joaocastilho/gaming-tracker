import { describe, it, expect, beforeEach } from 'bun:test';
import { get } from 'svelte/store';
import { gamesStore } from '$lib/stores/games';
import { filtersStore } from '$lib/stores/filters';
import { appStore } from '$lib/stores/app';
import { filteredGames } from '$lib/stores/filteredGamesStore';

// Mock data
const mockGames = [
	{
		id: '1',
		title: 'The Legend of Zelda: Breath of the Wild',
		platform: 'Nintendo Switch',
		genre: 'Adventure',
		tier: 'S',
		status: 'Completed',
		ratingPresentation: 10,
		ratingStory: 9,
		ratingGameplay: 10,
		score: 9.7,
		finishedDate: '2023-01-01T00:00:00.000Z',
		coOp: 'No'
	},
	{
		id: '2',
		title: 'God of War',
		platform: 'PlayStation 5',
		genre: 'Action',
		tier: 'A',
		status: 'Completed',
		ratingPresentation: 9,
		ratingStory: 10,
		ratingGameplay: 9,
		score: 9.3,
		finishedDate: '2023-02-01T00:00:00.000Z',
		coOp: 'No'
	},
	{
		id: '3',
		title: 'Elden Ring',
		platform: 'PC',
		genre: 'RPG',
		tier: 'S',
		status: 'Planned',
		ratingPresentation: null,
		ratingStory: null,
		ratingGameplay: null,
		score: null,
		finishedDate: null,
		coOp: 'Yes'
	},
	{
		id: '4',
		title: 'Hollow Knight',
		platform: 'PC',
		genre: 'Metroidvania',
		tier: 'A',
		status: 'Completed',
		ratingPresentation: 8,
		ratingStory: 8,
		ratingGameplay: 9,
		score: 8.3,
		finishedDate: '2022-12-01T00:00:00.000Z',
		coOp: 'No'
	}
];

describe('Sorting and Filtering Logic', () => {
	beforeEach(async () => {
		// Reset stores
		gamesStore.initializeGames(mockGames);
		appStore.activeTab.set('all');
		filtersStore.resetFilters();
		// Wait for stores to update
		await new Promise((resolve) => setTimeout(resolve, 10));
	});

	it('returns all games when no filters active', () => {
		const results = get(filteredGames);
		expect(results.length).toBe(4);
	});

	it('filters by search term', () => {
		filtersStore.setSearchTerm('Zelda');
		let results = get(filteredGames);
		expect(results.length).toBe(1);
		expect(results[0].title).toBe('The Legend of Zelda: Breath of the Wild');

		filtersStore.setSearchTerm('PC');
		results = get(filteredGames);
		expect(results.length).toBe(2);
	});

	it('filters by platform', () => {
		filtersStore.togglePlatform('Nintendo Switch');
		let results = get(filteredGames);
		expect(results.length).toBe(1);
		expect(results[0].platform).toBe('Nintendo Switch');

		filtersStore.togglePlatform('PC');
		results = get(filteredGames);
		expect(results.length).toBe(3); // Switch OR PC
	});

	it('filters by tab', () => {
		appStore.activeTab.set('completed');
		let results = get(filteredGames);
		expect(results.length).toBe(3);
		expect(results.every((g) => g.status === 'Completed')).toBe(true);

		appStore.activeTab.set('planned');
		results = get(filteredGames);
		expect(results.length).toBe(1);
		expect(results[0].title).toBe('Elden Ring');
	});

	it('sorts games correctly', () => {
		appStore.activeTab.set('completed');

		// Default sort: Date Descending
		let results = get(filteredGames);
		expect(results[0].title).toBe('God of War'); // Feb 2023
		expect(results[1].title).toBe('The Legend of Zelda: Breath of the Wild'); // Jan 2023
		expect(results[2].title).toBe('Hollow Knight'); // Dec 2022

		// Sort by Score Descending
		filtersStore.setSort({ key: 'score', direction: 'desc' });
		results = get(filteredGames);
		expect(results[0].title).toBe('The Legend of Zelda: Breath of the Wild'); // 9.7
		expect(results[1].title).toBe('God of War'); // 9.3
	});

	it('filters by tier', () => {
		// Assuming 'S Tier' matches getTierDisplayName('S')
		filtersStore.toggleTier('S - Masterpiece');
		const results = get(filteredGames);
		expect(results.length).toBe(2);
		expect(results.every((g) => g.tier === 'S')).toBe(true);
		expect(results.every((g) => g.tier === 'S')).toBe(true);
	});

	it('filters by co-op', () => {
		filtersStore.toggleCoOp('Yes');
		const results = get(filteredGames);
		expect(results.length).toBe(1);
		expect(results[0].title).toBe('Elden Ring');
		expect(results[0].coOp).toBe('Yes');
	});
});
