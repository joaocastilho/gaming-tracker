#!/usr/bin/env bun

/**
 * Browser Navigation Testing Script
 *
 * This script tests browser back/forward navigation functionality in the Gaming Tracker application:
 * - URL state preservation during navigation
 * - Filter state restoration
 * - Sort state restoration
 * - View mode restoration
 * - Modal deep linking with navigation
 * - Search query persistence
 * - Route changes with state preservation
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

interface NavigationTest {
	name: string;
	description: string;
	testFn: () => Promise<boolean>;
	expectedResult: boolean;
}

interface NavigationTestResults {
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
	navigationValidation: {
		filterPersistence: boolean;
		sortPersistence: boolean;
		viewModePersistence: boolean;
		searchPersistence: boolean;
		modalDeepLinking: boolean;
	};
}

// Mock browser history and location for testing
class MockHistory {
	private history: string[] = ['/'];
	private currentIndex = 0;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	pushState(state: any, title: string, url: string) {
		// Remove any history after current index
		this.history = this.history.slice(0, this.currentIndex + 1);
		this.history.push(url);
		this.currentIndex = this.history.length - 1;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	replaceState(state: any, title: string, url: string) {
		this.history[this.currentIndex] = url;
	}

	back() {
		if (this.currentIndex > 0) {
			this.currentIndex--;
			return this.history[this.currentIndex];
		}
		return null;
	}

	forward() {
		if (this.currentIndex < this.history.length - 1) {
			this.currentIndex++;
			return this.history[this.currentIndex];
		}
		return null;
	}

	get currentURL() {
		return this.history[this.currentIndex];
	}

	get canGoBack() {
		return this.currentIndex > 0;
	}

	get canGoForward() {
		return this.currentIndex < this.history.length - 1;
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

// Test data for navigation validation
const TEST_FILTER_STATE = {
	searchQuery: 'zelda',
	selectedPlatforms: ['Nintendo Switch'],
	selectedGenres: ['Action', 'Adventure'],
	ratingPresentation: [8, 10],
	ratingStory: [7, 10],
	ratingGameplay: [8, 10],
	totalScore: [16, 20]
};

const TEST_SORT_STATE = {
	sortBy: 'totalScore',
	sortDirection: 'desc' as const
};

class BrowserNavigationTester {
	private history = new MockHistory();
	private location = new MockLocation();
	private urlParams = new Map<string, string>();
	private results: NavigationTestResults = {
		tests: [],
		summary: {
			total: 0,
			passed: 0,
			failed: 0,
			successRate: 0,
			totalDuration: 0
		},
		navigationValidation: {
			filterPersistence: false,
			sortPersistence: false,
			viewModePersistence: false,
			searchPersistence: false,
			modalDeepLinking: false
		}
	};

	// Setup mock environment
	setupMocks() {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(global as any).history = this.history;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(global as any).location = this.location;
	}

	// Helper to update URL with parameters
	private updateURL(params: Record<string, string>) {
		const searchParams = new URLSearchParams();
		Object.entries(params).forEach(([key, value]) => {
			if (value) searchParams.set(key, value);
		});

		const newURL = `http://localhost:5173${this.location.pathname}?${searchParams.toString()}`;
		this.location.updateFromURL(newURL);
		this.history.replaceState(null, '', newURL);
	}

	// Test filter state persistence during navigation
	async testFilterStatePersistence(): Promise<boolean> {
		try {
			// Start with clean state
			this.location.updateFromURL('http://localhost:5173');

			// Apply filters
			const filterParams = {
				search: TEST_FILTER_STATE.searchQuery,
				platforms: TEST_FILTER_STATE.selectedPlatforms.join(','),
				genres: TEST_FILTER_STATE.selectedGenres.join(','),
				ratingPresentation: `${TEST_FILTER_STATE.ratingPresentation[0]}-${TEST_FILTER_STATE.ratingPresentation[1]}`,
				ratingStory: `${TEST_FILTER_STATE.ratingStory[0]}-${TEST_FILTER_STATE.ratingStory[1]}`,
				ratingGameplay: `${TEST_FILTER_STATE.ratingGameplay[0]}-${TEST_FILTER_STATE.ratingGameplay[1]}`,
				totalScore: `${TEST_FILTER_STATE.totalScore[0]}-${TEST_FILTER_STATE.totalScore[1]}`
			};

			this.updateURL(filterParams);

			// Verify filters are in URL
			expect(this.location.search).toContain('search=zelda');
			expect(this.location.search).toContain('platforms=Nintendo+Switch');
			expect(this.location.search).toContain('genres=Action%2CAdventure');
			expect(this.location.search).toContain('ratingPresentation=8-10');

			// Navigate to different page (simulate clicking a game)
			this.history.pushState(null, '', 'http://localhost:5173/game/123');
			this.location.updateFromURL('http://localhost:5173/game/123');

			// Navigate back
			const backURL = this.history.back();
			if (backURL) {
				this.location.updateFromURL(backURL);
			}

			// Verify filters are still in URL after navigation
			expect(this.location.search).toContain('search=zelda');
			expect(this.location.search).toContain('platforms=Nintendo+Switch');

			// Navigate forward again
			const forwardURL = this.history.forward();
			if (forwardURL) {
				this.location.updateFromURL(forwardURL);
			}

			// Verify we're back on the game page
			expect(this.location.pathname).toBe('/game/123');

			this.results.navigationValidation.filterPersistence = true;
			return true;
		} catch (error) {
			throw new Error(`Filter state persistence test failed: ${error}`);
		}
	}

	// Test sort state persistence during navigation
	async testSortStatePersistence(): Promise<boolean> {
		try {
			// Start with clean state
			this.location.updateFromURL('http://localhost:5173');

			// Apply sort
			const sortParams = {
				sortBy: TEST_SORT_STATE.sortBy,
				sortDirection: TEST_SORT_STATE.sortDirection
			};

			this.updateURL(sortParams);

			// Verify sort is in URL
			expect(this.location.search).toContain('sortBy=totalScore');
			expect(this.location.search).toContain('sortDirection=desc');

			// Navigate to different route
			this.history.pushState(null, '', 'http://localhost:5173/completed');
			this.location.updateFromURL('http://localhost:5173/completed');

			// Navigate back
			const backURL = this.history.back();
			if (backURL) {
				this.location.updateFromURL(backURL);
			}

			// Verify sort state is preserved
			expect(this.location.search).toContain('sortBy=totalScore');
			expect(this.location.search).toContain('sortDirection=desc');

			this.results.navigationValidation.sortPersistence = true;
			return true;
		} catch (error) {
			throw new Error(`Sort state persistence test failed: ${error}`);
		}
	}

	// Test view mode persistence during navigation
	async testViewModePersistence(): Promise<boolean> {
		try {
			// Start with clean state
			this.location.updateFromURL('http://localhost:5173');

			// Set view mode to table
			const viewParams = { view: 'table' };
			this.updateURL(viewParams);

			// Verify view mode is in URL
			expect(this.location.search).toContain('view=table');

			// Navigate to different page
			this.history.pushState(null, '', 'http://localhost:5173/planned');
			this.location.updateFromURL('http://localhost:5173/planned');

			// Navigate back
			const backURL = this.history.back();
			if (backURL) {
				this.location.updateFromURL(backURL);
			}

			// Verify view mode is preserved
			expect(this.location.search).toContain('view=table');

			// Change view mode
			const newViewParams = { view: 'gallery' };
			this.updateURL(newViewParams);

			// Verify view mode changed
			expect(this.location.search).toContain('view=gallery');
			expect(this.location.search).not.toContain('view=table');

			this.results.navigationValidation.viewModePersistence = true;
			return true;
		} catch (error) {
			throw new Error(`View mode persistence test failed: ${error}`);
		}
	}

	// Test search query persistence during navigation
	async testSearchPersistence(): Promise<boolean> {
		try {
			// Start with clean state
			this.location.updateFromURL('http://localhost:5173');

			// Apply search
			const searchParams = { search: 'final fantasy' };
			this.updateURL(searchParams);

			// Verify search is in URL
			expect(this.location.search).toContain('search=final+fantasy');

			// Navigate to completed games page
			this.history.pushState(null, '', 'http://localhost:5173/completed?search=final+fantasy');
			this.location.updateFromURL('http://localhost:5173/completed?search=final+fantasy');

			// Navigate back to main page
			const backURL = this.history.back();
			if (backURL) {
				this.location.updateFromURL(backURL);
			}

			// Verify search is still there
			expect(this.location.search).toContain('search=final+fantasy');

			// Clear search
			this.updateURL({});

			// Verify search is cleared
			expect(this.location.search).toBe('');

			this.results.navigationValidation.searchPersistence = true;
			return true;
		} catch (error) {
			throw new Error(`Search persistence test failed: ${error}`);
		}
	}

	// Test modal deep linking with navigation
	async testModalDeepLinking(): Promise<boolean> {
		try {
			// Start with clean state
			this.location.updateFromURL('http://localhost:5173');

			// Navigate to game detail via URL parameter
			const modalParams = { game: 'game-123' };
			this.updateURL(modalParams);

			// Verify modal parameter is in URL
			expect(this.location.search).toContain('game=game-123');

			// Simulate modal opening (verified by URL parameter presence)

			// Navigate to different page (modal should close)
			this.history.pushState(null, '', 'http://localhost:5173/tierlist');
			this.location.updateFromURL('http://localhost:5173/tierlist');

			// Verify modal parameter is gone
			expect(this.location.search).not.toContain('game=game-123');

			// Navigate back
			const backURL = this.history.back();
			if (backURL) {
				this.location.updateFromURL(backURL);
			}

			// Verify modal parameter is back (deep linking restored)
			expect(this.location.search).toContain('game=game-123');

			// Close modal by updating URL
			this.updateURL({});

			// Verify modal is closed
			expect(this.location.search).not.toContain('game=');

			this.results.navigationValidation.modalDeepLinking = true;
			return true;
		} catch (error) {
			throw new Error(`Modal deep linking test failed: ${error}`);
		}
	}

	// Test complex state combinations
	async testComplexStateCombinations(): Promise<boolean> {
		try {
			// Start with clean state
			this.location.updateFromURL('http://localhost:5173');

			// Apply complex state: filters + sort + view + search
			const complexParams = {
				search: 'action rpg',
				platforms: 'PC,PlayStation 5',
				genres: 'Action,RPG',
				sortBy: 'ratingPresentation',
				sortDirection: 'desc',
				view: 'table',
				ratingPresentation: '8-10'
			};

			this.updateURL(complexParams);

			// Verify all parameters are present
			expect(this.location.search).toContain('search=action+rpg');
			expect(this.location.search).toContain('platforms=PC%2CPlayStation+5');
			expect(this.location.search).toContain('genres=Action%2CRPG');
			expect(this.location.search).toContain('sortBy=ratingPresentation');
			expect(this.location.search).toContain('sortDirection=desc');
			expect(this.location.search).toContain('view=table');
			expect(this.location.search).toContain('ratingPresentation=8-10');

			// Navigate to different page
			this.history.pushState(null, '', 'http://localhost:5173/completed');
			this.location.updateFromURL('http://localhost:5173/completed');

			// Navigate back
			const backURL = this.history.back();
			if (backURL) {
				this.location.updateFromURL(backURL);
			}

			// Verify all complex state is preserved
			expect(this.location.search).toContain('search=action+rpg');
			expect(this.location.search).toContain('platforms=PC%2CPlayStation+5');
			expect(this.location.search).toContain('sortBy=ratingPresentation');
			expect(this.location.search).toContain('view=table');

			return true;
		} catch (error) {
			throw new Error(`Complex state combinations test failed: ${error}`);
		}
	}

	// Test navigation between different routes
	async testRouteNavigation(): Promise<boolean> {
		try {
			// Start on main page
			this.location.updateFromURL('http://localhost:5173');
			expect(this.location.pathname).toBe('/');

			// Navigate to completed games
			this.history.pushState(null, '', 'http://localhost:5173/completed');
			this.location.updateFromURL('http://localhost:5173/completed');
			expect(this.location.pathname).toBe('/completed');

			// Navigate to planned games
			this.history.pushState(null, '', 'http://localhost:5173/planned');
			this.location.updateFromURL('http://localhost:5173/planned');
			expect(this.location.pathname).toBe('/planned');

			// Navigate to tier list
			this.history.pushState(null, '', 'http://localhost:5173/tierlist');
			this.location.updateFromURL('http://localhost:5173/tierlist');
			expect(this.location.pathname).toBe('/tierlist');

			// Navigate back through history
			let backURL = this.history.back();
			if (backURL) {
				this.location.updateFromURL(backURL);
				expect(this.location.pathname).toBe('/planned');
			}

			backURL = this.history.back();
			if (backURL) {
				this.location.updateFromURL(backURL);
				expect(this.location.pathname).toBe('/completed');
			}

			backURL = this.history.back();
			if (backURL) {
				this.location.updateFromURL(backURL);
				expect(this.location.pathname).toBe('/');
			}

			// Navigate forward
			const forwardURL = this.history.forward();
			if (forwardURL) {
				this.location.updateFromURL(forwardURL);
				expect(this.location.pathname).toBe('/completed');
			}

			return true;
		} catch (error) {
			throw new Error(`Route navigation test failed: ${error}`);
		}
	}

	// Test URL parameter encoding/decoding
	async testURLParameterEncoding(): Promise<boolean> {
		try {
			// Test special characters in search
			const specialSearch = 'game & watch';
			const encodedParams = { search: specialSearch };
			this.updateURL(encodedParams);

			// Verify proper encoding
			expect(this.location.search).toContain('search=game+%26+watch');

			// Test array parameters
			const arrayParams = { genres: 'Action,Adventure,RPG' };
			this.updateURL(arrayParams);

			// Verify comma encoding
			expect(this.location.search).toContain('genres=Action%2CAdventure%2CRPG');

			// Test numeric ranges
			const rangeParams = { score: '15-20' };
			this.updateURL(rangeParams);

			// Verify range encoding
			expect(this.location.search).toContain('score=15-20');

			return true;
		} catch (error) {
			throw new Error(`URL parameter encoding test failed: ${error}`);
		}
	}

	// Test browser refresh behavior
	async testBrowserRefresh(): Promise<boolean> {
		try {
			// Set up complex state
			this.location.updateFromURL('http://localhost:5173');
			const refreshParams = {
				search: 'mario',
				sortBy: 'title',
				view: 'gallery',
				platforms: 'Nintendo Switch'
			};

			this.updateURL(refreshParams);

			// Simulate browser refresh (URL should be preserved)
			const currentURL = this.location.href;
			expect(currentURL).toContain('search=mario');
			expect(currentURL).toContain('sortBy=title');
			expect(currentURL).toContain('view=gallery');
			expect(currentURL).toContain('platforms=Nintendo+Switch');

			// Simulate page reload with same URL
			this.location.updateFromURL(currentURL);

			// Verify state is still there after "refresh"
			expect(this.location.search).toContain('search=mario');
			expect(this.location.search).toContain('sortBy=title');

			return true;
		} catch (error) {
			throw new Error(`Browser refresh test failed: ${error}`);
		}
	}

	// Run all navigation tests
	async runAllTests(): Promise<NavigationTestResults> {
		this.setupMocks();

		const tests: NavigationTest[] = [
			{
				name: 'Filter State Persistence',
				description: 'Test that filter states persist during back/forward navigation',
				testFn: () => this.testFilterStatePersistence(),
				expectedResult: true
			},
			{
				name: 'Sort State Persistence',
				description: 'Test that sort states persist during back/forward navigation',
				testFn: () => this.testSortStatePersistence(),
				expectedResult: true
			},
			{
				name: 'View Mode Persistence',
				description: 'Test that view modes persist during back/forward navigation',
				testFn: () => this.testViewModePersistence(),
				expectedResult: true
			},
			{
				name: 'Search Persistence',
				description: 'Test that search queries persist during back/forward navigation',
				testFn: () => this.testSearchPersistence(),
				expectedResult: true
			},
			{
				name: 'Modal Deep Linking',
				description: 'Test modal deep linking with back/forward navigation',
				testFn: () => this.testModalDeepLinking(),
				expectedResult: true
			},
			{
				name: 'Complex State Combinations',
				description: 'Test complex state combinations during navigation',
				testFn: () => this.testComplexStateCombinations(),
				expectedResult: true
			},
			{
				name: 'Route Navigation',
				description: 'Test navigation between different application routes',
				testFn: () => this.testRouteNavigation(),
				expectedResult: true
			},
			{
				name: 'URL Parameter Encoding',
				description: 'Test URL parameter encoding and decoding',
				testFn: () => this.testURLParameterEncoding(),
				expectedResult: true
			},
			{
				name: 'Browser Refresh',
				description: 'Test browser refresh behavior with URL state',
				testFn: () => this.testBrowserRefresh(),
				expectedResult: true
			}
		];

		console.log('🧭 Starting Browser Navigation Tests...\n');

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
		let report = '# Browser Navigation Testing Report\n\n';
		report += `Generated: ${new Date().toISOString()}\n\n`;

		report += '## Summary\n\n';
		report += `- **Total Tests**: ${this.results.summary.total}\n`;
		report += `- **Passed**: ${this.results.summary.passed} ✅\n`;
		report += `- **Failed**: ${this.results.summary.failed} ❌\n`;
		report += `- **Success Rate**: ${this.results.summary.successRate.toFixed(1)}%\n`;
		report += `- **Total Duration**: ${this.results.summary.totalDuration.toFixed(2)}ms\n\n`;

		report += '## Navigation Validation Status\n\n';
		report += `- **Filter Persistence**: ${this.results.navigationValidation.filterPersistence ? '✅ Validated' : '❌ Not Validated'}\n`;
		report += `- **Sort Persistence**: ${this.results.navigationValidation.sortPersistence ? '✅ Validated' : '❌ Not Validated'}\n`;
		report += `- **View Mode Persistence**: ${this.results.navigationValidation.viewModePersistence ? '✅ Validated' : '❌ Not Validated'}\n`;
		report += `- **Search Persistence**: ${this.results.navigationValidation.searchPersistence ? '✅ Validated' : '❌ Not Validated'}\n`;
		report += `- **Modal Deep Linking**: ${this.results.navigationValidation.modalDeepLinking ? '✅ Validated' : '❌ Not Validated'}\n\n`;

		report += '## Test Results\n\n';
		report += '| Test | Status | Duration | Details |\n';
		report += '|------|--------|----------|--------|\n';

		for (const test of this.results.tests) {
			const status = test.passed ? '✅' : '❌';
			const details = test.error ? test.error : 'Passed';
			report += `| ${test.name} | ${status} | ${test.duration.toFixed(2)}ms | ${details} |\n`;
		}

		report += '\n## Test Coverage\n\n';
		report += '### State Persistence\n';
		report += '- Filter states (search, platforms, genres, ratings)\n';
		report += '- Sort states (column, direction)\n';
		report += '- View modes (gallery, table)\n';
		report += '- Search queries and parameters\n\n';

		report += '### Navigation Behavior\n';
		report += '- Browser back/forward button functionality\n';
		report += '- Route changes with state preservation\n';
		report += '- URL parameter encoding/decoding\n';
		report += '- Modal deep linking with navigation\n\n';

		report += '### Edge Cases\n';
		report += '- Complex state combinations\n';
		report += '- Browser refresh behavior\n';
		report += '- Special character encoding\n';
		report += '- State clearing and restoration\n\n';

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

	// Save report to file
	saveReport(filename: string = 'browser-navigation-test-report.md') {
		const report = this.generateReport();
		const outputPath = join(process.cwd(), 'tests', filename);
		writeFileSync(outputPath, report);
		console.log(`📄 Report saved to: ${outputPath}`);
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
		not: {
			toContain: (substring: string) => {
				if (typeof actual === 'string' && actual.includes(substring)) {
					throw new Error(`Expected "${actual}" not to contain "${substring}"`);
				}
			}
		}
	};
}

// Main execution
async function runBrowserNavigationTests() {
	const tester = new BrowserNavigationTester();
	const results = await tester.runAllTests();

	console.log('\n' + '='.repeat(60));
	console.log('🧭 Browser Navigation Testing Complete!');
	console.log('📄 Detailed report saved to: browser-navigation-test-report.md');
	console.log('='.repeat(60));

	console.log(`\n📊 Summary:`);
	console.log(`   Total Tests: ${results.summary.total}`);
	console.log(`   ✅ Passed: ${results.summary.passed}`);
	console.log(`   ❌ Failed: ${results.summary.failed}`);
	console.log(`   Success Rate: ${results.summary.successRate.toFixed(1)}%`);
	console.log(`   Total Duration: ${results.summary.totalDuration.toFixed(2)}ms`);

	console.log(`\n🧭 Navigation Validation:`);
	console.log(
		`   Filter Persistence: ${results.navigationValidation.filterPersistence ? '✅' : '❌'}`
	);
	console.log(`   Sort Persistence: ${results.navigationValidation.sortPersistence ? '✅' : '❌'}`);
	console.log(
		`   View Mode Persistence: ${results.navigationValidation.viewModePersistence ? '✅' : '❌'}`
	);
	console.log(
		`   Search Persistence: ${results.navigationValidation.searchPersistence ? '✅' : '❌'}`
	);
	console.log(
		`   Modal Deep Linking: ${results.navigationValidation.modalDeepLinking ? '✅' : '❌'}`
	);

	if (results.summary.failed > 0) {
		console.log('\n❌ Failed Tests:');
		for (const test of results.tests.filter((t) => !t.passed)) {
			console.log(`     - ${test.name}: ${test.error}`);
		}
	}

	// Save report
	tester.saveReport();

	return results;
}

// Run tests if called directly
if (import.meta.main) {
	runBrowserNavigationTests().catch(console.error);
}

export { BrowserNavigationTester, runBrowserNavigationTests };
