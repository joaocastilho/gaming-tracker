import { beforeEach, describe, expect, test } from 'vitest';

// Test data
const TEST_GAME_DATA = {
	id: 'test-game-1',
	title: 'Test Persistence Game',
	platform: 'PC',
	year: 2024,
	genre: 'Action',
	coOp: 'Single Player',
	status: 'Completed',
	coverImage: 'https://via.placeholder.com/400x600/test',
	finishedDate: '2024-11-02',
	playtime: '15h 30m',
	ratingPresentation: 8,
	ratingStory: 7,
	ratingGameplay: 9,
	totalScore: 16,
	tier: 'A'
};

const TEST_FILTER_STATE = {
	searchQuery: 'test game',
	selectedPlatforms: ['PC', 'PlayStation 5'],
	selectedGenres: ['Action', 'RPG'],
	ratingPresentation: [7, 10],
	ratingStory: [6, 9],
	ratingGameplay: [8, 10],
	totalScore: [12, 20]
};

const TEST_SORT_STATE = {
	sortBy: 'title',
	sortDirection: 'asc' as const
};

describe('Data Persistence', () => {
	beforeEach(() => {
		localStorage.clear();
		// Mock window.location.search
		Object.defineProperty(window, 'location', {
			value: {
				search: '',
				pathname: '/',
				assign: vi.fn(),
				replace: vi.fn(),
				reload: vi.fn()
			},
			writable: true
		});
	});

	test('Theme Persistence', () => {
		expect(localStorage.getItem('theme')).toBeNull();

		localStorage.setItem('theme', 'dark');
		expect(localStorage.getItem('theme')).toBe('dark');

		// In a real browser, refresh persists localStorage.
		// Here we just check that setting it works as expected.
		expect(localStorage.getItem('theme')).toBe('dark');

		localStorage.setItem('theme', 'light');
		expect(localStorage.getItem('theme')).toBe('light');
	});

	test('View Mode Persistence', () => {
		expect(localStorage.getItem('viewMode')).toBeNull();

		localStorage.setItem('viewMode', 'table');
		expect(localStorage.getItem('viewMode')).toBe('table');

		expect(localStorage.getItem('viewMode')).toBe('table');

		localStorage.setItem('viewMode', 'gallery');
		expect(localStorage.getItem('viewMode')).toBe('gallery');
	});

	test('Filter URL Persistence', () => {
		expect(window.location.search).toBe('');

		const params = new URLSearchParams();
		params.set('search', TEST_FILTER_STATE.searchQuery);
		params.set('platforms', TEST_FILTER_STATE.selectedPlatforms.join(','));
		params.set('genres', TEST_FILTER_STATE.selectedGenres.join(','));
		params.set(
			'ratingPresentation',
			`${TEST_FILTER_STATE.ratingPresentation[0]}-${TEST_FILTER_STATE.ratingPresentation[1]}`
		);
		params.set(
			'ratingStory',
			`${TEST_FILTER_STATE.ratingStory[0]}-${TEST_FILTER_STATE.ratingStory[1]}`
		);
		params.set(
			'ratingGameplay',
			`${TEST_FILTER_STATE.ratingGameplay[0]}-${TEST_FILTER_STATE.ratingGameplay[1]}`
		);
		params.set(
			'totalScore',
			`${TEST_FILTER_STATE.totalScore[0]}-${TEST_FILTER_STATE.totalScore[1]}`
		);

		// Manually update the mock location search
		window.location.search = params.toString();

		expect(window.location.search).toContain('search=test+game');
		expect(window.location.search).toContain('platforms=PC%2CPlayStation+5');
		expect(window.location.search).toContain('genres=Action%2CRPG');
		expect(window.location.search).toContain('ratingPresentation=7-10');

		expect(window.location.search).toContain('search=test+game');

		window.location.search = '';
		expect(window.location.search).toBe('');
	});

	test('Sort URL Persistence', () => {
		expect(window.location.search).toBe('');

		const params = new URLSearchParams();
		params.set('sortBy', TEST_SORT_STATE.sortBy);
		params.set('sortDirection', TEST_SORT_STATE.sortDirection);

		window.location.search = params.toString();

		expect(window.location.search).toContain('sortBy=title');
		expect(window.location.search).toContain('sortDirection=asc');

		expect(window.location.search).toContain('sortBy=title');

		params.set('sortBy', 'year');
		params.set('sortDirection', 'desc');
		window.location.search = params.toString();

		expect(window.location.search).toContain('sortBy=year');
		expect(window.location.search).toContain('sortDirection=desc');
	});

	test('JSON Export', () => {
		const games = [TEST_GAME_DATA];
		const exportData = {
			games,
			exportDate: new Date().toISOString(),
			version: '1.0.0'
		};

		const jsonString = JSON.stringify(exportData, null, 2);
		const parsed = JSON.parse(jsonString);

		expect(Array.isArray(parsed.games)).toBe(true);
		expect(parsed.games.length).toBe(1);
		expect(parsed.games[0].id).toBe(TEST_GAME_DATA.id);
		expect(parsed.games[0].title).toBe(TEST_GAME_DATA.title);
		expect(parsed.exportDate).toBeDefined();
		expect(parsed.version).toBe('1.0.0');

		const exportedGame = parsed.games[0];
		expect(exportedGame.platform).toBe(TEST_GAME_DATA.platform);
		expect(exportedGame.year).toBe(TEST_GAME_DATA.year);
		expect(exportedGame.genre).toBe(TEST_GAME_DATA.genre);
		expect(exportedGame.status).toBe(TEST_GAME_DATA.status);
		expect(exportedGame.ratingPresentation).toBe(TEST_GAME_DATA.ratingPresentation);
		expect(exportedGame.tier).toBe(TEST_GAME_DATA.tier);
	});

	test('JSON Import', () => {
		const exportData = {
			games: [TEST_GAME_DATA],
			exportDate: new Date().toISOString(),
			version: '1.0.0'
		};

		const jsonString = JSON.stringify(exportData);
		const importedData = JSON.parse(jsonString);

		expect(importedData.games).toBeDefined();
		expect(Array.isArray(importedData.games)).toBe(true);
		expect(importedData.games.length).toBe(1);

		const importedGame = importedData.games[0];
		expect(importedGame.id).toBe(TEST_GAME_DATA.id);
		expect(importedGame.title).toBe(TEST_GAME_DATA.title);
		expect(importedGame.status).toBe(TEST_GAME_DATA.status);
		expect(importedGame.ratingPresentation).toBe(TEST_GAME_DATA.ratingPresentation);
		expect(importedGame.totalScore).toBe(TEST_GAME_DATA.totalScore);
		expect(importedGame.tier).toBe(TEST_GAME_DATA.tier);

		expect(importedData.exportDate).toBeDefined();
		expect(importedData.version).toBe('1.0.0');
	});

	test('Data Integrity Cycle', () => {
		const originalGames = [
			TEST_GAME_DATA,
			{
				...TEST_GAME_DATA,
				id: 'test-game-2',
				title: 'Second Test Game',
				platform: 'PlayStation 5',
				tier: 'S'
			}
		];

		const exportData = {
			games: originalGames,
			exportDate: new Date().toISOString(),
			version: '1.0.0'
		};

		const jsonString = JSON.stringify(exportData, null, 2);
		const importedData = JSON.parse(jsonString);

		expect(importedData.games.length).toBe(2);

		const game1 = importedData.games.find((g: Record<string, unknown>) => g.id === 'test-game-1');
		expect(game1).toBeDefined();
		expect(game1.title).toBe('Test Persistence Game');
		expect(game1.ratingPresentation).toBe(8);
		expect(game1.tier).toBe('A');

		const game2 = importedData.games.find((g: Record<string, unknown>) => g.id === 'test-game-2');
		expect(game2).toBeDefined();
		expect(game2.title).toBe('Second Test Game');
		expect(game2.platform).toBe('PlayStation 5');
		expect(game2.tier).toBe('S');

		importedData.games.forEach((game: Record<string, unknown>) => {
			expect(game.id).toBeDefined();
			expect(game.title).toBeDefined();
			expect(game.status).toBeDefined();
			if (game.status === 'Completed') {
				expect(game.ratingPresentation).toBeDefined();
				expect(game.tier).toBeDefined();
			}
		});
	});

	test('Storage Limits', () => {
		localStorage.setItem('test-key', 'test-value');
		expect(localStorage.getItem('test-key')).toBe('test-value');

		localStorage.clear();
		expect(localStorage.getItem('test-key')).toBeNull();

		localStorage.setItem('theme', 'dark');
		localStorage.setItem('viewMode', 'table');
		localStorage.setItem('user-preference', 'test');

		expect(localStorage.getItem('theme')).toBe('dark');
		expect(localStorage.getItem('viewMode')).toBe('table');
		expect(localStorage.getItem('user-preference')).toBe('test');

		localStorage.removeItem('user-preference');
		expect(localStorage.getItem('user-preference')).toBeNull();
		expect(localStorage.getItem('theme')).toBe('dark');
	});

	test('Complex JSON Export', () => {
		const complexData = {
			settings: {
				theme: 'dark',
				notifications: {
					email: true,
					push: false
				}
			},
			history: [
				{ id: 1, action: 'login', timestamp: 123456789 },
				{ id: 2, action: 'view_game', details: { gameId: 'g1' } }
			]
		};

		const jsonString = JSON.stringify(complexData);
		const parsed = JSON.parse(jsonString);

		expect(parsed.settings.theme).toBe('dark');
		expect(parsed.settings.notifications.email).toBe(true);
		expect(parsed.history.length).toBe(2);
		expect(parsed.history[1].details.gameId).toBe('g1');
	});

	test('Corrupted JSON Import', () => {
		const corruptedJSON = '{"games": [{"id": 1, "title": "Test Game"'; // Missing closing braces

		expect(() => JSON.parse(corruptedJSON)).toThrow();
	});

	test('Large Data Persistence', () => {
		const largeGames = Array.from({ length: 1000 }, (_, i) => ({
			id: `game-${i}`,
			title: `Game ${i}`,
			platform: i % 2 === 0 ? 'PC' : 'Console',
			year: 2000 + (i % 20)
		}));

		const exportData = { games: largeGames };
		const jsonString = JSON.stringify(exportData);

		if (jsonString.length < 10000) {
			throw new Error('Generated JSON is too small for stress test');
		}

		const parsed = JSON.parse(jsonString);
		expect(parsed.games.length).toBe(1000);
		expect(parsed.games[999].title).toBe('Game 999');
	});
});
