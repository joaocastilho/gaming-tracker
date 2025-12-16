import { beforeEach, describe, expect, it } from 'vitest';
import { appStore } from '$lib/stores/app.svelte';
import { filtersStore } from '$lib/stores/filters.svelte';
import { gamesStore } from '$lib/stores/games.svelte';

/**
 * Comprehensive tests for stores API (Svelte 5 version)
 * These tests ensure behavior is preserved during any store refactoring
 */
describe('FiltersStore API', () => {
	beforeEach(() => {
		filtersStore.resetFilters();
	});

	describe('Initial State', () => {
		it('has empty initial state after reset', () => {
			const state = filtersStore.state;
			expect(state?.searchTerm).toBe('');
			expect(state?.platforms).toEqual([]);
			expect(state?.genres).toEqual([]);
			expect(state?.tiers).toEqual([]);
			expect(state?.coOp).toEqual([]);
			expect(state?.sortOption).toBeNull();
		});

		it('isAnyFilterApplied returns false when no filters set', () => {
			expect(filtersStore.isAnyFilterApplied()).toBe(false);
		});
	});

	describe('Search Term', () => {
		it('setSearchTerm updates searchTerm', () => {
			filtersStore.setSearchTerm('zelda');
			const state = filtersStore.state;
			expect(state?.searchTerm).toBe('zelda');
		});

		it('isAnyFilterApplied returns true when search term set', () => {
			filtersStore.setSearchTerm('test');
			expect(filtersStore.isAnyFilterApplied()).toBe(true);
		});

		it('searchQuery reflects searchTerm', () => {
			filtersStore.setSearchTerm('mario');
			const searchQuery = filtersStore.searchQuery;
			expect(searchQuery).toBe('mario');
		});
	});

	describe('Platform Toggle', () => {
		it('togglePlatform adds platform when not present', () => {
			filtersStore.togglePlatform('PC');
			const state = filtersStore.state;
			expect(state?.platforms).toContain('PC');
		});

		it('togglePlatform removes platform when present', () => {
			filtersStore.togglePlatform('PC');
			filtersStore.togglePlatform('PC');
			const state = filtersStore.state;
			expect(state?.platforms).not.toContain('PC');
		});

		it('togglePlatform handles multiple platforms', () => {
			filtersStore.togglePlatform('PC');
			filtersStore.togglePlatform('PlayStation 5');
			const state = filtersStore.state;
			expect(state?.platforms).toContain('PC');
			expect(state?.platforms).toContain('PlayStation 5');
			expect(state?.platforms.length).toBe(2);
		});

		it('removePlatform removes specific platform', () => {
			filtersStore.togglePlatform('PC');
			filtersStore.togglePlatform('PlayStation 5');
			filtersStore.removePlatform('PC');
			const state = filtersStore.state;
			expect(state?.platforms).not.toContain('PC');
			expect(state?.platforms).toContain('PlayStation 5');
		});

		it('selectedPlatforms reflects platforms', () => {
			filtersStore.togglePlatform('Nintendo Switch');
			const platforms = filtersStore.selectedPlatforms;
			expect(platforms).toContain('Nintendo Switch');
		});
	});

	describe('Genre Toggle', () => {
		it('toggleGenre adds genre when not present', () => {
			filtersStore.toggleGenre('RPG');
			const state = filtersStore.state;
			expect(state?.genres).toContain('RPG');
		});

		it('toggleGenre removes genre when present', () => {
			filtersStore.toggleGenre('RPG');
			filtersStore.toggleGenre('RPG');
			const state = filtersStore.state;
			expect(state?.genres).not.toContain('RPG');
		});

		it('removeGenre removes specific genre', () => {
			filtersStore.toggleGenre('RPG');
			filtersStore.toggleGenre('Action');
			filtersStore.removeGenre('RPG');
			const state = filtersStore.state;
			expect(state?.genres).not.toContain('RPG');
			expect(state?.genres).toContain('Action');
		});

		it('selectedGenres reflects genres', () => {
			filtersStore.toggleGenre('Adventure');
			const genres = filtersStore.selectedGenres;
			expect(genres).toContain('Adventure');
		});
	});

	describe('Tier Toggle', () => {
		it('toggleTier adds tier when not present', () => {
			filtersStore.toggleTier('S - Masterpiece');
			const state = filtersStore.state;
			expect(state?.tiers).toContain('S - Masterpiece');
		});

		it('toggleTier removes tier when present', () => {
			filtersStore.toggleTier('S - Masterpiece');
			filtersStore.toggleTier('S - Masterpiece');
			const state = filtersStore.state;
			expect(state?.tiers).not.toContain('S - Masterpiece');
		});

		it('removeTier removes specific tier', () => {
			filtersStore.toggleTier('S - Masterpiece');
			filtersStore.toggleTier('A - Amazing');
			filtersStore.removeTier('S - Masterpiece');
			const state = filtersStore.state;
			expect(state?.tiers).not.toContain('S - Masterpiece');
			expect(state?.tiers).toContain('A - Amazing');
		});

		it('selectedTiers reflects tiers', () => {
			filtersStore.toggleTier('B - Great');
			const tiers = filtersStore.selectedTiers;
			expect(tiers).toContain('B - Great');
		});
	});

	describe('Co-Op Toggle', () => {
		it('toggleCoOp adds value when not present', () => {
			filtersStore.toggleCoOp('Yes');
			const state = filtersStore.state;
			expect(state?.coOp).toContain('Yes');
		});

		it('toggleCoOp removes value when present', () => {
			filtersStore.toggleCoOp('Yes');
			filtersStore.toggleCoOp('Yes');
			const state = filtersStore.state;
			expect(state?.coOp).not.toContain('Yes');
		});

		it('removeCoOp removes specific value', () => {
			filtersStore.toggleCoOp('Yes');
			filtersStore.toggleCoOp('No');
			filtersStore.removeCoOp('Yes');
			const state = filtersStore.state;
			expect(state?.coOp).not.toContain('Yes');
			expect(state?.coOp).toContain('No');
		});

		it('selectedCoOp reflects coOp', () => {
			filtersStore.toggleCoOp('Yes');
			const coOp = filtersStore.selectedCoOp;
			expect(coOp).toContain('Yes');
		});
	});

	describe('Sort Options', () => {
		it('setSort updates sortOption', () => {
			filtersStore.setSort({ key: 'score', direction: 'desc' });
			const state = filtersStore.state;
			expect(state?.sortOption?.key).toBe('score');
			expect(state?.sortOption?.direction).toBe('desc');
		});

		it('setSort with null clears sortOption', () => {
			filtersStore.setSort({ key: 'score', direction: 'desc' });
			filtersStore.setSort(null);
			const state = filtersStore.state;
			expect(state?.sortOption).toBeNull();
		});
	});

	describe('Reset Filters', () => {
		it('resetFilters clears all filters', () => {
			filtersStore.setSearchTerm('test');
			filtersStore.togglePlatform('PC');
			filtersStore.toggleGenre('RPG');
			filtersStore.toggleTier('S - Masterpiece');
			filtersStore.toggleCoOp('Yes');
			filtersStore.setSort({ key: 'score', direction: 'desc' });

			filtersStore.resetFilters();
			const state = filtersStore.state;

			expect(state?.searchTerm).toBe('');
			expect(state?.platforms).toEqual([]);
			expect(state?.genres).toEqual([]);
			expect(state?.tiers).toEqual([]);
			expect(state?.coOp).toEqual([]);
			expect(state?.sortOption).toBeNull();
		});

		it('resetAllFilters works the same as resetFilters', () => {
			filtersStore.setSearchTerm('test');
			filtersStore.togglePlatform('PC');
			filtersStore.resetAllFilters();

			const state = filtersStore.state;
			expect(state?.searchTerm).toBe('');
			expect(state?.platforms).toEqual([]);
		});
	});

	describe('isAnyFilterApplied', () => {
		it('returns true when platform filter applied', () => {
			filtersStore.togglePlatform('PC');
			expect(filtersStore.isAnyFilterApplied()).toBe(true);
		});

		it('returns true when genre filter applied', () => {
			filtersStore.toggleGenre('RPG');
			expect(filtersStore.isAnyFilterApplied()).toBe(true);
		});

		it('returns true when tier filter applied', () => {
			filtersStore.toggleTier('S - Masterpiece');
			expect(filtersStore.isAnyFilterApplied()).toBe(true);
		});

		it('returns true when coOp filter applied', () => {
			filtersStore.toggleCoOp('Yes');
			expect(filtersStore.isAnyFilterApplied()).toBe(true);
		});

		it('returns false after all filters removed', () => {
			filtersStore.togglePlatform('PC');
			filtersStore.togglePlatform('PC');
			expect(filtersStore.isAnyFilterApplied()).toBe(false);
		});
	});
});

describe('AppStore API', () => {
	beforeEach(() => {
		appStore.setActiveTab('all');
		appStore.setTheme('dark');
	});

	describe('Theme', () => {
		it('setTheme updates theme', () => {
			appStore.setTheme('light');
			const theme = appStore.theme;
			expect(theme).toBe('light');
		});

		it('toggleTheme switches between themes', () => {
			appStore.setTheme('dark');
			appStore.toggleTheme();
			expect(appStore.theme).toBe('light');
			appStore.toggleTheme();
			expect(appStore.theme).toBe('dark');
		});
	});

	describe('Active Tab', () => {
		it('setActiveTab updates activeTab', () => {
			appStore.setActiveTab('completed');
			const tab = appStore.activeTab;
			expect(tab).toBe('completed');
		});

		it('setActiveTab supports all tabs', () => {
			const tabs: ('all' | 'completed' | 'planned' | 'tierlist')[] = [
				'all',
				'completed',
				'planned',
				'tierlist'
			];
			tabs.forEach((tab) => {
				appStore.setActiveTab(tab);
				expect(appStore.activeTab).toBe(tab);
			});
		});
	});

	describe('App State', () => {
		it('appState reflects current state', () => {
			appStore.setTheme('light');
			appStore.setActiveTab('planned');
			const state = appStore.appState;
			expect(state.theme).toBe('light');
			expect(state.activeTab).toBe('planned');
		});
	});
});

describe('GamesStore API', () => {
	const mockGames = [
		{
			id: '1',
			title: 'Test Game 1',
			platform: 'PC',
			genre: 'RPG',
			status: 'Completed',
			tier: 'S',
			coOp: 'No'
		},
		{
			id: '2',
			title: 'Test Game 2',
			platform: 'PlayStation 5',
			genre: 'Action',
			status: 'Planned',
			tier: null,
			coOp: 'Yes'
		}
	];

	beforeEach(() => {
		gamesStore.initializeGames(mockGames);
	});

	describe('Initialize', () => {
		it('initializeGames sets games array', () => {
			const games = gamesStore.games;
			expect(games.length).toBe(2);
		});

		it('initializeGames transforms game data', () => {
			const games = gamesStore.games;
			expect(games[0].title).toBe('Test Game 1');
			expect(games[1].title).toBe('Test Game 2');
		});

		it('loading is false after initialization', () => {
			const loading = gamesStore.loading;
			expect(loading).toBe(false);
		});

		it('handles empty array', () => {
			gamesStore.initializeGames([]);
			const games = gamesStore.games;
			expect(games.length).toBe(0);
		});
	});

	describe('Game Retrieval', () => {
		it('getGameById finds game by id', () => {
			const games = gamesStore.games;
			const firstGameId = games[0]?.id;
			expect(firstGameId).toBeDefined();
			const game = gamesStore.getGameById(firstGameId!);
			expect(game).toBeDefined();
			expect(game?.id).toBe(firstGameId);
		});

		it('getGameById returns undefined for non-existent id', () => {
			const game = gamesStore.getGameById('non-existent-id-12345');
			expect(game).toBeUndefined();
		});

		it('getGameBySlug finds game by slug', () => {
			const game = gamesStore.getGameBySlug('test-game-1');
			expect(game).toBeDefined();
		});
	});

	describe('Derived Properties', () => {
		it('allPlatforms contains unique platforms', () => {
			const platforms = gamesStore.allPlatforms;
			expect(platforms).toContain('PC');
			expect(platforms).toContain('PlayStation 5');
			expect(platforms.length).toBe(2);
		});

		it('allGenres contains unique genres', () => {
			const genres = gamesStore.allGenres;
			expect(genres).toContain('RPG');
			expect(genres).toContain('Action');
			expect(genres.length).toBe(2);
		});
	});

	describe('Add Game', () => {
		it('addGame adds new game to store', () => {
			const newGame = {
				id: '3',
				title: 'New Game',
				mainTitle: 'New Game',
				subtitle: null,
				platform: 'Xbox',
				genre: 'Adventure',
				status: 'Planned' as const,
				coOp: 'No' as const,
				tier: null,
				score: null,
				coverImage: 'covers/new-game.webp',
				year: 2024,
				playtime: '20h 0m',
				finishedDate: null,
				ratingPresentation: null,
				ratingStory: null,
				ratingGameplay: null
			};
			gamesStore.addGame(newGame);
			const games = gamesStore.games;
			expect(games.length).toBe(3);
			expect(games[2].title).toBe('New Game');
		});
	});

	describe('Update Game', () => {
		it('updateGame modifies existing game', () => {
			const games = gamesStore.games;
			const firstGameId = games[0]?.id;
			if (!firstGameId) return;

			gamesStore.updateGame(firstGameId, { title: 'Updated Title' });
			const game = gamesStore.getGameById(firstGameId);
			expect(game?.title).toBe('Updated Title');
		});

		it('updateGame preserves other fields', () => {
			const games = gamesStore.games;
			const firstGameId = games[0]?.id;
			if (!firstGameId) return;

			const gameBefore = gamesStore.getGameById(firstGameId);
			const platformBefore = gameBefore?.platform;
			gamesStore.updateGame(firstGameId, { title: 'Updated Title' });
			const game = gamesStore.getGameById(firstGameId);
			expect(game?.platform).toBe(platformBefore);
		});
	});
});
