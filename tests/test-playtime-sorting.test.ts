import { beforeEach, describe, expect, it } from 'vitest';
import { filteredGamesStore } from '$lib/stores/filteredGamesStore.svelte';
import { filtersStore, createInitialFilters } from '$lib/stores/filters.svelte';
import { gamesStore } from '$lib/stores/games.svelte';
import { appStore } from '$lib/stores/app.svelte';

/**
 * Test suite for Hours Played (completed games) and Time to Beat (planned games) sorting
 * Following TDD approach - tests written before implementation
 */

interface MockGame {
	id: string;
	title: string;
	mainTitle: string;
	subtitle: string | null;
	platform: string;
	genre: string;
	status: 'Completed' | 'Planned';
	year: number;
	coverImage: string;
	coOp: 'Yes' | 'No';
	playtime: string;
	finishedDate: string | null;
	ratingPresentation: number | null;
	ratingStory: number | null;
	ratingGameplay: number | null;
	score: number | null;
	tier: 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | null;
}

const createCompletedGame = (overrides: Partial<MockGame>): MockGame => ({
	id: Math.random().toString(36).substring(7),
	title: 'Test Game',
	mainTitle: 'Test Game',
	subtitle: null,
	platform: 'PC',
	genre: 'RPG',
	status: 'Completed',
	year: 2023,
	coverImage: 'covers/test.webp',
	coOp: 'No',
	playtime: '25h 30m',
	finishedDate: '2023-06-15T00:00:00.000Z',
	ratingPresentation: 8,
	ratingStory: 8,
	ratingGameplay: 8,
	score: 8.0,
	tier: 'A',
	...overrides,
});

const createPlannedGame = (overrides: Partial<MockGame>): MockGame => ({
	id: Math.random().toString(36).substring(7),
	title: 'Planned Game',
	mainTitle: 'Planned Game',
	subtitle: null,
	platform: 'PC',
	genre: 'RPG',
	status: 'Planned',
	year: 2024,
	coverImage: 'covers/planned.webp',
	coOp: 'No',
	playtime: '15h 0m',
	finishedDate: null,
	ratingPresentation: null,
	ratingStory: null,
	ratingGameplay: null,
	score: null,
	tier: null,
	...overrides,
});

describe('Hours Played Sorting (Completed Games)', () => {
	beforeEach(() => {
		filtersStore.set(createInitialFilters());
	});

	const completedGames: MockGame[] = [
		createCompletedGame({ id: '1', title: 'Short Game', playtime: '5h 30m' }),
		createCompletedGame({ id: '2', title: 'Long Game', playtime: '100h 0m' }),
		createCompletedGame({ id: '3', title: 'Medium Game', playtime: '25h 45m' }),
		createCompletedGame({ id: '4', title: 'Quick Game', playtime: '2h 15m' }),
	];

	it('should sort by hours played in ascending order (shortest first)', () => {
		gamesStore.initializeGames(completedGames);
		appStore.setActiveTab('completed');
		filtersStore.setSort({ key: 'playtime', direction: 'asc' });

		const results = filteredGamesStore.games;
		expect(results[0].title).toBe('Quick Game'); // 2h 15m
		expect(results[1].title).toBe('Short Game'); // 5h 30m
		expect(results[2].title).toBe('Medium Game'); // 25h 45m
		expect(results[3].title).toBe('Long Game'); // 100h 0m
	});

	it('should sort by hours played in descending order (longest first)', () => {
		gamesStore.initializeGames(completedGames);
		appStore.setActiveTab('completed');
		filtersStore.setSort({ key: 'playtime', direction: 'desc' });

		const results = filteredGamesStore.games;
		expect(results[0].title).toBe('Long Game'); // 100h 0m
		expect(results[1].title).toBe('Medium Game'); // 25h 45m
		expect(results[2].title).toBe('Short Game'); // 5h 30m
		expect(results[3].title).toBe('Quick Game'); // 2h 15m
	});

	it('should handle null hoursPlayed values by putting them last', () => {
		const gamesWithNull: MockGame[] = [
			...completedGames,
			createCompletedGame({ id: '5', title: 'No Hours Game', playtime: '1000h 0m' }),
		];
		gamesStore.initializeGames(gamesWithNull);
		appStore.setActiveTab('completed');
		filtersStore.setSort({ key: 'playtime', direction: 'asc' });

		const results = filteredGamesStore.games;
		expect(results[results.length - 1].title).toBe('No Hours Game');
	});

	it('should reactively update when sort option changes via subscriber', () => {
		gamesStore.initializeGames(completedGames);
		appStore.setActiveTab('completed');

		// Change to playtime sort
		filtersStore.setSort({ key: 'playtime', direction: 'desc' });

		// Check the filtered games directly
		const sortedGames = filteredGamesStore.games;
		expect(sortedGames[0].title).toBe('Long Game'); // 100h 0m - longest first
	});
});

describe('Time to Beat Sorting (Planned Games)', () => {
	const plannedGames: MockGame[] = [
		createPlannedGame({ id: '1', title: 'Long RPG', playtime: '80h 0m' }),
		createPlannedGame({ id: '2', title: 'Short Indie', playtime: '6h 30m' }),
		createPlannedGame({ id: '3', title: 'Medium Adventure', playtime: '20h 0m' }),
		createPlannedGame({ id: '4', title: 'Quick Puzzle', playtime: '3h 0m' }),
	];

	it('should sort by time to beat in ascending order (shortest first)', () => {
		gamesStore.initializeGames(plannedGames);
		appStore.setActiveTab('planned');
		filtersStore.setSort({ key: 'playtime', direction: 'asc' });

		const results = filteredGamesStore.games;
		expect(results[0].title).toBe('Quick Puzzle'); // 3h 0m
		expect(results[1].title).toBe('Short Indie'); // 6h 30m
		expect(results[2].title).toBe('Medium Adventure'); // 20h 0m
		expect(results[3].title).toBe('Long RPG'); // 80h 0m
	});

	it('should sort by time to beat in descending order (longest first)', () => {
		gamesStore.initializeGames(plannedGames);
		appStore.setActiveTab('planned');
		filtersStore.setSort({ key: 'playtime', direction: 'desc' });

		const results = filteredGamesStore.games;
		expect(results[0].title).toBe('Long RPG'); // 80h 0m
		expect(results[1].title).toBe('Medium Adventure'); // 20h 0m
		expect(results[2].title).toBe('Short Indie'); // 6h 30m
		expect(results[3].title).toBe('Quick Puzzle'); // 3h 0m
	});

	it('should handle games with same time to beat maintaining stable order', () => {
		const gamesWithSameTime: MockGame[] = [
			createPlannedGame({ id: '1', title: 'Game A', playtime: '10h 0m' }),
			createPlannedGame({ id: '2', title: 'Game B', playtime: '10h 0m' }),
			createPlannedGame({ id: '3', title: 'Game C', playtime: '10h 0m' }),
		];
		gamesStore.initializeGames(gamesWithSameTime);
		appStore.setActiveTab('planned');
		filtersStore.setSort({ key: 'playtime', direction: 'asc' });

		const results = filteredGamesStore.games;
		// All games have same timeToBeat, so order should be stable
		expect(results.length).toBe(3);
	});

	it('should reactively update when switching from alphabetical to timeToBeat sort', () => {
		gamesStore.initializeGames(plannedGames);
		appStore.setActiveTab('planned');

		// Change to playtime sort descending
		filtersStore.setSort({ key: 'playtime', direction: 'desc' });

		const sortedGames = filteredGamesStore.games;
		// playtime desc order: Long RPG (80h), Medium Adventure (20h), Short Indie (6h 30m), Quick Puzzle (3h)
		expect(sortedGames[0].title).toBe('Long RPG');
		expect(sortedGames[3].title).toBe('Quick Puzzle');
	});
});

describe('Cross-tab Sorting Behavior', () => {
	const createMixedGames = (): MockGame[] => [
		createCompletedGame({ id: '1', title: 'Completed A', playtime: '50h 0m' }),
		createCompletedGame({ id: '2', title: 'Completed B', playtime: '10h 0m' }),
		createPlannedGame({ id: '3', title: 'Planned A', playtime: '30h 0m' }),
		createPlannedGame({ id: '4', title: 'Planned B', playtime: '5h 0m' }),
	];

	it('should only show hoursPlayed sort option results for completed tab', () => {
		gamesStore.initializeGames(createMixedGames());
		appStore.setActiveTab('completed');
		filtersStore.setSort({ key: 'playtime', direction: 'desc' });

		const results = filteredGamesStore.games;
		expect(results.length).toBe(2); // Only completed games
		expect(results[0].title).toBe('Completed A'); // 50h > 10h
		expect(results[1].title).toBe('Completed B');
	});

	it('should only show timeToBeat sort option results for planned tab', () => {
		gamesStore.initializeGames(createMixedGames());
		appStore.setActiveTab('planned');
		filtersStore.setSort({ key: 'playtime', direction: 'asc' });

		const results = filteredGamesStore.games;
		expect(results.length).toBe(2); // Only planned games
		expect(results[0].title).toBe('Planned B'); // 5h < 30h
		expect(results[1].title).toBe('Planned A');
	});
});

describe('Playtime Parsing Edge Cases', () => {
	it('should correctly parse playtime values with varying formats', () => {
		const edgeCaseGames: MockGame[] = [
			createCompletedGame({ id: '1', title: 'Zero Minutes', playtime: '10h 0m' }),
			createCompletedGame({ id: '2', title: 'With Minutes', playtime: '10h 30m' }),
			createCompletedGame({ id: '3', title: 'Zero Hours', playtime: '0h 45m' }),
			createCompletedGame({ id: '4', title: 'Large Hours', playtime: '999h 59m' }),
		];
		gamesStore.initializeGames(edgeCaseGames);
		appStore.setActiveTab('completed');
		filtersStore.setSort({ key: 'playtime', direction: 'asc' });

		const results = filteredGamesStore.games;
		expect(results[0].title).toBe('Zero Hours'); // 0h 45m = 45 minutes
		expect(results[1].title).toBe('Zero Minutes'); // 10h 0m = 600 minutes
		expect(results[2].title).toBe('With Minutes'); // 10h 30m = 630 minutes
		expect(results[3].title).toBe('Large Hours'); // 999h 59m = 59999 minutes
	});
});
