import { beforeEach, describe, expect, test } from 'vitest';
import { filteredGames } from '#lib/stores/filteredGamesStore.js';
import { filtersStore } from '#lib/stores/filters.js';
import { gamesStore } from '#lib/stores/games.js';
import type { Game } from '#lib/types/game.js';

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
		gamesStore.initializeGames(mockGames);
		filtersStore.resetAllFilters();
		filtersStore.setSearchTerm('');
	});

	test('filteredGames subscription updates when search term changes', () => {
		expect(filteredGames.games).toHaveLength(3);

		filtersStore.setSearchTerm('zelda');
		expect(filteredGames.games).toHaveLength(1);
		expect(filteredGames.games[0].title).toContain('Zelda');

		filtersStore.setSearchTerm('mario');
		expect(filteredGames.games).toHaveLength(1);
		expect(filteredGames.games[0].title).toContain('Mario');

		filtersStore.setSearchTerm('');
		expect(filteredGames.games).toHaveLength(3);
	});

	test('search term filtering works on tierlist tab', () => {
		filtersStore.setSearchTerm('mario');

		const tierlistGames = filteredGames.getFilteredGames('tierlist');
		expect(tierlistGames).toHaveLength(1);
		expect(tierlistGames[0].title).toContain('Mario');

		filtersStore.setSearchTerm('hollow');
		const tierlistGamesEmpty = filteredGames.getFilteredGames('tierlist');
		expect(tierlistGamesEmpty).toHaveLength(0);
	});
});
