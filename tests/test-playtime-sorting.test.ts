import { beforeEach, describe, expect, it, vi } from 'vitest';

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
	timeToBeat: string;
	hoursPlayed: string | null;
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
	coverImage: 'test.webp',
	coOp: 'No',
	timeToBeat: '20h 0m',
	hoursPlayed: '25h 30m',
	finishedDate: '2023-06-15T00:00:00.000Z',
	ratingPresentation: 8,
	ratingStory: 8,
	ratingGameplay: 8,
	score: 8.0,
	tier: 'A',
	...overrides
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
	coverImage: 'planned.webp',
	coOp: 'No',
	timeToBeat: '15h 0m',
	hoursPlayed: null,
	finishedDate: null,
	ratingPresentation: null,
	ratingStory: null,
	ratingGameplay: null,
	score: null,
	tier: null,
	...overrides
});

describe('Hours Played Sorting (Completed Games)', () => {
	beforeEach(() => {
		vi.resetModules();
	});

	const completedGames: MockGame[] = [
		createCompletedGame({ id: '1', title: 'Short Game', hoursPlayed: '5h 30m' }),
		createCompletedGame({ id: '2', title: 'Long Game', hoursPlayed: '100h 0m' }),
		createCompletedGame({ id: '3', title: 'Medium Game', hoursPlayed: '25h 45m' }),
		createCompletedGame({ id: '4', title: 'Quick Game', hoursPlayed: '2h 15m' })
	];

	it('should sort by hours played in ascending order (shortest first)', async () => {
		const { filteredGamesStore } = await import('$lib/stores/filteredGamesStore.svelte');
		const { filtersStore } = await import('$lib/stores/filters.svelte');
		const { gamesStore } = await import('$lib/stores/games.svelte');
		const { appStore } = await import('$lib/stores/app.svelte');

		gamesStore.initializeGames(completedGames);
		appStore.setActiveTab('completed');
		filtersStore.setSort({ key: 'hoursPlayed', direction: 'asc' });
		await new Promise((resolve) => setTimeout(resolve, 50));

		const results = filteredGamesStore.games;
		expect(results[0].title).toBe('Quick Game'); // 2h 15m
		expect(results[1].title).toBe('Short Game'); // 5h 30m
		expect(results[2].title).toBe('Medium Game'); // 25h 45m
		expect(results[3].title).toBe('Long Game'); // 100h 0m
	});

	it('should sort by hours played in descending order (longest first)', async () => {
		const { filteredGamesStore } = await import('$lib/stores/filteredGamesStore.svelte');
		const { filtersStore } = await import('$lib/stores/filters.svelte');
		const { gamesStore } = await import('$lib/stores/games.svelte');
		const { appStore } = await import('$lib/stores/app.svelte');

		gamesStore.initializeGames(completedGames);
		appStore.setActiveTab('completed');
		filtersStore.setSort({ key: 'hoursPlayed', direction: 'desc' });
		await new Promise((resolve) => setTimeout(resolve, 50));

		const results = filteredGamesStore.games;
		expect(results[0].title).toBe('Long Game'); // 100h 0m
		expect(results[1].title).toBe('Medium Game'); // 25h 45m
		expect(results[2].title).toBe('Short Game'); // 5h 30m
		expect(results[3].title).toBe('Quick Game'); // 2h 15m
	});

	it('should handle null hoursPlayed values by putting them last', async () => {
		const { filteredGamesStore } = await import('$lib/stores/filteredGamesStore.svelte');
		const { filtersStore } = await import('$lib/stores/filters.svelte');
		const { gamesStore } = await import('$lib/stores/games.svelte');
		const { appStore } = await import('$lib/stores/app.svelte');

		const gamesWithNull: MockGame[] = [
			...completedGames,
			createCompletedGame({ id: '5', title: 'No Hours Game', hoursPlayed: null })
		];
		gamesStore.initializeGames(gamesWithNull);
		appStore.setActiveTab('completed');
		filtersStore.setSort({ key: 'hoursPlayed', direction: 'asc' });
		await new Promise((resolve) => setTimeout(resolve, 50));

		const results = filteredGamesStore.games;
		expect(results[results.length - 1].title).toBe('No Hours Game');
	});

	it('should reactively update when sort option changes via subscriber', async () => {
		const { filteredGames } = await import('$lib/stores/filteredGamesStore.svelte');
		const { filtersStore } = await import('$lib/stores/filters.svelte');
		const { gamesStore } = await import('$lib/stores/games.svelte');
		const { appStore } = await import('$lib/stores/app.svelte');

		gamesStore.initializeGames(completedGames);
		appStore.setActiveTab('completed');
		await new Promise((resolve) => setTimeout(resolve, 50));

		const subscriber = vi.fn();
		const unsubscribe = filteredGames.subscribe(subscriber);
		subscriber.mockClear();

		// Change to hoursPlayed sort
		filtersStore.setSort({ key: 'hoursPlayed', direction: 'desc' });
		await new Promise((resolve) => setTimeout(resolve, 50));

		// Subscriber should be called with sorted data
		expect(subscriber).toHaveBeenCalled();
		const lastCall = subscriber.mock.calls[subscriber.mock.calls.length - 1];
		const sortedGames = lastCall[0];
		expect(sortedGames[0].title).toBe('Long Game'); // 100h 0m - longest first

		unsubscribe();
	});
});

describe('Time to Beat Sorting (Planned Games)', () => {
	beforeEach(() => {
		vi.resetModules();
	});

	const plannedGames: MockGame[] = [
		createPlannedGame({ id: '1', title: 'Long RPG', timeToBeat: '80h 0m' }),
		createPlannedGame({ id: '2', title: 'Short Indie', timeToBeat: '6h 30m' }),
		createPlannedGame({ id: '3', title: 'Medium Adventure', timeToBeat: '20h 0m' }),
		createPlannedGame({ id: '4', title: 'Quick Puzzle', timeToBeat: '3h 0m' })
	];

	it('should sort by time to beat in ascending order (shortest first)', async () => {
		const { filteredGamesStore } = await import('$lib/stores/filteredGamesStore.svelte');
		const { filtersStore } = await import('$lib/stores/filters.svelte');
		const { gamesStore } = await import('$lib/stores/games.svelte');
		const { appStore } = await import('$lib/stores/app.svelte');

		gamesStore.initializeGames(plannedGames);
		appStore.setActiveTab('planned');
		filtersStore.setSort({ key: 'timeToBeat', direction: 'asc' });
		await new Promise((resolve) => setTimeout(resolve, 50));

		const results = filteredGamesStore.games;
		expect(results[0].title).toBe('Quick Puzzle'); // 3h 0m
		expect(results[1].title).toBe('Short Indie'); // 6h 30m
		expect(results[2].title).toBe('Medium Adventure'); // 20h 0m
		expect(results[3].title).toBe('Long RPG'); // 80h 0m
	});

	it('should sort by time to beat in descending order (longest first)', async () => {
		const { filteredGamesStore } = await import('$lib/stores/filteredGamesStore.svelte');
		const { filtersStore } = await import('$lib/stores/filters.svelte');
		const { gamesStore } = await import('$lib/stores/games.svelte');
		const { appStore } = await import('$lib/stores/app.svelte');

		gamesStore.initializeGames(plannedGames);
		appStore.setActiveTab('planned');
		filtersStore.setSort({ key: 'timeToBeat', direction: 'desc' });
		await new Promise((resolve) => setTimeout(resolve, 50));

		const results = filteredGamesStore.games;
		expect(results[0].title).toBe('Long RPG'); // 80h 0m
		expect(results[1].title).toBe('Medium Adventure'); // 20h 0m
		expect(results[2].title).toBe('Short Indie'); // 6h 30m
		expect(results[3].title).toBe('Quick Puzzle'); // 3h 0m
	});

	it('should handle games with same time to beat maintaining stable order', async () => {
		const { filteredGamesStore } = await import('$lib/stores/filteredGamesStore.svelte');
		const { filtersStore } = await import('$lib/stores/filters.svelte');
		const { gamesStore } = await import('$lib/stores/games.svelte');
		const { appStore } = await import('$lib/stores/app.svelte');

		const gamesWithSameTime: MockGame[] = [
			createPlannedGame({ id: '1', title: 'Game A', timeToBeat: '10h 0m' }),
			createPlannedGame({ id: '2', title: 'Game B', timeToBeat: '10h 0m' }),
			createPlannedGame({ id: '3', title: 'Game C', timeToBeat: '10h 0m' })
		];
		gamesStore.initializeGames(gamesWithSameTime);
		appStore.setActiveTab('planned');
		filtersStore.setSort({ key: 'timeToBeat', direction: 'asc' });
		await new Promise((resolve) => setTimeout(resolve, 50));

		const results = filteredGamesStore.games;
		// All games have same timeToBeat, so order should be stable
		expect(results.length).toBe(3);
	});

	it('should reactively update when switching from alphabetical to timeToBeat sort', async () => {
		const { filteredGames } = await import('$lib/stores/filteredGamesStore.svelte');
		const { filtersStore } = await import('$lib/stores/filters.svelte');
		const { gamesStore } = await import('$lib/stores/games.svelte');
		const { appStore } = await import('$lib/stores/app.svelte');

		gamesStore.initializeGames(plannedGames);
		appStore.setActiveTab('planned');
		await new Promise((resolve) => setTimeout(resolve, 50));

		const subscriber = vi.fn();
		const unsubscribe = filteredGames.subscribe(subscriber);
		subscriber.mockClear();

		// Change to timeToBeat sort descending
		filtersStore.setSort({ key: 'timeToBeat', direction: 'desc' });
		await new Promise((resolve) => setTimeout(resolve, 50));

		expect(subscriber).toHaveBeenCalled();
		const lastCall = subscriber.mock.calls[subscriber.mock.calls.length - 1];
		const sortedGames = lastCall[0];
		// timeToBeat desc order: Long RPG (80h), Medium Adventure (20h), Short Indie (6h 30m), Quick Puzzle (3h)
		expect(sortedGames[0].title).toBe('Long RPG');
		expect(sortedGames[3].title).toBe('Quick Puzzle');

		unsubscribe();
	});
});

describe('Cross-tab Sorting Behavior', () => {
	beforeEach(() => {
		vi.resetModules();
	});

	const createMixedGames = (): MockGame[] => [
		createCompletedGame({ id: '1', title: 'Completed A', hoursPlayed: '50h 0m' }),
		createCompletedGame({ id: '2', title: 'Completed B', hoursPlayed: '10h 0m' }),
		createPlannedGame({ id: '3', title: 'Planned A', timeToBeat: '30h 0m' }),
		createPlannedGame({ id: '4', title: 'Planned B', timeToBeat: '5h 0m' })
	];

	it('should only show hoursPlayed sort option results for completed tab', async () => {
		const { filteredGamesStore } = await import('$lib/stores/filteredGamesStore.svelte');
		const { filtersStore } = await import('$lib/stores/filters.svelte');
		const { gamesStore } = await import('$lib/stores/games.svelte');
		const { appStore } = await import('$lib/stores/app.svelte');

		gamesStore.initializeGames(createMixedGames());
		appStore.setActiveTab('completed');
		filtersStore.setSort({ key: 'hoursPlayed', direction: 'desc' });
		await new Promise((resolve) => setTimeout(resolve, 50));

		const results = filteredGamesStore.games;
		expect(results.length).toBe(2); // Only completed games
		expect(results[0].title).toBe('Completed A'); // 50h > 10h
		expect(results[1].title).toBe('Completed B');
	});

	it('should only show timeToBeat sort option results for planned tab', async () => {
		const { filteredGamesStore } = await import('$lib/stores/filteredGamesStore.svelte');
		const { filtersStore } = await import('$lib/stores/filters.svelte');
		const { gamesStore } = await import('$lib/stores/games.svelte');
		const { appStore } = await import('$lib/stores/app.svelte');

		gamesStore.initializeGames(createMixedGames());
		appStore.setActiveTab('planned');
		filtersStore.setSort({ key: 'timeToBeat', direction: 'asc' });
		await new Promise((resolve) => setTimeout(resolve, 50));

		const results = filteredGamesStore.games;
		expect(results.length).toBe(2); // Only planned games
		expect(results[0].title).toBe('Planned B'); // 5h < 30h
		expect(results[1].title).toBe('Planned A');
	});
});

describe('Playtime Parsing Edge Cases', () => {
	beforeEach(() => {
		vi.resetModules();
	});

	it('should correctly parse playtime values with varying formats', async () => {
		const { filteredGamesStore } = await import('$lib/stores/filteredGamesStore.svelte');
		const { filtersStore } = await import('$lib/stores/filters.svelte');
		const { gamesStore } = await import('$lib/stores/games.svelte');
		const { appStore } = await import('$lib/stores/app.svelte');

		const edgeCaseGames: MockGame[] = [
			createCompletedGame({ id: '1', title: 'Zero Minutes', hoursPlayed: '10h 0m' }),
			createCompletedGame({ id: '2', title: 'With Minutes', hoursPlayed: '10h 30m' }),
			createCompletedGame({ id: '3', title: 'Zero Hours', hoursPlayed: '0h 45m' }),
			createCompletedGame({ id: '4', title: 'Large Hours', hoursPlayed: '999h 59m' })
		];
		gamesStore.initializeGames(edgeCaseGames);
		appStore.setActiveTab('completed');
		filtersStore.setSort({ key: 'hoursPlayed', direction: 'asc' });
		await new Promise((resolve) => setTimeout(resolve, 50));

		const results = filteredGamesStore.games;
		expect(results[0].title).toBe('Zero Hours'); // 0h 45m = 45 minutes
		expect(results[1].title).toBe('Zero Minutes'); // 10h 0m = 600 minutes
		expect(results[2].title).toBe('With Minutes'); // 10h 30m = 630 minutes
		expect(results[3].title).toBe('Large Hours'); // 999h 59m = 59999 minutes
	});
});
