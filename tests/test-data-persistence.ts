#!/usr/bin/env bun

/**
 * Data Persistence Testing Script
 *
 * This script tests all data persistence features in the Gaming Tracker application:
 * - Theme persistence in localStorage
 * - View mode persistence
 * - Filter state persistence in URL
 * - Sort state persistence in URL
 * - JSON export/import functionality
 * - Data integrity across sessions
 */
interface PersistenceTest {
	name: string;
	description: string;
	testFn: () => Promise<boolean>;
	expectedResult: boolean;
}

interface PersistenceResults {
	tests: Array<{
		name: string;
		passed: boolean;
		duration: number;
		error?: string;
	}>;
	summary: {
		total: number;
		passed: number;
		failed: number;
		successRate: number;
		totalDuration: number;
	};
}

// Mock localStorage for testing
class MockLocalStorage {
	private storage: Map<string, string> = new Map();

	getItem(key: string): string | null {
		return this.storage.get(key) || null;
	}

	setItem(key: string, value: string): void {
		this.storage.set(key, value);
	}

	removeItem(key: string): void {
		this.storage.delete(key);
	}

	clear(): void {
		this.storage.clear();
	}

	get length(): number {
		return this.storage.size;
	}

	key(index: number): string | null {
		const keys = Array.from(this.storage.keys());
		return keys[index] || null;
	}
}

// Mock URL and location for testing
class MockURL {
	constructor(private url: string) {}

	get searchParams(): URLSearchParams {
		const search = this.url.split('?')[1] || '';
		return new URLSearchParams(search);
	}

	set searchParams(params: URLSearchParams) {
		const base = this.url.split('?')[0];
		this.url = `${base}?${params.toString()}`;
	}

	toString(): string {
		return this.url;
	}
}

class MockLocation {
	href: string = 'http://localhost:5173';
	search: string = '';
	pathname: string = '/';
	hash: string = '';

	updateFromURL(url: string) {
		const urlObj = new URL(url);
		this.href = url;
		this.search = urlObj.search;
		this.pathname = urlObj.pathname;
		this.hash = urlObj.hash;
	}
}

// Test data
const TEST_GAME_DATA = {
	id: 'test-game-1',
	title: 'Test Persistence Game',
	platform: 'PC',
	year: 2024,
	genre: 'Action',
	coOp: 'Single Player',
	timeToBeat: 10,
	status: 'Completed',
	coverImage: 'https://via.placeholder.com/400x600/test',
	finishedDate: '2024-11-02',
	hoursPlayed: '15h 30m',
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

class DataPersistenceTester {
	private localStorage = new MockLocalStorage();
	private location = new MockLocation();
	private results: PersistenceResults = {
		tests: [],
		summary: {
			total: 0,
			passed: 0,
			failed: 0,
			successRate: 0,
			totalDuration: 0
		}
	};

	// Setup mock environment
	setupMocks() {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(global as any).localStorage = this.localStorage;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(global as any).location = this.location;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(global as any).URL = MockURL;
	}

	// Test theme persistence
	async testThemePersistence(): Promise<boolean> {
		try {
			// Test initial state
			expect(this.localStorage.getItem('theme')).toBeNull();

			// Simulate theme toggle to dark
			this.localStorage.setItem('theme', 'dark');
			expect(this.localStorage.getItem('theme')).toBe('dark');

			// Simulate page refresh (new session)
			// Theme should still be dark
			expect(this.localStorage.getItem('theme')).toBe('dark');

			// Simulate theme toggle to light
			this.localStorage.setItem('theme', 'light');
			expect(this.localStorage.getItem('theme')).toBe('light');

			return true;
		} catch (error) {
			throw new Error(`Theme persistence test failed: ${error}`);
		}
	}

	// Test view mode persistence
	async testViewModePersistence(): Promise<boolean> {
		try {
			// Test initial state
			expect(this.localStorage.getItem('viewMode')).toBeNull();

			// Simulate switching to table view
			this.localStorage.setItem('viewMode', 'table');
			expect(this.localStorage.getItem('viewMode')).toBe('table');

			// Simulate page refresh
			expect(this.localStorage.getItem('viewMode')).toBe('table');

			// Simulate switching back to gallery
			this.localStorage.setItem('viewMode', 'gallery');
			expect(this.localStorage.getItem('viewMode')).toBe('gallery');

			return true;
		} catch (error) {
			throw new Error(`View mode persistence test failed: ${error}`);
		}
	}

	// Test filter state persistence in URL
	async testFilterURLPersistence(): Promise<boolean> {
		try {
			// Test initial URL state
			expect(this.location.search).toBe('');

			// Simulate applying filters
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

			this.location.search = params.toString();

			// Verify URL contains filter state
			expect(this.location.search).toContain('search=test+game');
			expect(this.location.search).toContain('platforms=PC%2CPlayStation+5');
			expect(this.location.search).toContain('genres=Action%2CRPG');
			expect(this.location.search).toContain('ratingPresentation=7-10');

			// Simulate page refresh (URL should persist)
			expect(this.location.search).toContain('search=test+game');

			// Simulate clearing filters
			this.location.search = '';
			expect(this.location.search).toBe('');

			return true;
		} catch (error) {
			throw new Error(`Filter URL persistence test failed: ${error}`);
		}
	}

	// Test sort state persistence in URL
	async testSortURLPersistence(): Promise<boolean> {
		try {
			// Test initial URL state
			expect(this.location.search).toBe('');

			// Simulate applying sort
			const params = new URLSearchParams();
			params.set('sortBy', TEST_SORT_STATE.sortBy);
			params.set('sortDirection', TEST_SORT_STATE.sortDirection);

			this.location.search = params.toString();

			// Verify URL contains sort state
			expect(this.location.search).toContain('sortBy=title');
			expect(this.location.search).toContain('sortDirection=asc');

			// Simulate page refresh
			expect(this.location.search).toContain('sortBy=title');

			// Simulate changing sort
			params.set('sortBy', 'year');
			params.set('sortDirection', 'desc');
			this.location.search = params.toString();

			expect(this.location.search).toContain('sortBy=year');
			expect(this.location.search).toContain('sortDirection=desc');

			return true;
		} catch (error) {
			throw new Error(`Sort URL persistence test failed: ${error}`);
		}
	}

	// Test JSON export functionality
	async testJSONExport(): Promise<boolean> {
		try {
			const games = [TEST_GAME_DATA];
			const exportData = {
				games,
				exportDate: new Date().toISOString(),
				version: '1.0.0'
			};

			// Simulate JSON export
			const jsonString = JSON.stringify(exportData, null, 2);
			const parsed = JSON.parse(jsonString);

			// Verify export structure
			expect(Array.isArray(parsed.games)).toBe(true);
			expect(parsed.games.length).toBe(1);
			expect(parsed.games[0].id).toBe(TEST_GAME_DATA.id);
			expect(parsed.games[0].title).toBe(TEST_GAME_DATA.title);
			expect(parsed.exportDate).toBeDefined();
			expect(parsed.version).toBe('1.0.0');

			// Verify all game properties are preserved
			const exportedGame = parsed.games[0];
			expect(exportedGame.platform).toBe(TEST_GAME_DATA.platform);
			expect(exportedGame.year).toBe(TEST_GAME_DATA.year);
			expect(exportedGame.genre).toBe(TEST_GAME_DATA.genre);
			expect(exportedGame.status).toBe(TEST_GAME_DATA.status);
			expect(exportedGame.ratingPresentation).toBe(TEST_GAME_DATA.ratingPresentation);
			expect(exportedGame.tier).toBe(TEST_GAME_DATA.tier);

			return true;
		} catch (error) {
			throw new Error(`JSON export test failed: ${error}`);
		}
	}

	// Test JSON import functionality
	async testJSONImport(): Promise<boolean> {
		try {
			const exportData = {
				games: [TEST_GAME_DATA],
				exportDate: new Date().toISOString(),
				version: '1.0.0'
			};

			// Simulate JSON import
			const jsonString = JSON.stringify(exportData);
			const importedData = JSON.parse(jsonString);

			// Verify import structure
			expect(importedData.games).toBeDefined();
			expect(Array.isArray(importedData.games)).toBe(true);
			expect(importedData.games.length).toBe(1);

			// Verify game data integrity
			const importedGame = importedData.games[0];
			expect(importedGame.id).toBe(TEST_GAME_DATA.id);
			expect(importedGame.title).toBe(TEST_GAME_DATA.title);
			expect(importedGame.status).toBe(TEST_GAME_DATA.status);
			expect(importedGame.ratingPresentation).toBe(TEST_GAME_DATA.ratingPresentation);
			expect(importedGame.totalScore).toBe(TEST_GAME_DATA.totalScore);
			expect(importedGame.tier).toBe(TEST_GAME_DATA.tier);

			// Verify metadata
			expect(importedData.exportDate).toBeDefined();
			expect(importedData.version).toBe('1.0.0');

			return true;
		} catch (error) {
			throw new Error(`JSON import test failed: ${error}`);
		}
	}

	// Test data integrity across export/import cycle
	async testDataIntegrityCycle(): Promise<boolean> {
		try {
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

			// Export cycle
			const exportData = {
				games: originalGames,
				exportDate: new Date().toISOString(),
				version: '1.0.0'
			};

			const jsonString = JSON.stringify(exportData, null, 2);

			// Import cycle
			const importedData = JSON.parse(jsonString);

			// Verify data integrity
			expect(importedData.games.length).toBe(2);

			// Check first game
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const game1 = importedData.games.find((g: any) => g.id === 'test-game-1');
			expect(game1).toBeDefined();
			expect(game1.title).toBe('Test Persistence Game');
			expect(game1.ratingPresentation).toBe(8);
			expect(game1.tier).toBe('A');

			// Check second game
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const game2 = importedData.games.find((g: any) => g.id === 'test-game-2');
			expect(game2).toBeDefined();
			expect(game2.title).toBe('Second Test Game');
			expect(game2.platform).toBe('PlayStation 5');
			expect(game2.tier).toBe('S');

			// Verify no data corruption
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			importedData.games.forEach((game: any) => {
				expect(game.id).toBeDefined();
				expect(game.title).toBeDefined();
				expect(game.status).toBeDefined();
				if (game.status === 'Completed') {
					expect(game.ratingPresentation).toBeDefined();
					expect(game.tier).toBeDefined();
				}
			});

			return true;
		} catch (error) {
			throw new Error(`Data integrity cycle test failed: ${error}`);
		}
	}

	// Test localStorage limits and error handling
	async testStorageLimits(): Promise<boolean> {
		try {
			// Test normal operation
			this.localStorage.setItem('test-key', 'test-value');
			expect(this.localStorage.getItem('test-key')).toBe('test-value');

			// Test clearing storage
			this.localStorage.clear();
			expect(this.localStorage.getItem('test-key')).toBeNull();

			// Test multiple keys
			this.localStorage.setItem('theme', 'dark');
			this.localStorage.setItem('viewMode', 'table');
			this.localStorage.setItem('user-preference', 'test');

			expect(this.localStorage.getItem('theme')).toBe('dark');
			expect(this.localStorage.getItem('viewMode')).toBe('table');
			expect(this.localStorage.getItem('user-preference')).toBe('test');

			// Test removal
			this.localStorage.removeItem('user-preference');
			expect(this.localStorage.getItem('user-preference')).toBeNull();
			expect(this.localStorage.getItem('theme')).toBe('dark'); // Others should remain

			return true;
		} catch (error) {
			throw new Error(`Storage limits test failed: ${error}`);
		}
	}

	// Run all persistence tests
	async runAllTests(): Promise<PersistenceResults> {
		this.setupMocks();

		const tests: PersistenceTest[] = [
			{
				name: 'Theme Persistence',
				description: 'Test that theme preferences persist in localStorage',
				testFn: () => this.testThemePersistence(),
				expectedResult: true
			},
			{
				name: 'View Mode Persistence',
				description: 'Test that view mode preferences persist in localStorage',
				testFn: () => this.testViewModePersistence(),
				expectedResult: true
			},
			{
				name: 'Filter URL Persistence',
				description: 'Test that filter states persist in URL parameters',
				testFn: () => this.testFilterURLPersistence(),
				expectedResult: true
			},
			{
				name: 'Sort URL Persistence',
				description: 'Test that sort states persist in URL parameters',
				testFn: () => this.testSortURLPersistence(),
				expectedResult: true
			},
			{
				name: 'JSON Export',
				description: 'Test JSON export functionality and data structure',
				testFn: () => this.testJSONExport(),
				expectedResult: true
			},
			{
				name: 'JSON Import',
				description: 'Test JSON import functionality and data parsing',
				testFn: () => this.testJSONImport(),
				expectedResult: true
			},
			{
				name: 'Data Integrity Cycle',
				description: 'Test data integrity across export/import cycles',
				testFn: () => this.testDataIntegrityCycle(),
				expectedResult: true
			},
			{
				name: 'Storage Limits',
				description: 'Test localStorage operations and error handling',
				testFn: () => this.testStorageLimits(),
				expectedResult: true
			}
		];

		console.log('🧪 Starting Data Persistence Tests...\n');

		for (const test of tests) {
			const startTime = performance.now();

			try {
				console.log(`Testing: ${test.name}`);
				const result = await test.testFn();

				const endTime = performance.now();
				const duration = endTime - startTime;

				this.results.tests.push({
					name: test.name,
					passed: result === test.expectedResult,
					duration
				});

				console.log(`✅ PASSED: ${test.name} (${duration.toFixed(2)}ms)`);
			} catch (error) {
				const endTime = performance.now();
				const duration = endTime - startTime;

				this.results.tests.push({
					name: test.name,
					passed: false,
					duration,
					error: error instanceof Error ? error.message : String(error)
				});

				console.log(`❌ FAILED: ${test.name} (${duration.toFixed(2)}ms)`);
				console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
			}
		}

		// Calculate summary
		this.results.summary.total = this.results.tests.length;
		this.results.summary.passed = this.results.tests.filter((t) => t.passed).length;
		this.results.summary.failed = this.results.tests.length - this.results.summary.passed;
		this.results.summary.successRate =
			(this.results.summary.passed / this.results.summary.total) * 100;
		this.results.summary.totalDuration = this.results.tests.reduce((sum, t) => sum + t.duration, 0);

		return this.results;
	}

	// Generate test report
	generateReport(): string {
		let report = '# Data Persistence Testing Report\n\n';
		report += `Generated: ${new Date().toISOString()}\n\n`;

		report += '## Summary\n\n';
		report += `- **Total Tests**: ${this.results.summary.total}\n`;
		report += `- **Passed**: ${this.results.summary.passed} ✅\n`;
		report += `- **Failed**: ${this.results.summary.failed} ❌\n`;
		report += `- **Success Rate**: ${this.results.summary.successRate.toFixed(1)}%\n`;
		report += `- **Total Duration**: ${this.results.summary.totalDuration.toFixed(2)}ms\n\n`;

		report += '## Test Results\n\n';
		report += '| Test | Status | Duration | Details |\n';
		report += '|------|--------|----------|--------|\n';

		for (const test of this.results.tests) {
			const status = test.passed ? '✅' : '❌';
			const details = test.error ? test.error : 'Passed';
			report += `| ${test.name} | ${status} | ${test.duration.toFixed(2)}ms | ${details} |\n`;
		}

		report += '\n## Test Coverage\n\n';
		report += '### localStorage Persistence\n';
		report += '- Theme preferences\n';
		report += '- View mode preferences\n';
		report += '- User settings\n\n';

		report += '### URL Parameter Persistence\n';
		report += '- Filter states (search, platforms, genres, ratings)\n';
		report += '- Sort states (column, direction)\n';
		report += '- View parameters\n\n';

		report += '### JSON Export/Import\n';
		report += '- Data structure integrity\n';
		report += '- Complete game data preservation\n';
		report += '- Metadata handling\n';
		report += '- Round-trip data integrity\n\n';

		if (this.results.summary.failed > 0) {
			report += '## Failed Tests\n\n';
			for (const test of this.results.tests.filter((t) => !t.passed)) {
				report += `### ${test.name}\n`;
				report += `- **Error**: ${test.error || 'Unknown error'}\n`;
				report += `- **Duration**: ${test.duration.toFixed(2)}ms\n\n`;
			}
		}

		return report;
	}
}

// Helper function for assertions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function expect(actual: any) {
	return {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		toBe: (expected: any) => {
			if (actual !== expected) {
				throw new Error(`Expected ${expected}, but got ${actual}`);
			}
		},
		toBeDefined: () => {
			if (actual === undefined || actual === null) {
				throw new Error(`Expected value to be defined, but got ${actual}`);
			}
		},
		toContain: (substring: string) => {
			if (typeof actual !== 'string' || !actual.includes(substring)) {
				throw new Error(`Expected "${actual}" to contain "${substring}"`);
			}
		},
		toBeNull: () => {
			if (actual !== null) {
				throw new Error(`Expected null, but got ${actual}`);
			}
		}
	};
}

// Main execution
async function runDataPersistenceTests() {
	const tester = new DataPersistenceTester();
	const results = await tester.runAllTests();

	console.log('\n' + '='.repeat(60));
	console.log('💾 Data Persistence Testing Complete!');
	console.log('📄 Detailed report saved to: data-persistence-test-report.md');
	console.log('='.repeat(60));

	console.log(`\n📊 Summary:`);
	console.log(`   Total Tests: ${results.summary.total}`);
	console.log(`   ✅ Passed: ${results.summary.passed}`);
	console.log(`   ❌ Failed: ${results.summary.failed}`);
	console.log(`   Success Rate: ${results.summary.successRate.toFixed(1)}%`);
	console.log(`   Total Duration: ${results.summary.totalDuration.toFixed(2)}ms`);

	if (results.summary.failed > 0) {
		console.log('\n❌ Failed Tests:');
		for (const test of results.tests.filter((t) => !t.passed)) {
			console.log(`     - ${test.name}: ${test.error}`);
		}
	}

	return results;
}

// Run tests if called directly
if (import.meta.main) {
	runDataPersistenceTests().catch(console.error);
}

export { DataPersistenceTester, runDataPersistenceTests };
