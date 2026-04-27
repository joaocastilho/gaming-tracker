import { test, expect, describe, beforeEach } from 'vitest';
import { filteredGames } from '../src/lib/stores/filteredGamesStore.svelte';
import { filtersStore } from '../src/lib/stores/filters.svelte';
import { gamesStore } from '../src/lib/stores/games.svelte';
import type { Game } from '../src/lib/types/game';

describe('Search Reactivity Integration', () => {
	const mockGames: Partial<Game>[] = [
		{
			id: '1',
			title: 'Zelda: Breath of the Wild',
			genre: 'Action',
			platform: 'Switch',
			status: 'Completed',
			coOp: 'No',
			ratingPresentation: 10,
			ratingStory: 10,
			ratingGameplay: 10,
			score: 10,
			playtime: '50h 0m',
			finishedDate: '2023-01-01',
			mainTitle: 'Zelda',
			subtitle: 'Breath of the Wild',
			year: 2017,
			tier: 'S - Masterpiece',
			coverImage: '',
		},
		{
			id: '2',
			title: 'Super Mario Odyssey',
			genre: 'Platformer',
			platform: 'Switch',
			status: 'Completed',
			coOp: 'No',
			ratingPresentation: 10,
			ratingStory: 10,
			ratingGameplay: 10,
			score: 10,
			playtime: '20h 0m',
			finishedDate: '2023-01-02',
			mainTitle: 'Super Mario',
			subtitle: 'Odyssey',
			year: 2017,
			tier: 'S - Masterpiece',
			coverImage: '',
		},
		{
			id: '3',
			title: 'Hollow Knight',
			genre: 'Metroidvania',
			platform: 'PC',
			status: 'Planned',
			coOp: 'No',
			ratingPresentation: null,
			ratingStory: null,
			ratingGameplay: null,
			score: null,
			playtime: '0h 0m',
			finishedDate: null,
			mainTitle: 'Hollow Knight',
			subtitle: null,
			year: 2017,
			tier: null,
			coverImage: '',
		},
	];

	beforeEach(() => {
		// Initialize stores
		gamesStore.setAllGames(mockGames as Game[]);
		filtersStore.resetAllFilters();
		filtersStore.setSearchTerm('');
	});

	test('filteredGames subscription updates when search term changes', () => {
		let currentGames: Game[] = [];
		const unsubscribe = filteredGames.subscribe((games) => {
			currentGames = games;
		});

		// Initial state
		expect(currentGames).toHaveLength(3);

		// Search for Zelda
		filtersStore.setSearchTerm('zelda');
		expect(currentGames).toHaveLength(1);
		expect(currentGames[0].title).toContain('Zelda');

		// Search for Mario
		filtersStore.setSearchTerm('mario');
		expect(currentGames).toHaveLength(1);
		expect(currentGames[0].title).toContain('Mario');

		// Clear search
		filtersStore.setSearchTerm('');
		expect(currentGames).toHaveLength(3);

		unsubscribe();
	});

	test('search term filtering works on tierlist tab', () => {
		// Only Zelda and Mario have tiers (S)
		// Set search to Mario
		filtersStore.setSearchTerm('mario');

		const tierlistGames = filteredGames.getFilteredGames('tierlist');
		expect(tierlistGames).toHaveLength(1);
		expect(tierlistGames[0].title).toContain('Mario');

		// Search for something not in tierlist
		filtersStore.setSearchTerm('hollow');
		const tierlistGamesEmpty = filteredGames.getFilteredGames('tierlist');
		expect(tierlistGamesEmpty).toHaveLength(0);
	});
});
